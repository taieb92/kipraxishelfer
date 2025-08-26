"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Shield,
  MessageSquare,
  Tags,
  Users,
  User,
  Settings as SettingsIcon,
} from "lucide-react"

const settingsCards = [
  {
    title: "Doctolib",
    description: "Integration mit Doctolib für Terminverwaltung",
    href: "/settings/doctolib",
    icon: Shield,
    badge: "Integration",
    className: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
  },
  {
    title: "Begrüßung",
    description: "KI-Begrüßung und Stimmeinstellungen konfigurieren",
    href: "/settings/greeting",
    icon: MessageSquare,
    badge: "KI",
    className: "bg-gradient-to-br from-green-50 to-green-100 border-green-200"
  },
  {
    title: "Kategorien & Status",
    description: "Anrufkategorien und Status verwalten",
    href: "/settings/categories-statuses",
    icon: Tags,
    badge: "Verwaltung",
    className: "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
  },
  {
    title: "Nutzer",
    description: "Benutzer und Berechtigungen verwalten",
    href: "/settings/users",
    icon: Users,
    badge: "Admin",
    className: "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200"
  },
  {
    title: "Profil",
    description: "Persönliche Einstellungen und Passwort ändern",
    href: "/settings/profile",
    icon: User,
    badge: "Persönlich",
    className: "bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200"
  },
]

export default function SettingsPage() {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 border border-blue-200">
            <SettingsIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Einstellungen
            </h1>
            <p className="text-slate-600 mt-1">
              Konfigurieren Sie Ihre Praxis-Einstellungen und Integrationen
            </p>
          </div>
        </div>
      </div>

      {/* Settings Grid - Responsive */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {settingsCards.map((card) => (
          <Link key={card.href} href={card.href}>
            <Card className={cn(
              "bg-gradient-to-b from-white to-slate-50",
              "border-slate-200 shadow-md rounded-2xl",
              "transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5",
              "cursor-pointer group",
              card.className
            )}>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl",
                    "bg-white/80 border border-white/60",
                    "group-hover:scale-110 transition-transform duration-200"
                  )}>
                    <card.icon className="h-6 w-6 text-slate-600" />
                  </div>
                  
                  <Badge 
                    variant="outline" 
                    className="text-xs bg-white/80 border-white/60 text-slate-600"
                  >
                    {card.badge}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-2">
                <CardTitle className="text-lg text-slate-900 group-hover:text-slate-700 transition-colors">
                  {card.title}
                </CardTitle>
                <CardDescription className="text-slate-600 text-sm leading-relaxed">
                  {card.description}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Additional Info */}
      <div className="max-w-2xl">
        <Card className="bg-gradient-to-b from-slate-50 to-white border-slate-200">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-slate-900">
                Über kipraxishelfer
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                kipraxishelfer ist ein KI-gestützter Sprachassistent, der Ihre Praxis bei der 
                Anrufverwaltung unterstützt. Alle Einstellungen werden sicher gespeichert und 
                können jederzeit angepasst werden.
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Version 1.0.0</span>
                <span>•</span>
                <span>Deutsche Lokalisierung</span>
                <span>•</span>
                <span>DSGVO-konform</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
