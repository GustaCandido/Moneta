"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarClock,
  MoreVertical,
  Pencil,
  Pause,
  Play,
  Plus,
  Repeat2,
  Trash2,
  Wallet,
} from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
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
import { useCategories } from "@/hooks/use-categories"
import {
  useRecurring,
  useSetRecurringActive,
} from "@/hooks/use-recurring"
import type {
  AccountWithBalance,
  Category,
  RecurringWithRelations,
} from "@/types/domain"

import { DeleteRecurringDialog } from "./delete-recurring-dialog"
import { RecurringFormDialog } from "./recurring-form-dialog"

export function ConfiguracoesView({
  initialAccounts,
  initialCategories,
  initialRecurring,
}: {
  initialAccounts: AccountWithBalance[]
  initialCategories: Category[]
  initialRecurring: RecurringWithRelations[]
}) {
  const { data: accounts = [] } = useAccounts(initialAccounts)
  const { data: categories = [] } = useCategories(initialCategories)
  const { data: recurring = [] } = useRecurring(initialRecurring)
  const setActiveMutation = useSetRecurringActive()

  const [createOpen, setCreateOpen] = React.useState(false)
  const [editing, setEditing] =
    React.useState<RecurringWithRelations | null>(null)
  const [deleting, setDeleting] =
    React.useState<RecurringWithRelations | null>(null)

  const activeRecurring = recurring.filter((item) => item.active)
  const monthlyImpact = activeRecurring.reduce((sum, item) => {
    const amount = Number(item.amount)
    return item.kind === "entrada" ? sum + amount : sum - amount
  }, 0)

  async function toggleActive(item: RecurringWithRelations) {
    const nextActive = !item.active
    const toastId = toast.loading(nextActive ? "Retomando..." : "Pausando...")
    const result = await setActiveMutation.mutateAsync({
      id: item.id,
      active: nextActive,
    })

    if (!result.ok) {
      toast.error(result.error, { id: toastId })
      return
    }

    toast.success(nextActive ? "Recorrência retomada." : "Recorrência pausada.", {
      id: toastId,
      duration: 2500,
    })
  }

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Automação"
        title="Configurações"
        description="Gerencie recorrências para materializar entradas e saídas automaticamente no mês aberto."
      >
        {accounts.length > 0 && (
          <Button
            onClick={() => setCreateOpen(true)}
            className="h-10 rounded-full px-5"
          >
            <Plus className="h-4 w-4" />
            Nova recorrência
          </Button>
        )}
      </PageHeader>

      <div className="grid gap-3 md:grid-cols-3">
        <ConfigStat
          label="Recorrências ativas"
          value={String(activeRecurring.length)}
          caption={`${recurring.length} cadastradas`}
          icon={<Repeat2 className="h-4 w-4" />}
        />
        <ConfigStat
          label="Impacto mensal previsto"
          value={formatBRL(monthlyImpact)}
          caption="Entradas menos saídas ativas"
          accent={monthlyImpact < 0 ? "rose" : "emerald"}
          icon={
            monthlyImpact < 0 ? (
              <ArrowUpRight className="h-4 w-4" />
            ) : (
              <ArrowDownLeft className="h-4 w-4" />
            )
          }
        />
        <ConfigStat
          label="Materialização"
          value="Lazy"
          caption="Ao abrir Transações do mês"
          icon={<CalendarClock className="h-4 w-4" />}
        />
      </div>

      {accounts.length === 0 ? (
        <NoAccountsState />
      ) : recurring.length === 0 ? (
        <EmptyRecurringState onCreate={() => setCreateOpen(true)} />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {recurring.map((item) => (
            <RecurringCard
              key={item.id}
              recurring={item}
              onEdit={() => setEditing(item)}
              onDelete={() => setDeleting(item)}
              onToggleActive={() => toggleActive(item)}
              isToggling={setActiveMutation.isPending}
            />
          ))}
        </div>
      )}

      <RecurringFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        accounts={accounts}
        categories={categories}
      />

      <RecurringFormDialog
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
        recurring={editing}
        accounts={accounts}
        categories={categories}
      />

      <DeleteRecurringDialog
        recurring={deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
      />
    </div>
  )
}

function ConfigStat({
  label,
  value,
  caption,
  icon,
  accent = "primary",
}: {
  label: string
  value: string
  caption: string
  icon: React.ReactNode
  accent?: "primary" | "emerald" | "rose"
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5">
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
      <p className="mt-4 font-display text-[28px] leading-none tracking-tight text-foreground">
        {value}
      </p>
      <p className="mt-2 text-[11px] text-muted-foreground">{caption}</p>
    </div>
  )
}

function RecurringCard({
  recurring,
  onEdit,
  onDelete,
  onToggleActive,
  isToggling,
}: {
  recurring: RecurringWithRelations
  onEdit: () => void
  onDelete: () => void
  onToggleActive: () => void
  isToggling: boolean
}) {
  const isEntrada = recurring.kind === "entrada"

  return (
    <article
      className={cn(
        "rounded-2xl border border-border/70 bg-card p-5 transition-opacity",
        !recurring.active && "opacity-65"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={recurring.active ? "secondary" : "outline"}
              className={cn(
                recurring.active &&
                  "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              )}
            >
              {recurring.active ? "Ativa" : "Pausada"}
            </Badge>
            <Badge variant="outline">
              Dia {recurring.day_of_month}
            </Badge>
          </div>
          <h2 className="mt-4 truncate font-display text-xl leading-tight tracking-tight">
            {recurring.description || "Recorrência sem descrição"}
          </h2>
          <p
            className={cn(
              "mt-2 text-lg font-semibold tabular-nums",
              isEntrada
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-foreground"
            )}
          >
            {isEntrada ? "+ " : "- "}
            {formatBRL(recurring.amount)}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Ações da recorrência"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <MoreVertical className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onToggleActive} disabled={isToggling}>
              {recurring.active ? <Pause /> : <Play />}
              {recurring.active ? "Pausar" : "Retomar"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={onDelete}>
              <Trash2 />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-5 grid gap-3 text-[13px] text-muted-foreground sm:grid-cols-2">
        <span className="inline-flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: recurring.account.color }}
          />
          {recurring.account.name}
        </span>
        <span className="inline-flex items-center gap-2">
          {recurring.category ? (
            <>
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: recurring.category.color }}
              />
              {recurring.category.name}
            </>
          ) : (
            "Sem categoria"
          )}
        </span>
      </div>

      <p className="mt-4 text-[12px] text-muted-foreground">
        Inicia em {formatDate(recurring.start_date, "dd/MM/yyyy")}
        {recurring.end_date
          ? ` · termina em ${formatDate(recurring.end_date, "dd/MM/yyyy")}`
          : " · sem data final"}
      </p>
    </article>
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
        Crie uma conta antes de automatizar.
      </p>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        Toda recorrência precisa de uma conta para receber os lançamentos
        materializados.
      </p>
      <Link
        href="/contas"
        className={cn(buttonVariants(), "mt-7 h-11 rounded-full px-6")}
      >
        <Plus className="h-4 w-4" />
        Criar conta
      </Link>
    </div>
  )
}

function EmptyRecurringState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-dashed border-border/80 bg-card/40 p-10 text-center sm:p-14">
      <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
        <Repeat2 className="h-6 w-6" strokeWidth={1.8} />
      </div>
      <p className="font-display text-2xl text-foreground">
        Nenhuma recorrência ainda.
      </p>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        Cadastre salário, aluguel, assinaturas ou qualquer movimento que se
        repete todo mês.
      </p>
      <Button onClick={onCreate} className="mt-7 h-11 rounded-full px-6">
        <Plus className="h-4 w-4" />
        Criar recorrência
      </Button>
    </div>
  )
}
