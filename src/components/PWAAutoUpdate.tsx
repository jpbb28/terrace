"use client";

import { useEffect, useState } from "react";

export default function PWAAutoUpdate() {
  const [waitingSW, setWaitingSW] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const pageLoadTime = Date.now();

    navigator.serviceWorker.ready.then((registration) => {
      registration.addEventListener("updatefound", () => {
        const installing = registration.installing;
        if (!installing) return;
        installing.addEventListener("statechange", () => {
          if (
            installing.state === "installed" &&
            navigator.serviceWorker.controller &&
            Date.now() - pageLoadTime > 30_000
          ) {
            setWaitingSW(installing);
          }
        });
      });
    });
  }, []);

  function handleUpdate() {
    if (!waitingSW) return;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      window.location.reload();
    });
    waitingSW.postMessage({ type: "SKIP_WAITING" });
  }

  if (!waitingSW) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-[#2c1810] text-[#faf6f1] px-4 py-3 rounded-xl shadow-lg text-sm whitespace-nowrap">
      <span>A new version is available.</span>
      <button
        onClick={handleUpdate}
        className="bg-[#c45d3e] hover:bg-[#a84d32] text-white px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer"
      >
        Refresh
      </button>
      <button
        onClick={() => setWaitingSW(null)}
        aria-label="Dismiss"
        className="text-[#faf6f1]/50 hover:text-[#faf6f1] transition-colors cursor-pointer"
      >
        ✕
      </button>
    </div>
  );
}
