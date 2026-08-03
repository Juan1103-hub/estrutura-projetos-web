"use client";

import { useMemo } from "react";
import { mockTasks } from "@/lib/mock-data";
import {
  countTasks,
  productivityByCollaborator,
  completionRateWithinDeadline,
} from "@/lib/analytics/metrics";
import { distributionByDepartment } from "@/lib/analytics/department-metrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Layers,
  Loader,
  CheckCircle2,
  AlertTriangle,
  Trophy,
  TrendingUp,
  Building2,
} from "lucide-react";

const STATUS_CARD_STYLES = {
  abertas: { icon: Layers, color: "text-muted-foreground" },
  em_andamento: { icon: Loader, color: "text-orange-600 dark:text-orange-400" },
  concluidas: { icon: CheckCircle2, color: "text-green-600 dark:text-green-400" },
  atrasadas: { icon: AlertTriangle, color: "text-red-600 dark:text-red-400" },
} as const;

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase();

export function Dashboard() {
  const counters = useMemo(() => countTasks(mockTasks), []);
  const ranking = useMemo(() => productivityByCollaborator(mockTasks), []);
  const rate = useMemo(() => completionRateWithinDeadline(mockTasks), []);
  const distribution = useMemo(() => distributionByDepartment(mockTasks), []);
  const maxDept = Math.max(1, ...distribution.map((d) => d.count));
  const maxConcluidas = Math.max(1, ...ranking.map((r) => r.concluidas));

  const statCards = [
    { key: "abertas", title: "Abertas", value: counters.abertas },
    { key: "em_andamento", title: "Em Andamento", value: counters.em_andamento },
    { key: "concluidas", title: "Concluídas", value: counters.concluidas },
    { key: "atrasadas", title: "Atrasadas", value: counters.atrasadas },
  ] as const;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <div className="h-12 w-1.5 rounded-full bg-gradient-to-b from-orange-500 to-amber-600" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight uppercase">
            Dashboard Gerencial
          </h1>
          <p className="text-muted-foreground">
            Indicadores de desempenho das operações
          </p>
        </div>
      </div>

      {/* Cards de contadores (AC-032) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map(({ key, title, value }) => {
          const style = STATUS_CARD_STYLES[key];
          const Icon = style.icon;
          return (
            <Card key={key} className="border-border/60 bg-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${style.color}`} />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold tracking-tight">{value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Distribuição por departamento (AC-047) */}
      <Card className="border-border/60 bg-card mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4 text-orange-500" />
            Tarefas por departamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {distribution.map((d) => (
            <div key={d.department}>
              <div className="flex items-center justify-between mb-1 text-sm">
                <span className="font-medium">{d.label}</span>
                <span className="text-muted-foreground">{d.count} tarefas</span>
              </div>
              <Progress value={(d.count / maxDept) * 100} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Produtividade por colaborador (AC-033) */}
        <Card className="border-border/60 bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="h-4 w-4 text-amber-500" />
              Produtividade por colaborador
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {ranking.length === 0 && (
              <p className="text-sm text-muted-foreground">Sem tarefas concluídas ainda.</p>
            )}
            {ranking.map((r, idx) => (
              <div key={r.id} className="flex items-center gap-3">
                <span className="text-sm font-bold text-muted-foreground w-5">
                  {idx + 1}.
                </span>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-br from-teal-500 to-slate-600 text-white text-xs">
                    {getInitials(r.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{r.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {r.concluidas} tarefa(r) concluída(s)
                    </span>
                  </div>
                  <Progress
                    value={(r.concluidas / maxConcluidas) * 100}
                    className="h-2"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Taxa de conclusão no prazo (AC-034) */}
        <Card className="border-border/60 bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Taxa de conclusão no prazo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end gap-2">
              <p className="text-5xl font-bold tracking-tight">{rate.taxa}%</p>
              <p className="text-sm text-muted-foreground mb-1">
                ({rate.noPrazo}/{rate.concluidas} no prazo)
              </p>
            </div>
            <Progress value={rate.taxa} className="h-3" />
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                {rate.noPrazo} no prazo
              </span>
              <span className="flex items-center gap-1">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                {rate.atrasadas} atrasadas
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}