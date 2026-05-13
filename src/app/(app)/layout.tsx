import { redirect } from "next/navigation"

import { AppShell } from "@/components/layout/app-shell"
import { createClient } from "@/server/supabase/server"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single()

  const email = user.email ?? ""
  const fullName =
    profile?.full_name?.trim() || email.split("@")[0] || "Usuário"

  return (
    <AppShell user={{ id: user.id, email, fullName }}>{children}</AppShell>
  )
}
