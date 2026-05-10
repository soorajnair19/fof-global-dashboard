/**
 * Friends of Figma – Chapter URL health check
 *
 * Reads scrape/chapters.json, fetches each URL, and reports any that
 * return non-200 status, redirect off-domain, or show no member count
 * (i.e. likely a removed/empty chapter).
 *
 * Run: node scrape/checkChapters.js
 */

import fetch from "node-fetch";
import * as cheerio from "cheerio";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CHAPTERS_PATH = join(__dirname, "chapters.json");

const CONCURRENCY = 12;
const START_DELAY_MS = 250;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function extractMemberCount(html) {
  const $ = cheerio.load(html);
  const spans = $('[class*="plainText-styles__plainText"]');
  for (let i = 0; i < spans.length; i++) {
    const text = $(spans[i]).text().trim().replace(/,/g, "");
    const n = parseInt(text, 10);
    if (!Number.isNaN(n) && n >= 0 && n < 10_000_000) return n;
  }
  const dataCount = $("[data-member-count]").attr("data-member-count");
  if (dataCount !== undefined) {
    const n = parseInt(String(dataCount).replace(/\D/g, ""), 10);
    if (!Number.isNaN(n)) return n;
  }
  const m = $("body").text().match(/(\d[\d,]*)\s*members?/i);
  if (m) {
    const n = parseInt(m[1].replace(/,/g, ""), 10);
    if (!Number.isNaN(n)) return n;
  }
  return null;
}

async function check(chapter) {
  const { city, region, url } = chapter;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "FriendsOfFigma-HealthCheck/1.0",
      },
      redirect: "follow",
    });
    const finalUrl = res.url;
    const status = res.status;

    if (!res.ok) {
      return { city, region, url, status, finalUrl, ok: false, reason: `HTTP ${status}` };
    }

    const offDomain = !finalUrl.includes("friends.figma.com");
    const redirectedAway =
      finalUrl.replace(/\/$/, "") !== url.replace(/\/$/, "") &&
      !finalUrl.startsWith(url.replace(/\/$/, ""));

    const html = await res.text();
    const members = extractMemberCount(html);

    let reason = null;
    if (offDomain) reason = `redirected off-domain → ${finalUrl}`;
    else if (members === null) reason = "no member count found (possibly empty/removed)";
    else if (redirectedAway) reason = `redirected → ${finalUrl}`;

    return {
      city,
      region,
      url,
      status,
      finalUrl,
      members,
      ok: !reason,
      reason,
    };
  } catch (err) {
    return { city, region, url, status: 0, ok: false, reason: err.message || "Request failed" };
  }
}

async function main() {
  const chapters = JSON.parse(readFileSync(CHAPTERS_PATH, "utf-8"));
  console.log(`Checking ${chapters.length} chapter URLs (concurrency ${CONCURRENCY})…\n`);

  const results = new Array(chapters.length);
  let nextIndex = 0;
  let lastStart = 0;

  async function worker() {
    while (true) {
      const i = nextIndex++;
      if (i >= chapters.length) return;
      const wait = lastStart + START_DELAY_MS - Date.now();
      if (wait > 0) await sleep(wait);
      lastStart = Date.now();
      const r = await check(chapters[i]);
      results[i] = r;
      const tag = r.ok ? "OK " : "BAD";
      const detail = r.ok
        ? `${r.members} members`
        : `${r.reason}`;
      console.log(`  [${tag}] (${i + 1}/${chapters.length}) ${r.city.padEnd(30)} ${detail}`);
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  const bad = results.filter((r) => !r.ok);
  console.log(`\n=== Summary ===`);
  console.log(`Total:       ${results.length}`);
  console.log(`Healthy:     ${results.length - bad.length}`);
  console.log(`Problematic: ${bad.length}`);
  if (bad.length > 0) {
    console.log(`\nProblematic chapters:`);
    for (const r of bad) {
      console.log(`  - ${r.city} (${r.region})`);
      console.log(`      url:    ${r.url}`);
      console.log(`      status: ${r.status}`);
      if (r.finalUrl && r.finalUrl !== r.url) console.log(`      final:  ${r.finalUrl}`);
      console.log(`      reason: ${r.reason}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
