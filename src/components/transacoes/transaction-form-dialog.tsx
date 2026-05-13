"use client"

import * as React from "react"
import { useForm, useWatch } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { ArrowDownLeft, ArrowUpRight } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { todayISO } from "@/lib/period"
import {
  transactionSchema,
  type TransactionValues,
} from "@/lib/schemas/transaction"
import { useAccounts } from "@/hooks/use-accounts"
import { useCategories } from "@/hooks/use-categories"
import {
  useCreateTransaction,
  useUpdateTransaction,
} from "@/hooks/use-transactions"
import type {
  AccountWithBalance,
  Category,
  TransactionKind,
  TransactionWithRelations,
} from "@/types/domain"

const SENTINEL_NONE = "__none__"

function emptyValues(initialAccountId?: string): TransactionValues {
  return {
    kind: "saida",
    amount: 0,
    description: "",
    occurred_at: todayISO(),
    account_id: initialAccountId ?? "",
    category_id: null,
  }
}

export function TransactionFormDialog({
  open,
  onOpenChange,
  transaction,
  accounts,
  categories,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction?: TransactionWithRelations | null
  accounts: AccountWithBalance[]
  categories: Category[]
}) {
  const isEdit = !!transaction
  const createMutation = useCreateTransaction()
  const updateMutation = useUpdateTransaction()

  // Sempre sincroniza com hooks (caso o initialData esteja desatualizado)
  const { data: liveAccounts } = useAccounts(accounts)
  const { data: liveCategories } = useCategories(categories)
  const accountsList = liveAccounts ?? accounts
  const categoriesList = liveCategories ?? categories

  const form = useForm<TransactionValues>({
    resolver: standardSchemaResolver(transactionSchema),
    defaultValues: emptyValues(accountsList[0]?.id),
  })

  React.useEffect(() => {
    if (!open) return
    if (transaction) {
      form.reset({
        kind: transaction.kind as TransactionKind,
        amount: transaction.amount,
        description: transaction.description ?? "",
        occurred_at: transaction.occurred_at,
        account_id: transaction.account_id,
        category_id: transaction.category_id,
      })
    } else {
      form.reset(emptyValues(accountsList[0]?.id))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, transaction])

  const watchedKind = useWatch({
    control: form.control,
    name: "kind",
  })
  const availableCategories = React.useMemo(
    () => categoriesList.filter((c) => c.kind === watchedKind),
    [categoriesList, watchedKind]
  )

  // Limpa category_id quando o kind muda e a categoria atual não pertence ao novo kind
  React.useEffect(() => {
    const currentCategoryId = form.getValues("category_id")
    if (!currentCategoryId) return
    if (!availableCategories.some((c) => c.id === currentCategoryId)) {
      form.setValue("category_id", null, { shouldDirty: false })
    }
  }, [watchedKind, availableCategories, form])

  async function onSubmit(values: TransactionValues) {
    const toastId = toast.loading(isEdit ? "Salvando…" : "Lançando…")
    const result =
      isEdit && transaction
        ? await updateMutation.mutateAsync({ id: transaction.id, values })
        : await createMutation.mutateAsync(values)

    if (!result.ok) {
      toast.error(result.error, { id: toastId })
      return
    }
    toast.success(
      isEdit ? "Transação atualizada." : "Transação lançada.",
      { id: toastId, duration: 2500 }
    )
    onOpenChange(false)
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="font-display text-xl tracking-tight">
            {isEdit ? "Editar transação" : "Nova transação"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Atualize os dados deste lançamento."
              : "Registre uma entrada ou saída."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pt-1"
          >
            {/* Kind toggle */}
            <FormField
              control={form.control}
              name="kind"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[13px]">Tipo</FormLabel>
                  <div className="grid grid-cols-2 gap-2">
                    <KindButton
                      kind="entrada"
                      active={field.value === "entrada"}
                      onClick={() => field.onChange("entrada")}
                    />
                    <KindButton
                      kind="saida"
                      active={field.value === "saida"}
                      onClick={() => field.onChange("saida")}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[13px]">Valor (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="0,00"
                        className="h-11 tabular-nums"
                        value={
                          field.value === 0 &&
                          !form.formState.dirtyFields.amount
                            ? ""
                            : field.value
                        }
                        onChange={(e) => {
                          const v = e.target.valueAsNumber
                          field.onChange(Number.isFinite(v) ? v : 0)
                        }}
                        onBlur={field.onBlur}
                        name={field.name}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="occurred_at"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[13px]">Data</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        className="h-11"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[13px]">Descrição</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex.: Mercado Pão de Açúcar"
                      className="h-11"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value)}
                      onBlur={field.onBlur}
                      name={field.name}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="account_id"
              render={({ field }) => {
                const selectedAccount = accountsList.find((a) => a.id === field.value)
                return (
                  <FormItem>
                    <FormLabel className="text-[13px]">Conta</FormLabel>
                    <Select
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11 w-full">
                          {selectedAccount ? (
                            <span className="flex items-center gap-2">
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: selectedAccount.color }}
                              />
                              {selectedAccount.name}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Selecione a conta</span>
                          )}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {accountsList.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            <span className="flex items-center gap-2">
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: a.color }}
                              />
                              {a.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />

            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => {
                const selectedCategory = availableCategories.find((c) => c.id === field.value)
                return (
                  <FormItem>
                    <FormLabel className="text-[13px]">Categoria</FormLabel>
                    <Select
                      value={field.value ?? SENTINEL_NONE}
                      onValueChange={(v) =>
                        field.onChange(v === SENTINEL_NONE ? null : v)
                      }
                    >
                      <FormControl>
                        <SelectTrigger className="h-11 w-full">
                          {selectedCategory ? (
                            <span className="flex items-center gap-2">
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: selectedCategory.color }}
                              />
                              {selectedCategory.name}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Sem categoria</span>
                          )}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={SENTINEL_NONE}>
                          <span className="text-muted-foreground">Sem categoria</span>
                        </SelectItem>
                        {availableCategories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            <span className="flex items-center gap-2">
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: c.color }}
                              />
                              {c.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />

            <DialogFooter className="mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isEdit ? "Salvar alterações" : "Lançar transação"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function KindButton({
  kind,
  active,
  onClick,
}: {
  kind: TransactionKind
  active: boolean
  onClick: () => void
}) {
  const isEntrada = kind === "entrada"
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "group flex h-14 items-center justify-center gap-2.5 rounded-xl border-2 px-3 transition-all",
        active
          ? isEntrada
            ? "border-emerald-500 bg-emerald-500/8 text-emerald-700 dark:text-emerald-400"
            : "border-rose-500 bg-rose-500/8 text-rose-700 dark:text-rose-400"
          : "border-border bg-card text-muted-foreground hover:border-border hover:bg-muted"
      )}
    >
      {isEntrada ? (
        <ArrowDownLeft className="h-4 w-4" strokeWidth={2.2} />
      ) : (
        <ArrowUpRight className="h-4 w-4" strokeWidth={2.2} />
      )}
      <span className="text-[14px] font-medium">
        {isEntrada ? "Entrada" : "Saída"}
      </span>
    </button>
  )
}
