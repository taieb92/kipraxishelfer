"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Download, FileText, ExternalLink, Loader2 } from "lucide-react"

interface ExportButtonsProps {
  cycle: {
    name: string
    startsISO: string
    endsISO: string
    timezone: string
  }
  from?: string | null
  to?: string | null
  showBillingPortal?: boolean
}

// Mock API functions
const exportCSV = async (params: { from?: string, to?: string }) => {
  await new Promise(resolve => setTimeout(resolve, 1500))
  return { url: "/exports/usage-data.csv" }
}

const exportPDF = async (params: { from?: string, to?: string }) => {
  await new Promise(resolve => setTimeout(resolve, 2000))
  return {
    url: "/exports/usage-statement.pdf",
    statement: {
      practiceName: "Praxis Dr. Müller",
      cycleName: "August 2025",
      period: { fromISO: "2025-08-01", toISO: "2025-08-31" },
      totals: { minutesTotal: 1050, callsTotal: 234 },
      billing: { 
        rounding: "per_minute", 
        minChargeSec: 60, 
        planIncludedMinutes: 1000, 
        overageMinutes: 50 
      }
    }
  }
}

export function ExportButtons({ cycle, from, to, showBillingPortal = false }: ExportButtonsProps) {
  const { toast } = useToast()
  const [loadingStates, setLoadingStates] = useState({
    csv: false,
    pdf: false
  })

  const handleCSVExport = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, csv: true }))
      
      const params: any = {}
      if (from && to) {
        params.from = from
        params.to = to
      }
      
      const result = await exportCSV(params)
      
      // Trigger download
      const link = document.createElement('a')
      link.href = result.url
      link.download = `usage-data-${cycle.name.replace(/\s+/g, '-').toLowerCase()}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast({
        title: "CSV Export erfolgreich",
        description: "Die Verbrauchsdaten wurden als CSV-Datei heruntergeladen.",
      })
      
    } catch (error) {
      console.error('Error exporting CSV:', error)
      toast({
        title: "Export fehlgeschlagen",
        description: "CSV-Export konnte nicht erstellt werden.",
        variant: "destructive"
      })
    } finally {
      setLoadingStates(prev => ({ ...prev, csv: false }))
    }
  }

  const handlePDFExport = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, pdf: true }))
      
      const params: any = {}
      if (from && to) {
        params.from = from
        params.to = to
      }
      
      const result = await exportPDF(params)
      
      // Trigger download
      const link = document.createElement('a')
      link.href = result.url
      link.download = `usage-statement-${cycle.name.replace(/\s+/g, '-').toLowerCase()}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast({
        title: "PDF-Abrechnung erstellt",
        description: `Abrechnungsübersicht für ${result.statement.cycleName} wurde heruntergeladen.`,
      })
      
    } catch (error) {
      console.error('Error exporting PDF:', error)
      toast({
        title: "Export fehlgeschlagen",
        description: "PDF-Abrechnung konnte nicht erstellt werden.",
        variant: "destructive"
      })
    } finally {
      setLoadingStates(prev => ({ ...prev, pdf: false }))
    }
  }

  const handleBillingPortal = () => {
    const billingPortalUrl = process.env.NEXT_PUBLIC_BILLING_PORTAL_URL || 'https://billing.clinicvoice.de'
    window.open(billingPortalUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <Card className={cn(
      // Design System: card gradient background
      "bg-gradient-to-b from-white to-slate-50",
      // Design System: border and shadow
      "border-slate-200 shadow-md rounded-2xl"
    )}>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Daten exportieren</h3>
            <p className="text-sm text-slate-600">
              Laden Sie Ihre Verbrauchsdaten für Buchhaltung und Archivierung herunter
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* CSV Export */}
            <Button
              onClick={handleCSVExport}
              disabled={loadingStates.csv}
              variant="outline"
              className={cn(
                "justify-center gap-2",
                // Design System: focus ring
                "focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
              )}
              aria-label="CSV exportieren"
            >
              {loadingStates.csv ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              CSV Export
            </Button>

            {/* PDF Export */}
            <Button
              onClick={handlePDFExport}
              disabled={loadingStates.pdf}
              variant="outline"
              className={cn(
                "justify-center gap-2",
                // Design System: focus ring
                "focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
              )}
              aria-label="PDF-Abrechnung erstellen"
            >
              {loadingStates.pdf ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              PDF-Abrechnung
            </Button>

            {/* Billing Portal */}
            {showBillingPortal && (
              <Button
                onClick={handleBillingPortal}
                className={cn(
                  "justify-center gap-2",
                  // Design System: medical gradient on primary actions
                  "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800",
                  "text-white shadow-md",
                  // Design System: focus ring
                  "focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                )}
              >
                <ExternalLink className="h-4 w-4" />
                Abrechnungsportal
              </Button>
            )}
          </div>
        </div>
        
        {/* Additional Info */}
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="text-xs text-slate-500 space-y-1">
            <p>
              <strong>CSV:</strong> Vollständige Rohdaten für weitere Auswertungen
            </p>
            <p>
              <strong>PDF:</strong> Formatierte Abrechnungsübersicht mit Metadaten
            </p>
            {showBillingPortal && (
              <p>
                <strong>Portal:</strong> Vollständige Abrechnungshistorie und Einstellungen
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 