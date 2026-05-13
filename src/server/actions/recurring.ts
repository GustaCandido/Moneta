"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/server/supabase/server"
import { recurringSchema, type RecurringValues } from "@/lib/schemas/recurring"

export type RecurringActionResult =
  | { ok: true }
  | { ok: false; error: string }

export async function createRecurringAction(
  values: RecurringValues
): Promise<RecurringActionResult> {
  const parsed = recurringSchema.safeParse(values)
  if (!parsed.success) return { ok: false, error: "Dados inválidos" }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Sessão expirada. Faça login novamente." }

  const { error } = await supabase.from("recurring_transactions").insert({
    user_id: user.id,
    kind: parsed.data.kind,
    amount: parsed.data.amount,
    description: parsed.data.description ?? null,
    day_of_month: parsed.data.day_of_month,
    start_date: parsed.data.start_date,
    end_date: parsed.data.end_date || null,
    account_id: parsed.data.account_id,
    category_id: parsed.data.category_id ?? null,
    active: parsed.data.active,
  })

  if (error) return { ok: false, error: error.message }

  revalidateRecurringPaths()
  return { ok: true }
}

export async function updateRecurringAction(
  id: string,
  values: RecurringValues
): Promise<RecurringActionResult> {
  const parsed = recurringSchema.safeParse(values)
  if (!parsed.success) return { ok: false, error: "Dados inválidos" }

  const supabase = await createClient()
  const { error } = await supabase
    .from("recurring_transactions")
    .update({
      kind: parsed.data.kind,
      amount: parsed.data.amount,
      description: parsed.data.description ?? null,
      day_of_month: parsed.data.day_of_month,
      start_date: parsed.data.start_date,
      end_date: parsed.data.end_date || null,
      account_id: parsed.data.account_id,
      category_id: parsed.data.category_id ?? null,
      active: parsed.data.active,
    })
    .eq("id", id)

  if (error) return { ok: false, error: error.message }

  revalidateRecurringPaths()
  return { ok: true }
}

export async function setRecurringActiveAction(
  id: string,
  active: boolean
): Promise<RecurringActionResult> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("recurring_transactions")
    .update({ active })
    .eq("id", id)

  if (error) return { ok: false, error: error.message }

  revalidateRecurringPaths()
  return { ok: true }
}

export async function deleteRecurringAction(
  id: string
): Promise<RecurringActionResult> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("recurring_transactions")
    .delete()
    .eq("id", id)

  if (error) return { ok: false, error: error.message }

  revalidateRecurringPaths()
  return { ok: true }
}

function revalidateRecurringPaths() {
  revalidatePath("/configuracoes")
  revalidatePath("/transacoes")
  revalidatePath("/dashboard")
}
