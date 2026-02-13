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
type MenuType = "local" | "continental" | "";

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
  afters: string | null;
  type?: "local" | "continental" | null;

  appetizers?: string[] | string | null;
  localSoup?: string | null;
  swallow?: string | null;
  riceType?: string | null;
  protein?: string | null;
};

// -----------------------------
// CONTINENTAL (matches image)
// -----------------------------
const continentalSoupOptions: MenuOption[] = [
  { id: "continental-soup-cream-of-tomato-croton", label: "Cream of Tomato Soup with Croton" },
];

const continentalAppetizerOptions: MenuOption[] = [
  { id: "continental-app-avocado-crab-marirose", label: "Avocado Crab meat with Marirose sauce" },
];

const continentalMainOptions: MenuOption[] = [
  {
    id: "continental-main-herb-roasted-chicken-snow-basmati-nigerian-sauce",
    label: "Herb roasted Chicken with Snow basmati rice mixed with Nigerian Sauce",
  },
  {
    id: "continental-main-grilled-beef-fillet-herb-roasted-vegetable-jollof-rice",
    label: "Grilled Beef Fillet served with Herb Roasted Vegetable and Jollof rice",
  },
];

const continentalDessertOptions: MenuOption[] = [
  {
    id: "continental-dessert-marshmellow-pudding-strawberry-sauce-fruit-salad",
    label: "Marshmellow Pudding with Strawberry sauce Fruit Salad",
  },
];

// -----------------------------
// LOCAL (matches image)
// -----------------------------
const localStarterOptions: MenuOption[] = [
  { id: "local-starter-goat-meat-pepper-soup-bread-rolls", label: "Goat meat Pepper Soup with Bread Rolls" },
];

const localSaladOptions: MenuOption[] = [{ id: "local-salad-chicken-salad", label: "Chicken Salad" }];

const localMainOptions: MenuOption[] = [
  { id: "local-main-egunsi-efo-riro-mixed-okro-semo-poundo", label: "Egunsi/Efo Riro/Mixed Okro Soup with Semo/Poundo" },
  { id: "local-main-amala-ewedu-gbegiri", label: "Amala, Ewedu, Gbegiri" },
  { id: "local-main-ofada-rice-ofada-sauce-plantain", label: "Ofada Rice/Ofada Sauce/Plantain" },
  { id: "local-main-jollof-rice-chicken-fish-moinmoin", label: "Jollof Rice/Chicken/Fish/Moinmoin" },
  { id: "local-main-fried-rice-chicken-fish-coleslaw", label: "Fried Rice/Chicken/Fish/Coleslaw" },
];

const localDessertOptions: MenuOption[] = [
  { id: "local-dessert-ice-cream", label: "Ice Cream" },
  { id: "local-dessert-cupcakes", label: "Cupcakes" },
  { id: "local-dessert-parfait", label: "Parfait" },
];

const localSnacksOptions: MenuOption[] = [{ id: "local-snacks-small-chops", label: "Small Chops" }];

function CornerOrnament({ className = "", flipX = false, flipY = false }: { className?: string; flipX?: boolean; flipY?: boolean }) {
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

        <path d="M18 206c62-26 86-77 106-121 20-44 44-73 98-77" stroke="url(#g)" strokeWidth="3.4" strokeLinecap="round" />
        <path d="M28 220c58-20 82-67 103-112 21-45 49-84 104-90" stroke="url(#g)" strokeWidth="2.4" strokeLinecap="round" opacity="0.85" />
        <path d="M26 190c48-14 77-44 97-86 20-42 41-70 100-76" stroke="url(#g)" strokeWidth="2" strokeLinecap="round" opacity="0.65" />

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

  const [menuType, setMenuType] = useState<MenuType>("");
  const [initialSavedType, setInitialSavedType] = useState<MenuType>(""); // ✅ remember what they previously had

  // selections
  const [starter, setStarter] = useState("");
  const [salad, setSalad] = useState("");
  const [mainCourse, setMainCourse] = useState("");
  const [dessert, setDessert] = useState("");
  const [snacks, setSnacks] = useState("");

  // counts + limit
  const [countsLoading, setCountsLoading] = useState(true);
  const [continentalCount, setContinentalCount] = useState<number>(0);
  const [localCount, setLocalCount] = useState<number>(0);
  const [continentalLimit, setContinentalLimit] = useState<number>(100);

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(1);

  useEffect(() => {
    if (!user) router.replace("/menu/mbtc17");
  }, [user, router]);

  const isDisabled = submitting || success || loadingProfile;

  const steps = useMemo(
    () => [
      { id: 1, label: "Choose Menu Type" },
      { id: 2, label: menuType === "continental" ? "Soup & Appetizers" : "Starter & Salad" },
      { id: 3, label: "Main" },
      { id: 4, label: menuType === "continental" ? "Dessert" : "Dessert & Snacks" },
      { id: 5, label: "Review & Confirm" },
    ],
    [menuType]
  );

  const totalSteps = steps.length;
  const progressPercent = ((currentStep - 1) / (totalSteps - 1 || 1)) * 100;

  const fieldClass =
    "w-full mt-2 rounded-xl border border-amber-300/45 bg-white/70 px-4 py-3 text-sm text-neutral-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400";

  const optionLabel = (id: string | null | undefined, options: MenuOption[]) =>
    id ? options.find((o) => o.id === id)?.label || "" : "";

  const setDefaultsIfEmpty = () => {
    setMenuType("");
    setInitialSavedType("");
    setStarter("");
    setSalad("");
    setMainCourse("");
    setDessert("");
    setSnacks("");
  };

  // ✅ Fetch counts (limit info)
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setCountsLoading(true);
        const res = await fetch("https://pcdl.co/api/nmt/rsvp/menu/counts", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": "sfWryh0mscQzn0TcFvdz4smp8abRSZLlMo1qpK7UQNoWAw30A9yNbRjL0RMUS741",
          },
        });
        if (!res.ok) throw new Error("Failed to load menu counts");
        const json = await res.json();
        const data = json?.data || {};
        setContinentalCount(Number(data.continentalCount || 0));
        setLocalCount(Number(data.localCount || 0));
        setContinentalLimit(Number(data.continentalLimit || 100));
      } catch {
        // keep defaults; don’t hard-block UI
      } finally {
        setCountsLoading(false);
      }
    };

    fetchCounts();
  }, []);

  // Load saved selections + infer/read type
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

        const savedMain = menu.mainCourse || "";
        const savedStarter = menu.starter || "";
        const savedSalad = menu.salad || "";
        const savedDessert = menu.dessert || "";
        const savedAfters = menu.afters || "";

        const savedType = (menu as any)?.type as MenuType | undefined;

        const isContinental =
          continentalMainOptions.some((o) => o.id === savedMain) ||
          continentalSoupOptions.some((o) => o.id === savedStarter) ||
          continentalAppetizerOptions.some((o) => o.id === savedSalad) ||
          continentalDessertOptions.some((o) => o.id === savedDessert) ||
          (typeof savedMain === "string" && savedMain.startsWith("continental-"));

        const inferredType: MenuType =
          savedType === "local" || savedType === "continental" ? savedType : isContinental ? "continental" : "local";

        setMenuType(inferredType);
        setInitialSavedType(inferredType); // ✅ remember what they had

        setStarter(savedStarter);
        setSalad(savedSalad);
        setMainCourse(savedMain);
        setDessert(savedDessert);
        setSnacks(inferredType === "local" ? savedAfters : "");
      } catch {
        setDefaultsIfEmpty();
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const continentalRemaining = Math.max(0, continentalLimit - continentalCount);
  const continentalIsFull = continentalCount >= continentalLimit;

  // ✅ Block new continental selection if full (but allow existing continental users)
  const canChooseContinental = !continentalIsFull || initialSavedType === "continental";

  const resetSelectionsForMenuType = (nextType: MenuType) => {
    setMenuType(nextType);
    setStarter("");
    setSalad("");
    setMainCourse("");
    setDessert("");
    setSnacks("");
  };

  // ---------- Validation ----------
  const validateStep1 = () => {
    if (!menuType) {
      alert("Please choose LOCAL or CONTINENTAL to begin.");
      return false;
    }
    if (menuType === "continental" && !canChooseContinental) {
      alert(`Continental is fully booked (limit ${continentalLimit}). Please choose Local.`);
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!menuType) return false;

    if (menuType === "continental") {
      if (!starter) return alert("Please select your Soup (Continental)."), false;
      if (!salad) return alert("Please select your Appetizer (Continental)."), false;
      return true;
    }

    if (!starter) return alert("Please select your Starter (Local)."), false;
    if (!salad) return alert("Please select your Salad (Local)."), false;
    return true;
  };

  const validateStep3 = () => {
    if (!mainCourse) return alert("Please select your Main."), false;
    return true;
  };

  const validateStep4 = () => {
    if (!dessert) return alert("Please select your Dessert."), false;
    if (menuType === "local" && !snacks) return alert("Please select your Snacks (Local)."), false;
    return true;
  };

  const validateAll = () => {
    if (!validateStep1()) return setCurrentStep(1), false;
    if (!validateStep2()) return setCurrentStep(2), false;
    if (!validateStep3()) return setCurrentStep(3), false;
    if (!validateStep4()) return setCurrentStep(4), false;
    return true;
  };

  const goNext = () => {
    if (isDisabled) return;
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep === 3 && !validateStep3()) return;
    if (currentStep === 4 && !validateStep4()) return;
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
          type: menuType || null, // ✅ pass to API

          starter: starter || null,
          salad: salad || null,
          mainCourse: mainCourse || null,
          dessert: dessert || null,
          afters: menuType === "local" ? snacks || null : null,

          localSoup: null,
          swallow: null,
          riceType: null,
          protein: null,
          appetizers: null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);

        // ✅ nice handling for full continental
        if (res.status === 409 && data?.code === "CONTINENTAL_LIMIT_REACHED") {
          alert(data?.error || `Continental menu is fully booked (limit ${continentalLimit}). Please choose Local.`);
          // refresh counts so UI updates
          try {
            const cRes = await fetch("https://pcdl.co/api/nmt/rsvp/menu/counts", {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                "x-api-key": "sfWryh0mscQzn0TcFvdz4smp8abRSZLlMo1qpK7UQNoWAw30A9yNbRjL0RMUS741",
              },
            });
            const cJson = await cRes.json().catch(() => null);
            const cData = cJson?.data || {};
            setContinentalCount(Number(cData.continentalCount || continentalCount));
            setLocalCount(Number(cData.localCount || localCount));
            setContinentalLimit(Number(cData.continentalLimit || continentalLimit));
          } catch {}
          // kick them back to step 1
          setCurrentStep(1);
          setMenuType("");
          return;
        }

        throw new Error(data?.error || data?.message || `Failed to save (status ${res.status})`);
      }

      setSuccess(true);
    } catch (err: any) {
      alert(err?.message || "Sorry, something went wrong while saving your menu. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const starterPool = menuType === "continental" ? continentalSoupOptions : localStarterOptions;
  const saladPool = menuType === "continental" ? continentalAppetizerOptions : localSaladOptions;
  const mainPool = menuType === "continental" ? continentalMainOptions : localMainOptions;
  const dessertPool = menuType === "continental" ? continentalDessertOptions : localDessertOptions;

  return (
    <main className="relative min-h-screen w-full overflow-hidden px-4 py-10">
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
                  Choose <span className="font-semibold">LOCAL</span> or <span className="font-semibold">CONTINENTAL</span> first (cannot be mixed).
                </p>
                <button
                  type="button"
                  onClick={() => router.replace("/menu/mbtc17")}
                  className={`${poppins.className} inline-flex items-center justify-center rounded-full border border-amber-300 bg-white/70 px-4 py-2 text-xs font-semibold text-neutral-900 hover:bg-white transition`}
                >
                  ← Back
                </button>
              </div>

              {/* ✅ Capacity line */}
              <div className="mt-4 text-center">
                <p className={`${poppins.className} text-[12px] text-neutral-700`}>
                  {countsLoading ? (
                    "Loading capacity…"
                  ) : (
                    <>
                      Continental spots remaining:{" "}
                      <span className="font-semibold">
                        {continentalRemaining}/{continentalLimit}
                      </span>
                      {continentalIsFull && (
                        <span className="ml-2 font-semibold text-red-700">• FULL</span>
                      )}
                    </>
                  )}
                </p>
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
                    <h2 className={`${cormorant.className} text-xl sm:text-2xl font-semibold text-neutral-900`}>Choose Menu Type</h2>
                    <OrnateDivider />

                    <div className="grid gap-4 sm:grid-cols-2">
                      <button
                        type="button"
                        disabled={isDisabled || !canChooseContinental}
                        onClick={() => {
                          if (!canChooseContinental) {
                            alert(`Continental is fully booked (limit ${continentalLimit}). Please choose Local.`);
                            return;
                          }
                          resetSelectionsForMenuType("continental");
                          setCurrentStep(2);
                        }}
                        className={`${poppins.className} rounded-2xl border px-5 py-5 text-left transition shadow-sm ${
                          menuType === "continental"
                            ? "border-amber-500 bg-amber-50/80"
                            : "border-amber-200 bg-white/70 hover:bg-white"
                        } ${!canChooseContinental ? "opacity-60 cursor-not-allowed" : ""}`}
                      >
                        <p className="text-xs font-semibold tracking-[0.18em] uppercase text-amber-900">CONTINENTAL</p>
                        <p className="mt-3 text-[12px] text-neutral-600">
                          {canChooseContinental
                            ? ""
                            : "Fully booked — please choose Local."}
                        </p>
                      </button>

                      <button
                        type="button"
                        disabled={isDisabled}
                        onClick={() => {
                          resetSelectionsForMenuType("local");
                          setCurrentStep(2);
                        }}
                        className={`${poppins.className} rounded-2xl border px-5 py-5 text-left transition shadow-sm ${
                          menuType === "local" ? "border-amber-500 bg-amber-50/80" : "border-amber-200 bg-white/70 hover:bg-white"
                        }`}
                      >
                        <p className="text-xs font-semibold tracking-[0.18em] uppercase text-amber-900">LOCAL</p>
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2 */}
                {currentStep === 2 && (
                  <div className="rounded-2xl border border-amber-300/35 bg-white/60 p-5 sm:p-6 shadow-[0_18px_60px_rgba(0,0,0,0.14)]">
                    <h2 className={`${cormorant.className} text-xl sm:text-2xl font-semibold text-neutral-900`}>
                      {menuType === "continental" ? "Soup & Appetizers (Continental)" : "Starter & Salad (Local)"}
                    </h2>
                    <OrnateDivider />

                    {!menuType ? (
                      <p className={`${poppins.className} text-sm text-neutral-700`}>Please go back and choose a menu type.</p>
                    ) : (
                      <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                          <label className={`${poppins.className} text-sm font-medium text-neutral-800`}>
                            {menuType === "continental" ? "Soup" : "Starter"} <span className="text-red-600">*</span>
                          </label>
                          <select className={fieldClass} value={starter} onChange={(e) => setStarter(e.target.value)} disabled={isDisabled}>
                            <option value="">{menuType === "continental" ? "Select soup" : "Select starter"}</option>
                            {(menuType === "continental" ? continentalSoupOptions : localStarterOptions).map((opt) => (
                              <option key={opt.id} value={opt.id}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className={`${poppins.className} text-sm font-medium text-neutral-800`}>
                            {menuType === "continental" ? "Appetizers" : "Salad"} <span className="text-red-600">*</span>
                          </label>
                          <select className={fieldClass} value={salad} onChange={(e) => setSalad(e.target.value)} disabled={isDisabled}>
                            <option value="">{menuType === "continental" ? "Select appetizers" : "Select salad"}</option>
                            {(menuType === "continental" ? continentalAppetizerOptions : localSaladOptions).map((opt) => (
                              <option key={opt.id} value={opt.id}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3 */}
                {currentStep === 3 && (
                  <div className="rounded-2xl border border-amber-300/35 bg-white/60 p-5 sm:p-6 shadow-[0_18px_60px_rgba(0,0,0,0.14)]">
                    <h2 className={`${cormorant.className} text-xl sm:text-2xl font-semibold text-neutral-900`}>Main</h2>
                    <OrnateDivider />

                    {!menuType ? (
                      <p className={`${poppins.className} text-sm text-neutral-700`}>Please go back and choose a menu type.</p>
                    ) : (
                      <div>
                        <label className={`${poppins.className} text-sm font-medium text-neutral-800`}>
                          {menuType === "continental" ? "Continental Main" : "Local Main"} <span className="text-red-600">*</span>
                        </label>
                        <select className={fieldClass} value={mainCourse} onChange={(e) => setMainCourse(e.target.value)} disabled={isDisabled}>
                          <option value="">{menuType === "continental" ? "Select continental main" : "Select local main"}</option>
                          {(menuType === "continental" ? continentalMainOptions : localMainOptions).map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 4 */}
                {currentStep === 4 && (
                  <div className="rounded-2xl border border-amber-300/35 bg-white/60 p-5 sm:p-6 shadow-[0_18px_60px_rgba(0,0,0,0.14)]">
                    <h2 className={`${cormorant.className} text-xl sm:text-2xl font-semibold text-neutral-900`}>
                      {menuType === "continental" ? "Dessert (Continental)" : "Dessert & Snacks (Local)"}
                    </h2>
                    <OrnateDivider />

                    {!menuType ? (
                      <p className={`${poppins.className} text-sm text-neutral-700`}>Please go back and choose a menu type.</p>
                    ) : (
                      <div className={`grid gap-5 ${menuType === "local" ? "sm:grid-cols-2" : ""}`}>
                        <div>
                          <label className={`${poppins.className} text-sm font-medium text-neutral-800`}>
                            Dessert <span className="text-red-600">*</span>
                          </label>
                          <select className={fieldClass} value={dessert} onChange={(e) => setDessert(e.target.value)} disabled={isDisabled}>
                            <option value="">Select dessert</option>
                            {(menuType === "continental" ? continentalDessertOptions : localDessertOptions).map((opt) => (
                              <option key={opt.id} value={opt.id}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {menuType === "local" && (
                          <div>
                            <label className={`${poppins.className} text-sm font-medium text-neutral-800`}>
                              Snacks <span className="text-red-600">*</span>
                            </label>
                            <select className={fieldClass} value={snacks} onChange={(e) => setSnacks(e.target.value)} disabled={isDisabled}>
                              <option value="">Select snacks</option>
                              {localSnacksOptions.map((opt) => (
                                <option key={opt.id} value={opt.id}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Step 5 */}
                {currentStep === 5 && (
                  <div className="rounded-2xl border border-amber-300/35 bg-white/60 p-5 sm:p-6 shadow-[0_18px_60px_rgba(0,0,0,0.14)]">
                    <h2 className={`${cormorant.className} text-xl sm:text-2xl font-semibold text-neutral-900`}>Review & Confirm</h2>
                    <OrnateDivider />

                    <div className="rounded-xl border border-amber-200/50 bg-amber-50/60 p-4">
                      <dl className={`${poppins.className} text-sm space-y-3`}>
                        <div className="grid grid-cols-[140px,1fr] gap-3">
                          <dt className="font-semibold text-amber-900">Menu Type</dt>
                          <dd className="text-neutral-900">{menuType ? menuType.toUpperCase() : "—"}</dd>
                        </div>

                        <div className="grid grid-cols-[140px,1fr] gap-3">
                          <dt className="font-semibold text-amber-900">{menuType === "continental" ? "Soup" : "Starter"}</dt>
                          <dd className="text-neutral-900">{optionLabel(starter, starterPool) || "—"}</dd>
                        </div>

                        <div className="grid grid-cols-[140px,1fr] gap-3">
                          <dt className="font-semibold text-amber-900">{menuType === "continental" ? "Appetizers" : "Salad"}</dt>
                          <dd className="text-neutral-900">{optionLabel(salad, saladPool) || "—"}</dd>
                        </div>

                        <div className="grid grid-cols-[140px,1fr] gap-3">
                          <dt className="font-semibold text-amber-900">Main</dt>
                          <dd className="text-neutral-900">{optionLabel(mainCourse, mainPool) || "—"}</dd>
                        </div>

                        <div className="grid grid-cols-[140px,1fr] gap-3">
                          <dt className="font-semibold text-amber-900">Dessert</dt>
                          <dd className="text-neutral-900">{optionLabel(dessert, dessertPool) || "—"}</dd>
                        </div>

                        {menuType === "local" && (
                          <div className="grid grid-cols-[140px,1fr] gap-3">
                            <dt className="font-semibold text-amber-900">Snacks</dt>
                            <dd className="text-neutral-900">{optionLabel(snacks, localSnacksOptions) || "—"}</dd>
                          </div>
                        )}
                      </dl>
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
