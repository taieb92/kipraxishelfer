export type CallStatus = "booking_made" | "action_needed" | "completed" | "failed"
export type CallCategory = "appointment" | "receipt" | "sick_note" | "info" | "other" | "unknown"

export interface CallItem {
  id: string
  practiceId: string
  startedAt: string // ISO
  durationSec: number
  direction: "inbound" | "outbound"
  fromNumber: string
  callerName?: string
  language?: string
  category: CallCategory
  status: CallStatus
  tags: string[]
  summary?: string
  recordingUrl?: string | null
  transcriptUrl?: string | null
  redactionApplied: boolean
  appointment?: {
    source: "doctolib" | "native"
    doctolibId?: string
    doctolibLink?: string
  } | null
}

export interface CalendarSettings {
  hours: Record<"mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun", [string, string][]> // [['08:00','12:00']]
  holidays: { start: string; end?: string; note?: string }[]
}

export interface UsageRollupItem {
  date: string // YYYY-MM-DD
  minutesInbound: number
  minutesOutbound: number
  callsTotal: number
  byCategory: Record<CallCategory, number>
}

export interface Practice {
  id: string
  name: string
  location?: string
}

export interface User {
  id: string
  email: string
  role: "admin" | "staff"
  createdAt: string
}
