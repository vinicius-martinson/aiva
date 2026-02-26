/**
 * Validates service address using keyword-based rules
 * Rejects addresses outside service area or with invalid format
 */
export function validateAddress(address: string): { valid: boolean; error?: string } {
  const trimmed = address.trim()
  const lowercased = trimmed.toLowerCase()

  // Check minimum length
  if (trimmed.length < 10) {
    return {
      valid: false,
      error: "Please provide a complete address including street, city, and ZIP code."
    }
  }

  // Check for non-serviceable keywords
  if (lowercased.includes("outside") || lowercased.includes("99999")) {
    return {
      valid: false,
      error: "I'm sorry, that address is outside our service area. Please provide a different address."
    }
  }

  return { valid: true }
}
