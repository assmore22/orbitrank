"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { useState, type ReactNode } from "react";
import { RainbowKitProvider, getDefaultConfig, darkTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { studionetChain } from "@/lib/studionet";

export const WALLETCONNECT_PROJECT_ID = (process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "").trim();

const config = getDefaultConfig({
  appName: "OrbitRank",
  projectId: WALLETCONNECT_PROJECT_ID || "orbitrank-local-dev",
  chains: [studionetChain],
  ssr: true,
});

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          initialChain={studionetChain}
          theme={darkTheme({ accentColor: "#60A5FA", accentColorForeground: "#0B1020", borderRadius: "large", overlayBlur: "small" })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
