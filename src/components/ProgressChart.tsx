type Point = { label: string; value: number };

/** Lightweight SVG line chart; colours follow the active theme. */
export default function ProgressChart({ points }: { points: Point[] }) {
  const W = 600;
  const H = 220;
  const pad = { l: 36, r: 16, t: 16, b: 28 };

  if (points.length === 0) {
    return <p className="py-10 text-center text-sm text-muted">Take a quiz to see your progress here.</p>;
  }

  const x = (i: number) =>
    points.length === 1 ? W / 2 : pad.l + (i * (W - pad.l - pad.r)) / (points.length - 1);
  const y = (v: number) => pad.t + ((100 - v) * (H - pad.t - pad.b)) / 100;

  const line = points.map((p, i) => `${i ? "L" : "M"}${x(i)},${y(p.value)}`).join(" ");
  const area = `${line} L${x(points.length - 1)},${H - pad.b} L${x(0)},${H - pad.b} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Quiz score history">
      <defs>
        <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(var(--primary))" stopOpacity="0.45" />
          <stop offset="100%" stopColor="rgb(var(--primary))" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="stroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgb(var(--primary))" />
          <stop offset="100%" stopColor="rgb(var(--accent))" />
        </linearGradient>
      </defs>

      {[0, 50, 100].map((g) => (
        <g key={g}>
          <line x1={pad.l} x2={W - pad.r} y1={y(g)} y2={y(g)} stroke="rgb(var(--border))" strokeOpacity="0.6" strokeDasharray="4 4" />
          <text x={pad.l - 8} y={y(g) + 4} textAnchor="end" fontSize="10" fill="rgb(var(--muted))">
            {g}%
          </text>
        </g>
      ))}

      {points.length > 1 && <path d={area} fill="url(#area)" />}
      <path d={line} fill="none" stroke="url(#stroke)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

      {points.map((p, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(p.value)} r="5" fill="rgb(var(--bg))" stroke="rgb(var(--accent))" strokeWidth="2.5" />
          <title>{`${p.label}: ${p.value}%`}</title>
        </g>
      ))}
    </svg>
  );
}
