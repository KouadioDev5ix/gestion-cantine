export interface Employe {
  id: number
  matricule: string
  nom: string
  prenom: string
  service: string
  telephone?: string
  dateCreation: string // ISO date
  soldeTickets: number // nombre de repas restants (1 ticket = 1 repas), consommé uniquement quand le repas est pointé
  dateFinEstimee: string | null // fin de période payée, prolongée à chaque paiement (voir calculerNouvelleDateFin) — purement indicative, ne pilote jamais le statut
}

export interface Paiement {
  id: number
  employeId: number
  date: string // ISO date du paiement
  montant: number
  jours: number // tickets achetés lors de ce paiement
  soldeApres: number // solde de tickets de l'employé juste après ce paiement
  dateFinEstimee: string // projection (date + solde) au moment du paiement, à titre indicatif
}

export interface Repas {
  id: number
  employeId: number
  date: string // ISO date (jour du repas)
}

export interface Depense {
  id: number
  nomArticle: string // catégorie choisie, ou texte libre si "Autre"
  date: string // ISO date
  prixUnitaire: number
  quantite: number
}

export type StatutEmploye = "actif" | "a_renouveler" | "expire"

export interface EmployeAvecStatut extends Employe {
  statut: StatutEmploye
  aMangeAujourdhui: boolean
  dernierPaiement: string | null // date du paiement le plus récent de l'employé
}
