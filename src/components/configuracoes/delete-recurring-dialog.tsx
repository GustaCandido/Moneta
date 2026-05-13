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
import { useDeleteRecurring } from "@/hooks/use-recurring"
import { formatBRL } from "@/lib/formatters"
import type { RecurringWithRelations } from "@/types/domain"

export function DeleteRecurringDialog({
  recurring,
  onOpenChange,
}: {
  recurring: RecurringWithRelations | null
  onOpenChange: (open: boolean) => void
}) {
  const deleteMutation = useDeleteRecurring()

  async function handleDelete() {
    if (!recurring) return
    const toastId = toast.loading("Excluindo...")
    const result = await deleteMutation.mutateAsync(recurring.id)

    if (!result.ok) {
      toast.error(result.error, { id: toastId })
      return
    }

    toast.success("Recorrência excluída.", { id: toastId, duration: 2500 })
    onOpenChange(false)
  }

  return (
    <Dialog open={!!recurring} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-xl tracking-tight">
            Excluir recorrência?
          </DialogTitle>
          <DialogDescription>
            {recurring && (
              <>
                <strong className="font-medium text-foreground">
                  {recurring.description || "Recorrência sem descrição"}
                </strong>{" "}
                de{" "}
                <strong className="font-medium text-foreground">
                  {formatBRL(recurring.amount)}
                </strong>{" "}
                no dia {recurring.day_of_month}. Transações já materializadas
                não serão removidas automaticamente.
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
