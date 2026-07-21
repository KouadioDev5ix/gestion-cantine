import { createContext, useContext, useState, type ReactNode } from "react"

const CLE_STOCKAGE = "cantine_auth"

interface AuthContextValue {
  connecte: boolean
  connecter: () => void
  deconnecter: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [connecte, setConnecte] = useState(() => localStorage.getItem(CLE_STOCKAGE) === "1")

  function connecter() {
    localStorage.setItem(CLE_STOCKAGE, "1")
    setConnecte(true)
  }

  function deconnecter() {
    localStorage.removeItem(CLE_STOCKAGE)
    setConnecte(false)
  }

  return <AuthContext.Provider value={{ connecte, connecter, deconnecter }}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider")
  return ctx
}
