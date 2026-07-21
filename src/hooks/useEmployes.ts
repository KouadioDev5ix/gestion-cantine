import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"
import { calculerStatut, dateFinEstimee } from "@/lib/business"
import { useAujourdhui } from "./useAujourdhui"
import type { EmployeAvecStatut } from "@/lib/types"

export function useEmployesAvecStatut(): EmployeAvecStatut[] | undefined {
  const ref = useAujourdhui()

  return useLiveQuery(async () => {
    const [employes, repasAujourdhui] = await Promise.all([
      db.employes.toArray(),
      db.repas.where("date").equals(ref).toArray(),
    ])
    const idsAyantMange = new Set(repasAujourdhui.map((r) => r.employeId))

    return employes
      .map((e) => ({
        ...e,
        statut: calculerStatut(e.soldeTickets),
        dateFinEstimee: dateFinEstimee(e.soldeTickets, ref),
        aMangeAujourdhui: idsAyantMange.has(e.id),
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
