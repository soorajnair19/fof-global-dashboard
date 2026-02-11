"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import InsightsTab from "./InsightsTab";

const INSIGHTS_LABEL = "Insights";
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
  "Interests",
];
// Shorter tab labels to avoid horizontal scroll
const REGION_DISPLAY = {
  "Asia-Pacific": "APAC",
  "Latin America": "LATAM",
};
const MEDALS = ["🥇", "🥈", "🥉"];

export default function DashboardTabs({ members = [], chapters = [] }) {
  const [activeTab, setActiveTab] = useState(INSIGHTS_LABEL);

  const regions = useMemo(() => {
    const set = new Set();
    members.forEach((m) => {
      if (m.region) set.add(m.region);
    });
    return REGION_ORDER.filter((r) => set.has(r));
  }, [members]);

  const filteredMembers = useMemo(() => {
    if (activeTab === INSIGHTS_LABEL) return [];
    if (activeTab === GLOBAL_TOP_LABEL) {
      return members.slice(0, 10);
    }
    return members
      .filter((m) => m.region === activeTab)
      .sort((a, b) => (b.members || 0) - (a.members || 0));
  }, [members, activeTab]);

  const tabLabels = [INSIGHTS_LABEL, GLOBAL_TOP_LABEL, ...regions.map((r) => REGION_DISPLAY[r] ?? r)];
  const tabValues = [INSIGHTS_LABEL, GLOBAL_TOP_LABEL, ...regions];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-fof-border dark:border-[#262626]">
        <nav className="flex gap-1 overflow-x-auto scrollbar-thin pb-px" aria-label="Regions">
          {tabLabels.map((label, i) => {
            const value = tabValues[i];
            return (
              <button
                key={value}
                onClick={() => setActiveTab(value)}
                className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === value
                    ? "border-fof-purple text-fof-purple dark:border-fof-accent dark:text-fof-accent"
                    : "border-transparent text-fof-muted hover:text-fof-ink hover:border-fof-border dark:text-[#a1a1a1] dark:hover:text-[#fafafa] dark:hover:border-[#404040]"
                }`}
              >
                {label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Insights or Table */}
      {activeTab === INSIGHTS_LABEL ? (
        <InsightsTab members={members} chapters={chapters} />
      ) : (
      <div className="rounded-2xl border border-fof-border dark:border-[#262626] bg-white dark:bg-[#171717] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-fof-border dark:border-[#262626] bg-fof-smoke/60 dark:bg-[#262626]">
                <th className="py-3 px-4 sm:px-5 text-xs font-medium text-fof-muted dark:text-[#a1a1a1] uppercase tracking-wider w-14">
                  #
                </th>
                <th className="py-3 px-4 sm:px-5 text-xs font-medium text-fof-muted dark:text-[#a1a1a1] uppercase tracking-wider">
                  Chapter
                </th>
                <th className="py-3 px-4 sm:px-5 text-xs font-medium text-fof-muted dark:text-[#a1a1a1] uppercase tracking-wider text-right w-28">
                  Members
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 px-4 sm:px-5 text-center text-sm text-fof-muted dark:text-[#a1a1a1]">
                    No chapters in this view yet.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((row, index) => {
                  const rank = index + 1;
                  return (
                    <tr
                      key={`${row.city}-${row.region || "global"}`}
                      className="border-b border-fof-border/80 dark:border-[#262626] last:border-0 hover:bg-fof-smoke/40 dark:hover:bg-[#262626] transition-colors"
                    >
                      <td className="py-3.5 px-4 sm:px-5">
                        <span
                          className={
                            rank <= 3
                              ? "inline-flex h-7 w-7 items-center justify-start text-lg"
                              : "text-fof-muted dark:text-[#a1a1a1] text-sm font-medium"
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
                            className="font-medium text-fof-ink dark:text-[#fafafa] hover:text-fof-purple dark:hover:text-fof-accent hover:underline"
                          >
                            {row.city}
                          </Link>
                          {activeTab === GLOBAL_TOP_LABEL && row.region && (
                            <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-fof-smoke text-fof-muted border border-fof-border dark:bg-[#262626] dark:text-[#a1a1a1] dark:border-[#404040]">
                              {row.region}
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 sm:px-5 text-right">
                        <span className="font-semibold tabular-nums text-fof-ink dark:text-[#fafafa]">
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
        <div className="border-t border-fof-border dark:border-[#262626] bg-fof-smoke/30 dark:bg-[#262626] px-4 sm:px-5 py-2 text-xs text-fof-muted dark:text-[#a1a1a1]">
          Click a city chapter to open on friends.figma.com
        </div>
      </div>
      )}
    </div>
  );
}
