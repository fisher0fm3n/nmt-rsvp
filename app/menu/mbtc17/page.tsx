// @ts-nocheck
"use client";

import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import confetti from "canvas-confetti";
import { KingsChatSignIn } from "../../auth/components/KingschatSignIn";
import { Great_Vibes, Cormorant_Garamond, Poppins } from "next/font/google";
import { useAuth } from "../../auth/components/AuthProvider";
import Lottie from "react-lottie-player";
import loadingAnimation from "../../assets/lottie/loading.json";
import Link from "next/link";
import logo from "@/app/assets/images/logo.png";

const greatVibes = Great_Vibes({ subsets: ["latin"], weight: "400" });
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

type User = {
  id: string;
  name: string;
  username: string;
  email?: string | null;
  attendance?: string | null;
  seat?: string | null;
  meal?: string | null;
  token: string;
  submittedAt?: string;
};

function CornerOrnament({
  className = "",
  flipX = false,
  flipY = false,
}: {
  className?: string;
  flipX?: boolean;
  flipY?: boolean;
}) {
  const transform = `${flipX ? "-scale-x-100" : ""} ${flipY ? "-scale-y-100" : ""}`.trim();
  return (
    <div className={`pointer-events-none absolute ${className}`}>
      <svg
        viewBox="0 0 240 240"
        className={`h-28 w-28 opacity-90 drop-shadow-[0_10px_18px_rgba(0,0,0,0.28)] ${transform}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* soft gold gradient stroke */}
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="240" y2="240" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FDE68A" />
            <stop offset="0.5" stopColor="#D97706" />
            <stop offset="1" stopColor="#FDE68A" />
          </linearGradient>
          <radialGradient id="b" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(170 78) rotate(45) scale(110)">
            <stop stopColor="#FDE68A" stopOpacity="0.95" />
            <stop offset="1" stopColor="#F59E0B" stopOpacity="0.15" />
          </radialGradient>
        </defs>

        {/* swirl lines */}
        <path
          d="M18 206c62-26 86-77 106-121 20-44 44-73 98-77"
          stroke="url(#g)"
          strokeWidth="3.4"
          strokeLinecap="round"
        />
        <path
          d="M28 220c58-20 82-67 103-112 21-45 49-84 104-90"
          stroke="url(#g)"
          strokeWidth="2.4"
          strokeLinecap="round"
          opacity="0.85"
        />
        <path
          d="M26 190c48-14 77-44 97-86 20-42 41-70 100-76"
          stroke="url(#g)"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.65"
        />

        {/* glitter berries */}
        {[
          [170, 78],
          [195, 60],
          [210, 92],
          [150, 52],
          [132, 90],
          [188, 118],
          [160, 128],
        ].map(([cx, cy], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="8" fill="url(#b)" />
            <circle cx={cx} cy={cy} r="3.6" fill="#FDE68A" opacity="0.95" />
          </g>
        ))}
      </svg>
    </div>
  );
}

function OrnateDivider() {
  return (
    <div className="flex items-center justify-center gap-3 my-4">
      <span className="h-px w-16 sm:w-24 bg-gradient-to-r from-transparent via-amber-400/80 to-transparent" />
      <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_18px_rgba(251,191,36,0.65)]" />
      <span className="h-px w-16 sm:w-24 bg-gradient-to-r from-transparent via-amber-400/80 to-transparent" />
    </div>
  );
}

export default function RsvpPage() {
  const { user: authUser, loading: authLoading } = useAuth() as { user: User | null; loading: boolean };

  const [attendance, setAttendance] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);

  const [formName, setFormName] = useState("");
  const [formAttendance, setFormAttendance] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const [qrVisible, setQrVisible] = useState(false);
  const qrRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("attendanceResponse");
    if (stored) setAttendance(stored);
  }, []);

  useEffect(() => {
    if (!authUser) {
      setUser(null);
      setFormName("");
      setFormAttendance("");
      setQrVisible(false);
      return;
    }

    setUser(authUser);
    setFormName((prev) => prev || authUser.name || "");
    setFormAttendance((prev) => prev || authUser.attendance || "");
    setQrVisible(false);
  }, [authUser]);

  useEffect(() => {
    if (!authUser?.id) return;

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`https://pcdl.co/api/nmt/rsvp?id=${encodeURIComponent(authUser.id)}`, {
          method: "GET",
          headers: {
            "x-api-key": "sfWryh0mscQzn0TcFvdz4smp8abRSZLlMo1qpK7UQNoWAw30A9yNbRjL0RMUS741",
          },
        });

        if (!res.ok) return;

        const json = await res.json().catch(() => null);
        if (!json?.status || !json.data) return;

        const d = json.data;
        const refreshedUser: User = {
          id: d.id,
          name: d.name,
          username: d.username,
          email: d.email ?? null,
          attendance: d.attendance ?? null,
          seat: d.seat ?? null,
          token: d.token,
          meal: d.meal,
          submittedAt: d.updatedAt || d.submittedAt,
        };

        if (cancelled) return;

        setUser(refreshedUser);
        setFormName((prev) => prev || refreshedUser.name || "");
        setFormAttendance(refreshedUser.attendance || "");
        setQrVisible(false);

        if (typeof window !== "undefined") {
          try {
            window.localStorage.setItem("mbtc17_nmt_rsvp", JSON.stringify({ user: refreshedUser }));
          } catch {}
        }
      } catch {}
    })();

    return () => {
      cancelled = true;
    };
  }, [authUser?.id]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const canvas = document.getElementById("sparkles-canvas") as HTMLCanvasElement | null;
    if (!canvas) return;

    const myConfetti = confetti.create(canvas, { resize: true, useWorker: true });

    const interval = window.setInterval(() => {
      for (let i = 0; i < 3; i++) {
        myConfetti({
          particleCount: 6,
          spread: 85,
          startVelocity: 28,
          gravity: 0.85,
          scalar: 0.72,
          ticks: 210,
          colors: ["#fff7ed", "#fef3c7", "#fde68a", "#f59e0b", "#d97706"],
          origin: { x: Math.random(), y: -0.08 },
        });
      }
    }, 550);

    return () => window.clearInterval(interval);
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("mbtc17_nmt_rsvp");
      window.location.reload();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      const res = await fetch("https://pcdl.co/api/nmt/rsvp", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "sfWryh0mscQzn0TcFvdz4smp8abRSZLlMo1qpK7UQNoWAw30A9yNbRjL0RMUS741",
        },
        body: JSON.stringify({
          id: user.id,
          name: formName,
          attendance: formAttendance || null,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        setSaveError(errJson?.message || errJson?.error || `Failed to update (status ${res.status})`);
        return;
      }

      const json = await res.json().catch(() => ({} as any));

      let updatedUser: User = { ...user, name: formName, attendance: formAttendance || null };
      if (json?.data) {
        const d = json.data;
        updatedUser = {
          ...updatedUser,
          name: d.name ?? updatedUser.name,
          attendance: d.attendance ?? updatedUser.attendance,
          seat: d.seat ?? updatedUser.seat,
          meal: d.meal ?? updatedUser.meal,
          token: d.token ?? updatedUser.token,
          submittedAt: d.updatedAt || d.submittedAt || updatedUser.submittedAt,
        };
      }

      setUser(updatedUser);
      setFormName(updatedUser.name || "");
      setFormAttendance(updatedUser.attendance || "");

      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem("mbtc17_nmt_rsvp", JSON.stringify({ user: updatedUser }));
        } catch {}
      }

      setSaveSuccess("Your details have been updated.");
    } catch {
      setSaveError("Network error while updating your details.");
    } finally {
      setSaving(false);
    }
  };

  const showLoadingState = authLoading && !authUser && !user;

  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 py-10 overflow-hidden">
      {/* Deep green marbled-ish background (no external image needed) */}
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(1200px_800px_at_20%_10%,rgba(20,83,45,0.75),transparent_60%),radial-gradient(1000px_700px_at_85%_25%,rgba(6,95,70,0.55),transparent_58%),radial-gradient(900px_650px_at_40%_90%,rgba(22,78,99,0.35),transparent_55%),linear-gradient(135deg,#052e23_0%,#064e3b_45%,#052e23_100%)]" />
      {/* subtle sheen */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(800px_500px_at_50%_30%,rgba(250,204,21,0.08),transparent_60%)]" />

      <canvas id="sparkles-canvas" className="pointer-events-none fixed inset-0 z-0 w-full h-full" />

      <div className="relative z-10 w-full max-w-2xl">
        <div className="relative overflow-hidden rounded-[28px] border border-amber-200/35 bg-[#fbf3d6] shadow-[0_30px_120px_rgba(0,0,0,0.35)]">
          {/* ornaments */}
          <CornerOrnament className="left-2 top-2" />
          <CornerOrnament className="right-2 top-2" flipX />
          <CornerOrnament className="left-2 bottom-2" flipY />
          <CornerOrnament className="right-2 bottom-2" flipX flipY />

          {/* inner frame */}
          <div className="relative m-2 sm:m-3 rounded-[24px] border border-amber-300/40 bg-[linear-gradient(180deg,rgba(255,255,255,0.55),rgba(255,255,255,0.15))] backdrop-blur-[2px]">
            {/* header */}
            <div className="relative px-6 sm:px-10 pt-10 pb-6 text-center">
              <p className={`${greatVibes.className} text-3xl sm:text-5xl text-amber-800/90`}>
                Welcome
              </p>
              <h1
                className={`${cormorant.className} mt-2 text-3xl sm:text-5xl font-semibold tracking-wide text-neutral-900`}
              >
                MBTC 17 BANQUET
              </h1>

              <OrnateDivider />

              <p className={`${poppins.className} text-sm sm:text-base text-neutral-700`}>
                Kindly sign in to confirm your details and proceed to menu selection.
              </p>
            </div>

            {/* content */}
            <div className="px-6 sm:px-10 pb-10">
              <div className="rounded-2xl border border-amber-300/35 bg-white/55 shadow-[0_18px_60px_rgba(0,0,0,0.14)]">
                <div className="p-6 sm:p-8">
                  {user && user.token ? (
                    <div className="space-y-6">
                      <div className="text-center">
                        <p className={`${poppins.className} text-sm font-semibold text-neutral-700`}>
                          Dearly Beloved,
                        </p>
                        <p
                          className={`${cormorant.className} mt-1 text-3xl sm:text-4xl font-semibold text-neutral-900`}
                        >
                          {user.name}
                        </p>
                        <p className={`${poppins.className} mt-2 text-xs sm:text-sm text-neutral-600`}>
                          @{user.username}
                        </p>
                      </div>

                      <OrnateDivider />

                      <div className="flex justify-center">
                        <Link
                          href="/menu/mbtc17/order"
                          className={`${poppins.className} inline-flex items-center justify-center rounded-full px-8 py-3 text-sm font-semibold bg-amber-700 hover:bg-amber-600 text-white transition shadow-[0_14px_40px_rgba(180,83,9,0.35)]`}
                        >
                          Select Your Menu Options
                        </Link>
                      </div>

                      <form onSubmit={handleSave} className="mt-2 space-y-4">
                        <div className="flex flex-col gap-1">
                          <label className={`${poppins.className} text-sm text-neutral-700`} htmlFor="name">
                            Name
                          </label>
                          <input
                            id="name"
                            type="text"
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            className="w-full rounded-xl border border-amber-300/40 bg-white/70 px-4 py-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]"
                          />
                        </div>

                        {saveError && <p className="text-xs text-red-600">{saveError}</p>}
                        {saveSuccess && <p className="text-xs text-emerald-700">{saveSuccess}</p>}

                        <div className="mt-3 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                          <button
                            type="submit"
                            disabled={saving}
                            className={`${poppins.className} inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold bg-neutral-900 hover:bg-neutral-800 text-white transition disabled:opacity-60 disabled:cursor-not-allowed`}
                          >
                            {saving ? "Saving…" : "Update"}
                          </button>

                          <button
                            type="button"
                            onClick={handleLogout}
                            className={`${poppins.className} inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold bg-white/70 text-neutral-900 border border-amber-300/45 hover:bg-white transition`}
                          >
                            Logout
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {showLoadingState ? (
                        <div className="flex flex-col items-center justify-center py-10 gap-4">
                          <Lottie animationData={loadingAnimation} loop play className="w-28 h-28 sm:w-32 sm:h-32" />
                          <p className={`${poppins.className} text-sm text-neutral-700`}>Checking your invitation…</p>
                        </div>
                      ) : (
                        <>
                          <p className={`${cormorant.className} font-semibold text-center text-lg sm:text-2xl text-neutral-800`}>
                            Kindly sign in with KingsChat
                          </p>
                          <p className={`${poppins.className} text-center text-sm text-neutral-600`}>
                            to confirm your details and proceed.
                          </p>
                          <div className="pt-2 flex justify-center">
                            <KingsChatSignIn />
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* tiny footer line */}
              <div className="mt-6 text-center">
                <p className={`${poppins.className} text-xs text-white/80`}>
                  {/* intentionally subtle, matches banner vibe */}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* bottom glow */}
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 h-28 w-[85%] rounded-[999px] bg-amber-400/10 blur-3xl -z-10" />
      </div>
    </main>
  );
}
