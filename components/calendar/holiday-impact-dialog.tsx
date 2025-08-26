"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { generateTimeOptions, isValidCallWindow, formatTimeWindow } from "@/lib/date"
import { CheckCircle, AlertTriangle, ChevronDown, ChevronUp, Phone, Clock, Users, Info } from "lucide-react"

interface ConflictItem {
  id: string
  patientName?: string
  anonymized: boolean
  startISO: string
  endISO: string
  service?: string
}

interface HolidayImpactDialogProps {
  isOpen: boolean
  onClose: () => void
  onStartRescheduling: (options: ReschedulingOptions) => void
  holidayTitle: string
  totalConflicts: number
  conflicts: ConflictItem[]
}

interface ReschedulingOptions {
  holidayId: string
  appointmentIds: string[]
  callPatients: boolean
  callWindow: { from: string; to: string }
  maxAttempts: number
  daysToAttempt: number
}

const timeOptions = generateTimeOptions()

export function HolidayImpactDialog({ 
  isOpen, 
  onClose, 
  onStartRescheduling, 
  holidayTitle,
  totalConflicts,
  conflicts 
}: HolidayImpactDialogProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [callPatients, setCallPatients] = useState(false)
  const [callWindowFrom, setCallWindowFrom] = useState("09:00")
  const [callWindowTo, setCallWindowTo] = useState("17:00")
  const [maxAttempts, setMaxAttempts] = useState(2)
  const [daysToAttempt, setDaysToAttempt] = useState(2)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setCallPatients(false)
      setCallWindowFrom("09:00")
      setCallWindowTo("17:00")
      setMaxAttempts(2)
      setDaysToAttempt(2)
      setShowConfirmation(false)
      setIsSubmitting(false)
      setIsExpanded(false)
    }
  }, [isOpen])

  // Validate call window
  const callWindowValidation = isValidCallWindow(callWindowFrom, callWindowTo)
  const isFormValid = totalConflicts > 0 && (!callPatients || callWindowValidation.valid)

  // Format conflicts for display
  const displayedConflicts = isExpanded ? conflicts : conflicts.slice(0, 5)
  const hasMoreConflicts = conflicts.length > 5

  const formatConflictTime = (startISO: string, endISO: string): string => {
    const start = new Date(startISO)
    const end = new Date(endISO)
    return `${start.toLocaleDateString('de-DE')} ${start.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}–${end.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`
  }

  const handleStartRescheduling = () => {
    if (!isFormValid) return

    if (callPatients) {
      setShowConfirmation(true)
    } else {
      proceedWithRescheduling()
    }
  }

  const proceedWithRescheduling = async () => {
    setIsSubmitting(true)

    try {
      const options: ReschedulingOptions = {
        holidayId: "temp-id", // This would come from the API response
        appointmentIds: conflicts.map(c => c.id),
        callPatients,
        callWindow: { from: callWindowFrom, to: callWindowTo },
        maxAttempts,
        daysToAttempt
      }

      await onStartRescheduling(options)
    } catch (error) {
      console.error('Error starting rescheduling:', error)
      setIsSubmitting(false)
    }
  }

  const handleLaterClick = () => {
    onClose()
  }

  return (
    <>
      <Dialog open={isOpen && !showConfirmation} onOpenChange={onClose}>
        <DialogContent className={cn(
          // Design System: dialog panel bg, border, radius, shadow
          "bg-white border-slate-200 rounded-2xl shadow-xl",
          "max-w-2xl max-h-[90vh] overflow-y-auto"
        )}>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {totalConflicts > 0 ? (
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-600" />
              )}
              <span className="text-slate-900">Feiertag/Schließung erstellt</span>
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              {totalConflicts > 0 
                ? `${totalConflicts} Termine betroffen.`
                : "Keine Konflikte. Kalender aktualisiert."
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Holiday info */}
            <div className={cn(
              "p-4 rounded-lg border",
              totalConflicts > 0 
                ? "bg-amber-50 border-amber-200"
                : "bg-green-50 border-green-200"
            )}>
              <div className="flex items-center space-x-2 mb-2">
                <Badge 
                  variant="secondary"
                  className={cn(
                    totalConflicts > 0 
                      ? "bg-amber-100 text-amber-800 border-amber-300"
                      : "bg-green-100 text-green-800 border-green-300"
                  )}
                >
                  {holidayTitle}
                </Badge>
              </div>
            </div>

            {/* Conflicts list */}
            {totalConflicts > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-slate-900 flex items-center space-x-2">
                  <Users className="h-4 w-4 text-slate-600" />
                  <span>Betroffene Termine</span>
                </h3>

                <div className="space-y-2">
                  {displayedConflicts.map((conflict) => (
                    <div 
                      key={conflict.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">
                          {conflict.anonymized ? "Patient (anonymisiert)" : (conflict.patientName || "Unbekannt")}
                        </p>
                        <p className="text-sm text-slate-600">
                          {formatConflictTime(conflict.startISO, conflict.endISO)}
                        </p>
                        {conflict.service && (
                          <p className="text-xs text-slate-500 mt-1">
                            {conflict.service}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Expand/Collapse button */}
                  {hasMoreConflicts && (
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          onClick={() => setIsExpanded(!isExpanded)}
                          className="w-full justify-center text-slate-600 hover:text-slate-900"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="h-4 w-4 mr-2" />
                              Weniger anzeigen
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4 mr-2" />
                              Alle anzeigen ({conflicts.length - 5} weitere)
                            </>
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    </Collapsible>
                  )}
                </div>

                {/* Rescheduling options */}
                <div className="space-y-4 pt-4 border-t border-slate-200">
                  <h3 className="text-sm font-medium text-slate-900 flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-slate-600" />
                    <span>Umplanung starten</span>
                  </h3>

                  {/* AI calling checkbox - OFF by default */}
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="call-patients"
                        checked={callPatients}
                        onCheckedChange={(checked) => setCallPatients(checked as boolean)}
                        className={cn(
                          // Design System: focus ring
                          "focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                        )}
                      />
                      <div className="space-y-1">
                        <label 
                          htmlFor="call-patients" 
                          className="text-sm font-medium text-slate-900 cursor-pointer"
                        >
                          AI soll Patienten anrufen und Umterminierung vorschlagen
                        </label>
                        <p className="text-xs text-slate-600">
                          Wenn aktiviert, wird das AI-System automatisch versuchen, die betroffenen Patienten anzurufen.
                        </p>
                      </div>
                    </div>

                    {/* Call options - only visible when checkbox is checked */}
                    {callPatients && (
                      <div className="ml-6 space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        {/* Call window */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-900 flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span>Anrufzeitraum</span>
                          </label>
                          <div className="flex items-center space-x-2">
                            <Select value={callWindowFrom} onValueChange={setCallWindowFrom}>
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {timeOptions.map(time => (
                                  <SelectItem key={time} value={time}>{time}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <span className="text-slate-500">bis</span>
                            <Select value={callWindowTo} onValueChange={setCallWindowTo}>
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {timeOptions.map(time => (
                                  <SelectItem key={time} value={time}>{time}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          {!callWindowValidation.valid && (
                            <p className="text-sm text-red-600 flex items-center space-x-1">
                              <AlertTriangle className="h-4 w-4" />
                              <span>{callWindowValidation.reason}</span>
                            </p>
                          )}
                        </div>

                        {/* Max attempts and days */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-900">
                              Max. Versuche
                            </label>
                            <Select value={maxAttempts.toString()} onValueChange={(value) => setMaxAttempts(Number(value))}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1</SelectItem>
                                <SelectItem value="2">2</SelectItem>
                                <SelectItem value="3">3</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-900">
                              Tage Versuchen
                            </label>
                            <Select value={daysToAttempt.toString()} onValueChange={(value) => setDaysToAttempt(Number(value))}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1</SelectItem>
                                <SelectItem value="2">2</SelectItem>
                                <SelectItem value="3">3</SelectItem>
                                <SelectItem value="5">5</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Info note */}
            <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
              <p className="text-sm text-blue-800">
                Kein Anruf erfolgt, bis Sie oben explizit zustimmen.
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
            <Button
              variant="outline"
              onClick={handleLaterClick}
              className={cn(
                // Design System: focus ring
                "focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
              )}
            >
              Später erledigen
            </Button>
            
            <Button
              onClick={handleStartRescheduling}
              disabled={!isFormValid || isSubmitting}
              className={cn(
                // Design System: medical gradient on primary actions
                "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800",
                "text-white shadow-md",
                // Design System: focus ring
                "focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
              )}
            >
              <Phone className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Wird gestartet...' : 'Umplanung starten'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={() => setShowConfirmation(false)}>
        <DialogContent className={cn(
          "bg-white border-slate-200 rounded-2xl shadow-xl",
          "max-w-md"
        )}>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="text-slate-900">Anrufe bestätigen</span>
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Sie sind dabei, automatische Anrufe zu starten.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-800 font-medium mb-2">
                Bestätigung erforderlich:
              </p>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• {totalConflicts} Patienten werden angerufen</li>
                <li>• Anrufzeit: {formatTimeWindow(callWindowFrom, callWindowTo)}</li>
                <li>• Max. {maxAttempts} Versuche über {daysToAttempt} Tage</li>
              </ul>
            </div>

            <p className="text-sm text-slate-700">
              <strong>Ich bestätige, dass Anrufe initiiert werden</strong> und bin mir bewusst, 
              dass dies automatische Kontaktaufnahme mit Patienten zur Folge hat.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
            <Button
              variant="outline"
              onClick={() => setShowConfirmation(false)}
              disabled={isSubmitting}
            >
              Abbrechen
            </Button>
            
            <Button
              onClick={proceedWithRescheduling}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isSubmitting ? 'Wird gestartet...' : 'Anrufe starten'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 