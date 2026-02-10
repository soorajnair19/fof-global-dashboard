"use client";

/**
 * Renders "Next update on DD MMM YYYY, 00:00 UTC" using the current time in the browser,
 * so it's always correct and not stale from static/cache.
 */
export default function NextUpdateOn() {
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
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
