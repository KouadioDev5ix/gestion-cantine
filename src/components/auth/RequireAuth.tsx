import { Navigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { connecte } = useAuth()

  if (!connecte) {
    return <Navigate to="/login" replace />
  }

  return children
}
