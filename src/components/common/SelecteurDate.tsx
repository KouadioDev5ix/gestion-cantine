import DatePicker from "react-date-picker"
import { CalendarDays, X } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface SelecteurDateProps {
  id?: string
  value?: string | null // ISO yyyy-MM-dd
  onChange: (value: string) => void
  maxDate?: Date
  minDate?: Date
  className?: string
}

export function SelecteurDate({ id, value, onChange, maxDate, minDate, className }: SelecteurDateProps) {
  return (
    <DatePicker
      id={id}
      className={cn(className)}
      value={value || null}
      onChange={(v) => onChange(v instanceof Date ? format(v, "yyyy-MM-dd") : "")}
      maxDate={maxDate}
      minDate={minDate}
      format="dd/MM/y"
      dayPlaceholder="jj"
      monthPlaceholder="mm"
      yearPlaceholder="aaaa"
      locale="fr-FR"
      clearIcon={<X className="h-3.5 w-3.5" />}
      calendarIcon={<CalendarDays className="h-3.5 w-3.5" />}
    />
  )
}
