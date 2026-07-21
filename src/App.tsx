import { HashRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "@/contexts/AuthContext"
import { RequireAuth } from "@/components/auth/RequireAuth"
import { Layout } from "@/components/layout/Layout"
import { LoginPage } from "@/pages/LoginPage"
import { DashboardPage } from "@/pages/DashboardPage"
import { EmployesPage } from "@/pages/EmployesPage"
import { DepensesPage } from "@/pages/DepensesPage"
import { HistoriquePage } from "@/pages/HistoriquePage"

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="login" element={<LoginPage />} />
          <Route
            element={
              <RequireAuth>
                <Layout />
              </RequireAuth>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="employes" element={<EmployesPage />} />
            <Route path="depenses" element={<DepensesPage />} />
            <Route path="historique" element={<HistoriquePage />} />
          </Route>
        </Routes>
      </HashRouter>
    </AuthProvider>
  )
}

export default App
