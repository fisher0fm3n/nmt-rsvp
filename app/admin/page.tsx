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
// Menu option definitions + label maps (NEW MENU)
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
  type?: "local" | "continental" | null; // ✅ new

  starter: string | null;
  salad: string | null;
  mainCourse: string; // id
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
  menu?: Menu | null;
};

type ApiResponse = {
  status: boolean;
  message: string;
  count?: number;
  data?: Entry[];
};

const SESSION_KEY = "rsvp_admin_session";

const seatOptions = [...Array.from({ length: 50 }, (_, i) => `Table ${i + 1}`), "Bleachers"];

const formatMenuId = (id: string | null | undefined, labelMap: Record<string, string>) => {
  if (!id) return "—";
  return labelMap[id] ?? id;
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

export default function AdminRsvpPage() {
  // ─────────────────────────────────────────────
  // State
  // ─────────────────────────────────────────────
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [apiMessage, setApiMessage] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  const [seatLoading, setSeatLoading] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<"rsvp" | "menu">("rsvp");

  // counts route stats
  const [countsLoading, setCountsLoading] = useState(false);
  const [continentalCount, setContinentalCount] = useState<number>(0);
  const [localCount, setLocalCount] = useState<number>(0);
  const [continentalLimit, setContinentalLimit] = useState<number>(100);

  const isAuthed = entries !== null;

  // ✅ IMPORTANT: derive menuEntries + stats with useMemo UNCONDITIONALLY (no early-return before this)
  const menuEntries = useMemo(() => {
    const list = entries ?? [];
    return list.filter((e) => e.menu && e.menu.mainCourse);
  }, [entries]);

  const stats = useMemo(() => {
    const total = entries?.length ?? 0;
    const withMenu = menuEntries.length;

    const yes = (entries ?? []).filter((e) => (e.attendance || "").toLowerCase() === "yes").length;
    const no = (entries ?? []).filter((e) => (e.attendance || "").toLowerCase() === "no").length;
    const unknownAttend = Math.max(0, total - yes - no);

    const withSeat = (entries ?? []).filter((e) => !!e.seat).length;
    const noSeat = Math.max(0, total - withSeat);

    const typeCountsFromEntries = menuEntries.reduce(
      (acc, e) => {
        const t = inferMenuType(e.menu);
        if (t === "continental") acc.continental += 1;
        else if (t === "local") acc.local += 1;
        else acc.unknown += 1;
        return acc;
      },
      { continental: 0, local: 0, unknown: 0 }
    );

    const bySeat = (entries ?? []).reduce((acc, e) => {
      const key = e.seat || "Unassigned";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topSeats = Object.entries(bySeat)
      .filter(([k]) => k !== "Unassigned")
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    const continentalRemaining = Math.max(0, continentalLimit - continentalCount);
    const continentalFull = continentalCount >= continentalLimit;

    return {
      total,
      withMenu,
      yes,
      no,
      unknownAttend,
      withSeat,
      noSeat,
      typeCountsFromEntries,
      topSeats,
      continentalRemaining,
      continentalFull,
    };
  }, [entries, menuEntries, continentalCount, continentalLimit]);

  // ─────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────
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

  const StatCard = ({
    label,
    value,
    hint,
    tone = "neutral",
  }: {
    label: string;
    value: string | number;
    hint?: string;
    tone?: "neutral" | "green" | "amber" | "red" | "blue" | "purple";
  }) => {
    const toneClass =
      tone === "green"
        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-100"
        : tone === "amber"
        ? "border-amber-500/40 bg-amber-500/10 text-amber-100"
        : tone === "red"
        ? "border-red-500/40 bg-red-500/10 text-red-100"
        : tone === "blue"
        ? "border-sky-500/40 bg-sky-500/10 text-sky-100"
        : tone === "purple"
        ? "border-purple-500/40 bg-purple-500/10 text-purple-100"
        : "border-slate-700/60 bg-slate-950/40 text-slate-100";

    return (
      <div className={`rounded-2xl border p-4 sm:p-5 ${toneClass}`}>
        <p className={`${poppins.className} text-xs tracking-[0.18em] uppercase opacity-90`}>{label}</p>
        <p className={`${cormorant.className} mt-2 text-3xl sm:text-4xl font-semibold`}>{value}</p>
        {hint ? <p className={`${poppins.className} mt-1 text-xs text-slate-200/70`}>{hint}</p> : null}
      </div>
    );
  };

  // ─────────────────────────────────────────────
  // API calls
  // ─────────────────────────────────────────────
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
      setContinentalLimit(Number(data.continentalLimit || 100));
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

  const handleSeatChange = async (entryId: string, seat: string) => {
    if (!seat) return;

    setError(null);
    setApiMessage(null);
    setSeatLoading((prev) => ({ ...prev, [entryId]: true }));

    try {
      const res = await fetch("https://pcdl.co/api/nmt/pka-thanksgivingservice/seat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "sfWryh0mscQzn0TcFvdz4smp8abRSZLlMo1qpK7UQNoWAw30A9yNbRjL0RMUS741",
        },
        body: JSON.stringify({ id: entryId, seat }),
      });

      if (!res.ok) {
        setError(`Failed to set seat (status ${res.status})`);
        return;
      }

      const json = await res.json();
      if (!json.status) {
        setError(json.message || "Failed to set seat.");
        return;
      }

      setEntries((prev) =>
        prev ? prev.map((e) => (e.id === entryId ? { ...e, seat: json.data?.seat ?? seat } : e)) : prev
      );

      setApiMessage("Seat updated successfully.");
    } catch (err) {
      console.error("Error setting seat:", err);
      setError("Network error while setting seat.");
    } finally {
      setSeatLoading((prev) => {
        const copy = { ...prev };
        delete copy[entryId];
        return copy;
      });
    }
  };

  const handleExportMenuCsv = () => {
    if (!menuEntries.length) return;

    const header = [
      "Name",
      "Username",
      "Menu Type",
      "Starter",
      "Second Course",
      "Salad",
      "Main Course",
      "Local Soup (legacy)",
      "Swallow",
      "Rice Type",
      "Protein",
      "Dessert",
      "Afters",
      "Submitted At",
    ];

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

  // ─────────────────────────────────────────────
  // Effects
  // ─────────────────────────────────────────────
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
  // Renders (safe now — hooks already ran)
  // ─────────────────────────────────────────────
  if (restoring && !isAuthed) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-purple-900 text-slate-100">
        <p className="text-lg">Loading admin session…</p>
      </main>
    );
  }

  if (!isAuthed) {
    return (
      <main className="relative min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-slate-900 via-slate-950 to-purple-900 text-lg">
        <canvas id="sparkles-canvas" className="pointer-events-none fixed inset-0 z-0 w-full" />

        <div className="text-center relative z-10 w-full max-w-7xl bg-slate-900/60 border border-slate-700/60 rounded-3xl shadow-2xl backdrop-blur-md p-5 sm:p-7 lg:p-9">
          <div className="flex flex-col gap-10 lg:flex-row items-center">
            <div className="flex-1 text-left space-y-7 mt-4 lg:mt-0">
              <div className="text-center space-y-3">
                <h2 className={`${cormorant.className} text-center text-2xl sm:text-5xl text-blue-300 mt-4`}>
                  RSVP Admin
                </h2>
              </div>

              <section className="space-y-5">
                <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-5">
                  <div className="text-left">
                    <label className={`${poppins.className} block text-base text-slate-200 mb-1.5`} htmlFor="username">
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
                    <label className={`${poppins.className} block text-base text-slate-200 mb-1.5`} htmlFor="password">
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

                  {error && <p className="text-sm text-red-400 text-center">{error}</p>}

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

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-950 to-purple-900 px-3 sm:px-5 py-5 sm:py-7 text-lg">
      <canvas id="sparkles-canvas" className="pointer-events-none fixed inset-0 z-0 w-full" />

      <div className="relative z-10 max-w-6xl mx-auto space-y-7 sm:space-y-9">
        {/* Top banner */}
        <section className="relative w-full rounded-3xl overflow-hidden border border-slate-700/60 shadow-2xl bg-slate-950/60">
          <div className="relative h-44 sm:h-56 md:h-72">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/40 to-slate-950/90" />

            <div className="relative z-10 flex flex-col items-start justify-end h-full px-5 sm:px-7 md:px-9 py-5 sm:py-7">
              <div className="mt-2 w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className={`${cormorant.className} text-xl sm:text-3xl md:text-4xl text-emerald-300`}>
                    RSVP Admin Dashboard
                  </h2>

                  <div className="mt-3 inline-flex rounded-full bg-slate-900/70 p-1 border border-slate-700/70">
                    <button
                      type="button"
                      onClick={() => setActiveTab("rsvp")}
                      className={`${poppins.className} cursor-pointer px-4 sm:px-5 py-1.5 text-sm sm:text-base rounded-full transition ${
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
                      className={`${poppins.className} cursor-pointer px-4 sm:px-5 py-1.5 text-sm sm:text-base rounded-full transition ${
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

              <p className="mt-3 text-[1.125rem] text-slate-200 max-w-2xl">
                {activeTab === "rsvp"
                  ? "View and manage all registered attendees for the Thanksgiving Service."
                  : "View all guests who have submitted their menu selections."}
              </p>
            </div>
          </div>
        </section>

        <div className="flex items-center gap-3">
          <button
            onClick={async () => {
              await handleRefresh();
              await fetchMenuCounts();
            }}
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

        {/* Stats */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className={`${cormorant.className} text-2xl sm:text-3xl text-amber-200 font-semibold`}>Stats</h3>
            <button
              type="button"
              onClick={fetchMenuCounts}
              disabled={countsLoading}
              className={`${poppins.className} text-sm cursor-pointer px-3 py-1.5 rounded-md border border-slate-600/60 bg-slate-950/40 text-slate-100 hover:bg-slate-950/60 disabled:opacity-60`}
            >
              {countsLoading ? "Updating…" : "Update Stats"}
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
            <StatCard label="Total RSVPs" value={stats.total} hint="All entries" tone="neutral" />
            <StatCard label="Menu Submitted" value={stats.withMenu} hint="Guests w/ menu" tone="blue" />
            {/* <StatCard label="Attendance: Yes" value={stats.yes} hint="Confirmed attending" tone="green" /> */}
            {/* <StatCard label="Attendance: No" value={stats.no} hint="Not attending" tone="red" /> */}
            {/* <StatCard label="Seat Assigned" value={stats.withSeat} hint={`Unassigned: ${stats.noSeat}`} tone="purple" /> */}
            <StatCard
              label="Continental Remaining"
              value={`${stats.continentalRemaining}/${continentalLimit}`}
              hint={stats.continentalFull ? "FULL" : "Capacity status"}
              tone={stats.continentalFull ? "red" : "amber"}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <StatCard
              label="Continental Menus"
              value={continentalCount}
              hint="From /menu/counts"
              tone={continentalCount >= continentalLimit ? "red" : "amber"}
            />
            <StatCard label="Local Menus" value={localCount} hint="From /menu/counts" tone="green" />
            {/* <StatCard
              label="Menu Type (from entries)"
              value={`${stats.typeCountsFromEntries.continental} C / ${stats.typeCountsFromEntries.local} L`}
              hint={`Unknown: ${stats.typeCountsFromEntries.unknown}`}
              tone="neutral"
            /> */}
          </div>

          {/* {stats.topSeats.length ? (
            <div className="rounded-2xl border border-slate-700/60 bg-slate-950/40 p-4">
              <p className={`${poppins.className} text-xs tracking-[0.18em] uppercase text-slate-200/80`}>Top Filled Tables</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {stats.topSeats.map(([seat, n]) => (
                  <span
                    key={seat}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-600/60 bg-slate-950/60 px-3 py-1 text-sm text-slate-100"
                  >
                    <span className="font-semibold">{seat}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-200">{n}</span>
                  </span>
                ))}
              </div>
            </div>
          ) : null} */}
        </section>

        {/* Tabs content */}
        {activeTab === "rsvp" ? (
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                <h3 className={`${cormorant.className} text-2xl sm:text-[2.25rem] text-amber-200 font-semibold`}>
                  RSVP Entries
                </h3>
                {error && <p className="text-sm text-red-400 mt-1">{error}</p>}
                {apiMessage && !error && <p className="text-sm text-emerald-300 mt-1">{apiMessage}</p>}
              </div>
              <p className="text-base text-slate-300">
                Showing {entries?.length ?? 0} of {totalCount ?? entries?.length ?? 0} entries
              </p>
            </div>

            {/* Mobile */}
            <div className="space-y-3 md:hidden">
              {entries!.map((entry, idx) => (
                <div
                  key={`${entry.id}-${idx}`}
                  className="rounded-2xl border border-slate-700/70 bg-slate-950/80 p-4 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div>
                      <p className="font-semibold text-slate-50 text-lg">{entry.name}</p>
                      <p className="text-slate-300 text-base">@{entry.username}</p>
                    </div>
                  </div>

                  <p className="text-slate-400 text-sm">Submitted: {formatSubmittedAt(entry.submittedAt)}</p>
                </div>
              ))}
            </div>

            {/* Desktop */}
            <div className="hidden md:block">
              <div className="w-full overflow-x-auto rounded-xl border border-slate-700/60 bg-slate-950/70">
                <table className="min-w-full text-left text-base sm:text-lg text-slate-100">
                  <thead className="bg-slate-950/90 text-lg">
                    <tr>
                      <th className="px-4 py-3 sm:px-5 sm:py-4 font-semibold">Name</th>
                      <th className="px-4 py-3 sm:px-5 sm:py-4 font-semibold">Username</th>
                      <th className="px-4 py-3 sm:px-5 sm:py-4 font-semibold whitespace-nowrap">Submitted At</th>
                    </tr>
                  </thead>
                  <tbody className="text-[1.1rem]">
                    {entries!.map((entry, idx) => {
                      const rowLoading = !!seatLoading[entry.id];
                      return (
                        <tr
                          key={`${entry.id ?? entry.username}-${idx}`}
                          className={idx % 2 === 0 ? "bg-slate-900/60" : "bg-slate-900/30"}
                        >
                          <td className="px-4 py-3 sm:px-5 sm:py-4 whitespace-nowrap">{entry.name}</td>
                          <td className="px-4 py-3 sm:px-5 sm:py-4 whitespace-nowrap">{entry.username}</td>
                          <td className="px-4 py-3 sm:px-5 sm:py-4 whitespace-nowrap">{formatSubmittedAt(entry.submittedAt)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        ) : (
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                <h3 className={`${cormorant.className} text-2xl sm:text-[2.25rem] text-amber-200 font-semibold`}>
                  Menu Orders
                </h3>
                {error && <p className="text-sm text-red-400 mt-1">{error}</p>}
                {apiMessage && !error && <p className="text-sm text-emerald-300 mt-1">{apiMessage}</p>}
              </div>
              <div className="flex items-center gap-3">
                <p className="text-base text-slate-300">{menuEntries.length} guests with menu selections</p>
                <button
                  type="button"
                  onClick={handleExportMenuCsv}
                  className={`${poppins.className} text-sm sm:text-base cursor-pointer px-4 py-2 rounded-md bg-amber-400 hover:bg-amber-300 text-slate-900 font-semibold shadow`}
                >
                  Export CSV
                </button>
              </div>
            </div>

            {/* Mobile cards */}
            <div className="space-y-3 md:hidden">
              {menuEntries.map((entry, idx) => {
                const menu = entry.menu!;
                const type = inferMenuType(menu);
                const typeBadge =
                  type === "continental"
                    ? "bg-amber-500/20 border-amber-500/40 text-amber-200"
                    : type === "local"
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-200"
                    : "bg-slate-500/20 border-slate-500/40 text-slate-200";

                return (
                  <div
                    key={`${entry.id}-menu-${idx}`}
                    className="rounded-2xl border border-slate-700/70 bg-slate-950/80 p-4 flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-semibold text-slate-50 text-lg">{entry.name}</p>
                        <p className="text-slate-300 text-base">@{entry.username}</p>
                      </div>
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${typeBadge}`}>
                        {type.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-sm text-slate-200">
                      <span className="font-semibold">Starter:</span> {formatMenuId(menu.starter, starterLabelMap)}
                    </p>
                    <p className="text-sm text-slate-200">
                      <span className="font-semibold">Second Course:</span> {formatHorsDoeuvres(menu.horsDoeuvres ?? null)}
                    </p>
                    <p className="text-sm text-slate-200">
                      <span className="font-semibold">Salad:</span> {formatMenuId(menu.salad, saladLabelMap)}
                    </p>
                    <p className="text-sm text-slate-200">
                      <span className="font-semibold">Main Course:</span> {formatMainCourse(menu)}
                    </p>
                    <p className="text-sm text-slate-200">
                      <span className="font-semibold">Local Soup (legacy):</span> {formatMenuId(menu.localSoup, localSoupLabelMap)}
                    </p>
                    <p className="text-sm text-slate-200">
                      <span className="font-semibold">Swallow:</span> {formatMenuId(menu.swallow, swallowLabelMap)}
                    </p>
                    <p className="text-sm text-slate-200">
                      <span className="font-semibold">Rice Type:</span> {formatMenuId(menu.riceType, riceTypeLabelMap)}
                    </p>
                    <p className="text-sm text-slate-200">
                      <span className="font-semibold">Protein:</span> {formatMenuId(menu.protein, proteinLabelMap)}
                    </p>
                    <p className="text-sm text-slate-200">
                      <span className="font-semibold">Dessert:</span> {formatMenuId(menu.dessert, dessertLabelMap)}
                    </p>
                    <p className="text-sm text-slate-200">
                      <span className="font-semibold">Afters:</span> {formatMenuId(menu.afters, aftersLabelMap)}
                    </p>

                    <p className="text-xs text-slate-500 mt-1">Submitted: {formatSubmittedAt(entry.submittedAt)}</p>
                  </div>
                );
              })}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block">
              <div className="w-full overflow-x-auto rounded-xl border border-slate-700/60 bg-slate-950/70">
                <table className="min-w-full text-left text-base sm:text-lg text-slate-100">
                  <thead className="bg-slate-950/90 text-lg">
                    <tr>
                      <th className="px-4 py-3 sm:px-5 sm:py-4 font-semibold">Name</th>
                      <th className="px-4 py-3 sm:px-5 sm:py-4 font-semibold">Type</th>
                      <th className="px-4 py-3 sm:px-5 sm:py-4 font-semibold whitespace-nowrap">Starter</th>
                      <th className="px-4 py-3 sm:px-5 sm:py-4 font-semibold whitespace-nowrap">Second Course</th>
                      <th className="px-4 py-3 sm:px-5 sm:py-4 font-semibold whitespace-nowrap">Salad</th>
                      <th className="px-4 py-3 sm:px-5 sm:py-4 font-semibold whitespace-nowrap">Main Course</th>
                      <th className="px-4 py-3 sm:px-5 sm:py-4 font-semibold whitespace-nowrap">Local Soup (legacy)</th>
                      <th className="px-4 py-3 sm:px-5 sm:py-4 font-semibold whitespace-nowrap">Swallow</th>
                      <th className="px-4 py-3 sm:px-5 sm:py-4 font-semibold whitespace-nowrap">Rice Type</th>
                      <th className="px-4 py-3 sm:px-5 sm:py-4 font-semibold whitespace-nowrap">Protein</th>
                      <th className="px-4 py-3 sm:px-5 sm:py-4 font-semibold whitespace-nowrap">Dessert</th>
                      <th className="px-4 py-3 sm:px-5 sm:py-4 font-semibold whitespace-nowrap">Afters</th>
                      <th className="px-4 py-3 sm:px-5 sm:py-4 font-semibold whitespace-nowrap">Submitted At</th>
                    </tr>
                  </thead>
                  <tbody className="text-[1.05rem]">
                    {menuEntries.map((entry, idx) => {
                      const menu = entry.menu!;
                      const type = inferMenuType(menu);

                      const typeBadge =
                        type === "continental"
                          ? "bg-amber-500/20 border-amber-500/40 text-amber-200"
                          : type === "local"
                          ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-200"
                          : "bg-slate-500/20 border-slate-500/40 text-slate-200";

                      return (
                        <tr
                          key={`${entry.id ?? entry.username}-menu-${idx}`}
                          className={idx % 2 === 0 ? "bg-slate-900/60" : "bg-slate-900/30"}
                        >
                          <td className="px-4 py-3 sm:px-5 sm:py-4 whitespace-nowrap">{entry.name}</td>
                          <td className="px-4 py-3 sm:px-5 sm:py-4 whitespace-nowrap">
                            <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${typeBadge}`}>
                              {type.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 py-3 sm:px-5 sm:py-4 whitespace-nowrap">
                            {formatMenuId(menu.starter, starterLabelMap)}
                          </td>
                          <td className="px-4 py-3 sm:px-5 sm:py-4 whitespace-nowrap">
                            {formatHorsDoeuvres(menu.horsDoeuvres ?? null)}
                          </td>
                          <td className="px-4 py-3 sm:px-5 sm:py-4 whitespace-nowrap">
                            {formatMenuId(menu.salad, saladLabelMap)}
                          </td>
                          <td className="px-4 py-3 sm:px-5 sm:py-4 whitespace-nowrap">{formatMainCourse(menu)}</td>
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
