"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Calendar, ChevronUp, ChevronDown } from "lucide-react"
import { format } from "date-fns"
import { de } from "date-fns/locale"

interface UsageTableProps {
  data: Array<{
    dateISO: string
    calls: number
    minutesInbound: number
    minutesOutbound: number
    minutesTotal: number
    avgDurationSec: number
    afterHoursPct?: number
  }>
  totals: {
    minutesInbound: number
    minutesOutbound: number
    minutesTotal: number
    callsTotal: number
    avgDurationSec: number
    afterHoursPct?: number
  }
  showAfterHours?: boolean
}

type SortField = 'date' | 'calls' | 'minutes' | 'duration'
type SortDirection = 'asc' | 'desc'

// Helper function to format duration
function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// Helper function to format numbers with thin spaces
function formatNumber(num: number): string {
  return num.toLocaleString('de-DE').replace(/\./g, '\u2009') // thin space
}

export function UsageTable({ data, totals, showAfterHours = false }: UsageTableProps) {
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const sortedData = [...data].sort((a, b) => {
    let aValue: number | string
    let bValue: number | string

    switch (sortField) {
      case 'date':
        aValue = a.dateISO
        bValue = b.dateISO
        break
      case 'calls':
        aValue = a.calls
        bValue = b.calls
        break
      case 'minutes':
        aValue = a.minutesTotal
        bValue = b.minutesTotal
        break
      case 'duration':
        aValue = a.avgDurationSec
        bValue = b.avgDurationSec
        break
      default:
        return 0
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
    }

    return 0
  })

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <div className="w-4 h-4" />
    }
    
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4 text-blue-600" />
    ) : (
      <ChevronDown className="h-4 w-4 text-blue-600" />
    )
  }

  return (
    <Card className={cn(
      "bg-gradient-to-b from-white to-slate-50",
      "border-slate-200 shadow-md rounded-2xl"
    )}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 border border-blue-200">
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Tägliche Aufschlüsselung</h3>
            <p className="text-sm text-slate-600">
              Detaillierte Übersicht der Nutzung pro Tag
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold text-slate-900">
                  <Button
                    variant="ghost"
                    className="h-auto p-0 hover:bg-transparent flex items-center gap-2"
                    onClick={() => handleSort('date')}
                  >
                    Datum
                    <SortIcon field="date" />
                  </Button>
                </TableHead>
                
                <TableHead className="text-right font-semibold text-slate-900">
                  <Button
                    variant="ghost"
                    className="h-auto p-0 hover:bg-transparent flex items-center gap-2 ml-auto"
                    onClick={() => handleSort('calls')}
                  >
                    Anrufe
                    <SortIcon field="calls" />
                  </Button>
                </TableHead>
                
                <TableHead className="text-right font-semibold text-slate-900">Eingehend</TableHead>
                <TableHead className="text-right font-semibold text-slate-900">Ausgehend</TableHead>
                
                <TableHead className="text-right font-semibold text-slate-900">
                  <Button
                    variant="ghost"
                    className="h-auto p-0 hover:bg-transparent flex items-center gap-2 ml-auto"
                    onClick={() => handleSort('minutes')}
                  >
                    Gesamt
                    <SortIcon field="minutes" />
                  </Button>
                </TableHead>
                
                <TableHead className="text-right font-semibold text-slate-900">
                  <Button
                    variant="ghost"
                    className="h-auto p-0 hover:bg-transparent flex items-center gap-2 ml-auto"
                    onClick={() => handleSort('duration')}
                  >
                    Ø Dauer
                    <SortIcon field="duration" />
                  </Button>
                </TableHead>
                
                {showAfterHours && (
                  <TableHead className="text-right font-semibold text-slate-900">
                    Nach Öffnungsz.
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            
            <TableBody>
              {sortedData.map((row) => (
                <TableRow 
                  key={row.dateISO}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <TableCell className="font-medium">
                    {(() => {
                      try {
                        const date = new Date(row.dateISO)
                        return !isNaN(date.getTime()) 
                          ? format(date, 'dd.MM.yyyy', { locale: de })
                          : row.dateISO
                      } catch {
                        return row.dateISO
                      }
                    })()}
                  </TableCell>
                  
                  <TableCell className="text-right">
                    {formatNumber(row.calls)}
                  </TableCell>
                  
                  <TableCell className="text-right text-slate-600">
                    {formatNumber(row.minutesInbound)} min
                  </TableCell>
                  
                  <TableCell className="text-right text-slate-600">
                    {formatNumber(row.minutesOutbound)} min
                  </TableCell>
                  
                  <TableCell className="text-right font-medium">
                    {formatNumber(row.minutesTotal)} min
                  </TableCell>
                  
                  <TableCell className="text-right">
                    {formatDuration(row.avgDurationSec)}
                  </TableCell>
                  
                  {showAfterHours && (
                    <TableCell className="text-right">
                      {row.afterHoursPct !== undefined ? `${row.afterHoursPct.toFixed(1)}%` : '—'}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {/* Totals Footer */}
          <div className="border-t border-slate-200 bg-slate-50">
            <Table>
              <TableBody>
                <TableRow className="hover:bg-slate-50">
                  <TableCell className="font-bold text-slate-900">
                    Gesamt
                  </TableCell>
                  
                  <TableCell className="text-right font-bold text-slate-900">
                    {formatNumber(totals.callsTotal)}
                  </TableCell>
                  
                  <TableCell className="text-right font-semibold text-slate-700">
                    {formatNumber(totals.minutesInbound)} min
                  </TableCell>
                  
                  <TableCell className="text-right font-semibold text-slate-700">
                    {formatNumber(totals.minutesOutbound)} min
                  </TableCell>
                  
                  <TableCell className="text-right font-bold text-slate-900">
                    {formatNumber(totals.minutesTotal)} min
                  </TableCell>
                  
                  <TableCell className="text-right font-semibold text-slate-700">
                    {formatDuration(totals.avgDurationSec)}
                  </TableCell>
                  
                  {showAfterHours && (
                    <TableCell className="text-right font-semibold text-slate-700">
                      {totals.afterHoursPct !== undefined ? `${totals.afterHoursPct.toFixed(1)}%` : '—'}
                    </TableCell>
                  )}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
        
        <div className="mt-4 text-xs text-slate-500">
          <span className="sr-only">
            Tabelle zeigt tägliche Aufschlüsselung der Anrufminuten. 
            Sortierung nach {sortField} {sortDirection === 'asc' ? 'aufsteigend' : 'absteigend'}.
            Gesamtwerte: {totals.callsTotal} Anrufe, {totals.minutesTotal} Minuten.
          </span>
          Klicken Sie auf Spaltenüberschriften zum Sortieren. 
        </div>
      </CardContent>
    </Card>
  )
} 