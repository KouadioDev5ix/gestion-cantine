import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"
import type { Paiement } from "@/lib/types"

export interface PaiementAvecEmploye extends Paiement {
  employeNom: string
  employeMatricule: string
  employeService: string
}

export function usePaiementsAvecEmployes(): PaiementAvecEmploye[] | undefined {
  return useLiveQuery(async () => {
    const [paiements, employes] = await Promise.all([db.paiements.toArray(), db.employes.toArray()])
    const employesParId = new Map(employes.map((e) => [e.id, e]))
    return paiements
      .map((p) => {
        const employe = employesParId.get(p.employeId)
        return {
          ...p,
          employeNom: employe ? `${employe.prenom} ${employe.nom}` : "Employé supprimé",
          employeMatricule: employe?.matricule ?? "—",
          employeService: employe?.service ?? "—",
        }
      })
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [])
}
