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
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { todayISO } from "@/lib/period"
import { recurringSchema, type RecurringValues } from "@/lib/schemas/recurring"
import {
  useCreateRecurring,
  useUpdateRecurring,
} from "@/hooks/use-recurring"
import type {
  AccountWithBalance,
  Category,
  RecurringWithRelations,
  TransactionKind,
} from "@/types/domain"

const SENTINEL_NONE = "__none__"

function emptyValues(initialAccountId?: string): RecurringValues {
  const today = new Date()
  return {
    kind: "saida",
    amount: 0,
    description: "",
    day_of_month: today.getDate(),
    start_date: todayISO(),
    end_date: null,
    account_id: initialAccountId ?? "",
    category_id: null,
    active: true,
  }
}

export function RecurringFormDialog({
  open,
  onOpenChange,
  recurring,
  accounts,
  categories,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  recurring?: RecurringWithRelations | null
  accounts: AccountWithBalance[]
  categories: Category[]
}) {
  const isEdit = !!recurring
  const createMutation = useCreateRecurring()
  const updateMutation = useUpdateRecurring()

  const form = useForm<RecurringValues>({
    resolver: standardSchemaResolver(recurringSchema),
    defaultValues: emptyValues(accounts[0]?.id),
  })

  React.useEffect(() => {
    if (!open) return
    if (recurring) {
      form.reset({
        kind: recurring.kind as TransactionKind,
        amount: recurring.amount,
        description: recurring.description ?? "",
        day_of_month: recurring.day_of_month,
        start_date: recurring.start_date,
        end_date: recurring.end_date,
        account_id: recurring.account_id,
        category_id: recurring.category_id,
        active: recurring.active,
      })
    } else {
      form.reset(emptyValues(accounts[0]?.id))
    }
  }, [open, recurring, accounts, form])

  const watchedKind = useWatch({
    control: form.control,
    name: "kind",
  })

  const availableCategories = React.useMemo(
    () => categories.filter((category) => category.kind === watchedKind),
    [categories, watchedKind]
  )

  React.useEffect(() => {
    const currentCategoryId = form.getValues("category_id")
    if (!currentCategoryId) return
    if (!availableCategories.some((c) => c.id === currentCategoryId)) {
      form.setValue("category_id", null, { shouldDirty: false })
    }
  }, [availableCategories, form])

  async function onSubmit(values: RecurringValues) {
    const toastId = toast.loading(isEdit ? "Salvando..." : "Criando...")
    const result =
      isEdit && recurring
        ? await updateMutation.mutateAsync({ id: recurring.id, values })
        : await createMutation.mutateAsync(values)

    if (!result.ok) {
      toast.error(result.error, { id: toastId })
      return
    }

    toast.success(
      isEdit ? "Recorrência atualizada." : "Recorrência criada.",
      { id: toastId, duration: 2500 }
    )
    onOpenChange(false)
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="font-display text-xl tracking-tight">
            {isEdit ? "Editar recorrência" : "Nova recorrência"}
          </DialogTitle>
          <DialogDescription>
            Configure um template mensal. Ele será lançado automaticamente ao
            abrir o mês em Transações.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pt-1"
          >
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
                          field.value === 0 && !form.formState.dirtyFields.amount
                            ? ""
                            : field.value
                        }
                        onChange={(event) => {
                          const value = event.target.valueAsNumber
                          field.onChange(Number.isFinite(value) ? value : 0)
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
                name="day_of_month"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[13px]">Dia do mês</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="31"
                        step="1"
                        className="h-11 tabular-nums"
                        value={field.value}
                        onChange={(event) => {
                          const value = event.target.valueAsNumber
                          field.onChange(Number.isFinite(value) ? value : 1)
                        }}
                        onBlur={field.onBlur}
                        name={field.name}
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
                      placeholder="Ex.: Salário, aluguel, Netflix"
                      className="h-11"
                      value={field.value ?? ""}
                      onChange={(event) => field.onChange(event.target.value)}
                      onBlur={field.onBlur}
                      name={field.name}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[13px]">Início</FormLabel>
                    <FormControl>
                      <Input type="date" className="h-11" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[13px]">Fim opcional</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        className="h-11"
                        value={field.value ?? ""}
                        onChange={(event) =>
                          field.onChange(event.target.value || null)
                        }
                        onBlur={field.onBlur}
                        name={field.name}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="account_id"
              render={({ field }) => {
                const selectedAccount = accounts.find((a) => a.id === field.value)
                return (
                  <FormItem>
                    <FormLabel className="text-[13px]">Conta</FormLabel>
                    <Select
                      value={field.value || undefined}
                      onValueChange={(value) => {
                        if (value) field.onChange(value)
                      }}
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
                        {accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            <span className="flex items-center gap-2">
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: account.color }}
                              />
                              {account.name}
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
                      onValueChange={(value) =>
                        field.onChange(value === SENTINEL_NONE ? null : value)
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
                        {availableCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            <span className="flex items-center gap-2">
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: category.color }}
                              />
                              {category.name}
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
                {isEdit ? "Salvar alterações" : "Criar recorrência"}
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
