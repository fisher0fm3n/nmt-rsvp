"use client";

import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import confetti from "canvas-confetti";
import { KingsChatSignIn } from "../../auth/components/KingschatSignIn";
import invite from "../../assets/images/invitationnew.jpg";
import { Great_Vibes, Cormorant_Garamond, Poppins } from "next/font/google";
import QRCode from "react-qr-code";
import { useAuth } from "../../auth/components/AuthProvider";
import Lottie from "react-lottie-player";
import loadingAnimation from "../../assets/lottie/loading.json";
import Link from "next/link";
import logo from "@/app/assets/images/logo.png";

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

export default function RsvpPage() {
  const { user: authUser, loading: authLoading } = useAuth() as {
    user: User | null;
    loading: boolean;
  };

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
    if (stored) {
      setAttendance(stored);
    }
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
    setFormName(authUser.name || "");
    setFormAttendance(authUser.attendance || "");
    setQrVisible(false);
  }, [authUser]);

  useEffect(() => {
    if (!authUser?.id) return;

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(
          `https://pcdl.co/api/nmt/rsvp?id=${encodeURIComponent(authUser.id)}`,
          {
            method: "GET",
            headers: {
              "x-api-key":
                "sfWryh0mscQzn0TcFvdz4smp8abRSZLlMo1qpK7UQNoWAw30A9yNbRjL0RMUS741",
            },
          }
        );

        if (!res.ok) {
          console.warn("Failed to refresh RSVP user data, status:", res.status);
          return;
        }

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
        setFormName(refreshedUser.name || "");
        setFormAttendance(refreshedUser.attendance || "");
        setQrVisible(false);

        if (typeof window !== "undefined") {
          try {
            window.localStorage.setItem(
              "nmt_rsvp",
              JSON.stringify({ user: refreshedUser })
            );
          } catch (err) {
            console.warn(
              "Failed to persist refreshed user to localStorage",
              err
            );
          }
        }
      } catch (err) {
        console.warn("Error refreshing RSVP user data:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authUser?.id]);

  useEffect(() => {
    if (typeof window === "undefined") return;

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
  }, []);

  const handleAttendanceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setAttendance(value);

    if (typeof window !== "undefined") {
      window.localStorage.setItem("attendanceResponse", value);

      const maxAge = 60 * 60 * 24 * 30;
      const isSecure = window.location.protocol === "https:";
      document.cookie = `attendanceResponse=${encodeURIComponent(
        value
      )}; path=/; max-age=${maxAge}; SameSite=Lax${isSecure ? "; Secure" : ""}`;
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("nmt_rsvp");
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
          "x-api-key":
            "sfWryh0mscQzn0TcFvdz4smp8abRSZLlMo1qpK7UQNoWAw30A9yNbRjL0RMUS741",
        },
        body: JSON.stringify({
          id: user.id,
          name: formName,
          attendance: formAttendance || null,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        const msg =
          errJson?.message ||
          errJson?.error ||
          `Failed to update (status ${res.status})`;
        setSaveError(msg);
        return;
      }

      const json = await res.json().catch(() => ({} as any));

      let updatedUser: User = {
        ...user,
        name: formName,
        attendance: formAttendance || null,
      };

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

      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(
            "nmt_rsvp",
            JSON.stringify({ user: updatedUser })
          );
        } catch (err) {
          console.warn("Failed to update nmt_rsvp in localStorage", err);
        }
      }

      setSaveSuccess("Your details have been updated.");
    } catch (err: any) {
      console.error("Error updating RSVP details:", err);
      setSaveError("Network error while updating your details.");
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadQr = () => {
    if (!qrRef.current || !user) return;

    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;

    try {
      const serializer = new XMLSerializer();
      const svgStr = serializer.serializeToString(svg);
      const blob = new Blob([svgStr], {
        type: "image/svg+xml;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);

      const img = new window.Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        const padding = 40;
        const qrWidth = img.width;
        const qrHeight = img.height;

        const baseLines = 3;
        const extraSeatLine = user.seat ? 1 : 0;
        const totalLines = baseLines + extraSeatLine + 1;

        const lineHeight = 26;
        const textBlockHeight = totalLines * lineHeight + 20;

        const canvasWidth = qrWidth + padding * 2;
        const canvasHeight = qrHeight + padding * 2 + textBlockHeight;

        const canvas = document.createElement("canvas");
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          URL.revokeObjectURL(url);
          return;
        }

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        const qrX = (canvasWidth - qrWidth) / 2;
        const qrY = padding;
        ctx.drawImage(img, qrX, qrY);

        const centerX = canvasWidth / 2;
        let textY = qrY + qrHeight + padding;

        ctx.fillStyle = "#000000";
        ctx.textAlign = "center";

        ctx.font = "bold 20px system-ui";

        ctx.font = "16px system-ui";
        ctx.fillText(`@${user.username}`, centerX, textY);
        textY += lineHeight;

        textY += lineHeight;

        ctx.fillText("Thanksgiving Service", centerX, textY);

        const pngUrl = canvas.toDataURL("image/png");

        const link = document.createElement("a");
        link.href = pngUrl;
        link.download = "thanksgiving-qr-code.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
      };

      img.src = url;
    } catch (err) {
      console.error("Failed to download QR PNG:", err);
    }
  };

  const canShowQr =
    !!user?.token &&
    (!user.attendance || user.attendance.toLowerCase() !== "no");

  const showLoadingState = authLoading && !authUser && !user;

  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-br from-amber-50 via-white to-amber-100">
      <canvas
        id="sparkles-canvas"
        className="pointer-events-none fixed inset-0 z-0 w-full h-full"
      />

      <div className="relative z-10 w-full max-w-xl">
        <div className="rounded-2xl border-[.2px] border-amber-200/80 bg-white/90 shadow-[0_25px_80px_rgba(146,64,14,0.25)] backdrop-blur-sm overflow-hidden">
          <div className="relative flex flex-col items-center pt-8 pb-4 px-4 sm:px-8">
            <div className="flex items-center justify-center mb-2">
              <div className="flex h-[10rem] w-[10rem] items-center justify-center">
                <Image src={logo} className="p-2" alt="logo" />
              </div>
            </div>
            <p
              className={`${cormorant.className} text-2xl sm:text-4xl font-semibold uppercase text-amber-700 text-center mx-8`}
            >
              Royal Banquet Menu Selection
            </p>
            <div className="text-center mb-4">
              <p
                className={`${cormorant.className}  mt-[2rem] font-semibold text-lg sm:text-lg uppercase text-amber-700`}
              >
                A Special Celebration In Honour Of Our Man of God and Father
              </p>
              <p
                className={`${cormorant.className} font-semibold mt-1 text-lg sm:text-xl text-neutral-800`}
              >
                Pastor Chris Oyakhilome DSc DSc DD
              </p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row border-t border-amber-100 pb-10">
            <div className="flex-1 px-6 sm:px-10 bg-gradient-to-br from-white via-amber-50/40 to-white">
              {user && user.token ? (
                <div className="space-y-6 text-left">
                  <div className="text-center mt-8">
                    <p
                      className={`${poppins.className} text-sm sm:text-md font-semibold text-neutral-700`}
                    >
                      Dearly Beloved,
                    </p>
                    <p
                      className={`${cormorant.className} mt-1 text-3xl sm:text-4xl font-seminold text-amber-700`}
                    >
                      {user.name}
                    </p>
                  </div>

                  <div className="mt-6 flex justify-center">
                    <Link
                      href="/menu/dec7th/order"
                      className={`${poppins.className} inline-flex items-center justify-center rounded-md px-8 py-3 text-sm font-semibold bg-amber-600 hover:bg-amber-500 text-white transition`}
                    >
                      Select Your Menu Options
                    </Link>
                  </div>

                  <form
                    onSubmit={handleSave}
                    className="mt-4 space-y-4 border-t border-amber-100 pt-4"
                  >
                    <div className="flex flex-col gap-1">
                      <label
                        className={`${poppins.className} text-md text-neutral-700`}
                        htmlFor="name"
                      >
                        Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={formName}
                        onChange={(e) => setFormName(e.target_value)}
                        className="w-full rounded-md border border-amber-200 bg-white/70 px-3 py-2 text-md text-neutral-800 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                      />
                    </div>

                    {saveError && (
                      <p className="text-xs text-red-500">{saveError}</p>
                    )}
                    {saveSuccess && (
                      <p className="text-xs text-emerald-600">{saveSuccess}</p>
                    )}

                    <div className="mt-3 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                      <button
                        type="submit"
                        disabled={saving}
                        className={`${poppins.className} cursor-pointer inline-flex items-center justify-center rounded-full px-6 py-2 text-sm sm:text-md font-semibold bg-amber-600 hover:bg-amber-500 text-white transition disabled:opacity-60 disabled:cursor-not-allowed`}
                      >
                        {saving ? "Saving…" : "Update"}
                      </button>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className={`${poppins.className} cursor-pointer inline-flex items-center justify-center rounded-full px-6 py-2 text-sm sm:text-md font-semibold bg-white text-neutral-800 border border-amber-300 hover:bg-amber-50 transition`}
                      >
                        Logout
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="space-y-4">
                  {showLoadingState ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-4">
                      <Lottie
                        animationData={loadingAnimation}
                        loop
                        play
                        className="w-28 h-28 sm:w-32 sm:h-32"
                      />
                      <p
                        className={`${poppins.className} text-sm text-neutral-700`}
                      >
                        Checking your invitation…
                      </p>
                    </div>
                  ) : (
                    <>
                      <p
                        className={`${cormorant.className} font-semibold text-center text-base sm:text-xl text-neutral-700 my-6`}
                      >
                        Kindly sign in with KingsChat to confirm your menu
                        options
                      </p>
                      <KingsChatSignIn />
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
