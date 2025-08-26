"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { AlertTriangle, Trash2 } from "lucide-react"

interface DeleteConfirmDialogProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  holidayTitle: string
  holidayDateRange: string
}

export function DeleteConfirmDialog({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  holidayTitle,
  holidayDateRange 
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className={cn(
        // Design System: dialog panel bg, border, radius, shadow
        "bg-white border-slate-200 rounded-2xl shadow-xl",
        "max-w-md"
      )}>
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="text-slate-900">Feiertag löschen</span>
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            Diese Aktion kann nicht rückgängig gemacht werden.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Holiday info */}
          <div className={cn(
            "p-4 rounded-lg border",
            // Design System: warning colors for deletion context
            "bg-red-50 border-red-200"
          )}>
            <div className="flex items-center space-x-2 mb-2">
              <Trash2 className="h-4 w-4 text-red-600" />
              <span className="font-medium text-red-900">
                {holidayTitle}
              </span>
            </div>
            <p className="text-sm text-red-700">
              {holidayDateRange}
            </p>
          </div>

          {/* Warning message */}
          <div className="space-y-2">
            <p className="text-sm text-slate-700">
              Wenn Sie diesen Feiertag löschen:
            </p>
            <ul className="text-sm text-slate-600 space-y-1 ml-4">
              <li className="flex items-start space-x-2">
                <span className="text-slate-400 mt-1">•</span>
                <span>Konflikte werden aus der Liste entfernt</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-slate-400 mt-1">•</span>
                <span>
                  <strong>KEINE</strong> automatischen Anrufe werden ausgelöst
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-slate-400 mt-1">•</span>
                <span>Bestehende Termine bleiben unverändert</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
          <Button
            variant="outline"
            onClick={onCancel}
            className={cn(
              // Design System: focus ring
              "focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            )}
          >
            Abbrechen
          </Button>
          
          <Button
            onClick={onConfirm}
            className={cn(
              // Design System: dangerous action colors
              "bg-red-600 hover:bg-red-700 text-white shadow-md",
              // Design System: focus ring
              "focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
            )}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Löschen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 