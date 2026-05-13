"use client"

import * as React from "react"
import { format, endOfMonth, subMonths } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, Search, X } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type {
  AccountWithBalance,
  Category,
  TransactionKind,
} from "@/types/domain"
import type { TransactionFilters as Filters } from "@/hooks/use-transactions"

const ANY = "__any__"

function toDateRange(filters: Filters): DateRange {
  return {
    from: new Date(filters.dateFrom + "T00:00:00"),
    to: new Date(filters.dateTo + "T00:00:00"),
  }
}

function formatRangeLabel(filters: Filters): string {
  const from = new Date(filters.dateFrom + "T00:00:00")
  const to = new Date(filters.dateTo + "T00:00:00")
  const sameMonth = from.getMonth() === to.getMonth() && from.getFullYear() === to.getFullYear()
  if (sameMonth && from.getDate() === 1 && to.getDate() === endOfMonth(from).getDate()) {
    return format(from, "MMMM 'de' yyyy", { locale: ptBR })
  }
  if (from.getTime() === to.getTime()) return format(from, "dd/MM/yyyy")
  return `${format(from, "dd/MM")} – ${format(to, "dd/MM/yyyy")}`
}

export function TransactionFilters({
  filters,
  onChange,
  accounts,
  categories,
}: {
  filters: Filters
  onChange: (next: Filters) => void
  accounts: AccountWithBalance[]
  categories: Category[]
}) {
  const [calendarOpen, setCalendarOpen] = React.useState(false)
  // pendingFrom: primeiro clique — aguarda o segundo
  const [pendingFrom, setPendingFrom] = React.useState<Date | undefined>(undefined)
  const filteredCategories = filters.kind
    ? categories.filter((c) => c.kind === filters.kind)
    : categories

  function handleDayClick(day: Date) {
    if (!pendingFrom) {
      // Primeiro clique — fixa o from
      setPendingFrom(day)
    } else {
      // Segundo clique — determina from/to em ordem cronológica e aplica
      const [from, to] = day < pendingFrom ? [day, pendingFrom] : [pendingFrom, day]
      onChange({
        ...filters,
        dateFrom: format(from, "yyyy-MM-dd"),
        dateTo: format(to, "yyyy-MM-dd"),
      })
      setPendingFrom(undefined)
      setCalendarOpen(false)
    }
  }

  function handleCalendarOpenChange(open: boolean) {
    setCalendarOpen(open)
    if (!open) setPendingFrom(undefined)
  }

  // Range visual: durante seleção mostra só o from; fechado mostra o filtro aplicado
  const displayRange: DateRange | undefined = pendingFrom
    ? { from: pendingFrom, to: undefined }
    : toDateRange(filters)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Date range picker */}
        <Popover open={calendarOpen} onOpenChange={handleCalendarOpenChange}>
          <PopoverTrigger
            render={
              <button
                type="button"
                className="flex w-fit items-center gap-2 rounded-full border border-border/70 bg-card px-4 py-2 text-[13px] font-medium transition-colors hover:bg-muted"
              />
            }
          >
            <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="capitalize">{formatRangeLabel(filters)}</span>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={displayRange}
              onDayClick={handleDayClick}
              numberOfMonths={2}
              defaultMonth={subMonths(new Date(filters.dateFrom + "T00:00:00"), 1)}
            />
          </PopoverContent>
        </Popover>

        {/* Search */}
        <div className="relative w-full lg:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.search ?? ""}
            onChange={(e) => onChange({ ...filters, search: e.target.value || null })}
            placeholder="Buscar por descrição"
            className="h-10 rounded-full pl-9 pr-10"
          />
          {filters.search && (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => onChange({ ...filters, search: null })}
              aria-label="Limpar busca"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <FilterSelect
          label="Tipo"
          value={filters.kind ?? ANY}
          onValueChange={(value) => {
            if (!value) return
            onChange({
              ...filters,
              kind: value === ANY ? null : (value as TransactionKind),
              categoryId: null,
            })
          }}
          options={[
            { value: ANY, label: "Todos" },
            { value: "entrada", label: "Entradas" },
            { value: "saida", label: "Saídas" },
          ]}
        />

        <FilterSelect
          label="Conta"
          value={filters.accountId ?? ANY}
          onValueChange={(value) => {
            if (!value) return
            onChange({ ...filters, accountId: value === ANY ? null : value })
          }}
          options={[
            { value: ANY, label: "Todas" },
            ...accounts.map((a) => ({ value: a.id, label: a.name, color: a.color })),
          ]}
        />

        <FilterSelect
          label="Categoria"
          value={filters.categoryId ?? ANY}
          onValueChange={(value) => {
            if (!value) return
            onChange({ ...filters, categoryId: value === ANY ? null : value })
          }}
          options={[
            { value: ANY, label: "Todas" },
            ...filteredCategories.map((c) => ({ value: c.id, label: c.name, color: c.color })),
          ]}
        />
      </div>
    </div>
  )
}

function FilterSelect({
  label,
  value,
  onValueChange,
  options,
}: {
  label: string
  value: string
  onValueChange: (value: string | null) => void
  options: { value: string; label: string; color?: string }[]
}) {
  const active = value !== ANY
  const selected = options.find((o) => o.value === value)
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        className={cn(
          "h-9 min-w-[140px] rounded-full px-3 text-[13px]",
          active && "border-primary/30 bg-primary/5 text-foreground"
        )}
      >
        <span className="mr-1.5 text-muted-foreground">{label}:</span>
        <span className="flex items-center gap-1.5">
          {selected?.color && (
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: selected.color }}
            />
          )}
          {selected?.label ?? "—"}
        </span>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <span className="flex items-center gap-2">
              {option.color && (
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: option.color }} />
              )}
              {option.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
