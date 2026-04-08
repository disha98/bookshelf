"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "./supabase-admin";
import { searchBooks as searchOL, type Book } from "./openlibrary";

export async function addFavorite(book: {
  title: string;
  author: string;
  coverUrl: string | null;
  olKey: string;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  await supabaseAdmin.from("favorites").upsert(
    {
      user_id: userId,
      title: book.title,
      author: book.author,
      cover_url: book.coverUrl,
      ol_key: book.olKey,
    },
    { onConflict: "user_id,ol_key" }
  );

  revalidatePath("/");
}

export async function removeFavorite(olKey: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  await supabaseAdmin
    .from("favorites")
    .delete()
    .eq("user_id", userId)
    .eq("ol_key", olKey);

  revalidatePath("/");
}

export async function getUserFavoriteKeys(): Promise<string[]> {
  const { userId } = await auth();
  if (!userId) return [];

  const { data } = await supabaseAdmin
    .from("favorites")
    .select("ol_key")
    .eq("user_id", userId);

  return (data ?? []).map((row: { ol_key: string }) => row.ol_key);
}

export async function searchBooksAction(
  query: string,
  page: number = 1
): Promise<{ books: Book[]; hasMore: boolean }> {
  return searchOL(query, page);
}

export async function getTrendingBooks(
  page: number = 1
): Promise<{ books: Book[]; hasMore: boolean }> {
  // Use Open Library's trending endpoint with pagination
  const limit = 50;
  const offset = (page - 1) * limit;

  const res = await fetch(
    `https://openlibrary.org/search.json?q=subject:fiction&sort=rating&limit=${limit}&offset=${offset}&fields=key,title,author_name,cover_i,first_publish_year`
  );
  if (!res.ok) return { books: [], hasMore: false };

  const data = await res.json();
  const totalFound: number = data.numFound ?? 0;

  const books: Book[] = [];
  for (const doc of data.docs ?? []) {
    if (!doc.cover_i) continue;
    books.push({
      olKey: (doc.key as string).replace("/works/", ""),
      title: doc.title,
      author: doc.author_name?.[0] ?? "Unknown",
      coverUrl: `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`,
      firstPublishYear: doc.first_publish_year ?? undefined,
    });
  }

  const hasMore = offset + limit < Math.min(totalFound, 500); // Cap at 500
  return { books, hasMore };
}
