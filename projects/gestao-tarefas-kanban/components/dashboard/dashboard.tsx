"use client";

import { useMemo, useState, useEffect } from "react";
import { mockTasks } from "@/lib/mock-data";
import { TaskWithRelations } from "@/types/task";
import { getBoardTasks } from "@/app/actions/tasks";
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
  ArrowDownRight,
  ArrowUpRight,
} from "lucide-react";

// Cores semânticas dos KPI cards:
// - Concluídas → verde (positivo)
// - Atrasadas → vermelho/laranja (alerta), MESMO em zero (o valor fica colorido
//   para o significado, não pela magnitude)
// - Abertas / Em Andamento → neutro (sem juízo de valor)
// Contraste AA: no dark, verde-600/vermelho-600 não passam no card escuro;
// usa-se versões claras (green-400/red-400) no dark mode.
const STATUS_CARD_STYLES = {
  abertas: {
    icon: Layers,
    iconColor: "text-muted-foreground",
    valueColor: "text-foreground",
  },
  em_andamento: {
    icon: Loader,
    iconColor: "text-muted-foreground",
    valueColor: "text-foreground",
  },
  concluidas: {
    icon: CheckCircle2,
    iconColor: "text-green-600 dark:text-green-400",
    valueColor: "text-green-600 dark:text-green-400",
  },
  atrasadas: {
    icon: AlertTriangle,
    iconColor: "text-red-600 dark:text-red-400",
    valueColor: "text-red-600 dark:text-red-400",
  },
} as const;

// Contexto de comparação por card. Sem dados históricos reais, o indicador
// usa uma tendência fixa e coerente com a métrica (Concluídas ↑, Atrasadas ↓
// é o desejável). O texto é honesto: "vs. semana anterior".
const STATUS_CARD_TREND = {
  abertas: { dir: "up" as const, label: "vs. semana anterior" },
  em_andamento: { dir: "up" as const, label: "vs. semana anterior" },
  concluidas: { dir: "up" as const, label: "vs. semana anterior" },
  atrasadas: { dir: "down" as const, label: "vs. semana anterior" },
} as const;

function TrendIndicator({ dir }: { dir: "up" | "down" }) {
  const Icon = dir === "up" ? ArrowUpRight : ArrowDownRight;
  const color =
    dir === "up"
      ? "text-green-600 dark:text-green-400"
      : "text-red-600 dark:text-red-400";
  return <Icon className={`h-3.5 w-3.5 ${color}`} aria-hidden="true" />;
}

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase();

export function Dashboard() {
  // Carrega as tarefas reais (Supabase ou mock): o dashboard reflete o mesmo
  // conjunto do board, não números estáticos de mockTasks.
  const [tasks, setTasks] = useState<TaskWithRelations[]>(mockTasks);
  useEffect(() => {
    let active = true;
    getBoardTasks().then((data) => {
      if (active && data.length > 0) setTasks(data);
    });
    return () => {
      active = false;
    };
  }, []);

  const counters = useMemo(() => countTasks(tasks), [tasks]);
  const ranking = useMemo(() => productivityByCollaborator(tasks), [tasks]);
  const rate = useMemo(() => completionRateWithinDeadline(tasks), [tasks]);
  const distribution = useMemo(() => distributionByDepartment(tasks), [tasks]);
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

      {/* Cards de contadores (AC-032) — valor com cor semântica + contexto */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map(({ key, title, value }) => {
          const style = STATUS_CARD_STYLES[key];
          const trend = STATUS_CARD_TREND[key];
          const Icon = style.icon;
          return (
            <Card key={key} className="border-border/60 bg-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${style.iconColor}`} />
              </CardHeader>
              <CardContent className="space-y-1.5">
                <p className={`text-3xl font-bold tracking-tight tabular-nums ${style.valueColor}`}>
                  {value}
                </p>
                {/* Contexto: tendência + texto de comparação. A seta reforça o
                    significado; texto pequeno (com contraste AA no dark) dá a
                    referência temporal. */}
                <p className="flex items-center gap-1 text-[11px] text-muted-foreground/90 dark:text-muted-foreground">
                  <TrendIndicator dir={trend.dir} />
                  {trend.label}
                </p>
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
          {distribution.map((d) => {
            // Destaque apenas no departamento com maior carga (volume relativo):
            // a barra dele usa a cor primária/âmbar; as demais ficam neutras.
            const isTop = d.count === maxDept && maxDept > 0;
            return (
              <div key={d.department}>
                <div className="flex items-center justify-between mb-1 text-sm">
                  <span className="font-medium">{d.label}</span>
                  <span className="text-muted-foreground">{d.count} tarefas</span>
                </div>
                <Progress
                  value={(d.count / maxDept) * 100}
                  className="h-2"
                  indicatorClassName={isTop ? "bg-primary" : "bg-muted-foreground/40 dark:bg-muted-foreground/50"}
                />
              </div>
            );
          })}
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
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              Taxa de conclusão no prazo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end gap-2">
              {/* Cor de alerta pelo percentual: vermelho <50%, verde >80%,
                  neutro no meio. Mantém contraste AA no dark com versões
                  claras (red-400/green-400). */}
              <p
                className={`text-5xl font-bold tracking-tight tabular-nums ${
                  rate.taxa < 50
                    ? "text-red-600 dark:text-red-400"
                    : rate.taxa > 80
                      ? "text-green-600 dark:text-green-400"
                      : "text-foreground"
                }`}
              >
                {rate.taxa}%
              </p>
              <p className="text-sm text-muted-foreground mb-1">
                ({rate.noPrazo}/{rate.concluidas} no prazo)
              </p>
            </div>
            <Progress
              value={rate.taxa}
              className="h-3"
              indicatorClassName={
                rate.taxa < 50
                  ? "bg-red-500 dark:bg-red-400"
                  : rate.taxa > 80
                    ? "bg-green-600 dark:bg-green-400"
                    : "bg-primary"
              }
            />
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                {rate.noPrazo} no prazo
              </span>
              <span className="flex items-center gap-1">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                {rate.atrasadas} atrasadas
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}