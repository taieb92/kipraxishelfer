"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { Shield, CheckCircle, AlertCircle, ExternalLink, Save } from "lucide-react"

export default function DoctolibSettingsPage() {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
    practiceId: ""
  })

  const handleConnect = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsConnected(true)
    setIsLoading(false)
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    setCredentials({ username: "", password: "", practiceId: "" })
  }

  const handleSave = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Doctolib Integration</h1>
        <p className="text-muted-foreground">
          Verbinden Sie Ihr Doctolib-Konto für automatische Terminverwaltung
        </p>
      </div>

      <div className="grid gap-6">
        {/* Connection Status */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Verbindungsstatus</h3>
                  <p className="text-sm text-muted-foreground">
                    Status Ihrer Doctolib Integration
                  </p>
                </div>
              </div>
              {isConnected ? (
                <Badge className="status-success">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verbunden
                </Badge>
              ) : (
                <Badge variant="outline" className="status-error">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Nicht verbunden
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isConnected ? (
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Ihre Doctolib Integration ist aktiv und synchronisiert Termine automatisch.
                  </AlertDescription>
                </Alert>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleDisconnect}>
                    Verbindung trennen
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="https://doctolib.de" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Doctolib öffnen
                    </a>
                  </Button>
                </div>
              </div>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Verbinden Sie Ihr Doctolib-Konto, um Termine automatisch zu verwalten.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Connection Setup */}
        {!isConnected && (
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Doctolib Konto verbinden
              </CardTitle>
              <CardDescription>
                Geben Sie Ihre Doctolib Anmeldedaten ein, um die Integration zu aktivieren
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Benutzername / E-Mail</Label>
                <Input
                  id="username"
                  type="email"
                  placeholder="ihre.email@praxis.de"
                  value={credentials.username}
                  onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Passwort</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="practiceId">Praxis ID (optional)</Label>
                <Input
                  id="practiceId"
                  placeholder="12345"
                  value={credentials.practiceId}
                  onChange={(e) => setCredentials(prev => ({ ...prev, practiceId: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  Ihre Praxis ID finden Sie in den Doctolib Einstellungen
                </p>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Ihre Anmeldedaten werden verschlüsselt gespeichert und nur für die API-Kommunikation mit Doctolib verwendet.
                </AlertDescription>
              </Alert>

              <Button 
                onClick={handleConnect} 
                disabled={isLoading || !credentials.username || !credentials.password}
                className="w-full bg-medical-gradient hover:shadow-lg transition-all"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Verbindung wird hergestellt...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Mit Doctolib verbinden
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Sync Settings */}
        {isConnected && (
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Synchronisations-Einstellungen
              </CardTitle>
              <CardDescription>
                Konfigurieren Sie, wie Termine synchronisiert werden sollen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Automatische Synchronisation</Label>
                  <p className="text-sm text-muted-foreground">
                    Termine alle 5 Minuten automatisch synchronisieren
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Neue Termine benachrichtigen</Label>
                  <p className="text-sm text-muted-foreground">
                    E-Mail Benachrichtigung bei neuen Terminen
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Stornierungen synchronisieren</Label>
                  <p className="text-sm text-muted-foreground">
                    Terminabsagen automatisch übertragen
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="pt-4 border-t">
                <Button 
                  onClick={handleSave} 
                  disabled={isLoading}
                  className="bg-medical-gradient hover:shadow-lg transition-all"
                >
                  {isLoading ? (
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
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
