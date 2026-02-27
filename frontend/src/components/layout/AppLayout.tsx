import type { ReactNode } from "react"
import { Sidebar } from "./Sidebar"
import { ContextPanel } from "./ContextPanel"
import { PoweredByFooter } from "./PoweredByFooter"

type AppLayoutProps = {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="grid grid-cols-[260px_1fr_300px] flex-1 min-h-0">
        <Sidebar />
        <main className="flex flex-col min-w-0">
          {children}
        </main>
        <ContextPanel />
      </div>
      <PoweredByFooter />
    </div>
  )
}
