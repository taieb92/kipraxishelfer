"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AudioPlayer } from "@/components/calls/audio-player"
import { cn } from "@/lib/utils"
import { Volume2, Info } from "lucide-react"

interface RecordingCardProps {
  recordingUrl?: string | null
  redactionApplied?: boolean
  className?: string
}

export function RecordingCard({ 
  recordingUrl, 
  redactionApplied = false,
  className 
}: RecordingCardProps) {
  return (
    <Card className={cn(
      // Design System: card gradient background
      "bg-gradient-to-b from-white to-slate-50",
      // Design System: border and shadow
      "border-slate-200 shadow-md rounded-2xl",
      className
    )}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2">
          <Volume2 className="h-5 w-5 text-blue-600" />
          <span className="text-slate-900">Aufzeichnung</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {recordingUrl ? (
          <>
            {/* Audio Player */}
            <div className="space-y-4">
              <AudioPlayer src={recordingUrl} />
            </div>
            
            {/* Redaction notice */}
            {redactionApplied && (
              <div className={cn(
                "flex items-start space-x-2 p-3 rounded-lg",
                // Design System: info notice styling
                "bg-blue-50 border border-blue-200"
              )}>
                <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                <p className="text-sm text-blue-800">
                  Personenbezogene Daten wurden vor der Speicherung entfernt.
                </p>
              </div>
            )}
          </>
        ) : (
          /* No recording available */
          <div className="text-center py-8">
            <Volume2 className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">
              Keine Aufzeichnung verfügbar
            </p>
            <p className="text-sm text-slate-400 mt-1">
              Die Aufzeichnung konnte nicht gefunden werden oder wurde nicht gespeichert.
            </p>
          </div>
        )}
        
        {/* Screen reader accessible description */}
        <div className="sr-only">
          {recordingUrl 
            ? `Audioaufzeichnung verfügbar${redactionApplied ? '. Personenbezogene Daten wurden entfernt.' : '.'}`
            : 'Keine Audioaufzeichnung verfügbar.'
          }
        </div>
      </CardContent>
    </Card>
  )
} 