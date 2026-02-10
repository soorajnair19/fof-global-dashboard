/**
 * Friends of Figma – Chapter member count scraper
 *
 * Reads chapters from scrape/chapters.json, fetches each Bevy page,
 * extracts member count, and writes results to data/members.json.
 *
 * Tune the extraction logic below if Bevy’s HTML structure differs.
 */

import fetch from "node-fetch";
import * as cheerio from "cheerio";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const CHAPTERS_PATH = join(ROOT, "scrape", "chapters.json");
const DATA_DIR = join(ROOT, "data");
const OUTPUT_PATH = join(DATA_DIR, "members.json");

// Concurrency: run this many requests in parallel
const CONCURRENCY = 10;
// Minimum ms between *starting* each request (spreads load, avoids hammering the server)
const START_DELAY_MS = 400;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Load chapters from scrape/chapters.json
 */
function loadChapters() {
  const raw = readFileSync(CHAPTERS_PATH, "utf-8");
  const chapters = JSON.parse(raw);
  if (!Array.isArray(chapters)) {
    throw new Error("chapters.json must be an array of { city, region, url }");
  }
  return chapters;
}

/**
 * Extract member count from Bevy community page HTML.
 * Bevy shows the count in a span with class like:
 *   plainText-styles__plainText_8ys50
 * (suffix may vary). We match by class prefix.
 */
function extractMemberCount(html, url) {
  const $ = cheerio.load(html);

  // Primary: Bevy's plainText span containing the member number (e.g. "4269")
  const plainTextSpans = $('[class*="plainText-styles__plainText"]');
  for (let i = 0; i < plainTextSpans.length; i++) {
    const text = $(plainTextSpans[i]).text().trim().replace(/,/g, "");
    const n = parseInt(text, 10);
    if (!Number.isNaN(n) && n > 0 && n < 10_000_000) {
      return n;
    }
  }

  // Fallback: data attribute
  const dataCount = $("[data-member-count]").attr("data-member-count");
  if (dataCount !== undefined) {
    const n = parseInt(String(dataCount).replace(/\D/g, ""), 10);
    if (!Number.isNaN(n)) return n;
  }

  // Fallback: text like "1,234 members" or "4021 Members"
  const bodyText = $("body").text();
  const memberMatch = bodyText.match(/(\d[\d,]*)\s*members?/i);
  if (memberMatch) {
    const n = parseInt(memberMatch[1].replace(/,/g, ""), 10);
    if (!Number.isNaN(n)) return n;
  }

  return null;
}

/**
 * Fetch one chapter page and return member count or null on failure.
 */
async function scrapeChapter(chapter) {
  const { city, region, url } = chapter;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "FriendsOfFigma-Scraper/1.0 (community dashboard; +https://github.com)",
      },
      redirect: "follow",
    });

    if (!res.ok) {
      console.warn(`  [${city}] HTTP ${res.status} – ${url}`);
      return { city, region: region || null, url, members: null, error: `HTTP ${res.status}` };
    }

    const html = await res.text();
    const members = extractMemberCount(html, url);

    if (members === null) {
      console.warn(`  [${city}] Could not find member count – ${url}`);
      return { city, region: region || null, url, members: null, error: "No member count found" };
    }

    console.log(`  [${city}] ${members} members`);
    return { city, region: region || null, url, members, error: null };
  } catch (err) {
    console.warn(`  [${city}] Error: ${err.message}`);
    return {
      city,
      region: region || null,
      url,
      members: null,
      error: err.message || "Request failed",
    };
  }
}

/**
 * Return current time in IST (Indian Standard Time) as ISO-style string.
 */
function getISTTimestamp() {
  const d = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (type) => parts.find((p) => p.type === type).value;
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:${get("second")}+05:30`;
}

/**
 * Build output entry: city, region, members (or 0 if failed), url, scrapedAt (IST).
 * Optionally include error when scraping failed for debugging.
 */
function toOutputRow(row, scrapedAtIST) {
  const out = {
    city: row.city,
    region: row.region ?? null,
    members: row.members != null ? row.members : 0,
    url: row.url,
    scrapedAt: scrapedAtIST,
  };
  if (row.error) out.error = row.error;
  return out;
}

async function main() {
  console.log("Reading chapters from scrape/chapters.json…");
  const chapters = loadChapters();
  console.log(
    `Found ${chapters.length} chapter(s). Scraping with concurrency ${CONCURRENCY}, ${START_DELAY_MS}ms between starts.\n`
  );

  const scrapedAtIST = getISTTimestamp();
  const results = new Array(chapters.length);
  let nextIndex = 0;
  let lastStartTime = 0;

  async function worker() {
    while (true) {
      const i = nextIndex++;
      if (i >= chapters.length) return;
      const now = Date.now();
      const wait = lastStartTime + START_DELAY_MS - now;
      if (wait > 0) await sleep(wait);
      lastStartTime = Date.now();
      console.log(`Scraping (${i + 1}/${chapters.length}) ${chapters[i].city}…`);
      const row = await scrapeChapter(chapters[i]);
      results[i] = toOutputRow(row, scrapedAtIST);
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(OUTPUT_PATH, JSON.stringify(results, null, 2), "utf-8");
  console.log(`\nWrote ${results.length} result(s) to data/members.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
