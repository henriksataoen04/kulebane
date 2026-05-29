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

type Feil = Record<string, string | undefined>

const FELT = [
  {
    id: "navn", label: "Navn på rifle", enhet: "", placeholder: "f.eks. Sako 85 Stainless",
    min: undefined, max: undefined, step: undefined, hint: undefined,
  },
  {
    id: "kaliber", label: "Kaliber", enhet: "", placeholder: "f.eks. .308 Win",
    min: undefined, max: undefined, step: undefined, hint: undefined,
  },
  {
    id: "munningshastighet", label: "Munningshastighet", enhet: "m/s",
    placeholder: "800", min: 200, max: 1200, step: 1,
    hint: "Typisk: pistolkaliber 300–450, rifle 700–1000, magnum 900–1100 m/s",
  },
  {
    id: "kipphøyde", label: "Kipphøyde (senter løp → senter optikk)", enhet: "mm",
    placeholder: "38", min: 15, max: 100, step: 1,
    hint: "Standard montasje: 32–45mm. Høy montasje / AR-er: 50–65mm",
  },
  {
    id: "nullpunkt", label: "Nullpunkt", enhet: "m",
    placeholder: "100", min: 25, max: 500, step: 25,
    hint: "Norsk jakt: 100–150m. Langtrekksskyting: 200–300m",
  },
]

export function RifleSkjema({ initial, onLagre, onAvbryt }: Props) {
  const [form, setForm] = useState({
    navn: initial?.navn ?? "",
    kaliber: initial?.kaliber ?? "",
    munningshastighet: String(initial?.munningshastighet ?? ""),
    kipphøyde: String(initial?.kipphøyde ?? "38"),
    nullpunkt: String(initial?.nullpunkt ?? "100"),
  })
  const [feil, setFeil] = useState<Feil>({})

  const sett = (felt: string, verdi: string) => {
    setForm((f) => ({ ...f, [felt]: verdi }))
    setFeil((e) => ({ ...e, [felt]: undefined }))
  }

  function valider(): boolean {
    const nyeFeil: Feil = {}
    if (!form.navn.trim()) nyeFeil.navn = "Navn er påkrevd"
    if (!form.kaliber.trim()) nyeFeil.kaliber = "Kaliber er påkrevd"

    const mv = Number(form.munningshastighet)
    if (!form.munningshastighet || isNaN(mv) || mv < 200 || mv > 1200)
      nyeFeil.munningshastighet = "Munningshastighet må være 200–1200 m/s"

    const kipp = Number(form.kipphøyde)
    if (!form.kipphøyde || isNaN(kipp) || kipp < 15 || kipp > 100)
      nyeFeil.kipphøyde = "Kipphøyde må være 15–100 mm"

    const np = Number(form.nullpunkt)
    if (!form.nullpunkt || isNaN(np) || np < 25 || np > 500)
      nyeFeil.nullpunkt = "Nullpunkt må være 25–500 m"

    setFeil(nyeFeil)
    return Object.keys(nyeFeil).length === 0
  }

  function håndterLagre() {
    if (!valider()) return
    onLagre({
      navn: form.navn,
      kaliber: form.kaliber,
      munningshastighet: Number(form.munningshastighet),
      kipphøyde: Number(form.kipphøyde),
      nullpunkt: Number(form.nullpunkt),
    })
  }

  return (
    <div className="space-y-4">
      {FELT.map((f) => (
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
            className={`bg-input border-border text-foreground ${feil[f.id] ? "border-destructive" : ""}`}
            placeholder={f.placeholder}
          />
          {feil[f.id] && <p className="text-xs text-destructive">{feil[f.id]}</p>}
          {f.hint && !feil[f.id] && (
            <p className="text-[10px] text-muted-foreground/60">{f.hint}</p>
          )}
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
