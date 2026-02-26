import {
  LayoutDashboard,
  Sparkles,
  Briefcase,
  Calendar,
  Users,
  Settings,
} from "lucide-react"
import { NavItem } from "./NavItem"
import { NavGroup } from "./NavGroup"
import { UserFooter } from "./UserFooter"
import { Separator } from "@/components/ui/separator"

export function Sidebar() {
  return (
    <aside className="flex flex-col h-full bg-sidebar text-sidebar-foreground border-r">
      {/* Logo */}
      <div className="px-4 py-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-semibold">Aiva</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 overflow-y-auto">
        <NavGroup label="Main">
          <NavItem icon={LayoutDashboard} label="Dashboard" href="/dashboard" />
          <NavItem icon={Sparkles} label="AI Assistant" href="/ai-assistant" active />
        </NavGroup>

        <div className="space-y-1 mb-4">
          <NavItem icon={Briefcase} label="Jobs" href="/jobs" />
          <NavItem icon={Calendar} label="Schedule" href="/schedule" />
          <NavItem icon={Users} label="Clients" href="/clients" />
        </div>

        <NavGroup label="More">
          <NavItem icon={Settings} label="Settings" href="/settings" />
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
