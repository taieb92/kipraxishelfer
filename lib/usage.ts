/**
 * Usage utility functions for rounding, projections, and formatting
 */

export interface BillingRules {
  rounding: 'per_minute' | 'per_second'
  minChargeSec?: number
  planIncludedMinutes?: number
}

export interface UsageProjection {
  minutesTotal: number
  confidence: 'high' | 'medium' | 'low'
  method: 'linear' | 'moving_average'
}

/**
 * Round call duration according to billing rules
 */
export function roundCallDuration(durationSec: number, rules: BillingRules): number {
  if (rules.rounding === 'per_minute') {
    // Round up to next full minute
    return Math.ceil(durationSec / 60) * 60
  }
  
  if (rules.minChargeSec && durationSec < rules.minChargeSec) {
    return rules.minChargeSec
  }
  
  return durationSec
}

/**
 * Calculate billable minutes from raw call durations
 */
export function calculateBillableMinutes(
  callDurations: number[], 
  rules: BillingRules
): number {
  const totalSeconds = callDurations.reduce((sum, duration) => {
    return sum + roundCallDuration(duration, rules)
  }, 0)
  
  return Math.round(totalSeconds / 60)
}

/**
 * Project total usage for the current billing cycle
 */
export function projectCycleUsage(
  dailyMinutes: Array<{ dateISO: string, minutesTotal: number }>,
  cycleStartISO: string,
  cycleEndISO: string
): UsageProjection {
  const cycleStart = new Date(cycleStartISO)
  const cycleEnd = new Date(cycleEndISO)
  const now = new Date()
  
  // Filter data to current cycle and up to today
  const cycleData = dailyMinutes.filter(day => {
    const dayDate = new Date(day.dateISO)
    return dayDate >= cycleStart && dayDate <= now && dayDate <= cycleEnd
  })
  
  if (cycleData.length === 0) {
    return {
      minutesTotal: 0,
      confidence: 'low',
      method: 'linear'
    }
  }
  
  const totalMinutesUsed = cycleData.reduce((sum, day) => sum + day.minutesTotal, 0)
  const daysUsed = cycleData.length
  
  // Calculate total cycle days
  const totalCycleDays = Math.ceil((cycleEnd.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysUsed >= totalCycleDays) {
    // Cycle is complete
    return {
      minutesTotal: totalMinutesUsed,
      confidence: 'high',
      method: 'linear'
    }
  }
  
  // Use different projection methods based on available data
  if (daysUsed >= 7) {
    // Use 7-day moving average for more stable projections
    const recent7Days = cycleData.slice(-7)
    const avgDailyMinutes = recent7Days.reduce((sum, day) => sum + day.minutesTotal, 0) / 7
    const remainingDays = totalCycleDays - daysUsed
    
    return {
      minutesTotal: Math.round(totalMinutesUsed + (avgDailyMinutes * remainingDays)),
      confidence: daysUsed >= 14 ? 'high' : 'medium',
      method: 'moving_average'
    }
  } else {
    // Linear projection for early cycle data
    const avgDailyMinutes = totalMinutesUsed / daysUsed
    const projectedTotal = Math.round(avgDailyMinutes * totalCycleDays)
    
    return {
      minutesTotal: projectedTotal,
      confidence: daysUsed >= 3 ? 'medium' : 'low',
      method: 'linear'
    }
  }
}

/**
 * Format large numbers with German thousand separators using thin spaces
 */
export function formatNumberDE(num: number): string {
  return num.toLocaleString('de-DE').replace(/\./g, '\u2009') // thin space (U+2009)
}

/**
 * Format duration in seconds to MM:SS format
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

/**
 * Format duration in seconds to human-readable text
 */
export function formatDurationText(seconds: number, locale: 'de' | 'en' = 'de'): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  
  const parts: string[] = []
  
  if (locale === 'de') {
    if (hours > 0) parts.push(`${hours} Std.`)
    if (minutes > 0) parts.push(`${minutes} Min.`)
    if (remainingSeconds > 0 && hours === 0) parts.push(`${remainingSeconds} Sek.`)
  } else {
    if (hours > 0) parts.push(`${hours}h`)
    if (minutes > 0) parts.push(`${minutes}m`)
    if (remainingSeconds > 0 && hours === 0) parts.push(`${remainingSeconds}s`)
  }
  
  return parts.join(' ') || (locale === 'de' ? '0 Sek.' : '0s')
}

/**
 * Calculate percentage with specified decimal places
 */
export function calculatePercentage(value: number, total: number, decimals: number = 1): string {
  if (total === 0) return '0'
  return ((value / total) * 100).toFixed(decimals)
}

/**
 * Calculate growth rate between two periods
 */
export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

/**
 * Check if a date falls within business hours
 */
export function isWithinBusinessHours(
  dateTime: Date, 
  businessHours: { start: string, end: string } = { start: '08:00', end: '18:00' }
): boolean {
  const hour = dateTime.getHours()
  const minute = dateTime.getMinutes()
  const timeInMinutes = hour * 60 + minute
  
  const [startHour, startMinute] = businessHours.start.split(':').map(Number)
  const [endHour, endMinute] = businessHours.end.split(':').map(Number)
  
  const startInMinutes = startHour * 60 + startMinute
  const endInMinutes = endHour * 60 + endMinute
  
  return timeInMinutes >= startInMinutes && timeInMinutes <= endInMinutes
}

/**
 * Generate date range for cycle selection
 */
export function generateCycleDates(type: 'current' | 'last'): { start: Date, end: Date } {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()
  
  if (type === 'current') {
    return {
      start: new Date(currentYear, currentMonth, 1),
      end: new Date(currentYear, currentMonth + 1, 0)
    }
  } else {
    return {
      start: new Date(currentYear, currentMonth - 1, 1),
      end: new Date(currentYear, currentMonth, 0)
    }
  }
}

/**
 * Validate custom date range
 */
export function validateDateRange(from: Date, to: Date): { valid: boolean, error?: string } {
  if (from >= to) {
    return { valid: false, error: 'Startdatum muss vor Enddatum liegen' }
  }
  
  const daysDiff = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysDiff > 365) {
    return { valid: false, error: 'Zeitraum darf nicht länger als 1 Jahr sein' }
  }
  
  if (to > new Date()) {
    return { valid: false, error: 'Enddatum darf nicht in der Zukunft liegen' }
  }
  
  return { valid: true }
} 