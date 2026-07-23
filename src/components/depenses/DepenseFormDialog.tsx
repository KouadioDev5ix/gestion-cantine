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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SelecteurDate } from "@/components/common/SelecteurDate"
import { creerDepense, modifierDepense } from "@/lib/actions"
import { today } from "@/lib/business"
import { CATEGORIES_DEPENSES } from "@/lib/constants"
import { useListeEmployes } from "@/hooks/useEmployes"
import type { Depense } from "@/lib/types"

interface DepenseFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  depense?: Depense | null
}

const AUTRE = "Autre"
const AUCUN_EMPLOYE = "aucun"

const VIDE = {
  categorie: "",
  autrePrecision: "",
  employeId: AUCUN_EMPLOYE,
  date: today(),
  prixUnitaire: "",
  quantite: "1",
}

export function DepenseFormDialog({ open, onOpenChange, depense }: DepenseFormDialogProps) {
  const [form, setForm] = useState(VIDE)
  const [enregistrement, setEnregistrement] = useState(false)
  const estEdition = !!depense
  const employes = useListeEmployes()

  useEffect(() => {
    if (!open) return
    if (depense) {
      const estCategoriePredefinie = (CATEGORIES_DEPENSES as readonly string[]).includes(depense.nomArticle) &&
        depense.nomArticle !== AUTRE
      setForm({
        categorie: estCategoriePredefinie ? depense.nomArticle : AUTRE,
        autrePrecision: estCategoriePredefinie ? "" : depense.nomArticle,
        employeId: depense.employeId !== null ? String(depense.employeId) : AUCUN_EMPLOYE,
        date: depense.date,
        prixUnitaire: String(depense.prixUnitaire),
        quantite: String(depense.quantite),
      })
    } else {
      setForm(VIDE)
    }
  }, [open, depense])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!form.categorie) {
      toast.error("Veuillez sélectionner une dépense.")
      return
    }
    if (form.categorie === AUTRE && !form.autrePrecision.trim()) {
      toast.error("Veuillez préciser la dépense.")
      return
    }
    const prixUnitaire = parseFloat(form.prixUnitaire)
    const quantite = parseFloat(form.quantite)
    if (!prixUnitaire || prixUnitaire <= 0) {
      toast.error("Veuillez saisir un prix valide.")
      return
    }
    if (!quantite || quantite <= 0) {
      toast.error("Veuillez saisir une quantité valide.")
      return
    }
    if (!form.date) {
      toast.error("Veuillez saisir une date.")
      return
    }

    setEnregistrement(true)
    try {
      const data = {
        nomArticle: form.categorie === AUTRE ? form.autrePrecision.trim() : form.categorie,
        employeId: form.employeId === AUCUN_EMPLOYE ? null : parseInt(form.employeId, 10),
        date: form.date,
        prixUnitaire,
        quantite,
      }
      if (estEdition && depense) {
        await modifierDepense(depense.id, data)
        toast.success("Dépense modifiée avec succès.")
      } else {
        await creerDepense(data)
        toast.success("Dépense ajoutée avec succès.")
      }
      onOpenChange(false)
    } catch {
      toast.error("Une erreur est survenue.")
    } finally {
      setEnregistrement(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{estEdition ? "Modifier la dépense" : "Ajouter une dépense"}</DialogTitle>
            <DialogDescription>
              {estEdition ? "Mettez à jour les informations de la dépense." : "Renseignez les informations de la dépense."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="categorie">Dépense *</Label>
              <Select value={form.categorie} onValueChange={(v) => setForm({ ...form, categorie: v ?? "" })}>
                <SelectTrigger id="categorie" className="w-full">
                  <SelectValue placeholder="Sélectionner une dépense" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES_DEPENSES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {form.categorie === AUTRE && (
              <div className="grid gap-2">
                <Label htmlFor="autrePrecision">Précisez la dépense *</Label>
                <Input
                  id="autrePrecision"
                  value={form.autrePrecision}
                  onChange={(e) => setForm({ ...form, autrePrecision: e.target.value })}
                  autoFocus
                />
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="employe">Employé</Label>
              <Select value={form.employeId} onValueChange={(v) => setForm({ ...form, employeId: v ?? AUCUN_EMPLOYE })}>
                <SelectTrigger id="employe" className="w-full">
                  <SelectValue placeholder="Sélectionner un employé">
                    {(v: string) => {
                      if (v === AUCUN_EMPLOYE || !v) return "Aucun"
                      const emp = employes?.find((e) => String(e.id) === v)
                      return emp ? `${emp.prenom} ${emp.nom}` : "Aucun"
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={AUCUN_EMPLOYE}>Aucun</SelectItem>
                  {employes?.map((emp) => (
                    <SelectItem key={emp.id} value={String(emp.id)}>
                      {emp.prenom} {emp.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="date">Date *</Label>
              <SelecteurDate
                id="date"
                value={form.date}
                onChange={(v) => setForm({ ...form, date: v })}
                maxDate={new Date()}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="prixUnitaire">Prix unitaire (FCFA) *</Label>
                <Input
                  id="prixUnitaire"
                  type="number"
                  min={0}
                  value={form.prixUnitaire}
                  onChange={(e) => setForm({ ...form, prixUnitaire: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="quantite">Quantité *</Label>
                <Input
                  id="quantite"
                  type="number"
                  min={0}
                  value={form.quantite}
                  onChange={(e) => setForm({ ...form, quantite: e.target.value })}
                />
              </div>
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
