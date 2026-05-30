"use client"
import { useKulebaneStore } from "@/lib/store"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Wind, Thermometer, Mountain, Gauge, Globe } from "lucide-react"
import { cn } from "@/lib/utils"

const VIND_RETNINGER = [
  { grad: 0, label: "←", tittel: "Motvind" },
  { grad: 45, label: "↙", tittel: "Skrå venstre-mot" },
  { grad: 90, label: "↓", tittel: "Fra høyre" },
  { grad: 135, label: "↘", tittel: "Skrå høyre-med" },
  { grad: 180, label: "→", tittel: "Medvind" },
  { grad: 225, label: "↗", tittel: "Skrå venstre-med" },
  { grad: 270, label: "↑", tittel: "Fra venstre" },
  { grad: 315, label: "↖", tittel: "Skrå høyre-mot" },
]

const SKYTERETNINGER = [
  { grad: 0, label: "N" }, { grad: 45, label: "NØ" },
  { grad: 90, label: "Ø" }, { grad: 135, label: "SØ" },
  { grad: 180, label: "S" }, { grad: 225, label: "SV" },
  { grad: 270, label: "V" }, { grad: 315, label: "NV" },
]

const BREDDEGRAD_PRESETS = [
  { grad: 58, label: "Vest-Agder" },
  { grad: 60, label: "Oslo" },
  { grad: 63, label: "Trondheim" },
  { grad: 67, label: "Bodø" },
  { grad: 70, label: "Tromsø" },
]

export function BetingelserPanel() {
  const { betingelser, settBetingelser } = useKulebaneStore()

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4 space-y-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Betingelser</p>

        {/* Atmosfære */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Thermometer className="h-3.5 w-3.5" /> Temperatur (°C)
            </Label>
            <Input type="number" min={-40} max={50}
              value={betingelser.temperatur}
              onChange={(e) => settBetingelser({ temperatur: Number(e.target.value) })}
              className="bg-input border-border h-9 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Gauge className="h-3.5 w-3.5" /> Lufttrykk (hPa)
            </Label>
            <Input type="number" min={850} max={1100}
              value={betingelser.lufttrykk}
              onChange={(e) => settBetingelser({ lufttrykk: Number(e.target.value) })}
              className="bg-input border-border h-9 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Mountain className="h-3.5 w-3.5" /> Høyde moh. (m)
            </Label>
            <Input type="number" min={0} max={5000}
              value={betingelser.høyde}
              onChange={(e) => settBetingelser({ høyde: Number(e.target.value) })}
              className="bg-input border-border h-9 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Wind className="h-3.5 w-3.5" /> Vind (m/s)
            </Label>
            <Input type="number" min={0} max={30} step={0.5}
              value={betingelser.vindhastighet}
              onChange={(e) => settBetingelser({ vindhastighet: Number(e.target.value) })}
              className="bg-input border-border h-9 text-sm" />
          </div>
        </div>

        {/* Vindretning */}
        {betingelser.vindhastighet > 0 && (
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Vindretning (sett fra skytter)</Label>
            <div className="flex gap-1.5 flex-wrap">
              {VIND_RETNINGER.map(({ grad, label, tittel }) => (
                <button key={grad} title={tittel}
                  onClick={() => settBetingelser({ vindretning: grad })}
                  className={cn(
                    "w-9 h-9 rounded-lg text-base flex items-center justify-center transition-colors border",
                    betingelser.vindretning === grad
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  )}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Koriolis ───────────────────────────────────────────── */}
        <div className="border-t border-border/50 pt-3 space-y-3">
          <div className="flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5 text-primary/70" />
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Jordens rotasjon (Koriolis)
            </p>
          </div>
          <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
            På nordlig halvkule drifter kulen alltid til <strong className="text-foreground/50">høyre</strong>.
            Eötvös-leddet påvirker høyde basert på skyteretning. Merkbart fra ~400m.
          </p>

          {/* Breddegrad */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Breddegrad — {betingelser.breddegrad}°N
            </Label>
            <input
              type="range"
              min={55} max={72} step={0.5}
              value={betingelser.breddegrad}
              onChange={(e) => settBetingelser({ breddegrad: Number(e.target.value) })}
              className="w-full accent-primary"
            />
            <div className="flex gap-1.5 flex-wrap">
              {BREDDEGRAD_PRESETS.map(({ grad, label }) => (
                <button key={grad}
                  onClick={() => settBetingelser({ breddegrad: grad })}
                  className={cn(
                    "px-2 py-0.5 rounded text-[10px] border transition-colors",
                    betingelser.breddegrad === grad
                      ? "bg-primary/20 border-primary/50 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  )}>
                  {label} ({grad}°)
                </button>
              ))}
            </div>
          </div>

          {/* Skyteretning */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Skyteretning (Eötvös) —&nbsp;
              <span className="text-foreground/70">
                {SKYTERETNINGER.find(s => s.grad === betingelser.skyteretning)?.label
                  ?? `${betingelser.skyteretning}°`}
              </span>
            </Label>
            <div className="flex gap-1.5 flex-wrap">
              {SKYTERETNINGER.map(({ grad, label }) => (
                <button key={grad}
                  onClick={() => settBetingelser({ skyteretning: grad })}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs border transition-colors",
                    betingelser.skyteretning === grad
                      ? "bg-primary/20 border-primary/50 text-primary font-medium"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  )}>
                  {label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground/50">
              Øst = kulen treffer litt høyere · Vest = litt lavere · Nord/Sør = ingen Eötvös
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
