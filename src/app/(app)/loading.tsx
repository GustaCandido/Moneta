function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-muted ${
        className ?? ""
      }`}
    />
  )
}

export default function AppLoading() {
  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <SkeletonBlock className="h-3 w-32 rounded-full" />
          <SkeletonBlock className="h-11 w-64" />
          <SkeletonBlock className="h-4 w-full max-w-md" />
        </div>
        <SkeletonBlock className="h-10 w-36 rounded-full" />
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonBlock key={index} className="h-32" />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.85fr]">
        <SkeletonBlock className="h-[360px]" />
        <SkeletonBlock className="h-[360px]" />
      </div>

      <SkeletonBlock className="h-40" />
    </div>
  )
}
