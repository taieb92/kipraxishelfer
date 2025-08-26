"use client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { format, addHours, startOfDay, isSameDay, parseISO } from "date-fns"
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
  start: string
  end?: string
  note?: string
}

interface CalendarGridProps {
  view: "day" | "week"
  currentDate: Date
  appointments: Appointment[]
  holidays: Holiday[]
  onAppointmentClick?: (appointment: Appointment) => void
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

function isHoliday(date: Date, holidays: Holiday[]): Holiday | null {
  return (
    holidays.find((holiday) => {
      const holidayStart = parseISO(holiday.start)
      const holidayEnd = holiday.end ? parseISO(holiday.end) : holidayStart

      return date >= startOfDay(holidayStart) && date <= startOfDay(holidayEnd)
    }) || null
  )
}

function getAppointmentsForTimeSlot(date: Date, hour: number, appointments: Appointment[]): Appointment[] {
  const slotStart = addHours(startOfDay(date), hour)
  const slotEnd = addHours(slotStart, 1)

  return appointments.filter((apt) => {
    const aptStart = parseISO(apt.start)
    const aptEnd = parseISO(apt.end)

    return (
      (aptStart >= slotStart && aptStart < slotEnd) ||
      (aptEnd > slotStart && aptEnd <= slotEnd) ||
      (aptStart <= slotStart && aptEnd >= slotEnd)
    )
  })
}

export function CalendarGrid({ view, currentDate, appointments, holidays, onAppointmentClick }: CalendarGridProps) {
  const dates = view === "week" ? getWeekDates(currentDate) : [currentDate]

  return (
    <div className="flex-1 overflow-auto">
      <div className="min-w-full">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background border-b">
          <div className="grid grid-cols-[60px_1fr] gap-0">
            <div className="border-r bg-muted/50" />
            <div className={cn("grid gap-0", view === "week" ? "grid-cols-7" : "grid-cols-1")}>
              {dates.map((date, i) => {
                const holiday = isHoliday(date, holidays)
                return (
                  <div
                    key={i}
                    className={cn(
                      "p-3 text-center border-r last:border-r-0",
                      isSameDay(date, new Date()) && "bg-blue-50",
                      holiday && "bg-yellow-50",
                    )}
                  >
                    <div className="text-xs text-muted-foreground">{weekDays[i]}</div>
                    <div className={cn("text-sm font-medium", isSameDay(date, new Date()) && "text-blue-600")}>
                      {format(date, "dd.MM", { locale: de })}
                    </div>
                    {holiday && (
                      <Badge variant="outline" className="text-xs mt-1 bg-yellow-100 text-yellow-800">
                        Feiertag
                      </Badge>
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
                  const holiday = isHoliday(date, holidays)

                  return (
                    <div
                      key={`${dateIndex}-${timeIndex}`}
                      className={cn(
                        "h-16 border-b relative hover:bg-muted/30 transition-colors",
                        holiday && "bg-yellow-50/50",
                      )}
                    >
                      {slotAppointments.map((appointment, aptIndex) => (
                        <TooltipProvider key={appointment.id}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                className={cn(
                                  "absolute inset-x-1 h-14 p-2 text-left justify-start bg-blue-100 hover:bg-blue-200 border border-blue-200",
                                  appointment.source === "native" && "bg-green-100 hover:bg-green-200 border-green-200",
                                )}
                                style={{
                                  top: `${aptIndex * 2}px`,
                                  zIndex: 10 + aptIndex,
                                }}
                                onClick={() => onAppointmentClick?.(appointment)}
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs font-medium truncate text-blue-800">
                                    {appointment.patientName || appointment.title}
                                  </div>
                                  <div className="text-xs text-blue-600 truncate">
                                    {format(parseISO(appointment.start), "HH:mm", { locale: de })} -{" "}
                                    {format(parseISO(appointment.end), "HH:mm", { locale: de })}
                                  </div>
                                </div>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="space-y-1">
                                <div className="font-medium">{appointment.patientName || appointment.title}</div>
                                <div className="text-xs">
                                  {format(parseISO(appointment.start), "HH:mm", { locale: de })} -{" "}
                                  {format(parseISO(appointment.end), "HH:mm", { locale: de })}
                                </div>
                                {appointment.service && <div className="text-xs">Service: {appointment.service}</div>}
                                {appointment.practitioner && (
                                  <div className="text-xs">Arzt: {appointment.practitioner}</div>
                                )}
                                <Badge variant="outline" className="text-xs">
                                  {appointment.source === "doctolib" ? "Doctolib" : "Nativ"}
                                </Badge>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
