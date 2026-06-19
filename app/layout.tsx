import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { BottomNav } from "@/components/layout/bottom-nav";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

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
          <LanguageSwitcher />
          <main className="mx-auto min-h-dvh w-full max-w-[480px] pb-24">{children}</main>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
