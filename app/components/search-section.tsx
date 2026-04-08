"use client";

import { useState, useTransition, useRef, useCallback, useEffect } from "react";
import { searchBooksAction, getTrendingBooks } from "@/lib/actions";
import type { Book } from "@/lib/openlibrary";
import { BookCardClient } from "./book-card-client";

export function SearchSection({
  initialFavoriteKeys,
}: {
  initialFavoriteKeys: string[];
}) {
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [mode, setMode] = useState<"trending" | "search">("trending");
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0); // 0 = not loaded yet
  const [isPending, startTransition] = useTransition();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [favoriteKeys, setFavoriteKeys] = useState(new Set(initialFavoriteKeys));
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Load trending books on mount
  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { books: initial, hasMore: more } = await getTrendingBooks(1);
      if (!cancelled) {
        setBooks(initial);
        setHasMore(more);
        setPage(1);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      handleClear();
      return;
    }
    setActiveQuery(trimmed);
    setMode("search");
    setPage(1);
    startTransition(async () => {
      const { books: results, hasMore: more } = await searchBooksAction(trimmed, 1);
      setBooks(results);
      setHasMore(more);
    });
  }

  function handleClear() {
    setQuery("");
    setActiveQuery("");
    setMode("trending");
    setBooks([]);
    setHasMore(true);
    setPage(0);
    // Reload trending
    getTrendingBooks(1).then(({ books: initial, hasMore: more }) => {
      setBooks(initial);
      setHasMore(more);
      setPage(1);
    });
  }

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || page === 0) return;
    setIsLoadingMore(true);
    const nextPage = page + 1;

    const { books: newBooks, hasMore: more } =
      mode === "search"
        ? await searchBooksAction(activeQuery, nextPage)
        : await getTrendingBooks(nextPage);

    // Deduplicate by olKey
    setBooks((prev) => {
      const existingKeys = new Set(prev.map((b) => b.olKey));
      const unique = newBooks.filter((b) => !existingKeys.has(b.olKey));
      return [...prev, ...unique];
    });
    setHasMore(more);
    setPage(nextPage);
    setIsLoadingMore(false);
  }, [isLoadingMore, hasMore, page, mode, activeQuery]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!hasMore || page === 0) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "600px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, page, loadMore]);

  function onFavoriteToggle(olKey: string, added: boolean) {
    setFavoriteKeys((prev) => {
      const next = new Set(prev);
      if (added) next.add(olKey);
      else next.delete(olKey);
      return next;
    });
  }

  const isInitialLoad = page === 0;
  const totalShown = books.length;

  return (
    <section id="search" className="scroll-mt-20">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, author, or keyword..."
          className="w-full rounded-2xl border border-border bg-surface py-4 pl-12 pr-32 text-sm text-foreground shadow-sm placeholder:text-muted transition-all focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/10"
        />
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 gap-1.5">
          {(query || mode === "search") && (
            <button
              type="button"
              onClick={handleClear}
              className="rounded-xl px-3 py-2 text-xs font-medium text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
            >
              Clear
            </button>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="rounded-xl bg-accent px-5 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-accent-light active:scale-95 disabled:opacity-50"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                  <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                </svg>
                Searching
              </span>
            ) : (
              "Search"
            )}
          </button>
        </div>
      </form>

      {/* Label */}
      <div className="mb-5 mt-8 flex items-center gap-3">
        <h2 className="whitespace-nowrap text-xs font-semibold uppercase tracking-widest text-muted">
          {isPending
            ? "Searching..."
            : mode === "trending"
            ? `Popular books${totalShown > 0 ? ` · ${totalShown}` : ""}`
            : totalShown > 0
            ? `${totalShown} results${hasMore ? "+" : ""} for "${activeQuery}"`
            : "No results"}
        </h2>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Loading skeleton */}
      {isPending || isInitialLoad ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-border bg-surface"
            >
              <div className="aspect-[2/3] w-full animate-shimmer bg-surface-hover" />
              <div className="space-y-2 p-3.5">
                <div className="h-4 w-3/4 animate-shimmer rounded bg-surface-hover" />
                <div className="h-3 w-1/2 animate-shimmer rounded bg-surface-hover" />
              </div>
            </div>
          ))}
        </div>
      ) : mode === "search" && books.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-hover">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-7 w-7 text-muted"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <p className="font-medium text-foreground">
            No results for &ldquo;{activeQuery}&rdquo;
          </p>
          <p className="text-sm text-muted">Try a different title or author</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {books.map((book, i) => (
              <div
                key={book.olKey}
                className="animate-fade-in-up"
                style={{ animationDelay: `${Math.min(i, 9) * 40}ms` }}
              >
                <BookCardClient
                  book={book}
                  isFavorited={favoriteKeys.has(book.olKey)}
                  onFavoriteToggle={onFavoriteToggle}
                />
              </div>
            ))}
          </div>

          {/* Infinite scroll sentinel */}
          {hasMore && (
            <div ref={sentinelRef} className="flex items-center justify-center py-10">
              {isLoadingMore && (
                <div className="flex items-center gap-2 text-sm text-muted">
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                  </svg>
                  Loading more books...
                </div>
              )}
            </div>
          )}

          {!hasMore && books.length > 0 && (
            <p className="py-8 text-center text-sm text-muted">
              You&apos;ve seen all {books.length} books
            </p>
          )}
        </>
      )}
    </section>
  );
}
