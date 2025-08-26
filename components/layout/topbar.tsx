"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth"
import { User, LogOut, Menu, X } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

export function Topbar() {
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const getUserInitials = (email: string) => {
    return email
      .split("@")[0]
      .split(".")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      {/* Logo and Practice - Responsive */}
      <div className="flex items-center gap-3 sm:gap-6">
        <Link href="/dashboard" className="flex items-center">
          <img 
            src="/brand/kipraxishelfer-logo.svg" 
            alt="kipraxishelfer" 
            width={140} 
            height={40}
            className="h-6 w-auto sm:h-8"
          />
        </Link>
        
        {/* Divider - Hidden on mobile */}
        <div className="hidden sm:block h-6 w-px bg-slate-200" />
        
        {/* Practice name - Responsive text */}
        <div className="hidden sm:block text-sm text-slate-600">Praxis Dr. Müller</div>
        <div className="sm:hidden text-xs text-slate-600">Dr. Müller</div>
      </div>

      {/* Mobile Menu Button */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="sm:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-medium">
                  {user ? getUserInitials(user.email) : "?"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-slate-900">
                  {user?.email.split("@")[0]}
                </p>
                <p className="text-xs leading-none text-slate-500">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings/profile" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>Profil</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Abmelden</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20" 
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="fixed right-0 top-0 h-full w-64 bg-white shadow-xl border-l border-slate-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Menü</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-900">
                  {user?.email.split("@")[0]}
                </p>
                <p className="text-xs text-slate-500">
                  {user?.email}
                </p>
              </div>
              
              <div className="space-y-1">
                <Link 
                  href="/settings/profile"
                  className="flex items-center px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="mr-3 h-4 w-4" />
                  <span>Profil</span>
                </Link>
                
                <button
                  onClick={() => {
                    logout()
                    setMobileMenuOpen(false)
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-md"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  <span>Abmelden</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
