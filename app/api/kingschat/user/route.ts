// app/api/kingschat/user/route.ts
import { NextRequest, NextResponse } from "next/server";

const USER_URL = "https://pcdl.co/api/nmt/pka-thanksgivingservice/login";

export async function POST(req: NextRequest) {
  try {
    // 1️⃣ Prefer cookies that your KingsChat callback already set
    const cookieAccess = req.cookies.get("kc_access_token")?.value ?? null;
    const cookieRefresh = req.cookies.get("kc_refresh_token")?.value ?? null;

    // 2️⃣ Allow body override if you ever want to POST tokens directly
    let bodyAccess = cookieAccess;
    let bodyRefresh = cookieRefresh;

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const jsonBody = await req.json().catch(() => null);
      if (jsonBody) {
        bodyAccess = jsonBody.accessToken ?? bodyAccess;
        bodyRefresh = jsonBody.refreshToken ?? bodyRefresh;
      }
    }

    const accessToken = bodyAccess;
    const refreshToken = bodyRefresh;

    // Only accessToken is strictly required; refreshToken is optional
    if (!accessToken) {
      return NextResponse.json(
        {
          ok: false,
          error: "KingsChat accessToken is required",
        },
        { status: 400 }
      );
    }

    // 3️⃣ Call your NMT login API
    const kcRes = await fetch(USER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key":
          "sfWryh0mscQzn0TcFvdz4smp8abRSZLlMo1qpK7UQNoWAw30A9yNbRjL0RMUS741",
      },
      body: JSON.stringify({ accessToken, refreshToken }),
      cache: "no-store",
    });

    const json = await kcRes.json().catch(() => ({} as any));

    if (!kcRes.ok) {
      const apiErrorMsg =
        json?.message || json?.error || "Unable to fetch KingsChat user.";
      return NextResponse.json(
        { ok: false, error: apiErrorMsg },
        { status: kcRes.status }
      );
    }

    // ✅ New backend shape:
    // {
    //   message: "...",
    //   entryId: "...",
    //   _id: "...",
    //   token: "...",
    //   duplicate: false,
    //   user: { ... }
    // }
    const user = json.user;
    const token = json.token;
    const duplicate = !!json.duplicate;

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Login succeeded but user is missing from response." },
        { status: 500 }
      );
    }

    // ✅ Normalized payload for the frontend
    return NextResponse.json({
      ok: true,
      user,
      token,
      duplicate,
    });
  } catch (err) {
    console.error("KingsChat user API error:", err);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
