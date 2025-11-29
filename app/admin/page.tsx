// app/rsvp/admin/page.tsx
"use client";

import { useEffect, useState, FormEvent } from "react";
import Image from "next/image";
// @ts-ignore
import confetti from "canvas-confetti";
import invite from "../assets/images/invitationnew.jpg";
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

type Entry = {
  name: string;
  username: string;
  email: string;
};

type ApiResponse = {
  status: boolean;
  message: string;
  count?: number;
  data?: Entry[];
};

const SESSION_KEY = "rsvp_admin_session"; // { username, password }

export default function AdminRsvpPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(true); // restoring session on first load

  const [error, setError] = useState<string | null>(null);
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [apiMessage, setApiMessage] = useState<string | null>(null);

  const isAuthed = entries !== null;

  // ---- Shared login + fetch helper ----
  const loginAndFetch = async (u: string, p: string) => {
    setError(null);
    setApiMessage(null);

    const trimmedUser = u.trim();
    const trimmedPass = p.trim();

    if (!trimmedUser || !trimmedPass) {
      setError("Please enter both username and password.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        "https://pcdl.co/api/nmt/pka-thanksgivingservice/all",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key":
              "sfWryh0mscQzn0TcFvdz4smp8abRSZLlMo1qpK7UQNoWAw30A9yNbRjL0RMUS741",
          },
          body: JSON.stringify({
            username: trimmedUser,
            password: trimmedPass,
          }),
          cache: "no-store",
        }
      );

      if (!res.ok) {
        setError(`Request failed with status ${res.status}`);
        return;
      }

      const json: ApiResponse = await res.json();
      setApiMessage(json.message ?? null);

      if (!json.status) {
        setError(json.message || "Authentication failed.");
        return;
      }

      if (!json.data || !Array.isArray(json.data)) {
        setError("No data returned from API.");
        return;
      }

      // ✅ Success: store entries & persist session
      setEntries(json.data);

      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(
            SESSION_KEY,
            JSON.stringify({
              username: trimmedUser,
              password: trimmedPass,
            })
          );
        } catch (storageErr) {
          console.warn("Failed to persist admin session", storageErr);
        }
      }
    } catch (err) {
      console.error("Error fetching RSVP entries:", err);
      setError("Network error while fetching RSVP entries.");
    } finally {
      setLoading(false);
    }
  };

  // ---- Handle form submit ----
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await loginAndFetch(username, password);
  };

  // ---- Restore session on first load (keep user logged in) ----
  useEffect(() => {
    if (typeof window === "undefined") return;

    (async () => {
      try {
        const raw = window.localStorage.getItem(SESSION_KEY);
        if (!raw) {
          setRestoring(false);
          return;
        }

        let parsed: { username?: string; password?: string } = {};
        try {
          parsed = JSON.parse(raw);
        } catch (err) {
          console.warn("Failed to parse stored admin session", err);
          window.localStorage.removeItem(SESSION_KEY);
          setRestoring(false);
          return;
        }

        if (!parsed.username || !parsed.password) {
          window.localStorage.removeItem(SESSION_KEY);
          setRestoring(false);
          return;
        }

        // Hydrate fields for convenience
        setUsername(parsed.username);
        setPassword(parsed.password);

        // Try to re-login silently
        await loginAndFetch(parsed.username, parsed.password);
      } finally {
        setRestoring(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Confetti effect ONLY on the login screen ----
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isAuthed) return; // don't run confetti on the table view

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
  }, [isAuthed]);

  // ---- Logout (clear session + state) ----
  const handleLogout = () => {
    setEntries(null);
    setApiMessage(null);
    setError(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(SESSION_KEY);
    }
  };

  // ---- Refresh button handler (re-fetch using stored session) ----
  const handleRefresh = async () => {
    if (typeof window === "undefined") return;

    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) {
      setError("No saved admin session found. Please log in again.");
      return;
    }

    try {
      const parsed: { username?: string; password?: string } = JSON.parse(raw);
      if (!parsed.username || !parsed.password) {
        setError("Saved admin session is invalid. Please log in again.");
        window.localStorage.removeItem(SESSION_KEY);
        return;
      }

      await loginAndFetch(parsed.username, parsed.password);
    } catch (err) {
      console.error("Failed to refresh using saved session", err);
      setError("Could not refresh entries. Please log in again.");
    }
  };

  // While restoring session and not yet decided, show a simple loading state
  if (restoring && !isAuthed) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-purple-900 text-slate-100">
        <p>Loading admin session…</p>
      </main>
    );
  }

  // 🔹 VIEW 1: LOGIN + SIDE BANNER (not authed)
  if (!isAuthed) {
    return (
      <main className="relative min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-slate-900 via-slate-950 to-purple-900">
        {/* Sparkles/Confetti Canvas */}
        <canvas
          id="sparkles-canvas"
          className="pointer-events-none fixed inset-0 z-0 w-full"
        />

        <div className="text-center relative z-10 w-full max-w-6xl bg-slate-900/60 border border-slate-700/60 rounded-3xl shadow-2xl backdrop-blur-md p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-8 lg:flex-row items-center">
            {/* Invitation / Hero Image */}
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

            {/* Right Side: Login */}
            <div className="flex-1 text-left space-y-6 mt-4 lg:mt-0">
              <div className="text-center space-y-2">
                <p
                  className={`${cormorant.className} mt-2 mb-8 text-xs sm:text-sm tracking-[0.25em] uppercase text-slate-400`}
                >
                  Highly Esteemed Pastor Kayode Adesina
                </p>
                <h1
                  className={`${greatVibes.className} text-center text-3xl sm:text-5xl text-amber-200 drop-shadow-md`}
                >
                  Thanksgiving Service
                </h1>
                <h2
                  className={`${cormorant.className} text-center text-xl sm:text-4xl text-blue-300 mt-3`}
                >
                  RSVP Admin
                </h2>
              </div>

              <section className="space-y-4">
                <form
                  onSubmit={handleSubmit}
                  className="max-w-md mx-auto space-y-4"
                >
                  <div className="text-left">
                    <label
                      className={`${poppins.className} block text-sm text-slate-200 mb-1`}
                      htmlFor="username"
                    >
                      Username
                    </label>
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full rounded-lg bg-slate-950/60 border border-slate-700/70 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                      autoComplete="username"
                    />
                  </div>

                  <div className="text-left">
                    <label
                      className={`${poppins.className} block text-sm text-slate-200 mb-1`}
                      htmlFor="password"
                    >
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-lg bg-slate-950/60 border border-slate-700/70 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                      autoComplete="current-password"
                    />
                  </div>

                  {error && (
                    <p className="text-xs text-red-400 text-center">{error}</p>
                  )}

                  {apiMessage && !error && (
                    <p className="text-xs text-emerald-300 text-center">
                      {apiMessage}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className={`${poppins.className} cursor-pointer w-full inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold bg-amber-400 hover:bg-amber-300 text-slate-900 shadow-lg shadow-amber-500/40 transition focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    {loading ? "Signing in…" : "Login to View RSVPs"}
                  </button>
                </form>
              </section>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // 🔹 VIEW 2: FULL-SCREEN TABLE, GRADIENT BG, TOP BLURRED BANNER
  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-950 to-purple-900 px-2 sm:px-4 py-4 sm:py-6">
      <canvas
        id="sparkles-canvas"
        className="pointer-events-none fixed inset-0 z-0 w-full"
      />

      <div className="relative z-10 max-w-6xl mx-auto space-y-6 sm:space-y-8">
        {/* Top banner */}
        <section className="relative w-full rounded-3xl overflow-hidden border border-slate-700/60 shadow-2xl bg-slate-950/60">
          <div className="relative h-40 sm:h-52 md:h-64">
            <Image
              src={invite}
              alt="Thanksgiving Service Invite"
              fill
              className="object-cover blur-sm scale-110 brightness-75"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/40 to-slate-950/90" />

            <div className="relative z-10 flex flex-col items-start justify-end h-full px-4 sm:px-6 md:px-8 py-4 sm:py-6">
              <p
                className={`${cormorant.className} font-bold text-sm mb-4 tracking-[0.25em] uppercase text-slate-300`}
              >
                Highly Esteemed Pastor Kayode Adesina
              </p>
              <h1
                className={`${greatVibes.className} text-2xl sm:text-4xl md:text-5xl text-amber-200 drop-shadow-md`}
              >
                Thanksgiving Service
              </h1>

              <div className="mt-1 w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h2
                  className={`${cormorant.className} text-lg sm:text-2xl md:text-3xl text-emerald-300`}
                >
                  RSVP Admin Dashboard
                </h2>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRefresh}
                    disabled={loading}
                    className={`${poppins.className} text-sm cursor-pointer px-3 py-1 rounded-md bg-slate-200/90 hover:bg-white text-slate-900 font-semibold shadow disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    {loading ? "Refreshing…" : "Refresh"}
                  </button>
                  <button
                    onClick={handleLogout}
                    className={`${poppins.className} text-sm cursor-pointer px-3 py-1 rounded-md bg-red-500/80 hover:bg-red-400 text-slate-900 font-semibold shadow`}
                  >
                    Logout
                  </button>
                </div>
              </div>

              <p className="mt-2 text-[1rem] text-slate-200 max-w-md">
                View and manage all registered attendees for the Thanksgiving Service.
              </p>
            </div>
          </div>
        </section>

        {/* Table section */}
        <section className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <div>
              <h3
                className={`${cormorant.className} text-xl sm:text-[2rem] text-amber-200 font-semibold`}
              >
                RSVP Entries
              </h3>
              {apiMessage && (
                <p className="text-xs sm:text-[1rem] text-slate-200 mt-1">
                  {apiMessage}
                </p>
              )}
              {error && (
                <p className="text-xs text-red-400 mt-1">
                  {error}
                </p>
              )}
            </div>
            <p className="text-sm cursor-pointer text-slate-300">
              Showing {entries?.length ?? 0} entries
            </p>
          </div>

          <div className="w-full overflow-x-auto rounded-xl border border-slate-700/60 bg-slate-950/70">
            <table className="min-w-full text-left text-sm sm:text-md text-slate-100">
              <thead className="bg-slate-950/90 text-md">
                <tr>
                  <th className="px-3 py-2 sm:px-4 sm:py-3 font-semibold">
                    Name
                  </th>
                  <th className="px-3 py-2 sm:px-4 sm:py-3 font-semibold">
                    Username
                  </th>
                  <th className="px-3 py-2 sm:px-4 sm:py-3 font-semibold">
                    Email
                  </th>
                </tr>
              </thead>
              <tbody className="text-[1rem]">
                {entries!.map((entry, idx) => (
                  <tr
                    key={`${entry.username}-${idx}`}
                    className={
                      idx % 2 === 0 ? "bg-slate-900/60" : "bg-slate-900/30"
                    }
                  >
                    <td className="px-3 py-2 sm:px-4 sm:py-3 whitespace-nowrap">
                      {entry.name}
                    </td>
                    <td className="px-3 py-2 sm:px-4 sm:py-3 whitespace-nowrap">
                      {entry.username}
                    </td>
                    <td className="px-3 py-2 sm:px-4 sm:py-3 whitespace-nowrap">
                      {entry.email}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
