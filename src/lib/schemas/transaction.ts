import { z } from "zod"

import { TRANSACTION_KINDS } from "@/types/domain"

export const transactionSchema = z.object({
  kind: z.enum(TRANSACTION_KINDS, { message: "Selecione entrada ou saída" }),
  amount: z
    .number({ message: "Informe um valor" })
    .positive("O valor deve ser maior que zero"),
  description: z
    .string()
    .trim()
    .max(120, "Descrição muito longa")
    .optional()
    .nullable(),
  occurred_at: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  account_id: z.string().uuid({ message: "Selecione uma conta" }),
  category_id: z.string().uuid().nullable().optional(),
})

export type TransactionValues = z.infer<typeof transactionSchema>
