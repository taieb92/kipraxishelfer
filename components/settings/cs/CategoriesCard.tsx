"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Lock, Edit2, Trash2, Plus, Tag } from "lucide-react"
import { EditCategoryDialog } from "./EditCategoryDialog"
import { DeleteConfirmDialog } from "./DeleteConfirmDialog"

interface Category {
  id: string
  name: string
  description: string
  isPredefined: boolean
}

// Predefined categories (locked system items)
const PREDEFINED_CATEGORIES: Category[] = [
  {
    id: "termine",
    name: "Termine",
    description: "Anfragen zu Terminvereinbarung, -änderung, -absage.",
    isPredefined: true
  },
  {
    id: "rezepte", 
    name: "Rezepte",
    description: "Rezeptverlängerungen und Medikamentenanfragen.",
    isPredefined: true
  },
  {
    id: "krankschreibungen",
    name: "Krankschreibungen", 
    description: "Arbeitsunfähigkeitsbescheinigungen und Bescheinigungen.",
    isPredefined: true
  }
]

// Mock API functions
const fetchCategories = async (): Promise<Category[]> => {
  await new Promise(resolve => setTimeout(resolve, 300))
  return [...PREDEFINED_CATEGORIES]
}

const createCategory = async (data: { name: string; description: string }): Promise<Category> => {
  await new Promise(resolve => setTimeout(resolve, 500))
  return {
    id: `custom-${Date.now()}`,
    name: data.name,
    description: data.description,
    isPredefined: false
  }
}

const updateCategory = async (id: string, data: { name: string; description: string }) => {
  await new Promise(resolve => setTimeout(resolve, 500))
  return { ok: true }
}

const deleteCategory = async (id: string) => {
  await new Promise(resolve => setTimeout(resolve, 300))
  return { ok: true }
}

export function CategoriesCard() {
  const { toast } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editDialog, setEditDialog] = useState<{
    isOpen: boolean
    category?: Category
  }>({ isOpen: false })
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean
    category?: Category
  }>({ isOpen: false })

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories()
        setCategories(data)
      } catch (error) {
        console.error('Error loading categories:', error)
        toast({
          title: "Fehler",
          description: "Kategorien konnten nicht geladen werden.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadCategories()
  }, [toast])

  const handleCreate = async (data: { name: string; description: string }) => {
    try {
      const newCategory = await createCategory(data)
      setCategories(prev => [...prev, newCategory])
      setEditDialog({ isOpen: false })
      
      toast({
        title: "Kategorie erstellt",
        description: `Die Kategorie "${data.name}" wurde erfolgreich erstellt.`,
      })
    } catch (error) {
      console.error('Error creating category:', error)
      toast({
        title: "Fehler",
        description: "Kategorie konnte nicht erstellt werden.",
        variant: "destructive"
      })
    }
  }

  const handleUpdate = async (id: string, data: { name: string; description: string }) => {
    try {
      await updateCategory(id, data)
      setCategories(prev => prev.map(cat => 
        cat.id === id ? { ...cat, ...data } : cat
      ))
      setEditDialog({ isOpen: false })
      
      toast({
        title: "Kategorie aktualisiert",
        description: `Die Kategorie "${data.name}" wurde erfolgreich aktualisiert.`,
      })
    } catch (error) {
      console.error('Error updating category:', error)
      toast({
        title: "Fehler",
        description: "Kategorie konnte nicht aktualisiert werden.",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id)
      setCategories(prev => prev.filter(cat => cat.id !== id))
      setDeleteDialog({ isOpen: false })
      
      toast({
        title: "Kategorie entfernt",
        description: "Die Kategorie wurde erfolgreich entfernt.",
      })
    } catch (error) {
      console.error('Error deleting category:', error)
      toast({
        title: "Fehler",
        description: "Kategorie konnte nicht entfernt werden.",
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
            <div>
              <div className="h-6 w-32 bg-slate-200 animate-pulse rounded" />
              <div className="h-4 w-48 bg-slate-200 animate-pulse rounded mt-1" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
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
        // Design System: card gradient background
        "bg-gradient-to-b from-white to-slate-50",
        // Design System: border and shadow
        "border-slate-200 shadow-md rounded-2xl"
      )}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 border border-blue-200">
              <Tag className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Kategorien</h3>
              <p className="text-sm text-slate-600">
                Verwalten Sie Anruf-Kategorien für bessere Organisation
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Categories List */}
          <div className="space-y-3">
            {categories.map((category) => (
              <div 
                key={category.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border",
                  "border-slate-200 bg-white/50 hover:bg-slate-50 transition-colors"
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900">
                      {category.name}
                    </span>
                    {category.isPredefined && (
                      <>
                        <Lock className="h-3 w-3 text-slate-500" aria-hidden="true" />
                        <span className="sr-only">Systemstatus, nicht editierbar</span>
                        <Badge 
                          variant="outline" 
                          className="text-xs bg-slate-100 text-slate-700 border-slate-300"
                        >
                          System
                        </Badge>
                      </>
                    )}
                    {!category.isPredefined && (
                      <Badge 
                        variant="outline" 
                        className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                      >
                        Custom
                      </Badge>
                    )}
                  </div>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="text-sm text-slate-600 truncate mt-0.5">
                        {category.description}
                      </p>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">{category.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                {/* Actions */}
                {!category.isPredefined && (
                  <div className="flex items-center gap-1 ml-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditDialog({ isOpen: true, category })}
                          className="h-8 w-8 p-0 hover:bg-blue-100 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                        >
                          <Edit2 className="h-3 w-3 text-slate-600" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Bearbeiten</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteDialog({ isOpen: true, category })}
                          className="h-8 w-8 p-0 hover:bg-red-100 focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
                        >
                          <Trash2 className="h-3 w-3 text-red-600" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Löschen</TooltipContent>
                    </Tooltip>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add Category Button */}
          <Button
            onClick={() => setEditDialog({ isOpen: true })}
            variant="outline"
            className={cn(
              "w-full justify-center gap-2",
              "border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50",
              "focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            )}
          >
            <Plus className="h-4 w-4" />
            Neue Kategorie hinzufügen
          </Button>
        </CardContent>
      </Card>

      {/* Edit Category Dialog */}
      <EditCategoryDialog
        isOpen={editDialog.isOpen}
        category={editDialog.category}
        existingNames={categories.map(c => c.name)}
        onClose={() => setEditDialog({ isOpen: false })}
        onSave={editDialog.category ? 
          (data) => handleUpdate(editDialog.category!.id, data) :
          handleCreate
        }
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Kategorie entfernen"
        description="Diese Kategorie wird entfernt. Bereits bestehende Anrufe behalten ihren bisherigen Wert."
        onClose={() => setDeleteDialog({ isOpen: false })}
        onConfirm={() => deleteDialog.category && handleDelete(deleteDialog.category.id)}
      />
    </TooltipProvider>
  )
} 