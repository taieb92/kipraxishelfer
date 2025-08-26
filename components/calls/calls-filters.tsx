"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SearchInput } from "@/components/common/search-input"
import { cn } from "@/lib/utils"
import { CalendarIcon, X } from "lucide-react"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import type { CallStatus, CallCategory } from "@/lib/types"

export interface CallFilters {
  status?: CallStatus | "all"
  dateRange?: { from: Date; to: Date }
  categories: CallCategory[]
  searchQuery?: string
}

interface CallsFiltersProps {
  onFiltersChange: (filters: CallFilters) => void
}

// Filter options
const statuses: Array<{ value: CallStatus | "all"; label: string }> = [
  { value: "all", label: "Alle Status" },
  { value: "action_needed", label: "Aktion erforderlich" },
  { value: "booking_made", label: "Termin gebucht" },
  { value: "completed", label: "Abgeschlossen" },
  { value: "failed", label: "Fehlgeschlagen" },
]

const categories: Array<{ value: CallCategory; label: string }> = [
  { value: "appointment", label: "Termine" },
  { value: "receipt", label: "Rezepte" },
  { value: "sick_note", label: "Krankschreibungen" },
  { value: "info", label: "Informationen" },
  { value: "other", label: "Sonstiges" },
  { value: "unknown", label: "Unbekannt" },
]

const dateRangePresets = [
  { label: "Heute", days: 0 },
  { label: "Letzte 7 Tage", days: 7 },
  { label: "Letzte 30 Tage", days: 30 },
]

export function CallsFilters({ onFiltersChange }: CallsFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [filters, setFilters] = useState<CallFilters>({
    status: "action_needed", // Default as specified
    categories: [],
    searchQuery: ""
  })
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

  // Initialize filters from URL params
  useEffect(() => {
    const urlStatus = searchParams.get('status') as CallStatus | "all" || "action_needed"
    const urlQuery = searchParams.get('q') || ""
    const urlCats = searchParams.get('cats')?.split(',').filter(Boolean) as CallCategory[] || []
    const urlFrom = searchParams.get('from')
    const urlTo = searchParams.get('to')

    let dateRange: { from: Date; to: Date } | undefined
    if (urlFrom && urlTo) {
      dateRange = {
        from: new Date(urlFrom),
        to: new Date(urlTo)
      }
    }

    const urlFilters: CallFilters = {
      status: urlStatus,
      categories: urlCats,
      searchQuery: urlQuery,
      dateRange
    }

    setFilters(urlFilters)
    // Don't call onFiltersChange here to avoid infinite loop
    // The parent will call this effect and get the initial state
  }, [searchParams])

  // Update URL when filters change
  const updateURL = (newFilters: CallFilters) => {
    const params = new URLSearchParams()
    
    if (newFilters.status && newFilters.status !== "all") {
      params.set('status', newFilters.status)
    }
    
    if (newFilters.searchQuery) {
      params.set('q', newFilters.searchQuery)
    }
    
    if (newFilters.categories.length > 0) {
      params.set('cats', newFilters.categories.join(','))
    }
    
    if (newFilters.dateRange) {
      params.set('from', format(newFilters.dateRange.from, 'yyyy-MM-dd'))
      params.set('to', format(newFilters.dateRange.to, 'yyyy-MM-dd'))
    }

    router.push(`/calls?${params.toString()}`, { scroll: false })
  }

  const updateFilters = (newFilters: Partial<CallFilters>) => {
    const updated = { ...filters, ...newFilters }
    setFilters(updated)
    onFiltersChange(updated)
    updateURL(updated)
  }

  // Quick "Action Needed only" toggle
  const handleActionNeededToggle = () => {
    const newStatus = filters.status === "action_needed" ? "all" : "action_needed"
    updateFilters({ status: newStatus })
  }

  // Category toggle
  const toggleCategory = (category: CallCategory) => {
    const isSelected = filters.categories.includes(category)
    const newCategories = isSelected
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category]
    
    updateFilters({ categories: newCategories })
  }

  // Date range handlers
  const handleDateRangePreset = (days: number) => {
    if (days === 0) {
      // Today
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const endOfDay = new Date(today)
      endOfDay.setHours(23, 59, 59, 999)
      
      updateFilters({
        dateRange: { from: today, to: endOfDay }
      })
    } else {
      // Last N days
      const to = new Date()
      to.setHours(23, 59, 59, 999)
      const from = new Date()
      from.setDate(from.getDate() - days)
      from.setHours(0, 0, 0, 0)
      
      updateFilters({
        dateRange: { from, to }
      })
    }
    setIsDatePickerOpen(false)
  }

  const handleCustomDateRange = (range: any) => {
    if (range?.from && range?.to) {
      updateFilters({
        dateRange: { from: range.from, to: range.to }
      })
      setIsDatePickerOpen(false)
    }
  }

  const clearDateRange = () => {
    updateFilters({ dateRange: undefined })
  }

  const getDateRangeLabel = () => {
    if (!filters.dateRange) return "Zeitraum wählen"
    
    const { from, to } = filters.dateRange
    return `${format(from, 'd. MMM', { locale: de })} - ${format(to, 'd. MMM', { locale: de })}`
  }

  return (
    <div className="space-y-4">
      {/* Main filter row: Status → Date range → Search */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700">Status:</label>
          <Select
            value={filters.status || "all"}
            onValueChange={(value) => updateFilters({ status: value as CallStatus | "all" })}
          >
            <SelectTrigger className="w-48 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Action Needed Quick Toggle */}
        <Button
          variant={filters.status === "action_needed" ? "default" : "outline"}
          size="sm"
          onClick={handleActionNeededToggle}
          className={cn(
            "px-3 py-1 text-sm font-medium rounded-full transition-all",
            filters.status === "action_needed" 
              ? "bg-yellow-600 text-white hover:bg-yellow-700" 
              : "border-yellow-300 text-yellow-700 hover:bg-yellow-50"
          )}
        >
          Nur Aktionen
        </Button>

        {/* Date Range Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700">Zeitraum:</label>
          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-48 justify-start text-left font-normal",
                  !filters.dateRange && "text-slate-500",
                  "focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {getDateRangeLabel()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-4 space-y-4">
                {/* Quick presets */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-slate-900">Schnellauswahl</h4>
                  <div className="grid grid-cols-1 gap-1">
                    {dateRangePresets.map((preset) => (
                      <Button
                        key={preset.days}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDateRangePreset(preset.days)}
                        className="justify-start text-sm"
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                </div>
                
                {/* Custom calendar */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-slate-900 mb-2">Benutzerdefiniert</h4>
                  <Calendar
                    mode="range"
                    selected={filters.dateRange}
                    onSelect={handleCustomDateRange}
                    numberOfMonths={2}
                    locale={de}
                  />
                </div>
                
                {/* Clear button */}
                {filters.dateRange && (
                  <div className="border-t pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearDateRange}
                      className="w-full"
                    >
                      Zeitraum entfernen
                    </Button>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Search Input */}
        <div className="flex-1 min-w-[200px]">
          <SearchInput
            value={filters.searchQuery}
            placeholder="Suche nach Name oder Nummer"
            onSearch={(query) => updateFilters({ searchQuery: query })}
            className="w-full"
          />
        </div>
      </div>

      {/* Category chips row */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Kategorien:</label>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const isSelected = filters.categories.includes(category.value)
            return (
              <Button
                key={category.value}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => toggleCategory(category.value)}
                className={cn(
                  "h-8 px-3 text-xs rounded-full transition-all",
                  isSelected 
                    ? "bg-blue-600 text-white hover:bg-blue-700" 
                    : "border-slate-300 text-slate-700 hover:bg-slate-50",
                  "focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                )}
              >
                {category.label}
                {isSelected && (
                  <X className="ml-1 h-3 w-3" />
                )}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Active filters summary */}
      {(filters.status !== "all" || filters.categories.length > 0 || filters.dateRange || filters.searchQuery) && (
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span>Aktive Filter:</span>
          <div className="flex flex-wrap gap-1">
            {filters.status !== "all" && (
              <Badge variant="secondary" className="text-xs">
                Status: {statuses.find(s => s.value === filters.status)?.label}
              </Badge>
            )}
            {filters.dateRange && (
              <Badge variant="secondary" className="text-xs">
                {getDateRangeLabel()}
              </Badge>
            )}
            {filters.categories.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {filters.categories.length} Kategorie{filters.categories.length !== 1 ? 'n' : ''}
              </Badge>
            )}
            {filters.searchQuery && (
              <Badge variant="secondary" className="text-xs">
                Suche: "{filters.searchQuery}"
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
