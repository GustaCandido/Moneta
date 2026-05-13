import type { Metadata } from "next"

import {
  DashboardView,
  type CategoryExpenseDatum,
  type DashboardMetrics,
  type MonthlyFlowDatum,
} from "@/components/dashboard/dashboard-view"
import { createClient } from "@/server/supabase/server"
import {
  formatPeriodLabel,
  getCurrentPeriodKey,
  listRecentPeriods,
  periodToISORange,
} from "@/lib/period"
import type { InvestmentWithRelations } from "@/types/domain"

export const metadata: Metadata = {
  title: "Dashboard — Moneta",
}

const EMPTY_METRICS: DashboardMetrics = {
  total_in: 0,
  total_out: 0,
  balance: 0,
  prev_balance: 0,
  prev_savings_rate: 0,
  prev_total_in: 0,
  prev_total_out: 0,
  savings_rate: 0,
  total_invested: 0,
}

type DashboardTransaction = {
  amount: number
  kind: string
  occurred_at: string
  category: {
    id: string
    name: string
    color: string
  } | null
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const currentPeriod = getCurrentPeriodKey()
  const flowPeriods = listRecentPeriods(6).reverse()
  const currentRange = periodToISORange(currentPeriod)
  const flowStart = periodToISORange(flowPeriods[0]).startISO
  const flowEnd = periodToISORange(flowPeriods[flowPeriods.length - 1]).endISO

  await Promise.all(
    flowPeriods.map((period) =>
      supabase.rpc("materialize_recurring_for_month", {
        p_month: periodToISORange(period).startISO,
      })
    )
  )

  const [metricsRes, transactionsRes, investmentsRes] = await Promise.all([
    supabase.rpc("dashboard_metrics", { p_month: currentRange.startISO }),
    supabase
      .from("transactions")
      .select("amount, kind, occurred_at, category:categories(id, name, color)")
      .gte("occurred_at", flowStart)
      .lte("occurred_at", flowEnd),
    supabase
      .from("investments")
      .select("*, account:accounts(id, name, color)")
      .order("occurred_at", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(5),
  ])

  const transactions =
    (transactionsRes.data ?? []) as unknown as DashboardTransaction[]

  return (
    <DashboardView
      metrics={normalizeMetrics(metricsRes.data?.[0])}
      monthlyFlow={buildMonthlyFlow(flowPeriods, transactions)}
      categoryExpenses={buildCategoryExpenses(transactions, currentPeriod)}
      latestInvestments={
        (investmentsRes.data ?? []) as unknown as InvestmentWithRelations[]
      }
      periodLabel={formatPeriodLabel(currentPeriod)}
    />
  )
}

function normalizeMetrics(
  metrics: Partial<DashboardMetrics> | null | undefined
): DashboardMetrics {
  if (!metrics) return EMPTY_METRICS

  return {
    total_in: Number(metrics.total_in ?? 0),
    total_out: Number(metrics.total_out ?? 0),
    balance: Number(metrics.balance ?? 0),
    prev_balance: Number(metrics.prev_balance ?? 0),
    prev_savings_rate: Number(metrics.prev_savings_rate ?? 0),
    prev_total_in: Number(metrics.prev_total_in ?? 0),
    prev_total_out: Number(metrics.prev_total_out ?? 0),
    savings_rate: Number(metrics.savings_rate ?? 0),
    total_invested: Number(metrics.total_invested ?? 0),
  }
}

function buildMonthlyFlow(
  periods: string[],
  transactions: DashboardTransaction[]
): MonthlyFlowDatum[] {
  const byPeriod = new Map(
    periods.map((period) => [
      period,
      {
        period,
        label: monthShortLabel(period),
        entradas: 0,
        saidas: 0,
      },
    ])
  )

  for (const transaction of transactions) {
    const period = transaction.occurred_at.slice(0, 7)
    const bucket = byPeriod.get(period)
    if (!bucket) continue

    if (transaction.kind === "entrada") {
      bucket.entradas += Number(transaction.amount)
    } else if (transaction.kind === "saida") {
      bucket.saidas += Number(transaction.amount)
    }
  }

  return [...byPeriod.values()]
}

function buildCategoryExpenses(
  transactions: DashboardTransaction[],
  currentPeriod: string
): CategoryExpenseDatum[] {
  const byCategory = new Map<string, CategoryExpenseDatum>()

  for (const transaction of transactions) {
    if (
      transaction.kind !== "saida" ||
      transaction.occurred_at.slice(0, 7) !== currentPeriod
    ) {
      continue
    }

    const id = transaction.category?.id ?? "sem-categoria"
    const existing = byCategory.get(id)

    if (existing) {
      existing.value += Number(transaction.amount)
    } else {
      byCategory.set(id, {
        id,
        name: transaction.category?.name ?? "Sem categoria",
        color: transaction.category?.color ?? "#64748b",
        value: Number(transaction.amount),
      })
    }
  }

  return [...byCategory.values()].sort((a, b) => b.value - a.value)
}

function monthShortLabel(period: string): string {
  const month = formatPeriodLabel(period).split(" de ")[0]
  return month.slice(0, 3).replace(/^./, (char) => char.toUpperCase())
}
