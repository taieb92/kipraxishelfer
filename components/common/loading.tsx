"use client"

import { Loader2, Stethoscope, Activity } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingProps {
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "default" | "medical" | "minimal"
  text?: string
  className?: string
}

export function Loading({ 
  size = "md", 
  variant = "default", 
  text = "Laden...", 
  className 
}: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8",
    xl: "h-12 w-12"
  }

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg", 
    xl: "text-xl"
  }

  if (variant === "medical") {
    return (
      <div className={cn("flex flex-col items-center justify-center space-y-4", className)}>
        <div className="relative">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-medical-gradient shadow-medical">
            <Stethoscope className="h-8 w-8 text-white" />
          </div>
          <div className="absolute inset-0 rounded-2xl bg-medical-gradient animate-ping opacity-20"></div>
        </div>
        <div className="text-center space-y-2">
          <div className={cn("font-medium text-foreground", textSizeClasses[size])}>
            {text}
          </div>
          <div className="flex items-center justify-center space-x-1">
            <Activity className="h-4 w-4 text-primary animate-pulse" />
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (variant === "minimal") {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-3", className)}>
      <div className="relative">
        <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
        <div className={cn(
          "absolute inset-0 animate-ping rounded-full bg-primary opacity-20",
          sizeClasses[size]
        )}></div>
      </div>
      {text && (
        <p className={cn("text-muted-foreground animate-pulse", textSizeClasses[size])}>
          {text}
        </p>
      )}
    </div>
  )
}

// Skeleton loading components
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("card-elevated animate-pulse", className)}>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-muted rounded w-24"></div>
          <div className="h-8 w-8 bg-muted rounded-full"></div>
        </div>
        <div className="h-8 bg-muted rounded w-16"></div>
        <div className="h-3 bg-muted rounded w-32"></div>
      </div>
    </div>
  )
}

export function SkeletonTable({ rows = 5, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("card-elevated", className)}>
      <div className="p-6">
        <div className="space-y-3">
          <div className="h-4 bg-muted rounded w-48"></div>
          <div className="space-y-2">
            {Array.from({ length: rows }).map((_, i) => (
              <div key={i} className="flex space-x-4">
                <div className="h-4 bg-muted rounded flex-1"></div>
                <div className="h-4 bg-muted rounded w-24"></div>
                <div className="h-4 bg-muted rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Full page loading overlay
export function LoadingOverlay({ isVisible, text = "Laden..." }: { isVisible: boolean; text?: string }) {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-card p-8 rounded-2xl shadow-2xl border">
        <Loading variant="medical" text={text} size="lg" />
      </div>
    </div>
  )
}

// Loading button state
export function LoadingButton({ 
  isLoading, 
  children, 
  loadingText = "Laden...",
  className,
  ...props 
}: {
  isLoading: boolean
  children: React.ReactNode
  loadingText?: string
  className?: string
  [key: string]: any
}) {
  return (
    <button 
      className={cn(
        "flex items-center justify-center gap-2 transition-all duration-200",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      disabled={isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      {isLoading ? loadingText : children}
    </button>
  )
}
