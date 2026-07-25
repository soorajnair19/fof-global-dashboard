"use client";

/** Scheduled scrape: 10:00 AM IST = 04:30 UTC */
const SCRAPE_HOUR_UTC = 4;
const SCRAPE_MINUTE_UTC = 30;

/**
 * Renders "Next update on DD MMM YYYY, 04:30 UTC" using the current time in the browser,
 * so it's always correct and not stale from static/cache.
 */
export default function NextUpdateOn() {
  const now = new Date();
  const today = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      SCRAPE_HOUR_UTC,
      SCRAPE_MINUTE_UTC,
      0
    )
  );
  const next = now < today ? today : new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const formatted = next.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  });
  return <>Next update on {formatted}</>;
}
