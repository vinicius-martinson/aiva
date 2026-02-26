import { Sidebar } from "@/components/layout/Sidebar"

function App() {
  return (
    <div className="flex h-screen">
      <div className="w-[260px]">
        <Sidebar />
      </div>
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Chat area - coming soon</p>
      </div>
    </div>
  )
}

export default App
