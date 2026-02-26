module Tools
  module ConfirmBooking
    SCHEMA = {
      name: "confirm_booking",
      description: "Confirm and finalize the customer's service appointment booking. Call this after the customer selects a time slot.",
      input_schema: {
        type: "object",
        properties: {
          service_type: {
            type: "string",
            description: "The type of service being booked (e.g., ac_repair, plumbing)"
          },
          time_slot: {
            type: "string",
            description: "The selected time slot (e.g., 'Tomorrow 9:00 AM - 11:00 AM')"
          },
          customer_name: {
            type: "string",
            description: "The customer's full name"
          },
          address: {
            type: "string",
            description: "The customer's service address"
          }
        },
        required: %w[service_type time_slot customer_name address]
      }
    }.freeze

    def self.call(input)
      {
        booking_id: "bk_#{SecureRandom.hex(6)}",
        status: "confirmed",
        service_type: input["service_type"],
        time_slot: input["time_slot"],
        customer_name: input["customer_name"],
        address: input["address"],
        confirmation_message: "Appointment confirmed for #{input['time_slot']}"
      }
    end
  end
end
