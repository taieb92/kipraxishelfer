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
  const weekDates = getWeekDates(currentDate)

  if (view === "day") {
    return (
      <div className={cn("bg-white rounded-lg border border-slate-200 overflow-hidden", className)}>
        {/* Day Header */}
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">
            {format(currentDate, "EEEE, d. MMMM yyyy", { locale: de })}
          </h3>
        </div>

        {/* Time Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-[600px] sm:min-w-0">
            {timeSlots.map((time, hour) => {
              const slotAppointments = getAppointmentsForTimeSlot(currentDate, hour, appointments)
              const holiday = getHolidayForDate(currentDate, holidays)
              const isBusinessHour = hour >= 8 && hour <= 18
              
              return (
                <div 
                  key={hour}
                  className={cn(
                    "grid grid-cols-1 border-b border-slate-100 min-h-[60px] sm:min-h-[80px]",
                    "hover:bg-slate-50 transition-colors cursor-pointer",
                    holiday && "bg-red-50",
                    !isBusinessHour && "bg-slate-50"
                  )}
                  onClick={() => onTimeSlotClick?.(currentDate, hour)}
                >
                  {/* Time Label */}
                  <div className="flex items-center px-3 py-2 border-r border-slate-200 bg-slate-50">
                    <span className="text-sm font-medium text-slate-600 w-16 flex-shrink-0">
                      {time}
                    </span>
                  </div>

                  {/* Content Area */}
                  <div className="px-3 py-2 relative">
                    {holiday && (
                      <div className="absolute inset-0 bg-red-100 border-l-4 border-red-500 rounded-r-md flex items-center px-3">
                        <span className="text-sm font-medium text-red-800">
                          {holiday.note || "Feiertag"}
                        </span>
                      </div>
                    )}
                    
                    {slotAppointments.map((apt) => (
                      <div
                        key={apt.id}
                        className={cn(
                          "mb-2 p-2 rounded-md border cursor-pointer transition-all",
                          "hover:shadow-md hover:-translate-y-0.5",
                          apt.source === "doctolib" 
                            ? "bg-blue-50 border-blue-200 hover:bg-blue-100" 
                            : "bg-green-50 border-green-200 hover:bg-green-100"
                        )}
                        onClick={(e) => {
                          e.stopPropagation()
                          onAppointmentClick?.(apt)
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900 text-sm truncate">
                              {apt.title}
                            </p>
                            {apt.patientName && (
                              <p className="text-xs text-slate-600 truncate">
                                {apt.patientName}
                              </p>
                            )}
                            {apt.service && (
                              <p className="text-xs text-slate-500 truncate">
                                {apt.service}
                              </p>
                            )}
                          </div>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-xs flex-shrink-0",
                              apt.source === "doctolib" 
                                ? "bg-blue-100 text-blue-700 border-blue-200" 
                                : "bg-green-100 text-green-700 border-green-200"
                            )}
                          >
                            {apt.source === "doctolib" ? "Doctolib" : "Termin"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // Week view
  return (
    <div className={cn("bg-white rounded-lg border border-slate-200 overflow-hidden", className)}>
      {/* Week Header */}
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900">
          Woche {format(weekDates[0], "d.", { locale: de })} - {format(weekDates[6], "d. MMMM yyyy", { locale: de })}
        </h3>
      </div>

      {/* Week Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px] sm:min-w-0">
          {/* Day Headers */}
          <div className="grid grid-cols-8 border-b border-slate-200">
            <div className="p-3 bg-slate-50 border-r border-slate-200" />
            {weekDates.map((date, index) => {
              const holiday = getHolidayForDate(date, holidays)
              const isToday = isSameDay(date, new Date())
              
              return (
                <div 
                  key={index}
                  className={cn(
                    "p-3 text-center border-r border-slate-200",
                    holiday ? "bg-red-50" : "bg-slate-50",
                    isToday && "bg-blue-50 border-blue-200"
                  )}
                >
                  <div className="text-sm font-medium text-slate-900">
                    {weekDays[index]}
                  </div>
                  <div className={cn(
                    "text-lg font-bold mt-1",
                    holiday ? "text-red-700" : isToday ? "text-blue-700" : "text-slate-700"
                  )}>
                    {format(date, "d", { locale: de })}
                  </div>
                  {holiday && (
                    <div className="text-xs text-red-600 mt-1 truncate">
                      {holiday.note || "Feiertag"}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Time Slots */}
          {timeSlots.map((time, hour) => {
            const isBusinessHour = hour >= 8 && hour <= 18
            
            return (
              <div 
                key={hour}
                className={cn(
                  "grid grid-cols-8 border-b border-slate-100 min-h-[60px] sm:min-h-[80px]",
                  !isBusinessHour && "bg-slate-50"
                )}
              >
                {/* Time Label */}
                <div className="flex items-center px-3 py-2 border-r border-slate-200 bg-slate-50">
                  <span className="text-sm font-medium text-slate-600 w-16 flex-shrink-0">
                    {time}
                  </span>
                </div>

                {/* Day Columns */}
                {weekDates.map((date, dayIndex) => {
                  const slotAppointments = getAppointmentsForTimeSlot(date, hour, appointments)
                  const holiday = getHolidayForDate(date, holidays)
                  
                  return (
                    <div 
                      key={dayIndex}
                      className={cn(
                        "px-2 py-2 relative border-r border-slate-200",
                        "hover:bg-slate-50 transition-colors cursor-pointer",
                        holiday && "bg-red-50",
                        hour === 0 && "border-t-0"
                      )}
                      onClick={() => onTimeSlotClick?.(date, hour)}
                    >
                      {holiday && (
                        <div className="absolute inset-0 bg-red-100 opacity-50 pointer-events-none" />
                      )}
                      
                      {slotAppointments.map((apt) => (
                        <div
                          key={apt.id}
                          className={cn(
                            "mb-1 p-1 rounded border cursor-pointer transition-all text-xs",
                            "hover:shadow-sm hover:-translate-y-0.5",
                            apt.source === "doctolib" 
                              ? "bg-blue-50 border-blue-200 hover:bg-blue-100" 
                              : "bg-green-50 border-green-200 hover:bg-green-100"
                          )}
                          onClick={(e) => {
                            e.stopPropagation()
                            onAppointmentClick?.(apt)
                          }}
                        >
                          <p className="font-medium text-slate-900 truncate">
                            {apt.title}
                          </p>
                          {apt.patientName && (
                            <p className="text-slate-600 truncate">
                              {apt.patientName}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
} 