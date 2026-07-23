import Dexie, { type EntityTable } from "dexie"
import { addDays, differenceInCalendarDays, formatISO, parseISO } from "date-fns"
import { today } from "./business"
import type { Depense, Employe, Paiement, Repas } from "./types"

const db = new Dexie("CantineDB") as Dexie & {
  employes: EntityTable<Employe, "id">
  paiements: EntityTable<Paiement, "id">
  repas: EntityTable<Repas, "id">
  depenses: EntityTable<Depense, "id">
}

db.version(1).stores({
  employes: "++id, &matricule, nom, prenom, service, dateFin, dateCreation",
  paiements: "++id, employeId, date",
  repas: "++id, employeId, date, [employeId+date]",
})

// v2 : passage d'un abonnement calendaire (dateFin) à un solde réel de tickets de repas,
// pour ne plus perdre les jours payés mais non consommés.
db.version(2)
  .stores({
    employes: "++id, &matricule, nom, prenom, service, dateCreation",
    paiements: "++id, employeId, date",
    repas: "++id, employeId, date, [employeId+date]",
  })
  .upgrade(async (tx) => {
    const ref = today()
    await tx
      .table("employes")
      .toCollection()
      .modify((employe: Employe & { dateFin?: string | null }) => {
        const restants = employe.dateFin ? differenceInCalendarDays(parseISO(employe.dateFin), parseISO(ref)) : 0
        employe.soldeTickets = restants > 0 ? restants : 0
        delete employe.dateFin
      })
    await tx
      .table("paiements")
      .toCollection()
      .modify((paiement: Paiement & { ancienneDateFin?: string | null; nouvelleDateFin?: string }) => {
        paiement.soldeApres = paiement.jours
        paiement.dateFinEstimee = paiement.nouvelleDateFin ?? ref
        delete paiement.ancienneDateFin
        delete paiement.nouvelleDateFin
      })
  })

// v3 : ajout du suivi des dépenses (achats de fournitures pour la cantine)
db.version(3).stores({
  employes: "++id, &matricule, nom, prenom, service, dateCreation",
  paiements: "++id, employeId, date",
  repas: "++id, employeId, date, [employeId+date]",
  depenses: "++id, nomArticle, date",
})

// v4 : réintroduction d'une "fin estimée" stockée et prolongée à chaque paiement (au lieu
// d'être recalculée en direct depuis aujourd'hui), pour qu'elle reste cohérente entre la
// modale de paiement et le tableau des employés. Le statut continue de dépendre uniquement
// de soldeTickets — cette date reste purement indicative.
db.version(4)
  .stores({
    employes: "++id, &matricule, nom, prenom, service, dateCreation",
    paiements: "++id, employeId, date",
    repas: "++id, employeId, date, [employeId+date]",
    depenses: "++id, nomArticle, date",
  })
  .upgrade(async (tx) => {
    const ref = today()
    await tx
      .table("employes")
      .toCollection()
      .modify((employe: Employe) => {
        employe.dateFinEstimee =
          employe.soldeTickets > 0
            ? formatISO(addDays(parseISO(ref), employe.soldeTickets), { representation: "date" })
            : null
      })
  })

export { db }
