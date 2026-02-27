module Tools
  module SelectScheduleType
    SCHEMA = {
      name: "select_schedule_type",
      description: "Present schedule type options to the customer so they can choose how they'd like to proceed (job, estimate, or notes only).",
      input_schema: {
        type: "object",
        properties: {
          options: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string", description: "Unique identifier for the option" },
                label: { type: "string", description: "Display label for the option" },
                description: { type: "string", description: "Description of what this option means" }
              },
              required: %w[id label description]
            },
            description: "List of schedule type options to present to the customer"
          }
        },
        required: %w[options]
      }
    }.freeze

    def self.call(input)
      {
        awaiting_selection: true,
        options: input["options"]
      }
    end
  end
end
