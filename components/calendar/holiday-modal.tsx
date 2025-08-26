"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Calendar, AlertCircle } from "lucide-react"

interface HolidayModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { startISO: string; endISO?: string; note?: string }) => void
  initialData?: {
    startISO?: string
    endISO?: string
    note?: string
  }
  mode: 'add' | 'edit'
}

interface FormData {
  startDate: string
  endDate: string
  note: string
}

interface FormErrors {
  startDate?: string
  endDate?: string
}

export function HolidayModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData,
  mode 
}: HolidayModalProps) {
  const [form, setForm] = useState<FormData>({
    startDate: "",
    endDate: "",
    note: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen) {
      setForm({
        startDate: initialData?.startISO?.split('T')[0] || "",
        endDate: initialData?.endISO?.split('T')[0] || "",
        note: initialData?.note || "",
      })
      setErrors({})
      setIsSubmitting(false)
    }
  }, [isOpen, initialData])

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!form.startDate) {
      newErrors.startDate = "Startdatum ist erforderlich"
    }

    if (form.endDate && form.endDate < form.startDate) {
      newErrors.endDate = "Enddatum muss nach dem Startdatum liegen"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const submitData = {
        startISO: form.startDate,
        endISO: form.endDate || undefined,
        note: form.note || undefined,
      }

      await onSubmit(submitData)
    } catch (error) {
      console.error('Error submitting holiday:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  const handleFormChange = (field: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    
    // Clear related errors
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
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
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span className="text-slate-900">
              {mode === 'edit' ? 'Feiertag bearbeiten' : 'Feiertag hinzufügen'}
            </span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Start Date */}
          <div className="space-y-2">
            <Label htmlFor="start-date" className="text-slate-900 font-medium">
              Startdatum *
            </Label>
            <Input
              id="start-date"
              type="date"
              value={form.startDate}
              onChange={(e) => handleFormChange('startDate', e.target.value)}
              className={cn(
                // Design System: focus ring
                "focus:ring-2 focus:ring-blue-400 focus:ring-offset-2",
                errors.startDate && "border-red-500 focus:ring-red-400"
              )}
              disabled={isSubmitting}
              required
            />
            {errors.startDate && (
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{errors.startDate}</span>
              </div>
            )}
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <Label htmlFor="end-date" className="text-slate-900 font-medium">
              Enddatum (optional)
            </Label>
            <Input
              id="end-date"
              type="date"
              value={form.endDate}
              onChange={(e) => handleFormChange('endDate', e.target.value)}
              className={cn(
                // Design System: focus ring
                "focus:ring-2 focus:ring-blue-400 focus:ring-offset-2",
                errors.endDate && "border-red-500 focus:ring-red-400"
              )}
              disabled={isSubmitting}
              min={form.startDate}
            />
            {errors.endDate && (
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{errors.endDate}</span>
              </div>
            )}
            <p className="text-xs text-slate-500">
              Lassen Sie dieses Feld leer für einen eintägigen Feiertag
            </p>
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="note" className="text-slate-900 font-medium">
              Notiz (optional)
            </Label>
            <Textarea
              id="note"
              placeholder="z.B. Weihnachtsferien, Praxisurlaub, Fortbildung..."
              value={form.note}
              onChange={(e) => handleFormChange('note', e.target.value)}
              className={cn(
                // Design System: focus ring
                "focus:ring-2 focus:ring-blue-400 focus:ring-offset-2",
                "resize-none"
              )}
              disabled={isSubmitting}
              rows={3}
              maxLength={200}
            />
            <p className="text-xs text-slate-500">
              {form.note.length}/200 Zeichen
            </p>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className={cn(
                // Design System: focus ring
                "focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
              )}
            >
              Abbrechen
            </Button>
            
            <Button
              type="submit"
              disabled={!form.startDate || isSubmitting}
              className={cn(
                // Design System: medical gradient on primary actions
                "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800",
                "text-white shadow-md",
                // Design System: focus ring
                "focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
              )}
            >
              {isSubmitting ? 'Wird gespeichert...' : (mode === 'edit' ? 'Aktualisieren' : 'Hinzufügen')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 