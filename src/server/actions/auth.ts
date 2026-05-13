"use server"

import { createClient } from "@/server/supabase/server"
import {
  loginSchema,
  signupSchema,
  type LoginValues,
  type SignupValues,
} from "@/lib/schemas/auth"

export type AuthResult =
  | { ok: true; confirmEmail?: boolean }
  | { ok: false; error: string }

export async function signInAction(values: LoginValues): Promise<AuthResult> {
  const parsed = loginSchema.safeParse(values)
  if (!parsed.success) {
    return { ok: false, error: "Dados inválidos" }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    return { ok: false, error: translateAuthError(error.message) }
  }

  return { ok: true }
}

export async function signUpAction(values: SignupValues): Promise<AuthResult> {
  const parsed = signupSchema.safeParse(values)
  if (!parsed.success) {
    return { ok: false, error: "Dados inválidos" }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/api/auth/callback`,
    },
  })

  if (error) {
    return { ok: false, error: translateAuthError(error.message) }
  }

  // Sem sessão = email confirmation está habilitado no Supabase
  if (!data.session) {
    return { ok: true, confirmEmail: true }
  }

  return { ok: true }
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
}

function translateAuthError(message: string): string {
  const m = message.toLowerCase()
  if (m.includes("invalid login credentials")) return "E-mail ou senha incorretos"
  if (m.includes("email not confirmed")) return "Confirme seu e-mail antes de entrar"
  if (m.includes("user already registered")) return "Já existe uma conta com este e-mail"
  if (m.includes("password should be")) return "A senha não atende aos requisitos mínimos"
  if (m.includes("rate limit")) return "Muitas tentativas. Aguarde alguns minutos."
  return "Algo deu errado. Tente novamente em instantes."
}
