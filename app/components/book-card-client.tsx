"use client";

import Image from "next/image";
import Link from "next/link";
import { useTransition, useOptimistic } from "react";
import { addFavorite, removeFavorite } from "@/lib/actions";
import type { Book } from "@/lib/openlibrary";

export function BookCardClient({
  book,
  isFavorited,
  onFavoriteToggle,
}: {
  book: Book;
  isFavorited: boolean;
  onFavoriteToggle: (olKey: string, added: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [optimisticFav, setOptimisticFav] = useOptimistic(isFavorited);

  function handleToggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      setOptimisticFav(!optimisticFav);
      if (optimisticFav) {
        await removeFavorite(book.olKey);
        onFavoriteToggle(book.olKey, false);
      } else {
        await addFavorite({
          olKey: book.olKey,
          title: book.title,
          author: book.author,
          coverUrl: book.coverUrl,
        });
        onFavoriteToggle(book.olKey, true);
      }
    });
  }

  const detailUrl = `/book/${book.olKey}?title=${encodeURIComponent(book.title)}&author=${encodeURIComponent(book.author)}&cover=${encodeURIComponent(book.coverUrl)}`;

  return (
    <Link href={detailUrl} className="block">
      <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/5">
        {/* Cover */}
        <div className="relative aspect-[2/3] w-full overflow-hidden bg-gradient-to-br from-surface-hover to-border/30">
          <Image
            src={book.coverUrl}
            alt={book.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
          />

          {/* Year badge */}
          {book.firstPublishYear && (
            <div className="absolute left-2 bottom-2 rounded-md bg-black/50 px-1.5 py-0.5 text-[10px] font-medium text-white/80 backdrop-blur-sm">
              {book.firstPublishYear}
            </div>
          )}

          {/* Favorite button */}
          <button
            onClick={handleToggle}
            disabled={isPending}
            className={`absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 ${
              isPending ? "scale-90 opacity-50" : "active:scale-90"
            } ${
              optimisticFav
                ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                : "bg-black/40 text-white opacity-0 backdrop-blur-sm group-hover:opacity-100 hover:bg-black/60"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={optimisticFav ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth={2}
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
          </button>
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col gap-1 p-3.5">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground group-hover:text-accent transition-colors">
            {book.title}
          </h3>
          <p className="text-xs text-muted">{book.author}</p>
        </div>
      </div>
    </Link>
  );
}
