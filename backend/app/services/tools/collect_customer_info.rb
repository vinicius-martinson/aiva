module Tools
  module CollectCustomerInfo
    SCHEMA = {
      name: "collect_customer_info",
      description: "Store the customer's contact information. Use after the customer provides their name and address.",
      input_schema: {
        type: "object",
        properties: {
          full_name: {
            type: "string",
            description: "Customer's full name"
          },
          address: {
            type: "string",
            description: "Customer's street address including city and state"
          },
          phone_number: {
            type: "string",
            description: "Customer's phone number (optional)"
          }
        },
        required: %w[full_name address]
      }
    }.freeze

    def self.call(input)
      {
        customer_id: "cust_#{SecureRandom.hex(6)}",
        full_name: input["full_name"],
        address: input["address"],
        phone_number: input["phone_number"] || "not provided",
        status: "created"
      }
    end
  end
end
