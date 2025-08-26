"use client"

import { useState } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/20" 
              onClick={() => setSidebarOpen(false)}
            />
            
            {/* Sidebar */}
            <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl border-r border-slate-200 z-50">
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Menü</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Sidebar />
            </div>
          </div>
        )}

        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:fixed lg:inset-y-0 lg:z-50 lg:w-64">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className={cn(
          "lg:pl-64", // Offset for desktop sidebar
          "min-h-screen flex flex-col"
        )}>
          {/* Topbar with Mobile Menu Button */}
          <Topbar />
          
          {/* Mobile Menu Button - Fixed on small screens */}
          <div className="lg:hidden fixed bottom-4 right-4 z-30">
            <Button
              size="lg"
              className="h-14 w-14 rounded-full shadow-lg"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>

          {/* Page Content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
