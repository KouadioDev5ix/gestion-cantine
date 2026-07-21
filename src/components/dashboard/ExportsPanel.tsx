import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExportButton } from "@/components/common/ExportButton"
import { useEmployesAvecStatut } from "@/hooks/useEmployes"
import { usePaiementsAvecEmployes } from "@/hooks/usePaiements"
import { useRepasAvecEmployes } from "@/hooks/useRepas"
import { useDepenses } from "@/hooks/useDepenses"
import { exporterEmployes, exporterPaiements, exporterRepas, exporterDepenses, exporterRapportMensuel } from "@/lib/export"
import type { FormatExport } from "@/lib/export"
import type { DashboardData } from "@/hooks/useDashboard"
import { today } from "@/lib/business"
import { parseISO } from "date-fns"

export function ExportsPanel({ data }: { data: DashboardData | undefined }) {
  const employes = useEmployesAvecStatut()
  const paiements = usePaiementsAvecEmployes()
  const repas = useRepasAvecEmployes()
  const depenses = useDepenses()

  const mois = parseISO(today()).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })

  function exporterRapport(format: FormatExport) {
    if (!data || !paiements) return
    exporterRapportMensuel(
      {
        mois,
        totalEmployes: data.totalEmployes,
        employesActifs: data.employesActifs,
        employesARenouveler: data.employesARenouveler,
        employesExpires: data.employesExpires,
        nombrePaiements: data.paiementsDuMois,
        montantEncaisse: data.montantEncaisseDuMois,
        nombreRepas: data.repasDuJour,
        depensesDuMois: data.depensesDuMois,
      },
      format
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Export des données</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        <ExportButton
          label="Liste des employés"
          disabled={!employes?.length}
          onExport={(f) => employes && exporterEmployes(employes, f)}
        />
        <ExportButton
          label="Paiements"
          disabled={!paiements?.length}
          onExport={(f) => paiements && exporterPaiements(paiements, f)}
        />
        <ExportButton label="Repas" disabled={!repas?.length} onExport={(f) => repas && exporterRepas(repas, f)} />
        <ExportButton
          label="Dépenses"
          disabled={!depenses?.length}
          onExport={(f) => depenses && exporterDepenses(depenses, f)}
        />
        <ExportButton label="Rapport mensuel" disabled={!data} onExport={exporterRapport} />
      </CardContent>
    </Card>
  )
}
