"use client";

import React, { useEffect, useState } from "react";
import { X, Share, PlusSquare, Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "other">("other");
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // 1. Detect if already installed (standalone mode)
    const isStandalone = 
      window.matchMedia("(display-mode: standalone)").matches || 
      (window.navigator as any).standalone || 
      document.referrer.includes("android-app://");

    if (isStandalone) return;

    // 2. Detect Platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);

    if (isIOS) {
      setPlatform("ios");
    } else if (isAndroid) {
      setPlatform("android");
    }

    // 3. Android specific: Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 4. Wait 30 seconds before showing
    const timer = setTimeout(() => {
      const dismissed = localStorage.getItem("pwa-prompt-dismissed");
      if (!dismissed) {
        setIsVisible(true);
      }
    }, 30000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsVisible(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("pwa-prompt-dismissed", "true");
  };

  if (!isVisible) return null;

  return (
    <div className="pwa-prompt-container">
      <div className="pwa-prompt-card">
        <div className="pwa-info">
          <div className="pwa-icon">
            <img src="/icons/icon-192x192.png" alt="Olheiro" />
          </div>
          <div className="pwa-text">
            <h3>Instalar Olheiro</h3>
            <p>Acesse mais rápido direto da tela inicial.</p>
          </div>
        </div>

        <div className="pwa-actions">
          {platform === "android" && deferredPrompt ? (
            <button
              onClick={handleInstallClick}
              className="btn-install"
            >
              <Download size={14} style={{ marginRight: "6px" }} />
              Instalar
            </button>
          ) : platform === "ios" ? (
            <div className="ios-instructions">
              <div className="ios-step">
                <Share size={12} style={{ color: "#3291ff" }} />
                <span>Compartilhar</span>
              </div>
              <div className="ios-substep">
                <span>depois <PlusSquare size={10} /> na Home</span>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: "10px", color: "#666", textAlign: "right" }}>
              Opções do <br /> navegador
            </div>
          )}
          
          <button 
            onClick={handleDismiss}
            className="btn-close"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
