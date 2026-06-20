import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { OfflineStatus } from "@/components/offline-status";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BioTutor ITS",
  description: "An intelligent Biology tutoring system for secondary school students.",
  manifest: "/manifest.json"
};

export const viewport: Viewport = {
  themeColor: "#19a760"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <OfflineStatus />
        {children}
      </body>
    </html>
  );
}
