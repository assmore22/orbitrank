import type { Metadata } from "next";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "./globals.css";
import { Providers } from "./providers";
import { ToastProvider } from "@/components/Tx";
import { Shell } from "@/components/Shell";

config.autoAddCss = false;

export const metadata: Metadata = {
  title: "OrbitRank - Open-Source Contribution Reputation Orbit",
  description: "AI-reviewed open-source contribution reputation protocol on GenLayer Studionet.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <ToastProvider>
            <Shell>{children}</Shell>
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
