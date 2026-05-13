"use client"

import { MoreVertical, Pencil, Trash2 } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { formatBRL, formatDate } from "@/lib/formatters"
import {
  ACCOUNT_TYPE_LABELS,
  type AccountType,
  type AccountWithBalance,
} from "@/types/domain"

export function AccountCard({
  account,
  onEdit,
  onDelete,
}: {
  account: AccountWithBalance
  onEdit: () => void
  onDelete: () => void
}) {
  const negative = account.balance < 0

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-5 transition-all hover:border-border hover:shadow-[0_10px_30px_-12px_rgba(15,23,42,0.12)]">
      {/* Color stripe na lateral */}
      <span
        className="absolute inset-y-0 left-0 w-1"
        style={{ backgroundColor: account.color }}
        aria-hidden
      />

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: account.color }}
              aria-hidden
            />
            <h3 className="truncate text-[15px] font-medium text-foreground">
              {account.name}
            </h3>
          </div>
          <p className="mt-1 ml-[18px] text-[12px] text-muted-foreground">
            {ACCOUNT_TYPE_LABELS[account.type as AccountType] ?? account.type}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Mais opções"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground opacity-60 transition-all hover:bg-muted hover:text-foreground hover:opacity-100 focus-visible:opacity-100 group-hover:opacity-100"
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

      <div className="mt-6">
        <p
          className={cn(
            "font-display text-[32px] leading-none tracking-tight tabular-nums",
            negative ? "text-destructive" : "text-foreground"
          )}
        >
          {formatBRL(account.balance)}
        </p>
        <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Saldo atual
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-3 text-[11px] text-muted-foreground">
        <span>Saldo inicial: {formatBRL(account.initial_balance)}</span>
        <span>Desde {formatDate(account.created_at, "MMM yyyy")}</span>
      </div>
    </div>
  )
}
