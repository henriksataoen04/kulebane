"use client"
import { useState } from "react"
import { useKulebaneStore } from "@/lib/store"
import { AmmoSkjema } from "@/components/ammo/AmmoSkjema"
import type { Ammo } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Layers, Plus, Trash2, Edit2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function AmmoSide() {
  const { ammo, leggTilAmmo, oppdaterAmmo, slettAmmo, aktivAmmoId, settAktivAmmo } = useKulebaneStore()
  const [visSkjema, setVisSkjema] = useState(false)
  const [redigerer, setRedigerer] = useState<Ammo | null>(null)

  function åpneNy() {
    setRedigerer(null)
    setVisSkjema(true)
  }

  function åpneRediger(a: Ammo) {
    setRedigerer(a)
    setVisSkjema(true)
  }

  function håndterLagre(data: Omit<Ammo, "id" | "opprettet">) {
    if (redigerer) {
      oppdaterAmmo(redigerer.id, data)
    } else {
      leggTilAmmo(data)
    }
    setVisSkjema(false)
    setRedigerer(null)
  }

  return (
    <div className="px-4 pt-6 pb-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold tracking-tight">Ammunition</h1>
        </div>
        <Button size="sm" onClick={åpneNy} className="gap-1.5">
          <Plus className="h-4 w-4" />
          Ny ammo
        </Button>
      </div>

      {ammo.length === 0 ? (
        <Card className="border-dashed border-border/50 bg-card/30">
          <CardContent className="p-10 text-center">
            <Layers className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-1">Ingen ammo ennå</p>
            <p className="text-xs text-muted-foreground/60">Legg til din første ammo-profil</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {ammo.map((a) => {
            const erAktiv = a.id === aktivAmmoId
            return (
              <Card
                key={a.id}
                className={`border transition-colors ${erAktiv ? "border-primary/50 bg-primary/5" : "border-border bg-card"}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => settAktivAmmo(erAktiv ? null : a.id)}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <p className="font-semibold text-sm">{a.navn}</p>
                        {erAktiv && (
                          <Badge className="text-[10px] py-0 px-1.5 bg-primary/20 text-primary border-primary/30">
                            Aktiv
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-border text-muted-foreground">
                          {a.type}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span>{a.vekt} gram</span>
                        <span>BC (G1): {a.bc}</span>
                        <span className="text-muted-foreground/60 text-[11px]">
                          ≈ {Math.round(a.vekt * 15.432)} grain
                        </span>
                      </div>

                      {/* BC visuell indikator */}
                      <div className="mt-2.5 flex items-center gap-2">
                        <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${Math.min((a.bc / 0.7) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground w-16">
                          BC {a.bc < 0.3 ? "lav" : a.bc < 0.5 ? "middels" : "høy"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => åpneRediger(a)}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => slettAmmo(a.id)}
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
            <DialogTitle>{redigerer ? "Rediger ammo" : "Ny ammo"}</DialogTitle>
          </DialogHeader>
          <AmmoSkjema
            initial={redigerer ?? undefined}
            onLagre={håndterLagre}
            onAvbryt={() => setVisSkjema(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
