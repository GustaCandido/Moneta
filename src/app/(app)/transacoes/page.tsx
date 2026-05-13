import type { Metadata } from "next"

import { TransacoesView } from "@/components/transacoes/transacoes-view"
import { createClient } from "@/server/supabase/server"
import { periodToISORange, getCurrentPeriodKey } from "@/lib/period"
import type {
  AccountWithBalance,
  Category,
  TransactionWithRelations,
} from "@/types/domain"

export const metadata: Metadata = {
  title: "Transações — Moneta",
}

export default async function TransacoesPage() {
  const supabase = await createClient()
  const { startISO, endISO } = periodToISORange(getCurrentPeriodKey())

  await supabase.rpc("materialize_recurring_for_month", { p_month: startISO })

  const [accountsRes, categoriesRes, transactionsRes] = await Promise.all([
    supabase.rpc("accounts_with_balance"),
    supabase.from("categories").select("*").order("kind").order("name"),
    supabase
      .from("transactions")
      .select(
        "*, account:accounts!inner(id, name, color), category:categories(id, name, color, icon, kind)"
      )
      .gte("occurred_at", startISO)
      .lte("occurred_at", endISO)
      .order("occurred_at", { ascending: false })
      .order("created_at", { ascending: false }),
  ])

  return (
    <TransacoesView
      initialAccounts={(accountsRes.data ?? []) as AccountWithBalance[]}
      initialCategories={(categoriesRes.data ?? []) as Category[]}
      initialTransactions={
        (transactionsRes.data ?? []) as unknown as TransactionWithRelations[]
      }
    />
  )
}
