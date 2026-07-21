import { format, parseISO } from "date-fns"
import { fr } from "date-fns/locale"

export function formatMontant(montant: number): string {
  return new Intl.NumberFormat("fr-FR").format(montant) + " FCFA"
}

export function formatDate(dateIso: string | null, motif = "dd MMM yyyy"): string {
  if (!dateIso) return "—"
  return format(parseISO(dateIso), motif, { locale: fr })
}
