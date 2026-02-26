class AgentService
  TOOLS = [
    {
      name: "service_schedule",
      description: "Schedule a home service appointment for the customer. Use this when the user describes needing any kind of home service such as HVAC, plumbing, electrical, appliance repair, etc.",
      input_schema: {
        type: "object",
        properties: {
          service_type: {
            type: "string",
            description: "The type of service needed (e.g., 'ac_repair', 'plumbing', 'electrical')"
          },
          description: {
            type: "string",
            description: "A brief description of the issue"
          }
        },
        required: ["service_type", "description"]
      }
    }
  ].freeze

  def initialize
    @client = Anthropic::Client.new(api_key: ENV.fetch("ANTHROPIC_API_KEY"))
  end

  def chat(text)
    puts "[AGENT] Sending to Claude: #{text}"

    response = @client.messages.create(
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: "You are a helpful home services assistant. When a customer describes a problem with their home (AC, plumbing, electrical, etc.), use the service_schedule tool to schedule a service appointment.",
      tools: TOOLS,
      messages: [{ role: "user", content: text }]
    )

    handle_response(response)
  rescue => e
    puts "[AGENT] Error: #{e.message}"
    nil
  end

  private

  def handle_response(response)
    text_parts = []

    response.content.each do |block|
      case block.type.to_s
      when "text"
        text_parts << block.text
      when "tool_use"
        handle_tool_call(block)
      end
    end

    agent_text = text_parts.join("\n")
    puts "[AGENT] Response: #{agent_text}" unless agent_text.empty?
    agent_text
  end

  def handle_tool_call(tool_block)
    case tool_block.name
    when "service_schedule"
      puts "=" * 50
      puts "TOOL SERVICE SCHEDULE triggered!"
      puts "Input: #{tool_block.input.inspect}"
      puts "=" * 50
    else
      puts "[AGENT] Unknown tool called: #{tool_block.name}"
    end
  end
end
