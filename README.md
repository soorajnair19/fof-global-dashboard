# Friends of Figma – Chapter member scraper

Automated scraper for Friends of Figma community chapter member counts. Each chapter’s Bevy page is fetched, the member count is extracted, and results are stored as JSON for use by a dashboard (or other tools).

**Live dashboard:** [https://fof-global-dashboard.vercel.app/](https://fof-global-dashboard.vercel.app/)

## Project layout

- **`scrape/chapters.json`** – List of chapters (city + Bevy URL). Edit this to add or remove chapters.
- **`scrape/scrapeMembers.js`** – Scraper script: reads chapters, fetches pages, writes results.
- **`data/members.json`** – Output: one object per chapter with `city`, `members`, `url`, `scrapedAt` (and optional `error` if a run failed for that chapter).
- **`.github/workflows/scrape.yml`** – GitHub Action that runs the scraper on a schedule and commits updated `data/members.json`.

## Run the scraper locally

1. Install dependencies (from the repo root):

   ```bash
   npm install
   ```

2. Run the scraper:

   ```bash
   npm run scrape
   ```

   Or:

   ```bash
   node scrape/scrapeMembers.js
   ```

Results are written to **`data/members.json`**. The script waits ~1.5–2 seconds between requests and keeps going if a chapter fails (that chapter gets `members: 0` and an `error` field in the output).

## Automation (GitHub Actions)

- **Schedule:** The workflow runs once per day at 00:00 UTC.
- **Manual run:** In GitHub, open **Actions → “Scrape chapter members” → Run workflow**.
- **After the run:** The job installs dependencies, runs the scraper, then commits and pushes the updated **`data/members.json`** to the same branch (so the repo always holds the latest counts).

No secrets are required for a public repo; the default `GITHUB_TOKEN` is used to push the commit.

## Dashboard

A Next.js dashboard visualizes the rankings (chapter, member count, link to friends.figma.com).

- **Live (Vercel):** [https://fof-global-dashboard.vercel.app/]
- **Local:** From the repo root run `npm run dev`, then open [http://localhost:3000](http://localhost:3000). Data is read from **`data/members.json`**.
- **Deploy (e.g. Vercel):** Set **`NEXT_PUBLIC_DATA_URL`** to your GitHub raw URL (e.g. `https://raw.githubusercontent.com/soorajnair19/fof-global-dashboard/main/data/members.json`) so the site shows the latest data after each scrape. See `.env.example`.

Commands: `npm run dev` (develop), `npm run build` then `npm run start` (production).

## Tuning the scraper

Member count is inferred from the Bevy page HTML. If your Bevy pages use different markup, edit **`extractMemberCount()`** in `scrape/scrapeMembers.js` and adjust the selectors or regex (see comments in that function).

## License

MIT
