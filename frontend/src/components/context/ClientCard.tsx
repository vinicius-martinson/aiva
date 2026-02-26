import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getInitials, getAvatarColor } from "@/lib/avatarUtils"
import type { ClientData } from "@/types/booking"

interface ClientCardProps {
  client: ClientData
}

export function ClientCard({ client }: ClientCardProps) {
  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-10 w-10">
        <AvatarFallback className={`${getAvatarColor(client.name)} text-white text-sm font-medium`}>
          {getInitials(client.name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col min-w-0">
        <span className="font-semibold text-sm truncate">{client.name}</span>
        <span className="text-xs text-muted-foreground truncate">{client.phone}</span>
      </div>
    </div>
  )
}
