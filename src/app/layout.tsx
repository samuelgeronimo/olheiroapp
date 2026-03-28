import type { Metadata, Viewport } from "next";
import "./globals.css";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import PWAPrompt from "@/components/PWAPrompt";

export const metadata: Metadata = {
  title: "Olheiro - Segurança de Fronteira",
  description: "Monitoramento colaborativo em tempo real para viajantes de fronteira. Evite polícia, receita e pedágio.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Olheiro",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body suppressHydrationWarning className="antialiased">
        <ServiceWorkerRegistration />
        <PWAPrompt />
        {children}
      </body>
    </html>
  );
}
