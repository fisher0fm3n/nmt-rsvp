// app/rsvp/success/page.tsx
import { cookies } from "next/headers";

export default function RsvpSuccessPage() {
  // Make sure there's NO "use client" at the top of this file
  const cookieStore = cookies(); // Server-only API
  const raw = cookieStore.get("kc_profile")?.value ?? null;

  let profile: { name?: string; avatar?: string } | null = null;

  if (raw) {
    try {
      profile = JSON.parse(raw);
    } catch {
      profile = null;
    }
  }

  if (!profile) {
    // Optional: basic fallback UI if cookie is missing/broken
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>We couldn&apos;t find your RSVP details. Please try again.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4">
      {profile.avatar && (
        // simple avatar rendering; adjust to your styling setup
        <img
          src={profile.avatar}
          alt={profile.name ?? "Avatar"}
          className="w-20 h-20 rounded-full object-cover"
        />
      )}
      <h1 className="text-2xl font-semibold">
        Thank you, {profile.name ?? "friend"}! 🎉
      </h1>
      <p>Your RSVP for the Thanksgiving service was received.</p>
    </main>
  );
}
