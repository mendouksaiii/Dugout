import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x" + "0".repeat(64);
const OKLINK_API_KEY = process.env.OKLINK_API_KEY || "";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    xlayerTestnet: {
      url: "https://testrpc.xlayer.tech",
      chainId: 195,
      accounts: [PRIVATE_KEY],
    },
    xlayer: {
      url: "https://rpc.xlayer.tech",
      chainId: 196,
      accounts: [PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      xlayerTestnet: OKLINK_API_KEY,
      xlayer: OKLINK_API_KEY,
    },
    customChains: [
      {
        network: "xlayerTestnet",
        chainId: 195,
        urls: {
          apiURL: "https://www.oklink.com/api/v5/explorer/contract/verify-source-code-plugin/XLAYER_TESTNET",
          browserURL: "https://www.oklink.com/xlayer-test",
        },
      },
      {
        network: "xlayer",
        chainId: 196,
        urls: {
          apiURL: "https://www.oklink.com/api/v5/explorer/contract/verify-source-code-plugin/XLAYER",
          browserURL: "https://www.oklink.com/xlayer",
        },
      },
    ],
  },
};

export default config;
