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
import { useDeleteTransaction } from "@/hooks/use-transactions"
import { formatBRL, formatDate } from "@/lib/formatters"
import type { TransactionWithRelations } from "@/types/domain"

export function DeleteTransactionDialog({
  transaction,
  onOpenChange,
}: {
  transaction: TransactionWithRelations | null
  onOpenChange: (open: boolean) => void
}) {
  const deleteMutation = useDeleteTransaction()

  async function handleDelete() {
    if (!transaction) return
    const toastId = toast.loading("Excluindo…")
    const result = await deleteMutation.mutateAsync(transaction.id)
    if (!result.ok) {
      toast.error(result.error, { id: toastId })
      return
    }
    toast.success("Transação excluída.", { id: toastId, duration: 2500 })
    onOpenChange(false)
  }

  return (
    <Dialog open={!!transaction} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-xl tracking-tight">
            Excluir transação?
          </DialogTitle>
          <DialogDescription>
            {transaction && (
              <>
                <strong className="font-medium text-foreground">
                  {transaction.description || "Sem descrição"}
                </strong>{" "}
                no valor de{" "}
                <strong className="font-medium text-foreground">
                  {formatBRL(transaction.amount)}
                </strong>{" "}
                em {formatDate(transaction.occurred_at, "dd 'de' MMMM")}.
                Esta ação não pode ser desfeita.
              </>
            )}
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
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
