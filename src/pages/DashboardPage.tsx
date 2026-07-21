import { Users, Receipt, Wallet, CheckCircle2, AlertTriangle, XCircle, UtensilsCrossed, ShoppingCart } from "lucide-react"
import { StatCard } from "@/components/dashboard/StatCard"
import { ChartMontantParSemaine, ChartRepas, ChartStatuts } from "@/components/dashboard/Charts"
import { ExportsPanel } from "@/components/dashboard/ExportsPanel"
import { useDashboard } from "@/hooks/useDashboard"
import { formatMontant } from "@/lib/format"

export function DashboardPage() {
  const data = useDashboard()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Tableau de bord</h1>
        <p className="text-sm text-muted-foreground">Vue d'ensemble de la cantine</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        <StatCard label="Employés" value={data?.totalEmployes ?? "—"} icon={Users} />
        <StatCard label="Paiements du mois" value={data?.paiementsDuMois ?? "—"} icon={Receipt} />
        <StatCard
          label="Montant encaissé"
          value={data ? formatMontant(data.montantEncaisseDuMois) : "—"}
          icon={Wallet}
        />
        <StatCard label="Repas du jour" value={data?.repasDuJour ?? "—"} icon={UtensilsCrossed} />
        <StatCard label="Employés actifs" value={data?.employesActifs ?? "—"} icon={CheckCircle2} accent="emerald" />
        <StatCard
          label="À renouveler"
          value={data?.employesARenouveler ?? "—"}
          icon={AlertTriangle}
          accent="amber"
        />
        <StatCard label="Employés expirés" value={data?.employesExpires ?? "—"} icon={XCircle} accent="red" />
        <StatCard
          label="Dépenses du mois"
          value={data ? formatMontant(data.depensesDuMois) : "—"}
          icon={ShoppingCart}
          accent="red"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartMontantParSemaine data={data?.montantParSemaine ?? []} />
        <ChartRepas data={data?.repasParJour ?? []} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartStatuts data={data?.repartitionStatuts ?? []} />
        <ExportsPanel data={data} />
      </div>
    </div>
  )
}
