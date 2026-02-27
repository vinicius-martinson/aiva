import {
  
  Sparkles,
  Briefcase,
  Calendar,
  Users,
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
          <NavItem icon={Sparkles} label="Agent Script" href="/ai-assistant" active />
        </NavGroup>

        <div className="space-y-1 mb-4">
          <NavItem icon={Briefcase} label="Jobs" href="/jobs" />
          <NavItem icon={Calendar} label="Schedule" href="/schedule" />
          <NavItem icon={Users} label="Clients" href="/clients" />
        </div>

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
