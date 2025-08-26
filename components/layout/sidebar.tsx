"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  LayoutDashboard,
  Phone,
  Calendar,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  Users,
  MessageSquare,
  Shield,
  Tags,
  User,
  X,
} from "lucide-react"

const navigation = [
  { 
    name: "Dashboard", 
    href: "/dashboard", 
    icon: LayoutDashboard,
    description: "Überblick und KPIs"
  },
  { 
    name: "Anrufe", 
    href: "/calls", 
    icon: Phone, 
    badge: 3,
    description: "Anrufverwaltung"
  },
  { 
    name: "Kalender", 
    href: "/calendar", 
    icon: Calendar,
    description: "Terminplanung"
  },
  { 
    name: "Verbrauch", 
    href: "/usage", 
    icon: BarChart3,
    description: "Nutzungsstatistiken"
  },
]

const settingsNavigation = [
  { 
    name: "Doctolib", 
    href: "/settings/doctolib",
    icon: Shield,
    description: "Doctolib Integration"
  },
  { 
    name: "Begrüßung", 
    href: "/settings/greeting",
    icon: MessageSquare,
    description: "Begrüßung & Stimme"
  },
  { 
    name: "Kategorien & Status", 
    href: "/settings/categories-statuses",
    icon: Tags,
    description: "Kategorien & Status verwalten"
  },
  { 
    name: "Nutzer", 
    href: "/settings/users",
    icon: Users,
    description: "Benutzerverwaltung"
  },
  { 
    name: "Profil", 
    href: "/settings/profile",
    icon: User,
    description: "Persönliche Einstellungen"
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <div className="flex h-full w-full flex-col bg-white border-r border-slate-200">
      {/* Header - Responsive */}
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <img 
            src="/brand/kipraxishelfer-logo.svg" 
            alt="kipraxishelfer" 
            className="h-6 w-auto sm:h-8"
          />
          <span className="hidden lg:block text-lg font-semibold text-slate-900">
            kipraxishelfer
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {/* Main Navigation */}
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  "hover:bg-slate-100 hover:text-slate-900",
                  isActive 
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600" 
                    : "text-slate-600"
                )}
              >
                <item.icon className={cn(
                  "mr-3 h-4 w-4 flex-shrink-0",
                  isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-500"
                )} />
                
                <span className="flex-1 min-w-0">
                  <span className="truncate">{item.name}</span>
                  {item.description && (
                    <span className="hidden lg:block text-xs text-slate-500 mt-0.5">
                      {item.description}
                    </span>
                  )}
                </span>
                
                {item.badge && (
                  <Badge 
                    variant="secondary" 
                    className="ml-auto flex-shrink-0 text-xs"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            )
          })}
        </div>

        {/* Settings Section - Collapsible */}
        <div className="pt-4 border-t border-slate-200">
          <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-between px-3 py-2 text-sm font-medium text-slate-600",
                  "hover:bg-slate-100 hover:text-slate-900 data-[state=open]:bg-slate-100"
                )}
              >
                <div className="flex items-center">
                  <Settings className="mr-3 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">Einstellungen</span>
                </div>
                {settingsOpen ? (
                  <ChevronDown className="h-4 w-4 flex-shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 flex-shrink-0" />
                )}
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-1 mt-1">
              {settingsNavigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "group flex items-center px-3 py-2 pl-9 text-sm font-medium rounded-md transition-colors",
                      "hover:bg-slate-100 hover:text-slate-900",
                      isActive 
                        ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600" 
                        : "text-slate-600"
                    )}
                  >
                    <item.icon className={cn(
                      "mr-3 h-4 w-4 flex-shrink-0",
                      isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-500"
                    )} />
                    
                    <span className="flex-1 min-w-0">
                      <span className="truncate">{item.name}</span>
                      {item.description && (
                        <span className="hidden lg:block text-xs text-slate-500 mt-0.5">
                          {item.description}
                        </span>
                      )}
                    </span>
                  </Link>
                )
              })}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </nav>

      {/* Footer - Responsive */}
      <div className="border-t border-slate-200 p-4">
        <div className="text-xs text-slate-500 text-center">
          <div className="hidden sm:block">
            <div className="font-medium text-slate-700">kipraxishelfer</div>
            <div>Version 1.0.0</div>
          </div>
          <div className="sm:hidden">
            <div className="font-medium text-slate-700">v1.0.0</div>
          </div>
        </div>
      </div>
    </div>
  )
}
