import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MoreVertical } from "lucide-react"

export function UserFooter() {
  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-8 w-8">
        <AvatarFallback className="bg-blue-500 text-white text-xs">
          KA
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">Kelvin Arnold</p>
        <p className="text-xs text-sidebar-foreground/50 truncate">kelvin@example.com</p>
      </div>
      <button className="p-1 hover:bg-sidebar-accent rounded" aria-label="User menu">
        <MoreVertical className="h-4 w-4 text-sidebar-foreground/50" />
      </button>
    </div>
  )
}
