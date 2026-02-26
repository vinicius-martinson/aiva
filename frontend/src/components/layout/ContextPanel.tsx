export function ContextPanel() {
  return (
    <aside className="flex flex-col h-full bg-background border-l">
      <div className="px-4 py-4 border-b">
        <h2 className="text-sm font-semibold">Call Context</h2>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <p className="text-sm text-muted-foreground text-center">
          Waiting for call...
        </p>
      </div>
    </aside>
  )
}
