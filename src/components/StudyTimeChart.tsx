import { useEffect, useRef, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Activity } from "lucide-react";

export interface StudyPoint {
  t: string;
  minutes: number;
}

interface Props {
  title: string;
  subtitle: string;
  /** seed base value for the simulated live data */
  base: number;
  /** amplitude of random fluctuation */
  variance: number;
  accent?: string;
}

const MAX_POINTS = 20;

function fmtTime(label: string) {
  return label;
}

export function StudyTimeChart({ title, subtitle, base, variance, accent = "var(--color-primary, #4f46e5)" }: Props) {
  const [data, setData] = useState<StudyPoint[]>(() => {
    const now = Date.now();
    return Array.from({ length: MAX_POINTS }, (_, i) => {
      const d = new Date(now - (MAX_POINTS - 1 - i) * 3000);
      return {
        t: d.toLocaleTimeString("es-HN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        minutes: Math.max(0, Math.round(base + (Math.random() - 0.5) * variance)),
      };
    });
  });
  const baseRef = useRef(base);
  baseRef.current = base;

  useEffect(() => {
    const id = setInterval(() => {
      setData(prev => {
        const now = new Date();
        const next: StudyPoint = {
          t: now.toLocaleTimeString("es-HN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          minutes: Math.max(0, Math.round(baseRef.current + (Math.random() - 0.5) * variance)),
        };
        return [...prev.slice(1), next];
      });
    }, 3000);
    return () => clearInterval(id);
  }, [variance]);

  const total = data.reduce((a, b) => a + b.minutes, 0);
  const avg = data.length > 0 ? Math.round(total / data.length) : 0;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-muted">
              <Activity className="h-4 w-4" style={{ color: accent }} />
            </div>
            <div>
              <p className="text-sm font-semibold">{title}</p>
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Promedio</p>
            <p className="text-lg font-bold" style={{ color: accent }}>{avg} min</p>
          </div>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="studyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={accent} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border, #e5e7eb)" vertical={false} />
              <XAxis dataKey="t" tick={{ fontSize: 10 }} tickFormatter={fmtTime} interval="preserveStartEnd" minTickGap={30} />
              <YAxis tick={{ fontSize: 10 }} width={36} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid var(--border, #e5e7eb)", fontSize: 12 }}
                labelStyle={{ fontSize: 11 }}
                formatter={(v: number) => [`${v} min`, "Tiempo"]}
              />
              <Area type="monotone" dataKey="minutes" stroke={accent} strokeWidth={2} fill="url(#studyGradient)" isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ backgroundColor: accent }} />
            <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: accent }} />
          </span>
          Actualización en tiempo real · cada 3 s
        </div>
      </CardContent>
    </Card>
  );
}
