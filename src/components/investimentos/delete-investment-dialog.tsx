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
import { useDeleteInvestment } from "@/hooks/use-investments"
import { formatBRL, formatDate } from "@/lib/formatters"
import type { InvestmentWithRelations } from "@/types/domain"

export function DeleteInvestmentDialog({
  investment,
  onOpenChange,
}: {
  investment: InvestmentWithRelations | null
  onOpenChange: (open: boolean) => void
}) {
  const deleteMutation = useDeleteInvestment()

  async function handleDelete() {
    if (!investment) return
    const toastId = toast.loading("Excluindo...")
    const result = await deleteMutation.mutateAsync(investment.id)

    if (!result.ok) {
      toast.error(result.error, { id: toastId })
      return
    }

    toast.success("Aporte excluído.", { id: toastId, duration: 2500 })
    onOpenChange(false)
  }

  return (
    <Dialog open={!!investment} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-xl tracking-tight">
            Excluir aporte?
          </DialogTitle>
          <DialogDescription>
            {investment && (
              <>
                <strong className="font-medium text-foreground">
                  {investment.description || "Aporte sem descrição"}
                </strong>{" "}
                de{" "}
                <strong className="font-medium text-foreground">
                  {formatBRL(investment.amount)}
                </strong>{" "}
                em {formatDate(investment.occurred_at, "dd 'de' MMMM")}.
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
