// app/thanksgivingservice/admin/page.tsx
// @ts-nocheck
"use client";

import { useEffect, useMemo, useState, FormEvent } from "react";
// @ts-ignore
import confetti from "canvas-confetti";
import { Great_Vibes, Cormorant_Garamond, Poppins } from "next/font/google";

const greatVibes = Great_Vibes({ subsets: ["latin"], weight: "400" });
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

// ─────────────────────────────────────────────
// Menu option definitions + label maps
// (kept as-is from your file; only UI/layout/table columns change)
// ─────────────────────────────────────────────

type MenuOption = { id: string; label: string };

const starterOptions: MenuOption[] = [
  { id: "velvety-carrot-coconut-soup", label: "Velvety Roasted Carrot & Coconut Soup" },
  { id: "traditional-chicken-pepper-soup", label: "Traditional Chicken Pepper Soup" },
  { id: "goat-pepper-soup", label: "Goat Meat Pepper Soup" },
  { id: "chicken-soup", label: "Chicken Soup" },
];

const horsDoeuvreOptions: MenuOption[] = [
  { id: "golden-puff-puffs", label: "Golden Puff-Puffs" },
  { id: "vegetable-spring-rolls", label: "Vegetable Spring Rolls" },
  { id: "beef-samosas", label: "Beef Samosas" },
  { id: "plantain-puffies-mosa", label: "Plantain Puffies (Mosa)" },
  { id: "chargrilled-bbq-chicken-wings", label: "Chargrilled Barbecued Chicken Wings" },
  { id: "peppered-gizzard", label: "Peppered Gizzard" },
  { id: "peppered-mini-beef-kebab", label: "Peppered Mini Beef Kebab" },
  { id: "peppered-snail", label: "Peppered Snail" },
];

const saladOptions: MenuOption[] = [
  { id: "summer-salad-medley", label: "Summer Salad Medley" },
  { id: "waldorf-salad", label: "Waldorf Salad" },
  { id: "chicken-salad", label: "Chicken Salad" },
];

const orientalMainOptions: MenuOption[] = [
  { id: "oriental-singapore-noodles", label: "Singapore Vermicelli Noodles" },
  { id: "oriental-special-fried-rice", label: "Special Oriental Fried Rice" },
  { id: "oriental-chinese-rice", label: "Chinese Rice" },
  { id: "oriental-chicken-green-herb-sauce", label: "Chicken In Green Herbs Sauce with Seasonal Vegetables" },
  { id: "oriental-shredded-beef-oyster-sauce", label: "Shredded Beef with Green Peppers in Oyster Sauce" },
  { id: "oriental-king-prawn-chilli-sauce", label: "King Prawn in Chilli Sauce" },
];

const continentalMainOptions: MenuOption[] = [
  { id: "continental-creamy-tuscan-chicken", label: "Creamy Tuscan Chicken with Mashed Potatoes & Rainbow Carrots" },
  { id: "continental-grilled-sweet-potato-aubergine", label: "Grilled Sweet Potato & Smoky Aubergines with Seasonal Vegetables" },
  { id: "grilled-fillet-steak", label: "Grilled Fillet Steak with Mushroom Sauce" },
  { id: "pan-fried-crocker-fish", label: "Pan Fried Crocker Fish with Garlic Sauce" },
  { id: "seafood-linguine", label: "Seafood Linguine" },
  { id: "chinese-fried-rice-beef", label: "Chinese Fried Rice with Shredded Beef Sauce" },
  { id: "chicken-curry-singapore-noodles", label: "Chicken Curry Sauce with Singapore Noodles" },
];

const LOCAL_JOLLOF_ID = "local-smoky-jollof-or-fried-rice";
const LOCAL_OFADA_ID = "local-ofada-rice-designer-sauce";
const LOCAL_YAM_PORRIDGE_ID = "local-yam-sweet-potato-porridge";
const LOCAL_AMALA_ID = "local-amala-station";
const LOCAL_EFO_ID = "local-efo-riro";
const LOCAL_SEAFOOD_OKRO_ID = "local-seafood-okro";

const LEGACY_LOCAL_SOUP_MAIN_ID = "local-soup-main";
const LEGACY_JOLLOF_FRIED_MAIN_ID = "jollof-fried-rice-chicken-fish";

const localMainOptions: MenuOption[] = [
  {
    id: LOCAL_JOLLOF_ID,
    label: "Smoky Jollof or Fried Rice with Stewed Chicken/Beef/Fresh Fish, Plantain & Moinmoin",
  },
  { id: LOCAL_OFADA_ID, label: "Ofada Rice with ‘Designer’ Sauce" },
  { id: LOCAL_YAM_PORRIDGE_ID, label: "Yam & Sweet Potato Porridge with Stewed Chicken/Beef/Fresh Fish" },
  { id: LOCAL_AMALA_ID, label: "Live Amala Station with Bean Purée and Jute Mallow Soup (Yam Flour)" },
  {
    id: LOCAL_EFO_ID,
    label: "Efo Riro Soup with Assorted Meats, Snails & Stockfish (Served with Pounded Yam or Plantain Meal)",
  },
  { id: LOCAL_SEAFOOD_OKRO_ID, label: "Seafood Okro Soup (Served with Pounded Yam or Plantain Meal)" },
  { id: LEGACY_LOCAL_SOUP_MAIN_ID, label: "Efo Riro / Mixed Okro / Afang / Edikaikong (Legacy Combo)" },
  { id: "amala-ewedu-gbegiri", label: "Amala with Ewedu and Gbegiri (Legacy)" },
  { id: "ofada-rice", label: "Ofada Rice with Ofada Sauce and Plantain (Legacy)" },
  { id: LEGACY_JOLLOF_FRIED_MAIN_ID, label: "Jollof/Fried Rice with Chicken, Fish, Moinmoin, Coleslaw (Legacy)" },
];

const riceTypeOptions: MenuOption[] = [
  { id: "smoky-jollof-rice", label: "Smoky Jollof Rice" },
  { id: "fried-rice", label: "Fried Rice" },
  { id: "jollof-rice", label: "Jollof Rice" },
];

const proteinOptions: MenuOption[] = [
  { id: "chicken", label: "Chicken" },
  { id: "beef", label: "Beef" },
  { id: "fresh-fish", label: "Fresh Fish" },
  { id: "fish", label: "Fish" },
  { id: "moinmoin", label: "Moinmoin" },
  { id: "coleslaw", label: "Coleslaw" },
];

const swallowOptions: MenuOption[] = [
  { id: "pounded-yam", label: "Pounded Yam" },
  { id: "plantain-meal", label: "Plantain Meal" },
  { id: "semo", label: "Semo" },
  { id: "poundo-yam", label: "Poundo Yam" },
];

const dessertOptions: MenuOption[] = [
  { id: "vanilla-gelato-red-velvet-cake", label: "Madagascar Vanilla Gelato with Red Velvet Cake" },
  { id: "vanilla-gelato-chocolate-cake", label: "Madagascar Vanilla Gelato with Chocolate Cake" },
  { id: "salted-caramel-gelato-red-velvet-cake", label: "Salted Caramel Gelato with Red Velvet Cake" },
  { id: "salted-caramel-gelato-chocolate-cake", label: "Salted Caramel Gelato with Chocolate Cake" },
  { id: "ice-cream", label: "Ice Cream" },
  { id: "cup-cakes", label: "Cup Cakes" },
  { id: "parfait", label: "Parfait" },
  { id: "fruit-medley", label: "Fruit Medley" },
];

const aftersOptions: MenuOption[] = [
  { id: "exotic-fruit-medley", label: "Exotic Fruit Medley (Tropical Fruit Fusion)" },
  { id: "roselle-tea-and-cookies", label: "Roselle Tea with Delicate Cookies" },
  { id: "luxe-midnight-snack-pack", label: "Luxe Midnight Treat – Gourmet Midnight Snack Pack" },
  { id: "small-chops", label: "Small Chops" },
  { id: "fries", label: "Fries" },
];

const buildLabelMap = (options: MenuOption[]) =>
  options.reduce((acc, opt) => {
    acc[opt.id] = opt.label;
    return acc;
  }, {} as Record<string, string>);

const starterLabelMap = buildLabelMap(starterOptions);
const horsDoeuvreLabelMap = buildLabelMap(horsDoeuvreOptions);
const saladLabelMap = buildLabelMap(saladOptions);
const mainCourseLabelMap = buildLabelMap([...orientalMainOptions, ...continentalMainOptions, ...localMainOptions]);
const swallowLabelMap = buildLabelMap(swallowOptions);
const riceTypeLabelMap = buildLabelMap(riceTypeOptions);
const proteinLabelMap = buildLabelMap(proteinOptions);
const dessertLabelMap = buildLabelMap(dessertOptions);
const aftersLabelMap = buildLabelMap(aftersOptions);

const localSoupLabelMap: Record<string, string> = {
  "efo-riro": "Efo Riro",
  "mixed-okro": "Mixed Okro",
  afang: "Afang",
  edikaikong: "Edikaikong",
};

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type Menu = {
  type?: "local" | "continental" | null;
  starter: string | null;
  salad: string | null;
  mainCourse: string;
  localSoup: string | null;
  swallow: string | null;
  dessert: string | null;
  afters: string | null;
  riceType: string | null;
  protein: string | null;
  horsDoeuvres?: string[] | null;
};

type Entry = {
  id: string;
  name: string;
  username: string;
  email?: string | null;
  attendance?: string | null;
  submittedAt?: string;
  seat?: string | null;
  menu?: Menu | null;
};

type ApiResponse = {
  status: boolean;
  message: string;
  count?: number;
  data?: Entry[];
};

const SESSION_KEY = "rsvp_admin_session";

const humanizeId = (raw: string) => {
  // remove common prefixes that shouldn’t show to admins
  const cleaned = raw
    .replace(/^continental-/, "")
    .replace(/^local-/, "")
    .replace(/^oriental-/, "")
    .replace(/_/g, "-")
    .trim();

  // turn "herb-roasted-chicken-basmati-rice" -> "Herb Roasted Chicken Basmati Rice"
  return cleaned
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

const formatMenuId = (
  id: string | null | undefined,
  labelMap: Record<string, string>
) => {
  if (!id) return "—";
  return labelMap[id] ?? humanizeId(id);
};


const formatMainCourse = (menu?: Menu | null) => {
  if (!menu) return "—";
  return formatMenuId(menu.mainCourse, mainCourseLabelMap);
};

const formatHorsDoeuvres = (ids?: string[] | null) => {
  if (!ids || !ids.length) return "—";
  return ids.map((id) => formatMenuId(id, horsDoeuvreLabelMap)).join(", ");
};

const inferMenuType = (menu?: Menu | null): "local" | "continental" | "unknown" => {
  if (!menu) return "unknown";
  if (menu.type === "local" || menu.type === "continental") return menu.type;
  const mc = menu.mainCourse || "";
  if (typeof mc === "string" && mc.startsWith("continental-")) return "continental";
  if (typeof mc === "string" && mc.startsWith("local-")) return "local";
  return "unknown";
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
        className={`h-28 w-28 sm:h-36 sm:w-36 opacity-90 drop-shadow-[0_10px_18px_rgba(0,0,0,0.28)] ${transform}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="240" y2="240" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FDE68A" />
            <stop offset="0.5" stopColor="#D97706" />
            <stop offset="1" stopColor="#FDE68A" />
          </linearGradient>
          <radialGradient
            id="b"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(170 78) rotate(45) scale(110)"
          >
            <stop stopColor="#FDE68A" stopOpacity="0.95" />
            <stop offset="1" stopColor="#F59E0B" stopOpacity="0.15" />
          </radialGradient>
        </defs>

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

const CountCard = ({
  label,
  value,
  tone = "neutral",
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "neutral" | "amber" | "green";
}) => {
  const toneClass =
    tone === "amber"
      ? "border-amber-400/45 bg-amber-50/60"
      : tone === "green"
      ? "border-emerald-400/45 bg-emerald-50/60"
      : "border-amber-300/35 bg-white/60";

  return (
    <div className={`rounded-2xl border p-5 sm:p-6 shadow-[0_18px_60px_rgba(0,0,0,0.12)] ${toneClass}`}>
      <p className={`${poppins.className} text-xs tracking-[0.18em] uppercase text-neutral-700`}>{label}</p>
      <p className={`${cormorant.className} mt-2 text-4xl sm:text-5xl font-semibold text-neutral-900`}>{value}</p>
      {hint ? <p className={`${poppins.className} mt-1 text-xs text-neutral-600`}>{hint}</p> : null}
    </div>
  );
};

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export default function AdminRsvpPage() {
  // State
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [apiMessage, setApiMessage] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  const [activeTab, setActiveTab] = useState<"rsvp" | "menu">("rsvp");

  // counts route stats (keep)
  const [countsLoading, setCountsLoading] = useState(false);
  const [continentalCount, setContinentalCount] = useState<number>(0);
  const [localCount, setLocalCount] = useState<number>(0);

  const isAuthed = entries !== null;

  const menuEntries = useMemo(() => {
    const list = entries ?? [];
    return list.filter((e) => e.menu && e.menu.mainCourse);
  }, [entries]);

  const stats = useMemo(() => {
    const total = entries?.length ?? 0;

    // Use /menu/counts when available (you already do)
    const c = continentalCount ?? 0;
    const l = localCount ?? 0;

    // Fallback counts from entries (only if counts are 0 but we have menus)
    const fromEntries = menuEntries.reduce(
      (acc, e) => {
        const t = inferMenuType(e.menu);
        if (t === "continental") acc.continental += 1;
        else if (t === "local") acc.local += 1;
        else acc.unknown += 1;
        return acc;
      },
      { continental: 0, local: 0, unknown: 0 }
    );

    const computedContinental = c || fromEntries.continental;
    const computedLocal = l || fromEntries.local;

    return {
      total,
      menuCount: menuEntries.length,
      continental: computedContinental,
      local: computedLocal,
    };
  }, [entries, menuEntries, continentalCount, localCount]);

  // Helpers
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

  // API calls
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

      const res = await fetch("https://pcdl.co/api/nmt/rsvp/all", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "sfWryh0mscQzn0TcFvdz4smp8abRSZLlMo1qpK7UQNoWAw30A9yNbRjL0RMUS741",
        },
        body: JSON.stringify({ username: trimmedUser, password: trimmedPass }),
        cache: "no-store",
      });

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

      setEntries(json.data);
      setTotalCount(typeof json.count === "number" ? json.count : json.data.length);

      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(SESSION_KEY, JSON.stringify({ username: trimmedUser, password: trimmedPass }));
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

  const fetchMenuCounts = async () => {
    try {
      setCountsLoading(true);
      const res = await fetch("https://pcdl.co/api/nmt/rsvp/menu/counts", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "sfWryh0mscQzn0TcFvdz4smp8abRSZLlMo1qpK7UQNoWAw30A9yNbRjL0RMUS741",
        },
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`Counts request failed (${res.status})`);
      const json = await res.json();
      const data = json?.data || {};
      setContinentalCount(Number(data.continentalCount || 0));
      setLocalCount(Number(data.localCount || 0));
    } catch (e) {
      console.warn("Failed to fetch menu counts", e);
    } finally {
      setCountsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await loginAndFetch(username, password);
  };

  const handleLogout = () => {
    setEntries(null);
    setApiMessage(null);
    setError(null);
    setTotalCount(null);
    if (typeof window !== "undefined") window.localStorage.removeItem(SESSION_KEY);
  };

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

  const handleExportMenuCsv = () => {
    if (!menuEntries.length) return;

    // Removed seat column per request + trimmed unused columns to match the table
    const header = ["Name", "Username", "Menu Type", "Starter", "Second Course", "Salad", "Main Course", "Dessert", "Afters", "Submitted At"];

    const rows = menuEntries.map((entry) => {
      const menu = entry.menu!;
      const type = inferMenuType(menu);
      return [
        entry.name ?? "",
        entry.username ?? "",
        type,
        formatMenuId(menu.starter, starterLabelMap),
        formatHorsDoeuvres(menu.horsDoeuvres ?? null),
        formatMenuId(menu.salad, saladLabelMap),
        formatMainCourse(menu),
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
      [header, ...rows].map((row) => row.map((cell) => escapeCell(String(cell))).join(",")).join("\r\n") + "\r\n";

    if (typeof window === "undefined") return;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `menu-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Effects
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
          window.localStorage.removeItem(SESSION_KEY);
          setRestoring(false);
          return;
        }

        if (!parsed.username || !parsed.password) {
          window.localStorage.removeItem(SESSION_KEY);
          setRestoring(false);
          return;
        }

        setUsername(parsed.username);
        setPassword(parsed.password);
        await loginAndFetch(parsed.username, parsed.password);
      } finally {
        setRestoring(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isAuthed) return;

    const canvas = document.getElementById("sparkles-canvas") as HTMLCanvasElement | null;
    if (!canvas) return;

    const myConfetti = confetti.create(canvas, { resize: true, useWorker: true });
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
          origin: { x: Math.random(), y: -0.1 },
        });
      }
    }, 500);

    return () => window.clearInterval(interval);
  }, [isAuthed]);

  useEffect(() => {
    if (!isAuthed) return;
    fetchMenuCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthed]);

  useEffect(() => {
    if (!isAuthed) return;
    if (activeTab !== "menu") return;
    fetchMenuCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isAuthed]);

  // ─────────────────────────────────────────────
  // Renders
  // ─────────────────────────────────────────────
  if (restoring && !isAuthed) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[radial-gradient(1200px_800px_at_20%_10%,rgba(20,83,45,0.75),transparent_60%),linear-gradient(135deg,#052e23_0%,#064e3b_45%,#052e23_100%)]">
        <p className={`${poppins.className} text-sm text-amber-50/90`}>Loading admin session…</p>
      </main>
    );
  }

  // Login view (redesigned to match scheme)
  if (!isAuthed) {
    return (
      <main className="relative min-h-screen flex items-center justify-center px-4 py-10">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(1200px_800px_at_20%_10%,rgba(20,83,45,0.75),transparent_60%),radial-gradient(1000px_700px_at_85%_25%,rgba(6,95,70,0.55),transparent_58%),linear-gradient(135deg,#052e23_0%,#064e3b_45%,#052e23_100%)]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(800px_500px_at_50%_30%,rgba(250,204,21,0.08),transparent_60%)]" />
        <canvas id="sparkles-canvas" className="pointer-events-none fixed inset-0 z-0 w-full" />

        <div className="relative z-10 w-full max-w-xl">
          <div className="relative overflow-hidden rounded-[28px] border border-amber-200/35 bg-[#fbf3d6] shadow-[0_30px_120px_rgba(0,0,0,0.35)]">
            <CornerOrnament className="left-2 top-2" />
            <CornerOrnament className="right-2 top-2" flipX />
            {/* <CornerOrnament className="left-2 bottom-2" flipY />
            <CornerOrnament className="right-2 bottom-2" flipX flipY /> */}

            <div className="m-2 sm:m-3 rounded-[24px] border border-amber-300/40 bg-[linear-gradient(180deg,rgba(255,255,255,0.55),rgba(255,255,255,0.15))] p-6 sm:p-8">
              <div className="text-center">
                <p className={`${greatVibes.className} text-3xl text-amber-800/90`}>Admin</p>
                <h1 className={`${cormorant.className} mt-2 text-3xl sm:text-4xl font-semibold text-neutral-900`}>MBTC 17 BANQUET</h1>
                <OrnateDivider />
                <p className={`${poppins.className} text-sm text-neutral-700`}>Login to view RSVPs and Menu Orders.</p>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className={`${poppins.className} text-sm font-medium text-neutral-800`} htmlFor="username">
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-amber-300/45 bg-white/70 px-4 py-3 text-sm text-neutral-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                    autoComplete="username"
                  />
                </div>

                <div>
                  <label className={`${poppins.className} text-sm font-medium text-neutral-800`} htmlFor="password">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-amber-300/45 bg-white/70 px-4 py-3 text-sm text-neutral-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                    autoComplete="current-password"
                  />
                </div>

                {error && <p className={`${poppins.className} text-xs text-red-600 text-center`}>{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className={`${poppins.className} w-full inline-flex items-center justify-center rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-800 transition disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  {loading ? "Signing in…" : "Login"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Authenticated view
  return (
    <main className="relative min-h-screen w-full overflow-hidden px-4 py-10">
      {/* Background */}
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(1200px_800px_at_20%_10%,rgba(20,83,45,0.75),transparent_60%),radial-gradient(1000px_700px_at_85%_25%,rgba(6,95,70,0.55),transparent_58%),radial-gradient(900px_650px_at_40%_90%,rgba(22,78,99,0.35),transparent_55%),linear-gradient(135deg,#052e23_0%,#064e3b_45%,#052e23_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(800px_500px_at_50%_30%,rgba(250,204,21,0.08),transparent_60%)]" />
      <canvas id="sparkles-canvas" className="pointer-events-none fixed inset-0 z-0 w-full" />

      <div className="relative z-10 mx-auto w-full max-w-6xl space-y-6">
        {/* Card shell like the menu pages */}
        <div className="relative overflow-hidden rounded-[28px] border border-amber-200/35 bg-[#fbf3d6] shadow-[0_30px_120px_rgba(0,0,0,0.35)]">
          <CornerOrnament className="left-2 top-2" />
          <CornerOrnament className="right-2 top-2" flipX />
          {/* <CornerOrnament className="left-2 bottom-2" flipY />
          <CornerOrnament className="right-2 bottom-2" flipX flipY /> */}

          <div className="m-2 sm:m-3 rounded-[24px] border border-amber-300/40 bg-[linear-gradient(180deg,rgba(255,255,255,0.55),rgba(255,255,255,0.15))]">
            {/* Header */}
            <div className="px-6 sm:px-10 pt-10 pb-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className={`${greatVibes.className} text-3xl sm:text-4xl text-amber-800/90`}>Admin Dashboard</p>
                  <h1 className={`${cormorant.className} mt-2 text-3xl sm:text-5xl font-semibold tracking-wide text-neutral-900`}>
                    MBTC 17 BANQUET
                  </h1>
                  <OrnateDivider />
                  <p className={`${poppins.className} text-sm text-neutral-700`}>
                    {activeTab === "rsvp"
                      ? "View all registered attendees."
                      : "View guests who have submitted menu selections."}
                  </p>
                  {(error || apiMessage) && (
                    <p
                      className={`${poppins.className} mt-2 text-xs ${
                        error ? "text-red-600" : "text-emerald-700"
                      }`}
                    >
                      {error || apiMessage}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      await handleRefresh();
                      await fetchMenuCounts();
                    }}
                    disabled={loading}
                    className={`${poppins.className} inline-flex items-center justify-center rounded-full border border-amber-300 bg-white/70 px-4 py-2 text-xs font-semibold text-neutral-900 hover:bg-white transition disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    {loading ? "Refreshing…" : "Refresh"}
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className={`${poppins.className} inline-flex items-center justify-center rounded-full bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition`}
                  >
                    Logout
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="mt-6 inline-flex w-full max-w-md overflow-hidden rounded-full border border-amber-200 bg-amber-50/70">
                <button
                  type="button"
                  onClick={() => setActiveTab("rsvp")}
                  className={`${poppins.className} flex-1 px-4 py-2 text-xs font-semibold tracking-[0.18em] uppercase transition ${
                    activeTab === "rsvp" ? "bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-900" : "text-amber-800"
                  }`}
                >
                  RSVPs
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("menu")}
                  className={`${poppins.className} flex-1 px-4 py-2 text-xs font-semibold tracking-[0.18em] uppercase transition ${
                    activeTab === "menu" ? "bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-900" : "text-amber-800"
                  }`}
                >
                  Orders
                </button>
              </div>
            </div>

            {/* Count cards (ONLY keep total + Continental/Local) */}
            <div className="px-6 sm:px-10 pb-2">
              <div className="flex items-center justify-between gap-3">
                <h2 className={`${cormorant.className} text-xl sm:text-2xl font-semibold text-neutral-900`}>Counts</h2>
                <button
                  type="button"
                  onClick={fetchMenuCounts}
                  disabled={countsLoading}
                  className={`${poppins.className} inline-flex items-center justify-center rounded-full border border-amber-300 bg-white/70 px-4 py-2 text-xs font-semibold text-neutral-900 hover:bg-white transition disabled:opacity-60`}
                >
                  {countsLoading ? "Updating…" : "Update"}
                </button>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <CountCard label="Total RSVPs" value={stats.total} hint="All entries" />
                <CountCard label="Continental" value={stats.continental} hint="From /menu/counts" tone="amber" />
                <CountCard label="Local" value={stats.local} hint="From /menu/counts" tone="green" />
              </div>
            </div>

            {/* Content */}
            <div className="px-6 sm:px-10 pb-10 pt-6">
              {/* RSVP table (seat column removed) */}
              {activeTab === "rsvp" ? (
                <section className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
                    <h3 className={`${cormorant.className} text-2xl sm:text-3xl font-semibold text-neutral-900`}>
                      RSVP Entries
                    </h3>
                    <p className={`${poppins.className} text-xs text-neutral-700`}>
                      Showing {entries?.length ?? 0} of {totalCount ?? entries?.length ?? 0}
                    </p>
                  </div>

                  {/* Mobile cards */}
                  <div className="space-y-3 md:hidden">
                    {entries!.map((entry, idx) => (
                      <div
                        key={`${entry.id}-${idx}`}
                        className="rounded-2xl border border-amber-300/35 bg-white/60 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.10)]"
                      >
                        <p className={`${poppins.className} text-sm font-semibold text-neutral-900`}>{entry.name}</p>
                        <p className={`${poppins.className} text-xs text-neutral-700`}>@{entry.username}</p>
                        <p className={`${poppins.className} mt-2 text-[11px] text-neutral-600`}>
                          Submitted: {formatSubmittedAt(entry.submittedAt)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Desktop table */}
                  <div className="hidden md:block">
                    <div className="w-full overflow-x-auto rounded-2xl border border-amber-300/35 bg-white/60 shadow-[0_18px_60px_rgba(0,0,0,0.10)]">
                      <table className="min-w-full text-left text-sm text-neutral-900">
                        <thead className="bg-amber-50/70">
                          <tr>
                            <th className={`${poppins.className} px-4 py-3 text-xs font-semibold tracking-[0.14em] uppercase text-neutral-700`}>
                              Name
                            </th>
                            <th className={`${poppins.className} px-4 py-3 text-xs font-semibold tracking-[0.14em] uppercase text-neutral-700`}>
                              Username
                            </th>
                            <th className={`${poppins.className} px-4 py-3 text-xs font-semibold tracking-[0.14em] uppercase text-neutral-700 whitespace-nowrap`}>
                              Submitted At
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {entries!.map((entry, idx) => (
                            <tr key={`${entry.id ?? entry.username}-${idx}`} className={idx % 2 === 0 ? "bg-white/50" : "bg-amber-50/30"}>
                              <td className="px-4 py-3 whitespace-nowrap">{entry.name}</td>
                              <td className="px-4 py-3 whitespace-nowrap">@{entry.username}</td>
                              <td className="px-4 py-3 whitespace-nowrap">{formatSubmittedAt(entry.submittedAt)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>
              ) : (
                // Orders table (seat removed + unused columns removed)
                <section className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
                    <div>
                      <h3 className={`${cormorant.className} text-2xl sm:text-3xl font-semibold text-neutral-900`}>Menu Orders</h3>
                      <p className={`${poppins.className} mt-1 text-xs text-neutral-700`}>{menuEntries.length} guests with menu selections</p>
                    </div>

                    <button
                      type="button"
                      onClick={handleExportMenuCsv}
                      className={`${poppins.className} inline-flex items-center justify-center rounded-full bg-neutral-900 px-5 py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition`}
                    >
                      Export CSV
                    </button>
                  </div>

                  {/* Mobile cards */}
                  <div className="space-y-3 md:hidden">
                    {menuEntries.map((entry, idx) => {
                      const menu = entry.menu!;
                      const type = inferMenuType(menu);
                      const badge =
                        type === "continental"
                          ? "bg-amber-100 text-amber-900 border-amber-300/60"
                          : type === "local"
                          ? "bg-emerald-100 text-emerald-900 border-emerald-300/60"
                          : "bg-white/70 text-neutral-800 border-amber-200/60";

                      return (
                        <div
                          key={`${entry.id}-menu-${idx}`}
                          className="rounded-2xl border border-amber-300/35 bg-white/60 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.10)]"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className={`${poppins.className} text-sm font-semibold text-neutral-900`}>{entry.name}</p>
                              <p className={`${poppins.className} text-xs text-neutral-700`}>@{entry.username}</p>
                            </div>
                            <span className={`${poppins.className} inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold ${badge}`}>
                              {type.toUpperCase()}
                            </span>
                          </div>

                          <div className="mt-3 space-y-1">
                            <p className={`${poppins.className} text-xs text-neutral-800`}>
                              <span className="font-semibold">Starter:</span> {formatMenuId(menu.starter, starterLabelMap)}
                            </p>
                            <p className={`${poppins.className} text-xs text-neutral-800`}>
                              <span className="font-semibold">Second Course:</span> {formatHorsDoeuvres(menu.horsDoeuvres ?? null)}
                            </p>
                            <p className={`${poppins.className} text-xs text-neutral-800`}>
                              <span className="font-semibold">Salad:</span> {formatMenuId(menu.salad, saladLabelMap)}
                            </p>
                            <p className={`${poppins.className} text-xs text-neutral-800`}>
                              <span className="font-semibold">Main:</span> {formatMainCourse(menu)}
                            </p>
                            <p className={`${poppins.className} text-xs text-neutral-800`}>
                              <span className="font-semibold">Dessert:</span> {formatMenuId(menu.dessert, dessertLabelMap)}
                            </p>
                            <p className={`${poppins.className} text-xs text-neutral-800`}>
                              <span className="font-semibold">Afters:</span> {formatMenuId(menu.afters, aftersLabelMap)}
                            </p>
                          </div>

                          <p className={`${poppins.className} mt-3 text-[11px] text-neutral-600`}>
                            Submitted: {formatSubmittedAt(entry.submittedAt)}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Desktop table (trimmed columns) */}
                  <div className="hidden md:block">
                    <div className="w-full overflow-x-auto rounded-2xl border border-amber-300/35 bg-white/60 shadow-[0_18px_60px_rgba(0,0,0,0.10)]">
                      <table className="min-w-full text-left text-sm text-neutral-900">
                        <thead className="bg-amber-50/70">
                          <tr>
                            <th className={`${poppins.className} px-4 py-3 text-xs font-semibold tracking-[0.14em] uppercase text-neutral-700`}>
                              Name
                            </th>
                            <th className={`${poppins.className} px-4 py-3 text-xs font-semibold tracking-[0.14em] uppercase text-neutral-700`}>
                              Username
                            </th>
                            <th className={`${poppins.className} px-4 py-3 text-xs font-semibold tracking-[0.14em] uppercase text-neutral-700`}>
                              Type
                            </th>
                            <th className={`${poppins.className} px-4 py-3 text-xs font-semibold tracking-[0.14em] uppercase text-neutral-700 whitespace-nowrap`}>
                              Starter
                            </th>
                            <th className={`${poppins.className} px-4 py-3 text-xs font-semibold tracking-[0.14em] uppercase text-neutral-700 whitespace-nowrap`}>
                              Second Course
                            </th>
                            <th className={`${poppins.className} px-4 py-3 text-xs font-semibold tracking-[0.14em] uppercase text-neutral-700 whitespace-nowrap`}>
                              Salad
                            </th>
                            <th className={`${poppins.className} px-4 py-3 text-xs font-semibold tracking-[0.14em] uppercase text-neutral-700 whitespace-nowrap`}>
                              Main Course
                            </th>
                            <th className={`${poppins.className} px-4 py-3 text-xs font-semibold tracking-[0.14em] uppercase text-neutral-700 whitespace-nowrap`}>
                              Dessert
                            </th>
                            <th className={`${poppins.className} px-4 py-3 text-xs font-semibold tracking-[0.14em] uppercase text-neutral-700 whitespace-nowrap`}>
                              Afters
                            </th>
                            <th className={`${poppins.className} px-4 py-3 text-xs font-semibold tracking-[0.14em] uppercase text-neutral-700 whitespace-nowrap`}>
                              Submitted
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {menuEntries.map((entry, idx) => {
                            const menu = entry.menu!;
                            const type = inferMenuType(menu);
                            const badge =
                              type === "continental"
                                ? "bg-amber-100 text-amber-900 border-amber-300/60"
                                : type === "local"
                                ? "bg-emerald-100 text-emerald-900 border-emerald-300/60"
                                : "bg-white/70 text-neutral-800 border-amber-200/60";

                            return (
                              <tr key={`${entry.id ?? entry.username}-menu-${idx}`} className={idx % 2 === 0 ? "bg-white/50" : "bg-amber-50/30"}>
                                <td className="px-4 py-3 whitespace-nowrap">{entry.name}</td>
                                <td className="px-4 py-3 whitespace-nowrap">@{entry.username}</td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span className={`${poppins.className} inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold ${badge}`}>
                                    {type.toUpperCase()}
                                  </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">{formatMenuId(menu.starter, starterLabelMap)}</td>
                                <td className="px-4 py-3 whitespace-nowrap">{formatHorsDoeuvres(menu.horsDoeuvres ?? null)}</td>
                                <td className="px-4 py-3 whitespace-nowrap">{formatMenuId(menu.salad, saladLabelMap)}</td>
                                <td className="px-4 py-3 whitespace-nowrap">{formatMainCourse(menu)}</td>
                                <td className="px-4 py-3 whitespace-nowrap">{formatMenuId(menu.dessert, dessertLabelMap)}</td>
                                <td className="px-4 py-3 whitespace-nowrap">{formatMenuId(menu.afters, aftersLabelMap)}</td>
                                <td className="px-4 py-3 whitespace-nowrap">{formatSubmittedAt(entry.submittedAt)}</td>
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
          </div>
        </div>

        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 h-28 w-[85%] rounded-[999px] bg-amber-400/10 blur-3xl -z-10" />
      </div>
    </main>
  );
}
