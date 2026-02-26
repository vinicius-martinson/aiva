module Tools
  module ClassifyVisitType
    SCHEMA = {
      name: "classify_visit_type",
      description: "Classify the type of service visit based on the customer's issue. Use after understanding the customer's problem.",
      input_schema: {
        type: "object",
        properties: {
          issue_summary: {
            type: "string",
            description: "Brief summary of the customer's issue"
          },
          urgency: {
            type: "string",
            enum: %w[low medium high emergency],
            description: "Urgency level of the issue"
          }
        },
        required: %w[issue_summary urgency]
      }
    }.freeze

    def self.call(input)
      visit_type = input["urgency"] == "emergency" ? "unscheduled_callback" : "scheduled_appointment"

      reason = case visit_type
               when "unscheduled_callback"
                 "Emergency issue requires immediate dispatch"
               else
                 "Standard service visit scheduled based on availability"
               end

      {
        visit_type: visit_type,
        issue_summary: input["issue_summary"],
        urgency: input["urgency"],
        reason: reason
      }
    end
  end
end
