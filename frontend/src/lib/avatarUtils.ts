/**
 * Extract initials from a full name
 * @param name - Full name (e.g., "Sarah Johnson")
 * @returns Initials (e.g., "SJ" or "S" for single word names)
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)

  if (parts.length === 1) {
    return parts[0][0]?.toUpperCase() || ""
  }

  const firstInitial = parts[0][0]?.toUpperCase() || ""
  const lastInitial = parts[parts.length - 1][0]?.toUpperCase() || ""

  return firstInitial + lastInitial
}

/**
 * Generate deterministic avatar background color from name
 * @param name - Full name
 * @returns Tailwind bg color class (e.g., "bg-blue-500")
 */
export function getAvatarColor(name: string): string {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-orange-500",
    "bg-teal-500"
  ]

  // Simple hash function for deterministic color selection
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }

  const index = Math.abs(hash) % colors.length
  return colors[index]
}
