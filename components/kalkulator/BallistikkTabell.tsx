"use client"
import type { BallistikkRad } from "@/lib/types"
import { cn } from "@/lib/utils"

type Props = {
  rader: BallistikkRad[]
  nullpunkt: number
  kipphøyde: number
  visVind: boolean
}

function dropFarge(drop: number) {
  if (drop < -500) return "text-red-400"
  if (drop < -150) return "text-orange-400"
  return "text-foreground"
}

function energiFarge(energi: number) {
  if (energi < 800) return "text-red-400"
  if (energi < 1500) return "text-orange-400"
  return "text-muted-foreground"
}

export function BallistikkTabell({ rader, nullpunkt, kipphøyde, visVind }: Props) {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground">Dist.</th>
              <th className="px-3 py-2.5 text-right font-semibold text-muted-foreground">m/s</th>
              <th className="px-3 py-2.5 text-right font-semibold text-muted-foreground">Joule</th>
              <th className="px-3 py-2.5 text-right font-semibold text-muted-foreground">Drop mm</th>
              <th className="px-3 py-2.5 text-right font-semibold text-muted-foreground">MOA ↑</th>
              <th className="px-3 py-2.5 text-right font-semibold text-muted-foreground">Tid s</th>
              {visVind && (
                <>
                  <th className="px-3 py-2.5 text-right font-semibold text-muted-foreground">Vind mm</th>
                  <th className="px-3 py-2.5 text-right font-semibold text-muted-foreground">V.MOA</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {rader.map((rad, i) => {
              const erNullpunkt = rad.distanse === nullpunkt
              const erMunning = rad.distanse === 0
              return (
                <tr
                  key={rad.distanse}
                  className={cn(
                    "border-b border-border/50 transition-colors",
                    i % 2 === 0 ? "bg-transparent" : "bg-muted/20",
                    erNullpunkt && "bg-primary/10 border-primary/30",
                    erMunning && "opacity-60"
                  )}
                >
                  <td className="px-3 py-2 font-medium text-foreground whitespace-nowrap">
                    {rad.distanse}m
                    {erNullpunkt && <span className="ml-1 text-primary text-[10px] font-semibold">NP</span>}
                    {erMunning && <span className="ml-1 text-muted-foreground text-[10px]">løp</span>}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{rad.hastighet}</td>
                  <td className={cn("px-3 py-2 text-right tabular-nums", energiFarge(rad.energi))}>
                    {rad.energi}
                    {rad.energi < 800 && <span className="ml-0.5 text-[9px]">⚠</span>}
                  </td>
                  <td className={cn("px-3 py-2 text-right tabular-nums font-medium", dropFarge(rad.drop))}>
                    {erMunning
                      ? <span className="text-muted-foreground text-[10px]">−{kipphøyde}mm</span>
                      : (rad.drop > 0 ? `+${rad.drop}` : `${rad.drop}`)}
                  </td>
                  <td className={cn(
                    "px-3 py-2 text-right tabular-nums",
                    rad.dropMoa > 8 ? "text-red-400/80" : rad.dropMoa > 4 ? "text-orange-400/80" : "text-muted-foreground"
                  )}>
                    {rad.dropMoa > 0 ? `+${rad.dropMoa}` : `${rad.dropMoa}`}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{rad.tid}</td>
                  {visVind && (
                    <>
                      <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                        {rad.vindDrift > 0 ? "+" : ""}{rad.vindDrift}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                        {rad.vindDriftMoa > 0 ? "+" : ""}{rad.vindDriftMoa}
                      </td>
                    </>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Forklaring */}
      <div className="px-3 py-2 border-t border-border/50 flex flex-wrap gap-x-4 gap-y-1">
        <p className="text-[10px] text-muted-foreground/60">
          <span className="text-foreground/50">Drop mm</span> = under(−)/over(+) siktepunktet
        </p>
        <p className="text-[10px] text-muted-foreground/60">
          <span className="text-foreground/50">MOA ↑</span> = klikk opp på kikkerten
        </p>
        {rader.some(r => r.energi < 800) && (
          <p className="text-[10px] text-orange-400/80">
            ⚠ Under 800J — for lite energi for storvilt
          </p>
        )}
        {rader.some(r => r.energi < 1500 && r.energi >= 800) && (
          <p className="text-[10px] text-orange-400/60">
            Oransje Joule = under 1500J (grense for elg/hjort)
          </p>
        )}
      </div>
    </div>
  )
}
