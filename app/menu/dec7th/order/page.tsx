// app/thanksgivingservice/menu/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Great_Vibes,
  Cormorant_Garamond,
  Poppins,
} from "next/font/google";
import { useAuth } from "@/app/auth/components/AuthProvider";

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

type MenuOption = {
  id: string;
  label: string;
};

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
  localSoup?: string | null;
  swallow?: string | null;
  riceType?: string | null;
  protein?: string | null;
  appetizers?: string[] | string | null;
};

/**
 * FIRST COURSE | ARTISANAL SOUPS
 */
const starterOptions: MenuOption[] = [
  {
    id: "velvety-carrot-coconut-soup",
    label: "Velvety Roasted Carrot & Coconut Soup",
  },
  {
    id: "traditional-chicken-pepper-soup",
    label: "Traditional Chicken Pepper Soup",
  },
];

/**
 * SECOND COURSE | Appetizers
 * Single selection (dropdown).
 */
const appetizerOptions: MenuOption[] = [
  { id: "golden-puff-puffs", label: "Golden Puff-Puffs" },
  { id: "vegetable-spring-rolls", label: "Vegetable Spring Rolls" },
  { id: "beef-samosas", label: "Beef Samosas" },
  { id: "plantain-puffies-mosa", label: "Plantain Puffies (Mosa)" },
  {
    id: "chargrilled-bbq-chicken-wings",
    label: "Chargrilled Barbecued Chicken Wings",
  },
  { id: "peppered-gizzard", label: "Peppered Gizzard" },
  {
    id: "peppered-mini-beef-kebab",
    label: "Peppered Mini Beef Kebab",
  },
  { id: "peppered-snail", label: "Peppered Snail" },
];

/**
 * THIRD COURSE | SALAD MASTERPIECE
 */
const saladOptions: MenuOption[] = [
  {
    id: "summer-salad-medley",
    label: "Summer Salad Medley",
  },
];

/**
 * FOURTH COURSE | MAIN COURSE
 * Tabs: ORIENTAL, CONTINENTAL, LOCAL
 */

// Oriental – each line is an individual option
const orientalMainOptions: MenuOption[] = [
  {
    id: "oriental-singapore-noodles",
    label: "Singapore Vermicelli Noodles",
  },
  {
    id: "oriental-special-fried-rice",
    label: "Special Oriental Fried Rice",
  },
  {
    id: "oriental-chinese-rice",
    label: "Chinese Rice",
  },
  {
    id: "oriental-chicken-green-herb-sauce",
    label: "Chicken In Green Herbs Sauce with Seasonal Vegetables",
  },
  {
    id: "oriental-shredded-beef-oyster-sauce",
    label: "Shredded Beef with Green Peppers in Oyster Sauce",
  },
  {
    id: "oriental-king-prawn-chilli-sauce",
    label: "King Prawn in Chilli Sauce",
  },
];

// Continental
const continentalMainOptions: MenuOption[] = [
  {
    id: "continental-creamy-tuscan-chicken",
    label: "Creamy Tuscan Chicken with Mashed Potatoes & Rainbow Carrots",
  },
  {
    id: "continental-grilled-sweet-potato-aubergine",
    label:
      "Grilled Sweet Potato & Smoky Aubergines with Seasonal Vegetables",
  },
];

// Local IDs used in multiple places
const LOCAL_JOLLOF_ID = "local-smoky-jollof-or-fried-rice";
const LOCAL_OFADA_ID = "local-ofada-rice-designer-sauce";
const LOCAL_YAM_PORRIDGE_ID = "local-yam-sweet-potato-porridge";
const LOCAL_AMALA_ID = "local-amala-station";
const LOCAL_EFO_ID = "local-efo-riro";
const LOCAL_SEAFOOD_OKRO_ID = "local-seafood-okro";

// Local
const localMainOptions: MenuOption[] = [
  {
    id: LOCAL_JOLLOF_ID,
    label:
      "Smoky Jollof or Fried Rice with Stewed Chicken/Beef/Fresh Fish, Plantain & Moinmoin",
  },
  {
    id: LOCAL_OFADA_ID,
    label: "Ofada Rice with ‘Designer’ Sauce",
  },
  {
    id: LOCAL_YAM_PORRIDGE_ID,
    label:
      "Yam & Sweet Potato Porridge with Stewed Chicken/Beef/Fresh Fish",
  },
  {
    id: LOCAL_AMALA_ID,
    label:
      "Live Amala Station with Bean Purée and Jute Mallow Soup (Yam Flour)",
  },
  {
    id: LOCAL_EFO_ID,
    label:
      "Efo Riro Soup with Assorted Meats, Snails & Stockfish (Served with Pounded Yam or Plantain Meal)",
  },
  {
    id: LOCAL_SEAFOOD_OKRO_ID,
    label: "Seafood Okro Soup (Served with Pounded Yam or Plantain Meal)",
  },
];

/**
 * Extra choice options where the menu says “or”
 */
const riceTypeOptions: MenuOption[] = [
  { id: "smoky-jollof-rice", label: "Smoky Jollof Rice" },
  { id: "fried-rice", label: "Fried Rice" },
];

const proteinOptions: MenuOption[] = [
  { id: "chicken", label: "Chicken" },
  { id: "beef", label: "Beef" },
  { id: "fresh-fish", label: "Fresh Fish" },
];

const swallowOptions: MenuOption[] = [
  { id: "pounded-yam", label: "Pounded Yam" },
  { id: "plantain-meal", label: "Plantain Meal" },
];

/**
 * FIFTH COURSE | DESSERT SYMPHONY
 */
const dessertOptions: MenuOption[] = [
  {
    id: "vanilla-gelato-red-velvet-cake",
    label: "Madagascar Vanilla Gelato with Red Velvet Cake",
  },
  {
    id: "vanilla-gelato-chocolate-cake",
    label: "Madagascar Vanilla Gelato with Chocolate Cake",
  },
  {
    id: "salted-caramel-gelato-red-velvet-cake",
    label: "Salted Caramel Gelato with Red Velvet Cake",
  },
  {
    id: "salted-caramel-gelato-chocolate-cake",
    label: "Salted Caramel Gelato with Chocolate Cake",
  },
];

/**
 * SIXTH–EIGHTH COURSES | FRUIT, NIGHTCAP & MIDNIGHT TREAT
 */
const aftersOptions: MenuOption[] = [
  {
    id: "exotic-fruit-medley",
    label: "Exotic Fruit Medley (Tropical Fruit Fusion)",
  },
  {
    id: "roselle-tea-and-cookies",
    label: "Roselle Tea with Delicate Cookies",
  },
  {
    id: "luxe-midnight-snack-pack",
    label: "Luxe Midnight Treat – Gourmet Midnight Snack Pack",
  },
];

/**
 * Wizard steps
 * Step 1 now includes 1st course, 2nd course and 3rd course.
 */
const steps = [
  { id: 1, label: "Soups, Appetizer & Salad" },
  { id: 2, label: "Main Course" },
  { id: 3, label: "Dessert & Afters" },
  { id: 4, label: "Review & Confirm" },
];

type MainCategory = "oriental" | "continental" | "local";

export default function MenuSelectionPage() {
  const router = useRouter();
  const { user } = useAuth() as { user: User | null };

  // First / second / third course
  const [starter, setStarter] = useState<string>("");
  const [appetizer, setappetizer] = useState<string>("");
  const [salad, setSalad] = useState<string>("");

  // Main course – tabs + per-category selection + overall mainCourse id
  const [selectedCategory, setSelectedCategory] =
    useState<MainCategory>("oriental");
  const [orientalMain, setOrientalMain] = useState<string>("");
  const [continentalMain, setContinentalMain] = useState<string>("");
  const [localMain, setLocalMain] = useState<string>("");
  const [mainCourse, setMainCourse] = useState<string>("");

  // “or” choices for some local mains
  const [riceType, setRiceType] = useState<string>("");
  const [protein, setProtein] = useState<string>("");
  const [swallow, setSwallow] = useState<string>("");

  // Dessert + afters
  const [dessert, setDessert] = useState<string>("");
  const [afters, setAfters] = useState<string>("");

  // meta
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [currentStep, setCurrentStep] = useState<number>(1);

  const isJollofDish = mainCourse === LOCAL_JOLLOF_ID;
  const isPoundedSideDish =
    mainCourse === LOCAL_EFO_ID || mainCourse === LOCAL_SEAFOOD_OKRO_ID;

  // If user is not logged in, go back home
  useEffect(() => {
    if (!user) {
      router.replace("/menu/dec7th");
    }
  }, [user, router]);

  // Clear everything (no defaults) – used when no saved menu or on errors
  const setDefaultsIfEmpty = () => {
    setStarter("");
    setappetizer("");
    setSalad("");
    setDessert("");
    setAfters("");

    // Tab state can default to oriental (just which tab is visible)
    setSelectedCategory("oriental");
    setOrientalMain("");
    setContinentalMain("");
    setLocalMain("");
    setMainCourse("");

    setRiceType("");
    setProtein("");
    setSwallow("");
  };

  // Prefill profile (load saved menu if present, otherwise keep everything empty)
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.name) {
        setDefaultsIfEmpty();
        setLoadingProfile(false);
        return;
      }

      try {
        const res = await fetch(
          `https://pcdl.co/api/nmt/rsvp?id=${encodeURIComponent(
            user.id
          )}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "x-api-key":
                "sfWryh0mscQzn0TcFvdz4smp8abRSZLlMo1qpK7UQNoWAw30A9yNbRjL0RMUS741",
          },
        }
        );

        if (!res.ok) {
          console.warn("Failed to fetch thanksgiving profile:", res.status);
          setDefaultsIfEmpty();
          setLoadingProfile(false);
          return;
        }

        const json = await res.json();
        const profile = json.data || json.user || json;
        const menu: MenuPayload | undefined | null = profile?.menu;

        if (menu) {
          setStarter(menu.starter || "");
          setSalad(menu.salad || "");

          // handle hors d'oeuvres (string or string[])
          if (Array.isArray(menu.appetizers)) {
            setappetizer(menu.appetizers[0] || "");
          } else if (typeof menu.appetizers === "string") {
            setappetizer(menu.appetizers || "");
          }

          setMainCourse(menu.mainCourse || "");
          setDessert(menu.dessert || "");
          setAfters(menu.afters || "");
          setRiceType(menu.riceType || "");
          setProtein(menu.protein || "");
          setSwallow(menu.swallow || "");

          // Infer category + per-tab main from stored mainCourse id
          const mc = menu.mainCourse || "";
          if (orientalMainOptions.some((o) => o.id === mc)) {
            setSelectedCategory("oriental");
            setOrientalMain(mc);
          } else if (continentalMainOptions.some((o) => o.id === mc)) {
            setSelectedCategory("continental");
            setContinentalMain(mc);
          } else if (localMainOptions.some((o) => o.id === mc)) {
            setSelectedCategory("local");
            setLocalMain(mc);
          } else {
            // mainCourse saved but no longer matches any option – clear just the main-related fields
            setSelectedCategory("oriental");
            setOrientalMain("");
            setContinentalMain("");
            setLocalMain("");
            setMainCourse("");
            setRiceType("");
            setProtein("");
            setSwallow("");
          }
        } else {
          // No saved menu
          setDefaultsIfEmpty();
        }
      } catch (err) {
        console.error("Error fetching profile/menu:", err);
        setDefaultsIfEmpty();
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Countdown + redirect after success
  useEffect(() => {
    if (!success) return;

    setCountdown(5);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          router.push("/menu/dec7th");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [success, router]);

  const applyLocalSideDefaults = (value: string) => {
    // Do not auto-select anything; only clear when switching away
    if (value === LOCAL_JOLLOF_ID) {
      setRiceType((prev) => prev || "");
      setProtein((prev) => prev || "");
    } else {
      setRiceType("");
      setProtein("");
    }

    if (value === LOCAL_EFO_ID || value === LOCAL_SEAFOOD_OKRO_ID) {
      setSwallow((prev) => prev || "");
    } else {
      setSwallow("");
    }
  };

  // --- VALIDATION HELPERS (no defaults, just checks) ---

  const validateStep1 = () => {
    if (!starter) {
      alert("Please select a soup for your First Course.");
      return false;
    }
    if (!appetizer) {
      alert("Please select one appetizer for your Second Course.");
      return false;
    }
    if (!salad) {
      alert(
        "Please select your salad preference, or choose ‘I would prefer not to have salad’.",
      );
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!mainCourse) {
      alert("Please select a main course option.");
      return false;
    }

    if (isJollofDish && (!riceType || !protein)) {
      alert(
        "For the smoky jollof / fried rice option, please choose a rice base and a protein (Chicken, Beef or Fresh Fish).",
      );
      return false;
    }

    if (isPoundedSideDish && !swallow) {
      alert(
        "For this soup, please choose your accompaniment (Pounded Yam or Plantain Meal).",
      );
      return false;
    }

    return true;
  };

  const validateStep3 = () => {
    if (!dessert) {
      alert("Please select a dessert option for the Fifth Course.");
      return false;
    }
    if (!afters) {
      alert("Please select your preferred afters.");
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!user?.name) {
      router.replace("/menu/dec7th");
      return;
    }

    // Full wizard validation
    if (!validateAll()) return;

    setSubmitting(true);

    try {
      const res = await fetch("https://pcdl.co/api/nmt/rsvp/menu", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key":
            "sfWryh0mscQzn0TcFvdz4smp8abRSZLlMo1qpK7UQNoWAw30A9yNbRjL0RMUS741",
        },
        body: JSON.stringify({
          id: user.id,
          starter: starter || null,
          salad: salad || null,
          mainCourse: mainCourse || "",
          localSoup: null,
          swallow: isPoundedSideDish ? swallow || null : null,
          dessert: dessert || null,
          afters: afters || null,
          riceType: isJollofDish ? riceType || null : null,
          protein: isJollofDish ? protein || null : null,
          appetizers: appetizer ? [appetizer] : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const msg =
          data?.error ||
          data?.message ||
          `Failed to save menu selections (status ${res.status})`;
        throw new Error(msg);
      }

      setSuccess(true);
    } catch (err: any) {
      console.error("Error saving menu selections:", err);
      alert(
        err?.message ||
          "Sorry, something went wrong while saving your menu. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass =
    "w-full mt-2 rounded-xl border border-amber-300 bg-white/70 px-3 py-2 text-sm text-amber-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400";

  const isDisabled = submitting || success || loadingProfile;

  const totalSteps = steps.length;
  const progressPercent =
    ((currentStep - 1) / (totalSteps - 1 || 1)) * 100;

  const goNext = () => {
    if (isDisabled) return;

    // Gate each step with validation
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep === 3 && !validateStep3()) return;

    setCurrentStep((prev) => (prev < totalSteps ? prev + 1 : prev));
  };

  const goPrev = () => {
    setCurrentStep((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const optionLabel = (
    id: string | null | undefined,
    options: MenuOption[],
  ) => {
    if (!id) return "";
    return options.find((o) => o.id === id)?.label || "";
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-[#fdf7ec] via-[#fffaf4] to-[#f4e5c5] px-4 py-10 sm:px-6 lg:px-10">
      {/* soft background ornaments */}
      <div className="pointer-events-none absolute inset-0 opacity-70 mix-blend-soft-light bg-[radial-gradient(circle_at_top,_#fef3c7_0,_transparent_55%),radial-gradient(circle_at_bottom,_#fef9c3_0,_transparent_55%)]" />

      <div className="relative z-10 mx-auto max-w-4xl rounded-[2.5rem] border border-amber-200/80 bg-white/85 p-5 shadow-[0_30px_80px_rgba(146,95,32,0.35)] backdrop-blur-md sm:p-7 lg:p-9">
        {/* Header + back */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p
              className={`${greatVibes.className} text-3xl text-amber-700`}
            >
              Royal Thanksgiving Banquet
            </p>
            <h1
              className={`${cormorant.className} mt-1 text-xl sm:text-2xl font-semibold uppercase tracking-[0.18em] text-amber-900`}
            >
              Offer 7 Menu Selection
            </h1>
            <p
              className={`${poppins.className} mt-1 text-sm text-amber-900/80`}
            >
              Kindly walk through the steps to confirm your preferred
              options for the Banquet.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.replace("/menu/dec7th")}
            className={`${poppins.className} inline-flex items-center cursor-pointer gap-2 rounded-full border border-amber-300 bg-white/80 px-4 py-1.5 text-xs font-medium text-amber-800 shadow-sm transition hover:bg-amber-50`}
          >
            ← Home
          </button>
        </div>

        {/* Success banner */}
        {success && (
          <div className="mt-4 rounded-xl border border-emerald-400/70 bg-emerald-50/80 px-4 py-3 text-left">
            <p
              className={`${poppins.className} text-sm text-emerald-800 font-semibold`}
            >
              🎉 Your menu selections have been saved successfully!
            </p>
            <p className="text-xs text-emerald-800/80 mt-1">
              You will be redirected to the main page in{" "}
              <span className="font-semibold">{countdown}</span>{" "}
              second{countdown === 1 ? "" : "s"}.
            </p>
          </div>
        )}

        {/* Progress bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <p
              className={`${poppins.className} text-[11px] sm:text-xs font-medium tracking-[0.18em] uppercase text-amber-800`}
            >
              Step {currentStep} of {totalSteps}
            </p>
            <p
              className={`${poppins.className} text-[11px] text-amber-900/80`}
            >
              {steps[currentStep - 1]?.label}
            </p>
          </div>
          <div className="h-2 w-full rounded-full bg-amber-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="mt-3 flex justify-between text-sm text-amber-800/70">
            {steps.map((step) => (
              <div
                key={step.id}
                className="flex flex-col items-center flex-1"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border text-md font-semibold ${
                    currentStep >= step.id
                      ? "border-amber-500 bg-amber-400 text-white"
                      : "border-amber-200 bg-white text-amber-700"
                  }`}
                >
                  {step.id}
                </div>
                <span className="mt-1 hidden text-center leading-tight sm:block">
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Wizard body */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* Step 1 – soups, second course & salad */}
          {currentStep === 1 && (
            <section className="space-y-5">
              <p
                className={`${poppins.className} text-sm text-amber-900/85`}
              >
                Begin by confirming your preferred artisanal soup for
                the{" "}
                <span className="font-semibold">First Course</span>,{" "}
                your{" "}
                <span className="font-semibold">
                  Second Course
                </span>{" "}
                selection, and whether you would like the{" "}
                <span className="font-semibold">
                  Summer Salad Medley
                </span>{" "}
                for the{" "}
                <span className="font-semibold">
                  Third Course
                </span>
                .
              </p>

              <div className="grid gap-5 sm:grid-cols-2">
                {/* Starter */}
                <div>
                  <label
                    htmlFor="starter"
                    className={`${poppins.className} text-sm font-medium text-amber-900`}
                  >
                    First Course – Artisanal Soup
                  </label>
                  <select
                    id="starter"
                    className={fieldClass}
                    value={starter}
                    onChange={(e) => setStarter(e.target.value)}
                    disabled={isDisabled}
                  >
                    <option value="">Select a soup</option>
                    {starterOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Second course */}
                <div>
                  <label
                    htmlFor="appetizer"
                    className={`${poppins.className} text-sm font-medium text-amber-900`}
                  >
                    Second Course – Appetizers
                  </label>
                  <select
                    id="appetizer"
                    className={fieldClass}
                    value={appetizer}
                    onChange={(e) => setappetizer(e.target.value)}
                    disabled={isDisabled}
                  >
                    <option value="">
                      Select one Appetizer
                    </option>
                    {appetizerOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-[10px] text-amber-900/70">
                    Only one selection is available for this course.
                  </p>
                </div>
              </div>

              {/* Salad (third course) */}
              <div className="max-w-xs">
                <label
                  htmlFor="salad"
                  className={`${poppins.className} text-sm font-medium text-amber-900`}
                >
                  Third Course – Salad Masterpiece
                </label>
                <select
                  id="salad"
                  className={fieldClass}
                  value={salad}
                  onChange={(e) => setSalad(e.target.value)}
                  disabled={isDisabled}
                >
                  <option value="">
                    Choose salad preference
                  </option>
                  {saladOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                  <option value="no-salad">
                    I would prefer not to have salad
                  </option>
                </select>
              </div>
            </section>
          )}

          {/* Step 2 – main course (tabs) */}
          {currentStep === 2 && (
            <section className="space-y-5">
              <p
                className={`${poppins.className} text-sm text-amber-900/85`}
              >
                Next, choose your{" "}
                <span className="font-semibold">Fourth Course</span>{" "}
                from the Oriental, Continental and Nigerian Heritage
                offerings. Use the tabs below to browse each section.
                Where the menu offers an{" "}
                <span className="italic">“or”</span> (for example
                Pounded Yam or Plantain Meal), you can specify your
                choice.
              </p>

              {/* Tabs */}
              <div className="flex overflow-hidden rounded-full border border-amber-200 bg-amber-50/80 text-[11px] sm:text-xs">
                {(
                  [
                    { id: "oriental", label: "ORIENTAL" },
                    { id: "continental", label: "CONTINENTAL" },
                    { id: "local", label: "LOCAL" },
                  ] as { id: MainCategory; label: string }[]
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedCategory(tab.id)}
                    className={`${poppins.className} cursor-pointer flex-1 px-3 py-2 font-semibold tracking-[0.18em] uppercase transition ${
                      selectedCategory === tab.id
                        ? "bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-900 shadow-sm"
                        : "text-amber-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              {selectedCategory === "oriental" && (
                <div className="space-y-3">
                  <label
                    htmlFor="orientalMain"
                    className={`${poppins.className} text-sm font-medium text-amber-900`}
                  >
                    Oriental Selection{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="orientalMain"
                    className={fieldClass}
                    value={orientalMain}
                    onChange={(e) => {
                      const value = e.target.value;
                      setOrientalMain(value);
                      setMainCourse(value);
                    }}
                    disabled={isDisabled}
                  >
                    <option value="">
                      Select an oriental option
                    </option>
                    {orientalMainOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-amber-900/75">
                    You will be served your selected oriental main with
                    appropriate accompaniments and garnishes.
                  </p>
                </div>
              )}

              {selectedCategory === "continental" && (
                <div className="space-y-3">
                  <label
                    htmlFor="continentalMain"
                    className={`${poppins.className} text-sm font-medium text-amber-900`}
                  >
                    Continental Selection{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="continentalMain"
                    className={fieldClass}
                    value={continentalMain}
                    onChange={(e) => {
                      const value = e.target.value;
                      setContinentalMain(value);
                      setMainCourse(value);
                    }}
                    disabled={isDisabled}
                  >
                    <option value="">
                      Select a continental option
                    </option>
                    {continentalMainOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedCategory === "local" && (
                <div className="space-y-5">
                  <div className="space-y-3">
                    <label
                      htmlFor="localMain"
                      className={`${poppins.className} text-sm font-medium text-amber-900`}
                    >
                      Local Cuisine Selection{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="localMain"
                      className={fieldClass}
                      value={localMain}
                      onChange={(e) => {
                        const value = e.target.value;
                        setLocalMain(value);
                        setMainCourse(value);
                        applyLocalSideDefaults(value);
                      }}
                      disabled={isDisabled}
                    >
                      <option value="">
                        Select a local option
                      </option>
                      {localMainOptions.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Jollof / Fried rice extra choices */}
                  {isJollofDish && (
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="riceType"
                          className={`${poppins.className} text-xs font-medium text-amber-900`}
                        >
                          Rice Base (Smoky Jollof or Fried Rice){" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="riceType"
                          className={fieldClass}
                          value={riceType}
                          onChange={(e) => setRiceType(e.target.value)}
                          disabled={isDisabled}
                        >
                          <option value="">Select rice base</option>
                          {riceTypeOptions.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="protein"
                          className={`${poppins.className} text-xs font-medium text-amber-900`}
                        >
                          Protein (Chicken, Beef or Fresh Fish){" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="protein"
                          className={fieldClass}
                          value={protein}
                          onChange={(e) => setProtein(e.target.value)}
                          disabled={isDisabled}
                        >
                          <option value="">Select protein</option>
                          {proteinOptions.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Pounded yam / plantain meal choices */}
                  {isPoundedSideDish && (
                    <div>
                      <label
                        htmlFor="swallow"
                        className={`${poppins.className} text-xs font-medium text-amber-900`}
                      >
                        Accompaniment (Served with Pounded Yam or
                        Plantain Meal){" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="swallow"
                        className={fieldClass}
                        value={swallow}
                        onChange={(e) => setSwallow(e.target.value)}
                        disabled={isDisabled}
                      >
                        <option value="">
                          Select accompaniment
                        </option>
                        {swallowOptions.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {/* Step 3 – dessert & afters */}
          {currentStep === 3 && (
            <section className="space-y-5">
              <p
                className={`${poppins.className} text-sm text-amber-900/85`}
              >
                Now choose how you would like to conclude your culinary
                journey—from the{" "}
                <span className="font-semibold">
                  Dessert Symphony
                </span>{" "}
                and the selection of{" "}
                <span className="font-semibold">
                  fruit, nightcap and midnight treats
                </span>
                .
              </p>

              <div className="grid gap-5 sm:grid-cols-2">
                {/* Dessert */}
                <div>
                  <label
                    htmlFor="dessert"
                    className={`${poppins.className} text-sm font-medium text-amber-900`}
                  >
                    Fifth Course – Dessert Symphony
                  </label>
                  <select
                    id="dessert"
                    className={fieldClass}
                    value={dessert}
                    onChange={(e) => setDessert(e.target.value)}
                    disabled={isDisabled}
                  >
                    <option value="">
                      Select a dessert pairing
                    </option>
                    {dessertOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Afters */}
                <div>
                  <label
                    htmlFor="afters"
                    className={`${poppins.className} text-sm font-medium text-amber-900`}
                  >
                    Sixth–Eighth Courses – Afters
                  </label>
                  <select
                    id="afters"
                    className={fieldClass}
                    value={afters}
                    onChange={(e) => setAfters(e.target.value)}
                    disabled={isDisabled}
                  >
                    <option value="">
                      Select your preferred afters
                    </option>
                    {aftersOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>
          )}

          {/* Step 4 – review */}
          {currentStep === 4 && (
            <section className="space-y-4">
              <p
                className={`${poppins.className} text-sm text-amber-900/85`}
              >
                Please review your selections below. When you are
                satisfied, click{" "}
                <span className="font-semibold">
                  Confirm &amp; Save
                </span>
                .
              </p>

              <div className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50/60 px-4 py-3">
                <h2
                  className={`${cormorant.className} text-lg font-semibold uppercase tracking-[0.16em] text-amber-900`}
                >
                  Your Menu Summary
                </h2>
                <dl
                  className={`${poppins.className} grid gap-3 text-sm`}
                >
                  <div className="grid grid-cols-[150px,1fr] gap-2">
                    <dt className="font-semibold text-amber-800">
                      First Course – Soup
                    </dt>
                    <dd className="text-amber-900">
                      {optionLabel(starter, starterOptions) ||
                        "None selected"}
                    </dd>
                  </div>

                  <div className="grid grid-cols-[150px,1fr] gap-2">
                    <dt className="font-semibold text-amber-800">
                      Second Course – Appetizers
                    </dt>
                    <dd className="text-amber-900">
                      {optionLabel(appetizer, appetizerOptions) ||
                        "None selected"}
                    </dd>
                  </div>

                  <div className="grid grid-cols-[150px,1fr] gap-2">
                    <dt className="font-semibold text-amber-800">
                      Third Course – Salad
                    </dt>
                    <dd className="text-amber-900">
                      {salad === "no-salad"
                        ? "No salad"
                        : optionLabel(salad, saladOptions) ||
                          "None selected"}
                    </dd>
                  </div>

                  <div className="grid grid-cols-[150px,1fr] gap-2">
                    <dt className="font-semibold text-amber-800">
                      Fourth Course – Main
                    </dt>
                    <dd className="text-amber-900">
                      {optionLabel(
                        mainCourse,
                        [
                          ...orientalMainOptions,
                          ...continentalMainOptions,
                          ...localMainOptions,
                        ],
                      ) || "Not selected"}
                      {isJollofDish && (
                        <>
                          <br />
                          <span className="text-amber-800">
                            Rice Base:
                          </span>{" "}
                          {optionLabel(
                            riceType,
                            riceTypeOptions,
                          ) || "Not selected"}
                          <br />
                          <span className="text-amber-800">
                            Protein:
                          </span>{" "}
                          {optionLabel(
                            protein,
                            proteinOptions,
                          ) || "Not selected"}
                        </>
                      )}
                      {isPoundedSideDish && (
                        <>
                          <br />
                          <span className="text-amber-800">
                            Accompaniment:
                          </span>{" "}
                          {optionLabel(
                            swallow,
                            swallowOptions,
                          ) || "Not selected"}
                        </>
                      )}
                    </dd>
                  </div>

                  <div className="grid grid-cols-[150px,1fr] gap-2">
                    <dt className="font-semibold text-amber-800">
                      Fifth Course – Dessert
                    </dt>
                    <dd className="text-amber-900">
                      {optionLabel(dessert, dessertOptions) ||
                        "None selected"}
                    </dd>
                  </div>

                  <div className="grid grid-cols-[150px,1fr] gap-2">
                    <dt className="font-semibold text-amber-800">
                      Afters
                    </dt>
                    <dd className="text-amber-900">
                      {optionLabel(afters, aftersOptions) ||
                        "None selected"}
                    </dd>
                  </div>
                </dl>
              </div>
            </section>
          )}

          {/* Loading note */}
          {loadingProfile && !success && (
            <p className="text-[11px] text-amber-800/70">
              Loading your previous selections…
            </p>
          )}

          {/* Navigation buttons */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-amber-100 pt-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={goPrev}
                disabled={currentStep === 1 || isDisabled}
                className={`${poppins.className} inline-flex items-center cursor-pointer justify-center rounded-full border border-amber-300 bg-white/80 px-4 py-1.5 text-sm font-medium text-amber-800 shadow-sm transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60`}
              >
                ← Previous
              </button>
              {currentStep < totalSteps && (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={isDisabled}
                  className={`${poppins.className} text-sm inline-flex items-center cursor-pointer justify-center rounded-full border border-amber-400 bg-gradient-to-r from-amber-400 to-yellow-400 px-5 py-1.5 font-semibold text-amber-900 shadow-md transition hover:from-amber-300 hover:to-yellow-300 disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  Next Step →
                </button>
              )}
            </div>

            {currentStep === totalSteps && (
              <button
                type="submit"
                disabled={isDisabled}
                className={`${poppins.className} text-md inline-flex items-center cursor-pointer justify-center rounded-full bg-amber-400 px-6 py-2 text-xs sm:text-sm font-semibold text-amber-900 shadow-lg shadow-amber-500/40 transition hover:from-amber-400 hover:via-yellow-300 hover:to-amber-400 disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {submitting
                  ? "Saving..."
                  : loadingProfile
                  ? "Loading..."
                  : "Confirm & Save"}
              </button>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}
