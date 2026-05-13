import type { Metadata } from "next"

import { ContasView } from "@/components/contas/contas-view"
import { createClient } from "@/server/supabase/server"
import type { AccountWithBalance } from "@/types/domain"

export const metadata: Metadata = {
  title: "Contas — Moneta",
}

export default async function ContasPage() {
  const supabase = await createClient()
  const { data } = await supabase.rpc("accounts_with_balance")
  return <ContasView initialAccounts={(data ?? []) as AccountWithBalance[]} />
}
