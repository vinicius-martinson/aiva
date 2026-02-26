import type { ReactNode } from "react"
import { Sidebar } from "./Sidebar"
import { ContextPanel } from "./ContextPanel"

type AppLayoutProps = {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="grid grid-cols-[260px_1fr_300px] h-screen bg-background">
      <Sidebar />
      <main className="flex flex-col h-screen min-w-0">
        {children}
      </main>
      <ContextPanel />
    </div>
  )
}
