import { useMemo } from "react"

/**
 * Custom hook for reading URL search parameters
 * Reads customer_uuid, phone_number, and csr_ai_phone_session_uuid from query string
 * Parameters are read once on mount (Phase 3 spec)
 */
export function useSearchParams() {
  return useMemo(() => {
    const params = new URLSearchParams(window.location.search)

    return {
      customerUuid: params.get("customer_uuid"),
      phoneNumber: params.get("phone_number"),
      sessionUuid: params.get("csr_ai_phone_session_uuid")
    }
  }, [])
}
