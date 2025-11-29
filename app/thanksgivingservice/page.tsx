"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
// @ts-ignore
import confetti from "canvas-confetti";
import { KingsChatSignIn } from "../auth/components/KingschatSignIn";
import invite from "../assets/images/invitationnew.jpg";
import {
  Great_Vibes,
  Cormorant_Garamond,
  Poppins,
  Kings,
} from "next/font/google";

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
  const [attendance, setAttendance] = useState<string>("");

  // Load saved attendance from localStorage (if any)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = window.localStorage.getItem("attendanceResponse");
    if (stored) {
      setAttendance(stored);
    }
  }, []);

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

  const handleAttendanceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setAttendance(value);

    if (typeof window !== "undefined") {
      // Store in localStorage
      window.localStorage.setItem("attendanceResponse", value);

      // Also store in a cookie so the server callback can read it
      const maxAge = 60 * 60 * 24 * 30; // 30 days
      document.cookie = `attendanceResponse=${encodeURIComponent(
        value
      )}; path=/; max-age=${maxAge}`;
    }
  };

  const hasSelectedAttendance = attendance !== "";

  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-slate-900 via-slate-950 to-purple-900">
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
            </div>

            <div className="space-y-3  mx-8">
              {/* Attendance dropdown */}
              <div className="flex flex-col items-start gap-1 text-left my-4">
                <label
                  htmlFor="attendance"
                  className={`${poppins.className} mb-2 text-md font-medium text-slate-200`}
                >
                  Will you be in attendance?
                </label>
                <select
                  id="attendance"
                  value={attendance}
                  onChange={handleAttendanceChange}
                  className="w-full rounded-sm border border-slate-600 bg-slate-800/70 px-3 py-2 text-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                >
                  <option value="">Select an option</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              {/* Login section: gated by attendance selection */}
              {hasSelectedAttendance ? (
                <KingsChatSignIn />
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <button
                    type="button"
                    disabled
                    className={`${poppins.className} w-full cursor-not-allowed rounded-sm border border-slate-600 bg-slate-800/60 px-4 py-2 text-sm font-medium text-slate-400`}
                  >
                    Login with KingsChat to RSVP
                  </button>
                  <p className={`${poppins.className} text-sm mt-4`}>
                    Please select whether you will be in attendance before
                    proceeding to login.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
