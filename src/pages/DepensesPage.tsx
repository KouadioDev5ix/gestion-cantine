import { useMemo, useState } from "react"
import { toast } from "sonner"
import { Plus, Search, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { DepenseFormDialog } from "@/components/depenses/DepenseFormDialog"
import { ExportButton } from "@/components/common/ExportButton"
import { useDepenses } from "@/hooks/useDepenses"
import { supprimerDepense } from "@/lib/actions"
import { formatDate, formatMontant } from "@/lib/format"
import { exporterDepenses, type FormatExport } from "@/lib/export"
import type { Depense } from "@/lib/types"

export function DepensesPage() {
  const depenses = useDepenses()
  const [recherche, setRecherche] = useState("")

  const [dialogFormOuvert, setDialogFormOuvert] = useState(false)
  const [depenseEnEdition, setDepenseEnEdition] = useState<Depense | null>(null)
  const [depenseASupprimer, setDepenseASupprimer] = useState<Depense | null>(null)

  const depensesFiltrees = useMemo(() => {
    if (!depenses) return []
    const q = recherche.trim().toLowerCase()
    if (!q) return depenses
    return depenses.filter((d) => d.nomArticle.toLowerCase().includes(q))
  }, [depenses, recherche])

  const totalMontant = depensesFiltrees.reduce((acc, d) => acc + d.prixUnitaire * d.quantite, 0)

  function ouvrirAjout() {
    setDepenseEnEdition(null)
    setDialogFormOuvert(true)
  }

  function ouvrirEdition(d: Depense) {
    setDepenseEnEdition(d)
    setDialogFormOuvert(true)
  }

  async function confirmerSuppression() {
    if (!depenseASupprimer) return
    await supprimerDepense(depenseASupprimer.id)
    toast.success("Dépense supprimée.")
    setDepenseASupprimer(null)
  }

  function handleExport(format: FormatExport) {
    exporterDepenses(depensesFiltrees, format)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dépenses</h1>
          <p className="text-sm text-muted-foreground">
            {depensesFiltrees.length} dépense(s) — {formatMontant(totalMontant)}
          </p>
        </div>
        <div className="flex gap-2">
          <ExportButton onExport={handleExport} disabled={!depensesFiltrees.length} />
          <Button onClick={ouvrirAjout}>
            <Plus className="h-4 w-4" />
            Ajouter une dépense
          </Button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher une dépense…"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Article</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Prix unitaire</TableHead>
              <TableHead>Quantité</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {depenses === undefined ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Chargement…
                </TableCell>
              </TableRow>
            ) : depensesFiltrees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Aucune dépense trouvée.
                </TableCell>
              </TableRow>
            ) : (
              depensesFiltrees.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.nomArticle}</TableCell>
                  <TableCell>{formatDate(d.date)}</TableCell>
                  <TableCell>{formatMontant(d.prixUnitaire)}</TableCell>
                  <TableCell>{d.quantite}</TableCell>
                  <TableCell className="font-medium">{formatMontant(d.prixUnitaire * d.quantite)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" title="Modifier" onClick={() => ouvrirEdition(d)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Supprimer"
                        onClick={() => setDepenseASupprimer(d)}
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

      <DepenseFormDialog open={dialogFormOuvert} onOpenChange={setDialogFormOuvert} depense={depenseEnEdition} />

      <AlertDialog open={!!depenseASupprimer} onOpenChange={(o) => !o && setDepenseASupprimer(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette dépense ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera définitivement « {depenseASupprimer?.nomArticle} ». Cette action est
              irréversible.
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
