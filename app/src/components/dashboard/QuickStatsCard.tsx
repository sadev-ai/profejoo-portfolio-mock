// src/components/dashboard/QuickStatsCard.tsx
import * as React from "react";
import { DashboardCard } from "./DashboardCard";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis } from "recharts";

export type DocumentsBreakdown = {
  label: string;
  value: number;
  color: "primary" | "secondary" | "accent";
};

export type SearchStats = {
  label: string;
  value: number;
  color: "primary" | "secondary";
};

type Props = {
  profileCompleted: number; // 0..100
  documents: DocumentsBreakdown[];
  searched: SearchStats[];
};

function docColorVar(c: DocumentsBreakdown["color"]) {
  switch (c) {
    case "primary":
      return "var(--primary-400)";
    case "secondary":
      return "var(--secondary-400)";
    case "accent":
    default:
      return "var(--accent-400)";
  }
}

function searchColorVar(c: SearchStats["color"]) {
  return c === "primary"
    ? "var(--primary-400)"
    : "var(--secondary-400)";
}

export function QuickStatsCard({
  profileCompleted,
  documents,
  searched,
}: Props) {
  const clampedProfile = Math.max(0, Math.min(100, profileCompleted));
  const totalDocs = documents.reduce((s, d) => s + d.value, 0);
  const gaugeRef = React.useRef<HTMLDivElement>(null);
  const donutRef = React.useRef<HTMLDivElement>(null);
  const barRef = React.useRef<HTMLDivElement>(null);
  const [gaugeWidth, setGaugeWidth] = React.useState(240);
  const [donutWidth, setDonutWidth] = React.useState(260);
  const [barWidth, setBarWidth] = React.useState(320);

  React.useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const updateWidths = () => {
      if (gaugeRef.current) {
        setGaugeWidth(Math.max(gaugeRef.current.clientWidth || 240, 220));
      }
      if (donutRef.current) {
        setDonutWidth(Math.max(donutRef.current.clientWidth || 260, 260));
      }
      if (barRef.current) {
        setBarWidth(Math.max(barRef.current.clientWidth || 320, 320));
      }
    };
    updateWidths();
    window.addEventListener("resize", updateWidths);
    return () => window.removeEventListener("resize", updateWidths);
  }, []);

  return (
    <DashboardCard
      title="Quick Stats"
      actionLabel="View all"
      className="h-full"
    >
      <div className="space-y-6 pt-1 pb-1">
        {/* ===== Profile Completed (Gauge) ===== */}
        <section className="flex flex-col items-center gap-3">
          <p className="text-sm font-semibold text-muted-foreground">
            Profile Completed
          </p>

          {/* Half-circle with recharts */}
          <div className="mt-1 w-full max-w-xs">
            <div
              ref={gaugeRef}
              className="relative mx-auto w-full"
              style={{ height: '160px' }}
            >
              <PieChart width={Math.max(gaugeWidth, 220)} height={160}>
                  <Pie
                    data={[
                      { name: 'completed', value: clampedProfile },
                      { name: 'remaining', value: 100 - clampedProfile }
                    ]}
                    cx="50%"
                    cy="50%"
                    startAngle={180}
                    endAngle={0}
                    innerRadius="60%"
                    outerRadius="80%"
                    paddingAngle={0}
                    dataKey="value"
                  >
                    <Cell fill="var(--tertiary-400)" stroke="none" />
                    <Cell fill="var(--tertiary-50)" stroke="none" />
                  </Pie>
              </PieChart>
              
              {/* Percentage in the bottom-middle of the half-circle */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center pt-8">
                <span className="text-lg font-bold text-foreground">
                  {clampedProfile}%
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Divider line */}
        <div className="h-px w-full bg-border/70" />

        {/* ===== Documents (Donut) ===== */}
        <section className="flex flex-col items-center gap-4">
          <p className="text-sm font-semibold text-muted-foreground">
            Documents
          </p>

          <div className="flex flex-col items-center gap-4">
            <div
              ref={donutRef}
              className="relative mx-auto w-full max-w-[260px]"
              style={{ height: '160px' }}
            >
              <PieChart width={Math.max(donutWidth, 260)} height={160}>
                  <Pie
                    data={documents.length > 0 && totalDocs > 0 ? documents : [{ label: 'Empty', value: 1, color: 'secondary' as const }]}
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="80%"
                    paddingAngle={0}
                    dataKey="value"
                  >
                    {(documents.length > 0 && totalDocs > 0 ? documents : [{ label: 'Empty', value: 1, color: 'secondary' as const }]).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={docColorVar(entry.color)} stroke="none" />
                    ))}
                  </Pie>
              </PieChart>
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-foreground">
                  {totalDocs}
                </span>
              </div>
            </div>

            {/* Legend similar to the reference image */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-[11px]">
              {documents.map((d) => (
                <div
                  key={d.label}
                  className="flex flex-col items-center gap-1 text-center"
                >
                  <div className="flex items-center gap-1">
                    <span
                      className="inline-block h-1.5 w-3.5 rounded-full"
                      style={{ backgroundColor: docColorVar(d.color) }}
                    />
                    <span className="text-muted-foreground">
                      {d.label}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-foreground">
                    {d.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Second divider line */}
        <div className="h-px w-full bg-border/70" />

        {/* ===== You Searched For (Bar chart) ===== */}
        <section className="space-y-3">
          <p className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
            You Searched For
          </p>

          <div className="rounded-[18px] border border-border/70 bg-background px-4 py-5">
            <div ref={barRef} className="h-40 w-full">
              <BarChart
                width={Math.max(barWidth, 320)}
                height={160}
                data={searched}
                margin={{ top: 20, right: 10, left: 10, bottom: 20 }}
              >
                  <XAxis 
                    dataKey="label" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  />
                  <YAxis hide />
                  <Bar 
                    dataKey="value" 
                    radius={[6, 6, 0, 0]}
                    maxBarSize={32}
                  >
                    {searched.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={searchColorVar(entry.color)} />
                    ))}
                  </Bar>
                </BarChart>
            </div>

            {/* Bottom legend, like the reference image */}
            {searched.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-4 text-[11px]">
                {searched.map((s) => (
                  <div
                    key={`${s.label}-legend`}
                    className="flex items-center gap-1"
                  >
                    <span
                      className="inline-block h-2 w-4.5 rounded-[3px]"
                      style={{
                        backgroundColor: searchColorVar(s.color),
                      }}
                    />
                    <span className="text-muted-foreground">
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </DashboardCard>
  );
}
