"use client"

import React, { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { CopyButton } from "@/components/common/copy-button"
import { SystemTrail } from "./system-trail"
import { cn } from "@/lib/utils"
import { MessageSquare, ChevronDown, ChevronUp } from "lucide-react"

interface TranscriptEntry {
  speaker: "assistant" | "caller"
  text: string
  tsISO?: string
}

interface SystemTrailItem {
  tsISO: string
  action: string
  meta?: Record<string, unknown>
}

interface TranscriptCardProps {
  transcript: TranscriptEntry[]
  systemTrail?: SystemTrailItem[]
  className?: string
}

// Maximum messages to show initially (spec: ~12 messages)
const INITIAL_MESSAGE_LIMIT = 12

export function TranscriptCard({ 
  transcript, 
  systemTrail = [],
  className 
}: TranscriptCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Prepare transcript text for copying
  const transcriptText = useMemo(() => {
    return transcript
      .map(entry => {
        const speaker = entry.speaker === "assistant" ? "Assistent" : "Anrufer"
        return `${speaker}: ${entry.text}`
      })
      .join("\n")
  }, [transcript])
  
  // Determine if we need expand/collapse functionality
  const needsExpansion = transcript.length > INITIAL_MESSAGE_LIMIT
  const displayedTranscript = needsExpansion && !isExpanded 
    ? transcript.slice(0, INITIAL_MESSAGE_LIMIT)
    : transcript
  
  return (
    <Card className={cn(
      // Design System: card gradient background
      "bg-gradient-to-b from-white to-slate-50",
      // Design System: border and shadow
      "border-slate-200 shadow-md rounded-2xl",
      className
    )}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <span className="text-slate-900">Transkript</span>
          </div>
          
          <CopyButton 
            text={transcriptText}
            ariaLabel="Gesamtes Transkript kopieren"
          >
            Kopieren
          </CopyButton>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="transcript" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="transcript">Transkript</TabsTrigger>
            <TabsTrigger value="system">System-Trail</TabsTrigger>
          </TabsList>
          
          <TabsContent value="transcript" className="space-y-4">
            {transcript.length > 0 ? (
              <>
                {/* Transcript messages */}
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {displayedTranscript.map((entry, index) => {
                    const isAssistant = entry.speaker === "assistant"
                    const speakerLabel = isAssistant ? "Assistent" : "Anrufer"
                    
                    return (
                      <div key={index} className="flex gap-3">
                        <div
                          className={cn(
                            "text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap shrink-0",
                            isAssistant 
                              ? "bg-blue-100 text-blue-800 border border-blue-200" 
                              : "bg-slate-100 text-slate-800 border border-slate-200"
                          )}
                          aria-label={`${speakerLabel}:`}
                        >
                          {speakerLabel}
                        </div>
                        <p className="text-sm text-slate-700 flex-1 leading-relaxed">
                          {entry.text}
                        </p>
                      </div>
                    )
                  })}
                </div>
                
                {/* Expand/Collapse button */}
                {needsExpansion && (
                  <div className="pt-2 border-t border-slate-200">
                    <Button
                      variant="ghost"
                      onClick={() => setIsExpanded(!isExpanded)}
                      className={cn(
                        "w-full justify-center text-slate-600 hover:text-slate-900",
                        // Design System: focus ring
                        "focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                      )}
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-2" />
                          Weniger anzeigen
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-2" />
                          Mehr anzeigen ({transcript.length - INITIAL_MESSAGE_LIMIT} weitere Nachrichten)
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              /* Empty transcript */
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">
                  Kein Transkript verfügbar
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  Das Gespräch wurde nicht transkribiert oder konnte nicht verarbeitet werden.
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="system" className="space-y-4">
            <SystemTrail items={systemTrail} />
          </TabsContent>
        </Tabs>
        
        {/* Screen reader accessible summary */}
        <div className="sr-only">
          Transkript mit {transcript.length} Nachrichten. 
          {transcript.length > 0 && `Gespräch zwischen Assistent und Anrufer. ${transcriptText.slice(0, 200)}...`}
          {systemTrail.length > 0 && ` System-Trail mit ${systemTrail.length} Einträgen verfügbar.`}
        </div>
      </CardContent>
    </Card>
  )
} 