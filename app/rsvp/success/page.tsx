// app/rsvp/success/page.tsx
"use client";

import { useEffect, useState } from "react";

type KcProfile = {
  name?: string;
  avatar?: string;
};

export default function RsvpSuccessPage() {
  const [profile, setProfile] = useState<KcProfile | null>(null);

  useEffect(() => {
    const match = document.cookie.match(
      /(?:^|; )kc_profile=([^;]+)/
    );
    if (!match) return;

    try {
      const decoded = decodeURIComponent(match[1]);
      const parsed = JSON.parse(decoded);
      setProfile(parsed);
    } catch (err) {
      console.error("Failed to parse kc_profile cookie", err);
    }
  }, []);

  if (!profile) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>We couldn&apos;t find your RSVP details. Please try again.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4">
      {profile.avatar && (
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
