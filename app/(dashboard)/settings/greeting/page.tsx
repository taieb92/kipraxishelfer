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
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Begrüßung & Einverständnis</h1>
          <p className="text-slate-600 mt-1">
            Konfigurieren Sie die automatische Begrüßung für eingehende Anrufe
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Greeting Settings */}
        <Card className="bg-gradient-to-b from-white to-slate-50 border-slate-200 shadow-md rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-slate-900">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <span>Begrüßungstext</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              <div className="space-y-4">
                <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
                <div className="h-32 bg-slate-200 rounded animate-pulse" />
                <div className="h-4 w-48 bg-slate-200 rounded animate-pulse" />
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="greetingText" className="text-sm font-medium text-slate-700">
                      Begrüßungstext
                    </Label>
                    <Textarea
                      id="greetingText"
                      value={settings.text}
                      onChange={(e) => handleTextChange(e.target.value)}
                      placeholder="Geben Sie den Begrüßungstext ein..."
                      className="min-h-[120px] resize-none"
                      disabled={isSaving}
                    />
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>
                        {settings.text.length}/320 Zeichen
                      </span>
                      <span>
                        {settings.text.length < 10 ? "Mindestens 10 Zeichen erforderlich" : "✓"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-slate-700">
                      Stimme
                    </Label>
                    <RadioGroup
                      value={settings.voice}
                      onValueChange={(value: 'female' | 'male') => handleVoiceChange(value)}
                      disabled={isSaving}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female" className="text-sm font-medium text-slate-700">
                          Weiblich
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male" className="text-sm font-medium text-slate-700">
                          Männlich
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                {validationErrors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <ul className="list-disc list-inside space-y-1">
                        {validationErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving || validationErrors.length > 0}
                    className="flex-1 sm:flex-none"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? "Speichern..." : "Speichern"}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handlePlayPreview}
                    disabled={isSaving || !settings.text.trim()}
                    className="flex-1 sm:flex-none"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Vorschau
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Preview and Help */}
        <div className="space-y-6">
          {/* Audio Preview */}
          <Card className="bg-gradient-to-b from-white to-slate-50 border-slate-200 shadow-md rounded-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2 text-slate-900">
                <Volume2 className="h-5 w-5 text-green-600" />
                <span>Audio-Vorschau</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-600 mb-3">
                  Hören Sie sich den aktuellen Begrüßungstext an:
                </p>
                
                {audioElement && (
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePlayPreview}
                      disabled={!settings.text.trim()}
                      className="flex items-center gap-2"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="h-4 w-4" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" />
                          Abspielen
                        </>
                      )}
                    </Button>
                    
                    <div className="text-xs text-slate-500">
                      {isPlaying ? "Wird abgespielt..." : "Bereit"}
                    </div>
                  </div>
                )}
                
                {!audioElement && (
                  <div className="text-sm text-slate-500 italic">
                    Klicken Sie auf "Vorschau" um den Audio-Player zu laden
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Help and Guidelines */}
          <Card className="bg-gradient-to-b from-white to-slate-50 border-slate-200 shadow-md rounded-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-slate-900">
                Richtlinien & Tipps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                  <span>Begrüßen Sie den Anrufer freundlich und professionell</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                  <span>Erklären Sie den Zweck der Aufzeichnung klar und verständlich</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                  <span>Fügen Sie wichtige Informationen wie Notfallnummern hinzu</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                  <span>Halten Sie den Text kurz und prägnant (max. 320 Zeichen)</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                  <span>Testen Sie die Vorschau vor dem Speichern</span>
                </div>
              </div>
              
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h4 className="font-medium text-amber-900 mb-2">Wichtiger Hinweis</h4>
                <p className="text-sm text-amber-800">
                  Der Begrüßungstext wird bei jedem eingehenden Anruf abgespielt. 
                  Stellen Sie sicher, dass alle rechtlichen Anforderungen erfüllt sind 
                  und der Text für Ihre Patienten verständlich ist.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
