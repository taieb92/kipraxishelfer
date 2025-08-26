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
  const [settingsOpen, setSettingsOpen] = useState(pathname.startsWith("/settings"))

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-slate-200">
      {/* Header Space - Logo is now in topbar */}
      <div className="h-16 border-b border-slate-200" />

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-4">
        {/* Main Navigation */}
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  "hover:bg-slate-50",
                  isActive 
                    ? "bg-blue-50 text-blue-700 border border-blue-200" 
                    : "text-slate-700 hover:text-slate-900"
                )}
              >
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                  isActive ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                )}>
                  <item.icon className="h-4 w-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate">{item.name}</span>
                    {item.badge && (
                      <Badge 
                        variant="secondary" 
                        className="h-5 min-w-[20px] text-xs bg-red-100 text-red-700 border-red-200"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    {item.description}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Settings Section */}
        <div className="pt-4">
          <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                  "hover:bg-slate-50 text-slate-700 hover:text-slate-900"
                )}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <Settings className="h-4 w-4" />
                </div>
                
                <div className="flex-1 text-left">
                  <div>Einstellungen</div>
                  <div className="text-xs text-slate-500">
                    Konfiguration
                  </div>
                </div>
                
                {settingsOpen ? (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                )}
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="space-y-1 pl-4 pt-2">
              {settingsNavigation.map((item) => {
                const isActive = pathname === item.href
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                      "hover:bg-slate-50",
                      isActive 
                        ? "bg-blue-50 text-blue-700 border border-blue-200" 
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    <div className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-md transition-colors",
                      isActive ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                    )}>
                      <item.icon className="h-3 w-3" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="truncate">{item.name}</div>
                      <div className="text-xs text-slate-400 truncate">
                        {item.description}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-200 p-4">
        <div className="text-xs text-slate-500 text-center">
          kipraxishelfer v1.0
        </div>
      </div>
    </div>
  )
}
