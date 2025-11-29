// app/rsvp/success/page.tsx
"use client";

import React, { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import invite from "../../assets/images/invitationnew.jpg";
import {
  Great_Vibes,
  Cormorant_Garamond,
  Poppins,
} from "next/font/google";

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

type KcProfile = {
  name?: string;
  avatar?: string;
};

/**
 * Error boundary so any runtime error in this page
 * renders a friendly fallback instead of a hard 500.
 */
class RsvpSuccessErrorBoundary extends React.Component<
  { children: ReactNode },
  { hasError: boolean; message?: string }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, message: undefined };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message ?? "Unknown error" };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error in /rsvp/success page:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 px-4">
          <div className="max-w-md w-full bg-slate-900/80 border border-red-500/40 rounded-2xl p-6 shadow-xl space-y-4 text-center">
            <h1 className="text-xl font-semibold text-red-300">
              Something went wrong
            </h1>
            <p className="text-sm text-slate-200 mb-2">
              We hit an unexpected error while loading your RSVP success page.
            </p>
            {this.state.message && (
              <p className="text-xs text-slate-400 break-words">
                <span className="font-semibold">Details:</span>{" "}
                {this.state.message}
              </p>
            )}
            <p className="text-xs text-slate-500 mt-2">
              You can close this page or try the RSVP process again.
            </p>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

/**
 * Outer default export: wraps the actual content in the error boundary.
 */
export default function RsvpSuccessPage() {
  return (
    <RsvpSuccessErrorBoundary>
      <RsvpSuccessContent />
    </RsvpSuccessErrorBoundary>
  );
}

/**
 * Actual page logic + UI lives here.
 */
function RsvpSuccessContent() {
  const [profile, setProfile] = useState<KcProfile | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [softError, setSoftError] = useState<string | null>(null);

  // NEW: Read name/avatar from query params first, then fallback to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const url = new URL(window.location.href);
      const nameFromUrl = url.searchParams.get("name");
      const avatarFromUrl = url.searchParams.get("avatar");

      let finalProfile: KcProfile | null = null;

      if (nameFromUrl || avatarFromUrl) {
        // Prefer fresh data from the URL
        finalProfile = {
          name: nameFromUrl ?? undefined,
          avatar: avatarFromUrl ?? undefined,
        };

        // Persist to localStorage for future visits / refreshes
        try {
          window.localStorage.setItem(
            "kc_profile",
            JSON.stringify(finalProfile)
          );
        } catch (storageErr) {
          console.warn("Failed to write kc_profile to localStorage", storageErr);
        }
      } else {
        // No query params – try localStorage
        try {
          const stored = window.localStorage.getItem("kc_profile");
          if (stored) {
            finalProfile = JSON.parse(stored);
          }
        } catch (parseErr) {
          console.error(
            "Failed to parse kc_profile from localStorage",
            parseErr
          );
          setSoftError("We ran into a problem reading your RSVP details.");
        }
      }

      setProfile(finalProfile);
    } finally {
      setLoaded(true);
    }
  }, []);

  // Confetti effect with dynamic import + error handling
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (softError) return; // don't bother with confetti if there was an error

    let cancelled = false;
    let intervalId: number | undefined;

    (async () => {
      try {
        // @ts-ignore
        const mod = await import("canvas-confetti");
        if (cancelled) return;

        const confetti = (mod as any).default || mod;
        const canvas = document.getElementById(
          "sparkles-canvas"
        ) as HTMLCanvasElement | null;

        if (!canvas || !confetti || typeof confetti.create !== "function") {
          console.warn("Confetti not initialized: canvas or API missing.");
          return;
        }

        const myConfetti = confetti.create(canvas, {
          resize: true,
          useWorker: true,
        });

        intervalId = window.setInterval(() => {
          for (let i = 0; i < 3; i++) {
            myConfetti({
              particleCount: 6,
              spread: 80,
              startVelocity: 25,
              gravity: 0.9,
              scalar: 0.7,
              ticks: 200,
              colors: ["#ffffff", "#fef9c3", "#facc15", "#eab308"],
              origin: {
                x: Math.random(),
                y: -0.1,
              },
            });
          }
        }, 500);
      } catch (confettiErr) {
        console.error("Error loading or running canvas-confetti", confettiErr);
        setSoftError(
          "A visual effect failed to load, but your RSVP is still valid."
        );
      }
    })();

    return () => {
      cancelled = true;
      if (intervalId !== undefined) {
        window.clearInterval(intervalId);
      }
    };
  }, [softError]);

  // Loading state
  if (!loaded && !softError) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200">
        <p>Loading your RSVP details…</p>
      </main>
    );
  }

  // Soft error: show friendly message, but not crash
  if (softError) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 px-4">
        <div className="max-w-md w-full bg-slate-900/80 border border-amber-400/40 rounded-2xl p-6 shadow-xl space-y-4 text-center">
          <h1 className="text-xl font-semibold text-amber-300">
            Your RSVP is recorded
          </h1>
          <p className="text-sm text-slate-200">{softError}</p>
          <p className="text-xs text-slate-500 mt-2">
            You may still safely close this page.
          </p>
        </div>
      </main>
    );
  }

  // No error, but no profile found
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
              <p
                className={`${cormorant.className} my-4 text-md tracking-[0.25em] uppercase text-slate-400`}
              >
                Highly Esteemed Pastor Kayode Adesina
              </p>
              <h1
                className={`${greatVibes.className} text-center text-4xl sm:text-6xl text-amber-200 drop-shadow-md`}
              >
                Thanksgiving Service
              </h1>

              <h2
                className={`${cormorant.className} text-center text-2xl sm:text-3xl text-emerald-300 drop-shadow-md mt-4`}
              >
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
                <p
                  className={`${cormorant.className} text-lg text-slate-200 leading-relaxed`}
                >
                  Thank you&nbsp;
                  <span className="text-amber-200 font-semibold">
                    {name}
                  </span>
                  . Your response has been received.
                </p>
              </div>

              {/* <p
                className={`${cormorant.className} font-bold text-md text-slate-300 leading-relaxed mt-2`}
              >
                We look forward to celebrating this special Thanksgiving
                Service with you.
              </p> */}
            </div>

            <div className="space-y-3">
              <p
                className={`${poppins.className} text-sm sm:text-sm text-slate-300`}
              >
                You may safely close this page now.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
