import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { StartupNotifications } from "./StartupNotifications"
import { Toaster } from "@/components/ui/sonner"

export function Layout() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl p-6">
          <Outlet />
        </div>
      </main>
      <Toaster richColors position="top-right" />
      <StartupNotifications />
    </div>
  )
}
