// app/auth/kingschat/callback/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const BASE_ORIGIN =
  process.env.NEXT_PUBLIC_BASE_URL || "https://nmt-rsvp.netlify.app";

const BASE_SUCCESS_PATH = "/rsvp/success";
const BASE_ERROR_PATH = "/rsvp/error";

export default async function KingsChatCallbackPage() {
  // In your setup cookies() is typed async
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("kc_access_token")?.value ?? null;

  if (!accessToken) {
    console.error(
      "KingsChat callback page: no kc_access_token cookie found"
    );
    redirect(`${BASE_ORIGIN}${BASE_ERROR_PATH}`);
  }

  // 1) Fetch KingsChat profile using the access token
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
    console.error(
      "KingsChat profile request failed on callback page:",
      kcResp.status
    );
    redirect(`${BASE_ORIGIN}${BASE_ERROR_PATH}`);
  }

  const profileJson = await kcResp.json();
  const kcProfile = profileJson?.profile;

  if (!kcProfile) {
    console.error(
      "KingsChat callback page: profile.profile missing in response",
      profileJson
    );
    redirect(`${BASE_ORIGIN}${BASE_ERROR_PATH}`);
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
    console.error(
      "PCDL RSVP submission failed on callback page:",
      submitResp.status
    );
    redirect(`${BASE_ORIGIN}${BASE_ERROR_PATH}`);
  }

  // 3) Redirect to success page with name + avatar in query params
  const name = kcProfile.name ?? "Beloved Guest";
  const avatar = kcProfile.avatar as string | undefined;

  const params = new URLSearchParams();
  if (name) params.set("name", name);
  if (avatar) params.set("avatar", avatar);

  redirect(`${BASE_ORIGIN}${BASE_SUCCESS_PATH}?${params.toString()}`);
}
