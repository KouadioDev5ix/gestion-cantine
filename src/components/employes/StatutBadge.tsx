import { Badge } from "@/components/ui/badge"
import { STATUT_LABELS } from "@/lib/business"
import type { StatutEmploye } from "@/lib/types"
import { cn } from "@/lib/utils"

const classes: Record<StatutEmploye, string> = {
  actif: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  a_renouveler: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
  expire: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30",
}

export function StatutBadge({ statut }: { statut: StatutEmploye }) {
  return (
    <Badge variant="outline" className={cn("gap-1.5 font-medium", classes[statut])}>
      <span
        className={cn("h-1.5 w-1.5 rounded-full", {
          "bg-emerald-500": statut === "actif",
          "bg-amber-500": statut === "a_renouveler",
          "bg-red-500": statut === "expire",
        })}
      />
      {STATUT_LABELS[statut]}
    </Badge>
  )
}
