"use client"

import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { AlertTriangle, Trash2, X } from "lucide-react"

interface DeleteConfirmDialogProps {
  isOpen: boolean
  title: string
  description: string
  onClose: () => void
  onConfirm: () => Promise<void> | void
}

export function DeleteConfirmDialog({ 
  isOpen, 
  title, 
  description, 
  onClose, 
  onConfirm 
}: DeleteConfirmDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirm = async () => {
    try {
      setIsDeleting(true)
      await onConfirm()
      // onClose is called by parent component after successful deletion
    } catch (error) {
      console.error('Error during deletion:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleClose = () => {
    if (!isDeleting) {
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
          <DialogTitle className="flex items-center gap-3 text-slate-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 border border-red-200">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {description}
            </AlertDescription>
          </Alert>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isDeleting}
              className={cn(
                // Design System: focus ring
                "focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
              )}
            >
              <X className="h-4 w-4 mr-2" />
              Abbrechen
            </Button>
            
            <Button
              onClick={handleConfirm}
              disabled={isDeleting}
              className={cn(
                // Design System: destructive button styling
                "bg-red-600 hover:bg-red-700 text-white shadow-md",
                // Design System: focus ring
                "focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
              )}
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Entfernen...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Entfernen
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 