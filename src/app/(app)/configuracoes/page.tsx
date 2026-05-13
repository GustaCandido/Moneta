import type { Metadata } from "next"

import { ConfiguracoesView } from "@/components/configuracoes/configuracoes-view"
import { createClient } from "@/server/supabase/server"
import type {
  AccountWithBalance,
  Category,
  RecurringWithRelations,
} from "@/types/domain"

export const metadata: Metadata = {
  title: "Configurações — Moneta",
}

export default async function ConfiguracoesPage() {
  const supabase = await createClient()

  const [accountsRes, categoriesRes, recurringRes] = await Promise.all([
    supabase.rpc("accounts_with_balance"),
    supabase.from("categories").select("*").order("kind").order("name"),
    supabase
      .from("recurring_transactions")
      .select(
        "*, account:accounts!inner(id, name, color), category:categories(id, name, color, icon, kind)"
      )
      .order("active", { ascending: false })
      .order("day_of_month")
      .order("created_at", { ascending: false }),
  ])

  return (
    <ConfiguracoesView
      initialAccounts={(accountsRes.data ?? []) as AccountWithBalance[]}
      initialCategories={(categoriesRes.data ?? []) as Category[]}
      initialRecurring={
        (recurringRes.data ?? []) as unknown as RecurringWithRelations[]
      }
    />
  )
}
