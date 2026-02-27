import { createBrowserRouter, Navigate } from "react-router-dom"
import { AppShell } from "@/components/layout/AppShell"
import { DashboardPage } from "@/pages/DashboardPage"
import { ChatPage } from "@/pages/ChatPage"
import { FAQsPage } from "@/pages/FAQsPage"

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "ai-assistant", element: <ChatPage /> },
      { path: "settings", element: <FAQsPage /> },
    ],
  },
])
