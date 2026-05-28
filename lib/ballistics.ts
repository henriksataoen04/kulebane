import type { Rifle, Ammo, Betingelser, BallistikkRad, BeregningsResultat } from "./types"

// G1 drag table: [mach, Cd]
const G1_DRAG_TABLE: [number, number][] = [
  [0.0, 0.2629], [0.05, 0.2558], [0.1, 0.2487], [0.15, 0.2413],
  [0.2, 0.2335], [0.25, 0.2252], [0.3, 0.2162], [0.35, 0.2065],
  [0.4, 0.1965], [0.45, 0.1866], [0.5, 0.1771], [0.55, 0.1682],
  [0.6, 0.1598], [0.65, 0.1520], [0.7, 0.1447], [0.725, 0.1417],
  [0.75, 0.1388], [0.775, 0.1360], [0.8, 0.1334], [0.825, 0.1308],
  [0.85, 0.1282], [0.875, 0.1255], [0.9, 0.1228], [0.925, 0.1196],
  [0.95, 0.1168], [0.975, 0.1130], [1.0, 0.1096], [1.025, 0.1056],
  [1.05, 0.1019], [1.075, 0.0980], [1.1, 0.0943], [1.15, 0.0880],
  [1.2, 0.0827], [1.25, 0.0782], [1.3, 0.0745], [1.35, 0.0714],
  [1.4, 0.0688], [1.45, 0.0665], [1.5, 0.0645], [1.55, 0.0627],
  [1.6, 0.0611], [1.65, 0.0596], [1.7, 0.0582], [1.75, 0.0569],
  [1.8, 0.0557], [1.85, 0.0545], [1.9, 0.0533], [1.95, 0.0522],
  [2.0, 0.0511], [2.05, 0.0501], [2.1, 0.0491], [2.15, 0.0481],
  [2.2, 0.0471], [2.25, 0.0462], [2.3, 0.0452], [2.35, 0.0443],
  [2.4, 0.0434], [2.45, 0.0426], [2.5, 0.0418], [2.6, 0.0402],
  [2.7, 0.0386], [2.8, 0.0371], [2.9, 0.0358], [3.0, 0.0345],
  [3.1, 0.0333], [3.2, 0.0321], [3.3, 0.0310], [3.4, 0.0300],
  [3.5, 0.0291], [3.6, 0.0282], [3.7, 0.0273], [3.8, 0.0265],
  [3.9, 0.0257], [4.0, 0.0250], [4.2, 0.0236], [4.4, 0.0223],
  [4.6, 0.0211], [4.8, 0.0200], [5.0, 0.0190],
]

function interpolerDragKoeff(mach: number): number {
  const tabell = G1_DRAG_TABLE
  if (mach <= tabell[0][0]) return tabell[0][1]
  if (mach >= tabell[tabell.length - 1][0]) return tabell[tabell.length - 1][1]
  for (let i = 0; i < tabell.length - 1; i++) {
    if (mach >= tabell[i][0] && mach < tabell[i + 1][0]) {
      const t = (mach - tabell[i][0]) / (tabell[i + 1][0] - tabell[i][0])
      return tabell[i][1] + t * (tabell[i + 1][1] - tabell[i][1])
    }
  }
  return tabell[tabell.length - 1][1]
}

function lufttetthet(tempC: number, trykkHpa: number): number {
  const T = tempC + 273.15
  const P = trykkHpa * 100 // Pa
  return P / (287.058 * T)
}

function lydhastighet(tempC: number): number {
  return 331.3 * Math.sqrt(1 + tempC / 273.15)
}

// 1 MOA i mm ved gitt distanse
function moaImmVedDistanse(distanseM: number): number {
  return distanseM * Math.tan((1 / 60) * (Math.PI / 180)) * 1000
}

// Runge-Kutta 4th order steg
function rk4Steg(
  x: number, y: number, vx: number, vy: number,
  vz: number, // sidevind-komponent
  dt: number,
  rho: number, bc: number, mach1: number,
  g: number
): { x: number; y: number; vx: number; vy: number; vz: number } {
  function derivater(vx_: number, vy_: number, vz_: number) {
    const v = Math.sqrt(vx_ * vx_ + vy_ * vy_)
    const mach = v / mach1
    const Cd = interpolerDragKoeff(mach)
    // F_drag / m = rho * v * Cd / (2 * BC)  [BC i kg/m²]
    const drag = (rho * v * Cd) / (2 * bc)
    return {
      ax: -drag * vx_,
      ay: -g - drag * vy_,
      az: -drag * vz_,
    }
  }

  const k1 = derivater(vx, vy, vz)
  const k2 = derivater(vx + k1.ax * dt / 2, vy + k1.ay * dt / 2, vz + k1.az * dt / 2)
  const k3 = derivater(vx + k2.ax * dt / 2, vy + k2.ay * dt / 2, vz + k2.az * dt / 2)
  const k4 = derivater(vx + k3.ax * dt, vy + k3.ay * dt, vz + k3.az * dt)

  return {
    x: x + vx * dt,
    y: y + vy * dt,
    vx: vx + (k1.ax + 2 * k2.ax + 2 * k3.ax + k4.ax) * dt / 6,
    vy: vy + (k1.ay + 2 * k2.ay + 2 * k3.ay + k4.ay) * dt / 6,
    vz: vz + (k1.az + 2 * k2.az + 2 * k3.az + k4.az) * dt / 6,
  }
}

export function beregnBallistikk(
  rifle: Rifle,
  ammo: Ammo,
  betingelser: Betingelser,
  maxDistanse = 1000,
  intervall = 50
): BeregningsResultat {
  const g = 9.80665
  const rho = lufttetthet(betingelser.temperatur, betingelser.lufttrykk)
  const lyd = lydhastighet(betingelser.temperatur)

  // BC fra G1-verdi (dimensjonsfri → kg/m²)
  // Standard referansetetthet for G1: 1.2250 kg/m³, referansekaliberfaktor = 1
  // BC_SI = BC_G1 * (rho_standard / rho) — korrigert for lufttetthet
  const rhoStandard = 1.2250
  const bcSI = (ammo.bc * rhoStandard) / rho // effektiv BC i kg/m²
  // Merk: i SI-systemet for G1-modellen er BC = m/(d² * i), men vi bruker tabellen direkte

  // Vindkomponent perpendikulær på skuddretningen (sidevind)
  const vindRad = (betingelser.vindretning * Math.PI) / 180
  const sidevind = betingelser.vindhastighet * Math.sin(vindRad) // m/s, positiv = høyre

  // Nullstillingsvinkel: finn vinkelen slik at banen treffer nullpunkt
  const nullpunktM = rifle.nullpunkt
  const kipphøydeM = rifle.kipphøyde / 1000

  // Iterativt finn nullpunktsvinkel
  function simuleringY(vinkel: number, distanseMål: number): number {
    let x = 0, y = -kipphøydeM
    let vx = rifle.munningshastighet * Math.cos(vinkel)
    let vy = rifle.munningshastighet * Math.sin(vinkel)
    let vz = -sidevind
    const dt = 0.001
    let t = 0
    while (x < distanseMål && t < 5) {
      const res = rk4Steg(x, y, vx, vy, vz, dt, rho, ammo.bc, lyd, g)
      x = res.x; y = res.y; vx = res.vx; vy = res.vy; vz = res.vz
      t += dt
    }
    return y
  }

  // Biseksjon for å finne nullpunktsvinkel
  let vinkelMin = -0.05, vinkelMax = 0.05
  for (let i = 0; i < 50; i++) {
    const vinkelMid = (vinkelMin + vinkelMax) / 2
    if (simuleringY(vinkelMid, nullpunktM) > 0) {
      vinkelMax = vinkelMid
    } else {
      vinkelMin = vinkelMid
    }
  }
  const nullpunktsVinkel = (vinkelMin + vinkelMax) / 2

  // Full simulering
  const rader: BallistikkRad[] = []
  let x = 0, y = -kipphøydeM
  let vx = rifle.munningshastighet * Math.cos(nullpunktsVinkel)
  let vy = rifle.munningshastighet * Math.sin(nullpunktsVinkel)
  let vz = -sidevind
  let z = 0 // sidevind-drift
  const dt = 0.001
  let t = 0
  let nesteDistanse = 0

  const distanser: number[] = []
  for (let d = 0; d <= maxDistanse; d += intervall) distanser.push(d)
  if (distanser[distanser.length - 1] !== maxDistanse) distanser.push(maxDistanse)

  let idx = 0

  while (idx < distanser.length && t < 10) {
    const målDistanse = distanser[idx]

    if (x >= målDistanse) {
      const v = Math.sqrt(vx * vx + vy * vy)
      const energi = 0.5 * ammo.vekt * v * v
      const dropMm = y * 1000 // meter → mm (negativ = under nulllinje)
      const moaStr = moaImmVedDistanse(målDistanse)
      const dropMoa = moaStr > 0 ? -dropMm / moaStr : 0
      const vindDriftMm = z * 1000
      const vindDriftMoa = moaStr > 0 ? vindDriftMm / moaStr : 0

      rader.push({
        distanse: Math.round(målDistanse),
        hastighet: Math.round(v),
        energi: Math.round(energi),
        drop: Math.round(dropMm),
        dropMoa: Math.round(dropMoa * 10) / 10,
        tid: Math.round(t * 1000) / 1000,
        vindDrift: Math.round(vindDriftMm),
        vindDriftMoa: Math.round(vindDriftMoa * 10) / 10,
      })
      idx++
      if (idx >= distanser.length) break
    }

    const res = rk4Steg(x, y, vx, vy, vz, dt, rho, ammo.bc, lyd, g)
    x = res.x
    y = res.y
    vx = res.vx
    vy = res.vy
    const vz_new = res.vz
    z += (sidevind - (-vz)) * dt // akkumulert sidevind-drift
    // mer presist: z_drift = integral av sidevind * (1 - Vwind/v_bullet) — forenklet her
    z = z // bruk RK4 for z også
    // faktisk sidevind-drift fra RK4:
    vz = vz_new
    t += dt
  }

  // Beregn faktisk sidevind-drift med separate simulering
  const raderMedVind = beregnVindDrift(rader, rifle, ammo, betingelser, rho, lyd, g, distanser)

  // Point blank range: finne max distanse der drop er innenfor ±vitalt sone (±100mm)
  const pbr = finnPBR(rifle, ammo, betingelser, rho, lyd, g, nullpunktsVinkel, kipphøydeM, 100)

  return {
    rader: raderMedVind,
    maxPBR: pbr,
    rifle,
    ammo,
    betingelser,
  }
}

function beregnVindDrift(
  rader: BallistikkRad[],
  rifle: Rifle,
  ammo: Ammo,
  betingelser: Betingelser,
  rho: number,
  lyd: number,
  g: number,
  distanser: number[]
): BallistikkRad[] {
  const vindRad = (betingelser.vindretning * Math.PI) / 180
  const sidevind = betingelser.vindhastighet * Math.sin(vindRad)
  const kipphøydeM = rifle.kipphøyde / 1000

  // Simuler med og uten vind, forskjellen er vinddrfit
  function simMedVind(vindV: number): Map<number, number> {
    let x = 0, y = -kipphøydeM, vx = 0, vy = 0, z = 0, vz = -vindV, t = 0
    const vinkelMin2 = -0.05, vinkelMax2 = 0.05
    // Bruk samme nullpunktsvinkel (vinkelMin2+vinkelMax2)/2 — enkel approx
    const vinkel = Math.atan2(rifle.nullpunkt * g / 2, rifle.munningshastighet) / rifle.munningshastighet
    vx = rifle.munningshastighet * Math.cos(rifle.nullpunkt > 0 ? 0.002 : 0)
    vy = rifle.munningshastighet * Math.sin(rifle.nullpunkt > 0 ? 0.002 : 0)
    vz = -vindV

    const dt = 0.001
    const resultat = new Map<number, number>()
    let idx = 0
    while (idx < distanser.length && t < 10) {
      if (x >= distanser[idx]) {
        resultat.set(distanser[idx], z * 1000)
        idx++
      }
      const v = Math.sqrt(vx * vx + vy * vy)
      const mach = v / lyd
      const Cd = interpolerDragKoeff(mach)
      const drag = (rho * v * Cd) / (2 * ammo.bc)
      const vRelz = vz + vindV
      vx += (-drag * vx) * dt
      vy += (-g - drag * vy) * dt
      z += vRelz * dt
      vz += (-drag * vRelz) * dt
      x += vx * dt
      y += vy * dt
      t += dt
    }
    return resultat
  }

  const vindDrift = simMedVind(sidevind)
  const ingenVind = simMedVind(0)

  return rader.map(rad => {
    const drift = (vindDrift.get(rad.distanse) ?? 0) - (ingenVind.get(rad.distanse) ?? 0)
    const moaStr = moaImmVedDistanse(rad.distanse)
    return {
      ...rad,
      vindDrift: Math.round(drift),
      vindDriftMoa: moaStr > 0 ? Math.round((drift / moaStr) * 10) / 10 : 0,
    }
  })
}

function finnPBR(
  rifle: Rifle,
  ammo: Ammo,
  betingelser: Betingelser,
  rho: number,
  lyd: number,
  g: number,
  nullpunktsVinkel: number,
  kipphøydeM: number,
  vitalSoneHalv: number // mm
): number {
  let x = 0, y = -kipphøydeM
  let vx = rifle.munningshastighet * Math.cos(nullpunktsVinkel)
  let vy = rifle.munningshastighet * Math.sin(nullpunktsVinkel)
  const dt = 0.001
  let t = 0
  let maxPBR = 0

  while (x < 1000 && t < 10) {
    const dropMm = y * 1000
    if (Math.abs(dropMm) <= vitalSoneHalv) {
      maxPBR = x
    }
    const v = Math.sqrt(vx * vx + vy * vy)
    const mach = v / lyd
    const Cd = interpolerDragKoeff(mach)
    const drag = (rho * v * Cd) / (2 * ammo.bc)
    vx += -drag * vx * dt
    vy += (-g - drag * vy) * dt
    x += vx * dt
    y += vy * dt
    t += dt
  }

  return Math.round(maxPBR)
}
