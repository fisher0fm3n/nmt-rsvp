// app/auth/kingschat/callback/route.ts
import { NextRequest, NextResponse } from "next/server";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://nmt-rsvp.netlify.app";

function redirectWithReason(reason: string) {
  const url = new URL(`${BASE_URL}/rsvp/error`);
  url.searchParams.set("reason", reason);
  return NextResponse.redirect(url.toString());
}

export async function POST(req: NextRequest) {
  try {
    let accessToken: string | null =
      req.cookies.get("kc_access_token")?.value ?? null;
    let refreshToken: string | null =
      req.cookies.get("kc_refresh_token")?.value ?? null;

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
      return redirectWithReason("NO_ACCESS_TOKEN");
    }

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
      return redirectWithReason("PROFILE_REQUEST_FAILED");
    }

    const profile = await kcResp.json();
    const kcProfile = profile?.profile;

    if (!kcProfile) {
      console.error("No profile.profile in KingsChat response");
      return redirectWithReason("PROFILE_MISSING");
    }

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
      console.error(
        "Thanksgiving service submission failed",
        submitResp.status
      );
      return redirectWithReason("RSVP_SUBMIT_FAILED");
    }

    const res = NextResponse.redirect(`${BASE_URL}/rsvp/success`);

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

    res.cookies.set(
      "kc_profile",
      JSON.stringify({
        name: kcProfile.name,
        avatar: kcProfile.avatar,
      }),
      {
        httpOnly: false,
        path: "/",
        maxAge: 60 * 10,
      }
    );

    return res;
  } catch (err) {
    console.error("Error in KingsChat callback route:", err);
    // Generic catch-all
    return redirectWithReason("INTERNAL_ERROR");
  }
}
