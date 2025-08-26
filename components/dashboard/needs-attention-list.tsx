"use client"

import React from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Clock, ArrowRight } from "lucide-react"

interface NeedsAttentionItem {
  id: string
  caller: string
  category: string
  time: string
  status: 'action_needed' | 'booking_made' | 'completed' | 'failed'
}

interface NeedsAttentionListProps {
  items: NeedsAttentionItem[]
  className?: string
}

const statusBadgeConfig = {
  action_needed: { 
    variant: "destructive" as const, 
    label: "Aktion erforderlich",
    className: "bg-red-50 text-red-700 border-red-200"
  },
  booking_made: { 
    variant: "default" as const, 
    label: "Termin gebucht",
    className: "bg-green-50 text-green-700 border-green-200"
  },
  completed: { 
    variant: "secondary" as const, 
    label: "Abgeschlossen",
    className: "bg-slate-50 text-slate-700 border-slate-200"
  },
  failed: { 
    variant: "destructive" as const, 
    label: "Fehlgeschlagen",
    className: "bg-red-50 text-red-700 border-red-200"
  }
}

export function NeedsAttentionList({ items, className }: NeedsAttentionListProps) {
  const displayItems = items.slice(0, 5) // Show max 5 items as per spec

  return (
    <Card className={cn(
      // Design System: card gradient background
      "bg-gradient-to-b from-white to-slate-50",
      // Design System: border and shadow  
      "border-slate-200 shadow-md rounded-2xl",
      className
    )}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2 text-slate-900">
          <Clock className="h-5 w-5 text-blue-600" />
          <span>Needs attention</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {displayItems.length > 0 ? (
          <>
            {/* Table/List */}
            <div className="space-y-2">
              {displayItems.map((item) => {
                const statusConfig = statusBadgeConfig[item.status]
                
                return (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border",
                      // Design System: row hover #F8FAFC
                      "hover:bg-slate-50 transition-colors cursor-pointer",
                      // Design System: row border #E2E8F0
                      "border-slate-200"
                    )}
                  >
                    <div className="flex-1 min-w-0 space-y-1">
                      {/* Caller name/number - Design System: body text #334155 */}
                      <p className="font-medium text-slate-700 truncate">
                        {item.caller}
                      </p>
                      
                      <div className="flex items-center space-x-3 text-sm">
                        {/* Category - Design System: muted text #64748B */}
                        <span className="text-slate-500 capitalize">
                          {item.category}
                        </span>
                        
                        {/* Time */}
                        <span className="text-slate-500">
                          {item.time}
                        </span>
                      </div>
                    </div>
                    
                    {/* Status badge */}
                    <Badge 
                      variant={statusConfig.variant}
                      className={cn(
                        "text-xs font-medium",
                        statusConfig.className
                      )}
                    >
                      {statusConfig.label}
                    </Badge>
                  </div>
                )
              })}
            </div>
            
            {/* See all CTA */}
            <div className="pt-2 border-t border-slate-200">
              <Button 
                asChild 
                variant="ghost" 
                className={cn(
                  "w-full justify-between text-slate-700 hover:text-slate-900",
                  // Design System: focus ring
                  "focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                )}
              >
                <Link href="/calls?status=action_needed">
                  <span>See all</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </>
        ) : (
          /* Empty state */
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">
              All caught up — no actions required.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 