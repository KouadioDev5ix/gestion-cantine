import { addDays, formatISO, parseISO, startOfDay } from "date-fns"
import { PRIX_REPAS } from "./constants"
import type { Employe, StatutEmploye } from "./types"

export function today(): string {
  return formatISO(startOfDay(new Date()), { representation: "date" })
}

export function calculerJours(montant: number): number {
  return Math.floor(montant / PRIX_REPAS)
}

/**
 * Statut basé sur le solde réel de tickets (repas non consommés), pas sur une échéance
 * calendaire : un ticket payé n'est jamais perdu tant qu'il n'a pas été consommé via un
 * pointage de repas.
 */
export function calculerStatut(soldeTickets: number): StatutEmploye {
  if (soldeTickets <= 0) return "expire"
  if (soldeTickets <= 2) return "a_renouveler"
  return "actif"
}

/**
 * Prolonge la période payée d'un employé lors d'un paiement, en reprenant la règle du
 * cahier des charges : si la période précédente est déjà dépassée à la date du paiement,
 * la nouvelle période démarre à cette date ; sinon elle démarre à l'ancienne fin (les jours
 * déjà payés ne sont jamais perdus). Purement indicatif — n'a aucune influence sur le statut
 * ni sur le solde de tickets, qui restent uniquement pilotés par `soldeTickets`.
 */
export function calculerNouvelleDateFin(
  ancienneDateFin: string | null,
  jours: number,
  datePaiement: string
): string {
  const dateDebut = !ancienneDateFin || ancienneDateFin < datePaiement ? datePaiement : ancienneDateFin
  return formatISO(addDays(parseISO(dateDebut), jours), { representation: "date" })
}

export const STATUT_LABELS: Record<StatutEmploye, string> = {
  actif: "Actif",
  a_renouveler: "À renouveler",
  expire: "Expiré",
}

export const STATUT_COLORS: Record<StatutEmploye, string> = {
  actif: "bg-emerald-500",
  a_renouveler: "bg-amber-500",
  expire: "bg-red-500",
}

export function genererMatricule(employesExistants: Employe[]): string {
  const numeros = employesExistants
    .map((e) => parseInt(e.matricule.replace(/\D/g, ""), 10))
    .filter((n) => !isNaN(n))
  const prochain = (numeros.length ? Math.max(...numeros) : 0) + 1
  return `EMP-${String(prochain).padStart(4, "0")}`
}
