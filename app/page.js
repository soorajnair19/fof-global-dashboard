import { getMembers, formatScrapedAt, getNextMidnightUTC, formatNextUpdateUTC } from "./lib/data";
import DashboardTabs from "./components/DashboardTabs";

export const revalidate = 60;

export default async function DashboardPage() {
  let members = [];
  let scrapedAt = null;
  let error = null;

  try {
    const data = await getMembers();
    if (!Array.isArray(data)) throw new Error("Invalid data format");
    members = data
      .filter((row) => row.members != null)
      .sort((a, b) => (b.members || 0) - (a.members || 0));
    if (members.length > 0 && members[0].scrapedAt) {
      scrapedAt = members[0].scrapedAt;
    }
  } catch (e) {
    error = e.message;
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-fof-border bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5">
          <h1 className="text-xl font-semibold text-fof-ink tracking-tight">
            Friends of Figma
          </h1>
          <p className="text-sm text-fof-muted mt-0.5">
            Chapter rankings by member count
          </p>
          <p className="text-xs text-fof-muted mt-2">
            {scrapedAt && (
              <>
                Last updated {formatScrapedAt(scrapedAt)}
                <span className="mx-1.5">|</span>
              </>
            )}
            Next update on {formatNextUpdateUTC(getNextMidnightUTC())}
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {error && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 text-sm">
            Could not load data: {error}
          </div>
        )}

        {!error && members.length === 0 && (
          <div className="rounded-xl bg-slate-100 text-slate-600 px-4 py-8 text-center text-sm">
            No chapter data yet. Run the scraper or set NEXT_PUBLIC_DATA_URL.
          </div>
        )}

        {!error && members.length > 0 && (
          <DashboardTabs members={members} />
        )}

        {!error && members.length > 0 && (
          <footer className="mt-8 text-center text-xs text-fof-muted space-y-1">
            <p>
              Data is updated daily. View each chapter at{" "}
              <a
                href="https://friends.figma.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-fof-purple hover:underline"
              >
                friends.figma.com
              </a>
              .
            </p>
            <p>Built with 💙 by FOF Mumbai</p>
          </footer>
        )}
      </main>
    </div>
  );
}
