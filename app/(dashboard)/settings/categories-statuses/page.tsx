"use client"

import React from "react"
import { CategoriesCard } from "@/components/settings/cs/CategoriesCard"
import { StatusesCard } from "@/components/settings/cs/StatusesCard"

export default function CategoriesStatusesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Categories & Statuses</h1>
        <p className="text-slate-600">
          Verwalten Sie Kategorien und Status-Definitionen für Anrufe
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <CategoriesCard />
        <StatusesCard />
      </div>
    </div>
  )
} 