"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/server/supabase/server"
import { categorySchema, type CategoryValues } from "@/lib/schemas/category"

export type CategoryActionResult =
  | { ok: true }
  | { ok: false; error: string }

export async function createCategoryAction(
  values: CategoryValues
): Promise<CategoryActionResult> {
  const parsed = categorySchema.safeParse(values)
  if (!parsed.success) {
    return { ok: false, error: "Dados inválidos" }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Sessão expirada. Faça login novamente." }

  const { error } = await supabase.from("categories").insert({
    user_id: user.id,
    name: parsed.data.name,
    kind: parsed.data.kind,
    icon: parsed.data.icon ?? null,
    color: parsed.data.color,
  })

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "Já existe uma categoria com esse nome." }
    }
    return { ok: false, error: error.message }
  }

  revalidatePath("/configuracoes")
  revalidatePath("/transacoes")
  return { ok: true }
}

export async function updateCategoryAction(
  id: string,
  values: CategoryValues
): Promise<CategoryActionResult> {
  const parsed = categorySchema.safeParse(values)
  if (!parsed.success) {
    return { ok: false, error: "Dados inválidos" }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("categories")
    .update({
      name: parsed.data.name,
      kind: parsed.data.kind,
      icon: parsed.data.icon ?? null,
      color: parsed.data.color,
    })
    .eq("id", id)

  if (error) {
    return { ok: false, error: error.message }
  }

  revalidatePath("/configuracoes")
  revalidatePath("/transacoes")
  return { ok: true }
}

export async function deleteCategoryAction(
  id: string
): Promise<CategoryActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.from("categories").delete().eq("id", id)

  if (error) {
    return { ok: false, error: error.message }
  }

  revalidatePath("/configuracoes")
  revalidatePath("/transacoes")
  return { ok: true }
}
