"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Crosshair, GanttChartSquare, Layers } from "lucide-react"
import { cn } from "@/lib/utils"

const nav = [
  { href: "/", label: "Kalkulator", icon: Crosshair },
  { href: "/rifler", label: "Rifler", icon: GanttChartSquare },
  { href: "/ammo", label: "Ammo", icon: Layers },
]

export function BottomNav() {
  const path = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-sm">
      <div className="max-w-2xl mx-auto flex">
        {nav.map(({ href, label, icon: Icon }) => {
          const aktiv = path === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-3 text-xs font-medium transition-colors",
                aktiv
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={aktiv ? 2.5 : 1.8} />
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
