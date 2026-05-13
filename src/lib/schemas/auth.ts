import { z } from "zod"

const emailField = z
  .string()
  .trim()
  .min(1, "Informe seu e-mail")
  .pipe(z.email({ message: "E-mail inválido" }))

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Informe sua senha"),
  rememberMe: z.boolean().optional(),
})

export type LoginValues = z.infer<typeof loginSchema>

export const signupSchema = z
  .object({
    fullName: z.string().trim().min(2, "Nome muito curto"),
    email: emailField,
    password: z.string().min(8, "A senha deve ter ao menos 8 caracteres"),
    confirmPassword: z.string().min(1, "Confirme sua senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  })

export type SignupValues = z.infer<typeof signupSchema>
