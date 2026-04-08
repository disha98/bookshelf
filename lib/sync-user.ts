import { auth, currentUser } from "@clerk/nextjs/server";
import { supabaseAdmin } from "./supabase-admin";

export async function syncUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await currentUser();
  if (!user) return null;

  await supabaseAdmin.from("users").upsert({
    id: user.id,
    email: user.emailAddresses[0]?.emailAddress ?? null,
    first_name: user.firstName,
    last_name: user.lastName,
    image_url: user.imageUrl,
    updated_at: new Date().toISOString(),
  });

  return user;
}
