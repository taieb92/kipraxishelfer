"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, MessageSquare, Users, CheckCircle, AlertCircle, ChevronRight, Tags, User, Shield } from "lucide-react"

// Mock connection statuses
const connectionStatuses = {
  doctolib: { connected: true, lastSync: "2024-01-15T10:30:00Z" },
  greeting: { configured: true },
  calendar: { configured: true, hoursSet: true },
  users: { count: 3 },
}

export default function SettingsPage() {
  const settingsCards = [
    {
      title: "Doctolib Integration",
      description: "Verbinden Sie Ihr Doctolib-Konto für automatische Terminbuchungen",
      href: "/settings/doctolib",
      icon: Shield,
      status: connectionStatuses.doctolib.connected ? "connected" : "disconnected",
      statusText: connectionStatuses.doctolib.connected ? "Verbunden" : "Nicht verbunden",
    },
    {
      title: "Begrüßung",
      description: "Konfigurieren Sie die Begrüßungsnachricht und Stimme",
      href: "/settings/greeting",
      icon: MessageSquare,
      status: connectionStatuses.greeting.configured ? "configured" : "needs-setup",
      statusText: connectionStatuses.greeting.configured ? "Konfiguriert" : "Einrichtung erforderlich",
    },
    {
      title: "Kategorien & Status",
      description: "Verwalten Sie Anruf-Kategorien und Status-Definitionen",
      href: "/settings/categories-statuses",
      icon: Tags,
      status: "configured",
      statusText: "Konfiguriert",
    },
    {
      title: "Nutzer",
      description: "Verwalten Sie Benutzerkonten und Berechtigungen",
      href: "/settings/users",
      icon: Users,
      status: "configured",
      statusText: `${connectionStatuses.users.count} Benutzer`,
    },
    {
      title: "Profil",
      description: "Persönliche Einstellungen und Sicherheit",
      href: "/settings/profile",
      icon: User,
      status: "configured",
      statusText: "Konfiguriert",
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
      case "configured":
        return <CheckCircle className="h-3 w-3" />
      case "disconnected":
      case "needs-setup":
        return <AlertCircle className="h-3 w-3" />
      default:
        return <AlertCircle className="h-3 w-3" />
    }
  }

  const getStatusBadge = (status: string, statusText: string) => {
    const isPositive = status === "connected" || status === "configured"
    const className = isPositive ? "status-success" : "status-warning"
    
    return (
      <Badge className={`gap-1 ${className}`}>
        {getStatusIcon(status)}
        {statusText}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Einstellungen</h1>
        <p className="text-slate-600">Konfigurieren Sie Ihre kipraxishelfer-Installation und Integrationen</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {settingsCards.map((card) => (
          <Card key={card.href} className="card-elevated card-hover group">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <card.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">{card.title}</CardTitle>
                  </div>
                </div>
                {getStatusBadge(card.status, card.statusText)}
              </div>
              <CardDescription className="mt-2">{card.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full justify-between hover:bg-primary/5 hover:border-primary/30">
                <Link href={card.href}>
                  Konfigurieren
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
