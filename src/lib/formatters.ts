import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

const percentFormatter = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

export function formatBRL(value: number | string | null | undefined): string {
  const n = typeof value === "string" ? Number(value) : value ?? 0
  return brlFormatter.format(Number.isFinite(n) ? Number(n) : 0)
}

export function formatPercent(value: number | null | undefined): string {
  return percentFormatter.format(value ?? 0)
}

export function formatDate(
  value: Date | string | null | undefined,
  pattern = "dd MMM yyyy"
): string {
  if (!value) return ""
  const date = typeof value === "string" ? parseISO(value) : value
  return format(date, pattern, { locale: ptBR })
}

export function formatMonthYear(value: Date | string): string {
  const date = typeof value === "string" ? parseISO(value) : value
  return format(date, "MMMM 'de' yyyy", { locale: ptBR })
}
