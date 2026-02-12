// app/nmt/monitor/page.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

type NmtEvent =
  | {
      kind: "generic";
      event: string;
      data: any;
      receivedAt: string;
    }
  | {
      kind: "transaction";
      data: any;
      receivedAt: string;
    }
  | {
      kind: "user";
      email: string | null;
      data: any;
      receivedAt: string;
    }
  | {
      kind: "test";
      data: any;
      receivedAt: string;
    };

// ---------- HARD-CODED URLs (no env) ----------
const SOCKET_URL = "https://nmt.loveworldapis.com";

const NMT_WEBHOOK_BASE = "https://nmt.loveworldapis.com/api";
const NMT_WEBHOOK_GENERIC = `${NMT_WEBHOOK_BASE}/nmt/webhook`;
const NMT_WEBHOOK_USERS = `${NMT_WEBHOOK_BASE}/nmt/webhook/users`;
const NMT_WEBHOOK_TRANSACTIONS = `${NMT_WEBHOOK_BASE}/nmt/webhook/transactions`;
const NMT_WEBHOOK_TEST = `${NMT_WEBHOOK_BASE}/nmt/webhook/test`;

export default function NmtMonitorPage() {
  const [socketId, setSocketId] = useState<string | null>(null);
  const [events, setEvents] = useState<NmtEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    console.log("[NMT monitor] creating socket…");

    const socket: Socket = io(SOCKET_URL, {
      path: "/api/socket.io",        // 👈 must match server path
      transports: ["polling"],       // 👈 force POLLING only (no WebSocket)
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[NMT monitor] connected:", socket.id);
      setConnected(true);
      setSocketId(socket.id || null);
      setLastError(null);
    });

    socket.on("disconnect", (reason) => {
      console.log("[NMT monitor] disconnected:", reason);
      setConnected(false);
      setSocketId(null);
    });

    socket.on("connect_error", (err) => {
      console.error("[NMT monitor] connect_error:", err);
      setConnected(false);
      setLastError(err?.message || "connect_error");
    });

    // Generic NMT webhook: POST /nmt/webhook
    socket.on("nmt_webhook", (payload: any) => {
      console.log("[NMT monitor] nmt_webhook:", payload);
      setEvents((prev) => [
        {
          kind: "generic",
          event: payload.event || "generic_event",
          data: payload.data ?? payload,
          receivedAt: payload.receivedAt || new Date().toISOString(),
        },
        ...prev,
      ]);
    });

    // Transactions: POST /nmt/webhook/transactions
    socket.on("nmt_transaction_webhook", (payload: any) => {
      console.log("[NMT monitor] nmt_transaction_webhook:", payload);
      setEvents((prev) => [
        {
          kind: "transaction",
          data: payload.data ?? payload,
          receivedAt: payload.receivedAt || new Date().toISOString(),
        },
        ...prev,
      ]);
    });

    // Users: POST /nmt/webhook/users
    socket.on("nmt_user_webhook", (payload: any) => {
      console.log("[NMT monitor] nmt_user_webhook:", payload);
      setEvents((prev) => [
        {
          kind: "user",
          email: payload.email ?? null,
          data: payload.data ?? payload,
          receivedAt: payload.receivedAt || new Date().toISOString(),
        },
        ...prev,
      ]);
    });

    // Test: POST /nmt/webhook/test
    socket.on("nmt_webhook_test", (payload: any) => {
      console.log("[NMT monitor] nmt_webhook_test:", payload);
      setEvents((prev) => [
        {
          kind: "test",
          data: payload.data ?? payload,
          receivedAt: payload.receivedAt || new Date().toISOString(),
        },
        ...prev,
      ]);
    });

    return () => {
      console.log("[NMT monitor] cleaning up socket…");
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("nmt_webhook");
      socket.off("nmt_transaction_webhook");
      socket.off("nmt_user_webhook");
      socket.off("nmt_webhook_test");
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">NMT Webhook Monitor</h1>
            <p className="text-sm text-slate-400">
              Socket.IO server:&nbsp;
              <code className="bg-slate-800 px-1 py-0.5 rounded">
                {SOCKET_URL}
              </code>
            </p>
            <div className="mt-2 space-y-1 text-xs text-slate-400">
              <p>Webhooks listening on:</p>
              <ul className="space-y-1">
                <li>
                  • Generic:&nbsp;
                  <code className="bg-slate-800 px-1 py-0.5 rounded break-all">
                    {NMT_WEBHOOK_GENERIC}
                  </code>
                </li>
                <li>
                  • Users:&nbsp;
                  <code className="bg-slate-800 px-1 py-0.5 rounded break-all">
                    {NMT_WEBHOOK_USERS}
                  </code>
                </li>
                <li>
                  • Transactions:&nbsp;
                  <code className="bg-slate-800 px-1 py-0.5 rounded break-all">
                    {NMT_WEBHOOK_TRANSACTIONS}
                  </code>
                </li>
                <li>
                  • Test:&nbsp;
                  <code className="bg-slate-800 px-1 py-0.5 rounded break-all">
                    {NMT_WEBHOOK_TEST}
                  </code>
                </li>
              </ul>
            </div>

            {lastError && (
              <p className="mt-2 text-xs text-red-400">
                Last socket error: {lastError}
              </p>
            )}
          </div>

          <div className="text-right">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
                connected
                  ? "bg-emerald-900/40 text-emerald-300"
                  : "bg-red-900/40 text-red-300"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  connected ? "bg-emerald-400" : "bg-red-400"
                }`}
              />
              {connected ? "Connected" : "Disconnected"}
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              Socket ID: {socketId || "—"}
            </div>
          </div>
        </header>

        {events.length === 0 ? (
          <div className="space-y-2 text-sm text-slate-400">
            <p>No events yet.</p>
            <p>Example test call (with your x-api-key):</p>
            <pre className="bg-slate-950 border border-slate-800 rounded p-2 text-xs overflow-x-auto">
{`curl -X POST "${NMT_WEBHOOK_TEST}" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: <YOUR_PCDL_API_KEY>" \\
  -d '{"hello":"world"}'`}
            </pre>
          </div>
        ) : (
          <section className="space-y-3">
            {events.map((evt, idx) => (
              <article
                key={idx}
                className="border border-slate-800 rounded-lg bg-slate-900/60 p-3 text-sm"
              >
                <header className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {labelForEvent(evt)}
                  </span>
                  <time className="text-[11px] text-slate-500">
                    {formatTimestamp(evt.receivedAt)}
                  </time>
                </header>

                {evt.kind === "generic" && (
                  <p className="text-xs mb-1 text-slate-300">
                    Event:{" "}
                    <span className="font-mono bg-slate-800 px-1 py-0.5 rounded">
                      {evt.event}
                    </span>
                  </p>
                )}

                {evt.kind === "user" && (
                  <p className="text-xs mb-1 text-slate-300">
                    User email:{" "}
                    <span className="font-mono bg-slate-800 px-1 py-0.5 rounded">
                      {evt.email || "unknown"}
                    </span>
                  </p>
                )}

                <pre className="mt-1 text-xs bg-slate-950 border border-slate-800 rounded p-2 overflow-x-auto">
                  {JSON.stringify(stripInternalFields(evt), null, 2)}
                </pre>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}

// Helper to label the event
function labelForEvent(evt: NmtEvent): string {
  switch (evt.kind) {
    case "generic":
      return "NMT Generic Webhook";
    case "transaction":
      return "NMT Transaction";
    case "user":
      return "NMT User Webhook";
    case "test":
      return "NMT Test Webhook";
    default:
      return "NMT Event";
  }
}

// Format timestamp nicely
function formatTimestamp(ts: string) {
  try {
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return ts;
    return d.toLocaleString();
  } catch {
    return ts;
  }
}

// Remove redundant fields before JSON.stringify, if you want
function stripInternalFields(evt: NmtEvent): any {
  const { receivedAt, ...rest } = evt;
  return rest;
}
