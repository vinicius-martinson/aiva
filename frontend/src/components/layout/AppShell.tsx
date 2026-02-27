import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { PoweredByFooter } from "./PoweredByFooter"

export function AppShell() {
  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="grid grid-cols-[260px_1fr] flex-1 min-h-0">
        <Sidebar />
        <Outlet />
      </div>
      <PoweredByFooter />
    </div>
  )
}
