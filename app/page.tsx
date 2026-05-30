"use client"
import { useMemo, useState } from "react"
import { useKulebaneStore } from "@/lib/store"
import { beregnBallistikk } from "@/lib/ballistics"
import { TrajektoriGraf } from "@/components/kalkulator/TrajektoriGraf"
import { BallistikkTabell } from "@/components/kalkulator/BallistikkTabell"
import { BetingelserPanel } from "@/components/kalkulator/BetingelserPanel"
import { DopeCard } from "@/components/kalkulator/DopeCard"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Crosshair, ChevronDown, Wind, FileText } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const INTERVALL_VALG = [25, 50, 100]
const MAX_DIST_VALG = [300, 500, 700, 1000]

function PillVelger<T extends number>({
  valg, aktiv, onVelg, suffix = "",
}: { valg: T[]; aktiv: T; onVelg: (v: T) => void; suffix?: string }) {
  return (
    <div className="flex gap-1">
      {valg.map((v) => (
        <button
          key={v}
          onClick={() => onVelg(v)}
          className={cn(
            "px-2.5 py-1 rounded-md text-xs font-medium transition-colors border",
            aktiv === v
              ? "bg-primary/20 border-primary/50 text-primary"
              : "border-border text-muted-foreground hover:border-border/80 hover:text-foreground"
          )}
        >
          {v}{suffix}
        </button>
      ))}
    </div>
  )
}

export default function KalkulatorSide() {
  const { rifler, ammo, betingelser, aktivRifleId, aktivAmmoId, settAktivRifle, settAktivAmmo } = useKulebaneStore()
  const [visBetingelser, setVisBetingelser] = useState(false)
  const [intervall, setIntervall] = useState<25 | 50 | 100>(50)
  const [maxDist, setMaxDist] = useState<300 | 500 | 700 | 1000>(1000)
  const [visDopeCard, setVisDopeCard] = useState(false)

  const aktivRifle = rifler.find((r) => r.id === aktivRifleId)
  const aktivAmmo = ammo.find((a) => a.id === aktivAmmoId)

  const resultat = useMemo(() => {
    if (!aktivRifle || !aktivAmmo) return null
    try {
      return beregnBallistikk(aktivRifle, aktivAmmo, betingelser, maxDist, intervall)
    } catch {
      return null
    }
  }, [aktivRifle, aktivAmmo, betingelser, maxDist, intervall])

  // Reference distance for summary cards: 3× nullpunkt, rounded to nearest interval
  const refDist = aktivRifle
    ? Math.min(
        Math.round((aktivRifle.nullpunkt * 3) / intervall) * intervall,
        maxDist
      )
    : 300
  const refRad = resultat?.rader.find((r) => r.distanse === refDist)
    ?? resultat?.rader[Math.floor((resultat.rader.length ?? 0) / 2)]

  // Max effective range (energy ≥ 800 J)
  const maxEffektiv = resultat
    ? ([...resultat.rader].reverse().find((r) => r.energi >= 800)?.distanse ?? 0)
    : 0

  // Show Coriolis column when max lateral drift exceeds 5 mm
  const visKoriolis = resultat
    ? resultat.rader.some((r) => Math.abs(r.koriolisAvdrift) >= 5)
    : false

  return (
    <div className="px-4 pt-6 pb-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crosshair className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold tracking-tight">Kulebane</h1>
        </div>
        {resultat && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">PBR {resultat.maxPBR}m</Badge>
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1.5 text-xs px-2.5"
              onClick={() => setVisDopeCard(true)}
            >
              <FileText className="h-3.5 w-3.5" />
              Dope
            </Button>
          </div>
        )}
      </div>

      {/* Velg rifle + ammo */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground px-1">Rifle</p>
          {rifler.length === 0 ? (
            <Link href="/rifler">
              <Card className="border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer">
                <CardContent className="p-3 text-center">
                  <p className="text-xs text-primary">+ Legg til rifle</p>
                </CardContent>
              </Card>
            </Link>
          ) : (
            <select
              value={aktivRifleId ?? ""}
              onChange={(e) => settAktivRifle(e.target.value || null)}
              className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Velg rifle…</option>
              {rifler.map((r) => (
                <option key={r.id} value={r.id}>{r.navn}</option>
              ))}
            </select>
          )}
        </div>

        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground px-1">Ammo</p>
          {ammo.length === 0 ? (
            <Link href="/ammo">
              <Card className="border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer">
                <CardContent className="p-3 text-center">
                  <p className="text-xs text-primary">+ Legg til ammo</p>
                </CardContent>
              </Card>
            </Link>
          ) : (
            <select
              value={aktivAmmoId ?? ""}
              onChange={(e) => settAktivAmmo(e.target.value || null)}
              className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Velg ammo…</option>
              {ammo.map((a) => (
                <option key={a.id} value={a.id}>{a.navn}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Info-chips */}
      {aktivRifle && aktivAmmo && (
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline" className="text-xs border-primary/40 text-primary/80">{aktivRifle.kaliber}</Badge>
          <Badge variant="outline" className="text-xs border-border text-muted-foreground">NP {aktivRifle.nullpunkt}m</Badge>
          <Badge variant="outline" className="text-xs border-border text-muted-foreground">{aktivAmmo.vekt}g · BC {aktivAmmo.bc}</Badge>
          <Badge variant="outline" className="text-xs border-border text-muted-foreground">{aktivRifle.munningshastighet} m/s</Badge>
        </div>
      )}

      {/* Betingelser toggle */}
      <button
        onClick={() => setVisBetingelser((v) => !v)}
        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
      >
        <Wind className="h-3.5 w-3.5" />
        <span>{betingelser.temperatur}°C · {betingelser.lufttrykk} hPa · {betingelser.vindhastighet} m/s vind</span>
        <ChevronDown className={`h-3.5 w-3.5 ml-auto transition-transform ${visBetingelser ? "rotate-180" : ""}`} />
      </button>

      {visBetingelser && <BetingelserPanel />}

      {/* Tabell-innstillinger */}
      {resultat && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Intervall:</span>
            <PillVelger valg={INTERVALL_VALG as (25 | 50 | 100)[]} aktiv={intervall} onVelg={setIntervall} suffix="m" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Maks:</span>
            <PillVelger valg={MAX_DIST_VALG as (300 | 500 | 700 | 1000)[]} aktiv={maxDist} onVelg={setMaxDist} suffix="m" />
          </div>
        </div>
      )}

      {/* Resultater */}
      {!aktivRifle || !aktivAmmo ? (
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-8 text-center">
            <Crosshair className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Velg rifle og ammo for å beregne kulebane</p>
          </CardContent>
        </Card>
      ) : resultat ? (
        <div className="space-y-4">
          {/* Sammendrag */}
          <div className="grid grid-cols-3 gap-2">
            <Card className="border-border bg-card">
              <CardContent className="p-3 text-center">
                <p className="text-[10px] text-muted-foreground mb-1">Point Blank</p>
                <p className="text-xl font-bold text-primary">{resultat.maxPBR}m</p>
                <p className="text-[10px] text-muted-foreground">±100mm sone</p>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardContent className="p-3 text-center">
                <p className="text-[10px] text-muted-foreground mb-1">{refDist}m drop</p>
                <p className="text-xl font-bold text-foreground">
                  {Math.abs(refRad?.drop ?? 0)}
                  <span className="text-xs font-normal ml-0.5">mm</span>
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {refRad?.dropMoa ?? 0} MOA ↑
                </p>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardContent className="p-3 text-center">
                <p className="text-[10px] text-muted-foreground mb-1">Maks (800J)</p>
                <p className={cn("text-xl font-bold", maxEffektiv > 0 ? "text-foreground" : "text-muted-foreground")}>
                  {maxEffektiv > 0 ? `${maxEffektiv}m` : "−"}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {refRad?.energi ?? 0}J ved {refDist}m
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Graf */}
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Kulebane (mm fra siktepunkt)
              </p>
              <TrajektoriGraf rader={resultat.rader} nullpunkt={aktivRifle.nullpunkt} />
            </CardContent>
          </Card>

          {/* Tabell */}
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Ballistikk-tabell
              </p>
              <BallistikkTabell
                rader={resultat.rader}
                nullpunkt={aktivRifle.nullpunkt}
                kipphøyde={aktivRifle.kipphøyde}
                visVind={betingelser.vindhastighet > 0}
                visKoriolis={visKoriolis}
              />
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="border-destructive/30 bg-destructive/10">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-destructive">Feil under beregning. Sjekk verdiene.</p>
          </CardContent>
        </Card>
      )}

      {/* Dope Card Dialog */}
      <Dialog open={visDopeCard} onOpenChange={setVisDopeCard}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Dope Card
            </DialogTitle>
          </DialogHeader>
          {resultat && <DopeCard resultat={resultat} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
