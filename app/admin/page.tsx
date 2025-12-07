"use client";

import { useEffect, useState, FormEvent } from "react";
import Image from "next/image";
// @ts-ignore
import confetti from "canvas-confetti";
import invite from "../assets/images/invitationnew.jpg";
import { Great_Vibes, Cormorant_Garamond, Poppins } from "next/font/google";

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

// ─────────────────────────────────────────────
// Menu option definitions + label maps
// ─────────────────────────────────────────────

type MenuOption = {
  id: string;
  label: string;
};

const starterOptions: MenuOption[] = [
  { id: "goat-pepper-soup", label: "Goat Meat Pepper Soup" },
  { id: "chicken-soup", label: "Chicken Soup" },
];

const saladOptions: MenuOption[] = [
  { id: "waldorf-salad", label: "Waldorf Salad" },
  { id: "chicken-salad", label: "Chicken Salad" },
];

const continentalMainOptions: MenuOption[] = [
  {
    id: "grilled-fillet-steak",
    label: "Grilled Fillet Steak with Mushroom Sauce",
  },
  {
    id: "pan-fried-crocker-fish",
    label: "Pan Fried Crocker Fish with Garlic Sauce",
  },
  {
    id: "seafood-linguine",
    label: "Seafood Linguine",
  },
  {
    id: "chinese-fried-rice-beef",
    label: "Chinese Fried Rice with Shredded Beef Sauce",
  },
  {
    id: "chicken-curry-singapore-noodles",
    label: "Chicken Curry Sauce with Singapore Noodles",
  },
];

const LOCAL_SOUP_MAIN_ID = "local-soup-main";
const JOLLOF_FRIED_MAIN_ID = "jollof-fried-rice-chicken-fish";

const localSoupMainOption: MenuOption = {
  id: LOCAL_SOUP_MAIN_ID,
  label: "Efo Riro / Mixed Okro / Afang / Edikaikong",
};

const localSoupOptions: MenuOption[] = [
  { id: "efo-riro", label: "Efo Riro" },
  { id: "mixed-okro", label: "Mixed Okro" },
  { id: "afang", label: "Afang" },
  { id: "edikaikong", label: "Edikaikong" },
];

const swallowOptions: MenuOption[] = [
  { id: "semo", label: "Semo" },
  { id: "poundo-yam", label: "Poundo Yam" },
];

const otherLocalMainOptions: MenuOption[] = [
  {
    id: "amala-ewedu-gbegiri",
    label: "Amala with Ewedu and Gbegiri",
  },
  {
    id: "ofada-rice",
    label: "Ofada Rice with Ofada Sauce and Plantain",
  },
  {
    id: "jollof-fried-rice-chicken-fish",
    label: "Jollof/Fried Rice with Chicken, Fish, Moinmoin, Coleslaw",
  },
];

const riceTypeOptions: MenuOption[] = [
  { id: "jollof-rice", label: "Jollof Rice" },
  { id: "fried-rice", label: "Fried Rice" },
];

const proteinOptions: MenuOption[] = [
  { id: "chicken", label: "Chicken" },
  { id: "fish", label: "Fish" },
  { id: "moinmoin", label: "Moinmoin" },
  { id: "coleslaw", label: "Coleslaw" },
];

const dessertOptions: MenuOption[] = [
  { id: "ice-cream", label: "Ice Cream" },
  { id: "cup-cakes", label: "Cup Cakes" },
  { id: "parfait", label: "Parfait" },
  { id: "fruit-medley", label: "Fruit Medley" },
];

const aftersOptions: MenuOption[] = [
  { id: "small-chops", label: "Small Chops" },
  { id: "fries", label: "Fries" },
];

const buildLabelMap = (options: MenuOption[]) =>
  options.reduce((acc, opt) => {
    acc[opt.id] = opt.label;
    return acc;
  }, {} as Record<string, string>);

const starterLabelMap = buildLabelMap(starterOptions);
const saladLabelMap = buildLabelMap(saladOptions);
const mainCourseLabelMap = buildLabelMap([
  ...continentalMainOptions,
  localSoupMainOption,
  ...otherLocalMainOptions,
]);
const localSoupLabelMap = buildLabelMap(localSoupOptions);
const swallowLabelMap = buildLabelMap(swallowOptions);
const riceTypeLabelMap = buildLabelMap(riceTypeOptions);
const proteinLabelMap = buildLabelMap(proteinOptions);
const dessertLabelMap = buildLabelMap(dessertOptions);
const aftersLabelMap = buildLabelMap(aftersOptions);

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type Menu = {
  starter: string | null;
  salad: string | null;
  mainCourse: string; // id
  localSoup: string | null;
  swallow: string | null;
  dessert: string | null;
  afters: string | null;
  riceType: string | null;
  protein: string | null;
};

// Updated to include id + seat + menu
type Entry = {
  id: string; // ensure /api/nmt/pka-thanksgivingservice/all returns this
  name: string;
  username: string;
  email?: string | null;
  attendance?: string | null; // "yes" | "no" | null
  submittedAt?: string; // ISO string
  seat?: string | null; // "Table 1" - "Table 50" or "Bleachers"
  menu?: Menu | null;
};

type ApiResponse = {
  status: boolean;
  message: string;
  count?: number;
  data?: Entry[];
};

const SESSION_KEY = "rsvp_admin_session"; // { username, password }

// All allowed seat values
const seatOptions = [
  ...Array.from({ length: 50 }, (_, i) => `Table ${i + 1}`),
  "Bleachers",
];

// ─────────────────────────────────────────────

const formatMenuId = (
  id: string | null | undefined,
  labelMap: Record<string, string>
) => {
  if (!id) return "—";
  return labelMap[id] ?? id;
};

const formatMainCourse = (menu?: Menu | null) => {
  if (!menu) return "—";
  return formatMenuId(menu.mainCourse, mainCourseLabelMap);
};

export default function AdminRsvpPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false); // global login/refresh loading
  const [restoring, setRestoring] = useState(true); // restoring session on first load

  const [error, setError] = useState<string | null>(null);
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [apiMessage, setApiMessage] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  // Per-entry loading state for seat updates
  const [seatLoading, setSeatLoading] = useState<Record<string, boolean>>({});

  // which tab is active? "rsvp" or "menu"
  const [activeTab, setActiveTab] = useState<"rsvp" | "menu">("rsvp");

  const isAuthed = entries !== null;

  const formatAttendance = (value?: string | null) => {
    if (!value) return "—";
    return value.toLowerCase() === "yes"
      ? "Yes"
      : value.toLowerCase() === "no"
      ? "No"
      : value;
  };

  const formatSubmittedAt = (value?: string) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("en-NG", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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

      // ✅ Success: store entries & count & persist session
      setEntries(json.data);
      setTotalCount(
        typeof json.count === "number" ? json.count : json.data.length
      );

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
    setTotalCount(null);
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

  // ---- Seat change handler (auto-set when selected, with per-row loading) ----
  const handleSeatChange = async (entryId: string, seat: string) => {
    if (!seat) return; // ignore clearing for now

    setError(null);
    setApiMessage(null);

    // mark this entry as loading
    setSeatLoading((prev) => ({ ...prev, [entryId]: true }));

    try {
      const res = await fetch(
        "https://pcdl.co/api/nmt/pka-thanksgivingservice/seat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key":
              "sfWryh0mscQzn0TcFvdz4smp8abRSZLlMo1qpK7UQNoWAw30A9yNbRjL0RMUS741",
          },
          body: JSON.stringify({ id: entryId, seat }),
        }
      );

      if (!res.ok) {
        setError(`Failed to set seat (status ${res.status})`);
        return;
      }

      const json = await res.json();

      if (!json.status) {
        setError(json.message || "Failed to set seat.");
        return;
      }

      // ✅ Optimistically update local state with new seat
      setEntries((prev) =>
        prev
          ? prev.map((e) =>
              e.id === entryId
                ? {
                    ...e,
                    seat: json.data?.seat ?? seat,
                  }
                : e
            )
          : prev
      );

      setApiMessage("Seat updated successfully.");
    } catch (err) {
      console.error("Error setting seat:", err);
      setError("Network error while setting seat.");
    } finally {
      // clear loading for this entry
      setSeatLoading((prev) => {
        const copy = { ...prev };
        delete copy[entryId];
        return copy;
      });
    }
  };

  // ---- Export menu table to CSV ----
  const handleExportMenuCsv = () => {
    const menuEntries =
      entries?.filter((e) => e.menu && e.menu.mainCourse) ?? [];
    if (!menuEntries.length) return;

    const header = [
      "Name",
      "Username",
      "Seat",
      "Starter",
      "Salad",
      "Main Course",
      "Local Soup",
      "Swallow",
      "Rice Type",
      "Protein",
      "Dessert",
      "Afters",
      "Submitted At",
    ];

    const rows = menuEntries.map((entry) => {
      const menu = entry.menu!;
      return [
        entry.name ?? "",
        entry.username ?? "",
        entry.seat ?? "",
        formatMenuId(menu.starter, starterLabelMap),
        formatMenuId(menu.salad, saladLabelMap),
        formatMainCourse(menu),
        formatMenuId(menu.localSoup, localSoupLabelMap),
        formatMenuId(menu.swallow, swallowLabelMap),
        formatMenuId(menu.riceType, riceTypeLabelMap),
        formatMenuId(menu.protein, proteinLabelMap),
        formatMenuId(menu.dessert, dessertLabelMap),
        formatMenuId(menu.afters, aftersLabelMap),
        formatSubmittedAt(entry.submittedAt),
      ];
    });

    const escapeCell = (value: string) => {
      const v = value ?? "";
      const needsQuotes = /[",\n]/.test(v);
      const escaped = v.replace(/"/g, '""');
      return needsQuotes ? `"${escaped}"` : escaped;
    };

    const csv =
      [header, ...rows]
        .map((row) => row.map((cell) => escapeCell(String(cell))).join(","))
        .join("\r\n") + "\r\n";

    if (typeof window === "undefined") return;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `menu-orders-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // While restoring session and not yet decided, show a simple loading state
  if (restoring && !isAuthed) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-purple-900 text-slate-100">
        <p className="text-lg">Loading admin session…</p>
      </main>
    );
  }

  // 🔹 VIEW 1: LOGIN + SIDE BANNER (not authed)
  if (!isAuthed) {
    return (
      <main className="relative min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-slate-900 via-slate-950 to-purple-900 text-lg">
        {/* Sparkles/Confetti Canvas */}
        <canvas
          id="sparkles-canvas"
          className="pointer-events-none fixed inset-0 z-0 w-full"
        />

        <div className="text-center relative z-10 w-full max-w-7xl bg-slate-900/60 border border-slate-700/60 rounded-3xl shadow-2xl backdrop-blur-md p-5 sm:p-7 lg:p-9">
          <div className="flex flex-col gap-10 lg:flex-row items-center">
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
            <div className="flex-1 text-left space-y-7 mt-4 lg:mt-0">
              <div className="text-center space-y-3">
                <h2
                  className={`${cormorant.className} text-center text-2xl sm:text-5xl text-blue-300 mt-4`}
                >
                  RSVP Admin
                </h2>
              </div>

              <section className="space-y-5">
                <form
                  onSubmit={handleSubmit}
                  className="max-w-md mx-auto space-y-5"
                >
                  <div className="text-left">
                    <label
                      className={`${poppins.className} block text-base text-slate-200 mb-1.5`}
                      htmlFor="username"
                    >
                      Username
                    </label>
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full rounded-lg bg-slate-950/60 border border-slate-700/70 px-4 py-2.5 text-base text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                      autoComplete="username"
                    />
                  </div>

                  <div className="text-left">
                    <label
                      className={`${poppins.className} block text-base text-slate-200 mb-1.5`}
                      htmlFor="password"
                    >
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-lg bg-slate-950/60 border border-slate-700/70 px-4 py-2.5 text-base text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                      autoComplete="current-password"
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-400 text-center">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className={`${poppins.className} cursor-pointer w-full inline-flex items-center justify-center rounded-md px-5 py-3 text-base font-semibold bg-amber-400 hover:bg-amber-300 text-slate-900 shadow-lg shadow-amber-500/40 transition focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-60 disabled:cursor-not-allowed`}
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

  // 🔹 VIEW 2: FULL-SCREEN TABLE, GRADIENT BG, TOP BLURRED BANNER + TABS
  const menuEntries = entries?.filter((e) => e.menu && e.menu.mainCourse) ?? [];

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-950 to-purple-900 px-3 sm:px-5 py-5 sm:py-7 text-lg">
      <canvas
        id="sparkles-canvas"
        className="pointer-events-none fixed inset-0 z-0 w-full"
      />

      <div className="relative z-10 max-w-6xl mx-auto space-y-7 sm:space-y-9">
        {/* Top banner */}
        <section className="relative w-full rounded-3xl overflow-hidden border border-slate-700/60 shadow-2xl bg-slate-950/60">
          <div className="relative h-44 sm:h-56 md:h-72">
            <Image
              src={invite}
              alt="Thanksgiving Service Invite"
              fill
              className="object-cover blur-sm scale-110 brightness-75"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/40 to-slate-950/90" />

            <div className="relative z-10 flex flex-col items-start justify-end h-full px-5 sm:px-7 md:px-9 py-5 sm:py-7">
              <div className="mt-2 w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2
                    className={`${cormorant.className} text-xl sm:text-3xl md:text-4xl text-emerald-300`}
                  >
                    RSVP Admin Dashboard
                  </h2>
                  {/* Tabs */}
                  <div className="mt-3 inline-flex rounded-full bg-slate-900/70 p-1 border border-slate-700/70">
                    <button
                      type="button"
                      onClick={() => setActiveTab("rsvp")}
                      className={`${
                        poppins.className
                      } cursor-pointer px-4 sm:px-5 py-1.5 text-sm sm:text-base rounded-full transition ${
                        activeTab === "rsvp"
                          ? "bg-amber-400 text-slate-900 font-semibold shadow"
                          : "text-slate-200 hover:text-white"
                      }`}
                    >
                      RSVP Entries
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("menu")}
                      className={`${
                        poppins.className
                      } cursor-pointer px-4 sm:px-5 py-1.5 text-sm sm:text-base rounded-full transition ${
                        activeTab === "menu"
                          ? "bg-amber-400 text-slate-900 font-semibold shadow"
                          : "text-slate-200 hover:text-white"
                      }`}
                    >
                      Menu Orders
                    </button>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-[1.125rem] text-slate-200 max-w-md">
                {activeTab === "rsvp"
                  ? "View and manage all registered attendees for the Thanksgiving Service."
                  : "View all guests who have submitted their menu selections."}
              </p>
            </div>
          </div>
        </section>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className={`${poppins.className} text-base cursor-pointer px-4 py-2 rounded-md bg-slate-200/90 hover:bg-white text-slate-900 font-semibold shadow disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
          <button
            onClick={handleLogout}
            className={`${poppins.className} text-base cursor-pointer px-4 py-2 rounded-md bg-red-500/80 hover:bg-red-400 text-slate-900 font-semibold shadow`}
          >
            Logout
          </button>
        </div>

        {/* 🔻 Active tab content */}
        {activeTab === "rsvp" ? (
          // ----- TAB 1: RSVP ENTRIES -----
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                <h3
                  className={`${cormorant.className} text-2xl sm:text-[2.25rem] text-amber-200 font-semibold`}
                >
                  RSVP Entries
                </h3>
                {error && <p className="text-sm text-red-400 mt-1">{error}</p>}
                {apiMessage && !error && (
                  <p className="text-sm text-emerald-300 mt-1">{apiMessage}</p>
                )}
              </div>
              <p className="text-base text-slate-300">
                Showing {entries?.length ?? 0} of{" "}
                {totalCount ?? entries?.length ?? 0} entries
              </p>
            </div>

            {/* 📱 MOBILE: Card list (no horizontal scroll) */}
            <div className="space-y-3 md:hidden">
              {entries!.map((entry, idx) => {
                const thisRowLoading = !!seatLoading[entry.id];
                return (
                  <div
                    key={`${entry.id}-${idx}`}
                    className="rounded-2xl border border-slate-700/70 bg-slate-950/80 p-4 flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div>
                        <p className="font-semibold text-slate-50 text-lg">
                          {entry.name}
                        </p>
                        <p className="text-slate-300 text-base">
                          @{entry.username}
                        </p>
                      </div>
                    </div>

                    <p className="text-base font-bold text-slate-200">
                      Attendance Status: {formatAttendance(entry.attendance)}
                    </p>

                    <div className="flex flex-col gap-2 mt-2">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-300 text-base">Seat</span>
                        <div className="flex items-center gap-3">
                          <select
                            className="bg-slate-900 border border-slate-600 rounded-md px-3 py-2 text-base text-slate-100"
                            value={entry.seat ?? ""}
                            onChange={(e) =>
                              handleSeatChange(entry.id, e.target.value)
                            }
                            disabled={thisRowLoading || loading}
                          >
                            <option value="">—</option>
                            {seatOptions.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                          {thisRowLoading && (
                            <span className="inline-flex h-5 w-5 items-center justify-center">
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-slate-400 text-sm">
                        Submitted: {formatSubmittedAt(entry.submittedAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 💻 DESKTOP/TABLET: Table view */}
            <div className="hidden md:block">
              <div className="w-full overflow-x-auto rounded-xl border border-slate-700/60 bg-slate-950/70">
                <table className="min-w-full text-left text-base sm:text-lg text-slate-100">
                  <thead className="bg-slate-950/90 text-lg">
                    <tr>
                      <th className="px-4 py-3 sm:px-5 sm:py-4 font-semibold">
                        Name
                      </th>
                      <th className="px-4 py-3 sm:px-5 sm:py-4 font-semibold">
                        Attendance
                      </th>
                      <th className="px-4 py-3 sm:px-5 sm:py-4 font-semibold whitespace-nowrap">
                        Seat
                      </th>
                      <th className="px-4 py-3 sm:px-5 sm:py-4 font-semibold whitespace-nowrap">
                        Submitted At
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-[1.1rem]">
                    {entries!.map((entry, idx) => {
                      const thisRowLoading = !!seatLoading[entry.id];
                      return (
                        <tr
                          key={`${entry.id ?? entry.username}-${idx}`}
                          className={
                            idx % 2 === 0
                              ? "bg-slate-900/60"
                              : "bg-slate-900/30"
                          }
                        >
                          <td className="px-4 py-3 sm:px-5 sm:py-4 whitespace-nowrap">
                            {entry.name}
                          </td>
                          <td className="px-4 py-3 sm:px-5 sm:py-4 whitespace-nowrap">
                            {entry.username}
                          </td>
                          <td className="px-4 py-3 sm:px-5 sm:py-4 whitespace-nowrap">
                            {formatAttendance(entry.attendance)}
                          </td>
                          <td className="px-4 py-3 sm:px-5 sm:py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <select
                                className="bg-slate-900 border border-slate-600 rounded-md px-3 py-2 text-base text-slate-100"
                                value={entry.seat ?? ""}
                                onChange={(e) =>
                                  handleSeatChange(entry.id, e.target.value)
                                }
                                disabled={thisRowLoading || loading}
                              >
                                <option value="">—</option>
                                {seatOptions.map((opt) => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                              {thisRowLoading && (
                                <span className="inline-flex h-5 w-5 items-center justify-center">
                                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 sm:px-5 sm:py-4 whitespace-nowrap">
                            {formatSubmittedAt(entry.submittedAt)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        ) : (
          // ----- TAB 2: MENU ORDERS -----
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                <h3
                  className={`${cormorant.className} text-2xl sm:text-[2.25rem] text-amber-200 font-semibold`}
                >
                  Menu Orders
                </h3>
                {error && <p className="text-sm text-red-400 mt-1">{error}</p>}
                {apiMessage && !error && (
                  <p className="text-sm text-emerald-300 mt-1">{apiMessage}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <p className="text-base text-slate-300">
                  {menuEntries.length} guests with menu selections
                </p>
                <button
                  type="button"
                  onClick={handleExportMenuCsv}
                  className={`${poppins.className} text-sm sm:text-base cursor-pointer px-4 py-2 rounded-md bg-amber-400 hover:bg-amber-300 text-slate-900 font-semibold shadow`}
                >
                  Export CSV
                </button>
              </div>
            </div>

            {/* 📱 MOBILE: Card list */}
            <div className="space-y-3 md:hidden">
              {menuEntries.map((entry, idx) => {
                const menu = entry.menu!;
                return (
                  <div
                    key={`${entry.id}-menu-${idx}`}
                    className="rounded-2xl border border-slate-700/70 bg-slate-950/80 p-4 flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div>
                        <p className="font-semibold text-slate-50 text-lg">
                          {entry.name}
                        </p>
                      </div>
                      <span className="text-sm text-slate-300">
                        Seat: {entry.seat ?? "—"}
                      </span>
                    </div>

                    <p className="text-sm text-slate-200">
                      <span className="font-semibold">Starter:</span>{" "}
                      {formatMenuId(menu.starter, starterLabelMap)}
                    </p>
                    <p className="text-sm text-slate-200">
                      <span className="font-semibold">Salad:</span>{" "}
                      {formatMenuId(menu.salad, saladLabelMap)}
                    </p>
                    <p className="text-sm text-slate-200">
                      <span className="font-semibold">Main Course:</span>{" "}
                      {formatMainCourse(menu)}
                    </p>
                    <p className="text-sm text-slate-200">
                      <span className="font-semibold">Local Soup:</span>{" "}
                      {formatMenuId(menu.localSoup, localSoupLabelMap)}
                    </p>
                    <p className="text-sm text-slate-200">
                      <span className="font-semibold">Swallow:</span>{" "}
                      {formatMenuId(menu.swallow, swallowLabelMap)}
                    </p>
                    <p className="text-sm text-slate-200">
                      <span className="font-semibold">Rice Type:</span>{" "}
                      {formatMenuId(menu.riceType, riceTypeLabelMap)}
                    </p>
                    <p className="text-sm text-slate-200">
                      <span className="font-semibold">Protein:</span>{" "}
                      {formatMenuId(menu.protein, proteinLabelMap)}
                    </p>
                    <p className="text-sm text-slate-200">
                      <span className="font-semibold">Dessert:</span>{" "}
                      {formatMenuId(menu.dessert, dessertLabelMap)}
                    </p>
                    <p className="text-sm text-slate-200">
                      <span className="font-semibold">Afters:</span>{" "}
                      {formatMenuId(menu.afters, aftersLabelMap)}
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      Submitted: {formatSubmittedAt(entry.submittedAt)}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* 💻 DESKTOP/TABLET: Menu table */}
            <div className="hidden md:block">
              <div className="w-full overflow-x-auto rounded-xl border border-slate-700/60 bg-slate-950/70">
                <table className="min-w-full text-left text-base sm:text-lg text-slate-100">
                  <thead className="bg-slate-950/90 text-lg">
                    <tr>
                      <th className="px-4 py-3 sm:px-5 sm:py-4 font-semibold">
                        Name
                      </th>
                      <th className="px-4 py-3 sm:px-5 sm:py-4 font-semibold whitespace-nowrap">
                        Seat
                      </th>
                      <th className="px-4 py-3 sm:px-5 sm:py-4 font-semibold whitespace-nowrap">
                        Starter
                      </th>
                      <th className="px-4 py-3 sm:px-5 sm:py-4 font-semibold whitespace-nowrap">
                        Salad
                      </th>
                      <th className="px-4 py-3 sm:px-5 sm:py-4 font-semibold whitespace-nowrap">
                        Main Course
                      </th>
                      <th className="px-4 py-3 sm:px-5 sm:py-4 font-semibold whitespace-nowrap">
                        Local Soup
                      </th>
                      <th className="px-4 py-3 sm:px-5 sm:py-4 font-semibold whitespace-nowrap">
                        Swallow
                      </th>
                      <th className="px-4 py-3 sm:px-5 sm:py-4 font-semibold whitespace-nowrap">
                        Rice Type
                      </th>
                      <th className="px-4 py-3 sm:px-5 sm:py-4 font-semibold whitespace-nowrap">
                        Protein
                      </th>
                      <th className="px-4 py-3 sm:px-5 sm:py-4 font-semibold whitespace-nowrap">
                        Dessert
                      </th>
                      <th className="px-4 py-3 sm:px-5 sm:py-4 font-semibold whitespace-nowrap">
                        Afters
                      </th>
                      <th className="px-4 py-3 sm:px-5 sm:py-4 font-semibold whitespace-nowrap">
                        Submitted At
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-[1.05rem]">
                    {menuEntries.map((entry, idx) => {
                      const menu = entry.menu!;
                      return (
                        <tr
                          key={`${entry.id ?? entry.username}-menu-${idx}`}
                          className={
                            idx % 2 === 0
                              ? "bg-slate-900/60"
                              : "bg-slate-900/30"
                          }
                        >
                          <td className="px-4 py-3 sm:px-5 sm:py-4 whitespace-nowrap">
                            {entry.name}
                          </td>
                          <td className="px-4 py-3 sm:px-5 sm:py-4 whitespace-nowrap">
                            {entry.seat ?? "—"}
                          </td>
                          <td className="px-4 py-3 sm:px-5 sm:py-4 whitespace-nowrap">
                            {formatMenuId(menu.starter, starterLabelMap)}
                          </td>
                          <td className="px-4 py-3 sm:px-5 sm:py-4 whitespace-nowrap">
                            {formatMenuId(menu.salad, saladLabelMap)}
                          </td>
                          <td className="px-4 py-3 sm:px-5 sm:py-4 whitespace-nowrap">
                            {formatMainCourse(menu)}
                          </td>
                          <td className="px-4 py-3 sm:px-5 sm:py-4 whitespace-nowrap">
                            {formatMenuId(menu.localSoup, localSoupLabelMap)}
                          </td>
                          <td className="px-4 py-3 sm:px-5 sm:py-4 whitespace-nowrap">
                            {formatMenuId(menu.swallow, swallowLabelMap)}
                          </td>
                          <td className="px-4 py-3 sm:px-5 sm:py-4 whitespace-nowrap">
                            {formatMenuId(menu.riceType, riceTypeLabelMap)}
                          </td>
                          <td className="px-4 py-3 sm:px-5 sm:py-4 whitespace-nowrap">
                            {formatMenuId(menu.protein, proteinLabelMap)}
                          </td>
                          <td className="px-4 py-3 sm:px-5 sm:py-4 whitespace-nowrap">
                            {formatMenuId(menu.dessert, dessertLabelMap)}
                          </td>
                          <td className="px-4 py-3 sm:px-5 sm:py-4 whitespace-nowrap">
                            {formatMenuId(menu.afters, aftersLabelMap)}
                          </td>
                          <td className="px-4 py-3 sm:px-5 sm:py-4 whitespace-nowrap">
                            {formatSubmittedAt(entry.submittedAt)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
