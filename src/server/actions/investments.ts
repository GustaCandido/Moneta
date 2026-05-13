"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/server/supabase/server"
import {
  investmentSchema,
  type InvestmentValues,
} from "@/lib/schemas/investment"

export type InvestmentActionResult =
  | { ok: true }
  | { ok: false; error: string }

export async function createInvestmentAction(
  values: InvestmentValues
): Promise<InvestmentActionResult> {
  const parsed = investmentSchema.safeParse(values)
  if (!parsed.success) return { ok: false, error: "Dados inválidos" }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Sessão expirada. Faça login novamente." }

  const { error } = await supabase.from("investments").insert({
    user_id: user.id,
    kind: parsed.data.kind,
    amount: parsed.data.amount,
    occurred_at: parsed.data.occurred_at,
    description: parsed.data.description ?? null,
    account_id: parsed.data.account_id ?? null,
  })

  if (error) return { ok: false, error: error.message }

  revalidateInvestmentPaths()
  return { ok: true }
}

export async function updateInvestmentAction(
  id: string,
  values: InvestmentValues
): Promise<InvestmentActionResult> {
  const parsed = investmentSchema.safeParse(values)
  if (!parsed.success) return { ok: false, error: "Dados inválidos" }

  const supabase = await createClient()
  const { error } = await supabase
    .from("investments")
    .update({
      kind: parsed.data.kind,
      amount: parsed.data.amount,
      occurred_at: parsed.data.occurred_at,
      description: parsed.data.description ?? null,
      account_id: parsed.data.account_id ?? null,
    })
    .eq("id", id)

  if (error) return { ok: false, error: error.message }

  revalidateInvestmentPaths()
  return { ok: true }
}

export async function deleteInvestmentAction(
  id: string
): Promise<InvestmentActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.from("investments").delete().eq("id", id)

  if (error) return { ok: false, error: error.message }

  revalidateInvestmentPaths()
  return { ok: true }
}

function revalidateInvestmentPaths() {
  revalidatePath("/investimentos")
  revalidatePath("/dashboard")
}
