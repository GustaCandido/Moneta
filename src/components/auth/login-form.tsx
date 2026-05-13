"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
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
import { signInAction } from "@/server/actions/auth"
import { loginSchema, type LoginValues } from "@/lib/schemas/auth"

export function LoginForm() {
  const [showPassword, setShowPassword] = React.useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirectTo") ?? "/dashboard"

  const form = useForm<LoginValues>({
    resolver: standardSchemaResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  })

  async function onSubmit(values: LoginValues) {
    const toastId = toast.loading("Entrando…")
    const result = await signInAction(values)
    if (!result.ok) {
      toast.error(result.error, { id: toastId })
      return
    }
    toast.success("Bem-vindo de volta!", { id: toastId })
    router.replace(redirectTo)
    router.refresh()
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
      <span className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
        <span className="h-px w-6 bg-border" />
        Boas-vindas de volta
      </span>

      <h1 className="mt-3 font-display text-[44px] leading-[1.02] tracking-tight text-foreground sm:text-[52px]">
        <span>Log</span>{" "}
        <em className="italic text-primary">In</em>{" "}
        <span
          className="inline-block"
          style={{ animation: "wave 2.6s ease-in-out infinite", transformOrigin: "70% 70%" }}
        >
          👋
        </span>
      </h1>
      <p className="mt-3 text-[15px] text-muted-foreground">
        Acesse sua conta Moneta para acompanhar suas finanças.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-10 space-y-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="animate-in fade-in slide-in-from-bottom-1 duration-500 fill-mode-both" style={{ animationDelay: "100ms" }}>
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

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="animate-in fade-in slide-in-from-bottom-1 duration-500 fill-mode-both" style={{ animationDelay: "180ms" }}>
                <FormLabel className="text-[13px] font-medium text-foreground/80">
                  Senha
                </FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="h-12 rounded-xl border-border/80 px-4 pr-12 text-[15px]"
                      {...field}
                    />
                  </FormControl>
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    className="absolute right-2.5 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div
            className="flex items-center justify-between pt-1 animate-in fade-in slide-in-from-bottom-1 duration-500 fill-mode-both"
            style={{ animationDelay: "260ms" }}
          >
            <label className="inline-flex cursor-pointer select-none items-center gap-2 text-[13px] text-foreground/80">
              <input
                type="checkbox"
                {...form.register("rememberMe")}
                className="h-4 w-4 rounded border-border accent-primary"
              />
              Lembrar de mim
            </label>
            <Link
              href="/recuperar"
              className="text-[13px] font-medium text-primary underline-offset-4 hover:underline"
            >
              Esqueci minha senha
            </Link>
          </div>

          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="group mt-2 h-12 w-full rounded-full bg-primary text-[15px] font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_10px_30px_-12px_oklch(0.51_0.16_264/0.6)] active:translate-y-[1px] animate-in fade-in slide-in-from-bottom-1 duration-500 fill-mode-both"
            style={{ animationDelay: "340ms" }}
          >
            <span>Entrar</span>
            <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </form>
      </Form>

      <p className="mt-10 text-center text-[13.5px] text-muted-foreground">
        Ainda não tem conta?{" "}
        <Link
          href="/cadastro"
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          Cadastre-se
        </Link>
      </p>
    </div>
  )
}
