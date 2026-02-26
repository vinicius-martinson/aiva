class AgentService
  MAX_ITERATIONS = 10

  TOOL_MODULES = {
    "classify_visit_type"   => Tools::ClassifyVisitType,
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
    2. **Collect customer info**: Ask the customer for their full name and address. Once they provide it, call `collect_customer_info`.
    3. **Validate address**: Immediately after collecting info, call `validate_address` with the customer's address to confirm service area coverage.
    4. **Fetch pricing**: After address validation, call `fetch_service_pricing` with the appropriate service type to get pricing and availability.
    5. **Present pricing and confirm**: Share the price, duration, and available time slots with the customer. Ask them to pick a time slot.
    6. **Confirm booking**: Once the customer selects a time slot, call `confirm_booking` with the service details. After confirmation, respond with something like "Great, I have you on the schedule for [time slot]!" to let the customer know their appointment is locked in.
    7. **Upsell**: After confirming the booking, call `offer_upsell` with the primary service type. Present the offer naturally, then wrap up the call.

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
  end

  def chat(text)
    puts "[AGENT] User: #{text}"
    @messages << { role: "user", content: text }

    iterations = 0

    loop do
      iterations += 1
      if iterations > MAX_ITERATIONS
        puts "[AGENT] Safety cap reached (#{MAX_ITERATIONS} iterations)"
        break
      end

      response = call_claude

      # Process response content blocks
      assistant_content = response.content.map { |block| serialize_content_block(block) }
      @messages << { role: "assistant", content: assistant_content }

      # Collect tool uses first
      tool_uses = response.content.select { |b| b.type.to_s == "tool_use" }

      # Only broadcast text if there are no tool calls in this response
      response.content.each do |block|
        case block.type.to_s
        when "text"
          broadcast_agent_text(block.text) if tool_uses.empty?
        end
      end

      # If no tool calls, we're done
      break if tool_uses.empty?

      # Execute all tool calls and collect results
      tool_results = tool_uses.map { |tool_use| execute_tool(tool_use) }
      @messages << { role: "user", content: tool_results }

      # If stop_reason is end_turn (no more tool calls expected), break
      break if response.stop_reason == "end_turn"
    end
  rescue => e
    puts "[AGENT] Error: #{e.message}"
    puts e.backtrace.first(5).join("\n")
    nil
  end

  private

  def call_claude
    @client.messages.create(
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools: TOOLS,
      messages: @messages
    )
  end

  def execute_tool(tool_use)
    tool_name = tool_use.name
    raw_input = tool_use.input.is_a?(Hash) ? tool_use.input : tool_use.input.to_h
    tool_input = raw_input.transform_keys(&:to_s)
    tool_use_id = tool_use.id

    puts "[TOOL] Calling: #{tool_name}"
    puts "[TOOL] Input: #{tool_input.inspect}"

    broadcast_tool_call(tool_name, tool_use_id, tool_input)

    tool_module = TOOL_MODULES[tool_name]
    unless tool_module
      error_result = { error: "Unknown tool: #{tool_name}" }
      broadcast_tool_result(tool_name, tool_use_id, error_result)
      return { type: "tool_result", tool_use_id: tool_use_id, content: error_result.to_json }
    end

    result = tool_module.call(tool_input)
    puts "[TOOL] Result: #{result.inspect}"

    broadcast_tool_result(tool_name, tool_use_id, result)

    { type: "tool_result", tool_use_id: tool_use_id, content: result.to_json }
  end

  def serialize_content_block(block)
    case block.type.to_s
    when "text"
      { type: "text", text: block.text }
    when "tool_use"
      input = block.input.is_a?(Hash) ? block.input : block.input.to_h
      { type: "tool_use", id: block.id, name: block.name, input: input }
    else
      { type: block.type.to_s }
    end
  end

  def broadcast_agent_text(text)
    return if text.nil? || text.strip.empty?

    puts "[AGENT] #{text}"
    broadcast({ type: "agent_text", text: text, timestamp: Time.current.iso8601 })
  end

  def broadcast_tool_call(tool_name, tool_use_id, input)
    broadcast({
      type: "tool_call",
      tool_name: tool_name,
      tool_use_id: tool_use_id,
      input: input,
      timestamp: Time.current.iso8601
    })
  end

  def broadcast_tool_result(tool_name, tool_use_id, result)
    broadcast({
      type: "tool_result",
      tool_name: tool_name,
      tool_use_id: tool_use_id,
      result: result,
      timestamp: Time.current.iso8601
    })
  end

  def broadcast(data)
    ActionCable.server.broadcast(@stream_name, data)
  end
end
