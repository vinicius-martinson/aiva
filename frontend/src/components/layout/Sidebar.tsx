import {
  Sparkles,
  LayoutDashboard,
  HelpCircle
} from "lucide-react"
import { NavItem } from "./NavItem"
import { NavGroup } from "./NavGroup"
import { UserFooter } from "./UserFooter"
import { Logo } from "./Logo"
import { Separator } from "@/components/ui/separator"

export function Sidebar() {
  return (
    <aside className="flex flex-col h-full bg-sidebar text-sidebar-foreground border-r">
      <Logo />

      {/* Navigation */}
      <nav className="flex-1 px-3 overflow-y-auto">
        <NavGroup label="Main">
          <NavItem icon={LayoutDashboard} label="Dashboard" href="/dashboard" />
          <NavItem icon={Sparkles} label="Agent Script" href="/ai-assistant" />
        </NavGroup>

        <NavGroup label="More">
          <NavItem icon={HelpCircle} label="FAQs" href="/settings" />
        </NavGroup>
      </nav>

      {/* User footer */}
      <Separator />
      <div className="px-4 py-3">
        <UserFooter />
      </div>
    </aside>
  )
}
