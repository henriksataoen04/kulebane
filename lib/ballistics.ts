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

// Standard ISA sea-level air density (kg/m³)
const RHO0 = 1.2250

// Convert G1 BC (lb/in², e.g. 0.430) to the physics parameter used in the drag formula.
// The drag deceleration is: a = -(ρ/ρ₀) · Cd_G1(M) · v² / (2 · BC_SI)
// which reorganises to:      a = -ρ · v · Cd_G1(M) / (2 · bcPhysics) · v_component
// where bcPhysics = RHO0 · BC_SI = RHO0 · BC_G1 · 703.07
function g1TilBcPhysics(bc_g1: number): number {
  return bc_g1 * 703.07 * RHO0 // ≈ bc_g1 × 861.3
}

function interpolerDragKoeff(mach: number): number {
  const t = G1_DRAG_TABLE
  if (mach <= t[0][0]) return t[0][1]
  if (mach >= t[t.length - 1][0]) return t[t.length - 1][1]
  for (let i = 0; i < t.length - 1; i++) {
    if (mach >= t[i][0] && mach < t[i + 1][0]) {
      const f = (mach - t[i][0]) / (t[i + 1][0] - t[i][0])
      return t[i][1] + f * (t[i + 1][1] - t[i][1])
    }
  }
  return t[t.length - 1][1]
}

function lufttetthet(tempC: number, trykkHpa: number): number {
  const T = tempC + 273.15
  const P = trykkHpa * 100 // Pa
  return P / (287.058 * T)
}

function lydhastighet(tempC: number): number {
  return 331.3 * Math.sqrt(1 + tempC / 273.15)
}

function moaImmVedDistanse(distanseM: number): number {
  if (distanseM <= 0) return 0
  return distanseM * Math.tan((Math.PI / 180) / 60) * 1000 // mm
}

// RK4 step for (x, y, vx, vy).
// bcPhysics = RHO0 · BC_SI (kg·m⁻² · kg·m⁻³ = kg²·m⁻⁵ — just an opaque constant here).
function rk4Steg(
  x: number, y: number, vx: number, vy: number,
  dt: number,
  rho: number, bcPhysics: number, lydHastighet: number,
  g: number,
): { x: number; y: number; vx: number; vy: number } {
  function deriv(vx_: number, vy_: number) {
    const v = Math.sqrt(vx_ * vx_ + vy_ * vy_)
    if (v < 1e-6) return { ax: 0, ay: -g }
    const mach = v / lydHastighet
    const Cd = interpolerDragKoeff(mach)
    // a = -ρ · Cd · v / (2 · bcPhysics) · velocity_component
    // = -(ρ/ρ₀) · Cd · v² / (2 · BC_SI) · (v_comp / v)  [correct G1 formula]
    const dragK = (rho * v * Cd) / (2 * bcPhysics)
    return { ax: -dragK * vx_, ay: -g - dragK * vy_ }
  }
  const k1 = deriv(vx, vy)
  const k2 = deriv(vx + k1.ax * dt / 2, vy + k1.ay * dt / 2)
  const k3 = deriv(vx + k2.ax * dt / 2, vy + k2.ay * dt / 2)
  const k4 = deriv(vx + k3.ax * dt, vy + k3.ay * dt)
  return {
    x: x + vx * dt,
    y: y + vy * dt,
    vx: vx + (k1.ax + 2 * k2.ax + 2 * k3.ax + k4.ax) * dt / 6,
    vy: vy + (k1.ay + 2 * k2.ay + 2 * k3.ay + k4.ay) * dt / 6,
  }
}

// Find the bore elevation angle (radians) that zeroes the rifle at nullpunktM.
function finnNullpunktsVinkel(
  munningshastighet: number, nullpunktM: number, kipphøydeM: number,
  rho: number, bcPhysics: number, lyd: number, g: number,
): number {
  function yVedNullpunkt(vinkel: number): number {
    let x = 0, y = -kipphøydeM
    let vx = munningshastighet * Math.cos(vinkel)
    let vy = munningshastighet * Math.sin(vinkel)
    const dt = 0.002
    let t = 0
    while (x < nullpunktM && t < 10) {
      const res = rk4Steg(x, y, vx, vy, dt, rho, bcPhysics, lyd, g)
      x = res.x; y = res.y; vx = res.vx; vy = res.vy
      t += dt
    }
    return y
  }

  // Bisection
  let lo = -0.05, hi = 0.05
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2
    if (yVedNullpunkt(mid) > 0) hi = mid
    else lo = mid
  }
  return (lo + hi) / 2
}

export function beregnBallistikk(
  rifle: Rifle,
  ammo: Ammo,
  betingelser: Betingelser,
  maxDistanse = 1000,
  intervall = 50,
): BeregningsResultat {
  const g = 9.80665
  const rho = lufttetthet(betingelser.temperatur, betingelser.lufttrykk)
  const lyd = lydhastighet(betingelser.temperatur)
  const bcPhysics = g1TilBcPhysics(ammo.bc)
  const masseKg = ammo.vekt / 1000 // gram → kg
  const kipphøydeM = rifle.kipphøyde / 1000 // mm → m

  // Crosswind component (perpendicular to firing direction)
  const vindRad = (betingelser.vindretning * Math.PI) / 180
  const sidevind = betingelser.vindhastighet * Math.sin(vindRad) // m/s, + = høyre

  const nullpunktsVinkel = finnNullpunktsVinkel(
    rifle.munningshastighet, rifle.nullpunkt, kipphøydeM, rho, bcPhysics, lyd, g,
  )

  // Build list of distances to sample
  const distanser: number[] = []
  for (let d = 0; d <= maxDistanse; d += intervall) distanser.push(d)
  if (distanser[distanser.length - 1] !== maxDistanse) distanser.push(maxDistanse)

  // Simulate trajectory
  const rader: BallistikkRad[] = []
  let x = 0, y = -kipphøydeM
  let vx = rifle.munningshastighet * Math.cos(nullpunktsVinkel)
  let vy = rifle.munningshastighet * Math.sin(nullpunktsVinkel)
  const dt = 0.002
  let t = 0
  let idx = 0

  while (idx < distanser.length && t < 15) {
    const målDistanse = distanser[idx]

    if (x >= målDistanse) {
      const v = Math.sqrt(vx * vx + vy * vy)
      const energi = 0.5 * masseKg * v * v // Joule

      const dropMm = y * 1000 // m → mm (negative = below sight line)
      const moaStr = moaImmVedDistanse(målDistanse)
      const dropMoa = moaStr > 0 ? -dropMm / moaStr : 0

      // Wind drift using Pejsa lag rule: drift = v_wind × (TOF - range/V₀)
      const lagTid = målDistanse / rifle.munningshastighet
      const vindDriftM = sidevind * (t - lagTid)
      const vindDriftMm = vindDriftM * 1000
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

    const res = rk4Steg(x, y, vx, vy, dt, rho, bcPhysics, lyd, g)
    x = res.x; y = res.y; vx = res.vx; vy = res.vy
    t += dt
  }

  const pbr = finnPBR(
    rifle.munningshastighet, rifle.nullpunkt, kipphøydeM,
    rho, bcPhysics, lyd, g, nullpunktsVinkel, 100,
  )

  return { rader, maxPBR: pbr, rifle, ammo, betingelser }
}

function finnPBR(
  munningshastighet: number,
  nullpunktM: number,
  kipphøydeM: number,
  rho: number,
  bcPhysics: number,
  lyd: number,
  g: number,
  nullpunktsVinkel: number,
  vitalSoneHalvMm: number,
): number {
  let x = 0, y = -kipphøydeM
  let vx = munningshastighet * Math.cos(nullpunktsVinkel)
  let vy = munningshastighet * Math.sin(nullpunktsVinkel)
  const dt = 0.002
  let t = 0
  let maxPBR = 0

  // Suppress unused warning
  void nullpunktM

  while (x < 1200 && t < 15) {
    const dropMm = y * 1000
    if (Math.abs(dropMm) <= vitalSoneHalvMm) {
      maxPBR = x
    } else if (x > 50 && dropMm < -vitalSoneHalvMm) {
      break // Past PBR, bullet dropped below vital zone and won't recover
    }
    const res = rk4Steg(x, y, vx, vy, dt, rho, bcPhysics, lyd, g)
    x = res.x; y = res.y; vx = res.vx; vy = res.vy
    t += dt
  }

  return Math.round(maxPBR)
}
