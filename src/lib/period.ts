import { endOfMonth, format, startOfMonth } from "date-fns"
import { ptBR } from "date-fns/locale"

export type PeriodKey = string // "YYYY-MM"

export function getCurrentPeriodKey(): PeriodKey {
  return format(new Date(), "yyyy-MM")
}

export function periodToRange(period: PeriodKey): { start: Date; end: Date } {
  const [year, month] = period.split("-").map(Number)
  const ref = new Date(year, month - 1, 1)
  return { start: startOfMonth(ref), end: endOfMonth(ref) }
}

export function periodToISORange(period: PeriodKey): {
  startISO: string
  endISO: string
} {
  const { start, end } = periodToRange(period)
  return {
    startISO: format(start, "yyyy-MM-dd"),
    endISO: format(end, "yyyy-MM-dd"),
  }
}

export function listRecentPeriods(count = 12): PeriodKey[] {
  const periods: PeriodKey[] = []
  const today = new Date()
  for (let i = 0; i < count; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
    periods.push(format(d, "yyyy-MM"))
  }
  return periods
}

export function formatPeriodLabel(period: PeriodKey): string {
  const [year, month] = period.split("-").map(Number)
  const ref = new Date(year, month - 1, 1)
  const label = format(ref, "MMMM 'de' yyyy", { locale: ptBR })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function todayISO(): string {
  return format(new Date(), "yyyy-MM-dd")
}
