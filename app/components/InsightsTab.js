"use client";

import { useMemo, useState } from "react";

const REGION_ORDER = [
  "Africa",
  "Asia-Pacific",
  "Europe",
  "India",
  "Japan",
  "Latin America",
  "Middle East",
  "North America",
  "Interests",
];
const REGION_COLORS = {
  Africa: "#10b981",
  "Asia-Pacific": "#3b82f6",
  Europe: "#8b5cf6",
  India: "#f59e0b",
  Japan: "#ec4899",
  "Latin America": "#ef4444",
  "Middle East": "#06b6d4",
  "North America": "#6366f1",
  Interests: "#0ea5e9",
};

function PieChart({ data, title, size = 200 }) {
  const [hovered, setHovered] = useState(null);
  const total = useMemo(() => data.reduce((s, d) => s + d.value, 0), [data]);
  const segments = useMemo(() => {
    if (total === 0) return [];
    let acc = 0;
    return data.map((d) => {
      const start = acc;
      acc += d.value / total;
      return { ...d, start, end: acc };
    });
  }, [data, total]);

  const r = (size - 24) / 2;
  const cx = size / 2;
  const cy = size / 2;

  const toPath = (start, end) => {
    const x1 = cx + r * Math.cos(2 * Math.PI * (start - 0.25));
    const y1 = cy + r * Math.sin(2 * Math.PI * (start - 0.25));
    const x2 = cx + r * Math.cos(2 * Math.PI * (end - 0.25));
    const y2 = cy + r * Math.sin(2 * Math.PI * (end - 0.25));
    const large = end - start > 0.5 ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
  };

  return (
    <div className="rounded-2xl border border-fof-border dark:border-[#262626] bg-white dark:bg-[#171717] p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-fof-ink dark:text-[#fafafa] mb-4">
        {title}
      </h3>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <svg width={size} height={size} className="flex-shrink-0">
          {total === 0 ? (
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="currentColor"
              className="text-fof-smoke/40 dark:text-[#262626]"
            />
          ) : (
            segments.map((seg) => {
              const isHovered = hovered === seg.label;
              return (
                <path
                  key={seg.label}
                  d={toPath(seg.start, seg.end)}
                  fill={seg.color}
                  stroke={isHovered ? "rgba(255,255,255,0.9)" : "transparent"}
                  strokeWidth={isHovered ? 2 : 0}
                  className="cursor-pointer transition-all duration-150"
                  style={{
                    opacity: hovered === null ? 1 : isHovered ? 1 : 0.5,
                    filter: isHovered ? "brightness(1.1)" : "none",
                  }}
                  onMouseEnter={() => setHovered(seg.label)}
                  onMouseLeave={() => setHovered(null)}
                />
              );
            })
          )}
        </svg>
        <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
          {data.map((d) => {
            const isHovered = hovered === d.label;
            return (
              <li
                key={d.label}
                className={`flex items-center gap-2 cursor-pointer transition-opacity duration-150 ${isHovered ? "opacity-100 font-medium" : "opacity-80"}`}
                onMouseEnter={() => setHovered(d.label)}
                onMouseLeave={() => setHovered(null)}
              >
                <span
                  className="h-3 w-3 rounded-full flex-shrink-0 ring-offset-2 ring-offset-white dark:ring-offset-[#171717]"
                  style={{
                    backgroundColor: d.color,
                    ...(isHovered && { boxShadow: `0 0 0 2px ${d.color}` }),
                  }}
                />
                <span className="text-fof-muted dark:text-[#a1a1a1]">
                  {d.label}: {d.value.toLocaleString()}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default function InsightsTab({ members = [], chapters = [] }) {
  const totalMembers = useMemo(
    () => members.reduce((s, m) => s + (m.members || 0), 0),
    [members]
  );

  const membersByRegion = useMemo(() => {
    const map = {};
    members.forEach((m) => {
      const r = m.region || "Other";
      map[r] = (map[r] || 0) + (m.members || 0);
    });
    return REGION_ORDER.filter((r) => map[r] > 0)
      .map((r) => ({
        label: r,
        value: map[r],
        color: REGION_COLORS[r] || "#64748b",
      }))
      .sort((a, b) => b.value - a.value);
  }, [members]);

  const chaptersByRegion = useMemo(() => {
    const map = {};
    chapters.forEach((c) => {
      const r = c.region || "Other";
      map[r] = (map[r] || 0) + 1;
    });
    return REGION_ORDER.filter((r) => map[r] > 0)
      .map((r) => ({
        label: r,
        value: map[r],
        color: REGION_COLORS[r] || "#64748b",
      }))
      .sort((a, b) => b.value - a.value);
  }, [chapters]);

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-fof-border dark:border-[#262626] bg-white dark:bg-[#171717] p-5 shadow-sm">
          <p className="text-xs font-medium text-fof-muted dark:text-[#a1a1a1] uppercase tracking-wider">
            Total memberships
          </p>
          <p className="mt-1 text-2xl font-bold text-fof-ink dark:text-[#fafafa] tabular-nums">
            {totalMembers.toLocaleString()}
          </p>
        </div>
        <div className="rounded-2xl border border-fof-border dark:border-[#262626] bg-white dark:bg-[#171717] p-5 shadow-sm">
          <p className="text-xs font-medium text-fof-muted dark:text-[#a1a1a1] uppercase tracking-wider">
            Total chapters
          </p>
          <p className="mt-1 text-2xl font-bold text-fof-ink dark:text-[#fafafa] tabular-nums">
            {chapters.length.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Pie charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PieChart
          data={membersByRegion}
          title="Members by region"
        />
        <PieChart
          data={chaptersByRegion}
          title="Chapters by region"
        />
      </div>
    </div>
  );
}
