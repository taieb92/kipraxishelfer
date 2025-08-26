"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Calendar, Globe, Settings, AlertTriangle, CheckCircle, XCircle } from "lucide-react"

interface DoctolibSettings {
  username: string
  password: string
  practiceId: string
  syncEnabled: boolean
  syncInterval: '15min' | '30min' | '1hour' | 'manual'
  autoSync: boolean
}

export default function DoctolibPage() {
  const { toast } = useToast()
  
  const [settings, setSettings] = useState<DoctolibSettings>({
    username: "",
    password: "",
    practiceId: "",
    syncEnabled: false,
    syncInterval: '30min',
    autoSync: true
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'connected' | 'failed'>('idle')

  const handleTestConnection = async () => {
    setIsLoading(true)
    setConnectionStatus('testing')
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const success = Math.random() > 0.3 // 70% success rate
    if (success) {
      setConnectionStatus('connected')
      setIsConnected(true)
      toast({
        title: "Verbindung erfolgreich",
        description: "Doctolib-Integration ist aktiv und funktioniert.",
      })
    } else {
      setConnectionStatus('failed')
      setIsConnected(false)
      toast({
        title: "Verbindung fehlgeschlagen",
        description: "Überprüfen Sie Ihre Anmeldedaten und versuchen Sie es erneut.",
        variant: "destructive"
      })
    }
    
    setIsLoading(false)
  }

  const handleSave = async () => {
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    toast({
      title: "Einstellungen gespeichert",
      description: "Ihre Doctolib-Einstellungen wurden erfolgreich aktualisiert.",
    })
    
    setIsLoading(false)
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Doctolib Integration</h1>
            <p className="text-slate-600 mt-1">
              Verbinden Sie Ihre Praxis mit Doctolib für automatische Termin-Synchronisation
            </p>
          </div>
          
          {/* Action buttons - Responsive */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestConnection}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              <Globe className="h-4 w-4 mr-2" />
              {isLoading ? "Teste..." : "Verbindung testen"}
            </Button>
            
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              <Settings className="h-4 w-4 mr-2" />
              {isLoading ? "Speichern..." : "Speichern"}
            </Button>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      <Card className="bg-gradient-to-b from-white to-slate-50 border-slate-200 shadow-md rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-slate-900">
            <Globe className="h-5 w-5 text-blue-600" />
            <span>Verbindungsstatus</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            {connectionStatus === 'idle' && (
              <div className="w-3 h-3 bg-slate-300 rounded-full" />
            )}
            {connectionStatus === 'testing' && (
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
            )}
            {connectionStatus === 'connected' && (
              <CheckCircle className="h-5 w-5 text-green-600" />
            )}
            {connectionStatus === 'failed' && (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            
            <span className="text-sm font-medium text-slate-700">
              {connectionStatus === 'idle' && "Nicht verbunden"}
              {connectionStatus === 'testing' && "Teste Verbindung..."}
              {connectionStatus === 'connected' && "Verbunden"}
              {connectionStatus === 'failed' && "Verbindung fehlgeschlagen"}
            </span>
          </div>
          
          {connectionStatus === 'connected' && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Doctolib-Integration ist aktiv. Termine werden automatisch synchronisiert.
              </AlertDescription>
            </Alert>
          )}
          
          {connectionStatus === 'failed' && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Die Verbindung zu Doctolib konnte nicht hergestellt werden. 
                Überprüfen Sie Ihre Anmeldedaten und versuchen Sie es erneut.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Main Settings */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Connection Settings */}
        <Card className="bg-gradient-to-b from-white to-slate-50 border-slate-200 shadow-md rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-slate-900">Verbindungseinstellungen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-slate-700">
                  Benutzername
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={settings.username}
                  onChange={(e) => setSettings(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Ihr Doctolib-Benutzername"
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Passwort
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={settings.password}
                  onChange={(e) => setSettings(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Ihr Doctolib-Passwort"
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="practiceId" className="text-sm font-medium text-slate-700">
                  Praxis-ID
                </Label>
                <Input
                  id="practiceId"
                  type="text"
                  value={settings.practiceId}
                  onChange={(e) => setSettings(prev => ({ ...prev, practiceId: e.target.value }))}
                  placeholder="Doctolib Praxis-ID"
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sync Settings */}
        <Card className="bg-gradient-to-b from-white to-slate-50 border-slate-200 shadow-md rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-slate-900">Synchronisation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="syncInterval" className="text-sm font-medium text-slate-700">
                  Synchronisationsintervall
                </Label>
                <Select 
                  value={settings.syncInterval} 
                  onValueChange={(value: '15min' | '30min' | '1hour' | 'manual') => 
                    setSettings(prev => ({ ...prev, syncInterval: value }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15min">Alle 15 Minuten</SelectItem>
                    <SelectItem value="30min">Alle 30 Minuten</SelectItem>
                    <SelectItem value="1hour">Stündlich</SelectItem>
                    <SelectItem value="manual">Manuell</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="autoSync" className="text-sm font-medium text-slate-700">
                  Automatische Synchronisation
                </Label>
                <div className="flex items-center space-x-2">
                  <input
                    id="autoSync"
                    type="checkbox"
                    checked={settings.autoSync}
                    onChange={(e) => setSettings(prev => ({ ...prev, autoSync: e.target.checked }))}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-600">
                    Termine automatisch mit Doctolib synchronisieren
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Help and Information */}
      <Card className="bg-gradient-to-b from-white to-slate-50 border-slate-200 shadow-md rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-slate-900">Hilfe & Informationen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium text-slate-900">Vorteile der Integration</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                  <span>Automatische Termin-Synchronisation</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                  <span>Reduzierung von Doppelbuchungen</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                  <span>Zentrale Terminverwaltung</span>
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-slate-900">Sicherheit</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                  <span>Verschlüsselte Datenübertragung</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                  <span>DSGVO-konforme Verarbeitung</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                  <span>Keine Speicherung von Passwörtern</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Wichtiger Hinweis</h4>
            <p className="text-sm text-blue-800">
              Stellen Sie sicher, dass Sie über ein aktives Doctolib-Konto verfügen und 
              die entsprechenden Berechtigungen für die API-Integration haben. 
              Bei Problemen wenden Sie sich an den Doctolib-Support.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
