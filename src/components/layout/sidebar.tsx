"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ArrowRightLeft,
  LayoutDashboard,
  LineChart,
  Settings,
  TrendingUp,
  Wallet,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { UserMenu, type AuthUser } from "./user-menu"

const NAV_ITEMS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transacoes", label: "Transações", icon: ArrowRightLeft },
  { href: "/contas", label: "Contas", icon: Wallet },
  { href: "/investimentos", label: "Investimentos", icon: LineChart },
]

const FOOTER_NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/configuracoes", label: "Configurações", icon: Settings },
]

export function Sidebar({
  user,
  onNavigate,
}: {
  user: AuthUser
  onNavigate?: () => void
}) {
  const pathname = usePathname()

  return (
    <div className="flex h-screen w-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Brand */}
      <div className="flex h-16 shrink-0 items-center border-b border-sidebar-border/70 px-6">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <TrendingUp className="h-4 w-4" strokeWidth={2.5} />
          </span>
          <span className="font-display text-[22px] leading-none tracking-tight">
            Moneta<em className="text-primary">.</em>
          </span>
        </Link>
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-6">
        <span className="px-3 text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
          Navegação
        </span>
        <ul className="mt-3 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              pathname={pathname}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      </nav>

      {/* Footer nav + user */}
      <div className="border-t border-sidebar-border/70 p-3">
        <ul className="mb-3 space-y-0.5">
          {FOOTER_NAV.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              pathname={pathname}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
        <UserMenu user={user} />
      </div>
    </div>
  )
}

function NavLink({
  item,
  pathname,
  onNavigate,
}: {
  item: { href: string; label: string; icon: LucideIcon }
  pathname: string
  onNavigate?: () => void
}) {
  const active =
    pathname === item.href || pathname.startsWith(item.href + "/")
  const Icon = item.icon
  return (
    <li>
      <Link
        href={item.href}
        onClick={onNavigate}
        className={cn(
          "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] transition-colors",
          active
            ? "bg-primary/10 font-medium text-primary"
            : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground"
        )}
      >
        <Icon className="h-4 w-4" strokeWidth={active ? 2.2 : 1.8} />
        <span>{item.label}</span>
        {active && (
          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
        )}
      </Link>
    </li>
  )
}
