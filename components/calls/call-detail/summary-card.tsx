"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CopyButton } from "@/components/common/copy-button"
import { cn } from "@/lib/utils"
import { FileText, Printer } from "lucide-react"

interface SummaryCardProps {
  summary?: string
  tags: string[]
  systemOutcome?: string
  onPrint?: () => void // Future feature flag
  className?: string
}

export function SummaryCard({ 
  summary, 
  tags, 
  systemOutcome, 
  onPrint,
  className 
}: SummaryCardProps) {
  const summaryText = summary || "Keine Zusammenfassung verfügbar."
  
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
            <FileText className="h-5 w-5 text-blue-600" />
            <span className="text-slate-900">Zusammenfassung</span>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            <CopyButton 
              text={summaryText}
              ariaLabel="Zusammenfassung kopieren"
            >
              Kopieren
            </CopyButton>
            
            {onPrint && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onPrint}
                className={cn(
                  // Design System: focus ring
                  "focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                )}
                aria-label="Zusammenfassung drucken"
              >
                <Printer className="h-4 w-4" />
                <span className="ml-1">Drucken</span>
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Summary text */}
        <div className="prose prose-sm max-w-none">
          <p className="text-slate-700 leading-relaxed">
            {summaryText}
          </p>
        </div>
        
        {/* Tags */}
        {tags.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-slate-900 mb-2">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge 
                  key={tag}
                  variant="secondary"
                  className="text-xs bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-150"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* System outcome */}
        {systemOutcome && (
          <div className={cn(
            "p-3 rounded-lg border",
            // Design System: success outcome styling
            "bg-green-50 border-green-200"
          )}>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2 shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-800 mb-1">
                  System-Ergebnis
                </p>
                <p className="text-sm text-green-700">
                  {systemOutcome}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Screen reader accessible summary */}
        <div className="sr-only">
          Zusammenfassung des Anrufs: {summaryText}
          {tags.length > 0 && ` Tags: ${tags.join(', ')}`}
          {systemOutcome && ` System-Ergebnis: ${systemOutcome}`}
        </div>
      </CardContent>
    </Card>
  )
} 