class TranscriptionChannel < ApplicationCable::Channel
  def subscribed
    stream_from "transcription_#{identifier_key}"
    puts "[AUDIO] Client subscribed (stream: transcription_#{identifier_key})"

    @agent = AgentService.new
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
        transcript = result["transcript"]

        if transcript && !transcript.empty?
          is_final = result["is_final"]
          puts "[AUDIO] Transcription#{is_final ? " (final)" : ""}: #{transcript}"
          ActionCable.server.broadcast(stream_name, {
            transcript: transcript,
            is_final: is_final,
            type: result["type"]
          })

          # Whisper re-transcribes the full audio buffer every few seconds,
          # producing slight variations. We debounce (3s silence gap) and
          # deduplicate (skip if normalized text matches last processed).
          agent = channel.instance_variable_get(:@agent)
          if agent
            seq = (channel.instance_variable_get(:@agent_seq) || 0) + 1
            channel.instance_variable_set(:@agent_seq, seq)

            Thread.new(seq, transcript) do |my_seq, my_transcript|
              sleep 3
              current_seq = channel.instance_variable_get(:@agent_seq)
              next unless my_seq == current_seq

              # Normalize for comparison: lowercase, strip punctuation/extra spaces
              normalized = my_transcript.downcase.gsub(/[^a-z0-9\s]/, "").squeeze(" ").strip
              last_processed = channel.instance_variable_get(:@last_processed_transcript)

              if normalized == last_processed
                puts "[AGENT] Skipping duplicate transcript"
                next
              end

              channel.instance_variable_set(:@last_processed_transcript, normalized)
              puts "[AGENT] Processing transcript: #{my_transcript}"
              agent.chat(my_transcript)
            rescue => e
              puts "[AGENT] Error in background thread: #{e.message}"
            end
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
