import { z } from "zod"

import { TRANSACTION_KINDS } from "@/types/domain"

export const recurringSchema = z
  .object({
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
    day_of_month: z
      .number({ message: "Informe o dia" })
      .int("Informe um dia inteiro")
      .min(1, "Dia mínimo é 1")
      .max(31, "Dia máximo é 31"),
    start_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inicial inválida"),
    end_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Data final inválida")
      .nullable()
      .optional(),
    account_id: z.string().uuid({ message: "Selecione uma conta" }),
    category_id: z.string().uuid().nullable().optional(),
    active: z.boolean(),
  })
  .refine(
    (values) => !values.end_date || values.end_date >= values.start_date,
    {
      message: "Data final deve ser igual ou posterior à inicial",
      path: ["end_date"],
    }
  )

export type RecurringValues = z.infer<typeof recurringSchema>
