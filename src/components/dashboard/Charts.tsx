import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { DashboardData } from "@/hooks/useDashboard"

export function ChartMontantParSemaine({ data }: { data: DashboardData["montantParSemaine"] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Montant encaissé par semaine</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
            <XAxis dataKey="semaine" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis fontSize={12} tickLine={false} axisLine={false} width={40} />
            <Tooltip
              formatter={(value) => [`${new Intl.NumberFormat("fr-FR").format(Number(value))} FCFA`, "Montant"]}
              contentStyle={{ borderRadius: 8, fontSize: 12 }}
            />
            <Bar dataKey="montant" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function ChartRepas({ data }: { data: DashboardData["repasParJour"] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Nombre de repas (7 derniers jours)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
            <XAxis dataKey="jour" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis fontSize={12} tickLine={false} axisLine={false} width={30} allowDecimals={false} />
            <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="repas" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function ChartStatuts({ data }: { data: DashboardData["repartitionStatuts"] }) {
  const total = data.reduce((acc, d) => acc + d.valeur, 0)
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Répartition des statuts</CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
            Aucun employé enregistré
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data}
                dataKey="valeur"
                nameKey="statut"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={2}
              >
                {data.map((entry) => (
                  <Cell key={entry.statut} fill={entry.couleur} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        )}
        <div className="mt-2 flex justify-center gap-4 text-xs">
          {data.map((d) => (
            <div key={d.statut} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.couleur }} />
              <span className="text-muted-foreground">
                {d.statut} ({d.valeur})
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
