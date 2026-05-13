"use client"

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import { createClient } from "@/server/supabase/client"
import {
  createTransactionAction,
  deleteTransactionAction,
  updateTransactionAction,
} from "@/server/actions/transactions"
import type { TransactionValues } from "@/lib/schemas/transaction"
import type {
  TransactionKind,
  TransactionWithRelations,
} from "@/types/domain"

export type TransactionFilters = {
  dateFrom: string
  dateTo: string
  accountId?: string | null
  categoryId?: string | null
  kind?: TransactionKind | null
  search?: string | null
}

export const transactionsQueryKey = (filters: TransactionFilters) =>
  ["transactions", filters] as const

export function useTransactions(
  filters: TransactionFilters,
  initialData?: TransactionWithRelations[]
) {
  return useQuery<TransactionWithRelations[]>({
    queryKey: transactionsQueryKey(filters),
    queryFn: async () => {
      const supabase = createClient()
      const startISO = filters.dateFrom
      const endISO = filters.dateTo

      const { error: recurringError } = await supabase.rpc(
        "materialize_recurring_for_month",
        { p_month: startISO }
      )
      if (recurringError) throw recurringError

      let query = supabase
        .from("transactions")
        .select(
          "*, account:accounts!inner(id, name, color), category:categories(id, name, color, icon, kind)"
        )
        .gte("occurred_at", startISO)
        .lte("occurred_at", endISO)
        .order("occurred_at", { ascending: false })
        .order("created_at", { ascending: false })

      if (filters.accountId) query = query.eq("account_id", filters.accountId)
      if (filters.categoryId) query = query.eq("category_id", filters.categoryId)
      if (filters.kind) query = query.eq("kind", filters.kind)
      if (filters.search?.trim()) {
        query = query.ilike("description", `%${filters.search.trim()}%`)
      }

      const { data, error } = await query
      if (error) throw error
      return (data ?? []) as unknown as TransactionWithRelations[]
    },
    initialData,
    placeholderData: keepPreviousData,
  })
}

export function invalidateAllTransactions(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["transactions"] })
  qc.invalidateQueries({ queryKey: ["accounts"] })
}

export function useCreateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (values: TransactionValues) => createTransactionAction(values),
    onSuccess: (res) => {
      if (res.ok) invalidateAllTransactions(qc)
    },
  })
}

export function useUpdateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string
      values: TransactionValues
    }) => updateTransactionAction(id, values),
    onSuccess: (res) => {
      if (res.ok) invalidateAllTransactions(qc)
    },
  })
}

export function useDeleteTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteTransactionAction(id),
    onSuccess: (res) => {
      if (res.ok) invalidateAllTransactions(qc)
    },
  })
}
