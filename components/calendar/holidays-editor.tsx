"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

import type { CalendarSettings } from "@/lib/types"
import { Plus, Trash2, CalendarIcon } from "lucide-react"
import { format, parseISO } from "date-fns"
import { de } from "date-fns/locale"

interface HolidaysEditorProps {
  settings: CalendarSettings
  onSave: (settings: CalendarSettings) => void
  onHolidayConflict?: (conflictCount: number, holidayNote: string) => void
}

interface HolidayForm {
  start: string
  end: string
  note: string
}

export function HolidaysEditor({ settings, onSave, onHolidayConflict }: HolidaysEditorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [form, setForm] = useState<HolidayForm>({
    start: "",
    end: "",
    note: "",
  })

  const resetForm = () => {
    setForm({ start: "", end: "", note: "" })
  }

  const addHoliday = () => {
    if (!form.start) return

    const newHoliday = {
      start: form.start,
      end: form.end || undefined,
      note: form.note || undefined,
    }

    // Mock conflict detection - in real app this would check against actual appointments
    const mockConflictCount = Math.random() > 0.7 ? Math.floor(Math.random() * 5) + 1 : 0

    const updatedSettings = {
      ...settings,
      holidays: [...settings.holidays, newHoliday],
    }

    onSave(updatedSettings)

    if (mockConflictCount > 0 && onHolidayConflict) {
      onHolidayConflict(mockConflictCount, form.note || "Neuer Feiertag")
    }

    resetForm()
    setIsOpen(false)
  }

  const removeHoliday = (index: number) => {
    const updatedSettings = {
      ...settings,
      holidays: settings.holidays.filter((_, i) => i !== index),
    }
    onSave(updatedSettings)
  }

  const formatHolidayDate = (holiday: { start: string; end?: string }) => {
    const startDate = parseISO(holiday.start)
    if (holiday.end) {
      const endDate = parseISO(holiday.end)
      return `${format(startDate, "dd.MM.yyyy", { locale: de })} - ${format(endDate, "dd.MM.yyyy", { locale: de })}`
    }
    return format(startDate, "dd.MM.yyyy", { locale: de })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Feiertage & Schließungen</span>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Hinzufügen
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Feiertag hinzufügen</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Startdatum</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={form.start}
                    onChange={(e) => setForm({ ...form, start: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">Enddatum (optional)</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={form.end}
                    onChange={(e) => setForm({ ...form, end: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="note">Notiz (optional)</Label>
                  <Textarea
                    id="note"
                    placeholder="z.B. Weihnachtsferien, Praxisurlaub..."
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={addHoliday} disabled={!form.start}>
                    Hinzufügen
                  </Button>
                  <Button variant="outline" onClick={() => setIsOpen(false)}>
                    Abbrechen
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {settings.holidays.length === 0 ? (
          <p className="text-sm text-muted-foreground">Keine Feiertage eingetragen</p>
        ) : (
          <div className="space-y-3">
            {settings.holidays.map((holiday, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm font-medium">{formatHolidayDate(holiday)}</span>
                  </div>
                  {holiday.note && <p className="text-xs text-muted-foreground mt-1">{holiday.note}</p>}
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeHoliday(index)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
