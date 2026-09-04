/**
 * Helper to dynamically load Midtrans SNAP JS and open the payment popup.
 */

declare global {
  interface Window {
    snap?: {
      embed: (token: string, options: { embedId: string; onSuccess?: (result: Record<string, unknown>) => void; onPending?: (result: Record<string, unknown>) => void; onClose?: () => void; onError?: (err: Record<string, unknown>) => void }) => void;
      pay: (token: string, options: { onSuccess?: (result: Record<string, unknown>) => void; onPending?: (result: Record<string, unknown>) => void; onClose?: () => void; onError?: (err: Record<string, unknown>) => void }) => void;
    };
  }
}

let scriptLoading: Promise<void> | null = null;

const SANDBOX_URL = "https://app.sandbox.midtrans.com/snap/snap.js";
const PRODUCTION_URL = "https://app.midtrans.com/snap/snap.js";

function loadSnapScript(clientKey: string, isProduction = false): Promise<void> {
  if (window.snap) return Promise.resolve();
  if (scriptLoading) return scriptLoading;

  scriptLoading = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = isProduction ? PRODUCTION_URL : SANDBOX_URL;
    script.setAttribute("data-client-key", clientKey);
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Gagal memuat Midtrans SNAP."));
    document.head.appendChild(script);
  });

  return scriptLoading;
}

export interface SnapCallbacks {
  onSuccess?: (result: Record<string, unknown>) => void;
  onPending?: (result: Record<string, unknown>) => void;
  onClose?: () => void;
  onError?: (err: Record<string, unknown>) => void;
}

/**
 * Open Midtrans SNAP payment popup.
 * @param token - snap_token from backend
 * @param clientKey - Midtrans client key
 * @param callbacks - event handlers
 */
export async function openSnapPayment(
  token: string,
  clientKey: string,
  callbacks: SnapCallbacks,
): Promise<void> {
  await loadSnapScript(clientKey);

  if (!window.snap) {
    throw new Error("Midtrans SNAP tidak tersedia.");
  }

  window.snap.pay(token, {
    onSuccess: callbacks.onSuccess,
    onPending: callbacks.onPending,
    onClose: callbacks.onClose,
    onError: callbacks.onError,
  });
}
