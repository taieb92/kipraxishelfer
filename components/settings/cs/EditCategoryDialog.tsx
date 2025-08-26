"use client"

import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { AlertTriangle, Save, X } from "lucide-react"

interface Category {
  id: string
  name: string
  description: string
  isPredefined: boolean
}

interface EditCategoryDialogProps {
  isOpen: boolean
  category?: Category
  existingNames: string[]
  onClose: () => void
  onSave: (data: { name: string; description: string }) => Promise<void>
}

// Validation helper
const validateGermanText = (text: string): boolean => {
  // Allow alphanumeric + spaces + ßäöüÄÖÜ + - and /
  const pattern = /^[a-zA-Z0-9ßäöüÄÖÜ\s\-/]+$/
  return pattern.test(text)
}

export function EditCategoryDialog({ 
  isOpen, 
  category, 
  existingNames, 
  onClose, 
  onSave 
}: EditCategoryDialogProps) {
  const [form, setForm] = useState({
    name: "",
    description: ""
  })
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)

  const isEditing = !!category

  // Initialize form when dialog opens or category changes
  useEffect(() => {
    if (isOpen) {
      setForm({
        name: category?.name || "",
        description: category?.description || ""
      })
      setValidationErrors([])
    }
  }, [isOpen, category])

  const validateForm = () => {
    const errors: string[] = []
    const { name, description } = form

    // Name validation
    if (!name.trim()) {
      errors.push("Name ist erforderlich.")
    } else if (name.length < 2) {
      errors.push("Name muss mindestens 2 Zeichen lang sein.")
    } else if (name.length > 32) {
      errors.push("Name darf maximal 32 Zeichen lang sein.")
    } else if (!validateGermanText(name.trim())) {
      errors.push("Name darf nur Buchstaben, Zahlen, Leerzeichen sowie die Zeichen '-' und '/' enthalten.")
    }

    // Check for duplicates (case-insensitive, excluding current category if editing)
    const namesToCheck = isEditing 
      ? existingNames.filter(n => n.toLowerCase() !== category!.name.toLowerCase())
      : existingNames
    
    if (name.trim() && namesToCheck.some(n => n.toLowerCase() === name.trim().toLowerCase())) {
      errors.push("Ein Kategorie mit diesem Namen existiert bereits.")
    }

    // Description validation
    if (description.length > 140) {
      errors.push("Beschreibung darf maximal 140 Zeichen lang sein.")
    }

    return errors
  }

  const handleInputChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    // Clear validation errors on input change
    if (validationErrors.length > 0) {
      setValidationErrors([])
    }
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
        description: form.description.trim()
      })
      // onClose is called by parent component after successful save
    } catch (error) {
      console.error('Error saving category:', error)
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
        // Design System: dialog panel bg, border, radius, shadow
        "bg-white border-slate-200 rounded-2xl shadow-xl",
        "max-w-md"
      )}>
        <DialogHeader>
          <DialogTitle className="text-slate-900">
            {isEditing ? "Kategorie bearbeiten" : "Neue Kategorie erstellen"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="category-name" className="text-slate-900 font-medium">
              Name *
            </Label>
            <Input
              id="category-name"
              value={form.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="z.B. Terminanfragen"
              maxLength={32}
              className={cn(
                // Design System: focus ring
                "focus:ring-2 focus:ring-blue-400 focus:ring-offset-2",
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
            <Label htmlFor="category-description" className="text-slate-900 font-medium">
              Beschreibung
            </Label>
            <Textarea
              id="category-description"
              value={form.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Kurze Beschreibung der Kategorie..."
              maxLength={140}
              rows={3}
              className={cn(
                // Design System: focus ring
                "focus:ring-2 focus:ring-blue-400 focus:ring-offset-2",
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
                // Design System: focus ring
                "focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
              )}
            >
              <X className="h-4 w-4 mr-2" />
              Abbrechen
            </Button>
            
            <Button
              type="submit"
              disabled={isSaving || !form.name.trim()}
              className={cn(
                // Design System: medical gradient on primary actions
                "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800",
                "text-white shadow-md",
                // Design System: focus ring
                "focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
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