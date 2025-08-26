import { differenceInDays, parseISO, format } from "date-fns"
import { de } from "date-fns/locale"

/**
 * Calculate the duration of a holiday in days
 */
export function getHolidayDuration(startISO: string, endISO?: string): number {
  const start = parseISO(startISO)
  const end = endISO ? parseISO(endISO) : start
  return differenceInDays(end, start) + 1 // +1 because both start and end days are included
}

/**
 * Format holiday date range for display
 */
export function formatHolidayDateRange(startISO: string, endISO?: string): string {
  const start = parseISO(startISO)
  const duration = getHolidayDuration(startISO, endISO)
  
  if (!endISO || startISO === endISO) {
    return format(start, "dd.MM", { locale: de })
  }
  
  const end = parseISO(endISO)
  const startFormatted = format(start, "dd.MM", { locale: de })
  const endFormatted = format(end, "dd.MM", { locale: de })
  
  return `${startFormatted} – ${endFormatted} (${duration} ${duration === 1 ? 'Tag' : 'Tage'})`
}

/**
 * Format a time window for display
 */
export function formatTimeWindow(from: string, to: string): string {
  return `${from}–${to}`
}

/**
 * Validate time window is within allowed bounds
 */
export function isValidCallWindow(from: string, to: string): { valid: boolean; reason?: string } {
  const fromHour = parseInt(from.split(':')[0])
  const toHour = parseInt(to.split(':')[0])
  
  if (fromHour < 8 || toHour > 18) {
    return {
      valid: false,
      reason: "Anrufzeiten müssen zwischen 08:00 und 18:00 Uhr liegen"
    }
  }
  
  if (fromHour >= toHour) {
    return {
      valid: false,
      reason: "Startzeit muss vor der Endzeit liegen"
    }
  }
  
  return { valid: true }
}

/**
 * Generate time options for dropdowns (in 30-minute intervals)
 */
export function generateTimeOptions(): string[] {
  const times: string[] = []
  for (let hour = 8; hour <= 18; hour++) {
    times.push(`${hour.toString().padStart(2, '0')}:00`)
    if (hour < 18) {
      times.push(`${hour.toString().padStart(2, '0')}:30`)
    }
  }
  return times
} 