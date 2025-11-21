"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { PropsWithChildren, useMemo } from "react";
import { WagmiProvider, http } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getDefaultConfig, RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit";

const wcProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo";
const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

const transports: Record<number, ReturnType<typeof http>> = {
  [baseSepolia.id]: http(
    alchemyKey ? `https://base-sepolia.g.alchemy.com/v2/${alchemyKey}` : "https://sepolia.base.org"
  ),
};

const wagmiConfig = getDefaultConfig({
  appName: "Carbon Marketplace",
  projectId: wcProjectId,
  chains: [baseSepolia],
  transports,
  ssr: true,
});

export default function Web3Providers({ children }: PropsWithChildren) {
  const queryClient = useMemo(() => new QueryClient(), []);
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={lightTheme({ overlayBlur: 'small' })}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
