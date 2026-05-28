"use client"
import { useState } from "react"
import type { Rifle } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Props = {
  initial?: Partial<Rifle>
  onLagre: (data: Omit<Rifle, "id" | "opprettet">) => void
  onAvbryt: () => void
}

export function RifleSkjema({ initial, onLagre, onAvbryt }: Props) {
  const [form, setForm] = useState({
    navn: initial?.navn ?? "",
    kaliber: initial?.kaliber ?? "",
    munningshastighet: String(initial?.munningshastighet ?? ""),
    kipphøyde: String(initial?.kipphøyde ?? "38"),
    nullpunkt: String(initial?.nullpunkt ?? "100"),
  })

  const sett = (felt: string, verdi: string) => setForm((f) => ({ ...f, [felt]: verdi }))

  function håndterLagre() {
    if (!form.navn || !form.kaliber || !form.munningshastighet || !form.kipphøyde || !form.nullpunkt) return
    onLagre({
      navn: form.navn,
      kaliber: form.kaliber,
      munningshastighet: Number(form.munningshastighet),
      kipphøyde: Number(form.kipphøyde),
      nullpunkt: Number(form.nullpunkt),
    })
  }

  const felt: { id: string; label: string; enhet: string; type?: string; min?: number; max?: number; step?: number }[] = [
    { id: "navn", label: "Navn på rifle", enhet: "" },
    { id: "kaliber", label: "Kaliber", enhet: "(f.eks. 308 Win)" },
    { id: "munningshastighet", label: "Munningshastighet", enhet: "m/s", min: 200, max: 1200 },
    { id: "kipphøyde", label: "Kipphøyde (senter løp → optikk)", enhet: "mm", min: 20, max: 100 },
    { id: "nullpunkt", label: "Nullpunkt", enhet: "m", min: 25, max: 400 },
  ]

  return (
    <div className="space-y-4">
      {felt.map((f) => (
        <div key={f.id} className="space-y-1.5">
          <Label htmlFor={f.id} className="text-sm text-muted-foreground">
            {f.label} {f.enhet && <span className="text-xs opacity-60">{f.enhet}</span>}
          </Label>
          <Input
            id={f.id}
            type={f.min !== undefined ? "number" : "text"}
            min={f.min}
            max={f.max}
            step={f.step ?? 1}
            value={form[f.id as keyof typeof form]}
            onChange={(e) => sett(f.id, e.target.value)}
            className="bg-input border-border text-foreground"
            placeholder={f.enhet && f.min !== undefined ? String(f.min) : ""}
          />
        </div>
      ))}

      <div className="flex gap-2 pt-2">
        <Button onClick={håndterLagre} className="flex-1 bg-primary text-primary-foreground">
          Lagre
        </Button>
        <Button variant="outline" onClick={onAvbryt} className="flex-1">
          Avbryt
        </Button>
      </div>
    </div>
  )
}
