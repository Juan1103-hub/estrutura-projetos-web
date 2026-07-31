"use client"

// T-011: Alertas por severidade no dashboard
// Rastreabilidade: US-004 (AC-010)
// AC-010: Contagem de alertas agrupados por severidade

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, AlertTriangle, AlertCircle, Info } from "lucide-react"
import Link from "next/link"

// Mock de alertas — substituir por query: SELECT * FROM alerts WHERE read_by NOT CONTAINS auth.uid()
const ALERTAS_MOCK = [
  { severity: "critico", count: 2 },
  { severity: "alto", count: 3 },
  { severity: "medio", count: 5 },
  { severity: "baixo", count: 1 },
]

const SEVERITY_CONFIG: Record<string, { label: string; icon: typeof AlertCircle; color: string; bg: string }> = {
  critico: { label: "Crítico", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/30" },
  alto: { label: "Alto", icon: AlertCircle, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-950/30" },
  medio: { label: "Médio", icon: Info, color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-950/30" },
  baixo: { label: "Baixo", icon: Info, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
}

export function AlertsSummary() {
  const total = ALERTAS_MOCK.reduce((sum, a) => sum + a.count, 0)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium">Alertas abertos</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs tabular-nums">
            {total} total
          </Badge>
          <Bell className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {ALERTAS_MOCK.map((alerta) => {
            const config = SEVERITY_CONFIG[alerta.severity]
            const Icon = config.icon
            return (
              <div
                key={alerta.severity}
                className={`flex items-center justify-between rounded-md p-2 ${config.bg}`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${config.color}`} />
                  <span className="text-sm font-medium">{config.label}</span>
                </div>
                <Badge variant="outline" className="text-xs tabular-nums">
                  {alerta.count}
                </Badge>
              </div>
            )
          })}
        </div>
        <div className="mt-3 text-center">
          <Link href="/alertas" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Ver todos os alertas →
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
