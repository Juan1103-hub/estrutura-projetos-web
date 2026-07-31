import { Activity, DollarSign, TrendingDown, TrendingUp, Users } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export interface CardData {
  title: string
  value: string
  badge: string
  badgeVariant: "up" | "down"
  description: string
  icon: LucideIcon
}

export const cards: CardData[] = [
  {
    title: "Receita Total",
    value: "R$ 45.231,00",
    badge: "+12.5%",
    badgeVariant: "up",
    description: "Faturamento do mês atual",
    icon: DollarSign,
  },
  {
    title: "Indicadores Farmácia",
    value: "4",
    badge: "1 fora da meta",
    badgeVariant: "down",
    description: "Dispensações e controle",
    icon: Activity,
  },
  {
    title: "Indicadores Lab",
    value: "12",
    badge: "2 fora da meta",
    badgeVariant: "down",
    description: "Exames e amostras",
    icon: Activity,
  },
  {
    title: "Alertas Pendentes",
    value: "5",
    badge: "2 críticos",
    badgeVariant: "down",
    description: "Requerem ação imediata",
    icon: Users,
  },
]
