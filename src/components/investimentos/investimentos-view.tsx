"use client"

import * as React from "react"
import {
  BarChart3,
  Landmark,
  MoreVertical,
  Pencil,
  PiggyBank,
  Plus,
  Trash2,
  WalletCards,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PageHeader } from "@/components/layout/page-elements"
import { cn } from "@/lib/utils"
import { formatBRL, formatDate } from "@/lib/formatters"
import { useAccounts } from "@/hooks/use-accounts"
import { useInvestments } from "@/hooks/use-investments"
import type {
  AccountWithBalance,
  InvestmentKind,
  InvestmentWithRelations,
} from "@/types/domain"
import {
  INVESTMENT_KIND_LABELS,
  INVESTMENT_KINDS,
} from "@/types/domain"

import { DeleteInvestmentDialog } from "./delete-investment-dialog"
import { InvestmentFormDialog } from "./investment-form-dialog"

export function InvestimentosView({
  initialAccounts,
  initialInvestments,
}: {
  initialAccounts: AccountWithBalance[]
  initialInvestments: InvestmentWithRelations[]
}) {
  const { data: accounts = [] } = useAccounts(initialAccounts)
  const { data: investments = [] } = useInvestments(initialInvestments)

  const [createOpen, setCreateOpen] = React.useState(false)
  const [editing, setEditing] =
    React.useState<InvestmentWithRelations | null>(null)
  const [deleting, setDeleting] =
    React.useState<InvestmentWithRelations | null>(null)

  const totals = React.useMemo(() => {
    const byKind = Object.fromEntries(
      INVESTMENT_KINDS.map((kind) => [kind, 0])
    ) as Record<InvestmentKind, number>

    for (const investment of investments) {
      const kind = investment.kind as InvestmentKind
      if (kind in byKind) byKind[kind] += Number(investment.amount)
    }

    const total = Object.values(byKind).reduce((sum, value) => sum + value, 0)
    return { byKind, total }
  }, [investments])

  const latest = investments[0]

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Patrimônio"
        title="Investimentos"
        description="Registre aportes manuais e acompanhe o total investido por tipo."
      >
        <Button
          onClick={() => setCreateOpen(true)}
          className="h-10 rounded-full px-5"
        >
          <Plus className="h-4 w-4" />
          Novo aporte
        </Button>
      </PageHeader>

      <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
        <TotalInvestedCard total={totals.total} latest={latest} />
        <KindBreakdown byKind={totals.byKind} total={totals.total} />
      </div>

      {investments.length === 0 ? (
        <EmptyInvestmentsState onCreate={() => setCreateOpen(true)} />
      ) : (
        <div className="rounded-2xl border border-border/70 bg-card">
          <div className="flex items-center justify-between border-b border-border/60 px-4 py-3 sm:px-5">
            <div>
              <h2 className="font-display text-xl tracking-tight">
                Aportes
              </h2>
              <p className="text-[13px] text-muted-foreground">
                {investments.length} registro
                {investments.length === 1 ? "" : "s"} manual
                {investments.length === 1 ? "" : "is"}
              </p>
            </div>
          </div>
          <div className="divide-y divide-border/60">
            {investments.map((investment) => (
              <InvestmentRow
                key={investment.id}
                investment={investment}
                onEdit={() => setEditing(investment)}
                onDelete={() => setDeleting(investment)}
              />
            ))}
          </div>
        </div>
      )}

      <InvestmentFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        accounts={accounts}
      />

      <InvestmentFormDialog
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
        investment={editing}
        accounts={accounts}
      />

      <DeleteInvestmentDialog
        investment={deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
      />
    </div>
  )
}

function TotalInvestedCard({
  total,
  latest,
}: {
  total: number
  latest?: InvestmentWithRelations
}) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-border/70 bg-card p-6">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_0%,oklch(0.62_0.16_150/0.12),transparent_55%)]" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-[12px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Total investido
          </span>
          <p className="mt-5 font-display text-[42px] leading-none tracking-tight text-foreground sm:text-[52px]">
            {formatBRL(total)}
          </p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            Soma dos aportes cadastrados manualmente. Rentabilidade e posição
            atual entram em uma etapa futura.
          </p>
        </div>
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
          <PiggyBank className="h-6 w-6" strokeWidth={1.8} />
        </div>
      </div>
      {latest && (
        <div className="mt-8 rounded-xl border border-border/60 bg-background/60 p-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Último aporte
          </p>
          <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <span className="font-medium text-foreground">
              {latest.description || INVESTMENT_KIND_LABELS[latest.kind as InvestmentKind]}
            </span>
            <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
              {formatBRL(latest.amount)}
            </span>
          </div>
        </div>
      )}
    </section>
  )
}

function KindBreakdown({
  byKind,
  total,
}: {
  byKind: Record<InvestmentKind, number>
  total: number
}) {
  return (
    <section className="rounded-2xl border border-border/70 bg-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl tracking-tight">
            Distribuição
          </h2>
          <p className="text-[13px] text-muted-foreground">
            Por tipo de aporte
          </p>
        </div>
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <BarChart3 className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-6 space-y-4">
        {INVESTMENT_KINDS.map((kind) => {
          const value = byKind[kind]
          const pct = total > 0 ? Math.round((value / total) * 100) : 0
          return (
            <div key={kind}>
              <div className="mb-1.5 flex items-center justify-between gap-3 text-[13px]">
                <span className="font-medium text-foreground">
                  {INVESTMENT_KIND_LABELS[kind]}
                </span>
                <span className="text-muted-foreground tabular-nums">
                  {pct}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full",
                    kind === "renda_fixa" && "bg-primary",
                    kind === "renda_variavel" && "bg-emerald-500",
                    kind === "livre" && "bg-amber-500"
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-1 text-[12px] text-muted-foreground">
                {formatBRL(value)}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function InvestmentRow({
  investment,
  onEdit,
  onDelete,
}: {
  investment: InvestmentWithRelations
  onEdit: () => void
  onDelete: () => void
}) {
  const kind = investment.kind as InvestmentKind

  return (
    <article className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div className="flex min-w-0 items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          {kind === "renda_fixa" ? (
            <Landmark className="h-4 w-4" />
          ) : kind === "renda_variavel" ? (
            <BarChart3 className="h-4 w-4" />
          ) : (
            <WalletCards className="h-4 w-4" />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-[15px] font-medium text-foreground">
              {investment.description || INVESTMENT_KIND_LABELS[kind]}
            </h3>
            <Badge variant="outline">{INVESTMENT_KIND_LABELS[kind]}</Badge>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted-foreground">
            <span>{formatDate(investment.occurred_at, "dd MMM yyyy")}</span>
            <span>
              {investment.account ? (
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: investment.account.color }}
                  />
                  {investment.account.name}
                </span>
              ) : (
                "Sem conta vinculada"
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <span className="text-[15px] font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
          {formatBRL(investment.amount)}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Ações do aporte"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <MoreVertical className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil />
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={onDelete}>
              <Trash2 />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </article>
  )
}

function EmptyInvestmentsState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-dashed border-border/80 bg-card/40 p-10 text-center sm:p-14">
      <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
        <PiggyBank className="h-6 w-6" strokeWidth={1.8} />
      </div>
      <p className="font-display text-2xl text-foreground">
        Nenhum aporte registrado.
      </p>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        Lance seu primeiro aporte para começar a acompanhar o capital investido
        no Moneta.
      </p>
      <Button onClick={onCreate} className="mt-7 h-11 rounded-full px-6">
        <Plus className="h-4 w-4" />
        Registrar aporte
      </Button>
    </div>
  )
}
