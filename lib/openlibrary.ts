export type Book = {
  olKey: string;
  title: string;
  author: string;
  coverUrl: string;
  firstPublishYear?: number;
};

export type BookDetail = {
  olKey: string;
  title: string;
  description: string | null;
  covers: number[];
  subjects: string[];
  subjectPeople: string[];
  subjectPlaces: string[];
};

export async function searchBooks(
  query: string,
  page: number = 1
): Promise<{ books: Book[]; hasMore: boolean }> {
  const limit = 50;
  const offset = (page - 1) * limit;

  const res = await fetch(
    `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}&fields=key,title,author_name,cover_i,first_publish_year`
  );
  if (!res.ok) return { books: [], hasMore: false };

  const data = await res.json();
  const totalFound: number = data.numFound ?? 0;

  const books: Book[] = [];
  for (const doc of data.docs ?? []) {
    if (!doc.cover_i) continue; // Skip books without covers

    books.push({
      olKey: (doc.key as string).replace("/works/", ""),
      title: doc.title,
      author: doc.author_name?.[0] ?? "Unknown",
      coverUrl: `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`,
      firstPublishYear: doc.first_publish_year ?? undefined,
    });
  }

  return { books, hasMore: offset + limit < totalFound };
}

export async function getBookDetail(olKey: string): Promise<BookDetail | null> {
  const res = await fetch(`https://openlibrary.org/works/${olKey}.json`);
  if (!res.ok) return null;

  const data = await res.json();

  let description: string | null = null;
  if (typeof data.description === "string") {
    description = data.description;
  } else if (data.description?.value) {
    description = data.description.value;
  }

  return {
    olKey,
    title: data.title ?? "Unknown",
    description,
    covers: data.covers ?? [],
    subjects: (data.subjects ?? []).slice(0, 12),
    subjectPeople: (data.subject_people ?? []).slice(0, 6),
    subjectPlaces: (data.subject_places ?? []).slice(0, 6),
  };
}
