import { cn } from "@/lib/utils"

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  eyebrow?: string
  title: string
  description?: string
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div>
        {eyebrow && (
          <span className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            <span className="h-px w-6 bg-border" />
            {eyebrow}
          </span>
        )}
        <h1 className="mt-3 font-display text-[38px] leading-[1.05] tracking-tight sm:text-[44px]">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-[640px] text-[15px] text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="flex shrink-0 items-center gap-2">{children}</div>
      )}
    </div>
  )
}
