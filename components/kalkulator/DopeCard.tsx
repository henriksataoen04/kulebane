"use client"
import type { BeregningsResultat } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Printer, Crosshair } from "lucide-react"

type Props = { resultat: BeregningsResultat }

const VIND_RETNING_TEKST: Record<number, string> = {
  0: "motvind", 45: "skrå bak-venstre", 90: "fra høyre",
  135: "skrå foran-høyre", 180: "medvind", 225: "skrå foran-venstre",
  270: "fra venstre", 315: "skrå bak-høyre",
}

export function DopeCard({ resultat }: Props) {
  const { rifle, ammo, betingelser, rader, maxPBR } = resultat

  // Show rows at 100m intervals (50m if max range ≤ 300m)
  const maksDist = Math.max(...rader.map((r) => r.distanse))
  const dopeIntervall = maksDist <= 300 ? 50 : 100
  const dopeRader = rader.filter(
    (r) => r.distanse > 0 && r.distanse % dopeIntervall === 0
  )

  const maxEffektiv =
    [...rader].reverse().find((r) => r.energi >= 800)?.distanse ?? 0
  const hasVind = betingelser.vindhastighet > 0

  function skrivUt() {
    window.print()
  }

  const dato = new Date().toLocaleDateString("no-NO", {
    day: "2-digit", month: "2-digit", year: "numeric",
  })

  return (
    <div className="space-y-3">
      {/* Card — gets printed */}
      <div className="dope-card-print rounded-xl border border-border bg-[#0a1510] p-4 font-mono space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border/60 pb-2">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <Crosshair className="h-3 w-3 text-primary" />
              <span className="text-[10px] text-primary font-bold uppercase tracking-widest">Dope Card</span>
            </div>
            <p className="text-sm font-bold text-foreground">{rifle.navn}</p>
            <p className="text-xs text-muted-foreground">{rifle.kaliber} · {ammo.navn}</p>
          </div>
          <div className="text-right text-[10px] text-muted-foreground/60">
            <p>{dato}</p>
            <p>kulebane.app</p>
          </div>
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-3 gap-2 text-[11px]">
          {[
            ["Kulvekt", `${ammo.vekt}g (BC ${ammo.bc})`],
            ["MV", `${rifle.munningshastighet} m/s`],
            ["Nullpunkt", `${rifle.nullpunkt}m`],
            ["PBR ±100mm", `${maxPBR}m`],
            ["Maks (800J)", `${maxEffektiv}m`],
            ["Betingelser", `${betingelser.temperatur}°C · ${betingelser.lufttrykk}hPa`],
          ].map(([key, val]) => (
            <div key={key}>
              <p className="text-muted-foreground/60 text-[9px] uppercase tracking-wide">{key}</p>
              <p className="text-foreground font-medium">{val}</p>
            </div>
          ))}
        </div>

        {hasVind && (
          <p className="text-[10px] text-muted-foreground border border-border/40 rounded px-2 py-1">
            Vind: {betingelser.vindhastighet} m/s · {VIND_RETNING_TEKST[betingelser.vindretning] ?? `${betingelser.vindretning}°`}
          </p>
        )}

        {/* Dope table */}
        <table className="w-full text-[11px]">
          <thead>
            <tr className="border-b border-border/60 text-muted-foreground">
              <th className="text-left py-1 font-medium">Dist</th>
              <th className="text-right py-1 font-medium">Drop</th>
              <th className="text-right py-1 font-medium">MOA ↑</th>
              <th className="text-right py-1 font-medium">Joule</th>
              <th className="text-right py-1 font-medium">m/s</th>
              {hasVind && <th className="text-right py-1 font-medium">Vind</th>}
            </tr>
          </thead>
          <tbody>
            {dopeRader.map((r) => {
              const erNp = r.distanse === rifle.nullpunkt
              const lavEnergi = r.energi < 800
              return (
                <tr
                  key={r.distanse}
                  className={`border-b border-border/20 ${erNp ? "bg-primary/10" : ""} ${lavEnergi ? "text-orange-400/80" : ""}`}
                >
                  <td className="py-1.5 font-bold text-foreground">
                    {r.distanse}m{erNp && <span className="text-primary text-[9px] ml-1">NP</span>}
                  </td>
                  <td className="text-right tabular-nums">
                    {r.drop > 0 ? `+${r.drop}` : `${r.drop}`}mm
                  </td>
                  <td className="text-right tabular-nums font-bold text-foreground">
                    {r.dropMoa > 0 ? `+${r.dropMoa}` : `${r.dropMoa}`}
                  </td>
                  <td className="text-right tabular-nums">
                    {r.energi}{lavEnergi ? "⚠" : ""}
                  </td>
                  <td className="text-right tabular-nums">{r.hastighet}</td>
                  {hasVind && (
                    <td className="text-right tabular-nums">
                      {r.vindDrift > 0 ? "+" : ""}{r.vindDrift}mm
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Footer hint */}
        <p className="text-[9px] text-muted-foreground/40 text-center pt-1">
          MOA ↑ = antall klikk opp (1 MOA ≈ {Math.round(rifle.nullpunkt * 2.909 / 10) / 10}cm ved {rifle.nullpunkt}m)
        </p>
      </div>

      <Button onClick={skrivUt} variant="outline" className="w-full gap-2 text-sm">
        <Printer className="h-4 w-4" />
        Skriv ut / Lagre som PDF
      </Button>
      <p className="text-[10px] text-muted-foreground/50 text-center">
        På mobil: ta et skjermbilde for å lagre kortet
      </p>
    </div>
  )
}
