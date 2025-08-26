"use client"

import React, { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { CalendarGrid } from "@/components/calendar/grid"
import { HoursEditor } from "@/components/calendar/hours-editor"
import { HolidayList } from "@/components/calendar/holiday-list"
import { HolidayImpactDialog } from "@/components/calendar/holiday-impact-dialog"
import { AppointmentButton } from "@/components/calendar/appointment-button"
import { useToast } from "@/hooks/use-toast"
import type { CalendarSettings } from "@/lib/types"
import { cn } from "@/lib/utils"
import { CalendarIcon, ChevronLeft, ChevronRight, Trophy as Today, PanelLeftClose, PanelLeft, Wifi, WifiOff } from "lucide-react"
import { format, addDays, subDays, addWeeks, subWeeks } from "date-fns"
import { de } from "date-fns/locale"

// Feature flags
const FEATURE_FLAGS = {
  CAL_DRAG_BLOCK: false, // Future: drag-to-block feature
  CAL_APPOINTMENTS: true, // Appointment creation button
}

// Mock data
const mockAppointments = [
  {
    id: "1",
    title: "Routineuntersuchung",
    start: "2024-01-15T09:30:00Z",
    end: "2024-01-15T10:00:00Z",
    patientName: "Maria Schmidt",
    service: "Allgemeinuntersuchung",
    practitioner: "Dr. Müller",
    source: "doctolib" as const,
    doctolibLink: "https://doctolib.de/appointment/123",
  },
  {
    id: "2",
    title: "Blutabnahme",
    start: "2024-01-15T10:30:00Z",
    end: "2024-01-15T11:00:00Z",
    patientName: "Hans Weber",
    service: "Laboruntersuchung",
    practitioner: "Dr. Müller",
    source: "doctolib" as const,
    doctolibLink: "https://doctolib.de/appointment/124",
  },
  {
    id: "3",
    title: "Nachkontrolle",
    start: "2024-01-16T14:00:00Z",
    end: "2024-01-16T14:30:00Z",
    patientName: "Anna Fischer",
    service: "Nachkontrolle",
    practitioner: "Dr. Müller",
    source: "native" as const,
  },
]

const initialSettings: CalendarSettings = {
  hours: {
    mon: [
      ["08:00", "12:00"],
      ["14:00", "17:00"],
    ],
    tue: [
      ["08:00", "12:00"],
      ["14:00", "17:00"],
    ],
    wed: [["08:00", "12:00"]],
    thu: [
      ["08:00", "12:00"],
      ["14:00", "17:00"],
    ],
    fri: [
      ["08:00", "12:00"],
      ["14:00", "16:00"],
    ],
    sat: [],
    sun: [],
  },
  holidays: [
    { start: "2024-01-01", note: "Neujahr" },
    { start: "2024-12-24", end: "2024-12-26", note: "Weihnachtsferien" },
  ],
}

// Holiday interface
interface Holiday {
  id: string
  startISO: string
  endISO?: string
  note?: string
}

// Mock holidays with proper structure
const mockHolidays: Holiday[] = [
  {
    id: "1",
    startISO: "2024-01-01T00:00:00Z",
    note: "Neujahr"
  },
  {
    id: "2",
    startISO: "2024-12-24T00:00:00Z",
    endISO: "2024-12-26T23:59:59Z",
    note: "Weihnachtsferien"
  },
  {
    id: "3",
    startISO: "2024-05-01T00:00:00Z",
    note: "Tag der Arbeit"
  },
  {
    id: "4",
    startISO: "2024-10-03T00:00:00Z",
    note: "Tag der Deutschen Einheit"
  }
]

export default function CalendarPage() {
  const { toast } = useToast()
  
  // State
  const [view, setView] = useState<"day" | "week">("week")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [appointments, setAppointments] = useState(mockAppointments)
  const [holidays, setHolidays] = useState<Holiday[]>(mockHolidays)
  const [settings, setSettings] = useState<CalendarSettings>(initialSettings)
  const [showHoursEditor, setShowHoursEditor] = useState(false)
  const [showHolidayList, setShowHolidayList] = useState(false)
  const [showAppointmentButton, setShowAppointmentButton] = useState(false)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ date: Date; hour: number } | null>(null)

  // Navigation functions
  const goToToday = useCallback(() => {
    setCurrentDate(new Date())
  }, [])

  const goToPrevious = useCallback(() => {
    setCurrentDate(prev => view === "day" ? subDays(prev, 1) : subWeeks(prev, 1))
  }, [view])

  const goToNext = useCallback(() => {
    setCurrentDate(prev => view === "day" ? addDays(prev, 1) : addWeeks(prev, 1))
  }, [view])

  // Handle time slot clicks for appointment creation
  const handleTimeSlotClick = useCallback((date: Date, hour: number) => {
    setSelectedTimeSlot({ date, hour })
    setShowAppointmentButton(true)
  }, [])

  // Handle appointment creation
  const handleAppointmentCreate = useCallback((appointment: any) => {
    setAppointments(prev => [...prev, appointment])
    setShowAppointmentButton(false)
    setSelectedTimeSlot(null)
    toast({
      title: "Termin erstellt",
      description: "Der Termin wurde erfolgreich hinzugefügt.",
    })
  }, [toast])

  // Handle appointment click
  const handleAppointmentClick = useCallback((appointment: any) => {
    // In a real app, this would open appointment details
    console.log("Appointment clicked:", appointment)
  }, [])

  // Handle holiday impact
  const handleHolidayImpact = useCallback((impact: any) => {
    console.log("Holiday impact:", impact)
    toast({
      title: "Feiertag hinzugefügt",
      description: "Der Feiertag wurde erfolgreich hinzugefügt.",
    })
  }, [toast])

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Kalender</h1>
            <p className="text-slate-600 mt-1">
              Terminplanung, Öffnungszeiten und Feiertage verwalten
            </p>
          </div>
          
          {/* Action buttons - Responsive */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHoursEditor(true)}
              className="w-full sm:w-auto"
            >
              <PanelLeft className="h-4 w-4 mr-2" />
              Öffnungszeiten
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHolidayList(true)}
              className="w-full sm:w-auto"
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              Feiertage
            </Button>
            
            {FEATURE_FLAGS.CAL_APPOINTMENTS && (
              <Button
                size="sm"
                onClick={() => setShowAppointmentButton(true)}
                className="w-full sm:w-auto"
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                Termin hinzufügen
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 bg-white rounded-lg border border-slate-200">
        {/* View Selector */}
        <div className="flex items-center gap-2">
          <Select value={view} onValueChange={(value: "day" | "week") => setView(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Tag</SelectItem>
              <SelectItem value="week">Woche</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrevious}
            className="p-2"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="flex items-center gap-2"
          >
            <Today className="h-4 w-4" />
            <span className="hidden sm:inline">Heute</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={goToNext}
            className="p-2"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Current Date Display */}
        <div className="text-center sm:text-right">
          <div className="text-lg font-semibold text-slate-900">
            {view === "day" 
              ? format(currentDate, "EEEE, d. MMMM yyyy", { locale: de })
              : `Woche ${format(currentDate, "d.", { locale: de })} - ${format(addDays(currentDate, 6), "d. MMMM yyyy", { locale: de })}`
            }
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <CalendarGrid
        view={view}
        currentDate={currentDate}
        appointments={appointments}
        holidays={holidays}
        onAppointmentClick={handleAppointmentClick}
        onTimeSlotClick={handleTimeSlotClick}
        className="min-h-[600px]"
      />

      {/* Modals and Dialogs */}
      {showHoursEditor && (
        <HoursEditor
          settings={settings}
          onSave={(newSettings) => {
            setSettings(newSettings)
            setShowHoursEditor(false)
            toast({
              title: "Öffnungszeiten gespeichert",
              description: "Die Öffnungszeiten wurden erfolgreich aktualisiert.",
            })
          }}
          onCancel={() => setShowHoursEditor(false)}
        />
      )}

      {showHolidayList && (
        <HolidayList
          holidays={holidays}
          onHolidayAdd={(holiday) => {
            setHolidays(prev => [...prev, { ...holiday, id: Date.now().toString() }])
            setShowHolidayList(false)
            toast({
              title: "Feiertag hinzugefügt",
              description: "Der Feiertag wurde erfolgreich hinzugefügt.",
            })
          }}
          onHolidayEdit={(holiday) => {
            setHolidays(prev => prev.map(h => h.id === holiday.id ? holiday : h))
            setShowHolidayList(false)
            toast({
              title: "Feiertag bearbeitet",
              description: "Der Feiertag wurde erfolgreich aktualisiert.",
            })
          }}
          onHolidayDelete={(holidayId) => {
            setHolidays(prev => prev.filter(h => h.id !== holidayId))
            setShowHolidayList(false)
            toast({
              title: "Feiertag gelöscht",
              description: "Der Feiertag wurde erfolgreich entfernt.",
            })
          }}
          onClose={() => setShowHolidayList(false)}
        />
      )}

      {showAppointmentButton && (
        <AppointmentButton
          onAppointmentCreate={handleAppointmentCreate}
          onCancel={() => {
            setShowAppointmentButton(false)
            setSelectedTimeSlot(null)
          }}
          autoOpen={true}
          prefillDate={selectedTimeSlot?.date}
          prefillHour={selectedTimeSlot?.hour}
        />
      )}
    </div>
  )
}
