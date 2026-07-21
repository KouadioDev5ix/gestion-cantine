import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"
import { useAujourdhui } from "./useAujourdhui"

export interface RepasAvecEmploye {
  id?: number
  date: string
  employeId: number
  employeNom: string
  employeMatricule: string
  employeService: string
}

export function useRepasAvecEmployes(): RepasAvecEmploye[] | undefined {
  return useLiveQuery(async () => {
    const [repas, employes] = await Promise.all([db.repas.toArray(), db.employes.toArray()])
    const employesParId = new Map(employes.map((e) => [e.id, e]))
    return repas
      .map((r) => {
        const employe = employesParId.get(r.employeId)
        return {
          ...r,
          employeNom: employe ? `${employe.prenom} ${employe.nom}` : "Employé supprimé",
          employeMatricule: employe?.matricule ?? "—",
          employeService: employe?.service ?? "—",
        }
      })
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [])
}

export function useRepasDuJour(): number | undefined {
  const ref = useAujourdhui()
  return useLiveQuery(async () => {
    return db.repas.where("date").equals(ref).count()
  }, [ref])
}
