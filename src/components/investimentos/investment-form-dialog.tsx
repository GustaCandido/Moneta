"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
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
import { todayISO } from "@/lib/period"
import {
  investmentSchema,
  type InvestmentValues,
} from "@/lib/schemas/investment"
import {
  useCreateInvestment,
  useUpdateInvestment,
} from "@/hooks/use-investments"
import type {
  AccountWithBalance,
  InvestmentKind,
  InvestmentWithRelations,
} from "@/types/domain"
import {
  INVESTMENT_KIND_LABELS,
  INVESTMENT_KINDS,
} from "@/types/domain"

const SENTINEL_NONE = "__none__"

const KIND_OPTIONS: { value: InvestmentKind; label: string }[] =
  INVESTMENT_KINDS.map((value) => ({
    value,
    label: INVESTMENT_KIND_LABELS[value],
  }))

function emptyValues(): InvestmentValues {
  return {
    kind: "renda_fixa",
    amount: 0,
    occurred_at: todayISO(),
    description: "",
    account_id: null,
  }
}

export function InvestmentFormDialog({
  open,
  onOpenChange,
  investment,
  accounts,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  investment?: InvestmentWithRelations | null
  accounts: AccountWithBalance[]
}) {
  const isEdit = !!investment
  const createMutation = useCreateInvestment()
  const updateMutation = useUpdateInvestment()

  const form = useForm<InvestmentValues>({
    resolver: standardSchemaResolver(investmentSchema),
    defaultValues: emptyValues(),
  })

  React.useEffect(() => {
    if (!open) return
    if (investment) {
      form.reset({
        kind: investment.kind as InvestmentKind,
        amount: investment.amount,
        occurred_at: investment.occurred_at,
        description: investment.description ?? "",
        account_id: investment.account_id,
      })
    } else {
      form.reset(emptyValues())
    }
  }, [open, investment, form])

  async function onSubmit(values: InvestmentValues) {
    const toastId = toast.loading(isEdit ? "Salvando..." : "Registrando...")
    const result =
      isEdit && investment
        ? await updateMutation.mutateAsync({ id: investment.id, values })
        : await createMutation.mutateAsync(values)

    if (!result.ok) {
      toast.error(result.error, { id: toastId })
      return
    }

    toast.success(isEdit ? "Aporte atualizado." : "Aporte registrado.", {
      id: toastId,
      duration: 2500,
    })
    onOpenChange(false)
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-display text-xl tracking-tight">
            {isEdit ? "Editar aporte" : "Novo aporte"}
          </DialogTitle>
          <DialogDescription>
            Registre manualmente capital aplicado. O valor entra no total
            investido do dashboard.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pt-1"
          >
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
                name="occurred_at"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[13px]">Data</FormLabel>
                    <FormControl>
                      <Input type="date" className="h-11" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="kind"
              render={({ field }) => {
                const selectedKind = KIND_OPTIONS.find((o) => o.value === field.value)
                return (
                  <FormItem>
                    <FormLabel className="text-[13px]">Tipo</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        if (value) field.onChange(value)
                      }}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11 w-full">
                          <span>{selectedKind?.label ?? "Selecione"}</span>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {KIND_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[13px]">Descrição</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex.: Tesouro Selic, CDB, ETF"
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

            <FormField
              control={form.control}
              name="account_id"
              render={({ field }) => {
                const selectedAccount = accounts.find((a) => a.id === field.value)
                return (
                  <FormItem>
                    <FormLabel className="text-[13px]">Conta opcional</FormLabel>
                    <Select
                      value={field.value ?? SENTINEL_NONE}
                      onValueChange={(value) =>
                        field.onChange(value === SENTINEL_NONE ? null : value)
                      }
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
                            <span className="text-muted-foreground">Sem conta vinculada</span>
                          )}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={SENTINEL_NONE}>
                          <span className="text-muted-foreground">Sem conta vinculada</span>
                        </SelectItem>
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
                {isEdit ? "Salvar alterações" : "Registrar aporte"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
