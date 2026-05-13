"use client"

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
import { useDeleteAccount } from "@/hooks/use-accounts"
import type { AccountWithBalance } from "@/types/domain"

export function DeleteAccountDialog({
  account,
  onOpenChange,
}: {
  account: AccountWithBalance | null
  onOpenChange: (open: boolean) => void
}) {
  const deleteMutation = useDeleteAccount()

  async function handleDelete() {
    if (!account) return
    const toastId = toast.loading("Excluindo…")
    const result = await deleteMutation.mutateAsync(account.id)
    if (!result.ok) {
      toast.error(result.error, { id: toastId })
      return
    }
    toast.success("Conta excluída.", { id: toastId, duration: 2500 })
    onOpenChange(false)
  }

  return (
    <Dialog open={!!account} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-xl tracking-tight">
            Excluir conta?
          </DialogTitle>
          <DialogDescription>
            Esta ação remove a conta <strong className="font-medium text-foreground">{account?.name}</strong> e todas as transações vinculadas. Não dá pra desfazer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            Excluir conta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
