"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { Users, Plus, MoreHorizontal, Edit, Trash2, UserCheck, Shield, Mail } from "lucide-react"

interface User {
  id: string
  email: string
  role: "admin" | "staff"
  createdAt: string
  lastLoginAt?: string
  isActive: boolean
}

const mockUsers: User[] = [
  {
    id: "1",
    email: "dr.mueller@praxis.de",
    role: "admin",
    createdAt: "2024-01-01T00:00:00Z",
    lastLoginAt: "2024-01-15T10:30:00Z",
    isActive: true
  },
  {
    id: "2", 
    email: "schwester.anna@praxis.de",
    role: "staff",
    createdAt: "2024-01-05T00:00:00Z",
    lastLoginAt: "2024-01-14T16:45:00Z",
    isActive: true
  },
  {
    id: "3",
    email: "empfang@praxis.de", 
    role: "staff",
    createdAt: "2024-01-10T00:00:00Z",
    isActive: false
  }
]

export default function UsersSettingsPage() {
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newUser, setNewUser] = useState({
    email: "",
    role: "staff" as "admin" | "staff"
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleAddUser = async () => {
    if (!newUser.email) return
    
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const user: User = {
      id: Date.now().toString(),
      email: newUser.email,
      role: newUser.role,
      createdAt: new Date().toISOString(),
      isActive: true
    }
    
    setUsers(prev => [...prev, user])
    setNewUser({ email: "", role: "staff" })
    setIsAddDialogOpen(false)
    setIsLoading(false)
  }

  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId))
  }

  const handleToggleStatus = (userId: string) => {
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, isActive: !u.isActive } : u
    ))
  }

  const getInitials = (email: string) => {
    return email.split('@')[0].split('.').map(part => part[0]).join('').toUpperCase().slice(0, 2)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRoleBadge = (role: string) => {
    return role === "admin" ? (
      <Badge className="status-info">
        <Shield className="h-3 w-3 mr-1" />
        Administrator
      </Badge>
    ) : (
      <Badge variant="outline">
        <UserCheck className="h-3 w-3 mr-1" />
        Mitarbeiter
      </Badge>
    )
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="status-success">Aktiv</Badge>
    ) : (
      <Badge className="status-error">Inaktiv</Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Benutzerverwaltung</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Benutzerkonten und Berechtigungen für Ihre Praxis
          </p>
        </div>
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-medical-gradient hover:shadow-lg transition-all"
        >
          <Plus className="h-4 w-4 mr-2" />
          Benutzer hinzufügen
        </Button>
      </div>

      {/* Users Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gesamt Benutzer</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktive Benutzer</p>
                <p className="text-2xl font-bold">{users.filter(u => u.isActive).length}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Administratoren</p>
                <p className="text-2xl font-bold">{users.filter(u => u.role === "admin").length}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Benutzer</h3>
              <p className="text-sm text-muted-foreground">
                Alle Benutzerkonten in Ihrer Praxis
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div 
                key={user.id} 
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {getInitials(user.email)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{user.email.split('@')[0]}</p>
                      {getRoleBadge(user.role)}
                      {getStatusBadge(user.isActive)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {user.email}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Erstellt am {formatDate(user.createdAt)}
                      {user.lastLoginAt && (
                        <span> • Zuletzt angemeldet: {formatDate(user.lastLoginAt)}</span>
                      )}
                    </div>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Bearbeiten
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleToggleStatus(user.id)}
                      className={user.isActive ? "text-yellow-600" : "text-green-600"}
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      {user.isActive ? "Deaktivieren" : "Aktivieren"}
                    </DropdownMenuItem>
                    {user.role !== "admin" && (
                      <DropdownMenuItem 
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Löschen
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neuen Benutzer hinzufügen</DialogTitle>
            <DialogDescription>
              Erstellen Sie ein neues Benutzerkonto für Ihre Praxis
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail-Adresse</Label>
              <Input
                id="email"
                type="email"
                placeholder="benutzer@praxis.de"
                value={newUser.email}
                onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rolle</Label>
              <select
                id="role"
                value={newUser.role}
                onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value as "admin" | "staff" }))}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="staff">Mitarbeiter</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                Der neue Benutzer erhält eine E-Mail mit Anmeldedaten und muss beim ersten Login ein neues Passwort festlegen.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button 
              onClick={handleAddUser} 
              disabled={isLoading || !newUser.email}
              className="bg-medical-gradient hover:shadow-lg transition-all"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Erstellen...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Benutzer erstellen
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
