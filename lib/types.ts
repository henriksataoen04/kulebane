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
  temperatur: number       // °C
  lufttrykk: number        // hPa
  høyde: number            // meter over havet
  vindhastighet: number    // m/s
  vindretning: number      // grader (0 = motvind, 90 = sidevind høyre, 180 = medvind, 270 = sidevind venstre)
  breddegrad: number       // °N (breddegrad) — for koriolis-beregning
  skyteretning: number     // azimut i grader fra nord (0=N, 90=Ø, 180=S, 270=V) — for Eötvös-ledd
}

export interface BallistikkRad {
  distanse: number         // m
  hastighet: number        // m/s
  energi: number           // Joule
  drop: number             // mm (negativ = under siktepunkt)
  dropMoa: number          // MOA oppover for å kompensere
  tid: number              // sekunder
  vindDrift: number        // mm sidevind (Pejsa lag-regel)
  vindDriftMoa: number     // MOA sidevind
  koriolisAvdrift: number  // mm horisontal koriolis-drift (positiv = høyre)
  koriolisAvdriftMoa: number
  eotvosKorreksjon: number // mm vertikal Eötvös-korreksjon (positiv = over siktepunktet)
}

export interface BeregningsResultat {
  rader: BallistikkRad[]
  maxPBR: number   // point blank range i meter
  rifle: Rifle
  ammo: Ammo
  betingelser: Betingelser
}
