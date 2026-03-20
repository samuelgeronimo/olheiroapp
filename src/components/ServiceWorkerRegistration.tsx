"use client";

import { useEffect } from "react";
import { processQueue } from "@/lib/offlineSync";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      // Register Service Worker
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registered with scope:", registration.scope);
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });

      // Listen for messages from the Service Worker
      const handleMessage = (event: MessageEvent) => {
        if (event.data && event.data.type === "SYNC_UPDATES") {
          processQueue();
        }
      };

      navigator.serviceWorker.addEventListener("message", handleMessage);
      
      // Attempt to process queue on initial load if online
      if (navigator.onLine) {
        processQueue();
      }
      
      // Listen for online events to trigger manual sync
      const handleOnline = () => {
        console.log("App online: Triggering manual sync process.");
        processQueue();
      };
      
      window.addEventListener('online', handleOnline);

      return () => {
        navigator.serviceWorker.removeEventListener("message", handleMessage);
        window.removeEventListener('online', handleOnline);
      };
    }
  }, []);

  return null;
}
