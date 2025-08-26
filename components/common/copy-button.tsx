"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Copy, Check } from "lucide-react"
import { useState } from "react"

interface CopyButtonProps {
  text: string
  onCopy?: () => void
  variant?: "default" | "ghost" | "outline" | "secondary"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  children?: React.ReactNode
  ariaLabel?: string
}

export function CopyButton({ 
  text, 
  onCopy,
  variant = "ghost", 
  size = "sm", 
  className,
  children,
  ariaLabel = "Kopieren"
}: CopyButtonProps) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      
      toast({
        title: "Kopiert",
        description: "Text wurde in die Zwischenablage kopiert.",
      })
      
      onCopy?.()
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
      toast({
        title: "Fehler",
        description: "Text konnte nicht kopiert werden.",
        variant: "destructive"
      })
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={cn(
        // Design System: focus ring
        "focus:ring-2 focus:ring-blue-400 focus:ring-offset-2",
        className
      )}
      aria-label={ariaLabel}
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
      {children && <span className="ml-1">{children}</span>}
    </Button>
  )
} 