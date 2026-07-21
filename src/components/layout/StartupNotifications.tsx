import { useEffect, useRef } from "react"
import { toast } from "sonner"
import { useEmployesAvecStatut } from "@/hooks/useEmployes"

export function StartupNotifications() {
  const employes = useEmployesAvecStatut()
  const dejaAffiche = useRef(false)

  useEffect(() => {
    if (!employes || dejaAffiche.current) return
    dejaAffiche.current = true

    const aRenouveler = employes.filter((e) => e.statut === "a_renouveler").length
    const expires = employes.filter((e) => e.statut === "expire").length

    if (aRenouveler > 0) {
      toast.warning(
        `${aRenouveler} employé${aRenouveler > 1 ? "s" : ""} doi${aRenouveler > 1 ? "vent" : "t"} renouveler son ticket.`
      )
    }
    if (expires > 0) {
      toast.error(`${expires} employé${expires > 1 ? "s" : ""} ${expires > 1 ? "sont" : "est"} expiré${expires > 1 ? "s" : ""}.`)
    }
  }, [employes])

  return null
}
