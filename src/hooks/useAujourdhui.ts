import { useEffect, useState } from "react"
import { today } from "@/lib/business"

/**
 * Date du jour (ISO) qui se met à jour automatiquement à minuit, même si aucune
 * écriture n'a lieu dans la base — sans quoi une page laissée ouverte la nuit
 * continuerait d'afficher "aujourd'hui" comme la veille (repas déjà pointés,
 * statuts, etc. resteraient figés sur l'ancienne date).
 */
export function useAujourdhui(): string {
  const [date, setDate] = useState(today())

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>

    function planifierProchainMinuit() {
      const maintenant = new Date()
      const prochainMinuit = new Date(
        maintenant.getFullYear(),
        maintenant.getMonth(),
        maintenant.getDate() + 1,
        0,
        0,
        1
      )
      const delai = prochainMinuit.getTime() - maintenant.getTime()
      timeoutId = setTimeout(() => {
        setDate(today())
        planifierProchainMinuit()
      }, delai)
    }

    planifierProchainMinuit()
    return () => clearTimeout(timeoutId)
  }, [])

  return date
}
