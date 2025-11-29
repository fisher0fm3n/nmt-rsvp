// app/auth/kingschat/callback/route.ts
import { NextRequest, NextResponse } from "next/server";

const BASE_ORIGIN =
  process.env.NEXT_PUBLIC_BASE_URL || "https://nmt-rsvp.netlify.app";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let accessToken: string | null = null;
    let refreshToken: string | null = null;

    if (contentType.includes("application/json")) {
      const body = await req.json();
      accessToken = body.accessToken ?? null;
      refreshToken = body.refreshToken ?? null;
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const form = await req.formData();
      accessToken = (form.get("accessToken") as string) ?? null;
      refreshToken = (form.get("refreshToken") as string) ?? null;
    } else {
      const form = await req.formData().catch(() => null);
      if (form) {
        accessToken = (form.get("accessToken") as string) ?? null;
        refreshToken = (form.get("refreshToken") as string) ?? null;
      }
    }

    console.log("Incoming KingsChat callback:");
    console.log("content-type:", contentType);
    console.log("accessToken present?", !!accessToken);
    console.log("refreshToken present?", !!refreshToken);

    if (!accessToken) {
      console.error("No accessToken in POST body");
      return NextResponse.redirect(`${BASE_ORIGIN}/rsvp/error`);
    }

    // 1) Fetch KingsChat profile
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
      console.error("KingsChat profile request failed:", kcResp.status);
      return NextResponse.redirect(`${BASE_ORIGIN}/rsvp/error`);
    }

    const profileJson = await kcResp.json();
    const kcProfile = profileJson?.profile;

    if (!kcProfile) {
      console.error("No profile.profile in KingsChat response", profileJson);
      return NextResponse.redirect(`${BASE_ORIGIN}/rsvp/error`);
    }

    // 2) Submit RSVP to PCDL API
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
      console.error("PCDL RSVP submission failed:", submitResp.status);
      return NextResponse.redirect(`${BASE_ORIGIN}/rsvp/error`);
    }

    // 3) Build redirect to success page
    const redirectUrl = `${BASE_ORIGIN}/rsvp/success`;
    const res = NextResponse.redirect(redirectUrl);

    // 4) Set tokens (optional, if you still need them)
    res.cookies.set("kc_access_token", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60,
    });

    if (refreshToken) {
      res.cookies.set("kc_refresh_token", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    // 5) 👇 Set *non-httpOnly* cookie for profile (readable on client)
    const safeProfile = {
      name: kcProfile.name ?? null,
      avatar: kcProfile.avatar ?? null,
    };

    res.cookies.set("kc_profile", encodeURIComponent(JSON.stringify(safeProfile)), {
      httpOnly: false,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 10, // 10 minutes
    });

    return res;
  } catch (err) {
    console.error("Error in KingsChat callback route:", err);
    return NextResponse.redirect(`${BASE_ORIGIN}/rsvp/error`);
  }
}
