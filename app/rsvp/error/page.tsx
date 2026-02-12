"use client";

import Image from "next/image";
import { useEffect } from "react";
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

export default function RsvpErrorPage() {
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
      for (let i = 0; i < 2; i++) {
        myConfetti({
          particleCount: 3,
          spread: 40,
          startVelocity: 10,
          gravity: 0.9,
          scalar: 0.5,
          ticks: 160,
          colors: ["#fecaca", "#fee2e2", "#f97373", "#facc15"],
          origin: {
            x: Math.random(),
            y: -0.1,
          },
        });
      }
    }, 700);

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

      <div className="text-center relative z-10 w-full max-w-4xl bg-slate-900/60 border border-red-500/40 rounded-3xl shadow-2xl backdrop-blur-md p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
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
                className={`${greatVibes.className} text-center text-2xl sm:text-3xl text-rose-300 drop-shadow-md mt-4`}
              >
                Something went wrong
              </h2>
              <p
                className={`${cormorant.className} text-sm sm:text-lg text-slate-200 leading-relaxed mt-4`}
              >
                We couldn&apos;t complete your registration at this time.
                Please go back and try again. If the issue persists, kindly
                contact the event organizers.
              </p>
            </div>

            <div className="space-y-3">
              <a
                href="/menu/mbtc17"
                className={`${poppins.className} inline-flex items-center justify-center rounded-full px-6 py-2 text-sm sm:text-base font-semibold bg-amber-300 text-slate-900 hover:bg-amber-200 transition-colors`}
              >
                Back to RSVP
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
