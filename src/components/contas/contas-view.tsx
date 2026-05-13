"use client"

import * as React from "react"
import { Plus, Wallet } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/layout/page-elements"
import { useAccounts } from "@/hooks/use-accounts"
import type { AccountWithBalance } from "@/types/domain"

import { AccountCard } from "./account-card"
import { AccountFormDialog } from "./account-form-dialog"
import { DeleteAccountDialog } from "./delete-account-dialog"

export function ContasView({
  initialAccounts,
}: {
  initialAccounts: AccountWithBalance[]
}) {
  const { data: accounts = [] } = useAccounts(initialAccounts)
  const [createOpen, setCreateOpen] = React.useState(false)
  const [editingAccount, setEditingAccount] =
    React.useState<AccountWithBalance | null>(null)
  const [deletingAccount, setDeletingAccount] =
    React.useState<AccountWithBalance | null>(null)

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Carteiras & bancos"
        title="Contas"
        description="Organize seu dinheiro entre carteiras, bancos e cartões."
      >
        {accounts.length > 0 && (
          <Button
            onClick={() => setCreateOpen(true)}
            className="h-10 rounded-full px-5"
          >
            <Plus className="h-4 w-4" />
            Nova conta
          </Button>
        )}
      </PageHeader>

      {accounts.length === 0 ? (
        <EmptyAccountsState onCreate={() => setCreateOpen(true)} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onEdit={() => setEditingAccount(account)}
              onDelete={() => setDeletingAccount(account)}
            />
          ))}
        </div>
      )}

      <AccountFormDialog open={createOpen} onOpenChange={setCreateOpen} />

      <AccountFormDialog
        open={!!editingAccount}
        onOpenChange={(open) => !open && setEditingAccount(null)}
        account={editingAccount}
      />

      <DeleteAccountDialog
        account={deletingAccount}
        onOpenChange={(open) => !open && setDeletingAccount(null)}
      />
    </div>
  )
}

function EmptyAccountsState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-dashed border-border/80 bg-card/40 p-12 text-center sm:p-16">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,oklch(0.51_0.16_264/0.08),transparent_60%)]" />
      <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
        <Wallet className="h-6 w-6" strokeWidth={1.8} />
      </div>
      <p className="font-display text-2xl text-foreground">
        Você ainda não tem <em className="italic text-primary">contas</em>.
      </p>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        Crie sua primeira conta para começar a registrar entradas e saídas.
        Pode ser sua carteira física, conta do banco, cartão de crédito…
      </p>
      <Button
        onClick={onCreate}
        className="mt-7 h-11 rounded-full px-6"
      >
        <Plus className="h-4 w-4" />
        Criar minha primeira conta
      </Button>
    </div>
  )
}
