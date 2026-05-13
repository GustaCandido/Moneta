"use client"

import { MoreVertical, Pencil, Trash2 } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { formatBRL, formatDate } from "@/lib/formatters"
import type { TransactionWithRelations } from "@/types/domain"

export function TransactionsTable({
  transactions,
  onEdit,
  onDelete,
}: {
  transactions: TransactionWithRelations[]
  onEdit: (t: TransactionWithRelations) => void
  onDelete: (t: TransactionWithRelations) => void
}) {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:hidden">
        {transactions.map((t) => (
          <TransactionMobileCard
            key={t.id}
            transaction={t}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-border/70 bg-card md:block">
        <Table>
        <TableHeader>
          <TableRow className="border-border/60 bg-muted/30 hover:bg-muted/30">
            <TableHead className="pl-4 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Data
            </TableHead>
            <TableHead className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Descrição
            </TableHead>
            <TableHead className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Categoria
            </TableHead>
            <TableHead className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Conta
            </TableHead>
            <TableHead className="pr-4 text-right text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Valor
            </TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((t) => {
            const isEntrada = t.kind === "entrada"
            return (
              <TableRow
                key={t.id}
                className="border-border/50 last:border-0"
              >
                <TableCell className="pl-4 text-[13px] tabular-nums text-muted-foreground">
                  {formatDate(t.occurred_at, "dd MMM")}
                </TableCell>
                <TableCell className="max-w-[260px] truncate text-[14px] font-medium text-foreground">
                  {t.description || (
                    <span className="font-normal text-muted-foreground">
                      Sem descrição
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {t.category ? (
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12px] font-medium"
                      style={{
                        backgroundColor: `${t.category.color}1a`,
                        color: t.category.color,
                      }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: t.category.color }}
                      />
                      {t.category.name}
                    </span>
                  ) : (
                    <span className="text-[12px] text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-2 text-[13px]">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: t.account.color }}
                    />
                    <span className="truncate">{t.account.name}</span>
                  </span>
                </TableCell>
                <TableCell
                  className={cn(
                    "pr-4 text-right text-[14px] font-semibold tabular-nums",
                    isEntrada
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-foreground"
                  )}
                >
                  {isEntrada ? "+ " : "− "}
                  {formatBRL(t.amount)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      aria-label="Ações"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(t)}>
                        <Pencil />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => onDelete(t)}
                      >
                        <Trash2 />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
        </Table>
      </div>
    </div>
  )
}

function TransactionMobileCard({
  transaction,
  onEdit,
  onDelete,
}: {
  transaction: TransactionWithRelations
  onEdit: (t: TransactionWithRelations) => void
  onDelete: (t: TransactionWithRelations) => void
}) {
  const isEntrada = transaction.kind === "entrada"

  return (
    <article className="rounded-2xl border border-border/70 bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[12px] tabular-nums text-muted-foreground">
            {formatDate(transaction.occurred_at, "dd MMM yyyy")}
          </p>
          <h3 className="mt-1 truncate text-[15px] font-medium text-foreground">
            {transaction.description || "Sem descrição"}
          </h3>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Ações"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <MoreVertical className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(transaction)}>
              <Pencil />
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(transaction)}
            >
              <Trash2 />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <span className="inline-flex max-w-full items-center gap-2 text-[13px] text-muted-foreground">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: transaction.account.color }}
            />
            <span className="truncate">{transaction.account.name}</span>
          </span>
          <div>
            {transaction.category ? (
              <span
                className="inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12px] font-medium"
                style={{
                  backgroundColor: `${transaction.category.color}1a`,
                  color: transaction.category.color,
                }}
              >
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: transaction.category.color }}
                />
                <span className="truncate">{transaction.category.name}</span>
              </span>
            ) : (
              <span className="text-[12px] text-muted-foreground">
                Sem categoria
              </span>
            )}
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 text-[15px] font-semibold tabular-nums",
            isEntrada
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-foreground"
          )}
        >
          {isEntrada ? "+ " : "− "}
          {formatBRL(transaction.amount)}
        </span>
      </div>
    </article>
  )
}
