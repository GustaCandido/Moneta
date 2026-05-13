import type { Metadata } from "next"

import { InvestimentosView } from "@/components/investimentos/investimentos-view"
import { createClient } from "@/server/supabase/server"
import type {
  AccountWithBalance,
  InvestmentWithRelations,
} from "@/types/domain"

export const metadata: Metadata = {
  title: "Investimentos — Moneta",
}

export default async function InvestimentosPage() {
  const supabase = await createClient()

  const [accountsRes, investmentsRes] = await Promise.all([
    supabase.rpc("accounts_with_balance"),
    supabase
      .from("investments")
      .select("*, account:accounts(id, name, color)")
      .order("occurred_at", { ascending: false })
      .order("created_at", { ascending: false }),
  ])

  return (
    <InvestimentosView
      initialAccounts={(accountsRes.data ?? []) as AccountWithBalance[]}
      initialInvestments={
        (investmentsRes.data ?? []) as unknown as InvestmentWithRelations[]
      }
    />
  )
}
