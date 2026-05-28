"use client"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts"
import type { BallistikkRad } from "@/lib/types"

type Props = {
  rader: BallistikkRad[]
  nullpunkt: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const data: BallistikkRad = payload[0].payload
  return (
    <div className="bg-card border border-border rounded-lg p-3 text-xs shadow-xl">
      <p className="font-semibold text-foreground mb-1.5">{label} m</p>
      <div className="space-y-0.5 text-muted-foreground">
        <p>Drop: <span className="text-foreground">{data.drop > 0 ? "+" : ""}{data.drop} mm</span></p>
        <p>MOA: <span className="text-foreground">{data.dropMoa > 0 ? "+" : ""}{data.dropMoa}</span></p>
        <p>Hastighet: <span className="text-foreground">{data.hastighet} m/s</span></p>
        <p>Energi: <span className="text-foreground">{data.energi} J</span></p>
        {data.vindDrift !== 0 && (
          <p>Vindavdrift: <span className="text-foreground">{data.vindDrift > 0 ? "+" : ""}{data.vindDrift} mm</span></p>
        )}
      </div>
    </div>
  )
}

export function TrajektoriGraf({ rader, nullpunkt }: Props) {
  const data = rader.map((r) => ({
    ...r,
    distanse: r.distanse,
    dropMm: -r.drop, // flip: positiv = over, negativ = under
  }))

  const maxDrop = Math.max(...rader.map((r) => Math.abs(r.drop)))
  const yDomain = [-maxDrop * 1.2, maxDrop * 1.2]

  return (
    <div className="w-full h-52">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 40 }}>
          <defs>
            <linearGradient id="dropGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4a8a5e" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#4a8a5e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis
            dataKey="distanse"
            tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }}
            tickLine={false}
            axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
            tickFormatter={(v) => `${v}m`}
          />
          <YAxis
            domain={yDomain}
            tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }}
            tickLine={false}
            axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
            tickFormatter={(v) => `${v}mm`}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" strokeDasharray="4 4" />
          <ReferenceLine
            x={nullpunkt}
            stroke="#4a8a5e"
            strokeDasharray="4 4"
            label={{ value: "NP", fill: "#4a8a5e", fontSize: 10, position: "top" }}
          />
          <Area
            type="monotone"
            dataKey="dropMm"
            stroke="#4a8a5e"
            strokeWidth={2}
            fill="url(#dropGrad)"
            dot={false}
            activeDot={{ r: 4, fill: "#4a8a5e", stroke: "#0f1a14", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
