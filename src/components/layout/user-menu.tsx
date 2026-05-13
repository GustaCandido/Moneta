"use client"

import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { signOutAction } from "@/server/actions/auth"

export type AuthUser = {
  id: string
  email: string
  fullName: string
}

export function UserMenu({ user }: { user: AuthUser }) {
  const router = useRouter()
  const initials = getInitials(user.fullName)

  async function handleSignOut() {
    const toastId = toast.loading("Saindo…")
    await signOutAction()
    toast.success("Até mais!", { id: toastId, duration: 2000 })
    router.replace("/login")
    router.refresh()
  }

  return (
    <div className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2">
      <Avatar size="default" className="ring-2 ring-background">
        <AvatarFallback className="bg-primary text-[12px] font-medium text-primary-foreground after:hidden">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex min-w-0 flex-1 flex-col items-start text-left">
        <span className="w-full truncate text-[13px] font-medium text-foreground">
          {user.fullName}
        </span>
        <span className="w-full truncate text-[11px] text-muted-foreground">
          {user.email}
        </span>
      </div>

      <button
        type="button"
        onClick={handleSignOut}
        aria-label="Sair"
        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <LogOut className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
