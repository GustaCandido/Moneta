import { z } from "zod"

import { INVESTMENT_KINDS } from "@/types/domain"

export const investmentSchema = z.object({
  kind: z.enum(INVESTMENT_KINDS, { message: "Selecione um tipo" }),
  amount: z
    .number({ message: "Informe um valor" })
    .positive("O valor deve ser maior que zero"),
  occurred_at: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  description: z
    .string()
    .trim()
    .max(120, "Descrição muito longa")
    .optional()
    .nullable(),
  account_id: z.string().uuid().nullable().optional(),
})

export type InvestmentValues = z.infer<typeof investmentSchema>
