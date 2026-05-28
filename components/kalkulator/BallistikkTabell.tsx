"use client"
import type { BallistikkRad } from "@/lib/types"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

type Props = {
  rader: BallistikkRad[]
  nullpunkt: number
  visVind: boolean
}

export function BallistikkTabell({ rader, nullpunkt, visVind }: Props) {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <ScrollArea className="w-full overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground w-16">Dist.</th>
              <th className="px-3 py-2.5 text-right font-semibold text-muted-foreground">m/s</th>
              <th className="px-3 py-2.5 text-right font-semibold text-muted-foreground">Joule</th>
              <th className="px-3 py-2.5 text-right font-semibold text-muted-foreground">Drop mm</th>
              <th className="px-3 py-2.5 text-right font-semibold text-muted-foreground">MOA</th>
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
              const erFarlig = rad.energi < 800 // under 800J = for lite energi for storvilt
              return (
                <tr
                  key={rad.distanse}
                  className={cn(
                    "border-b border-border/50 transition-colors",
                    i % 2 === 0 ? "bg-transparent" : "bg-muted/20",
                    erNullpunkt && "bg-primary/10 border-primary/30"
                  )}
                >
                  <td className="px-3 py-2 font-medium text-foreground">
                    {rad.distanse}m
                    {erNullpunkt && (
                      <span className="ml-1 text-primary text-[10px] font-semibold">NP</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{rad.hastighet}</td>
                  <td className={cn(
                    "px-3 py-2 text-right tabular-nums",
                    erFarlig ? "text-orange-400" : "text-muted-foreground"
                  )}>
                    {rad.energi}
                  </td>
                  <td className={cn(
                    "px-3 py-2 text-right tabular-nums font-medium",
                    rad.drop > 50 ? "text-red-400" : rad.drop > 0 ? "text-orange-400" : "text-foreground"
                  )}>
                    {rad.drop > 0 ? "-" : "+"}{Math.abs(rad.drop)}
                  </td>
                  <td className={cn(
                    "px-3 py-2 text-right tabular-nums",
                    Math.abs(rad.dropMoa) > 5 ? "text-red-400/80" : "text-muted-foreground"
                  )}>
                    {rad.dropMoa > 0 ? "-" : "+"}{Math.abs(rad.dropMoa)}
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
      </ScrollArea>
    </div>
  )
}
