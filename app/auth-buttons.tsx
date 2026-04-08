"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";

export function AuthButtons() {
  return (
    <div className="flex justify-center gap-3">
      <SignInButton mode="modal">
        <button className="h-10 cursor-pointer rounded-xl bg-accent px-5 text-sm font-medium text-white shadow-sm transition-all hover:bg-accent-light active:scale-95">
          Sign In
        </button>
      </SignInButton>
      <SignUpButton mode="modal">
        <button className="h-10 cursor-pointer rounded-xl border border-border px-5 text-sm font-medium text-foreground shadow-sm transition-all hover:bg-surface-hover active:scale-95">
          Sign Up
        </button>
      </SignUpButton>
    </div>
  );
}
