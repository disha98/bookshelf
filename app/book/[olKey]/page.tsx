import { getBookDetail } from "@/lib/openlibrary";
import { getUserFavoriteKeys } from "@/lib/actions";
import { FavoriteButton } from "@/app/components/favorite-button";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default async function BookDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ olKey: string }>;
  searchParams: Promise<{ title?: string; author?: string; cover?: string }>;
}) {
  const { olKey } = await params;
  const query = await searchParams;

  const [detail, { userId }] = await Promise.all([
    getBookDetail(olKey),
    auth(),
  ]);

  if (!detail) notFound();

  const favoriteKeys = userId ? await getUserFavoriteKeys() : [];
  const isFavorited = favoriteKeys.includes(olKey);

  // Use the cover from query params (passed from card click) or from detail
  const coverUrl =
    query.cover ||
    (detail.covers.length > 0
      ? `https://covers.openlibrary.org/b/id/${detail.covers[0]}-L.jpg`
      : null);

  const title = query.title || detail.title;
  const author = query.author || "Unknown";

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {/* Back */}
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="h-4 w-4"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Back to bookshelf
      </Link>

      <div className="flex flex-col gap-10 sm:flex-row">
        {/* Cover */}
        <div className="shrink-0">
          {coverUrl ? (
            <div className="relative mx-auto h-[380px] w-[250px] overflow-hidden rounded-2xl shadow-2xl shadow-accent/10 ring-1 ring-border sm:mx-0">
              <Image
                src={coverUrl}
                alt={title}
                fill
                className="object-cover"
                priority
              />
            </div>
          ) : (
            <div className="mx-auto flex h-[380px] w-[250px] items-center justify-center rounded-2xl bg-gradient-to-br from-surface-hover to-border/30 ring-1 ring-border sm:mx-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={0.8}
                stroke="currentColor"
                className="h-16 w-16 text-muted/30"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-foreground">
            {title}
          </h1>
          <p className="mt-2 text-lg text-muted">{author}</p>

          {/* Favorite button */}
          {userId && (
            <div className="mt-5">
              <FavoriteButton
                olKey={olKey}
                title={title}
                author={author}
                coverUrl={coverUrl ?? ""}
                isFavorited={isFavorited}
              />
            </div>
          )}

          {/* Description */}
          {detail.description && (
            <div className="mt-8">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">
                About this book
              </h2>
              <div className="rounded-xl bg-surface p-5 ring-1 ring-border">
                <p className="text-sm leading-relaxed text-foreground/80">
                  {detail.description.length > 800
                    ? detail.description.slice(0, 800) + "..."
                    : detail.description}
                </p>
              </div>
            </div>
          )}

          {/* Subjects */}
          {detail.subjects.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">
                Subjects
              </h2>
              <div className="flex flex-wrap gap-2">
                {detail.subjects.map((subject) => (
                  <span
                    key={subject}
                    className="rounded-lg bg-accent/8 px-3 py-1.5 text-xs font-medium text-accent"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Characters & Places */}
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {detail.subjectPeople.length > 0 && (
              <div>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">
                  Characters
                </h2>
                <div className="flex flex-wrap gap-2">
                  {detail.subjectPeople.map((person) => (
                    <span
                      key={person}
                      className="rounded-lg bg-surface-hover px-3 py-1.5 text-xs font-medium text-foreground/70"
                    >
                      {person}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {detail.subjectPlaces.length > 0 && (
              <div>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">
                  Places
                </h2>
                <div className="flex flex-wrap gap-2">
                  {detail.subjectPlaces.map((place) => (
                    <span
                      key={place}
                      className="rounded-lg bg-surface-hover px-3 py-1.5 text-xs font-medium text-foreground/70"
                    >
                      {place}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Open Library link */}
          <div className="mt-8 border-t border-border pt-6">
            <a
              href={`https://openlibrary.org/works/${olKey}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-accent transition-colors hover:text-accent-light"
            >
              View on Open Library
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-3.5 w-3.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
