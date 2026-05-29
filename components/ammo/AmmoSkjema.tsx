"use client"
import { useState } from "react"
import type { Ammo } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Info } from "lucide-react"

type Props = {
  initial?: Partial<Ammo>
  onLagre: (data: Omit<Ammo, "id" | "opprettet">) => void
  onAvbryt: () => void
}

const AMMO_TYPER = ["SP", "HP", "FMJ", "SST", "BT", "BTHP", "Bonded", "Polymer tip"]

const BC_EKSEMPLER = [
  { kaliber: ".222 Rem", bc: "0.20–0.27" },
  { kaliber: ".243 Win", bc: "0.28–0.45" },
  { kaliber: ".308 Win", bc: "0.38–0.52" },
  { kaliber: "6.5 Creed", bc: "0.45–0.65" },
  { kaliber: ".30-06", bc: "0.38–0.52" },
  { kaliber: "8×57 IS", bc: "0.32–0.45" },
]

type Feil = { vekt?: string; bc?: string; navn?: string }

export function AmmoSkjema({ initial, onLagre, onAvbryt }: Props) {
  const [form, setForm] = useState({
    navn: initial?.navn ?? "",
    vekt: String(initial?.vekt ?? ""),
    bc: String(initial?.bc ?? ""),
    type: initial?.type ?? "SP",
  })
  const [feil, setFeil] = useState<Feil>({})
  const [visBcHjelp, setVisBcHjelp] = useState(false)

  const sett = (felt: string, verdi: string) => {
    setForm((f) => ({ ...f, [felt]: verdi }))
    setFeil((e) => ({ ...e, [felt]: undefined }))
  }

  function valider(): boolean {
    const nyeFeil: Feil = {}
    if (!form.navn.trim()) nyeFeil.navn = "Navn er påkrevd"
    const vekt = Number(form.vekt)
    if (!form.vekt || isNaN(vekt) || vekt < 1 || vekt > 30)
      nyeFeil.vekt = "Vekt må være mellom 1 og 30 gram"
    const bc = Number(form.bc)
    if (!form.bc || isNaN(bc) || bc < 0.05 || bc > 1.2)
      nyeFeil.bc = "BC (G1) må være mellom 0.05 og 1.2"
    setFeil(nyeFeil)
    return Object.keys(nyeFeil).length === 0
  }

  function håndterLagre() {
    if (!valider()) return
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
        {feil.navn && <p className="text-xs text-destructive">{feil.navn}</p>}
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
            max={30}
            step={0.1}
            value={form.vekt}
            onChange={(e) => sett("vekt", e.target.value)}
            className="bg-input border-border"
            placeholder="10.7"
          />
          {feil.vekt && <p className="text-xs text-destructive">{feil.vekt}</p>}
          <p className="text-[10px] text-muted-foreground/60">
            {form.vekt && !isNaN(Number(form.vekt))
              ? `≈ ${Math.round(Number(form.vekt) * 15.432)} grain`
              : "1 gram = 15.4 grain"}
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-1">
            <Label htmlFor="bc" className="text-sm text-muted-foreground">
              BC <span className="text-xs opacity-60">G1</span>
            </Label>
            <button
              type="button"
              onClick={() => setVisBcHjelp((v) => !v)}
              className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              <Info className="h-3.5 w-3.5" />
            </button>
          </div>
          <Input
            id="bc"
            type="number"
            min={0.05}
            max={1.2}
            step={0.001}
            value={form.bc}
            onChange={(e) => sett("bc", e.target.value)}
            className="bg-input border-border"
            placeholder="0.430"
          />
          {feil.bc && <p className="text-xs text-destructive">{feil.bc}</p>}
        </div>
      </div>

      {/* BC-hjelp */}
      {visBcHjelp && (
        <div className="rounded-lg bg-muted/40 border border-border p-3 space-y-2">
          <p className="text-xs font-medium text-foreground">Hva er G1 BC?</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Ballistisk koeffisient — måler kulets evne til å beholde farten mot luftmotstanden.
            Høy BC = flatt bane, mindre vinddrift. Finn verdien i ammopakkens datablad eller produsentens nettside.
          </p>
          <div className="grid grid-cols-2 gap-1 pt-1">
            {BC_EKSEMPLER.map(({ kaliber, bc }) => (
              <p key={kaliber} className="text-[10px] text-muted-foreground">
                <span className="text-foreground/70">{kaliber}:</span> {bc}
              </p>
            ))}
          </div>
        </div>
      )}

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
