import { getMembers, formatScrapedAt } from "./lib/data";
import Link from "next/link";

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

  const maxMembers = members.length ? Math.max(...members.map((m) => m.members || 0)) : 1;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-fof-border bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5">
          <h1 className="text-xl font-semibold text-fof-ink tracking-tight">
            Friends of Figma
          </h1>
          <p className="text-sm text-fof-muted mt-0.5">
            Chapter rankings by member count
          </p>
          {scrapedAt && (
            <p className="text-xs text-fof-muted mt-2">
              Last updated {formatScrapedAt(scrapedAt)}
            </p>
          )}
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
                    <th className="hidden sm:table-cell py-3 px-4 sm:px-5 w-20" />
                  </tr>
                </thead>
                <tbody>
                  {members.map((row, index) => {
                    const rank = index + 1;
                    const pct = maxMembers > 0 ? (row.members / maxMembers) * 100 : 0;
                    return (
                      <tr key={row.city} className="border-b border-fof-border/80 last:border-0 hover:bg-fof-smoke/40 transition-colors">
                        <td className="py-3.5 px-4 sm:px-5">
                          <span
                            className={
                              rank <= 3
                                ? "inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold bg-fof-purple/12 text-fof-purple"
                                : "text-fof-muted text-sm font-medium"
                            }
                          >
                            {rank}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 sm:px-5">
                          <Link
                            href={row.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-fof-ink hover:text-fof-purple hover:underline"
                          >
                            {row.city}
                          </Link>
                        </td>
                        <td className="py-3.5 px-4 sm:px-5 text-right">
                          <span className="font-semibold tabular-nums text-fof-ink">
                            {row.members.toLocaleString()}
                          </span>
                        </td>
                        <td className="hidden sm:table-cell py-3.5 px-4 sm:px-5">
                          <div className="h-1.5 w-16 min-w-[4rem] rounded-full bg-fof-border overflow-hidden">
                            <div
                              className="h-full rounded-full bg-fof-purple/70 transition-all"
                              style={{ width: `${Math.max(pct, 4)}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="border-t border-fof-border bg-fof-smoke/30 px-4 sm:px-5 py-2 text-xs text-fof-muted">
              Click a chapter to open on friends.figma.com
            </div>
          </div>
        )}

        {!error && members.length > 0 && (
          <p className="mt-8 text-center text-xs text-fof-muted">
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
        )}
      </main>
    </div>
  );
}
