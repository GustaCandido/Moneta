import type { Tables } from "@/types/database"

export type Account = Tables<"accounts">
export type Category = Tables<"categories">
export type Transaction = Tables<"transactions">
export type RecurringTransaction = Tables<"recurring_transactions">
export type Investment = Tables<"investments">
export type Profile = Tables<"profiles">

export type AccountWithBalance = Account & { balance: number }

export type TransactionAccountRef = Pick<Account, "id" | "name" | "color">
export type TransactionCategoryRef = Pick<
  Category,
  "id" | "name" | "color" | "icon" | "kind"
>

export type TransactionWithRelations = Transaction & {
  account: TransactionAccountRef
  category: TransactionCategoryRef | null
}

export type RecurringWithRelations = RecurringTransaction & {
  account: TransactionAccountRef
  category: TransactionCategoryRef | null
}

export type InvestmentWithRelations = Investment & {
  account: TransactionAccountRef | null
}

export const ACCOUNT_TYPES = [
  "carteira",
  "banco",
  "cartao",
  "poupanca",
  "outros",
] as const
export type AccountType = (typeof ACCOUNT_TYPES)[number]

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  carteira: "Carteira",
  banco: "Conta corrente",
  cartao: "Cartão de crédito",
  poupanca: "Poupança",
  outros: "Outros",
}

export const CATEGORY_KINDS = ["entrada", "saida"] as const
export type CategoryKind = (typeof CATEGORY_KINDS)[number]

export const CATEGORY_KIND_LABELS: Record<CategoryKind, string> = {
  entrada: "Entrada",
  saida: "Saída",
}

export const TRANSACTION_KINDS = CATEGORY_KINDS
export type TransactionKind = CategoryKind

export const INVESTMENT_KINDS = ["renda_fixa", "renda_variavel", "livre"] as const
export type InvestmentKind = (typeof INVESTMENT_KINDS)[number]

export const INVESTMENT_KIND_LABELS: Record<InvestmentKind, string> = {
  renda_fixa: "Renda fixa",
  renda_variavel: "Renda variável",
  livre: "Reserva / livre",
}

export const ACCOUNT_PALETTE = [
  "#4165B7",
  "#16a34a",
  "#f97316",
  "#a855f7",
  "#ec4899",
  "#0ea5e9",
  "#eab308",
  "#64748b",
] as const
