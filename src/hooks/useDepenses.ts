import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"
import type { Depense } from "@/lib/types"

export function useDepenses(): Depense[] | undefined {
  return useLiveQuery(async () => {
    const depenses = await db.depenses.toArray()
    return depenses.sort((a, b) => b.date.localeCompare(a.date))
  }, [])
}
