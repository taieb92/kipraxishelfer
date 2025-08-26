"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { CalendarIcon, ChevronDown } from "lucide-react"
import { format } from "date-fns"
import { de } from "date-fns/locale"

export type DateRange = "today" | "7d" | "30d" | "custom"

interface DateRangeFilterProps {
  value: DateRange
  customRange?: { from: Date; to: Date }
  onChange: (range: DateRange, customRange?: { from: Date; to: Date }) => void
  className?: string
}

const PRESET_OPTIONS = [
  { value: "today" as const, label: "Heute" },
  { value: "7d" as const, label: "Letzte 7 Tage" },
  { value: "30d" as const, label: "Letzte 30 Tage" },
  { value: "custom" as const, label: "Benutzerdefiniert" },
]

export function DateRangeFilter({ 
  value, 
  customRange, 
  onChange, 
  className 
}: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [customDateRange, setCustomDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: customRange?.from,
    to: customRange?.to
  })

  const currentOption = PRESET_OPTIONS.find(option => option.value === value)

  const handlePresetChange = (newRange: DateRange) => {
    if (newRange !== "custom") {
      onChange(newRange)
      setIsOpen(false)
    }
  }

  const handleCustomRangeChange = (range: any) => {
    setCustomDateRange(range || { from: undefined, to: undefined })
    
    if (range?.from && range?.to) {
      onChange("custom", {
        from: range.from,
        to: range.to
      })
      setIsOpen(false)
    }
  }

  const getDisplayText = () => {
    if (value === "custom" && customRange) {
      return `${format(customRange.from, "d. MMM", { locale: de })} - ${format(customRange.to, "d. MMM", { locale: de })}`
    }
    return currentOption?.label || "Zeitraum auswählen"
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-between min-w-[200px]",
            // Design System: focus ring
            "focus:ring-2 focus:ring-blue-400 focus:ring-offset-2",
            className
          )}
          aria-label="Zeitraum auswählen"
        >
          <span className="flex items-center space-x-2">
            <CalendarIcon className="h-4 w-4 text-slate-500" />
            <span className="text-slate-700">{getDisplayText()}</span>
          </span>
          <ChevronDown className="h-4 w-4 text-slate-500" />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-auto p-0 bg-white border-slate-200 shadow-lg" 
        align="end"
      >
        <Card className="border-0 shadow-none">
          <CardContent className="p-4 space-y-4">
            {/* Preset options */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-slate-900">Schnellauswahl</h4>
              <div className="space-y-1">
                {PRESET_OPTIONS.slice(0, 3).map((option) => (
                  <Button
                    key={option.value}
                    variant={value === option.value ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start text-sm",
                      value === option.value 
                        ? "bg-blue-600 text-white" 
                        : "text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                    )}
                    onClick={() => handlePresetChange(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom date range */}
            <div className="space-y-2 border-t border-slate-200 pt-4">
              <h4 className="text-sm font-medium text-slate-900">Benutzerdefiniert</h4>
              <Calendar
                mode="range"
                selected={{
                  from: customDateRange.from,
                  to: customDateRange.to
                }}
                onSelect={handleCustomRangeChange}
                numberOfMonths={2}
                locale={de}
                className="rounded-md border border-slate-200"
              />
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
} 