import { useEffect, useState } from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { creerEmploye, modifierEmploye } from "@/lib/actions"
import { genererMatricule } from "@/lib/business"
import { db } from "@/lib/db"
import { SERVICES_DEFAUT } from "@/lib/constants"
import type { Employe } from "@/lib/types"

interface EmployeFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employe?: Employe | null
}

const VIDE = { matricule: "", nom: "", prenom: "", service: "", telephone: "" }

export function EmployeFormDialog({ open, onOpenChange, employe }: EmployeFormDialogProps) {
  const [form, setForm] = useState(VIDE)
  const [enregistrement, setEnregistrement] = useState(false)
  const estEdition = !!employe

  useEffect(() => {
    if (!open) return
    if (employe) {
      setForm({
        matricule: employe.matricule,
        nom: employe.nom,
        prenom: employe.prenom,
        service: employe.service,
        telephone: employe.telephone ?? "",
      })
    } else {
      db.employes.toArray().then((employes) => {
        setForm({ ...VIDE, matricule: genererMatricule(employes) })
      })
    }
  }, [open, employe])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.matricule.trim() || !form.nom.trim() || !form.prenom.trim() || !form.service.trim()) {
      toast.error("Veuillez remplir tous les champs obligatoires.")
      return
    }
    setEnregistrement(true)
    try {
      const data = {
        matricule: form.matricule.trim(),
        nom: form.nom.trim(),
        prenom: form.prenom.trim(),
        service: form.service.trim(),
        telephone: form.telephone.trim() || undefined,
      }
      if (estEdition && employe?.id !== undefined) {
        await modifierEmploye(employe.id, data)
        toast.success("Employé modifié avec succès.")
      } else {
        await creerEmploye(data)
        toast.success("Employé ajouté avec succès.")
      }
      onOpenChange(false)
    } catch (err) {
      if (err instanceof Error && err.name === "ConstraintError") {
        toast.error("Ce matricule est déjà utilisé.")
      } else {
        toast.error("Une erreur est survenue.")
      }
    } finally {
      setEnregistrement(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{estEdition ? "Modifier l'employé" : "Ajouter un employé"}</DialogTitle>
            <DialogDescription>
              {estEdition ? "Mettez à jour les informations de l'employé." : "Renseignez les informations de l'employé."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="matricule">Matricule *</Label>
              <Input
                id="matricule"
                value={form.matricule}
                onChange={(e) => setForm({ ...form, matricule: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="prenom">Prénom *</Label>
                <Input
                  id="prenom"
                  value={form.prenom}
                  onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="nom">Nom *</Label>
                <Input
                  id="nom"
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="service">Service *</Label>
              <Input
                id="service"
                list="services-suggestions"
                value={form.service}
                onChange={(e) => setForm({ ...form, service: e.target.value })}
                required
              />
              <datalist id="services-suggestions">
                {SERVICES_DEFAUT.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="telephone">Téléphone (optionnel)</Label>
              <Input
                id="telephone"
                value={form.telephone}
                onChange={(e) => setForm({ ...form, telephone: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={enregistrement}>
              {estEdition ? "Enregistrer" : "Ajouter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
