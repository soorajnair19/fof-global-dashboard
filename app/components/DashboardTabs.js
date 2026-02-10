"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

const GLOBAL_TOP_LABEL = "Global Top 10";
const REGION_ORDER = [
  "Africa",
  "Asia-Pacific",
  "Europe",
  "India",
  "Japan",
  "Latin America",
  "Middle East",
  "North America",
];
// Shorter tab labels to avoid horizontal scroll
const REGION_DISPLAY = {
  "Asia-Pacific": "APAC",
  "Latin America": "LATAM",
};
const MEDALS = ["🥇", "🥈", "🥉"];

export default function DashboardTabs({ members }) {
  const [activeTab, setActiveTab] = useState(GLOBAL_TOP_LABEL);

  const regions = useMemo(() => {
    const set = new Set();
    members.forEach((m) => {
      if (m.region) set.add(m.region);
    });
    return REGION_ORDER.filter((r) => set.has(r));
  }, [members]);

  const filteredMembers = useMemo(() => {
    if (activeTab === GLOBAL_TOP_LABEL) {
      return members.slice(0, 10);
    }
    return members
      .filter((m) => m.region === activeTab)
      .sort((a, b) => (b.members || 0) - (a.members || 0));
  }, [members, activeTab]);

  const tabLabels = [GLOBAL_TOP_LABEL, ...regions.map((r) => REGION_DISPLAY[r] ?? r)];
  const tabValues = [GLOBAL_TOP_LABEL, ...regions];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-fof-border">
        <nav className="flex gap-1 overflow-x-auto scrollbar-thin pb-px" aria-label="Regions">
          {tabLabels.map((label, i) => {
            const value = tabValues[i];
            return (
              <button
                key={value}
                onClick={() => setActiveTab(value)}
                className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === value
                    ? "border-fof-purple text-fof-purple"
                    : "border-transparent text-fof-muted hover:text-fof-ink hover:border-fof-border"
                }`}
              >
                {label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-fof-border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-fof-border bg-fof-smoke/60">
                <th className="py-3 px-4 sm:px-5 text-xs font-medium text-fof-muted uppercase tracking-wider w-14">
                  #
                </th>
                <th className="py-3 px-4 sm:px-5 text-xs font-medium text-fof-muted uppercase tracking-wider">
                  Chapter
                </th>
                <th className="py-3 px-4 sm:px-5 text-xs font-medium text-fof-muted uppercase tracking-wider text-right w-28">
                  Members
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 px-4 sm:px-5 text-center text-sm text-fof-muted">
                    No chapters in this view yet.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((row, index) => {
                  const rank = index + 1;
                  return (
                    <tr
                      key={`${row.city}-${row.region || "global"}`}
                      className="border-b border-fof-border/80 last:border-0 hover:bg-fof-smoke/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 sm:px-5">
                        <span
                          className={
                            rank <= 3
                              ? "inline-flex h-7 w-7 items-center justify-start text-lg"
                              : "text-fof-muted text-sm font-medium"
                          }
                        >
                          {rank <= 3 ? MEDALS[rank - 1] : rank}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 sm:px-5">
                        <span className="inline-flex items-center gap-2 flex-wrap">
                          <Link
                            href={row.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-fof-ink hover:text-fof-purple hover:underline"
                          >
                            {row.city}
                          </Link>
                          {activeTab === GLOBAL_TOP_LABEL && row.region && (
                            <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-fof-smoke text-fof-muted border border-fof-border">
                              {row.region}
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 sm:px-5 text-right">
                        <span className="font-semibold tabular-nums text-fof-ink">
                          {row.members.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-fof-border bg-fof-smoke/30 px-4 sm:px-5 py-2 text-xs text-fof-muted">
          Click a city chapter to open on friends.figma.com
        </div>
      </div>
    </div>
  );
}
