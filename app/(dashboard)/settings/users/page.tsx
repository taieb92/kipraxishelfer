"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { User, UserPlus, Edit, Trash2, Shield, Users } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  role: 'Arzt' | 'MFA' | 'Admin'
  status: 'active' | 'inactive'
  lastLogin?: string
  avatar?: string
}

const mockUsers: User[] = [
  {
    id: "1",
    name: "Dr. Sarah Müller",
    email: "s.mueller@praxis-mueller.de",
    role: "Arzt",
    status: "active",
    lastLogin: "2024-01-15T10:30:00Z",
    avatar: "/avatars/sarah.jpg"
  },
  {
    id: "2",
    name: "Maria Schmidt",
    email: "m.schmidt@praxis-mueller.de",
    role: "MFA",
    status: "active",
    lastLogin: "2024-01-15T09:15:00Z",
    avatar: "/avatars/maria.jpg"
  },
  {
    id: "3",
    name: "Hans Weber",
    email: "h.weber@praxis-mueller.de",
    role: "MFA",
    status: "inactive",
    lastLogin: "2024-01-10T14:20:00Z",
    avatar: "/avatars/hans.jpg"
  }
]

export default function UsersPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [isAddingUser, setIsAddingUser] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const handleAddUser = () => {
    setIsAddingUser(true)
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
  }

  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId))
    toast({
      title: "Benutzer gelöscht",
      description: "Der Benutzer wurde erfolgreich entfernt.",
    })
  }

  const getRoleColor = (role: User['role']) => {
    switch (role) {
      case 'Arzt':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'MFA':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'Admin':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  const getStatusColor = (status: User['status']) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200'
  }

  const formatLastLogin = (lastLogin?: string) => {
    if (!lastLogin) return 'Nie'
    try {
      const date = new Date(lastLogin)
      return date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Unbekannt'
    }
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Benutzer</h1>
            <p className="text-slate-600 mt-1">
              Verwalten Sie Benutzer und deren Berechtigungen
            </p>
          </div>
          
          {/* Action buttons - Responsive */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button
              size="sm"
              onClick={handleAddUser}
              className="w-full sm:w-auto"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Benutzer hinzufügen
            </Button>
          </div>
        </div>
      </div>

      {/* Users Overview */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-gradient-to-b from-white to-slate-50 border-slate-200 shadow-md rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{users.length}</p>
                <p className="text-sm text-slate-600">Gesamt</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-b from-white to-slate-50 border-slate-200 shadow-md rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-xl">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {users.filter(u => u.status === 'active').length}
                </p>
                <p className="text-sm text-slate-600">Aktiv</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-b from-white to-slate-50 border-slate-200 shadow-md rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 rounded-xl">
                <User className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {users.filter(u => u.role === 'Arzt').length}
                </p>
                <p className="text-sm text-slate-600">Ärzte</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <Card className="bg-gradient-to-b from-white to-slate-50 border-slate-200 shadow-md rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-slate-900">Benutzerliste</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-white rounded-lg border border-slate-200 hover:shadow-md transition-shadow"
              >
                {/* User Info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-slate-100 text-slate-600">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-900 truncate">{user.name}</h3>
                    <p className="text-sm text-slate-600 truncate">{user.email}</p>
                    <p className="text-xs text-slate-500">
                      Letzter Login: {formatLastLogin(user.lastLogin)}
                    </p>
                  </div>
                </div>

                {/* Role and Status */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <Badge className={getRoleColor(user.role)}>
                    {user.role}
                  </Badge>
                  <Badge className={getStatusColor(user.status)}>
                    {user.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                  </Badge>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditUser(user)}
                    className="p-2"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteUser(user.id)}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {users.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Keine Benutzer gefunden
              </h3>
              <p className="text-slate-600">
                Fügen Sie den ersten Benutzer hinzu, um zu beginnen.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Help and Information */}
      <Card className="bg-gradient-to-b from-white to-slate-50 border-slate-200 shadow-md rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-slate-900">Benutzerrollen & Berechtigungen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            <div className="space-y-3">
              <h4 className="font-medium text-slate-900 flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600" />
                Arzt
              </h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• Vollzugriff auf alle Funktionen</li>
                <li>• Patientenverwaltung</li>
                <li>• Terminplanung</li>
                <li>• Anrufverwaltung</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-slate-900 flex items-center gap-2">
                <User className="h-4 w-4 text-green-600" />
                MFA
              </h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• Terminplanung</li>
                <li>• Patientenverwaltung</li>
                <li>• Anrufverwaltung</li>
                <li>• Keine Einstellungen</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-slate-900 flex items-center gap-2">
                <Shield className="h-4 w-4 text-purple-600" />
                Admin
              </h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• Alle Arzt-Berechtigungen</li>
                <li>• Benutzerverwaltung</li>
                <li>• Systemeinstellungen</li>
                <li>• Vollzugriff</li>
              </ul>
            </div>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Sicherheitshinweis</h4>
            <p className="text-sm text-blue-800">
              Benutzer können nur die Funktionen nutzen, die ihrer Rolle entsprechen. 
              Ändern Sie Rollen nur bei Bedarf und überwachen Sie die Benutzeraktivitäten regelmäßig.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
