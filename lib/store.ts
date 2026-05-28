"use client"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Rifle, Ammo, Betingelser } from "./types"

interface KulebaneStore {
  rifler: Rifle[]
  ammo: Ammo[]
  betingelser: Betingelser
  aktivRifleId: string | null
  aktivAmmoId: string | null

  leggTilRifle: (rifle: Omit<Rifle, "id" | "opprettet">) => void
  oppdaterRifle: (id: string, data: Partial<Omit<Rifle, "id" | "opprettet">>) => void
  slettRifle: (id: string) => void

  leggTilAmmo: (ammo: Omit<Ammo, "id" | "opprettet">) => void
  oppdaterAmmo: (id: string, data: Partial<Omit<Ammo, "id" | "opprettet">>) => void
  slettAmmo: (id: string) => void

  settBetingelser: (b: Partial<Betingelser>) => void
  settAktivRifle: (id: string | null) => void
  settAktivAmmo: (id: string | null) => void
}

export const useKulebaneStore = create<KulebaneStore>()(
  persist(
    (set) => ({
      rifler: [],
      ammo: [],
      betingelser: {
        temperatur: 15,
        lufttrykk: 1013,
        høyde: 0,
        vindhastighet: 0,
        vindretning: 90,
      },
      aktivRifleId: null,
      aktivAmmoId: null,

      leggTilRifle: (data) =>
        set((s) => ({
          rifler: [
            ...s.rifler,
            { ...data, id: crypto.randomUUID(), opprettet: Date.now() },
          ],
        })),

      oppdaterRifle: (id, data) =>
        set((s) => ({
          rifler: s.rifler.map((r) => (r.id === id ? { ...r, ...data } : r)),
        })),

      slettRifle: (id) =>
        set((s) => ({
          rifler: s.rifler.filter((r) => r.id !== id),
          aktivRifleId: s.aktivRifleId === id ? null : s.aktivRifleId,
        })),

      leggTilAmmo: (data) =>
        set((s) => ({
          ammo: [
            ...s.ammo,
            { ...data, id: crypto.randomUUID(), opprettet: Date.now() },
          ],
        })),

      oppdaterAmmo: (id, data) =>
        set((s) => ({
          ammo: s.ammo.map((a) => (a.id === id ? { ...a, ...data } : a)),
        })),

      slettAmmo: (id) =>
        set((s) => ({
          ammo: s.ammo.filter((a) => a.id !== id),
          aktivAmmoId: s.aktivAmmoId === id ? null : s.aktivAmmoId,
        })),

      settBetingelser: (b) =>
        set((s) => ({ betingelser: { ...s.betingelser, ...b } })),

      settAktivRifle: (id) => set({ aktivRifleId: id }),
      settAktivAmmo: (id) => set({ aktivAmmoId: id }),
    }),
    {
      name: "kulebane-lagring",
    }
  )
)
