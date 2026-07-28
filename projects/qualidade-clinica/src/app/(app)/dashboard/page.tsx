import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, AlertTriangle, FlaskConical, Pill } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Indicadores críticos e alertas pendentes</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard icon={Pill} label="Indicadores Farmácia" value="4" note="1 fora da meta" variant="warning" />
        <MetricCard icon={FlaskConical} label="Indicadores Lab" value="12" note="2 fora da meta" variant="warning" />
        <MetricCard icon={AlertTriangle} label="Alertas Pendentes" value="5" note="2 críticos" variant="destructive" />
        <MetricCard icon={Activity} label="Descarte Pendente" value="3" note="Aguardando aprovação" variant="warning" />
      </div>
    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  note,
  variant,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  note: string
  variant?: "default" | "warning" | "destructive"
}) {
  const colorMap = {
    default: "bg-primary/10 text-primary",
    warning: "bg-warning/10 text-warning",
    destructive: "bg-destructive/10 text-destructive",
  }
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <div className={`rounded-lg p-2 ${colorMap[variant ?? "default"]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tabular-nums">{value}</div>
        <p className="text-xs text-muted-foreground">{note}</p>
      </CardContent>
    </Card>
  )
}