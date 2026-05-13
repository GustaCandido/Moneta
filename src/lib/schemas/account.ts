import { z } from "zod"

import { ACCOUNT_TYPES } from "@/types/domain"

export const accountSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Informe um nome")
    .max(40, "Nome muito longo"),
  type: z.enum(ACCOUNT_TYPES, { message: "Selecione um tipo" }),
  initial_balance: z
    .number({ message: "Informe um valor numérico" })
    .min(0, "Saldo inicial não pode ser negativo"),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida"),
})

export type AccountValues = z.infer<typeof accountSchema>
