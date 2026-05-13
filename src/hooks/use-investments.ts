"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { createClient } from "@/server/supabase/client"
import {
  createInvestmentAction,
  deleteInvestmentAction,
  updateInvestmentAction,
} from "@/server/actions/investments"
import type { InvestmentValues } from "@/lib/schemas/investment"
import type { InvestmentWithRelations } from "@/types/domain"

export const investmentsQueryKey = ["investments"] as const

export function useInvestments(initialData?: InvestmentWithRelations[]) {
  return useQuery<InvestmentWithRelations[]>({
    queryKey: investmentsQueryKey,
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("investments")
        .select("*, account:accounts(id, name, color)")
        .order("occurred_at", { ascending: false })
        .order("created_at", { ascending: false })

      if (error) throw error
      return (data ?? []) as unknown as InvestmentWithRelations[]
    },
    initialData,
  })
}

function invalidateInvestments(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: investmentsQueryKey })
}

export function useCreateInvestment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (values: InvestmentValues) => createInvestmentAction(values),
    onSuccess: (res) => {
      if (res.ok) invalidateInvestments(qc)
    },
  })
}

export function useUpdateInvestment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: InvestmentValues }) =>
      updateInvestmentAction(id, values),
    onSuccess: (res) => {
      if (res.ok) invalidateInvestments(qc)
    },
  })
}

export function useDeleteInvestment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteInvestmentAction(id),
    onSuccess: (res) => {
      if (res.ok) invalidateInvestments(qc)
    },
  })
}
