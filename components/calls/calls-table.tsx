"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { StatusBadge } from "@/components/calls/status-badge"
import type { CallItem, CallCategory } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Eye, Phone, PhoneOutgoing } from "lucide-react"
import { format } from "date-fns"
import { de } from "date-fns/locale"

interface CallsTableProps {
  calls: CallItem[]
  loading?: boolean
  className?: string
}

// Design System category colors
const categoryColors: Record<CallCategory, string> = {
  appointment: "bg-blue-50 text-blue-700 border-blue-200",
  receipt: "bg-green-50 text-green-700 border-green-200",
  sick_note: "bg-yellow-50 text-yellow-700 border-yellow-200",
  info: "bg-purple-50 text-purple-700 border-purple-200",
  other: "bg-slate-50 text-slate-700 border-slate-200",
  unknown: "bg-slate-50 text-slate-700 border-slate-200",
}

const categoryLabels: Record<CallCategory, string> = {
  appointment: "Termin",
  receipt: "Rezept", 
  sick_note: "Krankschreibung",
  info: "Information",
  other: "Sonstiges",
  unknown: "Unbekannt",
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

function getCallerInitials(name?: string, number?: string): string {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }
  if (number) {
    // Get last 2 digits of number
    const digits = number.replace(/\D/g, "")
    return digits.slice(-2)
  }
  return "??"
}

function getCallerDisplay(call: CallItem): string {
  if (call.callerName) {
    return call.callerName
  }
  return call.fromNumber || "Unbekannt"
}

// Loading skeleton row
function LoadingSkeleton() {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-slate-200 animate-pulse" />
          <div className="space-y-1">
            <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
            <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>
      </TableCell>
      <TableCell><div className="h-4 w-16 bg-slate-200 rounded animate-pulse" /></TableCell>
      <TableCell><div className="h-4 w-20 bg-slate-200 rounded animate-pulse" /></TableCell>
      <TableCell><div className="h-6 w-24 bg-slate-200 rounded animate-pulse" /></TableCell>
      <TableCell><div className="h-6 w-20 bg-slate-200 rounded animate-pulse" /></TableCell>
      <TableCell><div className="h-4 w-12 bg-slate-200 rounded animate-pulse" /></TableCell>
      <TableCell><div className="h-8 w-16 bg-slate-200 rounded animate-pulse" /></TableCell>
    </TableRow>
  )
}

// Empty state component
function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <TableRow>
      <TableCell colSpan={7} className="h-32">
        <div className="flex flex-col items-center justify-center text-center">
          <Phone className="h-12 w-12 text-slate-300 mb-3" />
          {hasFilters ? (
            <>
              <h3 className="text-slate-900 font-medium mb-1">Keine Anrufe gefunden</h3>
              <p className="text-slate-500 text-sm mb-4">
                Versuchen Sie, die Filter zu ändern oder zu entfernen.
              </p>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/calls'}
                className="text-sm"
              >
                Alle anzeigen
              </Button>
            </>
          ) : (
            <>
              <h3 className="text-slate-900 font-medium mb-1">Noch keine Anrufe</h3>
              <p className="text-slate-500 text-sm">
                Anrufe werden hier angezeigt, sobald sie eingehen.
              </p>
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  )
}

export function CallsTable({ calls, loading = false, className }: CallsTableProps) {
  const router = useRouter()

  const handleRowClick = (callId: string) => {
    router.push(`/calls/${callId}`)
  }

  const handleViewClick = (e: React.MouseEvent, callId: string) => {
    e.stopPropagation() // Prevent row click
    router.push(`/calls/${callId}`)
  }

  // Check if there are any applied filters (simplified check)
  const hasFilters = window.location.search.includes('?')

  return (
    <div className={cn("rounded-lg border border-slate-200 bg-white", className)}>
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 hover:bg-slate-50">
            <TableHead scope="col" className="text-slate-700 font-medium">
              Anrufer
            </TableHead>
            <TableHead scope="col" className="text-slate-700 font-medium">
              Zeit
            </TableHead>
            <TableHead scope="col" className="text-slate-700 font-medium">
              Dauer
            </TableHead>
            <TableHead scope="col" className="text-slate-700 font-medium">
              Kategorie
            </TableHead>
            <TableHead scope="col" className="text-slate-700 font-medium">
              Status
            </TableHead>
            <TableHead scope="col" className="text-slate-700 font-medium">
              Tags
            </TableHead>
            <TableHead scope="col" className="text-slate-700 font-medium text-right">
              Aktionen
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            // Loading skeletons
            Array.from({ length: 5 }).map((_, i) => (
              <LoadingSkeleton key={i} />
            ))
          ) : calls.length === 0 ? (
            // Empty state
            <EmptyState hasFilters={hasFilters} />
          ) : (
            // Actual data
            calls.map((call) => (
              <TableRow
                key={call.id}
                onClick={() => handleRowClick(call.id)}
                className={cn(
                  "cursor-pointer transition-colors duration-200",
                  // Design System: row hover #F8FAFC
                  "hover:bg-slate-50",
                  // Design System: borders #E2E8F0
                  "border-b border-slate-200",
                  // Design System: focus ring for keyboard navigation
                  "focus:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2",
                  // Status emphasis: left accent border for action_needed
                  call.status === "action_needed" && "border-l-4 border-l-yellow-400"
                )}
                tabIndex={0}
                role="button"
                aria-label={`View call details for ${getCallerDisplay(call)}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleRowClick(call.id)
                  }
                }}
              >
                {/* Caller */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs font-medium bg-slate-100 text-slate-600">
                        {getCallerInitials(call.callerName, call.fromNumber)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900 truncate">
                          {getCallerDisplay(call)}
                        </span>
                        {call.direction === "outbound" ? (
                          <PhoneOutgoing className="h-3 w-3 text-slate-400" />
                        ) : (
                          <Phone className="h-3 w-3 text-slate-400" />
                        )}
                      </div>
                      {call.callerName && call.fromNumber && (
                        <span className="text-xs text-slate-500 truncate">
                          {call.fromNumber}
                        </span>
                      )}
                    </div>
                  </div>
                </TableCell>

                {/* Time */}
                <TableCell className="text-slate-600">
                  <div className="flex flex-col">
                    <span className="text-sm">
                      {format(new Date(call.startedAt), "HH:mm", { locale: de })}
                    </span>
                    <span className="text-xs text-slate-500">
                      {format(new Date(call.startedAt), "dd.MM.yyyy", { locale: de })}
                    </span>
                  </div>
                </TableCell>

                {/* Duration */}
                <TableCell className="text-slate-600 text-sm">
                  {formatDuration(call.durationSec)}
                </TableCell>

                {/* Category */}
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs font-medium",
                      categoryColors[call.category]
                    )}
                  >
                    {categoryLabels[call.category]}
                  </Badge>
                </TableCell>

                {/* Status */}
                <TableCell>
                  <StatusBadge status={call.status} />
                </TableCell>

                {/* Tags */}
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {call.tags.slice(0, 2).map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs text-slate-600 bg-slate-100"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {call.tags.length > 2 && (
                      <Badge
                        variant="secondary"
                        className="text-xs text-slate-500 bg-slate-100"
                      >
                        +{call.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleViewClick(e, call.id)}
                          className={cn(
                            "h-8 w-8 p-0",
                            "hover:bg-slate-100",
                            "focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                          )}
                          aria-label={`View details for call ${call.id}`}
                        >
                          <Eye className="h-4 w-4 text-slate-600" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        <p>Details anzeigen</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
