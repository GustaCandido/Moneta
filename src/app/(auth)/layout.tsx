import Link from "next/link"
import { TrendingUp } from "lucide-react"

import { cn } from "@/lib/utils"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-svh w-full overflow-hidden bg-background">
      {/* Ambient gradient orbs (light mode warmth) */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-32 -top-32 h-[640px] w-[640px] rounded-full bg-primary/[0.07] blur-[140px]" />
        <div className="absolute -bottom-40 -left-40 h-[520px] w-[520px] rounded-full bg-primary/[0.04] blur-[120px]" />
      </div>

      {/* Mobile brand bar */}
      <div className="flex items-center justify-between px-6 py-5 md:hidden">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary text-primary-foreground">
            <TrendingUp className="h-4 w-4" strokeWidth={2.5} />
          </span>
          <span className="font-display text-xl tracking-tight">
            Moneta<em className="text-primary">.</em>
          </span>
        </Link>
        <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
          PT-BR · BETA
        </span>
      </div>

      <div className="mx-auto flex w-full max-w-[1480px] items-stretch md:min-h-svh md:p-6">
        <div
          className={cn(
            "grid w-full overflow-hidden bg-card",
            "md:min-h-[760px] md:rounded-[32px] md:border md:border-border/60 md:shadow-[0_25px_80px_-30px_rgba(15,23,42,0.18)]",
            "md:grid-cols-[1.05fr_1fr]"
          )}
        >
          <DecorativePanel />

          <div className="flex w-full items-center justify-center px-6 py-12 sm:px-12 md:py-16">
            <div className="w-full max-w-md">{children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DecorativePanel() {
  return (
    <div className="relative hidden overflow-hidden md:flex md:flex-col">
      {/* Base layered gradient — light at top fading into deep ocean */}
      <div className="absolute inset-0 bg-[linear-gradient(168deg,#6d8edd_0%,#4a6dbe_38%,#324e94_68%,#1c2f5c_100%)]" />

      {/* Warm accent in top-right (premium feel) */}
      <div className="absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,205,170,0.28),rgba(255,205,170,0)_65%)]" />

      {/* Cool accent low-left */}
      <div className="absolute -bottom-32 -left-24 h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle_at_center,rgba(120,170,255,0.22),rgba(120,170,255,0)_70%)]" />

      {/* Ledger horizontal lines */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.08]"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <pattern id="ledger" x="0" y="0" width="100" height="44" patternUnits="userSpaceOnUse">
            <line x1="0" y1="22" x2="100" y2="22" stroke="white" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ledger)" />
      </svg>

      {/* Trending-up line chart (subtle) */}
      <svg
        className="absolute inset-x-0 top-[28%] h-[44%] w-full opacity-[0.18]"
        viewBox="0 0 600 240"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="line-fade" x1="0" x2="1">
            <stop offset="0" stopColor="white" stopOpacity="0" />
            <stop offset="0.4" stopColor="white" stopOpacity="0.9" />
            <stop offset="1" stopColor="white" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="area-fade" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="white" stopOpacity="0.25" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0 200 Q 80 190, 140 160 T 280 110 Q 360 85, 440 60 T 600 18"
          stroke="url(#line-fade)"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M0 200 Q 80 190, 140 160 T 280 110 Q 360 85, 440 60 T 600 18 L 600 240 L 0 240 Z"
          fill="url(#area-fade)"
        />
        {/* dotted forecast continuation */}
        <path
          d="M0 220 Q 80 210, 140 185 T 280 140"
          stroke="white"
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="3 7"
          strokeOpacity="0.6"
          strokeLinecap="round"
        />
      </svg>

      {/* Floating transaction card mockups */}
      <FloatingCard
        className="absolute left-[10%] top-[18%] w-[230px] -rotate-[3deg]"
        style={{ animationDelay: "120ms" }}
        dotClass="bg-emerald-300"
        label="Salário"
        value="+ R$ 8.250,00"
        date="Hoje · 09:32"
      />
      <FloatingCard
        className="absolute right-[8%] top-[36%] w-[210px] rotate-[2.5deg]"
        style={{ animationDelay: "260ms" }}
        dotClass="bg-rose-300"
        label="Mercado"
        value="− R$ 287,40"
        date="Ontem · 18:15"
      />
      <FloatingCard
        className="absolute left-[18%] top-[58%] w-[200px] -rotate-[1.5deg]"
        style={{ animationDelay: "400ms" }}
        dotClass="bg-sky-300"
        label="Aporte CDB"
        value="+ R$ 1.500,00"
        date="3 dias atrás"
      />

      {/* Grain noise overlay (inline SVG turbulence) */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.22] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='180' height='180' filter='url(%23n)' opacity='0.45'/></svg>\")",
        }}
        aria-hidden
      />

      {/* Bottom darken gradient for tagline readability */}
      <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-[#0c1838]/70 via-[#0c1838]/30 to-transparent" />

      {/* Brand wordmark + meta — top of panel */}
      <div className="relative z-10 flex items-center justify-between p-10">
        <Link href="/" className="flex items-center gap-2.5 text-white">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 backdrop-blur-md ring-1 ring-inset ring-white/20">
            <TrendingUp className="h-4 w-4" strokeWidth={2.5} />
          </span>
          <span className="font-display text-[26px] leading-none tracking-tight">
            Moneta<em className="text-white/55">.</em>
          </span>
        </Link>
        <span className="text-[10px] font-medium uppercase tracking-[0.24em] text-white/55">
          PT-BR · BETA
        </span>
      </div>

      <div className="flex-1" />

      {/* Tagline — bottom */}
      <div className="relative z-10 max-w-[540px] px-10 pb-12">
        <span className="mb-5 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.24em] text-white/75">
          <span className="h-px w-7 bg-white/40" />
          Manifesto
        </span>
        <h2 className="font-display text-[44px] leading-[1.04] text-white sm:text-[50px]">
          Controle seu{" "}
          <em className="italic text-white">dinheiro</em>{" "}
          com{" "}
          <span className="relative inline-block">
            <em className="italic">clareza</em>
            <svg
              className="absolute -bottom-1.5 left-0 h-3 w-full text-white/45"
              viewBox="0 0 200 12"
              fill="none"
              aria-hidden
            >
              <path
                d="M3 8 Q 50 2, 100 6 T 197 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </span>
          .
        </h2>
        <p className="mt-6 max-w-[420px] text-[15px] leading-relaxed text-white/75">
          Acompanhe entradas, saídas, investimentos e metas em um só lugar — sem planilha, sem complicação.
        </p>
      </div>
    </div>
  )
}

function FloatingCard({
  className,
  style,
  dotClass,
  label,
  value,
  date,
}: {
  className?: string
  style?: React.CSSProperties
  dotClass: string
  label: string
  value: string
  date: string
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/15 bg-white/[0.09] p-3.5 shadow-[0_18px_40px_-15px_rgba(0,0,0,0.45)] backdrop-blur-md",
        "animate-in fade-in slide-in-from-bottom-3 duration-700 fill-mode-both",
        className
      )}
      style={{
        animation: "float-slow 6s ease-in-out infinite",
        ...style,
      }}
    >
      <div className="flex items-center justify-between gap-3 text-white">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className={cn("h-2 w-2 shrink-0 rounded-full", dotClass)} />
          <span className="truncate text-[13px] font-medium">{label}</span>
        </div>
        <span className="shrink-0 text-[12px] tabular-nums opacity-90">{value}</span>
      </div>
      <div className="mt-3 flex items-center gap-1 opacity-50">
        <span className="h-[3px] flex-1 rounded-full bg-white/45" />
        <span className="h-[3px] w-10 rounded-full bg-white/20" />
      </div>
      <div className="mt-2 text-[10px] uppercase tracking-[0.16em] text-white/55">
        {date}
      </div>
    </div>
  )
}
