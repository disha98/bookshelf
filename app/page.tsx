import { AuthButtons } from "./auth-buttons";
import { syncUser } from "@/lib/sync-user";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getUserFavoriteKeys } from "@/lib/actions";
import { SearchSection } from "@/app/components/search-section";
import { popularBooks } from "@/lib/popular-books";
import Image from "next/image";
import Link from "next/link";

type FavoriteRow = {
  ol_key: string;
  title: string;
  author: string;
  cover_url: string | null;
  user_id: string;
  users: { first_name: string | null; image_url: string | null } | null;
};

export default async function Home() {
  const user = await syncUser();

  if (!user) {
    const showcase = popularBooks.slice(0, 5);
    return (
      <div className="flex flex-1 flex-col">
        {/* Hero */}
        <div className="relative overflow-hidden border-b border-border bg-gradient-to-b from-accent/5 via-background to-background">
          <div className="mx-auto flex max-w-6xl flex-col items-center px-6 pb-16 pt-20 text-center">
            {/* Floating covers */}
            <div className="mb-10 flex items-end justify-center gap-3 sm:gap-4">
              {showcase.map((book, i) => {
                const offsets = [-14, 6, -4, 10, -8];
                const rotations = [-3, 1.5, 0, -2, 2.5];
                return (
                  <div
                    key={book.olKey}
                    className="animate-fade-in-up hidden sm:block"
                    style={{
                      animationDelay: `${i * 80}ms`,
                      transform: `translateY(${offsets[i]}px) rotate(${rotations[i]}deg)`,
                    }}
                  >
                    <div className="relative h-[160px] w-[107px] overflow-hidden rounded-xl shadow-xl shadow-accent/10 ring-1 ring-border/50 transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
                      <Image src={book.coverUrl} alt={book.title} fill className="object-cover" />
                    </div>
                  </div>
                );
              })}
              {showcase.slice(0, 3).map((book, i) => (
                <div
                  key={`m-${book.olKey}`}
                  className="animate-fade-in-up sm:hidden"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="relative h-[130px] w-[87px] overflow-hidden rounded-xl shadow-xl shadow-accent/10 ring-1 ring-border/50">
                    <Image src={book.coverUrl} alt={book.title} fill className="object-cover" />
                  </div>
                </div>
              ))}
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: "350ms" }}>
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                Your community{" "}
                <span className="text-accent">bookshelf</span>
              </h1>
              <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-muted">
                Discover books, save your favorites, and see what everyone&apos;s
                reading. All in one place.
              </p>
              <div className="mt-6">
                <AuthButtons />
              </div>
            </div>
          </div>
          {/* Decorative dots */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/5 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 bottom-0 h-48 w-48 rounded-full bg-accent/5 blur-3xl" />
        </div>

        {/* Featured books teaser */}
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
          <div className="mb-6 flex items-center gap-3">
            <h2 className="whitespace-nowrap text-xs font-semibold uppercase tracking-widest text-muted">
              Trending now
            </h2>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {popularBooks.map((book, i) => (
              <div
                key={book.olKey}
                className="animate-fade-in-up group"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="overflow-hidden rounded-xl border border-border bg-surface transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/5">
                  <div className="relative aspect-[2/3] w-full overflow-hidden">
                    <Image
                      src={book.coverUrl}
                      alt={book.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="line-clamp-1 text-sm font-semibold text-foreground">{book.title}</h3>
                    <p className="text-xs text-muted">{book.author}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- SIGNED IN ---
  const [{ data: favorites }, favoriteKeys] = await Promise.all([
    supabaseAdmin
      .from("favorites")
      .select("ol_key, title, author, cover_url, user_id, users(first_name, image_url)")
      .order("created_at", { ascending: false }),
    getUserFavoriteKeys(),
  ]);

  // Aggregate community favorites
  const bookMap = new Map<
    string,
    {
      olKey: string;
      title: string;
      author: string;
      coverUrl: string | null;
      count: number;
      names: string[];
    }
  >();

  for (const fav of (favorites ?? []) as FavoriteRow[]) {
    const existing = bookMap.get(fav.ol_key);
    const name = fav.users?.first_name ?? "Someone";

    if (existing) {
      existing.count++;
      if (!existing.names.includes(name)) existing.names.push(name);
    } else {
      bookMap.set(fav.ol_key, {
        olKey: fav.ol_key,
        title: fav.title,
        author: fav.author,
        coverUrl: fav.cover_url,
        count: 1,
        names: [name],
      });
    }
  }

  const communityBooks = [...bookMap.values()].sort(
    (a, b) => b.count - a.count
  );

  // Stats
  const totalFavs = favorites?.length ?? 0;
  const uniqueBooks = communityBooks.length;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      {/* Compact hero banner */}
      <section className="relative mt-6 overflow-hidden rounded-2xl bg-gradient-to-br from-accent/10 via-accent/5 to-transparent p-6 sm:p-8">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Welcome back, {user.firstName || "Reader"}
            </h1>
            <p className="mt-1 text-sm text-muted">
              Explore, favorite, and share books with the community.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="flex flex-col items-center rounded-xl bg-surface/80 px-5 py-3 ring-1 ring-border/50 backdrop-blur-sm">
              <span className="text-2xl font-bold text-accent">{uniqueBooks}</span>
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted">Books</span>
            </div>
            <div className="flex flex-col items-center rounded-xl bg-surface/80 px-5 py-3 ring-1 ring-border/50 backdrop-blur-sm">
              <span className="text-2xl font-bold text-red-500">{totalFavs}</span>
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted">Favorites</span>
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/10 blur-2xl" />
      </section>

      {/* Community Bookshelf */}
      <section id="bookshelf" className="scroll-mt-20 mt-10">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
              Community Bookshelf
            </h2>
            <p className="mt-0.5 text-sm text-muted">
              {communityBooks.length > 0
                ? `${communityBooks.length} book${communityBooks.length !== 1 ? "s" : ""} loved by readers`
                : "See what everyone is reading"}
            </p>
          </div>
          <a
            href="#search"
            className="flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-accent-light active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add books
          </a>
        </div>

        {communityBooks.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-surface/50 py-14 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-7 w-7 text-accent">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-foreground">The bookshelf is empty</p>
              <p className="mt-1 text-sm text-muted">Be the first to add a favorite below</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {communityBooks.map((book, i) => {
              const displayNames = book.names.slice(0, 2).join(", ");
              const extra = book.names.length > 2 ? ` +${book.names.length - 2}` : "";
              const detailUrl = `/book/${book.olKey}?title=${encodeURIComponent(book.title)}&author=${encodeURIComponent(book.author)}${book.coverUrl ? `&cover=${encodeURIComponent(book.coverUrl)}` : ""}`;

              return (
                <Link
                  key={book.olKey}
                  href={detailUrl}
                  className="animate-fade-in-up block"
                  style={{ animationDelay: `${Math.min(i, 9) * 40}ms` }}
                >
                  <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/5">
                    <div className="relative aspect-[2/3] w-full overflow-hidden bg-gradient-to-br from-surface-hover to-border/30">
                      {book.coverUrl ? (
                        <Image
                          src={book.coverUrl}
                          alt={book.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="h-8 w-8 text-muted/30">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                          </svg>
                        </div>
                      )}
                      {/* Heart badge */}
                      <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-xs font-bold text-red-500 shadow-sm backdrop-blur-sm dark:bg-black/70">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3">
                          <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                        </svg>
                        {book.count}
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col gap-1 p-3.5">
                      <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground group-hover:text-accent transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-xs text-muted">{book.author}</p>
                      <p className="mt-1 truncate text-[11px] text-muted/60">
                        Loved by {displayNames}{extra}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Divider */}
      <div className="my-12 flex items-center gap-4">
        <div className="h-px flex-1 bg-border" />
        <div className="flex items-center gap-2 rounded-full bg-surface px-4 py-1.5 ring-1 ring-border">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-3.5 w-3.5 text-accent">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <span className="text-xs font-semibold uppercase tracking-widest text-muted">
            Discover
          </span>
        </div>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Search Section */}
      <SearchSection initialFavoriteKeys={favoriteKeys} />
    </div>
  );
}
