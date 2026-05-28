export interface Rifle {
  id: string
  navn: string
  kaliber: string
  munningshastighet: number // m/s
  kipphøyde: number // mm (senter løp til senter optikk)
  nullpunkt: number // m
  opprettet: number
}

export interface Ammo {
  id: string
  navn: string
  vekt: number // gram
  bc: number // G1 ballistisk koeffisient
  type: string // f.eks. "SP", "HP", "FMJ", "SST"
  opprettet: number
}

export interface Betingelser {
  temperatur: number // °C
  lufttrykk: number // hPa
  høyde: number // meter over havet
  vindhastighet: number // m/s
  vindretning: number // grader (0 = motvind, 90 = sidevind høyre, 180 = medvind, 270 = sidevind venstre)
}

export interface BallistikkRad {
  distanse: number // m
  hastighet: number // m/s
  energi: number // Joule
  drop: number // mm (positiv = under siktepunkt)
  dropMoa: number // MOA
  tid: number // sekunder
  vindDrift: number // mm sidevind
  vindDriftMoa: number // MOA sidevind
}

export interface BeregningsResultat {
  rader: BallistikkRad[]
  maxPBR: number // point blank range i meter
  rifle: Rifle
  ammo: Ammo
  betingelser: Betingelser
}
