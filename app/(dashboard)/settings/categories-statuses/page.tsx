"use client"

import React from "react"
import { CategoriesCard } from "@/components/settings/cs/CategoriesCard"
import { StatusesCard } from "@/components/settings/cs/StatusesCard"

export default function CategoriesStatusesPage() {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Kategorien & Status</h1>
          <p className="text-slate-600 mt-1">
            Verwalten Sie Kategorien und Status-Definitionen für Anrufe
          </p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <CategoriesCard />
        <StatusesCard />
      </div>
    </div>
  )
} 