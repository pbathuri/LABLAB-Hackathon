import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../.env") });
dotenv.config();

function baseSepoliaRpc(): string {
  const explicit = process.env.BASE_SEPOLIA_RPC?.trim();
  if (explicit) return explicit;
  const alchemy = process.env.ALCHEMY_API_KEY?.trim();
  if (alchemy) return `https://base-sepolia.g.alchemy.com/v2/${alchemy}`;
  return "https://sepolia.base.org";
}

function sepoliaRpc(): string {
  const explicit =
    process.env.SEPOLIA_RPC_URL?.trim() || process.env.SEPOLIA_RPC?.trim();
  if (explicit) return explicit;
  const alchemy = process.env.ALCHEMY_API_KEY?.trim();
  if (alchemy) return `https://eth-sepolia.g.alchemy.com/v2/${alchemy}`;
  return "https://ethereum-sepolia-rpc.publicnode.com";
}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    "base-sepolia": {
      url: baseSepoliaRpc(),
      chainId: 84532,
      accounts: process.env.DEPLOYER_PRIVATE_KEY
        ? [process.env.DEPLOYER_PRIVATE_KEY]
        : [],
    },
    sepolia: {
      url: sepoliaRpc(),
      chainId: 11155111,
      accounts: process.env.DEPLOYER_PRIVATE_KEY
        ? [process.env.DEPLOYER_PRIVATE_KEY]
        : process.env.AGENT_PRIVATE_KEY
          ? [process.env.AGENT_PRIVATE_KEY]
          : [],
      gas: "auto",
      gasPrice: "auto",
    },
    "arc-testnet": {
      url: process.env.ARC_TESTNET_RPC_URL || "https://rpc.testnet.arc.network",
      chainId: 5042002,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    "arc-mainnet": {
      url: process.env.ARC_MAINNET_RPC || "https://mainnet-rpc.arc.dev",
      chainId: 5042001,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: {
      "base-sepolia": process.env.BASESCAN_API_KEY || "",
      sepolia: process.env.ETHERSCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "base-sepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org",
        },
      },
    ],
  },
  paths: {
    sources: "./src",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
