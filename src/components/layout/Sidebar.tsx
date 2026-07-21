import { NavLink } from "react-router-dom"
import { LayoutDashboard, Users, History, ShoppingCart, ChefHat, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"

const links = [
  { to: "/", label: "Tableau de bord", icon: LayoutDashboard, end: true },
  { to: "/employes", label: "Employés", icon: Users, end: false },
  { to: "/depenses", label: "Dépenses", icon: ShoppingCart, end: false },
  { to: "/historique", label: "Historique", icon: History, end: false },
]

export function Sidebar() {
  const { deconnecter } = useAuth()

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-card">
      <div className="flex items-center gap-2 border-b px-6 py-5">
        <ChefHat className="h-6 w-6 text-primary" />
        <div>
          <p className="text-sm font-semibold leading-tight">Cantine</p>
          <p className="text-xs text-muted-foreground leading-tight">Gestion des repas</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="space-y-2 border-t p-3">
        <Button  size="sm" className="w-full  gap-2 bg-red-600  text-white h-12 flex items-center justify-center hover:bg-red-700 cursor-pointer" onClick={deconnecter}>
          <LogOut className="h-4 w-4" />
          Se déconnecter
        </Button>
        <p className="text-xs text-muted-foreground">Application locale — données stockées sur cet appareil</p>
      </div>
    </aside>
  )
}
