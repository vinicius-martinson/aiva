import type { ReactNode } from "react"

type NavGroupProps = {
  label: string
  children: ReactNode
}

export function NavGroup({ label, children }: NavGroupProps) {
  return (
    <div className="mb-4">
      <h3 className="px-3 mb-2 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
        {label}
      </h3>
      <div className="space-y-1">{children}</div>
    </div>
  )
}
