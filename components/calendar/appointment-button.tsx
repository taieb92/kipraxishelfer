"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Plus, Calendar } from "lucide-react"
import { format, addDays } from "date-fns"

interface AppointmentButtonProps {
  onAddAppointment: (appointment: {
    start: string
    end: string
    patientName?: string
    service?: string
  }) => void
  initialDate?: Date
  initialTime?: string
  autoOpen?: boolean
  onClose?: () => void
  className?: string
}

interface AppointmentForm {
  date: string
  startTime: string
  endTime: string
  patientName: string
  service: string
}

export function AppointmentButton({ 
  onAddAppointment,
  initialDate,
  initialTime,
  autoOpen = false,
  onClose,
  className 
}: AppointmentButtonProps) {
  const [isOpen, setIsOpen] = useState(autoOpen)
  const [form, setForm] = useState<AppointmentForm>({
    date: format(initialDate || addDays(new Date(), 1), 'yyyy-MM-dd'),
    startTime: initialTime || "10:00",
    endTime: initialTime ? format(new Date(`2000-01-01T${initialTime}:00`), 'HH:mm') : "10:30",
    patientName: "",
    service: ""
  })

  // Update form when props change
  React.useEffect(() => {
    if (initialDate) {
      setForm(prev => ({ 
        ...prev, 
        date: format(initialDate, 'yyyy-MM-dd')
      }))
    }
    if (initialTime) {
      const endTime = new Date(`2000-01-01T${initialTime}:00`)
      endTime.setMinutes(endTime.getMinutes() + 30) // Default 30 min duration
      setForm(prev => ({ 
        ...prev, 
        startTime: initialTime,
        endTime: format(endTime, 'HH:mm')
      }))
    }
  }, [initialDate, initialTime])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Create proper ISO date strings
    const startDateTime = new Date(`${form.date}T${form.startTime}:00`)
    const endDateTime = new Date(`${form.date}T${form.endTime}:00`)
    
    onAddAppointment({
      start: startDateTime.toISOString(),
      end: endDateTime.toISOString(),
      patientName: form.patientName || undefined,
      service: form.service || undefined
    })
    
    setIsOpen(false)
    onClose?.()
    
    // Reset form for next use
    setForm(prev => ({
      ...prev,
      patientName: "",
      service: ""
    }))
  }

  return (
    <>
      {!autoOpen && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className={cn(
            "text-slate-600 hover:text-slate-900",
            // Design System: focus ring
            "focus:ring-2 focus:ring-blue-400 focus:ring-offset-2",
            className
          )}
        >
          <Plus className="h-4 w-4 mr-2" />
          Termin hinzufügen
        </Button>
      )}

      <Dialog open={isOpen} onOpenChange={(open) => { 
        setIsOpen(open)
        if (!open) onClose?.()
      }}>
        <DialogContent className={cn(
          // Design System: dialog panel bg, border, radius, shadow
          "bg-white border-slate-200 rounded-2xl shadow-xl",
          "max-w-md"
        )}>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span className="text-slate-900">Neuen Termin erstellen</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="appointment-date" className="text-slate-900 font-medium">
                Datum
              </Label>
              <Input
                id="appointment-date"
                type="date"
                value={form.date}
                onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
                className={cn(
                  // Design System: focus ring
                  "focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                )}
                required
              />
            </div>

            {/* Time range */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="appointment-start-time" className="text-slate-900 font-medium">
                  Von
                </Label>
                <Input
                  id="appointment-start-time"
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm(prev => ({ ...prev, startTime: e.target.value }))}
                  className={cn(
                    // Design System: focus ring
                    "focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                  )}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="appointment-end-time" className="text-slate-900 font-medium">
                  Bis
                </Label>
                <Input
                  id="appointment-end-time"
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm(prev => ({ ...prev, endTime: e.target.value }))}
                  className={cn(
                    // Design System: focus ring
                    "focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                  )}
                  required
                />
              </div>
            </div>

            {/* Patient name */}
            <div className="space-y-2">
              <Label htmlFor="appointment-patient" className="text-slate-900 font-medium">
                Patient
              </Label>
              <Input
                id="appointment-patient"
                value={form.patientName}
                onChange={(e) => setForm(prev => ({ ...prev, patientName: e.target.value }))}
                placeholder="Name des Patienten"
                className={cn(
                  // Design System: focus ring
                  "focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                )}
              />
            </div>

            {/* Notes (changed from Leistung to Notizen) */}
            <div className="space-y-2">
              <Label htmlFor="appointment-notes" className="text-slate-900 font-medium">
                Notizen
              </Label>
              <Input
                id="appointment-notes"
                value={form.service}
                onChange={(e) => setForm(prev => ({ ...prev, service: e.target.value }))}
                placeholder="Behandlungsart, Notizen, etc."
                className={cn(
                  // Design System: focus ring
                  "focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                )}
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                              <Button
                  type="button"
                  variant="outline"
                  onClick={() => { 
                    setIsOpen(false)
                    onClose?.()
                  }}
                  className={cn(
                    // Design System: focus ring
                    "focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                  )}
                >
                  Abbrechen
                </Button>
              
              <Button
                type="submit"
                className={cn(
                  // Design System: medical gradient on primary actions
                  "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800",
                  "text-white shadow-md",
                  // Design System: focus ring
                  "focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                )}
              >
                <Plus className="h-4 w-4 mr-2" />
                Erstellen
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
} 