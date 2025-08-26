"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { format, addHours, startOfDay, isSameDay, parseISO, isWithinInterval } from "date-fns"
import { de } from "date-fns/locale"

interface Appointment {
  id: string
  title: string
  start: string
  end: string
  patientName?: string
  service?: string
  practitioner?: string
  source: "doctolib" | "native"
  doctolibLink?: string
}

interface Holiday {
  id: string
  startISO: string
  endISO?: string
  note?: string
}

interface CalendarGridProps {
  view: "day" | "week"
  currentDate: Date
  appointments: Appointment[]
  holidays: Holiday[]
  onAppointmentClick?: (appointment: Appointment) => void
  onTimeSlotClick?: (date: Date, hour: number) => void
  className?: string
}

const timeSlots = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0")
  return `${hour}:00`
})

const weekDays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]

function getWeekDates(date: Date): Date[] {
  const startOfWeek = new Date(date)
  const day = startOfWeek.getDay()
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
  startOfWeek.setDate(diff)

  return Array.from({ length: 7 }, (_, i) => {
    const weekDate = new Date(startOfWeek)
    weekDate.setDate(startOfWeek.getDate() + i)
    return weekDate
  })
}

function getHolidayForDate(date: Date, holidays: Holiday[]): Holiday | null {
  return holidays.find((holiday) => {
    const holidayStart = parseISO(holiday.startISO)
    const holidayEnd = holiday.endISO ? parseISO(holiday.endISO) : holidayStart

    return isWithinInterval(startOfDay(date), {
      start: startOfDay(holidayStart),
      end: startOfDay(holidayEnd)
    })
  }) || null
}

function getAppointmentsForTimeSlot(date: Date, hour: number, appointments: Appointment[]): Appointment[] {
  const slotStart = addHours(startOfDay(date), hour)
  const slotEnd = addHours(slotStart, 1)

  return appointments.filter((apt) => {
    // Fix: Check if start and end exist and are valid strings before parsing
    if (!apt.start || !apt.end) {
      console.warn('Appointment missing start or end time:', apt)
      return false
    }

    try {
      const aptStart = parseISO(apt.start)
      const aptEnd = parseISO(apt.end)

      return (
        (aptStart >= slotStart && aptStart < slotEnd) ||
        (aptEnd > slotStart && aptEnd <= slotEnd) ||
        (aptStart <= slotStart && aptEnd >= slotEnd)
      )
    } catch (error) {
      console.warn('Error parsing appointment dates:', apt, error)
      return false
    }
  })
}

export function CalendarGrid({ 
  view, 
  currentDate, 
  appointments, 
  holidays, 
  onAppointmentClick, 
  onTimeSlotClick,
  className 
}: CalendarGridProps) {
  const dates = view === "week" ? getWeekDates(currentDate) : [currentDate]

  const renderHolidayTooltip = (holiday: Holiday) => {
    const startDate = parseISO(holiday.startISO)
    const endDate = holiday.endISO ? parseISO(holiday.endISO) : startDate
    
    let dateRange = format(startDate, "dd.MM.yyyy", { locale: de })
    if (holiday.endISO && holiday.startISO !== holiday.endISO) {
      dateRange += ` - ${format(endDate, "dd.MM.yyyy", { locale: de })}`
    }

    return (
      <div className="space-y-1">
        <div className="font-medium">{holiday.note || "Feiertag"}</div>
        <div className="text-xs">{dateRange}</div>
      </div>
    )
  }

  const handleTimeSlotClick = (date: Date, hour: number, hasAppointments: boolean) => {
    // Only allow clicking on empty time slots
    if (!hasAppointments && onTimeSlotClick) {
      onTimeSlotClick(date, hour)
    }
  }

  return (
    <TooltipProvider>
      <div className={cn("flex-1 overflow-auto", className)}>
        <div className="min-w-full">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-background border-b">
            <div className="grid grid-cols-[60px_1fr] gap-0">
              <div className="border-r bg-muted/50" />
              <div className={cn("grid gap-0", view === "week" ? "grid-cols-7" : "grid-cols-1")}>
                {dates.map((date, i) => {
                  const holiday = getHolidayForDate(date, holidays)
                  const isToday = isSameDay(date, new Date())
                  
                  return (
                    <div
                      key={i}
                      className={cn(
                        "p-3 text-center border-r last:border-r-0",
                        isToday && "bg-blue-50",
                        holiday && "bg-amber-50 border-l-4 border-l-amber-400"
                      )}
                    >
                      <div className="text-xs text-muted-foreground">{weekDays[i]}</div>
                      <div className={cn(
                        "text-sm font-medium", 
                        isToday && "text-blue-600",
                        holiday && "text-amber-800"
                      )}>
                        {format(date, "dd.MM", { locale: de })}
                      </div>
                      
                      {holiday && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-xs mt-1 cursor-help",
                                // Design System: holiday warm palette
                                "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200"
                              )}
                            >
                              {holiday.note || "Feiertag"}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            {renderHolidayTooltip(holiday)}
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Time Grid */}
          <div className="grid grid-cols-[60px_1fr] gap-0">
            {/* Time Labels */}
            <div className="border-r">
              {timeSlots.map((time, i) => (
                <div key={time} className="h-16 border-b flex items-start justify-end pr-2 pt-1">
                  <span className="text-xs text-muted-foreground">{time}</span>
                </div>
              ))}
            </div>

            {/* Calendar Body */}
            <div className={cn("grid gap-0", view === "week" ? "grid-cols-7" : "grid-cols-1")}>
              {dates.map((date, dateIndex) => (
                <div key={dateIndex} className="border-r last:border-r-0">
                  {timeSlots.map((time, timeIndex) => {
                    const hour = Number.parseInt(time.split(":")[0])
                    const slotAppointments = getAppointmentsForTimeSlot(date, hour, appointments)
                    const holiday = getHolidayForDate(date, holidays)
                    const hasAppointments = slotAppointments.length > 0
                    const isPastTime = new Date(date) < new Date() && hour < new Date().getHours()

                    return (
                      <div
                        key={`${dateIndex}-${timeIndex}`}
                        className={cn(
                          "h-16 border-b relative transition-colors group",
                          // Design System: blocked grid ranges with subtle warm tint
                          holiday && [
                            "bg-amber-50/30",
                            "border-l-2 border-l-amber-300/50"
                          ],
                          // Click to add functionality
                          !hasAppointments && !holiday && !isPastTime && [
                            "hover:bg-blue-50/50 cursor-pointer",
                            "group-hover:after:content-['+'] group-hover:after:absolute group-hover:after:inset-0",
                            "group-hover:after:flex group-hover:after:items-center group-hover:after:justify-center",
                            "group-hover:after:text-blue-600 group-hover:after:text-xl group-hover:after:font-bold"
                          ],
                          hasAppointments && "hover:bg-muted/30",
                          isPastTime && "bg-slate-50 opacity-60"
                        )}
                        onClick={() => handleTimeSlotClick(date, hour, hasAppointments)}
                        title={!hasAppointments && !holiday && !isPastTime ? "Klicken Sie hier, um einen Termin hinzuzufügen" : undefined}
                      >
                        {/* Holiday overlay tooltip */}
                        {holiday && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="absolute inset-0 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              {renderHolidayTooltip(holiday)}
                            </TooltipContent>
                          </Tooltip>
                        )}

                        {/* Appointments */}
                        {slotAppointments.map((appointment, aptIndex) => {
                          // Parse dates safely
                          let startTime = ""
                          let endTime = ""
                          try {
                            startTime = format(parseISO(appointment.start), "HH:mm", { locale: de })
                            endTime = format(parseISO(appointment.end), "HH:mm", { locale: de })
                          } catch (error) {
                            console.warn('Error formatting appointment time:', appointment, error)
                            startTime = "??"
                            endTime = "??"
                          }

                          return (
                            <Tooltip key={appointment.id}>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className={cn(
                                    "absolute inset-x-1 h-14 p-2 text-left justify-start border z-10",
                                    appointment.source === "doctolib" && [
                                      "bg-blue-100 hover:bg-blue-200 border-blue-200",
                                      "text-blue-800"
                                    ],
                                    appointment.source === "native" && [
                                      "bg-green-100 hover:bg-green-200 border-green-200", 
                                      "text-green-800"
                                    ],
                                    // Adjust for holiday overlay
                                    holiday && "opacity-90"
                                  )}
                                  style={{
                                    top: `${aptIndex * 2}px`,
                                    zIndex: 10 + aptIndex,
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onAppointmentClick?.(appointment)
                                  }}
                                >
                                  <div className="min-w-0 flex-1">
                                    <div className="text-xs font-medium truncate">
                                      {appointment.patientName || appointment.title}
                                    </div>
                                    <div className="text-xs truncate opacity-80">
                                      {startTime} - {endTime}
                                    </div>
                                  </div>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="space-y-1">
                                  <div className="font-medium">{appointment.patientName || appointment.title}</div>
                                  <div className="text-xs">
                                    {startTime} - {endTime}
                                  </div>
                                  {appointment.service && <div className="text-xs">Notizen: {appointment.service}</div>}
                                  {appointment.practitioner && (
                                    <div className="text-xs">Arzt: {appointment.practitioner}</div>
                                  )}
                                  <Badge 
                                    variant="outline" 
                                    className={cn(
                                      "text-xs",
                                      appointment.source === "doctolib" 
                                        ? "bg-blue-50 text-blue-700 border-blue-200"
                                        : "bg-green-50 text-green-700 border-green-200"
                                    )}
                                  >
                                    {appointment.source === "doctolib" ? "Doctolib" : "Nativ"}
                                  </Badge>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
} 