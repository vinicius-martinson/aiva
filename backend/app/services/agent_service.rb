class AgentService
  MAX_ITERATIONS = 10

  TOOL_MODULES = {
    "classify_visit_type"    => Tools::ClassifyVisitType,
    "select_schedule_type"   => Tools::SelectScheduleType,
    "collect_customer_info"  => Tools::CollectCustomerInfo,
    "validate_address"       => Tools::ValidateAddress,
    "fetch_service_pricing"  => Tools::FetchServicePricing,
    "confirm_booking"        => Tools::ConfirmBooking,
    "offer_upsell"           => Tools::OfferUpsell
  }.freeze

  TOOLS = TOOL_MODULES.values.map { |mod| mod::SCHEMA }.freeze

  SYSTEM_PROMPT = <<~PROMPT.freeze
    You are a friendly and professional phone assistant for a home services company (Housecall Pro).
    You guide the customer through a structured call flow. Follow these steps IN ORDER — do not skip or combine steps:

    1. **Identify the issue**: Listen to the customer's problem. Once you understand the issue, call `classify_visit_type` with an issue summary and urgency level.
    2. **Select schedule type**: After classifying the visit, call `select_schedule_type` with options for Job (id: job, description: Schedule service work), Estimate (id: estimate, description: Get a quote), and Notes Only (id: notes_only, description: Save call notes) to let the customer choose their preferred scheduling type.
    3. **Collect customer info**: Ask the customer for their full name and address. Once they provide it, call `collect_customer_info`.
    4. **Validate address**: Immediately after collecting info, call `validate_address` with the customer's address to confirm service area coverage.
    5. **Fetch pricing**: After address validation, call `fetch_service_pricing` with the appropriate service type to get pricing and availability.
    6. **Present pricing and confirm**: Share the price, duration, and available time slots with the customer. Ask them to pick a time slot.
    7. **Confirm booking**: Once the customer selects a time slot, call `confirm_booking` with the service details. After confirmation, respond with something like "Great, I have you on the schedule for [time slot]!" to let the customer know their appointment is locked in.
    8. **Upsell**: After confirming the booking, call `offer_upsell` with the primary service type. Present the offer naturally, then wrap up the call.

    Rules:
    - Keep responses concise (2-4 sentences). This is a phone call, not an essay.
    - NEVER mention tool names, internal steps, or system details to the customer.
    - Do not skip steps or combine multiple steps into one response.
    - If the customer goes off-topic, gently redirect them back to the current step.
    - Be warm, empathetic, and professional throughout.
  PROMPT

  def initialize(stream_name)
    @client = Anthropic::Client.new(api_key: ENV.fetch("ANTHROPIC_API_KEY"))
    @stream_name = stream_name
    @messages = []
    @seq = 0
  end

  def chat(text)
    puts "[AGENT] User: #{text}"
    @messages << { role: "user", content: text }
    broadcast({ type: "agent_thinking", timestamp: Time.current.iso8601 })

    iterations = 0

    loop do
      iterations += 1
      if iterations > MAX_ITERATIONS
        puts "[AGENT] Safety cap reached (#{MAX_ITERATIONS} iterations)"
        break
      end

      @seq = 0
      stream = call_claude_stream
      assistant_content = []
      tool_uses = []
      turn_text = ""

      stream.each do |event|
        case event
        when Anthropic::Streaming::TextEvent
          turn_text += event.text
          broadcast_agent_text_delta(event.text)
        when Anthropic::Streaming::ContentBlockStopEvent
          block = event.content_block
          assistant_content << serialize_content_block(block)
          tool_uses << block if block.type.to_s == "tool_use"
        end
      end

      final_message = stream.accumulated_message

      # Log complete text for debugging
      assistant_content.each do |block|
        puts "[AGENT] #{block[:text]}" if block[:type] == "text"
      end

      # Add complete assistant message to history
      @messages << { role: "assistant", content: assistant_content }

      # Execute tools and collect results
      tool_call_results = tool_uses.map do |tool_use|
        tool_result = execute_tool(tool_use)
        {
          tool_name: tool_use.name,
          tool_use_id: tool_use.id,
          input: parse_tool_input(tool_use.input),
          result: tool_result[:parsed_result]
        }
      end

      # Add tool results to message history (if any)
      if tool_call_results.any?
        tool_messages = tool_call_results.map do |tc|
          { type: "tool_result", tool_use_id: tc[:tool_use_id], content: tc[:result].to_json }
        end
        @messages << { role: "user", content: tool_messages }
      end

      # Single broadcast with agent script + tool data
      broadcast_turn_complete(turn_text, tool_call_results)

      break if tool_uses.empty?
      break if final_message.stop_reason == "end_turn"
    end
  rescue => e
    puts "[AGENT] Error: #{e.message}"
    puts e.backtrace.first(5).join("\n")
    nil
  end

  private

  def call_claude_stream
    @client.messages.stream(
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools: TOOLS,
      messages: @messages
    )
  end

  def execute_tool(tool_use)
    tool_name = tool_use.name
    tool_input = parse_tool_input(tool_use.input)
    tool_use_id = tool_use.id

    puts "[TOOL] Calling: #{tool_name}"
    puts "[TOOL] Input: #{tool_input.inspect}"

    tool_module = TOOL_MODULES[tool_name]
    unless tool_module
      return { tool_use_id: tool_use_id, parsed_result: { error: "Unknown tool: #{tool_name}" } }
    end

    result = tool_module.call(tool_input)
    puts "[TOOL] Result: #{result.inspect}"

    { tool_use_id: tool_use_id, parsed_result: result }
  end

  def parse_tool_input(input)
    raw = case input
          when Hash then input
          when String then JSON.parse(input)
          else input.to_h
          end
    raw.transform_keys(&:to_s)
  end

  def serialize_content_block(block)
    case block.type.to_s
    when "text"
      { type: "text", text: block.text }
    when "tool_use"
      input = case block.input
              when Hash then block.input
              when String then JSON.parse(block.input)
              else block.input.to_h
              end
      { type: "tool_use", id: block.id, name: block.name, input: input }
    else
      { type: block.type.to_s }
    end
  end

  def broadcast_agent_text_delta(text)
    return if text.nil? || text.empty?

    @seq += 1
    broadcast({ type: "agent_text_delta", text: text, seq: @seq, timestamp: Time.current.iso8601 })
  end

  def broadcast_turn_complete(agent_script, tool_calls)
    broadcast({
      type: "agent_turn_complete",
      agent_script: agent_script.presence,
      tool_calls: tool_calls.map do |tc|
        {
          tool_name: tc[:tool_name],
          tool_use_id: tc[:tool_use_id],
          input: tc[:input],
          result: tc[:result]
        }
      end,
      timestamp: Time.current.iso8601
    })
  end

  def broadcast(data)
    ActionCable.server.broadcast(@stream_name, data)
  end
end
