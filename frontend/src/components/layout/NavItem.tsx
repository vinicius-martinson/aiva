import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type NavItemProps = {
  icon: LucideIcon
  label: string
  href: string
  active?: boolean
}

export function NavItem({ icon: Icon, label, href, active }: NavItemProps) {
  return (
    <a
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </a>
  )
}
