// Avatar utility functions for generating default avatars from email

/**
 * Get the first character of an email (before @)
 */
export function getEmailInitial(email?: string): string {
  if (!email) return "U";
  const initial = email.charAt(0).toUpperCase();
  return initial || "U";
}

/**
 * Generate a consistent color from a string (email)
 * This ensures the same email always gets the same color
 */
export function getAvatarColorFromEmail(email?: string): string {
  if (!email) {
    return "hsl(200, 70%, 50%)"; // Default blue
  }

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32bit integer
  }

  // Generate HSL color with good saturation and lightness
  const hue = Math.abs(hash % 360);
  const saturation = 65 + (Math.abs(hash) % 10); // 65-75%
  const lightness = 50 + (Math.abs(hash >> 8) % 10); // 50-60%

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Get initials from name or email
 * Priority: firstName + lastName > email initial
 */
export function getInitials(
  firstName?: string,
  lastName?: string,
  email?: string
): string {
  const first = (firstName?.[0] ?? "").toUpperCase();
  const last = (lastName?.[0] ?? "").toUpperCase();

  if (first && last) {
    return first + last;
  }

  if (first) {
    return first;
  }

  // Fallback to email initial
  return getEmailInitial(email);
}
