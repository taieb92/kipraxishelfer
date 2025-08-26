"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

import { AlertTriangle, Phone } from "lucide-react"

interface CollisionModalProps {
  isOpen: boolean
  onClose: () => void
  conflictCount: number
  holidayNote: string
  onStartRescheduling: () => void
}

export function CollisionModal({
  isOpen,
  onClose,
  conflictCount,
  holidayNote,
  onStartRescheduling,
}: CollisionModalProps) {

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Terminkonflikt erkannt
          </DialogTitle>
          <DialogDescription>{t("calendar.holiday_conflict", { count: conflictCount })}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-yellow-50 p-4 border border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                {holidayNote}
              </Badge>
            </div>
            <p className="text-sm text-yellow-800">
              <strong>{conflictCount}</strong> Termine sind von diesem Feiertag betroffen und müssen umgeplant werden.
            </p>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>
              Das System wird automatisch versuchen, die betroffenen Patienten anzurufen und alternative Termine
              anzubieten. Sie können den Fortschritt in der Anrufliste verfolgen.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Später
          </Button>
          <Button onClick={onStartRescheduling} className="gap-2">
            <Phone className="h-4 w-4" />
            Umplanung starten
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
