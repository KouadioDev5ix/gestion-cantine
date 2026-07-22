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
import { SelecteurDate } from "@/components/common/SelecteurDate"
import { enregistrerPaiement } from "@/lib/actions"
import { calculerJours, dateFinEstimee, today } from "@/lib/business"
import { formatDate, formatMontant } from "@/lib/format"
import { PRIX_REPAS } from "@/lib/constants"
import type { Employe } from "@/lib/types"

interface PaiementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employe: Employe | null
}

const MONTANTS_RAPIDES = [500, 1000, 2500, 5000, 10000]

export function PaiementDialog({ open, onOpenChange, employe }: PaiementDialogProps) {
  const [montant, setMontant] = useState("")
  const [date, setDate] = useState(today())
  const [enregistrement, setEnregistrement] = useState(false)

  useEffect(() => {
    if (open) {
      setMontant("")
      setDate(today())
    }
  }, [open])

  if (!employe) return null

  const montantNum = parseInt(montant, 10) || 0
  const jours = montantNum > 0 ? calculerJours(montantNum) : 0
  const nouveauSolde = employe.soldeTickets + jours
  const apercu = montantNum > 0 ? { jours, nouveauSolde, dateFinEstimee: dateFinEstimee(nouveauSolde, date || today()) } : null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!employe?.id || montantNum <= 0) {
      toast.error("Veuillez saisir un montant valide.")
      return
    }
    if (montantNum % PRIX_REPAS !== 0) {
      toast.error(`Le montant doit être un multiple de ${PRIX_REPAS} FCFA.`)
      return
    }
    if (!date) {
      toast.error("Veuillez sélectionner une date.")
      return
    }
    setEnregistrement(true)
    try {
      await enregistrerPaiement(employe.id, montantNum, date)
      toast.success(`Paiement de ${formatMontant(montantNum)} enregistré.`)
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
            <DialogTitle>Enregistrer un paiement</DialogTitle>
            <DialogDescription>
              {employe.prenom} {employe.nom} — {employe.matricule}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="datePaiement">Date du paiement *</Label>
              <SelecteurDate id="datePaiement" value={date} onChange={setDate} maxDate={new Date()} />
              <p className="text-xs text-muted-foreground">
                Choisissez une date passée pour enregistrer un ancien paiement.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="montant">Montant (FCFA) *</Label>
              <Input
                id="montant"
                type="number"
                min={PRIX_REPAS}
                step={PRIX_REPAS}
                value={montant}
                onChange={(e) => setMontant(e.target.value)}
                autoFocus
                required
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {MONTANTS_RAPIDES.map((m) => (
                <Button key={m} type="button" variant="secondary" size="sm" onClick={() => setMontant(String(m))}>
                  {formatMontant(m)}
                </Button>
              ))}
            </div>

            <div className="rounded-md border bg-muted/40 p-3 text-sm">
              <div className="flex justify-between py-0.5">
                <span className="text-muted-foreground">Solde actuel de tickets</span>
                <span className="font-medium">{employe.soldeTickets}</span>
              </div>
              {apercu && (
                <>
                  <div className="flex justify-between py-0.5">
                    <span className="text-muted-foreground">Tickets ajoutés</span>
                    <span className="font-medium">+{apercu.jours}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-muted-foreground">Nouveau solde de tickets</span>
                    <span className="font-semibold text-primary">{apercu.nouveauSolde}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-muted-foreground">Fin estimée (si repas pris chaque jour)</span>
                    <span className="font-medium">{formatDate(apercu.dateFinEstimee)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={enregistrement || montantNum <= 0}>
              Enregistrer le paiement
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
