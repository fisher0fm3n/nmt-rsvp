// app/thanksgivingservice/menu/page.tsx
// @ts-nocheck
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Great_Vibes, Cormorant_Garamond, Poppins } from "next/font/google";
import { useAuth } from "@/app/auth/components/AuthProvider";

const greatVibes = Great_Vibes({ subsets: ["latin"], weight: "400" });
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

type MenuOption = { id: string; label: string };

type User = {
  id: string;
  name: string;
  username: string;
  email?: string | null;
  attendance?: string | null;
  seat?: string | null;
  token: string;
  submittedAt?: string;
};

type MenuPayload = {
  starter: string | null;
  salad: string | null;
  mainCourse: string | null;
  dessert: string | null;
  afters: string | null; // we’ll store SNACKS/OTHERS here
  appetizers?: string[] | string | null;
  localSoup?: string | null;
  swallow?: string | null;
  riceType?: string | null;
  protein?: string | null;
};

/**
 * MENU (Updated)
 * Starter + Salad are fixed options (still selectable for consistency).
 * Main Course: Local + Continental (two tabs).
 * Dessert + Snacks/Others apply to both.
 */

// STARTER
const starterOptions: MenuOption[] = [
  { id: "starter-goat-meat-pepper-soup", label: "Goat Meat Pepper Soup with Bread Rolls" },
];

// SALADS
const saladOptions: MenuOption[] = [{ id: "salad-chicken-salad", label: "Chicken Salad" }];

// MAIN COURSE — LOCAL
const localMainOptions: MenuOption[] = [
  {
    id: "local-egusi-efo-mixed-okro-semo-poundo",
    label: "Egusi / Efo Riro / Mixed Okro Soup with Semo / Poundo",
  },
  { id: "local-amala-ewedu-gbegiri", label: "Amala, Ewedu & Gbegiri" },
  { id: "local-ofada-rice-sauce-plantain", label: "Ofada Rice / Ofada Sauce / Plantain" },
  {
    id: "local-jollof-rice-chicken-fish-moinmoin",
    label: "Jollof Rice / Chicken / Fish / Moinmoin",
  },
  {
    id: "local-fried-rice-chicken-fish-coleslaw",
    label: "Fried Rice / Chicken / Fish / Coleslaw",
  },
];

// MAIN COURSE — CONTINENTAL (also appears under “Local -> Continental” in your copy)
const continentalMainOptions: MenuOption[] = [
  {
    id: "continental-herb-roasted-chicken-basmati-nigerian-sauce",
    label: "Herb Roasted Chicken with Snow Basmati Rice mixed with Nigerian Sauce",
  },
  {
    id: "continental-grilled-beef-fillet-herb-roasted-veg-jollof",
    label: "Grilled Beef Fillet served with Herb Roasted Vegetables and Jollof Rice",
  },
];

// DESSERT (applies to both)
const dessertOptions: MenuOption[] = [
  { id: "dessert-ice-cream", label: "Ice Cream" },
  { id: "dessert-cup-cakes", label: "Cup Cakes" },
  { id: "dessert-parfait", label: "Parfait" },
];

// SNACKS/OTHERS (applies to both) — stored as `afters`
const snacksOptions: MenuOption[] = [
  { id: "snacks-small-chops", label: "Small Chops" },
  {
    id: "snacks-potato-plantain-fries-chicken-perri",
    label: "Potato & Plantain Fries with Chicken and Perri Sauce (very Perri / mild)",
  },
];

const steps = [
  { id: 1, label: "Starter & Salad" },
  { id: 2, label: "Main Course" },
  { id: 3, label: "Dessert & Snacks" },
  { id: 4, label: "Review & Confirm" },
];

type MainCategory = "local" | "continental";

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

export default function MenuSelectionPage() {
  const router = useRouter();
  const { user } = useAuth() as { user: User | null };

  const [starter, setStarter] = useState("");
  const [salad, setSalad] = useState("");

  const [selectedCategory, setSelectedCategory] = useState<MainCategory>("local");
  const [localMain, setLocalMain] = useState("");
  const [continentalMain, setContinentalMain] = useState("");
  const [mainCourse, setMainCourse] = useState("");

  const [dessert, setDessert] = useState("");
  const [snacks, setSnacks] = useState(""); // stored as afters

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(1);

  useEffect(() => {
    if (!user) router.replace("/menu/mbtc17");
  }, [user, router]);

  const setDefaultsIfEmpty = () => {
    setStarter("");
    setSalad("");
    setSelectedCategory("local");
    setLocalMain("");
    setContinentalMain("");
    setMainCourse("");
    setDessert("");
    setSnacks("");
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) {
        setDefaultsIfEmpty();
        setLoadingProfile(false);
        return;
      }

      try {
        const res = await fetch(`https://pcdl.co/api/nmt/rsvp?id=${encodeURIComponent(user.id)}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": "sfWryh0mscQzn0TcFvdz4smp8abRSZLlMo1qpK7UQNoWAw30A9yNbRjL0RMUS741",
          },
        });

        if (!res.ok) {
          setDefaultsIfEmpty();
          setLoadingProfile(false);
          return;
        }

        const json = await res.json();
        const profile = json.data || json.user || json;
        const menu: MenuPayload | undefined | null = profile?.menu;

        if (!menu) {
          setDefaultsIfEmpty();
          setLoadingProfile(false);
          return;
        }

        setStarter(menu.starter || "");
        setSalad(menu.salad || "");
        setMainCourse(menu.mainCourse || "");
        setDessert(menu.dessert || "");
        setSnacks(menu.afters || "");

        const mc = menu.mainCourse || "";
        if (localMainOptions.some((o) => o.id === mc)) {
          setSelectedCategory("local");
          setLocalMain(mc);
        } else if (continentalMainOptions.some((o) => o.id === mc)) {
          setSelectedCategory("continental");
          setContinentalMain(mc);
        } else {
          setSelectedCategory("local");
          setLocalMain("");
          setContinentalMain("");
          setMainCourse("");
        }
      } catch {
        setDefaultsIfEmpty();
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const fieldClass =
    "w-full mt-2 rounded-xl border border-amber-300/45 bg-white/70 px-4 py-3 text-sm text-neutral-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400";

  const isDisabled = submitting || success || loadingProfile;

  const totalSteps = steps.length;
  const progressPercent = ((currentStep - 1) / (totalSteps - 1 || 1)) * 100;

  const optionLabel = (id: string | null | undefined, options: MenuOption[]) =>
    id ? options.find((o) => o.id === id)?.label || "" : "";

  const validateStep1 = () => {
    if (!starter) {
      alert("Please select your Starter.");
      return false;
    }
    if (!salad) {
      alert("Please select your Salad.");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!mainCourse) {
      alert("Please select a Main Course.");
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!dessert) {
      alert("Please select a Dessert.");
      return false;
    }
    if (!snacks) {
      alert("Please select a Snacks/Others option.");
      return false;
    }
    return true;
  };

  const validateAll = () => {
    if (!validateStep1()) {
      setCurrentStep(1);
      return false;
    }
    if (!validateStep2()) {
      setCurrentStep(2);
      return false;
    }
    if (!validateStep3()) {
      setCurrentStep(3);
      return false;
    }
    return true;
  };

  const goNext = () => {
    if (isDisabled) return;
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep === 3 && !validateStep3()) return;
    setCurrentStep((p) => (p < totalSteps ? p + 1 : p));
  };

  const goPrev = () => setCurrentStep((p) => (p > 1 ? p - 1 : p));

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user?.id) return;

    if (!validateAll()) return;

    setSubmitting(true);
    try {
      const res = await fetch("https://pcdl.co/api/nmt/rsvp/menu", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "sfWryh0mscQzn0TcFvdz4smp8abRSZLlMo1qpK7UQNoWAw30A9yNbRjL0RMUS741",
        },
        body: JSON.stringify({
          id: user.id,
          starter: starter || null,
          salad: salad || null,
          mainCourse: mainCourse || null,
          dessert: dessert || null,
          afters: snacks || null, // SNACKS/OTHERS
          // keep legacy keys null to avoid breaking backend expectations
          localSoup: null,
          swallow: null,
          riceType: null,
          protein: null,
          appetizers: null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || data?.message || `Failed to save (status ${res.status})`);
      }

      setSuccess(true);
    } catch (err: any) {
      alert(err?.message || "Sorry, something went wrong while saving your menu. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden px-4 py-10">
      {/* Deep green + gold vibe (matches banner) */}
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(1200px_800px_at_20%_10%,rgba(20,83,45,0.75),transparent_60%),radial-gradient(1000px_700px_at_85%_25%,rgba(6,95,70,0.55),transparent_58%),radial-gradient(900px_650px_at_40%_90%,rgba(22,78,99,0.35),transparent_55%),linear-gradient(135deg,#052e23_0%,#064e3b_45%,#052e23_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(800px_500px_at_50%_30%,rgba(250,204,21,0.08),transparent_60%)]" />

      <div className="relative z-10 mx-auto w-full max-w-3xl">
        <div className="relative overflow-hidden rounded-[28px] border border-amber-200/35 bg-[#fbf3d6] shadow-[0_30px_120px_rgba(0,0,0,0.35)]">
          <CornerOrnament className="left-2 top-2" />
          <CornerOrnament className="right-2 top-2" flipX />
          <CornerOrnament className="left-2 bottom-2" flipY />
          <CornerOrnament className="right-2 bottom-2" flipX flipY />

          <div className="relative m-2 sm:m-3 rounded-[24px] border border-amber-300/40 bg-[linear-gradient(180deg,rgba(255,255,255,0.55),rgba(255,255,255,0.15))] backdrop-blur-[2px]">
            {/* Header */}
            <div className="px-6 sm:px-10 pt-10 pb-6 text-center">
              <p className={`${greatVibes.className} text-3xl sm:text-4xl text-amber-800/90`}>Menu Selection</p>
              <h1 className={`${cormorant.className} mt-2 text-3xl sm:text-5xl font-semibold tracking-wide text-neutral-900`}>
                MBTC 17 BANQUET
              </h1>
              <OrnateDivider />
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className={`${poppins.className} text-sm text-neutral-700`}>
                  Complete the steps below to confirm your choices.
                </p>
                <button
                  type="button"
                  onClick={() => router.replace("/menu/mbtc17")}
                  className={`${poppins.className} inline-flex items-center justify-center rounded-full border border-amber-300 bg-white/70 px-4 py-2 text-xs font-semibold text-neutral-900 hover:bg-white transition`}
                >
                  ← Back
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 sm:px-10 pb-10">
              {/* Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <p className={`${poppins.className} text-[11px] sm:text-xs font-semibold tracking-[0.18em] uppercase text-amber-900`}>
                    Step {currentStep} of {totalSteps}
                  </p>
                  <p className={`${poppins.className} text-[11px] sm:text-xs text-neutral-700`}>{steps[currentStep - 1]?.label}</p>
                </div>
                <div className="h-2 w-full rounded-full bg-amber-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {success && (
                <div className="mb-6 rounded-2xl border border-emerald-400/60 bg-emerald-50/80 p-4">
                  <p className={`${poppins.className} text-sm font-semibold text-emerald-800`}>
                    🎉 Your menu selections have been saved successfully!
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Step 1 */}
                {currentStep === 1 && (
                  <div className="rounded-2xl border border-amber-300/35 bg-white/60 p-5 sm:p-6 shadow-[0_18px_60px_rgba(0,0,0,0.14)]">
                    <h2 className={`${cormorant.className} text-xl sm:text-2xl font-semibold text-neutral-900`}>Starter & Salad</h2>
                    <OrnateDivider />

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label className={`${poppins.className} text-sm font-medium text-neutral-800`}>Starter</label>
                        <select className={fieldClass} value={starter} onChange={(e) => setStarter(e.target.value)} disabled={isDisabled}>
                          <option value="">Select starter</option>
                          {starterOptions.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className={`${poppins.className} text-sm font-medium text-neutral-800`}>Salad</label>
                        <select className={fieldClass} value={salad} onChange={(e) => setSalad(e.target.value)} disabled={isDisabled}>
                          <option value="">Select salad</option>
                          {saladOptions.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2 */}
                {currentStep === 2 && (
                  <div className="rounded-2xl border border-amber-300/35 bg-white/60 p-5 sm:p-6 shadow-[0_18px_60px_rgba(0,0,0,0.14)]">
                    <h2 className={`${cormorant.className} text-xl sm:text-2xl font-semibold text-neutral-900`}>Main Course</h2>
                    <OrnateDivider />

                    <div className="flex overflow-hidden rounded-full border border-amber-200 bg-amber-50/70 text-[11px] sm:text-xs">
                      {[
                        { id: "local", label: "LOCAL" },
                        { id: "continental", label: "CONTINENTAL" },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setSelectedCategory(tab.id as MainCategory)}
                          className={`${poppins.className} flex-1 px-3 py-2 font-semibold tracking-[0.18em] uppercase transition ${
                            selectedCategory === tab.id ? "bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-900" : "text-amber-800"
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {selectedCategory === "local" && (
                      <div className="mt-4">
                        <label className={`${poppins.className} text-sm font-medium text-neutral-800`}>
                          Local Main Course <span className="text-red-600">*</span>
                        </label>
                        <select
                          className={fieldClass}
                          value={localMain}
                          onChange={(e) => {
                            const v = e.target.value;
                            setLocalMain(v);
                            setMainCourse(v);
                          }}
                          disabled={isDisabled}
                        >
                          <option value="">Select local main course</option>
                          {localMainOptions.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {selectedCategory === "continental" && (
                      <div className="mt-4">
                        <label className={`${poppins.className} text-sm font-medium text-neutral-800`}>
                          Continental Main Course <span className="text-red-600">*</span>
                        </label>
                        <select
                          className={fieldClass}
                          value={continentalMain}
                          onChange={(e) => {
                            const v = e.target.value;
                            setContinentalMain(v);
                            setMainCourse(v);
                          }}
                          disabled={isDisabled}
                        >
                          <option value="">Select continental main course</option>
                          {continentalMainOptions.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3 */}
                {currentStep === 3 && (
                  <div className="rounded-2xl border border-amber-300/35 bg-white/60 p-5 sm:p-6 shadow-[0_18px_60px_rgba(0,0,0,0.14)]">
                    <h2 className={`${cormorant.className} text-xl sm:text-2xl font-semibold text-neutral-900`}>Dessert & Snacks</h2>
                    <OrnateDivider />

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label className={`${poppins.className} text-sm font-medium text-neutral-800`}>Dessert</label>
                        <select className={fieldClass} value={dessert} onChange={(e) => setDessert(e.target.value)} disabled={isDisabled}>
                          <option value="">Select dessert</option>
                          {dessertOptions.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className={`${poppins.className} text-sm font-medium text-neutral-800`}>Snacks / Others</label>
                        <select className={fieldClass} value={snacks} onChange={(e) => setSnacks(e.target.value)} disabled={isDisabled}>
                          <option value="">Select snacks/others</option>
                          {snacksOptions.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4 */}
                {currentStep === 4 && (
                  <div className="rounded-2xl border border-amber-300/35 bg-white/60 p-5 sm:p-6 shadow-[0_18px_60px_rgba(0,0,0,0.14)]">
                    <h2 className={`${cormorant.className} text-xl sm:text-2xl font-semibold text-neutral-900`}>Review & Confirm</h2>
                    <OrnateDivider />

                    <div className="space-y-3">
                      <div className="rounded-xl border border-amber-200/50 bg-amber-50/60 p-4">
                        <dl className={`${poppins.className} text-sm space-y-3`}>
                          <div className="grid grid-cols-[120px,1fr] gap-3">
                            <dt className="font-semibold text-amber-900">Starter</dt>
                            <dd className="text-neutral-900">{optionLabel(starter, starterOptions) || "—"}</dd>
                          </div>
                          <div className="grid grid-cols-[120px,1fr] gap-3">
                            <dt className="font-semibold text-amber-900">Salad</dt>
                            <dd className="text-neutral-900">{optionLabel(salad, saladOptions) || "—"}</dd>
                          </div>
                          <div className="grid grid-cols-[120px,1fr] gap-3">
                            <dt className="font-semibold text-amber-900">Main Course</dt>
                            <dd className="text-neutral-900">
                              {optionLabel(mainCourse, [...localMainOptions, ...continentalMainOptions]) || "—"}
                            </dd>
                          </div>
                          <div className="grid grid-cols-[120px,1fr] gap-3">
                            <dt className="font-semibold text-amber-900">Dessert</dt>
                            <dd className="text-neutral-900">{optionLabel(dessert, dessertOptions) || "—"}</dd>
                          </div>
                          <div className="grid grid-cols-[120px,1fr] gap-3">
                            <dt className="font-semibold text-amber-900">Snacks</dt>
                            <dd className="text-neutral-900">{optionLabel(snacks, snacksOptions) || "—"}</dd>
                          </div>
                        </dl>
                      </div>

                      {loadingProfile && !success && (
                        <p className={`${poppins.className} text-[11px] text-neutral-700`}>Loading your previous selections…</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Footer controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-amber-200/50 pt-4">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={goPrev}
                      disabled={currentStep === 1 || isDisabled}
                      className={`${poppins.className} inline-flex items-center justify-center rounded-full border border-amber-300 bg-white/70 px-5 py-2 text-sm font-semibold text-neutral-900 hover:bg-white transition disabled:opacity-60 disabled:cursor-not-allowed`}
                    >
                      ← Previous
                    </button>

                    {currentStep < totalSteps && (
                      <button
                        type="button"
                        onClick={goNext}
                        disabled={isDisabled}
                        className={`${poppins.className} inline-flex items-center justify-center rounded-full bg-amber-700 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-600 transition shadow-[0_14px_40px_rgba(180,83,9,0.28)] disabled:opacity-60 disabled:cursor-not-allowed`}
                      >
                        Next →
                      </button>
                    )}
                  </div>

                  {currentStep === totalSteps && (
                    <button
                      type="submit"
                      disabled={isDisabled}
                      className={`${poppins.className} inline-flex items-center justify-center rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 transition disabled:opacity-60 disabled:cursor-not-allowed`}
                    >
                      {submitting ? "Saving…" : loadingProfile ? "Loading…" : "Confirm & Save"}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 h-28 w-[85%] rounded-[999px] bg-amber-400/10 blur-3xl -z-10" />
      </div>
    </main>
  );
}
