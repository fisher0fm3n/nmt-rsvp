// app/auth/kingschat/callback/page.tsx
import { cookies } from "next/headers";

export default async function KingsChatCallbackPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("kc_access_token")?.value;

  if (!accessToken) {
    return (
      <div className="p-4 text-red-500">
        No access token found. Make sure you arrived here via the KingsChat
        callback POST.
      </div>
    );
  }

  // Fetch profile *on the page* if you want to show it
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
    return (
      <div className="p-4 text-red-500">
        Failed to load KingsChat profile on page: {kcResp.status}
      </div>
    );
  }

  const profile = await kcResp.json();

  return (
    <div className="p-4">
      <h1 className="font-bold text-lg mb-2">KingsChat Profile</h1>
      <pre className="text-xs whitespace-pre-wrap">
        {JSON.stringify(profile, null, 2)}
      </pre>
    </div>
  );
}
