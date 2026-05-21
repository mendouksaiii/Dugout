import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { xlayer, xlayerTestnet } from "./chains";

export const wagmiConfig = createConfig({
  chains: [xlayerTestnet, xlayer],
  connectors: [
    injected(), // picks up OKX Wallet, MetaMask, Rabby, etc.
  ],
  transports: {
    [xlayerTestnet.id]: http(),
    [xlayer.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
