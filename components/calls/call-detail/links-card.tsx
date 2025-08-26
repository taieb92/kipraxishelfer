"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ExternalLink, LinkIcon } from "lucide-react"

interface LinksCardProps {
  links?: {
    doctolibAppointment?: string
    doctolibPatient?: string
  }
  className?: string
}

export function LinksCard({ links, className }: LinksCardProps) {
  const hasLinks = links && (links.doctolibAppointment || links.doctolibPatient)

  if (!hasLinks) {
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
            <LinkIcon className="h-5 w-5 text-blue-600" />
            <span className="text-slate-900">Verknüpfungen</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="text-center py-6">
            <LinkIcon className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">
              Keine Verknüpfungen verfügbar
            </p>
            <p className="text-sm text-slate-400 mt-1">
              Es wurden keine externen Links für diesen Anruf erstellt.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

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
          <LinkIcon className="h-5 w-5 text-blue-600" />
          <span className="text-slate-900">Verknüpfungen</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Doctolib Appointment Link */}
        {links.doctolibAppointment && (
          <Button 
            variant="outline" 
            className={cn(
              "w-full justify-start bg-transparent hover:bg-slate-50",
              // Design System: focus ring
              "focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            )}
            asChild
          >
            <a 
              href={links.doctolibAppointment} 
              target="_blank" 
              rel="noopener noreferrer"
              title="Termin in Doctolib — neues Fenster"
            >
              <ExternalLink className="h-4 w-4 mr-2 text-slate-600" />
              <span className="text-slate-700">Termin in Doctolib</span>
            </a>
          </Button>
        )}
        
        {/* Doctolib Patient Link */}
        {links.doctolibPatient && (
          <Button 
            variant="outline" 
            className={cn(
              "w-full justify-start bg-transparent hover:bg-slate-50",
              // Design System: focus ring
              "focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            )}
            asChild
          >
            <a 
              href={links.doctolibPatient} 
              target="_blank" 
              rel="noopener noreferrer"
              title="Patient in Doctolib — neues Fenster"
            >
              <ExternalLink className="h-4 w-4 mr-2 text-slate-600" />
              <span className="text-slate-700">Patient in Doctolib</span>
            </a>
          </Button>
        )}
        
        {/* Screen reader accessible description */}
        <div className="sr-only">
          Externe Verknüpfungen: 
          {links.doctolibAppointment && "Termin in Doctolib verfügbar. "}
          {links.doctolibPatient && "Patient in Doctolib verfügbar. "}
          Links öffnen in neuem Fenster.
        </div>
      </CardContent>
    </Card>
  )
} 