import { AuthButtons } from "./auth-buttons";
import { syncUser } from "@/lib/sync-user";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getUserFavoriteKeys } from "@/lib/actions";
import { SearchSection } from "@/app/components/search-section";
import { BookShelf } from "@/app/components/book-shelf";
import { popularBooks } from "@/lib/popular-books";
import Image from "next/image";

type FavoriteRow = {
  ol_key: string;
  title: string;
  author: string;
  cover_url: string | null;
  user_id: string;
  created_at: string;
  users: { first_name: string | null } | null;
};

export default async function Home() {
  const user = await syncUser();

  /* ========== SIGNED OUT ========== */
  if (!user) {
    return (
      <div className="flex flex-1 flex-col">
        {/* Hero */}
        <section className="relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-accent-soft via-background to-background" />
          <div className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-accent/8 blur-3xl" />
          <div className="pointer-events-none absolute -left-32 top-20 h-80 w-80 rounded-full bg-accent/5 blur-3xl" />

          <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6">
            <div className="flex flex-col items-center text-center">
              {/* Badge */}
              <div className="animate-fade-in-up mb-6 inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-xs font-semibold text-accent">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
                  <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
                Share what you&apos;re reading
              </div>

              {/* Title */}
              <h1 className="animate-fade-in-up text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl" style={{ animationDelay: "100ms" }}>
                Your community
                <br />
                <span className="bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent">bookshelf</span>
              </h1>

              <p className="animate-fade-in-up mx-auto mt-5 max-w-lg text-base leading-relaxed text-muted sm:text-lg" style={{ animationDelay: "200ms" }}>
                Discover millions of books, curate your favorites, and explore what your friends are reading.
              </p>

              <div className="animate-fade-in-up mt-8" style={{ animationDelay: "300ms" }}>
                <AuthButtons />
              </div>
            </div>

            {/* Floating book covers carousel */}
            <div className="animate-fade-in mt-14 flex justify-center gap-4 sm:gap-5" style={{ animationDelay: "400ms" }}>
              {popularBooks.slice(0, 6).map((book, i) => {
                const delays = [0, 0.5, 1, 1.5, 0.3, 0.8];
                return (
                  <div
                    key={book.olKey}
                    className={`${i > 3 ? "hidden lg:block" : i > 2 ? "hidden sm:block" : ""}`}
                    style={{ animation: `float 4s ease-in-out ${delays[i]}s infinite` }}
                  >
                    <div className="relative h-[200px] w-[133px] overflow-hidden rounded-2xl shadow-2xl shadow-black/10 ring-1 ring-black/5 transition-transform duration-300 hover:scale-105">
                      <Image src={book.coverUrl} alt={book.title} fill className="object-cover" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Features row */}
        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z", title: "Discover", desc: "Search millions of books from Open Library" },
              { icon: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z", title: "Favorite", desc: "Save the books you love to your personal shelf" },
              { icon: "M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z", title: "Community", desc: "See what everyone is reading and get inspired" },
            ].map((f, i) => (
              <div
                key={f.title}
                className="animate-fade-in-up rounded-2xl border border-border bg-surface p-6 transition-shadow hover:shadow-md"
                style={{ animationDelay: `${500 + i * 100}ms` }}
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-accent">
                    <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-foreground">{f.title}</h3>
                <p className="mt-1 text-sm text-muted">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Trending books teaser */}
        <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
          <BookShelf
            title="Trending right now"
            subtitle="Sign in to add these to your shelf"
            books={popularBooks}
          />
        </section>
      </div>
    );
  }

  /* ========== SIGNED IN ========== */
  const [{ data: favorites }, favoriteKeys] = await Promise.all([
    supabaseAdmin
      .from("favorites")
      .select("ol_key, title, author, cover_url, user_id, created_at, users(first_name)")
      .order("created_at", { ascending: false }),
    getUserFavoriteKeys(),
  ]);

  // Aggregate community favorites
  const bookMap = new Map<string, {
    olKey: string; title: string; author: string; coverUrl: string | null;
    count: number; names: string[];
  }>();

  // Also collect current user's favorites
  const myFavorites: typeof communityBooks = [];

  for (const fav of (favorites ?? []) as FavoriteRow[]) {
    const name = fav.users?.first_name ?? "Someone";
    const existing = bookMap.get(fav.ol_key);

    if (existing) {
      existing.count++;
      if (!existing.names.includes(name)) existing.names.push(name);
    } else {
      bookMap.set(fav.ol_key, {
        olKey: fav.ol_key, title: fav.title, author: fav.author,
        coverUrl: fav.cover_url, count: 1, names: [name],
      });
    }

    if (fav.user_id === user.id) {
      myFavorites.push({
        olKey: fav.ol_key, title: fav.title, author: fav.author,
        coverUrl: fav.cover_url, count: 0, names: [],
      });
    }
  }

  const communityBooks = [...bookMap.values()].sort((a, b) => b.count - a.count);
  const recentlyAdded = (favorites ?? []).slice(0, 15).map((f: FavoriteRow) => ({
    olKey: f.ol_key, title: f.title, author: f.author,
    coverUrl: f.cover_url, count: 0,
    names: [f.users?.first_name ?? "Someone"],
  }));

  const totalFavs = favorites?.length ?? 0;
  const uniqueBooks = communityBooks.length;
  const uniqueReaders = new Set((favorites ?? []).map((f: FavoriteRow) => f.user_id)).size;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">

      {/* Welcome hero card */}
      <section className="mt-6 overflow-hidden rounded-2xl bg-gradient-to-br from-accent/10 via-accent-soft to-transparent ring-1 ring-accent/10">
        <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="text-sm font-medium text-accent">Welcome back</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              {user.firstName || "Reader"}&apos;s Bookshelf
            </h1>
            <p className="mt-2 text-sm text-muted">
              Explore new books, manage your favorites, and see what the community loves.
            </p>
          </div>
          {/* Stats bento */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {[
              { value: uniqueReaders, label: "Readers", color: "text-accent" },
              { value: uniqueBooks, label: "Books", color: "text-foreground" },
              { value: totalFavs, label: "Favorites", color: "text-red-500" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center rounded-xl bg-surface/80 px-4 py-3 ring-1 ring-border/50 backdrop-blur-sm">
                <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* My Favorites shelf */}
      {myFavorites.length > 0 && (
        <section className="mt-10">
          <BookShelf
            title="My Favorites"
            subtitle={`${myFavorites.length} book${myFavorites.length !== 1 ? "s" : ""} on your shelf`}
            books={myFavorites}
          />
        </section>
      )}

      {/* Community most loved */}
      <section className="mt-10">
        <BookShelf
          title="Most Loved"
          subtitle="Top picks across the community"
          books={communityBooks}
          emptyMessage="Be the first to add a favorite — scroll down to discover books!"
        />
      </section>

      {/* Recently added */}
      {recentlyAdded.length > 0 && (
        <section className="mt-10">
          <BookShelf
            title="Recently Added"
            subtitle="Fresh picks from the community"
            books={recentlyAdded}
          />
        </section>
      )}

      {/* Discover divider */}
      <div id="discover" className="scroll-mt-20 my-12 flex items-center gap-4">
        <div className="h-px flex-1 bg-border" />
        <div className="flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-3.5 w-3.5 text-accent">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <span className="text-xs font-bold uppercase tracking-widest text-accent">Discover</span>
        </div>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Search Section with infinite scroll */}
      <SearchSection initialFavoriteKeys={favoriteKeys} />
    </div>
  );
}
