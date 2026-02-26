export function LiveBadge() {
  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-50">
      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
      <span className="text-xs font-medium text-green-600">Live</span>
    </div>
  )
}
