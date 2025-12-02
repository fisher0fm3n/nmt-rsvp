// app/thanksgivingservice/menu/page.tsx
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Great_Vibes, Cormorant_Garamond, Poppins } from "next/font/google";
import invite from "@/app/assets/images/menu.png";
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
  mainCourse: string;
  localSoup: string | null;
  swallow: string | null;
  dessert: string | null;
  afters: string | null;
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

export default function MenuSelectionPage() {
  const router = useRouter();
  const { user } = useAuth() as { user: User | null };

  const [starter, setStarter] = useState<string>("");
  const [salad, setSalad] = useState<string>("");
  const [mainCourse, setMainCourse] = useState<string>("");
  const [localSoup, setLocalSoup] = useState<string>("");
  const [swallow, setSwallow] = useState<string>("");
  const [dessert, setDessert] = useState<string>("");
  const [afters, setAfters] = useState<string>("");

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const isLocalSoupMain = mainCourse === LOCAL_SOUP_MAIN_ID;

  // If user is not logged in, go back home
  useEffect(() => {
    if (!user) {
      router.replace("/thanksgivingservice");
    }
  }, [user, router]);

  // Fetch full profile via GET and prefill menu if it exists
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.name) {
        setLoadingProfile(false);
        return;
      }

      try {
        const res = await fetch(
          `https://pcdl.co/api/nmt/pka-thanksgivingservice?id=${encodeURIComponent(
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
          // 404 or other error – just log and leave fields empty
          console.warn("Failed to fetch thanksgiving profile:", res.status);
          setLoadingProfile(false);
          return;
        }

        const json = await res.json();
        const profile = json.data || json.user || json;
        const menu: MenuPayload | undefined | null = profile?.menu;

        if (menu) {
          setStarter(menu.starter || "");
          setSalad(menu.salad || "");
          setMainCourse(menu.mainCourse || "");
          setLocalSoup(menu.localSoup || "");
          setSwallow(menu.swallow || "");
          setDessert(menu.dessert || "");
          setAfters(menu.afters || "");
        }
      } catch (err) {
        console.error("Error fetching profile/menu:", err);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [user]);

  // Countdown + redirect after success
  useEffect(() => {
    if (!success) return;

    setCountdown(5); // reset

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          router.push("/thanksgivingservice");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [success, router]);

  const handleMainCourseChange = (value: string) => {
    setMainCourse(value);
    if (value !== LOCAL_SOUP_MAIN_ID) {
      setLocalSoup("");
      setSwallow("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.name) {
      router.replace("/thanksgivingservice");
      return;
    }

    if (!mainCourse) {
      alert("Please select a main course.");
      return;
    }

    if (isLocalSoupMain && (!localSoup || !swallow)) {
      alert(
        "For your main course, please select one soup and one option (Semo or Poundo Yam)."
      );
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(
        "https://pcdl.co/api/nmt/pka-thanksgivingservice/menu",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key":
              "sfWryh0mscQzn0TcFvdz4smp8abRSZLlMo1qpK7UQNoWAw30A9yNbRjL0RMUS741",
          },
          body: JSON.stringify({
            // 🔁 Use name instead of id as requested
            id: user.id,
            starter: starter || null,
            salad: salad || null,
            mainCourse,
            localSoup: isLocalSoupMain ? localSoup || null : null,
            swallow: isLocalSoupMain ? swallow || null : null,
            dessert: dessert || null,
            afters: afters || null,
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const msg =
          data?.error ||
          data?.message ||
          `Failed to save menu selections (status ${res.status})`;
        throw new Error(msg);
      }

      // Success: show banner + start countdown
      setSuccess(true);
    } catch (err: any) {
      console.error("Error saving menu selections:", err);
      alert(
        err?.message ||
          "Sorry, something went wrong while saving your menu. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass =
    "w-full mt-2 rounded-md border border-slate-600 bg-slate-800/70 px-3 py-2 text-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400";

  const isDisabled = submitting || success || loadingProfile;

  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-slate-900 via-slate-950 to-purple-900">
      {/* Card */}
      <div className="text-center relative z-10 w-full max-w-5xl bg-slate-900/70 border border-slate-700/70 rounded-3xl shadow-2xl backdrop-blur-md p-4 sm:p-6 lg:p-8">
        {/* Back button */}
        <div className="flex justify-start mb-4">
          <button
            type="button"
            onClick={() => router.replace("/thanksgivingservice")}
            className={`${poppins.className} cursor-pointer inline-flex items-center gap-2 rounded-md px-3 py-1 text-md font-medium bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600 transition`}
          >
            ← Home
          </button>
        </div>

        {/* Success message */}
        {success && (
          <div className="mb-4 rounded-md border border-emerald-500/70 bg-emerald-900/40 px-4 py-3 text-left">
            <p
              className={`${poppins.className} text-sm text-emerald-100 font-medium`}
            >
              🎉 Your menu selections have been saved successfully!
            </p>
            <p className="text-xs text-emerald-200 mt-1">
              Redirecting you to the home page in{" "}
              <span className="font-semibold">{countdown}</span>{" "}
              second{countdown === 1 ? "" : "s"}…
            </p>
          </div>
        )}

        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          {/* Image on the side (desktop) */}
          <div className="hidden lg:block relative w-full lg:w-1/2">
            <div className="overflow-hidden rounded-2xl shadow-xl border border-slate-700/60">
              <Image
                src={invite}
                alt="Thanksgiving Service Menu"
                className="h-full w-full object-cover"
                priority
              />
            </div>
          </div>

          {/* Right side: header + form */}
          <div className="flex-1 text-center space-y-6">
            <header className="space-y-2">
              <p
                className={`${poppins.className} text-md sm:text-base text-slate-200 mt-3`}
              >
                Please choose your preferred options from the menu.
              </p>
              {loadingProfile && (
                <p className="text-xs text-slate-400 mt-1">
                  Loading your previous selections…
                </p>
              )}
            </header>

            {/* Mobile image (since left one is hidden on small screens) */}
            <div className="block lg:hidden mt-4">
              <div className="overflow-hidden rounded-2xl shadow-xl border border-slate-700/60">
                <Image
                  src={invite}
                  alt="Thanksgiving Service Menu"
                  className="h-full w-full object-cover"
                  priority
                />
              </div>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5 text-left mx-2 sm:mx-6"
            >
              {/* Starter */}
              <div className="space-y-1">
                <label
                  htmlFor="starter"
                  className={`${poppins.className} text-md text-slate-200`}
                >
                  Starter
                </label>
                <select
                  id="starter"
                  className={fieldClass}
                  value={starter}
                  onChange={(e) => setStarter(e.target.value)}
                  disabled={isDisabled}
                >
                  <option value="">Select a starter </option>
                  {starterOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Salad */}
              <div className="space-y-1">
                <label
                  htmlFor="salad"
                  className={`${poppins.className} text-md text-slate-200`}
                >
                  Salad
                </label>
                <select
                  id="salad"
                  className={fieldClass}
                  value={salad}
                  onChange={(e) => setSalad(e.target.value)}
                  disabled={isDisabled}
                >
                  <option value="">Select a salad </option>
                  {saladOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Main Course */}
              <div className="space-y-1">
                <label
                  htmlFor="mainCourse"
                  className={`${poppins.className} text-md text-slate-200`}
                >
                  Main Course <span className="text-red-400">*</span>
                </label>
                <select
                  id="mainCourse"
                  className={fieldClass}
                  value={mainCourse}
                  onChange={(e) => handleMainCourseChange(e.target.value)}
                  disabled={isDisabled}
                >
                  <option value="">Select your main course</option>
                  <optgroup label="Continental">
                    {continentalMainOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Local">
                    <option value={localSoupMainOption.id}>
                      {localSoupMainOption.label} (with Semo / Poundo Yam)
                    </option>
                    {otherLocalMainOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </optgroup>
                </select>

                {/* Extra dropdowns when Local Soup main is chosen */}
                {isLocalSoupMain && (
                  <div className="mt-3 space-y-3">
                    <div className="space-y-1">
                      <label
                        htmlFor="localSoup"
                        className={`${poppins.className} text-xs text-slate-200`}
                      >
                        Soup (choose one){" "}
                        <span className="text-red-400">*</span>
                      </label>
                      <select
                        id="localSoup"
                        className={fieldClass}
                        value={localSoup}
                        onChange={(e) => setLocalSoup(e.target.value)}
                        disabled={isDisabled}
                      >
                        <option value="">Select soup</option>
                        {localSoupOptions.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label
                        htmlFor="swallow"
                        className={`${poppins.className} text-xs text-slate-200`}
                      >
                        With (Semo / Poundo Yam){" "}
                        <span className="text-red-400">*</span>
                      </label>
                      <select
                        id="swallow"
                        className={fieldClass}
                        value={swallow}
                        onChange={(e) => setSwallow(e.target.value)}
                        disabled={isDisabled}
                      >
                        <option value="">Select one</option>
                        {swallowOptions.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Dessert */}
              <div className="space-y-1">
                <label
                  htmlFor="dessert"
                  className={`${poppins.className} text-md text-slate-200`}
                >
                  Dessert
                </label>
                <select
                  id="dessert"
                  className={fieldClass}
                  value={dessert}
                  onChange={(e) => setDessert(e.target.value)}
                  disabled={isDisabled}
                >
                  <option value="">Select a dessert </option>
                  {dessertOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Afters */}
              <div className="space-y-1">
                <label
                  htmlFor="afters"
                  className={`${poppins.className} text-md text-slate-200`}
                >
                  Afters
                </label>
                <select
                  id="afters"
                  className={fieldClass}
                  value={afters}
                  onChange={(e) => setAfters(e.target.value)}
                  disabled={isDisabled}
                >
                  <option value="">Select an option </option>
                  {aftersOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={isDisabled}
                  className={`${poppins.className} cursor-pointer inline-flex items-center justify-center rounded-md px-5 py-2 text-md font-semibold bg-amber-400 hover:bg-amber-300 text-slate-900 shadow-lg shadow-amber-500/40 transition focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  {submitting
                    ? "Saving..."
                    : loadingProfile
                    ? "Loading..."
                    : "Confirm Selections"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
