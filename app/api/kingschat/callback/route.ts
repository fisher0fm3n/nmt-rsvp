// app/auth/kingschat/callback/route.ts
import { NextRequest, NextResponse } from "next/server";

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

    // 5. Redirect to success WITH name + avatar in query params
    const successUrl = new URL(`${BASE_URL}/rsvp/success`);
    if (kcProfile.name) {
      successUrl.searchParams.set("name", kcProfile.name);
    }
    if (kcProfile.avatar) {
      successUrl.searchParams.set("avatar", kcProfile.avatar);
    }

    const res = NextResponse.redirect(successUrl.toString());

    // (Optional) still keep tokens as httpOnly cookies if you want
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

    // 🔴 NOTE: we are NOT setting kc_profile cookie anymore
    // That whole bit is gone to avoid any cookie-related issues for the success page

    return res;
  } catch (err) {
    console.error("Error in KingsChat callback route:", err);
    return NextResponse.redirect(`${BASE_URL}/rsvp/error`);
  }
}
