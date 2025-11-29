// app/rsvp/success/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import invite from "../../assets/images/invitationnew.jpg";

type KcProfile = {
  name?: string;
  avatar?: string;
};

export default function RsvpSuccessPage() {
  const [profile, setProfile] = useState<KcProfile | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [softError, setSoftError] = useState<string | null>(null);

  // Read kc_profile from cookie on the client, with error handling
  useEffect(() => {
    try {
      const match = document.cookie.match(/(?:^|; )kc_profile=([^;]*)/);

      if (!match) {
        setLoaded(true);
        return;
      }

      const raw = match[1];

      let decoded = raw;
      try {
        decoded = decodeURIComponent(raw);
      } catch (decodeErr) {
        console.warn("Failed to decode kc_profile cookie, using raw value", decodeErr);
      }

      const parsed = JSON.parse(decoded);
      setProfile(parsed);
    } catch (err) {
      console.error("Failed to parse kc_profile cookie", err);
      setSoftError("We ran into a problem reading your RSVP details.");
      setProfile(null);
    } finally {
      setLoaded(true);
    }
  }, []);

  // 1) Loading state
  if (!loaded && !softError) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200">
        <p>Loading your RSVP details…</p>
      </main>
    );
  }

  // 2) Soft error (cookie issue etc.)
  if (softError) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 px-4">
        <div className="max-w-md w-full bg-slate-900/80 border border-amber-400/40 rounded-2xl p-6 shadow-xl space-y-4 text-center">
          <h1 className="text-xl font-semibold text-amber-300">
            Your RSVP is recorded
          </h1>
          <p className="text-sm text-slate-200">
            {softError}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            You may still safely close this page.
          </p>
        </div>
      </main>
    );
  }

  // 3) No error, but no profile
  if (!profile) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200">
        <p>We couldn&apos;t find your RSVP details. Please try again.</p>
      </main>
    );
  }

  const name = profile.name || "Beloved Guest";
  const avatar = profile.avatar;

  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-slate-900 via-slate-950 to-purple-900">
      {/* keep canvas if you want to re-add confetti later */}
      <canvas
        id="sparkles-canvas"
        className="pointer-events-none fixed inset-0 z-0 w-full"
      />

      <div className="text-center relative z-10 w-full max-w-4xl bg-slate-900/60 border border-slate-700/60 rounded-3xl shadow-2xl backdrop-blur-md p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
          {/* Invitation Image */}
          <div className="relative w-full lg:w-1/2">
            <div className="overflow-hidden rounded-2xl shadow-xl border border-slate-700/60">
              <Image
                src={invite}
                alt="Thanksgiving Service Invitation"
                className="h-full w-full object-cover"
                priority
              />
            </div>
          </div>

          {/* Text + Avatar */}
          <div className="flex-1 text-center space-y-6">
            <div className="space-y-2">
              <p className="my-4 text-md tracking-[0.25em] uppercase text-slate-400 font-serif">
                Highly Esteemed Pastor Kayode Adesina
              </p>
              <h1 className="text-center text-4xl sm:text-6xl text-amber-200 drop-shadow-md font-[cursive]">
                Thanksgiving Service
              </h1>

              <h2 className="text-center text-2xl sm:text-3xl text-emerald-300 drop-shadow-md mt-4 font-serif">
                RSVP Confirmed
              </h2>

              {/* User avatar + name */}
              <div className="flex flex-col items-center justify-center mt-4 space-y-3">
                {avatar && (
                  <img
                    src={avatar}
                    alt={name}
                    className="h-20 w-20 rounded-full border-2 border-amber-300 shadow-lg object-cover"
                  />
                )}
                <p className="text-lg text-slate-200 leading-relaxed font-serif">
                  Welcome,&nbsp;
                  <span className="text-amber-200 font-semibold">
                    {name}
                  </span>
                  . Your registration has been received.
                </p>
              </div>

              <p className="font-bold text-md text-slate-300 leading-relaxed mt-2 font-serif">
                We look forward to celebrating this special Thanksgiving
                Service with you.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-sm sm:text-sm text-slate-300 font-sans">
                You may safely close this page now.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
