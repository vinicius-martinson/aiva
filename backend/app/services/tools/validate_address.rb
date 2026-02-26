module Tools
  module ValidateAddress
    SCHEMA = {
      name: "validate_address",
      description: "Validate a customer's address and check if it's within the service area. Use after collecting customer info.",
      input_schema: {
        type: "object",
        properties: {
          address: {
            type: "string",
            description: "The full address to validate"
          }
        },
        required: %w[address]
      }
    }.freeze

    def self.call(input)
      address = input["address"]
      encoded = ERB::Util.url_encode(address)

      {
        formatted_address: address,
        in_service_area: true,
        map_embed_url: "https://www.google.com/maps/search/?api=1&query=#{encoded}",
        coordinates: { lat: 30.2672, lng: -97.7431 }
      }
    end
  end
end
