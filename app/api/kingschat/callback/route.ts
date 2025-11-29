// app/auth/kingschat/callback/route.ts
import { NextRequest, NextResponse } from "next/server";

// Use an env var if you want, otherwise fall back to your main domain
const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://nmt-rsvp.netlify.app";

export async function POST(req: NextRequest) {
  try {
    // 1. Try to get tokens from cookies first
    let accessToken: string | null =
      req.cookies.get("kc_access_token")?.value ?? null;
    let refreshToken: string | null =
      req.cookies.get("kc_refresh_token")?.value ?? null;

    // 2. If no access token in cookies, try to read it from the POST body (JSON or form-data)
    if (!accessToken) {
      const contentType = req.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        const body = await req.json();
        accessToken = body.accessToken ?? null;
        refreshToken = body.refreshToken ?? null;
      } else if (contentType.includes("application/x-www-form-urlencoded")) {
        const form = await req.formData();
        accessToken = (form.get("accessToken") as string) ?? null;
        refreshToken = (form.get("refreshToken") as string) ?? null;
      } else {
        // fallback: try formData anyway
        const form = await req.formData().catch(() => null);
        if (form) {
          accessToken = (form.get("accessToken") as string) ?? null;
          refreshToken = (form.get("refreshToken") as string) ?? null;
        }
      }
    }

    console.log("KingsChat callback POST");
    console.log("accessToken present?", !!accessToken);
    console.log("refreshToken present?", !!refreshToken);

    if (!accessToken) {
      console.error("No accessToken found (cookies or body)");
      return NextResponse.redirect(`${BASE_URL}/rsvp/error`);
    }

    // 3. Fetch profile from KingsChat
    const kcResp = await fetch(
      "https://connect.kingsch.at/developer/api/profile",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      }
    );

    if (!kcResp.ok) {
      console.error("KingsChat profile request failed", kcResp.status);
      return NextResponse.redirect(`${BASE_URL}/rsvp/error`);
    }

    const profile = await kcResp.json();
    const kcProfile = profile?.profile;

    if (!kcProfile) {
      console.error("No profile.profile in KingsChat response");
      return NextResponse.redirect(`${BASE_URL}/rsvp/error`);
    }

    // 4. Submit entry to Thanksgiving service API
    const submitResp = await fetch(
      "https://pcdl.co/api/nmt/pka-thanksgivingservice",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key":
            "sfWryh0mscQzn0TcFvdz4smp8abRSZLlMo1qpK7UQNoWAw30A9yNbRjL0RMUS741",
        },
        body: JSON.stringify({
          id: kcProfile.id,
          name: kcProfile.name,
          username: kcProfile.username,
          email: kcProfile.email,
        }),
        cache: "no-store",
      }
    );

    if (!submitResp.ok) {
      console.error("Thanksgiving service submission failed", submitResp.status);
      return NextResponse.redirect(`${BASE_URL}/rsvp/error`);
    }

    // 5. Build redirect response to success page (always on main domain)
    const res = NextResponse.redirect(`${BASE_URL}/rsvp/success`);

    // Ensure tokens are persisted as cookies on your domain (optional but useful)
    res.cookies.set("kc_access_token", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60, // 1 hour
    });

    if (refreshToken) {
      res.cookies.set("kc_refresh_token", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    // Store minimal profile info in a non-httpOnly cookie for client-side use
    res.cookies.set(
      "kc_profile",
      JSON.stringify({
        name: kcProfile.name,
        avatar: kcProfile.avatar,
      }),
      {
        httpOnly: false, // allow reading on the client if you need it
        path: "/",
        maxAge: 60 * 10, // 10 minutes
      }
    );

    return res;
  } catch (err) {
    console.error("Error in KingsChat callback route:", err);
    // On any unexpected error → error page on main domain
    return NextResponse.redirect(`${BASE_URL}/rsvp/error`);
  }
}
