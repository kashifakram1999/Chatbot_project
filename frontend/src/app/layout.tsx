import type { Metadata } from "next";
import "./globals.css";
import SiteNavbar from "@/components/SiteNavbar"; // <-- default import

export const metadata: Metadata = {
  title: "Bronn Chat",
  description: "Character-themed assistant",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-dvh">
        <div className="min-h-dvh bg-parchment-noise/[.02]">
          <SiteNavbar />
          <main className="mx-auto max-w-6xl px-4 pb-12 pt-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
