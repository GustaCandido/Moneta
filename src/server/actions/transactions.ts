"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/server/supabase/server"
import {
  transactionSchema,
  type TransactionValues,
} from "@/lib/schemas/transaction"

export type TransactionActionResult =
  | { ok: true }
  | { ok: false; error: string }

export async function createTransactionAction(
  values: TransactionValues
): Promise<TransactionActionResult> {
  const parsed = transactionSchema.safeParse(values)
  if (!parsed.success) return { ok: false, error: "Dados inválidos" }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Sessão expirada. Faça login novamente." }

  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
    kind: parsed.data.kind,
    amount: parsed.data.amount,
    description: parsed.data.description ?? null,
    occurred_at: parsed.data.occurred_at,
    account_id: parsed.data.account_id,
    category_id: parsed.data.category_id ?? null,
  })

  if (error) return { ok: false, error: error.message }

  revalidatePath("/transacoes")
  revalidatePath("/contas")
  revalidatePath("/dashboard")
  return { ok: true }
}

export async function updateTransactionAction(
  id: string,
  values: TransactionValues
): Promise<TransactionActionResult> {
  const parsed = transactionSchema.safeParse(values)
  if (!parsed.success) return { ok: false, error: "Dados inválidos" }

  const supabase = await createClient()
  const { error } = await supabase
    .from("transactions")
    .update({
      kind: parsed.data.kind,
      amount: parsed.data.amount,
      description: parsed.data.description ?? null,
      occurred_at: parsed.data.occurred_at,
      account_id: parsed.data.account_id,
      category_id: parsed.data.category_id ?? null,
    })
    .eq("id", id)

  if (error) return { ok: false, error: error.message }

  revalidatePath("/transacoes")
  revalidatePath("/contas")
  revalidatePath("/dashboard")
  return { ok: true }
}

export async function deleteTransactionAction(
  id: string
): Promise<TransactionActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.from("transactions").delete().eq("id", id)

  if (error) return { ok: false, error: error.message }

  revalidatePath("/transacoes")
  revalidatePath("/contas")
  revalidatePath("/dashboard")
  return { ok: true }
}
