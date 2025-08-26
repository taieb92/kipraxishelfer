"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { CalendarIcon, ChevronDown } from "lucide-react"
import { format } from "date-fns"
import { de } from "date-fns/locale"

interface CycleSelectorProps {
  currentCycle: string
  from?: string | null
  to?: string | null
  onChange: (cycle: string, from?: string, to?: string) => void
}

export function CycleSelector({ currentCycle, from, to, onChange }: CycleSelectorProps) {
  const [isCustomOpen, setIsCustomOpen] = useState(false)
  const [customFrom, setCustomFrom] = useState<Date | undefined>(
    from ? new Date(from) : undefined
  )
  const [customTo, setCustomTo] = useState<Date | undefined>(
    to ? new Date(to) : undefined
  )

  const handleCycleChange = (value: string) => {
    if (value === 'custom') {
      setIsCustomOpen(true)
    } else {
      setIsCustomOpen(false)
      onChange(value)
    }
  }

  const handleCustomApply = () => {
    if (customFrom && customTo) {
      onChange(
        'custom',
        format(customFrom, 'yyyy-MM-dd'),
        format(customTo, 'yyyy-MM-dd')
      )
      setIsCustomOpen(false)
    }
  }

  const getCycleLabel = () => {
    if (currentCycle === 'current') return 'Aktueller Zyklus'
    if (currentCycle === 'last') return 'Letzter Zyklus'
    if (currentCycle === 'custom' && from && to) {
      try {
        const fromDate = new Date(from)
        const toDate = new Date(to)
        if (!isNaN(fromDate.getTime()) && !isNaN(toDate.getTime())) {
          return `${format(fromDate, 'dd.MM.yy', { locale: de })} - ${format(toDate, 'dd.MM.yy', { locale: de })}`
        }
      } catch (error) {
        console.warn('Date formatting failed in CycleSelector:', { from, to })
      }
      return `${from} - ${to}`
    }
    return 'Zeitraum wählen'
  }

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
      <Select value={currentCycle} onValueChange={handleCycleChange}>
        <SelectTrigger className={cn(
          "w-full sm:w-48",
          // Design System: focus ring
          "focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
        )}>
          <SelectValue placeholder="Zeitraum wählen">
            {getCycleLabel()}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="current">Aktueller Zyklus</SelectItem>
          <SelectItem value="last">Letzter Zyklus</SelectItem>
          <SelectItem value="custom">Benutzerdefiniert</SelectItem>
        </SelectContent>
      </Select>

      {/* Custom Date Range Popover */}
      <Popover open={isCustomOpen} onOpenChange={setIsCustomOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm"
            className={cn(
              "h-0 w-0 p-0 opacity-0 pointer-events-none",
              isCustomOpen && "opacity-100 pointer-events-auto"
            )}
          >
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-slate-900">Benutzerdefinierter Zeitraum</h4>
              <p className="text-sm text-slate-600">
                Wählen Sie Start- und Enddatum aus
              </p>
            </div>
            
            <div className="grid gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Von</label>
                <Calendar
                  mode="single"
                  selected={customFrom}
                  onSelect={setCustomFrom}
                  className="rounded-md border"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Bis</label>
                <Calendar
                  mode="single"
                  selected={customTo}
                  onSelect={setCustomTo}
                  className="rounded-md border"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                onClick={handleCustomApply}
                disabled={!customFrom || !customTo}
                className="flex-1 sm:flex-none"
              >
                Anwenden
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsCustomOpen(false)}
                className="flex-1 sm:flex-none"
              >
                Abbrechen
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
} 