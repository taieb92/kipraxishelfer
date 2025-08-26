"use client"

import React, { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SearchInputProps {
  value?: string
  placeholder?: string
  onSearch: (query: string) => void
  debounceMs?: number
  className?: string
}

export function SearchInput({ 
  value = "", 
  placeholder = "Search...", 
  onSearch, 
  debounceMs = 300,
  className 
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value)
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null)

  // Sync with external value changes
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  // Handle input changes with debouncing
  const handleInputChange = (inputValue: string) => {
    setLocalValue(inputValue)
    
    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
    
    // Set new timer
    const timer = setTimeout(() => {
      onSearch(inputValue)
    }, debounceMs)
    
    setDebounceTimer(timer)
  }

  // Clear search
  const handleClear = () => {
    setLocalValue("")
    onSearch("")
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
  }

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
    }
  }, [debounceTimer])

  return (
    <div className={cn("relative", className)}>
      {/* Search icon */}
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      
      {/* Input field */}
      <Input
        type="text"
        value={localValue}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "pl-10 pr-10",
          // Design System: focus ring
          "focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
        )}
        aria-label={placeholder}
      />
      
      {/* Clear button */}
      {localValue && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0 hover:bg-slate-100"
          aria-label="Clear search"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
} 