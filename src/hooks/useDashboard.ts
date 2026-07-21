import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"
import { calculerStatut } from "@/lib/business"
import { useAujourdhui } from "./useAujourdhui"
import { addDays, formatISO, parseISO, startOfWeek, startOfMonth } from "date-fns"

export interface DashboardData {
  totalEmployes: number
  paiementsDuMois: number
  montantEncaisseDuMois: number
  employesActifs: number
  employesARenouveler: number
  employesExpires: number
  repasDuJour: number
  depensesDuMois: number
  montantParSemaine: { semaine: string; montant: number }[]
  repasParJour: { jour: string; repas: number }[]
  repartitionStatuts: { statut: string; valeur: number; couleur: string }[]
}

export function useDashboard(): DashboardData | undefined {
  const ref = useAujourdhui()

  return useLiveQuery(async () => {
    const [employes, paiements, repas, depenses] = await Promise.all([
      db.employes.toArray(),
      db.paiements.toArray(),
      db.repas.toArray(),
      db.depenses.toArray(),
    ])

    const debutMois = formatISO(startOfMonth(parseISO(ref)), { representation: "date" })

    let employesActifs = 0
    let employesARenouveler = 0
    let employesExpires = 0
    for (const e of employes) {
      const statut = calculerStatut(e.soldeTickets)
      if (statut === "actif") employesActifs++
      else if (statut === "a_renouveler") employesARenouveler++
      else employesExpires++
    }

    const paiementsDuMois = paiements.filter((p) => p.date >= debutMois)
    const montantEncaisseDuMois = paiementsDuMois.reduce((acc, p) => acc + p.montant, 0)

    const repasDuJour = repas.filter((r) => r.date === ref).length

    const depensesDuMois = depenses
      .filter((d) => d.date >= debutMois)
      .reduce((acc, d) => acc + d.prixUnitaire * d.quantite, 0)

    // Montant encaissé par semaine (8 dernières semaines)
    const semaines: { debut: string; montant: number }[] = []
    for (let i = 7; i >= 0; i--) {
      const debut = formatISO(startOfWeek(addDays(parseISO(ref), -7 * i), { weekStartsOn: 1 }), {
        representation: "date",
      })
      semaines.push({ debut, montant: 0 })
    }
    for (const p of paiements) {
      const debutSemainePaiement = formatISO(startOfWeek(parseISO(p.date), { weekStartsOn: 1 }), {
        representation: "date",
      })
      const semaine = semaines.find((s) => s.debut === debutSemainePaiement)
      if (semaine) semaine.montant += p.montant
    }
    const montantParSemaine = semaines.map((s) => ({
      semaine: format(s.debut),
      montant: s.montant,
    }))

    // Nombre de repas par jour (7 derniers jours)
    const jours: { date: string; repas: number }[] = []
    for (let i = 6; i >= 0; i--) {
      jours.push({ date: formatISO(addDays(parseISO(ref), -i), { representation: "date" }), repas: 0 })
    }
    for (const r of repas) {
      const jour = jours.find((j) => j.date === r.date)
      if (jour) jour.repas += 1
    }
    const repasParJour = jours.map((j) => ({ jour: format(j.date), repas: j.repas }))

    const repartitionStatuts = [
      { statut: "Actif", valeur: employesActifs, couleur: "#10b981" },
      { statut: "À renouveler", valeur: employesARenouveler, couleur: "#f59e0b" },
      { statut: "Expiré", valeur: employesExpires, couleur: "#ef4444" },
    ]

    return {
      totalEmployes: employes.length,
      paiementsDuMois: paiementsDuMois.length,
      montantEncaisseDuMois,
      employesActifs,
      employesARenouveler,
      employesExpires,
      repasDuJour,
      depensesDuMois,
      montantParSemaine,
      repasParJour,
      repartitionStatuts,
    }
  }, [ref])
}

function format(dateIso: string): string {
  const d = parseISO(dateIso)
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })
}
