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
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { accountSchema, type AccountValues } from "@/lib/schemas/account"
import {
  ACCOUNT_PALETTE,
  ACCOUNT_TYPES,
  ACCOUNT_TYPE_LABELS,
  type AccountType,
  type AccountWithBalance,
} from "@/types/domain"
import { useCreateAccount, useUpdateAccount } from "@/hooks/use-accounts"

const TYPE_OPTIONS: { value: AccountType; label: string }[] = ACCOUNT_TYPES.map(
  (v) => ({ value: v, label: ACCOUNT_TYPE_LABELS[v] })
)

const EMPTY_VALUES: AccountValues = {
  name: "",
  type: "carteira",
  initial_balance: 0,
  color: ACCOUNT_PALETTE[0],
}

export function AccountFormDialog({
  open,
  onOpenChange,
  account,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  account?: AccountWithBalance | null
}) {
  const isEdit = !!account
  const createMutation = useCreateAccount()
  const updateMutation = useUpdateAccount()

  const form = useForm<AccountValues>({
    resolver: standardSchemaResolver(accountSchema),
    defaultValues: EMPTY_VALUES,
  })

  React.useEffect(() => {
    if (open) {
      if (account) {
        form.reset({
          name: account.name,
          type: account.type as AccountType,
          initial_balance: account.initial_balance,
          color: account.color,
        })
      } else {
        form.reset(EMPTY_VALUES)
      }
    }
  }, [open, account, form])

  async function onSubmit(values: AccountValues) {
    const toastId = toast.loading(isEdit ? "Salvando…" : "Criando conta…")
    const result =
      isEdit && account
        ? await updateMutation.mutateAsync({ id: account.id, values })
        : await createMutation.mutateAsync(values)

    if (!result.ok) {
      toast.error(result.error, { id: toastId })
      return
    }
    toast.success(isEdit ? "Conta atualizada." : "Conta criada.", {
      id: toastId,
      duration: 2500,
    })
    onOpenChange(false)
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="font-display text-xl tracking-tight">
            {isEdit ? "Editar conta" : "Nova conta"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Atualize os dados desta conta."
              : "Cadastre uma carteira, banco, cartão ou outro recipiente."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pt-1"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[13px]">Nome</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nubank, Carteira, Itaú…"
                      className="h-11"
                      autoFocus
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[13px]">Tipo</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11 w-full">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TYPE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="initial_balance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[13px]">
                      Saldo inicial (R$)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0,00"
                        className="h-11 tabular-nums"
                        value={
                          field.value === 0 && !form.formState.dirtyFields.initial_balance
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
            </div>

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[13px]">Cor</FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap gap-2">
                      {ACCOUNT_PALETTE.map((color) => {
                        const active = field.value.toLowerCase() === color.toLowerCase()
                        return (
                          <button
                            key={color}
                            type="button"
                            onClick={() => field.onChange(color)}
                            aria-label={`Cor ${color}`}
                            aria-pressed={active}
                            className={cn(
                              "h-9 w-9 rounded-full transition-all",
                              "ring-offset-2 ring-offset-popover",
                              active
                                ? "scale-110 ring-2 ring-foreground"
                                : "ring-0 hover:scale-110"
                            )}
                            style={{ backgroundColor: color }}
                          />
                        )
                      })}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
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
                {isEdit ? "Salvar alterações" : "Criar conta"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
