import { useMemo, useState } from "react"
import { Search } from "lucide-react"
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
import { ExportButton } from "@/components/common/ExportButton"
import { SelecteurDate } from "@/components/common/SelecteurDate"
import { usePaiementsAvecEmployes } from "@/hooks/usePaiements"
import { formatDate, formatMontant } from "@/lib/format"
import { exporterPaiements, type FormatExport } from "@/lib/export"

export function HistoriquePage() {
  const paiements = usePaiementsAvecEmployes()
  const [recherche, setRecherche] = useState("")
  const [filtreService, setFiltreService] = useState("tous")
  const [dateDebut, setDateDebut] = useState("")
  const [dateFin, setDateFin] = useState("")

  const services = useMemo(() => {
    if (!paiements) return []
    return Array.from(new Set(paiements.map((p) => p.employeService))).sort()
  }, [paiements])

  const paiementsFiltres = useMemo(() => {
    if (!paiements) return []
    const q = recherche.trim().toLowerCase()
    return paiements.filter((p) => {
      if (filtreService !== "tous" && p.employeService !== filtreService) return false
      if (dateDebut && p.date < dateDebut) return false
      if (dateFin && p.date > dateFin) return false
      if (q) {
        const cible = `${p.employeNom} ${p.employeMatricule} ${p.employeService}`.toLowerCase()
        if (!cible.includes(q)) return false
      }
      return true
    })
  }, [paiements, recherche, filtreService, dateDebut, dateFin])

  const totalMontant = paiementsFiltres.reduce((acc, p) => acc + p.montant, 0)

  function handleExport(format: FormatExport) {
    exporterPaiements(paiementsFiltres, format)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Historique des paiements</h1>
          <p className="text-sm text-muted-foreground">
            {paiementsFiltres.length} paiement(s) — {formatMontant(totalMontant)}
          </p>
        </div>
        <ExportButton onExport={handleExport} disabled={!paiementsFiltres.length} />
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
        <Select value={filtreService} onValueChange={(v) => setFiltreService(v ?? "tous")}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Service">{(v: string) => (v === "tous" ? "Tous les services" : v)}</SelectValue>
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
        <SelecteurDate value={dateDebut} onChange={setDateDebut} maxDate={new Date()} className="w-[160px]" />
        <span className="text-sm text-muted-foreground">à</span>
        <SelecteurDate value={dateFin} onChange={setDateFin} maxDate={new Date()} className="w-[160px]" />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Employé</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Tickets achetés</TableHead>
              <TableHead>Solde après</TableHead>
              <TableHead>Fin estimée</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paiements === undefined ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  Chargement…
                </TableCell>
              </TableRow>
            ) : paiementsFiltres.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  Aucun paiement trouvé.
                </TableCell>
              </TableRow>
            ) : (
              paiementsFiltres.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{formatDate(p.date)}</TableCell>
                  <TableCell className="font-medium">
                    {p.employeNom}
                    <span className="ml-2 font-mono text-xs text-muted-foreground">{p.employeMatricule}</span>
                  </TableCell>
                  <TableCell>{p.employeService}</TableCell>
                  <TableCell>{formatMontant(p.montant)}</TableCell>
                  <TableCell>+{p.jours}</TableCell>
                  <TableCell>{p.soldeApres}</TableCell>
                  <TableCell>{formatDate(p.dateFinEstimee)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
