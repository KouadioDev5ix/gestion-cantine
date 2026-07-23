import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
import { STATUT_LABELS } from "./business"
import { formatDate } from "./format"
import type { Depense, EmployeAvecStatut } from "./types"
import type { PaiementAvecEmploye } from "@/hooks/usePaiements"

export type FormatExport = "xlsx" | "csv"

function telecharger(lignes: Record<string, unknown>[], nomFichier: string, format: FormatExport) {
  const feuille = XLSX.utils.json_to_sheet(lignes)

  if (format === "csv") {
    const csv = XLSX.utils.sheet_to_csv(feuille)
    saveAs(new Blob([csv], { type: "text/csv;charset=utf-8;" }), `${nomFichier}.csv`)
    return
  }

  const classeur = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(classeur, feuille, "Données")
  XLSX.writeFile(classeur, `${nomFichier}.xlsx`)
}

export function exporterEmployes(employes: EmployeAvecStatut[], format: FormatExport) {
  const lignes = employes.map((e) => ({
    Matricule: e.matricule,
    Prénom: e.prenom,
    Nom: e.nom,
    Service: e.service,
    Téléphone: e.telephone ?? "",
    "Date de création": formatDate(e.dateCreation),
    "Tickets restants": e.soldeTickets,
    "Dernier paiement": formatDate(e.dernierPaiement),
    "Fin estimée": formatDate(e.dateFinEstimee),
    Statut: STATUT_LABELS[e.statut],
  }))
  telecharger(lignes, "employes", format)
}

export function exporterPaiements(paiements: PaiementAvecEmploye[], format: FormatExport) {
  const lignes = paiements.map((p) => ({
    Date: formatDate(p.date),
    Matricule: p.employeMatricule,
    Employé: p.employeNom,
    Service: p.employeService,
    "Montant (FCFA)": p.montant,
    "Tickets achetés": p.jours,
    "Solde après paiement": p.soldeApres,
    "Fin estimée": formatDate(p.dateFinEstimee),
  }))
  telecharger(lignes, "paiements", format)
}

export function exporterRepas(
  repas: { date: string; employeNom: string; employeMatricule: string; employeService: string }[],
  format: FormatExport
) {
  const lignes = repas.map((r) => ({
    Date: formatDate(r.date),
    Matricule: r.employeMatricule,
    Employé: r.employeNom,
    Service: r.employeService,
  }))
  telecharger(lignes, "repas", format)
}

export function exporterDepenses(depenses: Depense[], format: FormatExport) {
  const lignes = depenses.map((d) => ({
    Article: d.nomArticle,
    Date: formatDate(d.date),
    "Prix unitaire (FCFA)": d.prixUnitaire,
    Quantité: d.quantite,
    "Total (FCFA)": d.prixUnitaire * d.quantite,
  }))
  telecharger(lignes, "depenses", format)
}

export function exporterRapportMensuel(
  data: {
    mois: string
    totalEmployes: number
    employesActifs: number
    employesARenouveler: number
    employesExpires: number
    nombrePaiements: number
    montantEncaisse: number
    nombreRepas: number
    depensesDuMois: number
  },
  format: FormatExport
) {
  const lignes = [
    { Indicateur: "Mois", Valeur: data.mois },
    { Indicateur: "Total employés", Valeur: data.totalEmployes },
    { Indicateur: "Employés actifs", Valeur: data.employesActifs },
    { Indicateur: "Employés à renouveler", Valeur: data.employesARenouveler },
    { Indicateur: "Employés expirés", Valeur: data.employesExpires },
    { Indicateur: "Nombre de paiements", Valeur: data.nombrePaiements },
    { Indicateur: "Montant encaissé (FCFA)", Valeur: data.montantEncaisse },
    { Indicateur: "Nombre de repas", Valeur: data.nombreRepas },
    { Indicateur: "Dépenses du mois (FCFA)", Valeur: data.depensesDuMois },
    { Indicateur: "Solde net (FCFA)", Valeur: data.montantEncaisse - data.depensesDuMois },
  ]
  telecharger(lignes, `rapport_mensuel_${data.mois}`, format)
}
