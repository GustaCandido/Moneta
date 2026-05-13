"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { ArrowRight, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { signUpAction } from "@/server/actions/auth"
import { signupSchema, type SignupValues } from "@/lib/schemas/auth"

export function SignupForm() {
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirm, setShowConfirm] = React.useState(false)
  const router = useRouter()

  const form = useForm<SignupValues>({
    resolver: standardSchemaResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(values: SignupValues) {
    const toastId = toast.loading("Criando sua conta…")
    const result = await signUpAction(values)
    if (!result.ok) {
      toast.error(result.error, { id: toastId })
      return
    }
    if (result.confirmEmail) {
      toast.success("Quase lá! Confirme seu e-mail para entrar.", {
        id: toastId,
        duration: 6000,
      })
      form.reset()
      return
    }
    toast.success("Conta criada! Bem-vindo à Moneta.", { id: toastId })
    router.replace("/dashboard")
    router.refresh()
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
      <span className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
        <span className="h-px w-6 bg-border" />
        Sua conta em 30 segundos
      </span>

      <h1 className="mt-3 font-display text-[44px] leading-[1.02] tracking-tight text-foreground sm:text-[52px]">
        <em className="italic text-primary">Cadastro</em>{" "}
        <span
          className="inline-block"
          style={{ animation: "wave 2.6s ease-in-out infinite", transformOrigin: "70% 70%" }}
        >
          👋
        </span>
      </h1>
      <p className="mt-3 text-[15px] text-muted-foreground">
        Crie sua conta Moneta e comece a controlar suas finanças.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-9 space-y-5">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem className="animate-in fade-in slide-in-from-bottom-1 duration-500 fill-mode-both" style={{ animationDelay: "100ms" }}>
                <FormLabel className="text-[13px] font-medium text-foreground/80">
                  Nome completo
                </FormLabel>
                <FormControl>
                  <Input
                    autoComplete="name"
                    placeholder="Como podemos te chamar?"
                    className="h-12 rounded-xl border-border/80 px-4 text-[15px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="animate-in fade-in slide-in-from-bottom-1 duration-500 fill-mode-both" style={{ animationDelay: "180ms" }}>
                <FormLabel className="text-[13px] font-medium text-foreground/80">
                  E-mail
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="seu@email.com"
                    className="h-12 rounded-xl border-border/80 px-4 text-[15px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="animate-in fade-in slide-in-from-bottom-1 duration-500 fill-mode-both" style={{ animationDelay: "260ms" }}>
                  <FormLabel className="text-[13px] font-medium text-foreground/80">
                    Senha
                  </FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Mín. 8 caracteres"
                        className="h-12 rounded-xl border-border/80 px-4 pr-11 text-[15px]"
                        {...field}
                      />
                    </FormControl>
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className="animate-in fade-in slide-in-from-bottom-1 duration-500 fill-mode-both" style={{ animationDelay: "300ms" }}>
                  <FormLabel className="text-[13px] font-medium text-foreground/80">
                    Confirmar senha
                  </FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={showConfirm ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Repita a senha"
                        className="h-12 rounded-xl border-border/80 px-4 pr-11 text-[15px]"
                        {...field}
                      />
                    </FormControl>
                    <button
                      type="button"
                      onClick={() => setShowConfirm((s) => !s)}
                      aria-label={showConfirm ? "Ocultar senha" : "Mostrar senha"}
                      className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="group mt-3 h-12 w-full rounded-full bg-primary text-[15px] font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_10px_30px_-12px_oklch(0.51_0.16_264/0.6)] active:translate-y-[1px] animate-in fade-in slide-in-from-bottom-1 duration-500 fill-mode-both"
            style={{ animationDelay: "380ms" }}
          >
            <span>Criar conta</span>
            <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>

          <p
            className="text-center text-[12px] leading-relaxed text-muted-foreground animate-in fade-in duration-500 fill-mode-both"
            style={{ animationDelay: "440ms" }}
          >
            Ao continuar, você concorda com nossos{" "}
            <Link href="#" className="text-foreground/80 underline-offset-2 hover:underline">
              termos
            </Link>{" "}
            e{" "}
            <Link href="#" className="text-foreground/80 underline-offset-2 hover:underline">
              política de privacidade
            </Link>
            .
          </p>
        </form>
      </Form>

      <p className="mt-8 text-center text-[13.5px] text-muted-foreground">
        Já tem conta?{" "}
        <Link
          href="/login"
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          Entrar
        </Link>
      </p>
    </div>
  )
}
