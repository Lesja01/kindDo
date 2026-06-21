import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { BottomNav } from "@/components/layout/bottom-nav";

export const metadata: Metadata = {
  title: "KindDo",
  description: "Dreams become stories.",
  applicationName: "KindDo",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "KindDo",
    statusBarStyle: "default"
  }
};

export const viewport: Viewport = {
  themeColor: "#FAF8F4"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <main className="mx-auto min-h-dvh w-full max-w-[480px] bg-background pb-24 shadow-[0_0_60px_rgba(31,41,55,0.12)] ring-1 ring-white/70">{children}</main>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
