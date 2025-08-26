"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HolidayModal } from "./holiday-modal"
import { DeleteConfirmDialog } from "./delete-confirm-dialog"
import { cn } from "@/lib/utils"
import { formatHolidayDateRange } from "@/lib/date"
import { Plus, Edit, Trash2, Calendar } from "lucide-react"

interface Holiday {
  id: string
  startISO: string
  endISO?: string
  note?: string
}

interface HolidayListProps {
  holidays: Holiday[]
  onAddHoliday: (holiday: Omit<Holiday, 'id'>) => void
  onEditHoliday: (id: string, holiday: Omit<Holiday, 'id'>) => void
  onDeleteHoliday: (id: string) => void
  className?: string
}

export function HolidayList({ 
  holidays, 
  onAddHoliday, 
  onEditHoliday, 
  onDeleteHoliday,
  className 
}: HolidayListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null)
  const [deletingHoliday, setDeletingHoliday] = useState<Holiday | null>(null)

  const handleAddClick = () => {
    setEditingHoliday(null)
    setIsModalOpen(true)
  }

  const handleEditClick = (holiday: Holiday) => {
    setEditingHoliday(holiday)
    setIsModalOpen(true)
  }

  const handleDeleteClick = (holiday: Holiday) => {
    setDeletingHoliday(holiday)
  }

  const handleModalSubmit = (holidayData: Omit<Holiday, 'id'>) => {
    if (editingHoliday) {
      onEditHoliday(editingHoliday.id, holidayData)
    } else {
      onAddHoliday(holidayData)
    }
    setIsModalOpen(false)
    setEditingHoliday(null)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingHoliday(null)
  }

  const handleDeleteConfirm = () => {
    if (deletingHoliday) {
      onDeleteHoliday(deletingHoliday.id)
      setDeletingHoliday(null)
    }
  }

  const handleDeleteCancel = () => {
    setDeletingHoliday(null)
  }

  return (
    <>
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
              <Calendar className="h-5 w-5 text-blue-600" />
              <span className="text-slate-900">Feiertage & Schließungen</span>
            </div>
            <Button 
              size="sm"
              onClick={handleAddClick}
              className={cn(
                // Design System: medical gradient on primary actions
                "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800",
                "text-white shadow-md",
                // Design System: focus ring
                "focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
              )}
            >
              <Plus className="h-4 w-4 mr-1" />
              Hinzufügen
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {holidays.length === 0 ? (
            <div className="text-center py-6">
              <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">
                Keine Feiertage eingetragen
              </p>
              <p className="text-sm text-slate-400 mt-1">
                Fügen Sie Feiertage und Schließungen hinzu, um Terminkonlikte zu vermeiden.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {holidays.map((holiday) => (
                <div 
                  key={holiday.id} 
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border",
                    // Design System: holiday warm palette
                    "bg-amber-50 border-amber-200 hover:bg-amber-100 transition-colors"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    {/* Badge-like title with stronger styling */}
                    <div className="flex items-center gap-2 mb-1">
                      <Badge 
                        variant="secondary"
                        className={cn(
                          "text-xs font-medium",
                          // Design System: warning badge colors
                          "bg-amber-100 text-amber-800 border-amber-300"
                        )}
                      >
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatHolidayDateRange(holiday.startISO, holiday.endISO)}
                      </Badge>
                    </div>
                    
                    {/* Note in muted text */}
                    {holiday.note && (
                      <p className="text-sm text-amber-700 leading-relaxed">
                        {holiday.note}
                      </p>
                    )}
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex items-center space-x-1 ml-3">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEditClick(holiday)}
                      className={cn(
                        "text-amber-700 hover:text-amber-900 hover:bg-amber-200",
                        // Design System: focus ring
                        "focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                      )}
                      aria-label={`${holiday.note || 'Feiertag'} bearbeiten`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteClick(holiday)}
                      className={cn(
                        "text-red-600 hover:text-red-800 hover:bg-red-100",
                        // Design System: focus ring
                        "focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                      )}
                      aria-label={`${holiday.note || 'Feiertag'} löschen`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Holiday Modal */}
      <HolidayModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        initialData={editingHoliday ? {
          startISO: editingHoliday.startISO,
          endISO: editingHoliday.endISO,
          note: editingHoliday.note
        } : undefined}
        mode={editingHoliday ? 'edit' : 'add'}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={!!deletingHoliday}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        holidayTitle={deletingHoliday?.note || 'Feiertag'}
        holidayDateRange={deletingHoliday ? formatHolidayDateRange(deletingHoliday.startISO, deletingHoliday.endISO) : ''}
      />
    </>
  )
} 