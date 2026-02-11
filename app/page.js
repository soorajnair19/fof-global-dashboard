import { getMembers, getChapters, formatScrapedAt } from "./lib/data";
import DashboardTabs from "./components/DashboardTabs";
import NextUpdateOn from "./components/NextUpdateOn";
import ThemeToggle from "./components/ThemeToggle";

export const revalidate = 60;

export default async function DashboardPage() {
  let members = [];
  let chapters = [];
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

  try {
    chapters = await getChapters();
    if (!Array.isArray(chapters)) chapters = [];
  } catch {
    chapters = [];
  }

  return (
    <div className="min-h-screen bg-[#faf8ff] dark:bg-[#0a0a0a]">
      <header className="border-b border-fof-border bg-white dark:bg-[#171717] backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 flex justify-between items-start gap-4">
          <div>
          <h1 className="text-xl font-semibold text-[#1e1b4b] dark:text-[#fafafa] tracking-tight">
          Friends of Figma
          </h1>
          <p className="text-sm text-fof-muted dark:text-[#a1a1a1] mt-0.5">
            Chapter rankings by member count
          </p>
          <p className="text-xs text-fof-muted dark:text-[#a1a1a1] mt-2">
            {scrapedAt && (
              <>
                Last updated {formatScrapedAt(scrapedAt)}
                <span className="mx-1.5">|</span>
              </>
            )}
            <NextUpdateOn />
          </p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {error && (
          <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-[#404040] text-amber-800 dark:text-amber-200 px-4 py-3 text-sm">
            Could not load data: {error}
          </div>
        )}

        {!error && members.length === 0 && chapters.length === 0 && (
          <div className="rounded-xl bg-slate-100 dark:bg-[#171717] dark:border dark:border-[#262626] text-slate-600 dark:text-[#a1a1a1] px-4 py-8 text-center text-sm">
            No chapter data yet. Run the scraper or set NEXT_PUBLIC_DATA_URL.
          </div>
        )}

        {!error && (members.length > 0 || chapters.length > 0) && (
          <DashboardTabs members={members} chapters={chapters} />
        )}

        {!error && (members.length > 0 || chapters.length > 0) && (
          <footer className="mt-8 text-center text-xs text-fof-muted dark:text-[#a1a1a1] space-y-1">
            <p>
              Data is updated daily. View each chapter at{" "}
              <a
                href="https://friends.figma.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-fof-purple dark:text-fof-accent hover:underline"
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
