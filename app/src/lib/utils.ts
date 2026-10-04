import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format ISO date string to human-readable format
 * @param isoDate - ISO 8601 date string (e.g., "2025-12-08T12:10:58.749734Z")
 * @returns Formatted date string (e.g., "Dec 8, 2025")
 */
export function formatDate(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) {
      return isoDate; // Return original if invalid
    }
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return isoDate;
  }
}

/**
 * Format ISO date string with time
 * @param isoDate - ISO 8601 date string
 * @returns Formatted date with time (e.g., "Dec 8, 2025 at 12:10 PM")
 */
export function formatDateTime(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) {
      return isoDate;
    }
    
    const datePart = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    
    const timePart = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    return `${datePart} at ${timePart}`;
  } catch {
    return isoDate;
  }
}

/**
 * Format large numbers into compact strings (e.g., 2567 -> 2.6K).
 */
export function formatCompactNumber(value: number): string {
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);

  const roundScaled = (num: number) =>
    num < 100 ? Math.round(num * 10) / 10 : Math.round(num);
  const formatRounded = (num: number) =>
    Number.isInteger(num) ? `${num}` : num.toFixed(1);

  if (abs < 1000) {
    return `${sign}${Math.round(abs)}`;
  }

  if (abs < 1_000_000) {
    const scaled = abs / 1000;
    const rounded = roundScaled(scaled);
    if (rounded >= 1000) {
      const scaledMillions = abs / 1_000_000;
      return `${sign}${formatRounded(roundScaled(scaledMillions))}M`;
    }
    return `${sign}${formatRounded(rounded)}K`;
  }

  if (abs < 1_000_000_000) {
    const scaled = abs / 1_000_000;
    const rounded = roundScaled(scaled);
    if (rounded >= 1000) {
      const scaledBillions = abs / 1_000_000_000;
      return `${sign}${formatRounded(roundScaled(scaledBillions))}B`;
    }
    return `${sign}${formatRounded(rounded)}M`;
  }

  const scaled = abs / 1_000_000_000;
  return `${sign}${formatRounded(roundScaled(scaled))}B`;
}
