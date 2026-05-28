"use client"
import { useState } from "react"
import { useKulebaneStore } from "@/lib/store"
import { RifleSkjema } from "@/components/rifler/RifleSkjema"
import type { Rifle } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { GanttChartSquare, Plus, Trash2, Edit2, Crosshair } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function RiflerSide() {
  const { rifler, leggTilRifle, oppdaterRifle, slettRifle, aktivRifleId, settAktivRifle } = useKulebaneStore()
  const [visSkjema, setVisSkjema] = useState(false)
  const [redigerer, setRedigerer] = useState<Rifle | null>(null)

  function åpneNy() {
    setRedigerer(null)
    setVisSkjema(true)
  }

  function åpneRediger(rifle: Rifle) {
    setRedigerer(rifle)
    setVisSkjema(true)
  }

  function håndterLagre(data: Omit<Rifle, "id" | "opprettet">) {
    if (redigerer) {
      oppdaterRifle(redigerer.id, data)
    } else {
      leggTilRifle(data)
    }
    setVisSkjema(false)
    setRedigerer(null)
  }

  return (
    <div className="px-4 pt-6 pb-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GanttChartSquare className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold tracking-tight">Rifler</h1>
        </div>
        <Button size="sm" onClick={åpneNy} className="gap-1.5">
          <Plus className="h-4 w-4" />
          Ny rifle
        </Button>
      </div>

      {rifler.length === 0 ? (
        <Card className="border-dashed border-border/50 bg-card/30">
          <CardContent className="p-10 text-center">
            <GanttChartSquare className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-1">Ingen rifler ennå</p>
            <p className="text-xs text-muted-foreground/60">Legg til din første rifle for å komme i gang</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {rifler.map((rifle) => {
            const erAktiv = rifle.id === aktivRifleId
            return (
              <Card
                key={rifle.id}
                className={`border transition-colors ${erAktiv ? "border-primary/50 bg-primary/5" : "border-border bg-card"}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => settAktivRifle(erAktiv ? null : rifle.id)}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <p className="font-semibold text-sm">{rifle.navn}</p>
                        {erAktiv && (
                          <Badge className="text-[10px] py-0 px-1.5 bg-primary/20 text-primary border-primary/30">
                            Aktiv
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Crosshair className="h-3 w-3" /> {rifle.kaliber}
                        </span>
                        <span>{rifle.munningshastighet} m/s</span>
                        <span>NP {rifle.nullpunkt}m</span>
                        <span>Kipp {rifle.kipphøyde}mm</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => åpneRediger(rifle)}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => slettRifle(rifle.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={visSkjema} onOpenChange={setVisSkjema}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>{redigerer ? "Rediger rifle" : "Ny rifle"}</DialogTitle>
          </DialogHeader>
          <RifleSkjema
            initial={redigerer ?? undefined}
            onLagre={håndterLagre}
            onAvbryt={() => setVisSkjema(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
