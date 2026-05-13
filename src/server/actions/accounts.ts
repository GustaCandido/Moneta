"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/server/supabase/server"
import { accountSchema, type AccountValues } from "@/lib/schemas/account"

export type AccountActionResult =
  | { ok: true }
  | { ok: false; error: string }

export async function createAccountAction(
  values: AccountValues
): Promise<AccountActionResult> {
  const parsed = accountSchema.safeParse(values)
  if (!parsed.success) {
    return { ok: false, error: "Dados inválidos" }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Sessão expirada. Faça login novamente." }

  const { error } = await supabase.from("accounts").insert({
    user_id: user.id,
    name: parsed.data.name,
    type: parsed.data.type,
    initial_balance: parsed.data.initial_balance,
    color: parsed.data.color,
  })

  if (error) {
    return { ok: false, error: error.message }
  }

  revalidatePath("/contas")
  revalidatePath("/dashboard")
  return { ok: true }
}

export async function updateAccountAction(
  id: string,
  values: AccountValues
): Promise<AccountActionResult> {
  const parsed = accountSchema.safeParse(values)
  if (!parsed.success) {
    return { ok: false, error: "Dados inválidos" }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("accounts")
    .update({
      name: parsed.data.name,
      type: parsed.data.type,
      initial_balance: parsed.data.initial_balance,
      color: parsed.data.color,
    })
    .eq("id", id)

  if (error) {
    return { ok: false, error: error.message }
  }

  revalidatePath("/contas")
  revalidatePath("/dashboard")
  return { ok: true }
}

export async function deleteAccountAction(
  id: string
): Promise<AccountActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.from("accounts").delete().eq("id", id)

  if (error) {
    return { ok: false, error: error.message }
  }

  revalidatePath("/contas")
  revalidatePath("/dashboard")
  return { ok: true }
}
