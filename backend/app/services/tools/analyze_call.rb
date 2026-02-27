module Tools
  module AnalyzeCall
    SCHEMA = {
      name: "analyze_call",
      description: "Analyze the virtual assistant's performance after completing the call flow. Call this after the customer responds to the upsell and the call is wrapping up.",
      input_schema: {
        type: "object",
        properties: {
          call_summary: {
            type: "string",
            description: "A brief summary of the entire call including customer issue, service booked, and outcome"
          },
          service_type: {
            type: "string",
            description: "The primary service type discussed during the call"
          }
        },
        required: %w[call_summary service_type]
      }
    }.freeze

    def self.call(_input)
      {
        overall_score: 8,
        summary: "The virtual assistant handled this call efficiently, maintaining a professional and empathetic tone throughout. Customer needs were identified quickly and the booking was completed smoothly.",
        strengths: [
          "Quick and accurate issue identification",
          "Professional tone maintained throughout the call",
          "Smooth transition between booking steps"
        ],
        improvements: [
          "Could offer more detailed service explanations",
          "Consider providing estimated arrival window"
        ],
        next_steps: [
          "Send booking confirmation email to customer",
          "Schedule automated reminder 24h before appointment",
          "Notify assigned technician with job details"
        ]
      }
    end
  end
end
