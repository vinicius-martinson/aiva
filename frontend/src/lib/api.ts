import type { ClientData } from "@/types/booking"
import type { CallContext } from "@/types/client"

/**
 * Get client data by UUID or phone number
 */
export async function getClientData(
  customerUuid: string | null,
  phoneNumber: string | null
): Promise<ClientData | null> {
  if (!customerUuid && !phoneNumber) return null

  const params = new URLSearchParams()
  if (customerUuid) params.append("customer_uuid", customerUuid)
  if (phoneNumber) params.append("phone_number", phoneNumber)

  try {
    const response = await fetch(`http://localhost:3000/api/v1/customers?${params}`)
    if (!response.ok) return null
    return response.json()
  } catch {
    return null
  }
}

/**
 * Get current call context metadata
 */
export async function getCallContext(): Promise<CallContext> {
  // TODO: Replace with real API call when backend endpoint exists
  await new Promise(resolve => setTimeout(resolve, 300))
  return {
    queue: "General Support",
    callType: "Inbound",
    startedAt: new Date()
  }
}
