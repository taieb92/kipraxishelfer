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
    startISO: "2024-01-01",
    note: "Neujahr"
  },
  {
    id: "2", 
    startISO: "2024-12-24",
    endISO: "2024-12-26",
    note: "Weihnachtsferien"
  }
]

// Mock conflicts for demonstration
const mockConflicts = [
  {
    id: "c1",
    patientName: "Maria Schmidt",
    anonymized: false,
    startISO: "2024-12-24T09:30:00Z",
    endISO: "2024-12-24T10:00:00Z", 
    service: "Routineuntersuchung"
  },
  {
    id: "c2",
    patientName: undefined,
    anonymized: true,
    startISO: "2024-12-24T10:30:00Z",
    endISO: "2024-12-24T11:00:00Z",
    service: "Blutabnahme"
  }
]

// Mock API functions
const createHoliday = async (holidayData: { startISO: string; endISO?: string; note?: string }) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Mock conflict detection
  const hasConflicts = Math.random() > 0.6 // 40% chance of conflicts
  const conflictCount = hasConflicts ? Math.floor(Math.random() * 3) + 1 : 0
  
  return {
    holidayId: `holiday-${Date.now()}`,
    conflicts: hasConflicts ? mockConflicts.slice(0, conflictCount) : [],
    totalConflicts: conflictCount
  }
}

const createReschedulerJobs = async (options: any) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  return {
    ok: true,
    jobsCreated: options.appointmentIds.length
  }
}

const createAppointment = async (appointmentData: any) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  return {
    id: `appointment-${Date.now()}`
  }
}

export default function CalendarPage() {
  const { toast } = useToast()
  const [view, setView] = useState<"day" | "week">("week")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [settings, setSettings] = useState<CalendarSettings>(initialSettings)
  const [holidays, setHolidays] = useState(mockHolidays)
  const [appointments, setAppointments] = useState(mockAppointments)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  
  // Appointment creation from calendar click
  const [appointmentDialog, setAppointmentDialog] = useState<{
    isOpen: boolean
    initialDate?: Date
    initialTime?: string
  }>({
    isOpen: false
  })
  
  // Holiday impact dialog state
  const [impactDialog, setImpactDialog] = useState<{
    isOpen: boolean
    holidayTitle: string
    totalConflicts: number
    conflicts: any[]
  }>({
    isOpen: false,
    holidayTitle: "",
    totalConflicts: 0,
    conflicts: [],
  })

  // Mock Doctolib connection state
  const [isDoctolibConnected] = useState(true)

  const navigateDate = (direction: "prev" | "next") => {
    if (view === "day") {
      setCurrentDate(direction === "next" ? addDays(currentDate, 1) : subDays(currentDate, 1))
    } else {
      setCurrentDate(direction === "next" ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1))
    }
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setCurrentDate(date)
      setIsDatePickerOpen(false)
    }
  }

  const handleSettingsSave = (newSettings: CalendarSettings) => {
    setSettings(newSettings)
    toast({
      title: "Einstellungen gespeichert",
      description: "Die Kalendereinstellungen wurden erfolgreich aktualisiert.",
    })
  }

  // Holiday management
  const handleAddHoliday = useCallback(async (holidayData: { startISO: string; endISO?: string; note?: string }) => {
    try {
      const result = await createHoliday(holidayData)
      
      // Add holiday to list
      const newHoliday = {
        id: result.holidayId,
        startISO: holidayData.startISO,
        endISO: holidayData.endISO,
        note: holidayData.note
      }
      setHolidays(prev => [...prev, newHoliday])
      
      // Open impact dialog
      setImpactDialog({
        isOpen: true,
        holidayTitle: holidayData.note || "Neuer Feiertag",
        totalConflicts: result.totalConflicts,
        conflicts: result.conflicts,
      })
      
    } catch (error) {
      console.error('Error creating holiday:', error)
      toast({
        title: "Fehler",
        description: "Feiertag konnte nicht erstellt werden.",
        variant: "destructive"
      })
    }
  }, [toast])

  const handleEditHoliday = useCallback(async (id: string, holidayData: { startISO: string; endISO?: string; note?: string }) => {
    // In real app, this would call API
    setHolidays(prev => prev.map(h => h.id === id ? { ...h, ...holidayData } : h))
    
    toast({
      title: "Feiertag aktualisiert",
      description: "Die Änderungen wurden gespeichert.",
    })
  }, [toast])

  const handleDeleteHoliday = useCallback(async (id: string) => {
    // In real app, this would call DELETE API
    setHolidays(prev => prev.filter(h => h.id !== id))
    
    toast({
      title: "Feiertag gelöscht",
      description: "Der Feiertag wurde erfolgreich entfernt.",
    })
  }, [toast])

  const handleStartRescheduling = useCallback(async (options: any) => {
    try {
      const result = await createReschedulerJobs(options)
      
      setImpactDialog(prev => ({ ...prev, isOpen: false }))
      
      toast({
        title: "Umplanung gestartet",
        description: `${result.jobsCreated} Umplanungs-Aufgaben erstellt. Fortschritt unter 'Calls' einsehbar.`,
      })
      
    } catch (error) {
      console.error('Error starting rescheduling:', error)
      toast({
        title: "Fehler",
        description: "Umplanung konnte nicht gestartet werden.",
        variant: "destructive"
      })
    }
  }, [toast])

  const handleAddAppointment = useCallback(async (appointmentData: any) => {
    if (!FEATURE_FLAGS.CAL_APPOINTMENTS) return
    
    try {
      const result = await createAppointment(appointmentData)
      
      const newAppointment = {
        ...appointmentData,
        id: result.id,
        title: appointmentData.service || appointmentData.patientName || "Neuer Termin",
        source: "native" as const,
        practitioner: "Dr. Müller"
      }
      
      setAppointments(prev => [...prev, newAppointment])
      
      toast({
        title: "Termin erstellt",
        description: "Der neue Termin wurde dem Kalender hinzugefügt.",
      })
      
    } catch (error) {
      console.error('Error creating appointment:', error)
      toast({
        title: "Fehler",
        description: "Termin konnte nicht erstellt werden.",
        variant: "destructive"
      })
    }
  }, [toast])

  const handleAppointmentClick = (appointment: any) => {
    if (appointment.doctolibLink) {
      window.open(appointment.doctolibLink, "_blank")
    }
  }

  const handleTimeSlotClick = useCallback((date: Date, hour: number) => {
    const timeString = `${hour.toString().padStart(2, '0')}:00`
    setAppointmentDialog({
      isOpen: true,
      initialDate: date,
      initialTime: timeString
    })
  }, [])

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div
        className={cn(
          "transition-all duration-300 border-r bg-background",
          sidebarOpen ? "w-80" : "w-0 overflow-hidden",
        )}
      >
        <div className="p-4 space-y-4">
          <HoursEditor settings={settings} onSave={handleSettingsSave} />
          <HolidayList 
            holidays={holidays}
            onAddHoliday={handleAddHoliday}
            onEditHoliday={handleEditHoliday}
            onDeleteHoliday={handleDeleteHoliday}
          />
        </div>
      </div>

      {/* Main Calendar */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between p-4 border-b bg-background">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
            </Button>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => navigateDate("prev")}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => navigateDate("next")}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <CalendarIcon className="h-4 w-4" />
                  {format(currentDate, view === "day" ? "dd.MM.yyyy" : "'KW' w, yyyy", { locale: de })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={currentDate} onSelect={handleDateSelect} initialFocus locale={de} />
              </PopoverContent>
            </Popover>

            <Button variant="outline" onClick={goToToday}>
              <Today className="h-4 w-4 mr-1" />
              Heute
            </Button>

            {/* Sync indicator */}
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs",
                isDoctolibConnected 
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-red-50 text-red-700 border-red-200"
              )}
            >
              {isDoctolibConnected ? (
                <>
                  <Wifi className="h-3 w-3 mr-1" />
                  Sync aktiv
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 mr-1" />
                  Offline
                </>
              )}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {/* Appointment creation button */}
            {FEATURE_FLAGS.CAL_APPOINTMENTS && (
              <AppointmentButton 
                onAddAppointment={handleAddAppointment}
              />
            )}

            <Select value={view} onValueChange={(value: "day" | "week") => setView(value)}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Tag</SelectItem>
                <SelectItem value="week">Woche</SelectItem>
              </SelectContent>
            </Select>
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
        />
      </div>

      {/* Holiday Impact Dialog */}
      <HolidayImpactDialog
        isOpen={impactDialog.isOpen}
        onClose={() => setImpactDialog(prev => ({ ...prev, isOpen: false }))}
        onStartRescheduling={handleStartRescheduling}
        holidayTitle={impactDialog.holidayTitle}
        totalConflicts={impactDialog.totalConflicts}
        conflicts={impactDialog.conflicts}
      />

      {/* Calendar Click Appointment Dialog */}
      {appointmentDialog.isOpen && (
        <AppointmentButton 
          onAddAppointment={handleAddAppointment}
          initialDate={appointmentDialog.initialDate}
          initialTime={appointmentDialog.initialTime}
          autoOpen={true}
          onClose={() => setAppointmentDialog({ isOpen: false })}
        />
      )}
    </div>
  )
}
