"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { de } from "date-fns/locale"

type PeriodType = "today" | "7d" | "30d" | "custom"

interface PeriodSelectorProps {
  value: PeriodType
  onChange: (period: PeriodType, customRange?: { from: Date; to: Date }) => void
}

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  const [customRange, setCustomRange] = useState<{ from: Date; to: Date } | undefined>()
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  const handlePeriodChange = (period: PeriodType) => {
    if (period === "custom") {
      setIsCalendarOpen(true)
    } else {
      onChange(period)
    }
  }

  const handleCustomRangeSelect = (range: { from: Date; to: Date } | undefined) => {
    if (range?.from && range?.to) {
      setCustomRange(range)
      onChange("custom", range)
      setIsCalendarOpen(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={value} onValueChange={handlePeriodChange}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Heute</SelectItem>
          <SelectItem value="7d">7 Tage</SelectItem>
          <SelectItem value="30d">30 Tage</SelectItem>
          <SelectItem value="custom">Benutzerdefiniert</SelectItem>
        </SelectContent>
      </Select>

      {value === "custom" && (
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn("justify-start text-left font-normal", !customRange && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {customRange?.from ? (
                customRange.to ? (
                  <>
                    {format(customRange.from, "dd.MM.yyyy", { locale: de })} -{" "}
                    {format(customRange.to, "dd.MM.yyyy", { locale: de })}
                  </>
                ) : (
                  format(customRange.from, "dd.MM.yyyy", { locale: de })
                )
              ) : (
                "Zeitraum wählen"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={customRange?.from}
              selected={customRange}
              onSelect={handleCustomRangeSelect}
              numberOfMonths={2}
              locale={de}
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}
