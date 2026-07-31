export interface ChartDataPoint {
  date: string
  indicadores: number
  alertas: number
}

export const chartData: ChartDataPoint[] = [
  { date: "2024-04-01", indicadores: 222, alertas: 150 },
  { date: "2024-04-02", indicadores: 97, alertas: 180 },
  { date: "2024-04-03", indicadores: 167, alertas: 120 },
  { date: "2024-04-04", indicadores: 242, alertas: 260 },
  { date: "2024-04-05", indicadores: 373, alertas: 290 },
  { date: "2024-04-06", indicadores: 301, alertas: 340 },
  { date: "2024-04-07", indicadores: 245, alertas: 180 },
  { date: "2024-04-08", indicadores: 409, alertas: 320 },
  { date: "2024-04-09", indicadores: 59, alertas: 110 },
  { date: "2024-04-10", indicadores: 261, alertas: 190 },
  { date: "2024-04-11", indicadores: 327, alertas: 350 },
  { date: "2024-04-12", indicadores: 292, alertas: 210 },
  { date: "2024-04-13", indicadores: 342, alertas: 380 },
  { date: "2024-04-14", indicadores: 137, alertas: 220 },
  { date: "2024-04-15", indicadores: 120, alertas: 170 },
  { date: "2024-04-16", indicadores: 138, alertas: 190 },
  { date: "2024-04-17", indicadores: 446, alertas: 360 },
  { date: "2024-04-18", indicadores: 364, alertas: 410 },
  { date: "2024-04-19", indicadores: 243, alertas: 180 },
  { date: "2024-04-20", indicadores: 89, alertas: 150 },
  { date: "2024-04-21", indicadores: 137, alertas: 200 },
  { date: "2024-04-22", indicadores: 224, alertas: 170 },
  { date: "2024-04-23", indicadores: 138, alertas: 230 },
  { date: "2024-04-24", indicadores: 387, alertas: 290 },
  { date: "2024-04-25", indicadores: 215, alertas: 250 },
  { date: "2024-04-26", indicadores: 75, alertas: 130 },
  { date: "2024-04-27", indicadores: 383, alertas: 420 },
  { date: "2024-04-28", indicadores: 122, alertas: 180 },
  { date: "2024-04-29", indicadores: 315, alertas: 240 },
  { date: "2024-04-30", indicadores: 454, alertas: 380 },
  { date: "2024-05-01", indicadores: 165, alertas: 220 },
  { date: "2024-05-02", indicadores: 293, alertas: 310 },
  { date: "2024-05-03", indicadores: 247, alertas: 190 },
]

export const chartConfig = {
  indicadores: { label: "Indicadores", color: "var(--chart-1)" },
  alertas: { label: "Alertas", color: "var(--chart-2)" },
} as const
