import { db } from "./db"
import { calculerJours, dateFinEstimee, today } from "./business"
import type { Depense, Employe } from "./types"

export async function creerEmploye(data: Omit<Employe, "id" | "dateCreation" | "soldeTickets">): Promise<number> {
  return db.employes.add({
    ...data,
    dateCreation: today(),
    soldeTickets: 0,
  })
}

export async function modifierEmploye(id: number, data: Partial<Omit<Employe, "id">>): Promise<void> {
  await db.employes.update(id, data)
}

export async function supprimerEmploye(id: number): Promise<void> {
  await db.transaction("rw", db.employes, db.paiements, db.repas, async () => {
    await db.employes.delete(id)
    await db.paiements.where("employeId").equals(id).delete()
    await db.repas.where("employeId").equals(id).delete()
  })
}

export async function enregistrerPaiement(employeId: number, montant: number, date: string = today()): Promise<void> {
  await db.transaction("rw", db.employes, db.paiements, async () => {
    const employe = await db.employes.get(employeId)
    if (!employe) throw new Error("Employé introuvable")

    const jours = calculerJours(montant)
    const soldeApres = employe.soldeTickets + jours

    await db.paiements.add({
      employeId,
      date,
      montant,
      jours,
      soldeApres,
      dateFinEstimee: dateFinEstimee(soldeApres, date) ?? date,
    })

    await db.employes.update(employeId, { soldeTickets: soldeApres })
  })
}

/**
 * Pointe (ou annule) le repas du jour pour un employé. Un ticket n'est décompté que
 * lorsqu'un repas est réellement pris — un jour sans repas ne fait perdre aucun ticket.
 */
export async function basculerRepas(employeId: number): Promise<"enregistre" | "annule"> {
  return db.transaction("rw", db.employes, db.repas, async () => {
    const date = today()
    const existant = await db.repas.where("[employeId+date]").equals([employeId, date]).first()

    const employe = await db.employes.get(employeId)
    if (!employe) throw new Error("Employé introuvable")

    if (existant) {
      await db.repas.delete(existant.id)
      await db.employes.update(employeId, { soldeTickets: employe.soldeTickets + 1 })
      return "annule"
    }

    if (employe.soldeTickets <= 0) throw new Error("Aucun ticket disponible pour cet employé")

    await db.repas.add({ employeId, date })
    await db.employes.update(employeId, { soldeTickets: employe.soldeTickets - 1 })
    return "enregistre"
  })
}

export async function creerDepense(data: Omit<Depense, "id">): Promise<number> {
  return db.depenses.add(data)
}

export async function modifierDepense(id: number, data: Partial<Omit<Depense, "id">>): Promise<void> {
  await db.depenses.update(id, data)
}

export async function supprimerDepense(id: number): Promise<void> {
  await db.depenses.delete(id)
}
