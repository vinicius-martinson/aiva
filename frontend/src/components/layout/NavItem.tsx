import type { LucideIcon } from "lucide-react"
import { NavLink } from "react-router-dom"
import { cn } from "@/lib/utils"

type NavItemProps = {
  icon: LucideIcon
  label: string
  href: string
}

export function NavItem({ icon: Icon, label, href }: NavItemProps) {
  return (
    <NavLink
      to={href}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
        )
      }
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </NavLink>
  )
}
