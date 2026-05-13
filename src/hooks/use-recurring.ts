"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { createClient } from "@/server/supabase/client"
import {
  createRecurringAction,
  deleteRecurringAction,
  setRecurringActiveAction,
  updateRecurringAction,
} from "@/server/actions/recurring"
import type { RecurringValues } from "@/lib/schemas/recurring"
import type { RecurringWithRelations } from "@/types/domain"

export const recurringQueryKey = ["recurring"] as const

export function useRecurring(initialData?: RecurringWithRelations[]) {
  return useQuery<RecurringWithRelations[]>({
    queryKey: recurringQueryKey,
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("recurring_transactions")
        .select(
          "*, account:accounts!inner(id, name, color), category:categories(id, name, color, icon, kind)"
        )
        .order("active", { ascending: false })
        .order("day_of_month")
        .order("created_at", { ascending: false })

      if (error) throw error
      return (data ?? []) as unknown as RecurringWithRelations[]
    },
    initialData,
  })
}

function invalidateRecurring(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: recurringQueryKey })
  qc.invalidateQueries({ queryKey: ["transactions"] })
}

export function useCreateRecurring() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (values: RecurringValues) => createRecurringAction(values),
    onSuccess: (res) => {
      if (res.ok) invalidateRecurring(qc)
    },
  })
}

export function useUpdateRecurring() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: RecurringValues }) =>
      updateRecurringAction(id, values),
    onSuccess: (res) => {
      if (res.ok) invalidateRecurring(qc)
    },
  })
}

export function useSetRecurringActive() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      setRecurringActiveAction(id, active),
    onSuccess: (res) => {
      if (res.ok) invalidateRecurring(qc)
    },
  })
}

export function useDeleteRecurring() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteRecurringAction(id),
    onSuccess: (res) => {
      if (res.ok) invalidateRecurring(qc)
    },
  })
}
