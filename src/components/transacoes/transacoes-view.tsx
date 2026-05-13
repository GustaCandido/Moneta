"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Plus,
  Receipt,
  Wallet,
} from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { PageHeader } from "@/components/layout/page-elements"
import { cn } from "@/lib/utils"
import { formatBRL } from "@/lib/formatters"
import { format, startOfMonth, endOfMonth } from "date-fns"
import { useAccounts } from "@/hooks/use-accounts"
import { useCategories } from "@/hooks/use-categories"
import {
  useTransactions,
  type TransactionFilters as Filters,
} from "@/hooks/use-transactions"
import type {
  AccountWithBalance,
  Category,
  TransactionWithRelations,
} from "@/types/domain"

import { DeleteTransactionDialog } from "./delete-transaction-dialog"
import { TransactionFilters } from "./transaction-filters"
import { TransactionFormDialog } from "./transaction-form-dialog"
import { TransactionsTable } from "./transactions-table"

export function TransacoesView({
  initialAccounts,
  initialCategories,
  initialTransactions,
}: {
  initialAccounts: AccountWithBalance[]
  initialCategories: Category[]
  initialTransactions: TransactionWithRelations[]
}) {
  const now = new Date()
  const defaultFrom = format(startOfMonth(now), "yyyy-MM-dd")
  const defaultTo = format(endOfMonth(now), "yyyy-MM-dd")

  const [filters, setFilters] = React.useState<Filters>({
    dateFrom: defaultFrom,
    dateTo: defaultTo,
  })
  const [page, setPage] = React.useState(1)
  const pageSize = 10

  const matchesInitial =
    filters.dateFrom === defaultFrom &&
    filters.dateTo === defaultTo &&
    !filters.accountId &&
    !filters.categoryId &&
    !filters.kind &&
    !filters.search

  const { data: accounts = [] } = useAccounts(initialAccounts)
  const { data: categories = [] } = useCategories(initialCategories)
  const { data: transactions = [], isFetching } = useTransactions(
    filters,
    matchesInitial ? initialTransactions : undefined
  )

  const [createOpen, setCreateOpen] = React.useState(false)
  const [editing, setEditing] =
    React.useState<TransactionWithRelations | null>(null)
  const [deleting, setDeleting] =
    React.useState<TransactionWithRelations | null>(null)

  const totals = React.useMemo(() => {
    const entradas = transactions
      .filter((t) => t.kind === "entrada")
      .reduce((s, t) => s + Number(t.amount), 0)
    const saidas = transactions
      .filter((t) => t.kind === "saida")
      .reduce((s, t) => s + Number(t.amount), 0)
    return { entradas, saidas, saldo: entradas - saidas }
  }, [transactions])

  const noAccounts = accounts.length === 0
  const pageCount = Math.max(1, Math.ceil(transactions.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const pageStart = (currentPage - 1) * pageSize
  const visibleTransactions = transactions.slice(pageStart, pageStart + pageSize)

  function updateFilters(next: Filters) {
    setFilters(next)
    setPage(1)
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Movimentações"
        title="Transações"
        description="Lance entradas e saídas, filtre por mês, conta ou categoria."
      >
        {!noAccounts && (
          <Button
            onClick={() => setCreateOpen(true)}
            className="h-10 rounded-full px-5"
          >
            <Plus className="h-4 w-4" />
            Nova transação
          </Button>
        )}
      </PageHeader>

      {noAccounts ? (
        <NoAccountsState />
      ) : (
        <>
          <TransactionFilters
            filters={filters}
            onChange={updateFilters}
            accounts={accounts}
            categories={categories}
          />

          <SummaryCards
            entradas={totals.entradas}
            saidas={totals.saidas}
            saldo={totals.saldo}
            dateFrom={filters.dateFrom}
            dateTo={filters.dateTo}
            loading={isFetching}
          />

          {transactions.length === 0 ? (
            <EmptyTransactionsState onCreate={() => setCreateOpen(true)} />
          ) : (
            <div className="space-y-3">
              <TransactionsTable
                transactions={visibleTransactions}
                onEdit={setEditing}
                onDelete={setDeleting}
              />
              <PaginationBar
                total={transactions.length}
                page={currentPage}
                pageCount={pageCount}
                pageSize={pageSize}
                onPageChange={setPage}
              />
            </div>
          )}

          <TransactionFormDialog
            open={createOpen}
            onOpenChange={setCreateOpen}
            accounts={accounts}
            categories={categories}
          />

          <TransactionFormDialog
            open={!!editing}
            onOpenChange={(open) => !open && setEditing(null)}
            transaction={editing}
            accounts={accounts}
            categories={categories}
          />

          <DeleteTransactionDialog
            transaction={deleting}
            onOpenChange={(open) => !open && setDeleting(null)}
          />
        </>
      )}
    </div>
  )
}

function PaginationBar({
  total,
  page,
  pageCount,
  pageSize,
  onPageChange,
}: {
  total: number
  page: number
  pageCount: number
  pageSize: number
  onPageChange: (page: number) => void
}) {
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(total, page * pageSize)

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card/60 px-4 py-3 text-[13px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <span>
        Mostrando {start}-{end} de {total} transações
      </span>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-full"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Anterior
        </Button>
        <span className="min-w-16 text-center tabular-nums">
          {page} / {pageCount}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
          className="rounded-full"
        >
          Próxima
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}

function SummaryCards({
  entradas,
  saidas,
  saldo,
  dateFrom,
  dateTo,
  loading,
}: {
  entradas: number
  saidas: number
  saldo: number
  dateFrom: string
  dateTo: string
  loading: boolean
}) {
  const negative = saldo < 0
  const caption = dateFrom === dateTo
    ? format(new Date(dateFrom + "T00:00:00"), "dd/MM/yyyy")
    : `${format(new Date(dateFrom + "T00:00:00"), "dd/MM")} – ${format(new Date(dateTo + "T00:00:00"), "dd/MM/yyyy")}`
  return (
    <div
      className={cn(
        "grid gap-3 sm:grid-cols-3 transition-opacity",
        loading && "opacity-60"
      )}
    >
      <SummaryCard
        label="Entradas"
        value={entradas}
        icon={<ArrowDownLeft className="h-4 w-4" />}
        accent="emerald"
      />
      <SummaryCard
        label="Saídas"
        value={saidas}
        icon={<ArrowUpRight className="h-4 w-4" />}
        accent="rose"
      />
      <SummaryCard
        label="Saldo do período"
        value={saldo}
        valueClassName={
          negative
            ? "text-destructive"
            : "text-emerald-600 dark:text-emerald-400"
        }
        caption={caption}
      />
    </div>
  )
}

function SummaryCard({
  label,
  value,
  icon,
  accent,
  caption,
  valueClassName,
}: {
  label: string
  value: number
  icon?: React.ReactNode
  accent?: "emerald" | "rose"
  caption?: string
  valueClassName?: string
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium text-muted-foreground">
          {label}
        </span>
        {icon && (
          <span
            className={cn(
              "inline-flex h-7 w-7 items-center justify-center rounded-lg",
              accent === "emerald" &&
                "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
              accent === "rose" &&
                "bg-rose-500/10 text-rose-600 dark:text-rose-400"
            )}
          >
            {icon}
          </span>
        )}
      </div>
      <p
        className={cn(
          "mt-4 font-display text-[28px] leading-none tracking-tight tabular-nums",
          valueClassName ?? "text-foreground"
        )}
      >
        {formatBRL(value)}
      </p>
      {caption && (
        <p className="mt-2 text-[11px] text-muted-foreground">{caption}</p>
      )}
    </div>
  )
}

function NoAccountsState() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-dashed border-border/80 bg-card/40 p-12 text-center sm:p-16">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,oklch(0.51_0.16_264/0.08),transparent_60%)]" />
      <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
        <Wallet className="h-6 w-6" strokeWidth={1.8} />
      </div>
      <p className="font-display text-2xl text-foreground">
        Crie uma <em className="italic text-primary">conta</em> primeiro.
      </p>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        Toda transação precisa de uma conta de origem. Cadastre sua carteira ou
        banco para começar a registrar movimentações.
      </p>
      <Link
        href="/contas"
        className={cn(buttonVariants(), "mt-7 h-11 rounded-full px-6")}
      >
        <Plus className="h-4 w-4" />
        Criar primeira conta
      </Link>
    </div>
  )
}

function EmptyTransactionsState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-dashed border-border/80 bg-card/40 p-10 text-center sm:p-14">
      <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
        <Receipt className="h-6 w-6" strokeWidth={1.8} />
      </div>
      <p className="font-display text-2xl text-foreground">
        Nada por aqui ainda.
      </p>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        Lance sua primeira transação do mês para começar a acompanhar suas
        finanças.
      </p>
      <Button onClick={onCreate} className="mt-7 h-11 rounded-full px-6">
        <Plus className="h-4 w-4" />
        Lançar transação
      </Button>
    </div>
  )
}
