import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"
import type { Depense } from "@/lib/types"

export interface DepenseAvecEmploye extends Depense {
  employeNom: string | null
}

export function useDepenses(): DepenseAvecEmploye[] | undefined {
  return useLiveQuery(async () => {
    const [depenses, employes] = await Promise.all([db.depenses.toArray(), db.employes.toArray()])
    const employesParId = new Map(employes.map((e) => [e.id, e]))
    return depenses
      .map((d) => {
        const employe = d.employeId !== null ? employesParId.get(d.employeId) : undefined
        return {
          ...d,
          employeNom: employe ? `${employe.prenom} ${employe.nom}` : null,
        }
      })
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [])
}
