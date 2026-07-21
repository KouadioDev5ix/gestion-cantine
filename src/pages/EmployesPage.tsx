import { useMemo, useState } from "react"
import { toast } from "sonner"
import { Plus, Search, Wallet, UtensilsCrossed, Undo2, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { StatutBadge } from "@/components/employes/StatutBadge"
import { EmployeFormDialog } from "@/components/employes/EmployeFormDialog"
import { PaiementDialog } from "@/components/employes/PaiementDialog"
import { ExportButton } from "@/components/common/ExportButton"
import { useEmployesAvecStatut } from "@/hooks/useEmployes"
import { supprimerEmploye, basculerRepas } from "@/lib/actions"
import { formatDate } from "@/lib/format"
import { exporterEmployes, type FormatExport } from "@/lib/export"
import type { EmployeAvecStatut } from "@/lib/types"

type FiltreStatut = "tous" | "actif" | "a_renouveler" | "expire"

export function EmployesPage() {
  const employes = useEmployesAvecStatut()
  const [recherche, setRecherche] = useState("")
  const [filtreStatut, setFiltreStatut] = useState<FiltreStatut>("tous")
  const [filtreService, setFiltreService] = useState<string>("tous")

  const [dialogFormOuvert, setDialogFormOuvert] = useState(false)
  const [employeEnEdition, setEmployeEnEdition] = useState<EmployeAvecStatut | null>(null)
  const [dialogPaiementOuvert, setDialogPaiementOuvert] = useState(false)
  const [employePaiement, setEmployePaiement] = useState<EmployeAvecStatut | null>(null)
  const [employeASupprimer, setEmployeASupprimer] = useState<EmployeAvecStatut | null>(null)

  const services = useMemo(() => {
    if (!employes) return []
    return Array.from(new Set(employes.map((e) => e.service))).sort()
  }, [employes])

  const employesFiltres = useMemo(() => {
    if (!employes) return []
    const q = recherche.trim().toLowerCase()
    return employes.filter((e) => {
      if (filtreStatut !== "tous" && e.statut !== filtreStatut) return false
      if (filtreService !== "tous" && e.service !== filtreService) return false
      if (q) {
        const cible = `${e.nom} ${e.prenom} ${e.matricule} ${e.service}`.toLowerCase()
        if (!cible.includes(q)) return false
      }
      return true
    })
  }, [employes, recherche, filtreStatut, filtreService])

  function ouvrirAjout() {
    setEmployeEnEdition(null)
    setDialogFormOuvert(true)
  }

  function ouvrirEdition(e: EmployeAvecStatut) {
    setEmployeEnEdition(e)
    setDialogFormOuvert(true)
  }

  function ouvrirPaiement(e: EmployeAvecStatut) {
    setEmployePaiement(e)
    setDialogPaiementOuvert(true)
  }

  async function handleBasculerRepas(e: EmployeAvecStatut) {
    try {
      const resultat = await basculerRepas(e.id)
      if (resultat === "enregistre") {
        toast.success(`Repas enregistré pour ${e.prenom} ${e.nom}.`)
      } else {
        toast.success(`Repas annulé pour ${e.prenom} ${e.nom} — ticket recrédité.`)
      }
    } catch {
      toast.error(`${e.prenom} ${e.nom} n'a plus de ticket disponible.`)
    }
  }

  async function confirmerSuppression() {
    if (!employeASupprimer?.id) return
    await supprimerEmploye(employeASupprimer.id)
    toast.success("Employé supprimé.")
    setEmployeASupprimer(null)
  }

  function handleExport(format: FormatExport) {
    exporterEmployes(employesFiltres, format)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Employés</h1>
          <p className="text-sm text-muted-foreground">Gérer les employés et leurs abonnements</p>
        </div>
        <div className="flex gap-2">
          <ExportButton onExport={handleExport} disabled={!employesFiltres.length} />
          <Button onClick={ouvrirAjout}>
            <Plus className="h-4 w-4" />
            Ajouter un employé
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, matricule ou service…"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={filtreStatut} onValueChange={(v) => setFiltreStatut((v ?? "tous") as FiltreStatut)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tous">Tous les statuts</SelectItem>
            <SelectItem value="actif">Actif</SelectItem>
            <SelectItem value="a_renouveler">À renouveler</SelectItem>
            <SelectItem value="expire">Expiré</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filtreService} onValueChange={(v) => setFiltreService(v ?? "tous")}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Service" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tous">Tous les services</SelectItem>
            {services.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Matricule</TableHead>
              <TableHead>Nom et prénom</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Tickets restants</TableHead>
              <TableHead>Fin estimée</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employes === undefined ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  Chargement…
                </TableCell>
              </TableRow>
            ) : employesFiltres.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  Aucun employé trouvé.
                </TableCell>
              </TableRow>
            ) : (
              employesFiltres.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-mono text-xs">{e.matricule}</TableCell>
                  <TableCell className="font-medium">
                    {e.prenom} {e.nom}
                  </TableCell>
                  <TableCell>{e.service}</TableCell>
                  <TableCell className="font-medium">{e.soldeTickets}</TableCell>
                  <TableCell>{formatDate(e.dateFinEstimee)}</TableCell>
                  <TableCell>
                    <StatutBadge statut={e.statut} />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" title="Enregistrer un paiement" onClick={() => ouvrirPaiement(e)}>
                        <Wallet className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title={e.aMangeAujourdhui ? "Annuler le repas du jour" : "Enregistrer le repas du jour"}
                        disabled={!e.aMangeAujourdhui && e.soldeTickets <= 0}
                        onClick={() => handleBasculerRepas(e)}
                      >
                        {e.aMangeAujourdhui ? (
                          <Undo2 className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <UtensilsCrossed className="h-4 w-4" />
                        )}
                      </Button>
                      <Button variant="ghost" size="icon" title="Modifier" onClick={() => ouvrirEdition(e)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Supprimer"
                        onClick={() => setEmployeASupprimer(e)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <EmployeFormDialog open={dialogFormOuvert} onOpenChange={setDialogFormOuvert} employe={employeEnEdition} />
      <PaiementDialog open={dialogPaiementOuvert} onOpenChange={setDialogPaiementOuvert} employe={employePaiement} />

      <AlertDialog open={!!employeASupprimer} onOpenChange={(o) => !o && setEmployeASupprimer(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet employé ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera définitivement {employeASupprimer?.prenom} {employeASupprimer?.nom} ainsi que
              son historique de paiements et de repas. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmerSuppression} className="bg-red-600 hover:bg-red-700">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
