class TranscriptionChannel < ApplicationCable::Channel
  def subscribed
    stream_from "transcription_#{identifier_key}"
    puts "[AUDIO] Client subscribed (stream: transcription_#{identifier_key})"

    @agent = AgentService.new("transcription_#{identifier_key}")
    @last_sent_transcript = nil
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

  def extract_delta(new_transcript)
    return new_transcript if @last_sent_transcript.nil?

    old_words = normalize_words(@last_sent_transcript)
    new_words = normalize_words(new_transcript)

    prefix_len = old_words.zip(new_words).take_while { |a, b| a == b }.length

    original_words = new_transcript.split
    delta_words = original_words[prefix_len..]
    return nil if delta_words.nil? || delta_words.empty?

    delta_words.join(" ")
  end

  def normalize_words(text)
    text.downcase.gsub(/[^a-z0-9\s]/, "").squeeze(" ").strip.split
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
            type: "transcription",
            transcript: transcript,
            is_final: is_final
          })

          agent = channel.instance_variable_get(:@agent)
          if agent
            seq = (channel.instance_variable_get(:@agent_seq) || 0) + 1
            channel.instance_variable_set(:@agent_seq, seq)

            Thread.new(seq, transcript) do |my_seq, my_transcript|
              sleep 5
              current_seq = channel.instance_variable_get(:@agent_seq)
              next unless my_seq == current_seq

              # Skip if agent is already processing
              if channel.instance_variable_get(:@agent_processing)
                puts "[AGENT] Skipping — agent is busy processing"
                next
              end

              # Extract only the new words (delta) from the cumulative transcript
              delta = channel.send(:extract_delta, my_transcript)

              if delta.nil? || delta.split.length < 2
                puts "[AGENT] Skipping — delta too short: #{delta.inspect}"
                next
              end

              channel.instance_variable_set(:@last_sent_transcript, my_transcript)
              channel.instance_variable_set(:@agent_processing, true)

              puts "[AGENT] Processing delta: #{delta}"
              agent.chat(delta)
            rescue => e
              puts "[AGENT] Error in background thread: #{e.message}"
            ensure
              channel.instance_variable_set(:@agent_processing, false)
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
