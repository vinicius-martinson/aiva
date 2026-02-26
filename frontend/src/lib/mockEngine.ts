import { FlowState, type BookingData } from "@/types/booking"
import type { ChatMessage } from "@/types/chat"
import { validateAddress } from "./addressValidator"
import { mockClient, mockTimeSlots, scheduleTypeOptions } from "./mockData"

/**
 * Generates deterministic AI responses based on current flow state
 * Returns next message, state transition, and booking data updates
 */
export function getAIResponse(
  flowState: FlowState,
  userInput: string,
  bookingData: BookingData
): { message: ChatMessage; nextState: FlowState; data?: Partial<BookingData> } {
  const input = userInput.toLowerCase().trim()

  switch (flowState) {
    case FlowState.IDLE: {
      // Check for booking intent keywords
      const bookingKeywords = ["schedule", "job", "book", "estimate", "appointment"]
      const hasBookingIntent = bookingKeywords.some((keyword) => input.includes(keyword))

      if (hasBookingIntent) {
        // Transition to CLASSIFYING
        return {
          message: {
            id: crypto.randomUUID(),
            role: "assistant",
            type: "text",
            content: "I can help you with that. What type of scheduling would you like?",
            timestamp: new Date()
          },
          nextState: FlowState.CLASSIFYING
        }
      }

      // Stay in IDLE for initial greeting
      return {
        message: {
          id: crypto.randomUUID(),
          role: "assistant",
          type: "text",
          content: "Hi, I'm Aiva. How can I help you today?",
          timestamp: new Date()
        },
        nextState: FlowState.IDLE
      }
    }

    case FlowState.CLASSIFYING: {
      // Return schedule type widget
      return {
        message: {
          id: crypto.randomUUID(),
          role: "assistant",
          type: "widget:schedule_type",
          content: "Please select a schedule type:",
          timestamp: new Date(),
          data: {
            options: scheduleTypeOptions.map((opt) => ({
              id: opt.id,
              label: opt.label,
              description: opt.description
            }))
          }
        },
        nextState: FlowState.AWAITING_SCHEDULE_TYPE
      }
    }

    case FlowState.AWAITING_SCHEDULE_TYPE: {
      // This state is handled by widget interaction
      return {
        message: {
          id: crypto.randomUUID(),
          role: "assistant",
          type: "text",
          content: "Please select a schedule type above.",
          timestamp: new Date()
        },
        nextState: FlowState.AWAITING_SCHEDULE_TYPE
      }
    }

    case FlowState.AWAITING_ADDRESS: {
      // Check if this is the initial prompt or a user address response
      if (!input || input.length < 5) {
        return {
          message: {
            id: crypto.randomUUID(),
            role: "assistant",
            type: "text",
            content: "Great choice! What's the service address?",
            timestamp: new Date()
          },
          nextState: FlowState.AWAITING_ADDRESS
        }
      }

      // Validate the address
      const validation = validateAddress(userInput)

      if (!validation.valid) {
        return {
          message: {
            id: crypto.randomUUID(),
            role: "assistant",
            type: "text",
            content: validation.error || "Invalid address. Please try again.",
            timestamp: new Date()
          },
          nextState: FlowState.AWAITING_ADDRESS
        }
      }

      // Valid address - return booking summary widget
      return {
        message: {
          id: crypto.randomUUID(),
          role: "assistant",
          type: "widget:booking_summary",
          content: "Perfect, I found availability for that area.",
          timestamp: new Date(),
          data: {
            client: {
              name: mockClient.name,
              phone: mockClient.phone,
              address: mockClient.address
            },
            timeSlots: mockTimeSlots.map((slot) => ({
              id: slot.id,
              datetime: slot.datetime,
              duration: slot.duration
            })),
            scheduleType: bookingData.scheduleType || "job"
          }
        },
        nextState: FlowState.AWAITING_SLOT_SELECTION,
        data: { address: userInput }
      }
    }

    case FlowState.VALIDATING_SERVICE: {
      // Transparent validation - immediately transition to slot selection
      return {
        message: {
          id: crypto.randomUUID(),
          role: "assistant",
          type: "text",
          content: "Validating service availability...",
          timestamp: new Date()
        },
        nextState: FlowState.AWAITING_SLOT_SELECTION
      }
    }

    case FlowState.AWAITING_SLOT_SELECTION: {
      // This state is handled by widget interaction
      return {
        message: {
          id: crypto.randomUUID(),
          role: "assistant",
          type: "text",
          content: "Please select a time slot and confirm above.",
          timestamp: new Date()
        },
        nextState: FlowState.AWAITING_SLOT_SELECTION
      }
    }

    case FlowState.CONFIRMING: {
      // Generate job ID and complete booking
      const jobId = generateJobId()
      const selectedSlot = mockTimeSlots.find((slot) => slot.id === bookingData.selectedSlotId)
      const slotDate = selectedSlot
        ? new Date(selectedSlot.datetime).toLocaleString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true
          })
        : "selected time"

      return {
        message: {
          id: crypto.randomUUID(),
          role: "assistant",
          type: "text",
          content: `Job ${jobId} created for ${slotDate}. The appointment has been confirmed.`,
          timestamp: new Date()
        },
        nextState: FlowState.BOOKED,
        data: { jobId }
      }
    }

    case FlowState.BOOKED: {
      // Offer to help with something else
      return {
        message: {
          id: crypto.randomUUID(),
          role: "assistant",
          type: "text",
          content: "Is there anything else I can help you with?",
          timestamp: new Date()
        },
        nextState: FlowState.BOOKED
      }
    }

    case FlowState.ERROR: {
      // Return error message
      const errorMessage =
        bookingData.errorMessage || "Something went wrong. Please try again."
      return {
        message: {
          id: crypto.randomUUID(),
          role: "assistant",
          type: "text",
          content: errorMessage,
          timestamp: new Date()
        },
        nextState: FlowState.ERROR
      }
    }

    default:
      return {
        message: {
          id: crypto.randomUUID(),
          role: "assistant",
          type: "text",
          content: "I'm not sure how to help with that.",
          timestamp: new Date()
        },
        nextState: FlowState.IDLE
      }
  }
}

/**
 * Generates a random job ID in format JOB-XXXXX
 */
export function generateJobId(): string {
  return `JOB-${Math.floor(Math.random() * 90000) + 10000}`
}
