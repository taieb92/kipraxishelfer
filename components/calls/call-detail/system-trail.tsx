"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { Clock } from "lucide-react"

interface SystemTrailItem {
  tsISO: string
  action: string
  meta?: Record<string, unknown>
}

interface SystemTrailProps {
  items: SystemTrailItem[]
  className?: string
}

// Format timestamp for display
const formatTimestamp = (tsISO: string): string => {
  try {
    const date = new Date(tsISO)
    return date.toLocaleTimeString('de-DE', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    })
  } catch {
    return tsISO
  }
}

// Format meta information
const formatMeta = (meta?: Record<string, unknown>): string => {
  if (!meta || Object.keys(meta).length === 0) return ""
  
  const entries = Object.entries(meta)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ')
  
  return entries
}

export function SystemTrail({ items, className }: SystemTrailProps) {
  if (items.length === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <Clock className="h-12 w-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 font-medium">
          Kein System-Trail verfügbar
        </p>
        <p className="text-sm text-slate-400 mt-1">
          Es wurden keine System-Aktionen aufgezeichnet.
        </p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-4 bottom-4 w-px bg-slate-200" />
        
        {/* Timeline items */}
        <div className="space-y-4">
          {items.map((item, index) => {
            const timestamp = formatTimestamp(item.tsISO)
            const metaInfo = formatMeta(item.meta)
            
            return (
              <div key={index} className="relative flex items-start space-x-4">
                {/* Timeline dot */}
                <div className={cn(
                  "flex h-3 w-3 shrink-0 rounded-full border-2 bg-white",
                  "border-blue-600 mt-2"
                )} />
                
                {/* Content */}
                <div className="flex-1 min-w-0 pb-4">
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <h4 className="text-sm font-medium text-slate-900">
                      {item.action}
                    </h4>
                    <time className="text-xs text-slate-500 font-mono shrink-0">
                      {timestamp}
                    </time>
                  </div>
                  
                  {metaInfo && (
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {metaInfo}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      
      {/* Screen reader accessible summary */}
      <div className="sr-only">
        System-Trail mit {items.length} Einträgen:
        {items.map((item, index) => {
          const timestamp = formatTimestamp(item.tsISO)
          const metaInfo = formatMeta(item.meta)
          return ` ${index + 1}. ${timestamp}: ${item.action}${metaInfo ? `. ${metaInfo}` : ''}`
        }).join('')}
      </div>
    </div>
  )
} 