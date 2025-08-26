"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { MessageSquare, Play, Pause, Volume2, Save, AlertTriangle } from "lucide-react"

interface GreetingSettings {
  text: string
  voice: 'female' | 'male'
}

// Mock API functions
const fetchGreetingSettings = async (): Promise<GreetingSettings> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))
  return {
    text: "Willkommen in der Praxis {Praxisname}. Dieser Anruf kann zu Dokumentationszwecken aufgezeichnet werden. Mit Fortfahren stimmen Sie zu. In Notfällen wählen Sie bitte die 112.",
    voice: 'female'
  }
}

const saveGreetingSettings = async (settings: GreetingSettings) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  return { ok: true }
}

const previewGreeting = async (settings: GreetingSettings) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800))
  return { url: "/audio/preview.mp3" }
}

export default function GreetingSettingsPage() {
  const { toast } = useToast()
  const [settings, setSettings] = useState<GreetingSettings>({
    text: "",
    voice: 'female'
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await fetchGreetingSettings()
        setSettings(data)
      } catch (error) {
        console.error('Error loading greeting settings:', error)
        toast({
          title: "Fehler",
          description: "Einstellungen konnten nicht geladen werden.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [toast])

  // Validation
  const validateSettings = (settingsToValidate: GreetingSettings): string[] => {
    const errors: string[] = []
    
    if (!settingsToValidate.text.trim()) {
      errors.push("Begrüßungstext ist erforderlich.")
    } else if (settingsToValidate.text.length < 10) {
      errors.push("Begrüßungstext muss mindestens 10 Zeichen lang sein.")
    } else if (settingsToValidate.text.length > 320) {
      errors.push("Begrüßungstext darf maximal 320 Zeichen lang sein.")
    }

    // Emergency disclaimer suggestion (soft warning)
    if (!settingsToValidate.text.includes("112")) {
      errors.push("Tipp: Erwägen Sie, einen Notfall-Hinweis mit '112' zu ergänzen.")
    }

    return errors
  }

  const handleTextChange = (text: string) => {
    const newSettings = { ...settings, text }
    setSettings(newSettings)
    setValidationErrors(validateSettings(newSettings))
  }

  const handleVoiceChange = (voice: 'female' | 'male') => {
    setSettings(prev => ({ ...prev, voice }))
  }

  const handlePlayPreview = async () => {
    if (isPlaying) {
      // Stop current playback
      if (audioElement) {
        audioElement.pause()
        audioElement.currentTime = 0
      }
      setIsPlaying(false)
      return
    }

    try {
      setIsPlaying(true)
      const response = await previewGreeting(settings)
      
      // Create and play audio element
      const audio = new Audio(response.url)
      setAudioElement(audio)
      
      audio.onended = () => {
        setIsPlaying(false)
        setAudioElement(null)
      }
      
      audio.onerror = () => {
        setIsPlaying(false)
        setAudioElement(null)
        toast({
          title: "Fehler",
          description: "Vorschau konnte nicht abgespielt werden.",
          variant: "destructive"
        })
      }
      
      await audio.play()
    } catch (error) {
      console.error('Error playing preview:', error)
      setIsPlaying(false)
      toast({
        title: "Fehler",
        description: "Vorschau konnte nicht abgespielt werden.",
        variant: "destructive"
      })
    }
  }

  const handleSave = async () => {
    const errors = validateSettings(settings)
    const criticalErrors = errors.filter(e => !e.startsWith("Tipp:"))
    
    if (criticalErrors.length > 0) {
      setValidationErrors(errors)
      return
    }

    try {
      setIsSaving(true)
      await saveGreetingSettings(settings)
      
      toast({
        title: "Begrüßung gespeichert",
        description: "Die Einstellungen wurden erfolgreich gespeichert.",
      })
    } catch (error) {
      console.error('Error saving settings:', error)
      toast({
        title: "Fehler",
        description: "Einstellungen konnten nicht gespeichert werden.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-slate-200 animate-pulse rounded" />
          <div className="h-4 w-96 bg-slate-200 animate-pulse rounded" />
        </div>
        
        <div className="grid gap-6">
          <div className="h-64 bg-slate-200 animate-pulse rounded-2xl" />
          <div className="h-32 bg-slate-200 animate-pulse rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Begrüßung</h1>
        <p className="text-slate-600">
          Konfigurieren Sie die Begrüßung für eingehende Anrufe
        </p>
      </div>

      <div className="grid gap-6 max-w-4xl">
        {/* Greeting Text */}
        <Card className={cn(
          // Design System: card gradient background
          "bg-gradient-to-b from-white to-slate-50",
          // Design System: border and shadow
          "border-slate-200 shadow-md rounded-2xl"
        )}>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 border border-blue-200">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Begrüßungstext</h3>
                <p className="text-sm text-slate-600">
                  Text, der bei eingehenden Anrufen abgespielt wird
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="greeting" className="text-slate-900 font-medium">
                Begrüßungstext *
              </Label>
              <Textarea
                id="greeting"
                value={settings.text}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder="Geben Sie Ihren Begrüßungstext ein..."
                className={cn(
                  "min-h-[120px]",
                  // Design System: focus ring
                  "focus:ring-2 focus:ring-blue-400 focus:ring-offset-2",
                  validationErrors.some(e => !e.startsWith("Tipp:")) && "border-red-500"
                )}
                maxLength={320}
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-500">
                  Verwenden Sie {"{Praxisname}"} als Platzhalter für den Namen Ihrer Praxis
                </p>
                <span className="text-xs text-slate-500">
                  {settings.text.length}/320
                </span>
              </div>
            </div>

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="space-y-2">
                {validationErrors.map((error, index) => (
                  <Alert key={index} variant={error.startsWith("Tipp:") ? "default" : "destructive"}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handlePlayPreview}
                disabled={!settings.text.trim() || validationErrors.some(e => !e.startsWith("Tipp:"))}
                className={cn(
                  "flex items-center gap-2",
                  // Design System: focus ring
                  "focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                )}
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-4 w-4" />
                    Stoppen
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Vorschau anhören
                  </>
                )}
              </Button>
              
              {isPlaying && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Volume2 className="h-4 w-4 animate-pulse" />
                  Begrüßung wird abgespielt...
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Voice Settings */}
        <Card className={cn(
          // Design System: card gradient background
          "bg-gradient-to-b from-white to-slate-50",
          // Design System: border and shadow
          "border-slate-200 shadow-md rounded-2xl"
        )}>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-slate-900">
              Stimme
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Label className="text-slate-900 font-medium">Geschlecht der Stimme *</Label>
              <RadioGroup 
                value={settings.voice} 
                onValueChange={handleVoiceChange}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value="female" 
                    id="female"
                    className="focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                  />
                  <Label htmlFor="female" className="text-slate-700 cursor-pointer">
                    Weiblich
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value="male" 
                    id="male"
                    className="focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                  />
                  <Label htmlFor="male" className="text-slate-700 cursor-pointer">
                    Männlich
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={isSaving || validationErrors.some(e => !e.startsWith("Tipp:"))}
            className={cn(
              // Design System: medical gradient on primary actions
              "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800",
              "text-white shadow-md",
              // Design System: focus ring
              "focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            )}
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Speichern...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Einstellungen speichern
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
