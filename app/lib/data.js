import { readFileSync } from "fs";
import { join } from "path";

/**
 * Load member data for the dashboard.
 * - If NEXT_PUBLIC_DATA_URL is set (e.g. GitHub raw URL), fetch from there (revalidate every 60s).
 * - Otherwise read from local data/members.json (e.g. when running locally).
 */
export async function getMembers() {
  const dataUrl = process.env.NEXT_PUBLIC_DATA_URL;

  if (dataUrl) {
    const res = await fetch(dataUrl, {
      next: { revalidate: 60 },
      headers: { "Accept": "application/json" },
    });
    if (!res.ok) throw new Error(`Failed to fetch data: ${res.status}`);
    return res.json();
  }

  const path = join(process.cwd(), "data", "members.json");
  const raw = readFileSync(path, "utf-8");
  return JSON.parse(raw);
}

/** Format IST timestamp for display (e.g. "11 Feb 2026, 00:59 IST") */
export function formatScrapedAt(isoString) {
  if (!isoString) return "—";
  try {
    const d = new Date(isoString);
    return d.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Kolkata",
      timeZoneName: "short",
    });
  } catch {
    return isoString;
  }
}

/** Next 00:00 UTC (when the daily scrape runs). */
export function getNextMidnightUTC() {
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
  if (now < today) return today;
  const tomorrow = new Date(today);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  return tomorrow;
}

/** Format next update time (e.g. "12 Feb 2026, 00:00 UTC") */
export function formatNextUpdateUTC(date) {
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  });
}
