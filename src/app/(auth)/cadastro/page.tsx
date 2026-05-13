import type { Metadata } from "next"

import { SignupForm } from "@/components/auth/signup-form"

export const metadata: Metadata = {
  title: "Criar conta — Moneta",
}

export default function CadastroPage() {
  return <SignupForm />
}
