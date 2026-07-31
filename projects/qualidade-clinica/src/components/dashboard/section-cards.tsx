"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingDown, TrendingUp } from "lucide-react"
import { cards } from "@/data/section-cards"

export function SectionCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className="@container/card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <card.icon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-semibold tabular-nums">
                {card.value}
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium ${
                  card.badgeVariant === "up"
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                }`}
              >
                {card.badgeVariant === "up" ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {card.badge}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
