"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"

import type { CalendarSettings } from "@/lib/types"
import { Plus, Trash2, Edit } from "lucide-react"

interface HoursEditorProps {
  settings: CalendarSettings
  onSave: (settings: CalendarSettings) => void
}

const weekDayNames = {
  mon: "Montag",
  tue: "Dienstag",
  wed: "Mittwoch",
  thu: "Donnerstag",
  fri: "Freitag",
  sat: "Samstag",
  sun: "Sonntag",
}

export function HoursEditor({ settings, onSave }: HoursEditorProps) {
  const [editingDay, setEditingDay] = useState<keyof typeof weekDayNames | null>(null)
  const [tempHours, setTempHours] = useState<[string, string][]>([])
  const [isOpen, setIsOpen] = useState(false)

  const openEditor = (day: keyof typeof weekDayNames) => {
    setEditingDay(day)
    setTempHours([...settings.hours[day]])
    setIsOpen(true)
  }

  const addTimeRange = () => {
    setTempHours([...tempHours, ["09:00", "17:00"]])
  }

  const updateTimeRange = (index: number, field: "start" | "end", value: string) => {
    const updated = [...tempHours]
    updated[index] = field === "start" ? [value, updated[index][1]] : [updated[index][0], value]
    setTempHours(updated)
  }

  const removeTimeRange = (index: number) => {
    setTempHours(tempHours.filter((_, i) => i !== index))
  }

  const saveHours = () => {
    if (!editingDay) return

    const updatedSettings = {
      ...settings,
      hours: {
        ...settings.hours,
        [editingDay]: tempHours,
      },
    }

    onSave(updatedSettings)
    setIsOpen(false)
    setEditingDay(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Öffnungszeiten</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {Object.entries(weekDayNames).map(([key, name]) => {
          const dayKey = key as keyof typeof weekDayNames
          const hours = settings.hours[dayKey]

          return (
            <div key={key} className="flex items-center justify-between py-2 border-b last:border-b-0">
              <div className="flex-1">
                <div className="font-medium text-sm">{name}</div>
                <div className="text-xs text-muted-foreground">
                  {hours.length === 0 ? "Geschlossen" : hours.map((range, i) => `${range[0]}-${range[1]}`).join(", ")}
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => openEditor(dayKey)}>
                <Edit className="h-3 w-3" />
              </Button>
            </div>
          )
        })}

        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Öffnungszeiten bearbeiten - {editingDay && weekDayNames[editingDay]}</DrawerTitle>
            </DrawerHeader>
            <div className="p-6 space-y-4">
              {tempHours.map((range, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`start-${index}`} className="text-sm">
                      Von:
                    </Label>
                    <Input
                      id={`start-${index}`}
                      type="time"
                      value={range[0]}
                      onChange={(e) => updateTimeRange(index, "start", e.target.value)}
                      className="w-24"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`end-${index}`} className="text-sm">
                      Bis:
                    </Label>
                    <Input
                      id={`end-${index}`}
                      type="time"
                      value={range[1]}
                      onChange={(e) => updateTimeRange(index, "end", e.target.value)}
                      className="w-24"
                    />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeTimeRange(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <div className="flex gap-2">
                <Button variant="outline" onClick={addTimeRange}>
                  <Plus className="h-4 w-4 mr-1" />
                  Zeitraum hinzufügen
                </Button>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={saveHours}>Speichern</Button>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Abbrechen
                </Button>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </CardContent>
    </Card>
  )
}
