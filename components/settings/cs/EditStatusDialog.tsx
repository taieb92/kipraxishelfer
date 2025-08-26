"use client"

import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { AlertTriangle, Save, X } from "lucide-react"

interface Status {
  id: string
  name: string
  description: string
  systemState: 'OPEN' | 'CLOSED'
  isPredefined: boolean
}

interface EditStatusDialogProps {
  isOpen: boolean
  status?: Status
  existingNames: string[]
  onClose: () => void
  onSave: (data: { name: string; description: string; systemState: 'OPEN' | 'CLOSED' }) => Promise<void>
}

const validateGermanText = (text: string): boolean => {
  // Allow German characters, spaces, numbers, and common punctuation
  const pattern = /^[a-zA-ZäöüÄÖÜß\s\d\-\/]+$/
  return pattern.test(text)
}

export function EditStatusDialog({ isOpen, status, existingNames, onClose, onSave }: EditStatusDialogProps) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    systemState: "OPEN" as "OPEN" | "CLOSED"
  })
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  
  const isEditing = !!status

  // Initialize form when dialog opens
  useEffect(() => {
    if (isOpen) {
      if (status) {
        setForm({
          name: status.name,
          description: status.description,
          systemState: status.systemState
        })
      } else {
        setForm({
          name: "",
          description: "",
          systemState: "OPEN"
        })
      }
      setValidationErrors([])
    }
  }, [isOpen, status])

  const validateForm = () => {
    const errors: string[] = []
    
    // Name validation
    if (!form.name.trim()) {
      errors.push("Name ist erforderlich.")
    } else if (form.name.length < 2) {
      errors.push("Name muss mindestens 2 Zeichen lang sein.")
    } else if (form.name.length > 32) {
      errors.push("Name darf maximal 32 Zeichen lang sein.")
    } else if (!validateGermanText(form.name)) {
      errors.push("Name darf nur Buchstaben, Zahlen, Leerzeichen, '-' und '/' enthalten.")
    }
    
    // Check for duplicates (case-insensitive, excluding current status)
    const existingNamesFiltered = isEditing 
      ? existingNames.filter(name => name.toLowerCase() !== status!.name.toLowerCase())
      : existingNames
    
    if (existingNamesFiltered.some(name => name.toLowerCase() === form.name.trim().toLowerCase())) {
      errors.push("Dieser Name wird bereits verwendet.")
    }
    
    // Description validation
    if (form.description.length > 140) {
      errors.push("Beschreibung darf maximal 140 Zeichen lang sein.")
    }
    
    return errors
  }

  const handleInputChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setValidationErrors([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const errors = validateForm()
    if (errors.length > 0) {
      setValidationErrors(errors)
      return
    }

    try {
      setIsSaving(true)
      await onSave({
        name: form.name.trim(),
        description: form.description.trim(),
        systemState: form.systemState
      })
    } catch (error) {
      console.error('Error saving status:', error)
      setValidationErrors(["Status konnte nicht gespeichert werden."])
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    if (!isSaving) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={cn(
        "bg-white border-slate-200 rounded-2xl shadow-xl",
        "max-w-md"
      )}>
        <DialogHeader>
          <DialogTitle className="text-slate-900">
            {isEditing ? "Status bearbeiten" : "Neuen Status erstellen"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="status-name" className="text-slate-900 font-medium">
              Name *
            </Label>
            <Input
              id="status-name"
              value={form.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="z.B. Rückruf erforderlich"
              maxLength={32}
              className={cn(
                "focus:ring-2 focus:ring-green-400 focus:ring-offset-2",
                validationErrors.some(e => e.includes("Name")) && "border-red-500"
              )}
              disabled={isSaving}
            />
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">
                Erlaubt: Buchstaben, Zahlen, Leerzeichen, "-", "/"
              </span>
              <span className="text-slate-500">
                {form.name.length}/32
              </span>
            </div>
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="status-description" className="text-slate-900 font-medium">
              Beschreibung
            </Label>
            <Textarea
              id="status-description"
              value={form.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Kurze Beschreibung des Status..."
              maxLength={140}
              rows={3}
              className={cn(
                "focus:ring-2 focus:ring-green-400 focus:ring-offset-2",
                validationErrors.some(e => e.includes("Beschreibung")) && "border-red-500"
              )}
              disabled={isSaving}
            />
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">
                Wird in Tooltips und Anruf-Details angezeigt
              </span>
              <span className="text-slate-500">
                {form.description.length}/140
              </span>
            </div>
          </div>

          {/* System State Field */}
          <div className="space-y-3">
            <Label className="text-slate-900 font-medium">
              Systemstatus *
            </Label>
            <RadioGroup 
              value={form.systemState} 
              onValueChange={(value) => handleInputChange("systemState", value)}
              className="flex gap-6"
              disabled={isSaving}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem 
                  value="OPEN" 
                  id="open"
                  className="focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
                />
                <Label htmlFor="open" className="text-slate-700 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span>OFFEN</span>
                    <span className="text-xs text-slate-500">
                      (Aktion erforderlich)
                    </span>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem 
                  value="CLOSED" 
                  id="closed"
                  className="focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
                />
                <Label htmlFor="closed" className="text-slate-700 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span>GESCHLOSSEN</span>
                    <span className="text-xs text-slate-500">
                      (Erledigt)
                    </span>
                  </div>
                </Label>
              </div>
            </RadioGroup>
            <p className="text-xs text-slate-500">
              Systemstatus bestimmt, ob der Status für KPIs als "offen" oder "geschlossen" zählt.
            </p>
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="space-y-2">
              {validationErrors.map((error, index) => (
                <Alert key={index} variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSaving}
              className={cn(
                "focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
              )}
            >
              <X className="h-4 w-4 mr-2" />
              Abbrechen
            </Button>
            
            <Button
              type="submit"
              disabled={isSaving || !form.name.trim()}
              className={cn(
                "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800",
                "text-white shadow-md",
                "focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
              )}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Speichern...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? "Aktualisieren" : "Erstellen"}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 