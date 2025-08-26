"use client"

import React from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown } from "lucide-react"

interface KpiCardProps {
  title: string
  value: string | number
  trend?: {
    deltaPct?: number
    up?: boolean
  }
  icon?: React.ReactNode
  href?: string
  ariaLabel?: string
  className?: string
}

export function KpiCard({
  title,
  value,
  trend,
  icon,
  href,
  ariaLabel,
  className,
}: KpiCardProps) {
  const cardContent = (
    <Card
      className={cn(
        // Design System: card gradient background
        "bg-gradient-to-b from-white to-slate-50",
        // Design System: border and shadow
        "border-slate-200 shadow-md",
        // Design System: radius
        "rounded-2xl",
        // Hover state for clickable cards
        href && "transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5",
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          {/* Design System: icon container - #E0F2FE bg, #BAE6FD border, #2563EB fill */}
          {icon && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 border border-sky-200">
              <div className="text-blue-600 [&>svg]:h-4 [&>svg]:w-4">
                {icon}
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Design System: title text #334155 */}
        <p className="text-sm font-medium text-slate-700">{title}</p>
        
        {/* Design System: value text #0F172A */}
        <div className="flex items-baseline space-x-2">
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          
          {/* Trend indicator */}
          {trend && trend.deltaPct !== undefined && (
            <div className="flex items-center space-x-1">
              {trend.up ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span 
                className={cn(
                  "text-xs font-medium",
                  trend.up ? "text-green-600" : "text-red-600"
                )}
              >
                {trend.up ? "+" : ""}{trend.deltaPct}%
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  // If href provided, wrap in Link
  if (href) {
    return (
      <Link 
        href={href}
        aria-label={ariaLabel || `View details for ${title}`}
        className={cn(
          "block",
          // Design System: focus ring #60A5FA, 2px, with offset
          "focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 rounded-2xl"
        )}
      >
        {cardContent}
      </Link>
    )
  }

  return cardContent
}
