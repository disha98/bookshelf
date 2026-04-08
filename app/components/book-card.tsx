import Image from "next/image";

export function BookCard({
  title,
  author,
  coverUrl,
  children,
  meta,
}: {
  title: string;
  author: string;
  coverUrl: string | null;
  children?: React.ReactNode;
  meta?: React.ReactNode;
}) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800/80 dark:bg-zinc-900/80">
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1}
              stroke="currentColor"
              className="h-10 w-10 text-zinc-300 dark:text-zinc-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
              />
            </svg>
            <span className="text-center text-xs text-zinc-400 dark:text-zinc-500">
              {title}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-900 dark:text-zinc-50">
          {title}
        </h3>
        <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
          {author}
        </p>
        {meta && <div className="mt-1">{meta}</div>}
        {children && <div className="mt-auto pt-2">{children}</div>}
      </div>
    </div>
  );
}
