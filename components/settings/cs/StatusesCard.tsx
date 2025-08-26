"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Lock, Edit2, Trash2, Plus, CheckCircle } from "lucide-react"
import { EditStatusDialog } from "./EditStatusDialog"
import { DeleteConfirmDialog } from "./DeleteConfirmDialog"

interface Status {
  id: string
  name: string
  description: string
  systemState: 'OPEN' | 'CLOSED'
  isPredefined: boolean
}

const PREDEFINED_STATUSES: Status[] = [
  {
    id: "action-needed",
    name: "Aktion erforderlich",
    description: "Aktion durch Team erforderlich.",
    systemState: "OPEN",
    isPredefined: true
  },
  {
    id: "appointment-booked",
    name: "Termin gebucht",
    description: "Termin erfolgreich angelegt.",
    systemState: "CLOSED",
    isPredefined: true
  },
  {
    id: "completed",
    name: "Abgeschlossen",
    description: "Vorgang abgeschlossen.",
    systemState: "CLOSED",
    isPredefined: true
  }
]

// Mock API functions
const fetchStatuses = async (): Promise<Status[]> => {
  await new Promise(resolve => setTimeout(resolve, 300))
  return [
    ...PREDEFINED_STATUSES,
    {
      id: "follow-up",
      name: "Nachfrage erforderlich",
      description: "Patient muss zurückgerufen werden.",
      systemState: "OPEN",
      isPredefined: false
    }
  ]
}

const createStatus = async (data: { name: string; description: string; systemState: 'OPEN' | 'CLOSED' }) => {
  await new Promise(resolve => setTimeout(resolve, 800))
  return {
    id: `custom-${Date.now()}`,
    ...data,
    isPredefined: false
  }
}

const updateStatus = async (id: string, data: { name: string; description: string; systemState: 'OPEN' | 'CLOSED' }) => {
  await new Promise(resolve => setTimeout(resolve, 600))
  return { ok: true }
}

const deleteStatus = async (id: string) => {
  await new Promise(resolve => setTimeout(resolve, 500))
  return { ok: true }
}

export function StatusesCard() {
  const { toast } = useToast()
  const [statuses, setStatuses] = useState<Status[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editDialog, setEditDialog] = useState<{ isOpen: boolean; status?: Status }>({
    isOpen: false
  })
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; status?: Status }>({
    isOpen: false
  })

  // Load statuses
  useEffect(() => {
    const loadStatuses = async () => {
      try {
        const data = await fetchStatuses()
        setStatuses(data)
      } catch (error) {
        console.error('Error loading statuses:', error)
        toast({
          title: "Fehler",
          description: "Status konnten nicht geladen werden.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadStatuses()
  }, [toast])

  const handleCreate = async (data: { name: string; description: string; systemState: 'OPEN' | 'CLOSED' }) => {
    try {
      const newStatus = await createStatus(data)
      setStatuses(prev => [...prev, newStatus])
      setEditDialog({ isOpen: false })
      
      toast({
        title: "Status erstellt",
        description: `Status "${data.name}" wurde erstellt.`
      })
    } catch (error) {
      console.error('Error creating status:', error)
      toast({
        title: "Fehler",
        description: "Status konnte nicht erstellt werden.",
        variant: "destructive"
      })
    }
  }

  const handleUpdate = async (id: string, data: { name: string; description: string; systemState: 'OPEN' | 'CLOSED' }) => {
    try {
      await updateStatus(id, data)
      setStatuses(prev => prev.map(status => 
        status.id === id ? { ...status, ...data } : status
      ))
      setEditDialog({ isOpen: false })
      
      toast({
        title: "Status aktualisiert",
        description: `Status "${data.name}" wurde aktualisiert.`
      })
    } catch (error) {
      console.error('Error updating status:', error)
      toast({
        title: "Fehler",
        description: "Status konnte nicht aktualisiert werden.",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteStatus(id)
      const statusToDelete = statuses.find(s => s.id === id)
      setStatuses(prev => prev.filter(status => status.id !== id))
      setDeleteDialog({ isOpen: false })
      
      toast({
        title: "Status entfernt",
        description: `Status "${statusToDelete?.name}" wurde entfernt.`
      })
    } catch (error) {
      console.error('Error deleting status:', error)
      toast({
        title: "Fehler",
        description: "Status konnte nicht entfernt werden.",
        variant: "destructive"
      })
    }
  }

  if (isLoading) {
    return (
      <Card className={cn(
        "bg-gradient-to-b from-white to-slate-50",
        "border-slate-200 shadow-md rounded-2xl"
      )}>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-slate-200 animate-pulse rounded-xl" />
            <div className="space-y-2">
              <div className="h-5 w-20 bg-slate-200 animate-pulse rounded" />
              <div className="h-4 w-32 bg-slate-200 animate-pulse rounded" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-200 animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <TooltipProvider>
      <Card className={cn(
        "bg-gradient-to-b from-white to-slate-50",
        "border-slate-200 shadow-md rounded-2xl"
      )}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 border border-green-200">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Status</h3>
              <p className="text-sm text-slate-600">
                Verwalten Sie Anruf-Status für Workflow-Management
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {statuses.map((status) => (
              <div
                key={status.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border",
                  "border-slate-200 bg-white/50 hover:bg-slate-50 transition-colors"
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900">{status.name}</span>
                    
                    {status.isPredefined && (
                      <>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Lock className="h-3 w-3 text-slate-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Systemstatus, nicht editierbar</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        <Badge 
                          variant="secondary"
                          className="h-5 text-xs bg-slate-100 text-slate-700 border-slate-300"
                        >
                          System
                        </Badge>
                      </>
                    )}
                    
                    {!status.isPredefined && (
                      <Badge 
                        variant="outline"
                        className="h-5 text-xs border-blue-200 text-blue-700"
                      >
                        Custom
                      </Badge>
                    )}
                    
                    <Badge 
                      variant={status.systemState === 'OPEN' ? 'default' : 'secondary'}
                      className={cn(
                        "h-5 text-xs",
                        status.systemState === 'OPEN' 
                          ? "bg-amber-100 text-amber-700 border-amber-200" 
                          : "bg-green-100 text-green-700 border-green-200"
                      )}
                    >
                      {status.systemState === 'OPEN' ? 'OFFEN' : 'GESCHLOSSEN'}
                    </Badge>
                  </div>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="text-sm text-slate-600 truncate mt-0.5">
                        {status.description}
                      </p>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">{status.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                
                {!status.isPredefined && (
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                          onClick={() => setEditDialog({ isOpen: true, status })}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Status bearbeiten</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => setDeleteDialog({ isOpen: true, status })}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Status entfernen</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <Button
            onClick={() => setEditDialog({ isOpen: true })}
            variant="outline"
            className={cn(
              "w-full justify-center gap-2",
              "border-dashed border-slate-300 hover:border-green-400 hover:bg-green-50",
              "focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
            )}
          >
            <Plus className="h-4 w-4" />
            Neuen Status hinzufügen
          </Button>
        </CardContent>
      </Card>
      
      <EditStatusDialog
        isOpen={editDialog.isOpen}
        status={editDialog.status}
        existingNames={statuses.map(s => s.name)}
        onClose={() => setEditDialog({ isOpen: false })}
        onSave={editDialog.status 
          ? (data) => handleUpdate(editDialog.status!.id, data)
          : handleCreate
        }
      />
      
      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Status entfernen"
        description="Dieser Status wird entfernt. Bereits bestehende Anrufe behalten ihren bisherigen Wert."
        onClose={() => setDeleteDialog({ isOpen: false })}
        onConfirm={() => deleteDialog.status && handleDelete(deleteDialog.status.id)}
      />
    </TooltipProvider>
  )
} 