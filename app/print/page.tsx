"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  ChangeEvent,
} from "react";

// ==== Types ====

type ApiMenu = {
  starter?: string | null;
  salad?: string | null;
  mainCourse?: string | null;
  localSoup?: string | null;
  swallow?: string | null;
  dessert?: string | null;
  afters?: string | null;
  riceType?: string | null;
  protein?: string | null;
  updatedAt?: string;
};

type ApiUser = {
  id: string;
  name: string;
  username: string;
  email?: string | null;
  attendance?: string | null;
  seat?: string | null;
  printed?: boolean;
  printedAt?: string | null;
  token?: string;
  submittedAt?: string;
  updatedAt?: string;
  menu?: ApiMenu;
};

type GetResponse = {
  status: boolean;
  message: string;
  data?: ApiUser;
};

type PrintResponse = {
  status: boolean;
  alreadyPrinted: boolean;
  message: string;
  data?: ApiUser;
};

type ScreenState = "scanning" | "success" | "error";

// ==== ESC/POS width commands ====

const ESC_POS_WIDTH_COMMANDS: Record<string, Uint8Array> = {
  "104mm": Uint8Array.from([0x1d, 0x57, 0x40, 0x03]),
  "72mm": Uint8Array.from([0x1d, 0x57, 0x40, 0x02]),
  "40mm": Uint8Array.from([0x1d, 0x57, 0x40, 0x01]),
  "8mm": Uint8Array.from([0x1d, 0x57, 0x40, 0x00]),
};

const TICKET_WIDTH_MM = 72;

// HTML ticket (for reference only)
function buildTicketHtml(user: ApiUser): string {
  const safeName = user.name ?? "Guest";
  const safeSeat = user.seat ? `Seat: ${user.seat}` : "Seat: Unassigned";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          @page {
            size: ${TICKET_WIDTH_MM}mm auto;
            margin: 4mm;
          }
          body {
            margin: 0;
            padding: 0;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
            background: #ffffff;
          }
          .ticket {
            width: 100%;
            text-align: center;
          }
          .title {
            font-size: 12pt;
            font-weight: 600;
            margin-bottom: 6pt;
          }
          .name {
            font-size: 16pt;
            font-weight: 700;
            margin-bottom: 4pt;
          }
          .seat {
            font-size: 14pt;
            margin-bottom: 8pt;
          }
          .footer {
            font-size: 8pt;
            color: #555;
            margin-top: 4pt;
          }
        </style>
      </head>
      <body>
        <div class="ticket">
          <div class="title">Thanksgiving Service</div>
          <div class="name">${safeName}</div>
          <div class="seat">${safeSeat}</div>
          <div class="footer">Highly Esteemed Pastor Kayode Adesina</div>
        </div>
      </body>
    </html>
  `;
}

// Plain text version for ESC/POS printing
function buildTicketText(user: ApiUser): string {
  const safeName = user.name ?? "Guest";
  const safeSeat = user.seat ? `Seat: ${user.seat}` : "Seat: Unassigned";

  return [
    "Thanksgiving Service",
    "",
    `Name: ${safeName}`,
    safeSeat,
    "",
    "Highly Esteemed Pastor Kayode Adesina",
  ].join("\n");
}

// ==== Helper: concat Uint8Array chunks ====

function concatUint8Arrays(arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

// ==== Main Component ====

export default function ScanPage() {
  // Screen state
  const [screen, setScreen] = useState<ScreenState>("scanning");
  const [loading, setLoading] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [apiMessage, setApiMessage] = useState("");
  const [apiUser, setApiUser] = useState<ApiUser | null>(null);
  const [scanningLocked, setScanningLocked] = useState(false);

  // Scanner input state (USB scanner acts as keyboard)
  const [buffer, setBuffer] = useState("");
  const [lastCode, setLastCode] = useState("");
  const debounceRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Printer state (WebUSB)
  const [device, setDevice] = useState<any | null>(null);
  const [ifaceNum, setIfaceNum] = useState<number | null>(null);
  const [epNum, setEpNum] = useState<number | null>(null);
  const [printerStatus, setPrinterStatus] = useState<string>("No printer selected");
  const [ticketWidth, setTicketWidth] = useState<"104mm" | "72mm" | "40mm" | "8mm">(
    "72mm"
  );

  // Auto-focus scanner input when on scanning screen
  useEffect(() => {
    if (screen === "scanning") {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [screen]);

  // Reset state (similar to resetScanner)
  const resetScanner = useCallback(() => {
    setScreen("scanning");
    setLoading(false);
    setPrinting(false);
    setApiMessage("");
    setApiUser(null);
    setScanningLocked(false);
    setBuffer("");
    setLastCode("");

    if (debounceRef.current) clearTimeout(debounceRef.current);

    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  // GET user after scan
  const handleBarCodeScanned = useCallback(
    async (data: string) => {
      if (scanningLocked || loading) return;

      setScanningLocked(true);
      setLoading(true);

      try {
        const res = await fetch(
          `https://pcdl.co/api/nmt/pka-thanksgivingservice?token=${encodeURIComponent(
            data
          )}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "x-api-key":
                "sfWryh0mscQzn0TcFvdz4smp8abRSZLlMo1qpK7UQNoWAw30A9yNbRjL0RMUS741",
            },
          }
        );

        const json = (await res.json()) as GetResponse;

        if (json.status && json.data) {
          setApiUser(json.data);
          setApiMessage(json.message || "Success");
          setScreen("success");
        } else {
          setApiMessage(json.message || "Ticket not found.");
          setScreen("error");
        }
      } catch (e) {
        setApiMessage("Network error.");
        setScreen("error");
      } finally {
        setLoading(false);
      }
    },
    [scanningLocked, loading]
  );

  // USB scanner input (debounced)
  const handleScannerChange = (e: ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setBuffer(text);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      setLastCode(text);
      setBuffer("");
      if (text.length > 0) handleBarCodeScanned(text);
      requestAnimationFrame(() => inputRef.current?.focus());
    }, 130);
  };

  // ==== WebUSB: select printer (triggered by printer icon/button) ====

  const handleSelectPrinter = async () => {
    try {
      if (typeof navigator === "undefined" || !(navigator as any).usb) {
        alert("WebUSB is not supported in this browser/environment.");
        return;
      }

      const selectedDevice = await (navigator as any).usb.requestDevice({
        filters: [], // show all WebUSB devices; you pick the thermal printer
      });

      await selectedDevice.open();

      if (selectedDevice.configuration == null) {
        await selectedDevice.selectConfiguration(1);
      }

      const config = selectedDevice.configurations[0];

      let foundInterfaceNumber: number | null = null;
      let foundEndpointNumber: number | null = null;

      outer: for (const iface of config.interfaces) {
        const endpoints = iface.alternate.endpoints || [];
        for (const ep of endpoints) {
          if (ep.direction === "out") {
            foundInterfaceNumber = iface.interfaceNumber;
            foundEndpointNumber = ep.endpointNumber;
            break outer;
          }
        }
      }

      if (foundInterfaceNumber === null || foundEndpointNumber === null) {
        throw new Error("Could not find an OUT endpoint on this device.");
      }

      await selectedDevice.claimInterface(foundInterfaceNumber);

      setDevice(selectedDevice);
      setIfaceNum(foundInterfaceNumber);
      setEpNum(foundEndpointNumber);

      setPrinterStatus(
        `Printer: vendorId=${selectedDevice.vendorId}, productId=${selectedDevice.productId}, interface=${foundInterfaceNumber}, endpoint=${foundEndpointNumber}`
      );
    } catch (err: any) {
      console.error(err);
      setPrinterStatus("Failed to select printer: " + err.message);
    } finally {
      // 🔑 Ensure scanner input regains focus after printer selection
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  };

  const handleDisconnectPrinter = async () => {
    if (!device) return;
    try {
      await device.close();
      setDevice(null);
      setIfaceNum(null);
      setEpNum(null);
      setPrinterStatus("No printer selected");
    } catch (err: any) {
      console.error(err);
      setPrinterStatus("Error disconnecting printer: " + err.message);
    } finally {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  };

  // ==== Print flow ====

  const handlePrint = useCallback(async () => {
    if (!apiUser || printing) return;

    if (!device || epNum == null) {
      alert("No printer selected. Please select a printer first.");
      return;
    }

    const token = apiUser.token;
    if (!token) {
      setApiMessage("Missing print token.");
      return;
    }

    setPrinting(true);
    try {
      // 1. Call your API to register the print
      const res = await fetch(
        "https://pcdl.co/api/nmt/pka-thanksgivingservice/print",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key":
              "sfWryh0mscQzn0TcFvdz4smp8abRSZLlMo1qpK7UQNoWAw30A9yNbRjL0RMUS741",
          },
          body: JSON.stringify({ token }),
        }
      );

      const json = (await res.json()) as PrintResponse;
      setApiMessage(json.message || "");

      // 2. Build ESC/POS command + text and send to selected printer via WebUSB
      const encoder = new TextEncoder();

      const reset = Uint8Array.from([0x1b, 0x40]); // ESC @
      const widthCmd = ESC_POS_WIDTH_COMMANDS[ticketWidth]; // e.g. 72mm
      const text = encoder.encode(buildTicketText(apiUser));
      const lineFeeds = Uint8Array.from([0x0a, 0x0a, 0x0a]); // 3x LF
      const cut = Uint8Array.from([0x1d, 0x56, 0x00]); // GS V 0 (full cut)

      const data = concatUint8Arrays([reset, widthCmd, text, lineFeeds, cut]);

      await device.transferOut(epNum, data);

      setApiMessage((prev) =>
        prev ? `${prev} (Ticket sent to printer)` : "Ticket sent to printer."
      );
    } catch (err) {
      console.error(err);
      setApiMessage("Print error.");
    } finally {
      setPrinting(false);
    }
  }, [apiUser, printing, device, epNum, ticketWidth]);

  // ==== UI RENDERING ====

  // SCANNING state
  if (screen === "scanning") {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#020617",
          color: "#e5e7eb",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        {/* Hidden scanner input */}
        <input
          ref={inputRef}
          value={buffer}
          onChange={handleScannerChange}
          autoFocus
          style={{
            position: "absolute",
            top: -100,
            left: -100,
            width: 200,
            height: 40,
            opacity: 0,
            zIndex: -1,
          }}
        />

        <div
          style={{
            border: "2px solid rgba(252, 233, 106, 0.4)",
            borderRadius: 16,
            width: 320,
            height: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
          }}
        >
          <span style={{ color: "#FCE96A" }}>Scan QR / Barcode now…</span>
        </div>

        {loading ? (
          <div style={{ marginBottom: 8 }}>Processing…</div>
        ) : (
          <div style={{ marginBottom: 8 }}>Waiting for scan…</div>
        )}

        {!!lastCode && (
          <div style={{ fontSize: 12, color: "#9ca3af" }}>
            Last: <span style={{ fontFamily: "monospace" }}>{lastCode}</span>
          </div>
        )}

        <div
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 8,
          }}
        >
          {/* Printer select icon/button */}
          <button
            onClick={handleSelectPrinter}
            title="Select printer"
            style={{
              background: "transparent",
              border: "1px solid #e5e7eb",
              borderRadius: "999px",
              padding: "6px 12px",
              color: "#e5e7eb",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span role="img" aria-label="printer">
              🖨️
            </span>
            <span style={{ fontSize: 12 }}>Select Printer</span>
          </button>

          <div style={{ fontSize: 10, maxWidth: 220, textAlign: "right" }}>
            {printerStatus}
          </div>

          <div style={{ fontSize: 10 }}>
            Width:&nbsp;
            <select
              value={ticketWidth}
              onChange={(e) =>
                setTicketWidth(
                  e.target.value as "104mm" | "72mm" | "40mm" | "8mm"
                )
              }
              style={{
                backgroundColor: "#020617",
                color: "#e5e7eb",
                borderRadius: 999,
                border: "1px solid #e5e7eb",
                padding: "2px 8px",
                fontSize: 10,
              }}
            >
              <option value="104mm">104mm</option>
              <option value="72mm">72mm</option>
              <option value="40mm">40mm</option>
              <option value="8mm">8mm</option>
            </select>
          </div>

          {device && (
            <button
              onClick={handleDisconnectPrinter}
              style={{
                background: "transparent",
                border: "1px solid #f97373",
                borderRadius: "999px",
                padding: "4px 10px",
                color: "#fca5a5",
                cursor: "pointer",
                fontSize: 10,
              }}
            >
              Disconnect Printer
            </button>
          )}
        </div>
      </div>
    );
  }

  const isPrinted = apiUser?.printed;

  // SUCCESS state
  if (screen === "success") {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#020617",
          color: "#e5e7eb",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: 24,
          paddingTop: 60,
        }}
      >
        <div
          style={{
            fontSize: 48,
            marginBottom: 16,
          }}
        >
          ✅
        </div>

        <h1 style={{ color: "#FCE96A", fontSize: 26, marginBottom: 8 }}>
          {isPrinted ? "Already Printed" : "Ready to Print"}
        </h1>

        <p style={{ textAlign: "center", marginBottom: 16 }}>{apiMessage}</p>

        {apiUser && (
          <div
            style={{
              width: "100%",
              maxWidth: 400,
              padding: 16,
              backgroundColor: "rgba(255,255,255,0.05)",
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.15)",
              marginBottom: 20,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 20, color: "#FCE96A", marginBottom: 4 }}>
              {apiUser.name}
            </div>
            <div style={{ fontSize: 14, marginBottom: 4 }}>
              @{apiUser.username}
            </div>
            {apiUser.seat && (
              <div style={{ fontSize: 14 }}>Seat: {apiUser.seat}</div>
            )}
          </div>
        )}

        {!isPrinted && (
          <button
            onClick={handlePrint}
            disabled={printing}
            style={{
              backgroundColor: "#FBBF24",
              color: "#111",
              padding: "10px 22px",
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
              marginBottom: 12,
              fontWeight: 600,
            }}
          >
            {printing ? "Printing…" : "Print Ticket"}
          </button>
        )}

        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 10,
          }}
        >
          <button
            onClick={resetScanner}
            style={{
              padding: "10px 22px",
              borderRadius: 999,
              border: "1px solid #e5e7eb",
              background: "transparent",
              color: "#e5e7eb",
              cursor: "pointer",
            }}
          >
            Scan Another
          </button>

          <button
            onClick={() => {
              window.location.href = "/";
            }}
            style={{
              padding: "10px 22px",
              borderRadius: 999,
              border: "1px solid #e5e7eb",
              background: "transparent",
              color: "#e5e7eb",
              cursor: "pointer",
            }}
          >
            Home
          </button>
        </div>
      </div>
    );
  }

  // ERROR state
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#020617",
        color: "#e5e7eb",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: 24,
        paddingTop: 60,
      }}
    >
      <div
        style={{
          fontSize: 48,
          marginBottom: 16,
        }}
      >
        ❌
      </div>

      <h1 style={{ color: "#FCE96A", fontSize: 26, marginBottom: 8 }}>
        Unable to Process
      </h1>

      <p style={{ textAlign: "center", marginBottom: 16 }}>{apiMessage}</p>

      {apiUser && (
        <div
          style={{
            width: "100%",
            maxWidth: 400,
            padding: 16,
            backgroundColor: "rgba(255,255,255,0.05)",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.15)",
            marginBottom: 20,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 20, color: "#FCE96A", marginBottom: 4 }}>
            {apiUser.name}
          </div>
          <div style={{ fontSize: 14 }}>@{apiUser.username}</div>
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: 12,
          marginTop: 10,
        }}
      >
        <button
          onClick={resetScanner}
          style={{
            padding: "10px 22px",
            borderRadius: 999,
            border: "1px solid #e5e7eb",
            background: "transparent",
            color: "#e5e7eb",
            cursor: "pointer",
          }}
        >
          Try Again
        </button>

        <button
          onClick={() => {
            window.location.href = "/";
          }}
          style={{
            padding: "10px 22px",
            borderRadius: 999,
            border: "1px solid #e5e7eb",
            background: "transparent",
            color: "#e5e7eb",
            cursor: "pointer",
          }}
        >
          Home
        </button>
      </div>
    </div>
  );
}
