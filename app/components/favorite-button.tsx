"use client";

import { useTransition, useOptimistic } from "react";
import { addFavorite, removeFavorite } from "@/lib/actions";

export function FavoriteButton({
  olKey,
  title,
  author,
  coverUrl,
  isFavorited,
}: {
  olKey: string;
  title: string;
  author: string;
  coverUrl: string;
  isFavorited: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [optimisticFav, setOptimisticFav] = useOptimistic(isFavorited);

  function handleClick() {
    startTransition(async () => {
      setOptimisticFav(!optimisticFav);
      if (optimisticFav) {
        await removeFavorite(olKey);
      } else {
        await addFavorite({ olKey, title, author, coverUrl });
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`inline-flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
        isPending ? "scale-95 opacity-60" : "active:scale-95"
      } ${
        optimisticFav
          ? "bg-red-500 text-white shadow-lg shadow-red-500/20 hover:bg-red-600"
          : "bg-accent text-white shadow-sm hover:bg-accent-light"
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
      {optimisticFav ? "Favorited" : "Add to favorites"}
    </button>
  );
}
