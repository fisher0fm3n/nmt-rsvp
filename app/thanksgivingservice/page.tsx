"use client";

import Image from "next/image";
import { useEffect } from "react";
// @ts-ignore
import confetti from "canvas-confetti";
import { KingsChatSignIn } from "../auth/components/KingschatSignIn";
import invite from "../assets/images/invitationnew.jpg";
import { Great_Vibes, Cormorant_Garamond, Poppins, Kings } from "next/font/google";

// Script font for the main title
const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
});

// Elegant serif similar to Centaur for body text
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Poppins for button text
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function RsvpPage() {
  const handleKingsChatLogin = () => {
    // TODO: replace with your real KingsChat login / redirect
    console.log("Login with KingsChat clicked");
  };

  // Falling sparkles / confetti across whole page
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
      // fire a few mini-bursts across the whole width
      for (let i = 0; i < 3; i++) {
        myConfetti({
          particleCount: 6,
          spread: 80,
          startVelocity: 25,
          gravity: 0.9,
          scalar: 0.7,
          ticks: 200,
          colors: ["#ffffff", "#fef9c3", "#facc15", "#eab308"], // white & gold
          origin: {
            x: Math.random(), // anywhere from left (0) to right (1)
            y: -0.1, // just above the top so it falls down
          },
        });
      }
    }, 500);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  return (
    <main
      className={`relative min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-slate-900 via-slate-950 to-purple-900`}
    >
      {/* Full-page sparkles canvas */}
      <canvas
        id="sparkles-canvas"
        className="pointer-events-none fixed inset-0 z-0 w-full"
      />

      {/* Content card */}
      <div className="text-center relative z-10 w-full max-w-5xl bg-slate-900/60 border border-slate-700/60 rounded-3xl shadow-2xl backdrop-blur-md p-4 sm:p-6 lg:p-8">
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

          {/* Text + Button */}
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

              <h1
                className={`${greatVibes.className} text-center text-2xl text-amber-200 drop-shadow-md`}
              >
                RSVP
              </h1>
              {/* <p className={`${cormorant.className} text-sm sm:text-lg text-slate-200 leading-relaxed`}>
                You are specially invited to the Thanksgiving Service of Highly
                Esteemed Pastor Kayode Adesina. Please confirm your attendance
                by logging in with KingsChat to register.
              </p> */}
            </div>

            <div className="space-y-3">
<KingsChatSignIn />
              {/* <p className="text-xs text-slate-300">
                No details are entered on this page. After logging in with
                KingsChat, you&apos;ll complete your registration there.
              </p> */}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
