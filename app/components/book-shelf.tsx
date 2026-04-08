"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";

type ShelfBook = {
  olKey: string;
  title: string;
  author: string;
  coverUrl: string | null;
  count?: number;
  names?: string[];
};

export function BookShelf({
  title,
  subtitle,
  books,
  emptyMessage,
}: {
  title: string;
  subtitle?: string;
  books: ShelfBook[];
  emptyMessage?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(dir: "left" | "right") {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.7;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  if (books.length === 0) {
    return (
      <section>
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
        <div className="mt-4 flex items-center justify-center rounded-2xl border border-dashed border-border py-12 text-sm text-muted">
          {emptyMessage ?? "Nothing here yet"}
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-foreground">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => scroll("left")}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button
            onClick={() => scroll("right")}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Scrollable shelf */}
      <div className="relative">
        <div
          ref={scrollRef}
          className="shelf-scroll flex gap-4 overflow-x-auto pb-4"
        >
          {books.map((book) => {
            const detailUrl = `/book/${book.olKey}?title=${encodeURIComponent(book.title)}&author=${encodeURIComponent(book.author)}${book.coverUrl ? `&cover=${encodeURIComponent(book.coverUrl)}` : ""}`;

            return (
              <Link
                key={book.olKey}
                href={detailUrl}
                className="group shrink-0"
              >
                <div className="w-[140px] sm:w-[150px]">
                  {/* Cover */}
                  <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl shadow-md ring-1 ring-black/5 transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl group-hover:shadow-accent/10">
                    {book.coverUrl ? (
                      <Image
                        src={book.coverUrl}
                        alt={book.title}
                        fill
                        className="object-cover"
                        sizes="150px"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-surface-hover to-border/30">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="h-8 w-8 text-muted/30">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                        </svg>
                      </div>
                    )}
                    {/* Heart count */}
                    {book.count && book.count > 0 && (
                      <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-white/90 px-1.5 py-0.5 text-[10px] font-bold text-red-500 shadow-sm backdrop-blur-sm dark:bg-black/70">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-2.5 w-2.5">
                          <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                        </svg>
                        {book.count}
                      </div>
                    )}
                  </div>
                  {/* Shelf plank */}
                  <div className="mx-1 mt-0.5 h-1.5 rounded-b-sm bg-shelf shadow-sm dark:bg-shelf" />
                  {/* Info */}
                  <div className="mt-2 px-0.5">
                    <h3 className="line-clamp-1 text-xs font-semibold text-foreground group-hover:text-accent transition-colors">
                      {book.title}
                    </h3>
                    <p className="line-clamp-1 text-[11px] text-muted">{book.author}</p>
                    {book.names && book.names.length > 0 && (
                      <p className="mt-0.5 truncate text-[10px] text-muted/60">
                        {book.names.slice(0, 2).join(", ")}
                        {book.names.length > 2 ? ` +${book.names.length - 2}` : ""}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        {/* Fade edge - right only */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent" />
      </div>
    </section>
  );
}
