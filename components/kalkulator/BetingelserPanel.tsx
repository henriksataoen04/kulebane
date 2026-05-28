"use client"
import { useKulebaneStore } from "@/lib/store"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Wind, Thermometer, Mountain, Gauge } from "lucide-react"

const VIND_RETNINGER = [
  { grad: 0, label: "←" }, { grad: 45, label: "↙" },
  { grad: 90, label: "↓" }, { grad: 135, label: "↘" },
  { grad: 180, label: "→" }, { grad: 225, label: "↗" },
  { grad: 270, label: "↑" }, { grad: 315, label: "↖" },
]

export function BetingelserPanel() {
  const { betingelser, settBetingelser } = useKulebaneStore()

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4 space-y-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Betingelser</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Thermometer className="h-3.5 w-3.5" /> Temperatur (°C)
            </Label>
            <Input
              type="number"
              min={-40}
              max={50}
              value={betingelser.temperatur}
              onChange={(e) => settBetingelser({ temperatur: Number(e.target.value) })}
              className="bg-input border-border h-9 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Gauge className="h-3.5 w-3.5" /> Lufttrykk (hPa)
            </Label>
            <Input
              type="number"
              min={850}
              max={1100}
              value={betingelser.lufttrykk}
              onChange={(e) => settBetingelser({ lufttrykk: Number(e.target.value) })}
              className="bg-input border-border h-9 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Mountain className="h-3.5 w-3.5" /> Høyde moh. (m)
            </Label>
            <Input
              type="number"
              min={0}
              max={5000}
              value={betingelser.høyde}
              onChange={(e) => settBetingelser({ høyde: Number(e.target.value) })}
              className="bg-input border-border h-9 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Wind className="h-3.5 w-3.5" /> Vind (m/s)
            </Label>
            <Input
              type="number"
              min={0}
              max={30}
              step={0.5}
              value={betingelser.vindhastighet}
              onChange={(e) => settBetingelser({ vindhastighet: Number(e.target.value) })}
              className="bg-input border-border h-9 text-sm"
            />
          </div>
        </div>

        {betingelser.vindhastighet > 0 && (
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Vindretning (sett fra skytter)</Label>
            <div className="flex gap-1.5 flex-wrap">
              {VIND_RETNINGER.map(({ grad, label }) => {
                const vinkelLabels: Record<number, string> = {
                  0: "Mot (0°)", 45: "Diag (45°)", 90: "Fra høyre (90°)",
                  135: "Diag (135°)", 180: "Med (180°)", 225: "Diag (225°)",
                  270: "Fra venstre (270°)", 315: "Diag (315°)"
                }
                const aktiv = betingelser.vindretning === grad
                return (
                  <button
                    key={grad}
                    onClick={() => settBetingelser({ vindretning: grad })}
                    title={vinkelLabels[grad]}
                    className={`w-9 h-9 rounded-lg text-base flex items-center justify-center transition-colors border ${
                      aktiv
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
