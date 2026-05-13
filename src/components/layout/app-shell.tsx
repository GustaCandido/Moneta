"use client"

import * as React from "react"
import Link from "next/link"
import { Menu, TrendingUp } from "lucide-react"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
import { Sidebar } from "./sidebar"
import type { AuthUser } from "./user-menu"

export function AppShell({
  user,
  children,
}: {
  user: AuthUser
  children: React.ReactNode
}) {
  const [mobileOpen, setMobileOpen] = React.useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="hidden w-[260px] shrink-0 border-r border-border/60 md:flex">
        <Sidebar user={user} />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="w-[280px] border-r border-border/60 bg-sidebar p-0 sm:max-w-[280px]"
        >
          <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
          <SheetDescription className="sr-only">
            Acesso às páginas principais do Moneta.
          </SheetDescription>
          <Sidebar user={user} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">

          <div className="relative">
  <div className="absolute right-[50px] top-6">
    <ThemeToggle />
  </div>
</div>

        <main className="flex-1 px-4 py-8 sm:px-6 md:px-10 md:py-12">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
