// app/rsvp/page.tsx
"use client";

import Image from "next/image";
import { useEffect, useState, useRef } from "react";
// @ts-ignore
import confetti from "canvas-confetti";
import { KingsChatSignIn } from "../auth/components/KingschatSignIn";
import invite from "../assets/images/invitationnew.jpg";
import { Great_Vibes, Cormorant_Garamond, Poppins } from "next/font/google";
import QRCode from "react-qr-code";
// 👇 adjust this import to where your hook actually lives
import { useAuth } from "../auth/components/AuthProvider";

// 👇 Lottie imports (adjust path to your JSON if needed)
import Lottie from "react-lottie-player";
import loadingAnimation from "../assets/lottie/loading.json";
import Link from "next/link";

// Script font for the main title
const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
});

// Elegant serif similar to Centaur for body text
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Poppins for button text
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
  // 👇 assume useAuth exposes a loading state
  const { user: authUser, loading: authLoading } = useAuth() as {
    user: User | null;
    loading: boolean;
  };

  const [attendance, setAttendance] = useState<string>("");

  // local, “live” user state that can differ from authUser after refresh/updates
  const [user, setUser] = useState<User | null>(null);

  // form fields for editing
  const [formName, setFormName] = useState("");
  const [formAttendance, setFormAttendance] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // QR visibility toggle (hidden by default)
  const [qrVisible, setQrVisible] = useState(false);

  // ref for QR container (for PNG generation)
  const qrRef = useRef<HTMLDivElement | null>(null);

  // Load saved attendance from localStorage (if any)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = window.localStorage.getItem("attendanceResponse");
    if (stored) {
      setAttendance(stored);
    }
  }, []);

  // When authUser changes (e.g. log in/log out), use it as the baseline local user
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
    // don't auto-show QR when user changes; keep it hidden until toggled
    setQrVisible(false);
  }, [authUser]);

  // On mount / refresh: if we have an authUser id, fetch the freshest data from backend
  useEffect(() => {
    if (!authUser?.id) return;

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(
          `https://pcdl.co/api/nmt/pka-thanksgivingservice?id=${encodeURIComponent(
            authUser.id
          )}`,
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
        setQrVisible(false); // still hidden by default after refresh

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

  // Falling sparkles / confetti across whole page
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

      const maxAge = 60 * 60 * 24 * 30; // 30 days
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
      const res = await fetch(
        "https://pcdl.co/api/nmt/pka-thanksgivingservice",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-api-key":
              "sfWryh0mscQzn0TcFvdz4smp8abRSZLlMo1qpK7UQNoWAw30A9yNbRjL0RMUS741",
          },
          body: JSON.stringify({
            id: user.id, // never shown to UI
            name: formName,
            attendance: formAttendance || null,
          }),
        }
      );

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

  // ✅ Download QR as PNG with user details and event title
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

        // how many lines of text we'll draw
        const baseLines = 3; // name, username, first event line
        const extraSeatLine = user.seat ? 1 : 0;
        const totalLines = baseLines + extraSeatLine + 1; // +1 for second event line

        const lineHeight = 26; // px between lines
        const textBlockHeight = totalLines * lineHeight + 20; // small extra margin

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

        // Background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Draw QR
        const qrX = (canvasWidth - qrWidth) / 2;
        const qrY = padding;
        ctx.drawImage(img, qrX, qrY);

        const centerX = canvasWidth / 2;
        let textY = qrY + qrHeight + padding;

        ctx.fillStyle = "#000000";
        ctx.textAlign = "center";

        ctx.font = "bold 20px system-ui";
        // ctx.fillText(user.name, centerX, textY);
        // textY += lineHeight;

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

  // ✅ QR can only be shown if:
  //  - user has a token
  //  - attendance is not explicitly "no"
  const canShowQr =
    !!user?.token &&
    (!user.attendance || user.attendance.toLowerCase() !== "no");

  const showLoadingState = authLoading && !authUser && !user;

  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-slate-900 via-slate-950 to-purple-900">
      {/* Full-page sparkles canvas */}
      <canvas
        id="sparkles-canvas"
        className="pointer-events-none fixed inset-0 z-0 w-full"
      />

      {/* Content card */}
      <div className="text-center relative z-10 w-full max-w-5xl bg-slate-900/60 border border-slate-700/60 rounded-3xl shadow-2xl backdrop-blur-md p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
          {/* Invitation Image */}
          <div className="hidden lg:block relative w-full lg:w-1/2">
            <div className="overflow-hidden rounded-2xl shadow-xl border border-slate-700/60">
              <Image
                src={invite}
                alt="Thanksgiving Service Invitation"
                className="h-full w-full object-cover"
                priority
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex-1 text-center space-y-6">
            <div className="space-y-2">
              <p
                className={`${cormorant.className} my-4 text-md tracking-[0.25em] uppercase text-slate-400`}
              >
                Highly Esteemed Pastor Kayode Adesina
              </p>
              <h1
                className={`${greatVibes.className} text-center text-4xl sm:text-6xl text-amber-200 drop-shadow-md`}
              >
                Thanksgiving Service
              </h1>

              <h1
                className={`${greatVibes.className} text-center text-2xl text-amber-200 drop-shadow-md`}
              >
                RSVP
              </h1>
            </div>

            {/* If user with token is present -> show form + logout (and QR controls) */}
            {user && user.token ? (
              <div className="space-y-6 mx-4 sm:mx-8 text-left">
                {/* Row 1: Profile info */}
                <div className="text-center">
                  <p
                    className={`${poppins.className} text-base text-slate-200`}
                  >
                    Welcome
                  </p>
                  <p
                    className={`${cormorant.className} text-3xl text-amber-200`}
                  >
                    {user.name}
                  </p>

                  {user.seat && (
                    <div className="mt-3 flex justify-center mb-3">
                      <span className="inline-flex items-center rounded-full border border-amber-300/70 bg-amber-300/10 px-4 py-1 text-xs font-medium tracking-[0.15em] text-amber-200">
                        <span className="ml-1 font-semibold">Seat: </span>
                        {user.seat}
                      </span>
                    </div>
                  )}

                  <p className="text-md text-slate-300">@{user.username}</p>

                  {/* Show/Hide QR button */}
                  {/* {canShowQr && (
                    <div className="mt-4 flex justify-center gap-3 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setQrVisible((prev) => !prev)}
                        className={`${poppins.className} cursor-pointer inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600 transition`}
                      >
                        {qrVisible ? "Hide QR Code" : "Show QR Code"}
                      </button>
                    </div>
                  )} */}
                </div>

                {/* Row 2: QR code + download (only if visible) */}
                {/* {canShowQr && qrVisible && (
                  <div className="flex flex-col items-center justify-center">
                    <div
                      ref={qrRef}
                      className="bg-white p-3 rounded-2xl max-w-[240px] w-full"
                    >
                      <QRCode
                        value={user.token}
                        size={220}
                        style={{
                          height: "auto",
                          maxWidth: "100%",
                          width: "100%",
                        }}
                      />
                    </div>
                    <p className="mt-2 text-[0.8rem] text-slate-300 text-center">
                      Present this QR code
                    </p>
                    <button
                      type="button"
                      onClick={handleDownloadQr}
                      className={`${poppins.className} mt-3 cursor-pointer inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold bg-amber-400 hover:bg-amber-300 text-slate-900 shadow-lg shadow-amber-500/40 transition focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-slate-900`}
                    >
                      Download QR Code
                    </button>
                  </div>
                )} */}

                <div className="mt-2 flex flex-col space-y-4 border-t border-slate-700/70 pt-4">
                  <h1>Menu</h1>
                  <Link
                    href={"/thanksgivingservice/menu"}
                    className={`${poppins.className} cursor-pointer inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold bg-amber-400 hover:bg-amber-300 text-slate-900 shadow-lg shadow-amber-500/40 transition focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    Select your meal options
                  </Link>
                </div>

                {/* Row 3: Edit form + logout */}
                <form
                  onSubmit={handleSave}
                  className="mt-2 space-y-4 border-t border-slate-700/70 pt-4"
                >
                  <div className="flex flex-col gap-1">
                    <label
                      className={`${poppins.className} text-sm text-slate-200`}
                      htmlFor="name"
                    >
                      Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full rounded-md border border-slate-600 bg-slate-800/70 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label
                      className={`${poppins.className} text-sm text-slate-200`}
                      htmlFor="attendance"
                    >
                      Will you be in attendance?
                    </label>
                    <select
                      id="attendance"
                      value={formAttendance}
                      onChange={(e) => setFormAttendance(e.target.value)}
                      className="w-full rounded-md border border-slate-600 bg-slate-800/70 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                    >
                      <option value="">Select an option</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>

                  {saveError && (
                    <p className="text-xs text-red-400">{saveError}</p>
                  )}
                  {saveSuccess && (
                    <p className="text-xs text-emerald-300">{saveSuccess}</p>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className={`${poppins.className} cursor-pointer inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold bg-amber-400 hover:bg-amber-300 text-slate-900 shadow-lg shadow-amber-500/40 transition focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-60 disabled:cursor-not-allowed`}
                    >
                      {saving ? "Saving…" : "Save Details"}
                    </button>

                    {user && (
                      <div className="block lg:hidden relative w-full lg:w-1/2">
                        <div className="overflow-hidden rounded-2xl shadow-xl border border-slate-700/60">
                          <Image
                            src={invite}
                            alt="Thanksgiving Service Invitation"
                            className="h-full w-full object-cover"
                            priority
                          />
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className={`${poppins.className} cursor-pointer inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600 transition`}
                    >
                      Logout
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              // No user yet
              <div className="space-y-3 mx-8">
                {!user && (
                  <div className="block lg:hidden relative w-full lg:w-1/2">
                    <div className="overflow-hidden rounded-2xl shadow-xl border border-slate-700/60">
                      <Image
                        src={invite}
                        alt="Thanksgiving Service Invitation"
                        className="h-full w-full object-cover"
                        priority
                      />
                    </div>
                  </div>
                )}

                {showLoadingState ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-4">
                    <Lottie
                      animationData={loadingAnimation}
                      loop
                      play
                      className="w-32 h-32 sm:w-40 sm:h-40"
                    />
                    <p
                      className={`${poppins.className} text-sm text-slate-200`}
                    >
                      Checking your invitation…
                    </p>
                  </div>
                ) : (
                  <KingsChatSignIn />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
