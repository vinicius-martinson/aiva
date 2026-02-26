class TranscriptionChannel < ApplicationCable::Channel
  def subscribed
    stream_from "transcription_#{identifier_key}"
    puts "[AUDIO] Client subscribed (stream: transcription_#{identifier_key})"

    @agent = AgentService.new("transcription_#{identifier_key}")
    @agent_processing = false
    @whisper_ws = connect_to_whisper
  end

  def receive(data)
    return unless @whisper_ws

    audio_data = Base64.decode64(data["audio"])
    puts "[AUDIO] Received chunk: #{audio_data.bytesize} bytes"
    @whisper_ws.send(audio_data, type: :binary)
  end

  def unsubscribed
    puts "[AUDIO] Client unsubscribed"
    @whisper_ws&.close
    @whisper_ws = nil
  end

  private

  def identifier_key
    @identifier_key ||= SecureRandom.hex(8)
  end

  def connect_to_whisper
    channel = self
    stream_name = "transcription_#{identifier_key}"

    url = ENV.fetch("WHISPER_URL", "ws://localhost:8765/transcribe")

    ws = WebSocket::Client::Simple.connect(url)

    ws.on :message do |msg|
      begin
        result = JSON.parse(msg.data)
        type = result["type"]
        transcript = result["transcript"]

        case type
        when "Results"
          ActionCable.server.broadcast(stream_name, {
            type: "transcription",
            transcript: transcript,
            is_final: false
          })

        when "UtteranceEnd"
          ActionCable.server.broadcast(stream_name, {
            type: "transcription",
            transcript: transcript,
            is_final: true
          })

          agent = channel.instance_variable_get(:@agent)
          next unless agent && transcript && transcript.split.length >= 2

          if channel.instance_variable_get(:@agent_processing)
            puts "[AGENT] Skipping — agent is busy"
            next
          end

          channel.instance_variable_set(:@agent_processing, true)
          Thread.new(transcript) do |text|
            puts "[AGENT] Processing utterance: #{text}"
            agent.chat(text)
          rescue => e
            puts "[AGENT] Error: #{e.message}"
          ensure
            channel.instance_variable_set(:@agent_processing, false)
          end
        end
      rescue JSON::ParserError => e
        Rails.logger.error("Whisper JSON parse error: #{e.message}")
      end
    end

    ws.on :error do |e|
      Rails.logger.error("Whisper WebSocket error: #{e.message}")
    end

    ws.on :close do |e|
      Rails.logger.info("Whisper WebSocket closed")
    end

    ws
  end
end
