import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"
import { calculerStatut } from "@/lib/business"
import { useAujourdhui } from "./useAujourdhui"
import type { Employe, EmployeAvecStatut } from "@/lib/types"

export function useListeEmployes(): Employe[] | undefined {
  return useLiveQuery(async () => {
    const employes = await db.employes.toArray()
    return employes.sort((a, b) => a.nom.localeCompare(b.nom))
  }, [])
}

export function useEmployesAvecStatut(): EmployeAvecStatut[] | undefined {
  const ref = useAujourdhui()

  return useLiveQuery(async () => {
    const [employes, repasAujourdhui, paiements] = await Promise.all([
      db.employes.toArray(),
      db.repas.where("date").equals(ref).toArray(),
      db.paiements.toArray(),
    ])
    const idsAyantMange = new Set(repasAujourdhui.map((r) => r.employeId))

    const dernierPaiementParEmploye = new Map<number, string>()
    for (const p of paiements) {
      const actuel = dernierPaiementParEmploye.get(p.employeId)
      if (!actuel || p.date > actuel) dernierPaiementParEmploye.set(p.employeId, p.date)
    }

    return employes
      .map((e) => ({
        ...e,
        statut: calculerStatut(e.soldeTickets),
        aMangeAujourdhui: idsAyantMange.has(e.id),
        dernierPaiement: dernierPaiementParEmploye.get(e.id) ?? null,
      }))
      .sort((a, b) => a.nom.localeCompare(b.nom))
  }, [ref])
}

export function useEmploye(id: number | undefined) {
  return useLiveQuery(async () => {
    if (id === undefined) return undefined
    return db.employes.get(id)
  }, [id])
}
