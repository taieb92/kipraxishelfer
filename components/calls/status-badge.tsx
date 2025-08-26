"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { CallStatus } from "@/lib/types"

interface StatusBadgeProps {
  status: CallStatus
  className?: string
}

// Design System status badge configurations as specified
const statusConfig: Record<CallStatus, {
  label: string
  className: string
}> = {
  booking_made: {
    label: "Termin gebucht",
    className: "bg-green-50 text-green-800 border-green-200 hover:bg-green-100"
  },
  action_needed: {
    label: "Aktion erforderlich", 
    className: "bg-yellow-50 text-yellow-800 border-yellow-200 hover:bg-yellow-100"
  },
  completed: {
    label: "Abgeschlossen",
    className: "bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100"
  },
  failed: {
    label: "Fehlgeschlagen",
    className: "bg-red-50 text-red-800 border-red-200 hover:bg-red-100"
  }
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs font-medium border",
        config.className,
        className
      )}
    >
      {config.label}
    </Badge>
  )
} 