// app/auth/kingschat/callback/route.ts
import { NextRequest, NextResponse } from "next/server";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://nmt-rsvp.netlify.app";

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

    if (!accessToken) {
      console.error("No accessToken in POST body");
      return new NextResponse(
        "Missing accessToken in KingsChat callback body",
        { status: 400 }
      );
    }

    // Always redirect to canonical domain
    const redirectUrl = `${BASE_URL}/auth/kingschat/callback`;

    const res = NextResponse.redirect(redirectUrl, { status: 303 });

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

    return res;
  } catch (err) {
    console.error("Error in KingsChat callback route:", err);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
