import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeOff, Lock, User, ChefHat } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/AuthContext"
import { verifierIdentifiants } from "@/lib/auth"

const schemaConnexion = z.object({
  nomUtilisateur: z.string().min(1, "Le nom d'utilisateur est requis"),
  motDePasse: z.string().min(1, "Le mot de passe est requis"),
})

type FormConnexion = z.infer<typeof schemaConnexion>

export function LoginPage() {
  const { connecter } = useAuth()
  const navigate = useNavigate()
  const [motDePasseVisible, setMotDePasseVisible] = useState(false)
  const [erreur, setErreur] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormConnexion>({ resolver: zodResolver(schemaConnexion) })

  function onSubmit(data: FormConnexion) {
    if (verifierIdentifiants(data.nomUtilisateur, data.motDePasse)) {
      setErreur("")
      connecter()
      navigate("/", { replace: true })
    } else {
      setErreur("Nom d'utilisateur ou mot de passe incorrect.")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <ChefHat className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">Cantine</CardTitle>
          <CardDescription>Connectez-vous pour accéder à l'espace coordinateur</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="nomUtilisateur">Nom d'utilisateur</Label>
              <div className="relative">
                <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="nomUtilisateur"
                  autoComplete="username"
                  autoFocus
                  className="pl-8"
                  {...register("nomUtilisateur")}
                />
              </div>
              {errors.nomUtilisateur && <p className="text-xs text-destructive">{errors.nomUtilisateur.message}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="motDePasse">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="motDePasse"
                  type={motDePasseVisible ? "text" : "password"}
                  autoComplete="current-password"
                  className="px-8"
                  {...register("motDePasse")}
                />
                <button
                  type="button"
                  onClick={() => setMotDePasseVisible((v) => !v)}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {motDePasseVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.motDePasse && <p className="text-xs text-destructive">{errors.motDePasse.message}</p>}
            </div>

            {erreur && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{erreur}</p>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              Se connecter
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
