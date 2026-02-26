module Tools
  module FetchServicePricing
    PRICING = {
      "ac_repair"        => { label: "AC Repair",           price_cents: 12_000, duration_hours: 2 },
      "plumbing"         => { label: "Plumbing Service",    price_cents: 30_000, duration_hours: 3 },
      "electrical"       => { label: "Electrical Service",  price_cents: 18_000, duration_hours: 2 },
      "appliance_repair" => { label: "Appliance Repair",    price_cents: 9_500,  duration_hours: 1 }
    }.freeze

    DEFAULT_PRICING = { label: "General Service", price_cents: 15_000, duration_hours: 2 }.freeze

    SCHEMA = {
      name: "fetch_service_pricing",
      description: "Fetch pricing and availability for a service type. Use after validating the customer's address.",
      input_schema: {
        type: "object",
        properties: {
          service_type: {
            type: "string",
            description: "The type of service (e.g., ac_repair, plumbing, electrical, appliance_repair)"
          }
        },
        required: %w[service_type]
      }
    }.freeze

    def self.call(input)
      service = PRICING.fetch(input["service_type"], DEFAULT_PRICING)

      {
        service_type: input["service_type"],
        label: service[:label],
        price_cents: service[:price_cents],
        price_formatted: "$#{service[:price_cents] / 100}",
        duration_hours: service[:duration_hours],
        availability: [
          { slot: "Tomorrow 9:00 AM - 11:00 AM",       available: true },
          { slot: "Tomorrow 1:00 PM - 3:00 PM",        available: true },
          { slot: "Day after tomorrow 10:00 AM - 12:00 PM", available: true }
        ]
      }
    end
  end
end
