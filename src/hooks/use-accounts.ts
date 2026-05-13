"use client"

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import { createClient } from "@/server/supabase/client"
import {
  createAccountAction,
  deleteAccountAction,
  updateAccountAction,
} from "@/server/actions/accounts"
import type { AccountValues } from "@/lib/schemas/account"
import type { AccountWithBalance } from "@/types/domain"

export const accountsQueryKey = ["accounts"] as const

export function useAccounts(initialData?: AccountWithBalance[]) {
  return useQuery<AccountWithBalance[]>({
    queryKey: accountsQueryKey,
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase.rpc("accounts_with_balance")
      if (error) throw error
      return (data ?? []) as AccountWithBalance[]
    },
    initialData,
  })
}

export function useCreateAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (values: AccountValues) => createAccountAction(values),
    onSuccess: (res) => {
      if (res.ok) qc.invalidateQueries({ queryKey: accountsQueryKey })
    },
  })
}

export function useUpdateAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: AccountValues }) =>
      updateAccountAction(id, values),
    onSuccess: (res) => {
      if (res.ok) qc.invalidateQueries({ queryKey: accountsQueryKey })
    },
  })
}

export function useDeleteAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteAccountAction(id),
    onSuccess: (res) => {
      if (res.ok) qc.invalidateQueries({ queryKey: accountsQueryKey })
    },
  })
}
