"use client"
import { useState } from "react"
import type { Ammo } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Props = {
  initial?: Partial<Ammo>
  onLagre: (data: Omit<Ammo, "id" | "opprettet">) => void
  onAvbryt: () => void
}

const AMMO_TYPER = ["SP", "HP", "FMJ", "SST", "BT", "BTHP", "Bonded", "Polymer tip"]

export function AmmoSkjema({ initial, onLagre, onAvbryt }: Props) {
  const [form, setForm] = useState({
    navn: initial?.navn ?? "",
    vekt: String(initial?.vekt ?? ""),
    bc: String(initial?.bc ?? ""),
    type: initial?.type ?? "SP",
  })

  const sett = (felt: string, verdi: string) => setForm((f) => ({ ...f, [felt]: verdi }))

  function håndterLagre() {
    if (!form.navn || !form.vekt || !form.bc || !form.type) return
    onLagre({
      navn: form.navn,
      vekt: Number(form.vekt),
      bc: Number(form.bc),
      type: form.type,
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="navn" className="text-sm text-muted-foreground">Navn på ammo</Label>
        <Input
          id="navn"
          value={form.navn}
          onChange={(e) => sett("navn", e.target.value)}
          className="bg-input border-border"
          placeholder="f.eks. Norma Kalahari 10,7g"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="vekt" className="text-sm text-muted-foreground">
            Kulvekt <span className="text-xs opacity-60">gram</span>
          </Label>
          <Input
            id="vekt"
            type="number"
            min={1}
            max={50}
            step={0.1}
            value={form.vekt}
            onChange={(e) => sett("vekt", e.target.value)}
            className="bg-input border-border"
            placeholder="10.7"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bc" className="text-sm text-muted-foreground">
            BC <span className="text-xs opacity-60">G1</span>
          </Label>
          <Input
            id="bc"
            type="number"
            min={0.1}
            max={1.2}
            step={0.001}
            value={form.bc}
            onChange={(e) => sett("bc", e.target.value)}
            className="bg-input border-border"
            placeholder="0.430"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm text-muted-foreground">Kultype</Label>
        <div className="flex flex-wrap gap-2">
          {AMMO_TYPER.map((type) => (
            <button
              key={type}
              onClick={() => sett("type", type)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                form.type === type
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

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
