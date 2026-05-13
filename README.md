# Moneta

Micro SaaS pessoal de controle financeiro. Registre entradas e saídas, organize por contas e categorias, acompanhe investimentos e visualize sua saúde financeira em um dashboard unificado.

---

## Funcionalidades

- **Autenticação** — cadastro e login com email/senha via Supabase Auth
- **Dashboard** — stat cards de entradas, saídas, saldo e % de economia vs. mês anterior; gráfico de barras dos últimos 6 meses; donut de gastos por categoria; resumo de investimentos
- **Transações** — lançamento de entradas e saídas com filtro por intervalo de datas, conta, categoria, tipo e busca por descrição; paginação; edição e exclusão
- **Transações recorrentes** — templates mensais (ex.: salário, aluguel, Netflix) materializados automaticamente ao abrir o mês
- **Contas** — múltiplas carteiras/bancos com saldo calculado em tempo real
- **Categorias** — categorias globais predefinidas + criação de categorias personalizadas por tipo (entrada/saída)
- **Investimentos** — registro manual de aportes (renda fixa, renda variável, livre) com total acumulado
- **Dark mode** — alternância de tema persistida
- **Responsivo** — sidebar fixa no desktop, drawer no mobile

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router + Server Actions) |
| Linguagem | TypeScript 5.9 |
| Estilização | Tailwind CSS v4 |
| Componentes | shadcn/ui (base-nova — Base UI) |
| Gráficos | Recharts via shadcn/charts |
| Estado servidor | TanStack Query v5 |
| Formulários | React Hook Form + Zod 4 |
| Backend/DB | Supabase (Auth + Postgres + RLS) |
| Ícones | Lucide React |
| Datas | date-fns (locale pt-BR) |
| Fontes | Inter (corpo) + Geist Mono (títulos) |
| Toasts | Sonner |
| Tema | next-themes |

---

## Estrutura de pastas

```
src/
├── app/
│   ├── (auth)/          # login, cadastro
│   └── (app)/           # dashboard, transações, contas, investimentos, configurações
├── components/
│   ├── ui/              # componentes shadcn
│   ├── layout/          # sidebar, topbar, user-menu, app-shell
│   ├── dashboard/       # stat cards, gráficos, savings-rate-card
│   ├── transacoes/      # form dialog, tabela, filtros, delete dialog
│   ├── contas/          # form dialog, cards de conta
│   ├── investimentos/   # form dialog, lista de aportes
│   └── configuracoes/   # categorias, recorrências
├── server/
│   ├── supabase/        # clients (server, browser, middleware)
│   └── actions/         # Server Actions (auth, transactions, accounts, categories, recurring, investments)
├── hooks/               # TanStack Query hooks
├── lib/
│   ├── schemas/         # schemas Zod compartilhados
│   ├── formatters.ts    # formatBRL, formatDate, formatPercent
│   └── period.ts        # helpers de período/data
└── types/
    ├── domain.ts        # tipos de domínio
    └── database.ts      # tipos gerados pelo Supabase
```

---

## Banco de dados (Supabase)

Tabelas com RLS habilitado (`user_id = auth.uid()`):

- `profiles` — dados do usuário
- `accounts` — contas/carteiras
- `categories` — categorias globais e personalizadas
- `transactions` — lançamentos financeiros
- `recurring_transactions` — templates de transações recorrentes
- `investments` — aportes de investimento

RPCs Postgres:

- `dashboard_metrics(month)` — métricas agregadas do mês
- `materialize_recurring_for_month(month)` — materializa recorrências do mês de forma idempotente

---

## Configuração local

```bash
# 1. Instalar dependências
pnpm install

# 2. Configurar variáveis de ambiente
cp .env.example .env.local
# Preencher NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

# 3. Rodar em desenvolvimento
pnpm dev
```

Acesse `http://localhost:3000`.
