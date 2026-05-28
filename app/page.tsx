"use client"
import { useMemo, useState } from "react"
import { useKulebaneStore } from "@/lib/store"
import { beregnBallistikk } from "@/lib/ballistics"
import { TrajektoriGraf } from "@/components/kalkulator/TrajektoriGraf"
import { BallistikkTabell } from "@/components/kalkulator/BallistikkTabell"
import { BetingelserPanel } from "@/components/kalkulator/BetingelserPanel"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Crosshair, ChevronDown, Wind } from "lucide-react"
import Link from "next/link"

export default function KalkulatorSide() {
  const { rifler, ammo, betingelser, aktivRifleId, aktivAmmoId, settAktivRifle, settAktivAmmo } = useKulebaneStore()
  const [visBetingelser, setVisBetingelser] = useState(false)

  const aktivRifle = rifler.find((r) => r.id === aktivRifleId)
  const aktivAmmo = ammo.find((a) => a.id === aktivAmmoId)

  const resultat = useMemo(() => {
    if (!aktivRifle || !aktivAmmo) return null
    try {
      return beregnBallistikk(aktivRifle, aktivAmmo, betingelser)
    } catch {
      return null
    }
  }, [aktivRifle, aktivAmmo, betingelser])

  return (
    <div className="px-4 pt-6 pb-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crosshair className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold tracking-tight">Kulebane</h1>
        </div>
        {resultat && (
          <Badge variant="secondary" className="text-xs">
            PBR {resultat.maxPBR}m
          </Badge>
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

      {/* Info-chips for aktiv profil */}
      {aktivRifle && aktivAmmo && (
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline" className="text-xs border-primary/40 text-primary/80">
            {aktivRifle.kaliber}
          </Badge>
          <Badge variant="outline" className="text-xs border-border text-muted-foreground">
            NP {aktivRifle.nullpunkt}m
          </Badge>
          <Badge variant="outline" className="text-xs border-border text-muted-foreground">
            {aktivAmmo.vekt}g · BC {aktivAmmo.bc}
          </Badge>
          <Badge variant="outline" className="text-xs border-border text-muted-foreground">
            {aktivRifle.munningshastighet} m/s
          </Badge>
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
          {/* PBR og sammendrag */}
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
                <p className="text-[10px] text-muted-foreground mb-1">500m drop</p>
                <p className="text-xl font-bold text-foreground">
                  {Math.abs(resultat.rader.find(r => r.distanse === 500)?.drop ?? 0)}
                  <span className="text-xs font-normal ml-0.5">mm</span>
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {Math.abs(resultat.rader.find(r => r.distanse === 500)?.dropMoa ?? 0)} MOA
                </p>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardContent className="p-3 text-center">
                <p className="text-[10px] text-muted-foreground mb-1">500m energi</p>
                <p className="text-xl font-bold text-foreground">
                  {resultat.rader.find(r => r.distanse === 500)?.energi ?? 0}
                  <span className="text-xs font-normal ml-0.5">J</span>
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {resultat.rader.find(r => r.distanse === 500)?.hastighet ?? 0} m/s
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Graf */}
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Kulebane (drop i mm)
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
                visVind={betingelser.vindhastighet > 0}
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
    </div>
  )
}
