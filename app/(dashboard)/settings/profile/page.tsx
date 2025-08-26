"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { User, Lock, LogOut, Save, AlertTriangle } from "lucide-react"

interface UserProfile {
  name: string
  email: string
  role: 'Arzt' | 'MFA' | 'Admin'
  practiceName: string
}

interface PasswordForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// Mock API functions
const fetchUserProfile = async (): Promise<UserProfile> => {
  await new Promise(resolve => setTimeout(resolve, 500))
  return {
    name: "Dr. Sarah Müller",
    email: "s.mueller@praxis-mueller.de",
    role: "Arzt",
    practiceName: "Praxis Dr. Müller"
  }
}

const updateUserProfile = async (data: { name: string; email: string }) => {
  await new Promise(resolve => setTimeout(resolve, 800))
  return { ok: true }
}

const changePassword = async (data: { currentPassword: string; newPassword: string }) => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  // Mock validation
  if (data.currentPassword !== "current123") {
    throw new Error("Aktuelles Passwort ist falsch")
  }
  return { ok: true }
}

export default function ProfilePage() {
  const { toast } = useToast()
  const { logout } = useAuth()
  
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: ""
  })
  
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  
  const [profileErrors, setProfileErrors] = useState<string[]>([])
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])

  // Load user profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchUserProfile()
        setProfile(data)
        setProfileForm({
          name: data.name,
          email: data.email
        })
      } catch (error) {
        console.error('Error loading profile:', error)
        toast({
          title: "Fehler",
          description: "Profil konnte nicht geladen werden.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [toast])

  // Profile validation
  const validateProfile = () => {
    const errors: string[] = []
    
    if (!profileForm.name.trim()) {
      errors.push("Name ist erforderlich.")
    } else if (profileForm.name.length < 2) {
      errors.push("Name muss mindestens 2 Zeichen lang sein.")
    }
    
    if (!profileForm.email.trim()) {
      errors.push("E-Mail ist erforderlich.")
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email)) {
      errors.push("Gültige E-Mail-Adresse erforderlich.")
    }
    
    return errors
  }

  // Password validation
  const validatePassword = () => {
    const errors: string[] = []
    
    if (!passwordForm.currentPassword) {
      errors.push("Aktuelles Passwort ist erforderlich.")
    }
    
    if (!passwordForm.newPassword) {
      errors.push("Neues Passwort ist erforderlich.")
    } else if (passwordForm.newPassword.length < 10) {
      errors.push("Neues Passwort muss mindestens 10 Zeichen lang sein.")
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.push("Passwörter stimmen nicht überein.")
    }
    
    return errors
  }

  const handleProfileSave = async () => {
    const errors = validateProfile()
    if (errors.length > 0) {
      setProfileErrors(errors)
      return
    }

    try {
      setIsSaving(true)
      setProfileErrors([])
      
      await updateUserProfile(profileForm)
      
      if (profile) {
        setProfile({
          ...profile,
          name: profileForm.name,
          email: profileForm.email
        })
      }
      
      toast({
        title: "Profil gespeichert",
        description: "Ihre Änderungen wurden erfolgreich gespeichert.",
      })
      
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Fehler",
        description: "Profil konnte nicht gespeichert werden.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    const errors = validatePassword()
    if (errors.length > 0) {
      setPasswordErrors(errors)
      return
    }

    try {
      setIsChangingPassword(true)
      setPasswordErrors([])
      
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })
      
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      })
      
      toast({
        title: "Passwort aktualisiert",
        description: "Ihr Passwort wurde erfolgreich geändert.",
      })
      
    } catch (error: any) {
      console.error('Error changing password:', error)
      setPasswordErrors([error.message || "Passwort konnte nicht geändert werden."])
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      toast({
        title: "Abgemeldet",
        description: "Sie wurden erfolgreich abgemeldet.",
      })
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  if (isLoading || !profile) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-32 bg-slate-200 animate-pulse rounded" />
          <div className="h-4 w-64 bg-slate-200 animate-pulse rounded" />
        </div>
        
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-80 bg-slate-200 animate-pulse rounded-2xl" />
          <div className="h-80 bg-slate-200 animate-pulse rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Profil</h1>
            <p className="text-slate-600 mt-1">
              Persönliche Einstellungen und Passwort ändern
            </p>
          </div>
          
          {/* Action buttons - Responsive */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="w-full sm:w-auto"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Abmelden
            </Button>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <Card className="bg-gradient-to-b from-white to-slate-50 border-slate-200 shadow-md rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-slate-900">
            <User className="h-5 w-5 text-blue-600" />
            <span>Profilinformationen</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-48 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-40 bg-slate-200 rounded animate-pulse" />
            </div>
          ) : profile ? (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
              {/* Profile Display */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Name</Label>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-slate-900 font-medium">{profile.name}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">E-Mail</Label>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-slate-900 font-medium">{profile.email}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Rolle</Label>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-slate-900 font-medium">{profile.role}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Praxis</Label>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-slate-900 font-medium">{profile.practiceName}</p>
                  </div>
                </div>
              </div>

              {/* Profile Edit Form */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Bearbeiten</h3>
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-slate-700">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ihr Name"
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                      E-Mail
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="ihre.email@example.com"
                      className="w-full"
                    />
                  </div>
                </div>

                {profileErrors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <ul className="list-disc list-inside space-y-1">
                        {profileErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handleProfileSave}
                  disabled={isSaving}
                  className="w-full sm:w-auto"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Speichern..." : "Speichern"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Profil konnte nicht geladen werden
              </h3>
              <p className="text-slate-600">
                Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card className="bg-gradient-to-b from-white to-slate-50 border-slate-200 shadow-md rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-slate-900">
            <Lock className="h-5 w-5 text-green-600" />
            <span>Passwort ändern</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
            {/* Password Form */}
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-sm font-medium text-slate-700">
                    Aktuelles Passwort
                  </Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Aktuelles Passwort"
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-sm font-medium text-slate-700">
                    Neues Passwort
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Neues Passwort"
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
                    Neues Passwort bestätigen
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Neues Passwort wiederholen"
                    className="w-full"
                  />
                </div>
              </div>

              {passwordErrors.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1">
                      {passwordErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handlePasswordChange}
                disabled={isChangingPassword}
                className="w-full sm:w-auto"
              >
                <Lock className="h-4 w-4 mr-2" />
                {isChangingPassword ? "Ändern..." : "Passwort ändern"}
              </Button>
            </div>

            {/* Password Requirements */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">Passwort-Anforderungen</h3>
              
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-slate-300 rounded-full mt-2 flex-shrink-0" />
                  <span>Mindestens 8 Zeichen</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-slate-300 rounded-full mt-2 flex-shrink-0" />
                  <span>Groß- und Kleinbuchstaben</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-slate-300 rounded-full mt-2 flex-shrink-0" />
                  <span>Zahlen und Sonderzeichen</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-slate-300 rounded-full mt-2 flex-shrink-0" />
                  <span>Nicht das aktuelle Passwort</span>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Sicherheitstipp</h4>
                <p className="text-sm text-blue-800">
                  Verwenden Sie ein einzigartiges Passwort, das Sie nirgendwo anders verwenden. 
                  Ein Passwort-Manager kann Ihnen dabei helfen, sichere Passwörter zu generieren und zu speichern.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 