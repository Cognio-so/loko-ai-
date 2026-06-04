"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ActivityDatum = {
  key: string;
  label: string;
  month: string;
  date: string;
  count: number;
};

type ActivityTooltipProps = {
  active?: boolean;
  payload?: Array<{ payload?: ActivityDatum }>;
};

function ActivityTooltip({ active, payload }: ActivityTooltipProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload;
  if (!item) return null;

  return (
    <div className="pointer-events-none animate-in fade-in zoom-in-95 duration-150 rounded-2xl border border-slate-200/80 bg-white/95 px-4 py-3 text-center shadow-[0_16px_45px_rgba(15,23,42,0.16)] backdrop-blur-2xl">
      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
        {item.month} {item.date}
      </p>
      <p className="mt-1 text-xl font-black leading-none text-slate-950">{item.count}</p>
    </div>
  );
}

function ActivityActiveDot({ cx, cy }: { cx?: number; cy?: number }) {
  if (typeof cx !== "number" || typeof cy !== "number") return null;

  return (
    <g>
      <circle cx={cx} cy={cy} r={10} fill="rgba(14,165,233,0.12)" />
      <circle cx={cx} cy={cy} r={5} fill="#0ea5e9" stroke="#ffffff" strokeWidth={3} />
    </g>
  );
}

export default function ActivityChart({
  activityDays,
  chartMax,
}: {
  activityDays: ActivityDatum[];
  chartMax: number;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={activityDays} margin={{ top: 4, right: 14, bottom: 14, left: 0 }}>
        <defs>
          <linearGradient id="conversationActivityFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.18} />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 6" vertical={false} />
        <XAxis
          dataKey="label"
          interval={3}
          tickLine={false}
          axisLine={false}
          minTickGap={8}
          height={32}
          tick={({ x, y, payload }) => {
            const item = activityDays[payload.index];
            if (!item) return <g />;
            return (
              <g transform={`translate(${Number(x)},${Number(y) + 6})`}>
                <text textAnchor="middle" className="fill-slate-400 text-[10px] font-bold">
                  <tspan x="0" dy="0">{item.month}</tspan>
                  <tspan x="0" dy="12">{item.date}</tspan>
                </text>
              </g>
            );
          }}
        />
        <YAxis
          domain={[0, chartMax]}
          ticks={[0, 1, 2, 3, 4].filter((tick) => tick <= chartMax)}
          tickLine={false}
          axisLine={false}
          width={42}
          tick={{ fill: "#64748b", fontSize: 11, fontWeight: 700 }}
        />
        <Tooltip
          content={<ActivityTooltip />}
          cursor={{ stroke: "#cbd5e1", strokeWidth: 1 }}
          wrapperStyle={{ outline: "none", transition: "transform 160ms ease, opacity 160ms ease" }}
          position={{ y: 46 }}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke="#0ea5e9"
          strokeWidth={2.5}
          fill="url(#conversationActivityFill)"
          dot={false}
          activeDot={<ActivityActiveDot />}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
