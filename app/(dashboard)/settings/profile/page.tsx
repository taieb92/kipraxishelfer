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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Profil</h1>
        <p className="text-slate-600">
          Verwalten Sie Ihre persönlichen Einstellungen und Sicherheit
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Information */}
        <Card className={cn(
          "bg-gradient-to-b from-white to-slate-50",
          "border-slate-200 shadow-md rounded-2xl"
        )}>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 border border-blue-200">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Profil</h3>
                <p className="text-sm text-slate-600">
                  Persönliche Informationen
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-900 font-medium">
                Name *
              </Label>
              <Input
                id="name"
                value={profileForm.name}
                onChange={(e) => {
                  setProfileForm(prev => ({ ...prev, name: e.target.value }))
                  setProfileErrors([])
                }}
                className={cn(
                  "focus:ring-2 focus:ring-blue-400 focus:ring-offset-2",
                  profileErrors.some(e => e.includes("Name")) && "border-red-500"
                )}
                disabled={isSaving}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-900 font-medium">
                E-Mail *
              </Label>
              <Input
                id="email"
                type="email"
                value={profileForm.email}
                onChange={(e) => {
                  setProfileForm(prev => ({ ...prev, email: e.target.value }))
                  setProfileErrors([])
                }}
                className={cn(
                  "focus:ring-2 focus:ring-blue-400 focus:ring-offset-2",
                  profileErrors.some(e => e.includes("E-Mail")) && "border-red-500"
                )}
                disabled={isSaving}
              />
            </div>

            {/* Role (Read-only) */}
            <div className="space-y-2">
              <Label className="text-slate-900 font-medium">
                Rolle
              </Label>
              <Input
                value={profile.role}
                readOnly
                className="bg-slate-50 text-slate-600"
              />
            </div>

            {/* Practice Name (Read-only) */}
            <div className="space-y-2">
              <Label className="text-slate-900 font-medium">
                Praxisname
              </Label>
              <Input
                value={profile.practiceName}
                readOnly
                className="bg-slate-50 text-slate-600"
              />
            </div>

            {/* Profile Validation Errors */}
            {profileErrors.length > 0 && (
              <div className="space-y-2">
                {profileErrors.map((error, index) => (
                  <Alert key={index} variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ))}
              </div>
            )}

            {/* Profile Actions */}
            <div className="flex justify-between pt-4 border-t border-slate-200">
              <Button
                variant="outline"
                onClick={handleLogout}
                className="focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Abmelden
              </Button>
              
              <Button
                onClick={handleProfileSave}
                disabled={isSaving}
                className={cn(
                  "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800",
                  "text-white shadow-md",
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
                    Speichern
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Password Change */}
        <Card className={cn(
          "bg-gradient-to-b from-white to-slate-50",
          "border-slate-200 shadow-md rounded-2xl"
        )}>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 border border-amber-200">
                <Lock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Passwort ändern</h3>
                <p className="text-sm text-slate-600">
                  Sicherheit Ihres Kontos
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-slate-900 font-medium">
                Aktuelles Passwort *
              </Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => {
                  setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))
                  setPasswordErrors([])
                }}
                className={cn(
                  "focus:ring-2 focus:ring-blue-400 focus:ring-offset-2",
                  passwordErrors.some(e => e.includes("Aktuelles")) && "border-red-500"
                )}
                disabled={isChangingPassword}
              />
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-slate-900 font-medium">
                Neues Passwort *
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => {
                  setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))
                  setPasswordErrors([])
                }}
                className={cn(
                  "focus:ring-2 focus:ring-blue-400 focus:ring-offset-2",
                  passwordErrors.some(e => e.includes("Neues Passwort")) && "border-red-500"
                )}
                disabled={isChangingPassword}
              />
              <p className="text-xs text-slate-500">
                Mindestens 10 Zeichen erforderlich
              </p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-900 font-medium">
                Neues Passwort wiederholen *
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => {
                  setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))
                  setPasswordErrors([])
                }}
                className={cn(
                  "focus:ring-2 focus:ring-blue-400 focus:ring-offset-2",
                  passwordErrors.some(e => e.includes("überein")) && "border-red-500"
                )}
                disabled={isChangingPassword}
              />
            </div>

            {/* Password Validation Errors */}
            {passwordErrors.length > 0 && (
              <div className="space-y-2">
                {passwordErrors.map((error, index) => (
                  <Alert key={index} variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ))}
              </div>
            )}

            {/* Password Actions */}
            <div className="flex justify-end pt-4 border-t border-slate-200">
              <Button
                onClick={handlePasswordChange}
                disabled={isChangingPassword || !passwordForm.currentPassword || !passwordForm.newPassword}
                className={cn(
                  "bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800",
                  "text-white shadow-md",
                  "focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
                )}
              >
                {isChangingPassword ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Ändern...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Passwort ändern
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 