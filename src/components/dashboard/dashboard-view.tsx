"use client"

import {
  ArrowDownLeft,
  ArrowUpRight,
  Landmark,
  PiggyBank,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts"

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { PageHeader } from "@/components/layout/page-elements"
import { cn } from "@/lib/utils"
import { formatBRL, formatDate, formatPercent } from "@/lib/formatters"
import type { InvestmentKind, InvestmentWithRelations } from "@/types/domain"
import { INVESTMENT_KIND_LABELS } from "@/types/domain"

export type DashboardMetrics = {
  total_in: number
  total_out: number
  balance: number
  prev_balance: number
  prev_savings_rate: number
  prev_total_in: number
  prev_total_out: number
  savings_rate: number
  total_invested: number
}

export type MonthlyFlowDatum = {
  period: string
  label: string
  entradas: number
  saidas: number
}

export type CategoryExpenseDatum = {
  id: string
  name: string
  value: number
  color: string
}

const flowChartConfig = {
  entradas: {
    label: "Entradas",
    color: "#16a34a",
  },
  saidas: {
    label: "Saídas",
    color: "#f43f5e",
  },
} satisfies ChartConfig

export function DashboardView({
  metrics,
  monthlyFlow,
  categoryExpenses,
  latestInvestments,
  periodLabel,
}: {
  metrics: DashboardMetrics
  monthlyFlow: MonthlyFlowDatum[]
  categoryExpenses: CategoryExpenseDatum[]
  latestInvestments: InvestmentWithRelations[]
  periodLabel: string
}) {
  const hasPrevious =
    Number(metrics.prev_total_in) > 0 || Number(metrics.prev_total_out) > 0
  const savingsDelta =
    Number(metrics.savings_rate) - Number(metrics.prev_savings_rate)

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Visão geral"
        title="Dashboard"
        description={`Seu panorama financeiro de ${periodLabel.toLowerCase()} em um só lugar.`}
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Entradas do mês"
          value={formatBRL(metrics.total_in)}
          caption={periodLabel}
          icon={<ArrowDownLeft className="h-4 w-4" />}
          accent="emerald"
        />
        <MetricCard
          label="Saídas do mês"
          value={formatBRL(metrics.total_out)}
          caption={periodLabel}
          icon={<ArrowUpRight className="h-4 w-4" />}
          accent="rose"
        />
        <MetricCard
          label="Saldo do mês"
          value={formatBRL(metrics.balance)}
          caption={
            hasPrevious
              ? `${formatBRL(metrics.prev_balance)} no mês anterior`
              : "Sem comparativo anterior"
          }
          icon={<Wallet className="h-4 w-4" />}
          accent={metrics.balance < 0 ? "rose" : "primary"}
          valueClassName={metrics.balance < 0 ? "text-destructive" : undefined}
        />
        <MetricCard
          label="Economia"
          value={formatPercent(metrics.savings_rate)}
          caption={
            hasPrevious
              ? `${savingsDelta >= 0 ? "+" : ""}${formatPercent(savingsDelta)} vs mês anterior`
              : "Sem comparativo anterior"
          }
          icon={
            savingsDelta >= 0 ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )
          }
          accent={savingsDelta >= 0 ? "emerald" : "rose"}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.85fr]">
        <MonthlyFlowChart data={monthlyFlow} />
        <CategoryExpenseChart data={categoryExpenses} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <TotalInvestedCard total={metrics.total_invested} />
        <LatestInvestments investments={latestInvestments} />
      </div>
    </div>
  )
}

function MetricCard({
  label,
  value,
  caption,
  icon,
  accent = "primary",
  valueClassName,
}: {
  label: string
  value: string
  caption: string
  icon: React.ReactNode
  accent?: "primary" | "emerald" | "rose"
  valueClassName?: string
}) {
  return (
    <section className="rounded-2xl border border-border/70 bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium text-muted-foreground">
          {label}
        </span>
        <span
          className={cn(
            "inline-flex h-7 w-7 items-center justify-center rounded-lg",
            accent === "primary" && "bg-primary/10 text-primary",
            accent === "emerald" &&
              "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
            accent === "rose" &&
              "bg-rose-500/10 text-rose-600 dark:text-rose-400"
          )}
        >
          {icon}
        </span>
      </div>
      <p
        className={cn(
          "mt-4 font-display text-[28px] leading-none tracking-tight tabular-nums text-foreground",
          valueClassName
        )}
      >
        {value}
      </p>
      <p className="mt-2 text-[11px] text-muted-foreground">{caption}</p>
    </section>
  )
}

function MonthlyFlowChart({ data }: { data: MonthlyFlowDatum[] }) {
  return (
    <section className="rounded-2xl border border-border/70 bg-card p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl tracking-tight">
            Entradas vs saídas
          </h2>
          <p className="text-[13px] text-muted-foreground">
            Fluxo dos últimos 6 meses
          </p>
        </div>
      </div>
      <ChartContainer
        config={flowChartConfig}
        className="h-[300px] w-full aspect-auto"
        initialDimension={{ width: 640, height: 300 }}
      >
        <BarChart data={data} barGap={6}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={10}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            width={70}
            tickFormatter={(value) => formatCompactBRL(Number(value))}
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                formatter={(value, name) => (
                  <div className="flex min-w-32 items-center justify-between gap-4">
                    <span className="text-muted-foreground">
                      {flowChartConfig[String(name) as keyof typeof flowChartConfig]?.label ??
                        name}
                    </span>
                    <span className="font-medium tabular-nums text-foreground">
                      {formatBRL(Number(value))}
                    </span>
                  </div>
                )}
              />
            }
          />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar
            dataKey="entradas"
            fill="var(--color-entradas)"
            radius={[6, 6, 0, 0]}
          />
          <Bar
            dataKey="saidas"
            fill="var(--color-saidas)"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ChartContainer>
    </section>
  )
}

function CategoryExpenseChart({ data }: { data: CategoryExpenseDatum[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const chartConfig = Object.fromEntries(
    data.map((item) => [
      item.id,
      {
        label: item.name,
        color: item.color,
      },
    ])
  ) satisfies ChartConfig

  return (
    <section className="rounded-2xl border border-border/70 bg-card p-5">
      <div className="mb-5">
        <h2 className="font-display text-xl tracking-tight">
          Gastos por categoria
        </h2>
        <p className="text-[13px] text-muted-foreground">
          Saídas do mês atual
        </p>
      </div>

      {data.length === 0 ? (
        <div className="grid h-[300px] place-items-center rounded-xl border border-dashed border-border/70 text-center">
          <div>
            <p className="font-medium text-foreground">Sem saídas no mês</p>
            <p className="mt-1 text-sm text-muted-foreground">
              O donut aparece quando houver gastos categorizados.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-[1fr_0.9fr] xl:grid-cols-1">
          <ChartContainer
            config={chartConfig}
            className="mx-auto h-[240px] w-full max-w-[320px] aspect-square"
            initialDimension={{ width: 280, height: 240 }}
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    hideLabel
                    formatter={(value, name) => (
                      <div className="flex min-w-36 items-center justify-between gap-4">
                        <span className="text-muted-foreground">
                          {name}
                        </span>
                        <span className="font-medium tabular-nums text-foreground">
                          {formatBRL(Number(value))}
                        </span>
                      </div>
                    )}
                  />
                }
              />
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={62}
                outerRadius={96}
                paddingAngle={2}
              >
                {data.map((entry) => (
                  <Cell key={entry.id} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="space-y-2">
            {data.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-muted/35 px-3 py-2 text-[13px]"
              >
                <span className="inline-flex min-w-0 items-center gap-2">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="truncate">{item.name}</span>
                </span>
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  {Math.round((item.value / total) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

function TotalInvestedCard({ total }: { total: number }) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-border/70 bg-card p-6">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_0%,oklch(0.62_0.16_150/0.12),transparent_55%)]" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-[12px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Patrimônio investido
          </span>
          <p className="mt-5 font-display text-[42px] leading-none tracking-tight text-foreground">
            {formatBRL(total)}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Soma dos aportes cadastrados manualmente.
          </p>
        </div>
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <PiggyBank className="h-6 w-6" strokeWidth={1.8} />
        </div>
      </div>
    </section>
  )
}

function LatestInvestments({
  investments,
}: {
  investments: InvestmentWithRelations[]
}) {
  return (
    <section className="rounded-2xl border border-border/70 bg-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl tracking-tight">
            Últimos aportes
          </h2>
          <p className="text-[13px] text-muted-foreground">
            Registros recentes de investimento
          </p>
        </div>
        <Landmark className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="mt-5 space-y-3">
        {investments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/70 p-6 text-center text-sm text-muted-foreground">
            Nenhum aporte registrado ainda.
          </div>
        ) : (
          investments.map((investment) => {
            const kind = investment.kind as InvestmentKind
            return (
              <div
                key={investment.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-muted/35 px-3 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-medium text-foreground">
                    {investment.description || INVESTMENT_KIND_LABELS[kind]}
                  </p>
                  <p className="mt-1 text-[12px] text-muted-foreground">
                    {formatDate(investment.occurred_at, "dd MMM yyyy")}
                  </p>
                </div>
                <span className="shrink-0 text-[14px] font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                  {formatBRL(investment.amount)}
                </span>
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}

function formatCompactBRL(value: number): string {
  if (Math.abs(value) >= 1000) {
    return `R$ ${(value / 1000).toLocaleString("pt-BR", {
      maximumFractionDigits: 1,
    })} mil`
  }
  return formatBRL(value)
}
