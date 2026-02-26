module Tools
  module OfferUpsell
    UPSELLS = {
      "ac_repair"        => { title: "Annual HVAC Maintenance Plan",    price_cents: 14_900, description: "Keep your HVAC system running efficiently year-round with annual inspections and priority service." },
      "plumbing"         => { title: "Whole-Home Plumbing Inspection",  price_cents: 4_900,  description: "Comprehensive inspection of all plumbing fixtures, pipes, and water heater to prevent future issues." },
      "electrical"       => { title: "Surge Protection Installation",   price_cents: 29_900, description: "Whole-home surge protection to safeguard your electronics and appliances from power spikes." }
    }.freeze

    DEFAULT_UPSELL = { title: "Home Maintenance Membership", price_cents: 9_900, description: "Priority scheduling, annual inspections, and 10% off all future services." }.freeze

    SCHEMA = {
      name: "offer_upsell",
      description: "Present an upsell offer to the customer before wrapping up the call. Always use this before ending the conversation.",
      input_schema: {
        type: "object",
        properties: {
          primary_service_type: {
            type: "string",
            description: "The primary service type the customer is booking"
          }
        },
        required: %w[primary_service_type]
      }
    }.freeze

    def self.call(input)
      upsell = UPSELLS.fetch(input["primary_service_type"], DEFAULT_UPSELL)

      {
        upsell_id: "upsell_#{SecureRandom.hex(4)}",
        offer_title: upsell[:title],
        price_cents: upsell[:price_cents],
        price_formatted: "$#{upsell[:price_cents] / 100}",
        description: upsell[:description],
        accepted: nil
      }
    end
  end
end
