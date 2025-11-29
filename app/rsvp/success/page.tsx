// app/rsvp/success/page.tsx
"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
// @ts-ignore
import confetti from "canvas-confetti";
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

// Outer page just provides Suspense
export default function RsvpSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200">
          <p>Loading your RSVP details…</p>
        </main>
      }
    >
      <RsvpSuccessContent />
    </Suspense>
  );
}

// Inner component actually uses useSearchParams
function RsvpSuccessContent() {
  const searchParams = useSearchParams();
  const name = searchParams.get("name") || "Beloved Guest";
  const avatar = searchParams.get("avatar") || undefined;

  // Confetti effect
  useEffect(() => {
    if (typeof window === "undefined") return;

    const canvas = document.getElementById(
      "sparkles-canvas"
    ) as HTMLCanvasElement | null;
    if (!canvas) return;

    const myConfetti = confetti.create(canvas, {
      resize: true,
      useWorker: true,
    });

    const interval = window.setInterval(() => {
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

    return () => {
      window.clearInterval(interval);
    };
  }, []);

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
                  Welcome,&nbsp;
                  <span className="text-amber-200 font-semibold">
                    {name}
                  </span>
                  . Your registration has been received.
                </p>
              </div>

              <p
                className={`${cormorant.className} font-bold text-md text-slate-300 leading-relaxed mt-2`}
              >
                We look forward to celebrating this special Thanksgiving
                Service with you.
              </p>
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
