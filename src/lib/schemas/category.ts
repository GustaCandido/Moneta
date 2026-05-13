import { z } from "zod"

import { CATEGORY_KINDS } from "@/types/domain"

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Informe um nome")
    .max(30, "Nome muito longo"),
  kind: z.enum(CATEGORY_KINDS, { message: "Selecione um tipo" }),
  icon: z.string().trim().optional().nullable(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida"),
})

export type CategoryValues = z.infer<typeof categorySchema>
