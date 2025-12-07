// app/auth/kingschat/callback/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/auth/components/AuthProvider";
import Lottie from "react-lottie-player";
import lottieJson from "@/app/assets/lottie/success.json";

export default function KingsChatCallbackPage() {
  const router = useRouter();
  const { hydrate, initialized } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialized) return; // wait until AuthProvider finished reading localStorage

    (async () => {
      try {
        const res = await fetch("/api/kingschat/user", {
          method: "POST",
        });
        const json = await res.json();

        if (!res.ok || !json.ok) {
          setError(json.error || "KingsChat login failed.");
          return;
        }

        // ✅ drop the normalized payload into AuthProvider
        hydrate({
          user: json.user,
        });

        router.replace("/menu/dec7th"); // or wherever you want to land
      } catch (e) {
        console.error("KingsChat callback error", e);
        setError("Network error while completing KingsChat login.");
      }
    })();
  }, [initialized, hydrate, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-red-400">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col gap-1 items-center justify-center bg-black text-white">
      <div>
        <Lottie
          loop
          animationData={lottieJson}
          play
          style={{ width: 150, height: 150 }}
        />
      </div>
      <div>
        <h1>Please wait while we sign you in…</h1>
      </div>
    </div>
  );
}
