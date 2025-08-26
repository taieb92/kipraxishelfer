"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth"

import { cn } from "@/lib/utils"
import { Eye, EyeOff, Loader2, Stethoscope, AlertCircle, CheckCircle2 } from "lucide-react"

export function LoginForm() {
  const { login, isLoading } = useAuth()
  const router = useRouter()
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isFormValid, setIsFormValid] = useState(false)

  const validateForm = () => {
    const isValid = credentials.email.length > 0 && credentials.password.length > 0
    setIsFormValid(isValid)
    return isValid
  }

  const handleInputChange = (field: string, value: string) => {
    const newCredentials = { ...credentials, [field]: value }
    setCredentials(newCredentials)
    setError("")
    
    // Real-time validation
    const isValid = newCredentials.email.length > 0 && newCredentials.password.length > 0
    setIsFormValid(isValid)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateForm()) {
      setError("Bitte geben Sie E-Mail und Passwort ein.")
      return
    }

    try {
      const success = await login(credentials.email, credentials.password)
      if (success) {
        router.push("/dashboard")
      } else {
        setError("Ungültige Anmeldedaten. Bitte versuchen Sie es erneut.")
      }
    } catch (err) {
      setError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.")
    }
  }

  const handleDemoLogin = () => {
    setCredentials({
      email: "dr.mueller@praxis.de",
      password: "demo123"
    })
    setIsFormValid(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4">
      <div className="absolute inset-0 bg-medical-gradient opacity-5"></div>
      
      <Card className="w-full max-w-md relative z-10 card-elevated shadow-2xl border-0">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-medical-gradient shadow-medical">
              <Stethoscope className="h-8 w-8 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold text-slate-900">
              kipraxishelfer
            </CardTitle>
            <CardDescription className="text-base text-slate-600">
              Melden Sie sich in Ihrem Konto an
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <Alert variant="destructive" className="animate-fade-in">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                E-Mail-Adresse
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={credentials.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="ihre.email@praxis.de"
                  disabled={isLoading}
                  className={cn(
                    "h-12 text-base transition-all duration-200",
                    "focus:ring-2 focus:ring-primary focus:border-primary",
                    credentials.email && "pr-10"
                  )}
                  aria-describedby="email-help"
                  autoComplete="email"
                />
                {credentials.email && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Passwort
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={credentials.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder="Ihr Passwort"
                  disabled={isLoading}
                  className={cn(
                    "h-12 text-base pr-12 transition-all duration-200",
                    "focus:ring-2 focus:ring-primary focus:border-primary"
                  )}
                  autoComplete="current-password"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {credentials.password && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className={cn(
                "w-full h-12 text-base font-medium transition-all duration-200",
                "bg-medical-gradient hover:shadow-lg hover:-translate-y-0.5",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              )}
              disabled={isLoading || !isFormValid}
            >
              {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {isLoading ? "Anmeldung..." : "Anmelden"}
            </Button>
          </form>

          {/* Demo Section */}
          <div className="pt-6 border-t border-border">
            <div className="text-center space-y-4">
              <div className="text-sm text-muted-foreground">
                <div className="font-medium mb-2">Demo-Zugang:</div>
                <div className="space-y-1 text-xs">
                  <div>E-Mail: dr.mueller@praxis.de</div>
                  <div>Passwort: demo123</div>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleDemoLogin}
                disabled={isLoading}
                className="w-full h-10 text-sm hover:bg-primary/5 hover:border-primary/30"
              >
                Demo-Daten verwenden
              </Button>
            </div>
          </div>

          {/* Security Note */}
          <div className="text-xs text-center text-muted-foreground bg-muted/30 rounded-lg p-3">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Stethoscope className="h-3 w-3" />
              <span className="font-medium">Sicher & GDPR-konform</span>
            </div>
            <div>Ihre Daten werden verschlüsselt übertragen und gespeichert</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

