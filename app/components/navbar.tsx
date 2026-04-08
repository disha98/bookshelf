"use client";

import Link from "next/link";
import { useUser, UserButton } from "@clerk/nextjs";
import { AuthButtons } from "../auth-buttons";

export function Navbar() {
  const { isSignedIn } = useUser();

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-light shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <span className="text-base font-bold tracking-tight text-foreground">
            Bookshelf
          </span>
        </Link>

        {isSignedIn ? (
          <div className="flex items-center gap-2">
            <a href="#discover" className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-surface-hover hover:text-foreground">
              Discover
            </a>
            <div className="ml-2 border-l border-border pl-3">
              <UserButton />
            </div>
          </div>
        ) : (
          <AuthButtons />
        )}
      </div>
    </nav>
  );
}
