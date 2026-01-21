// hardhat.config.cjs
const path = require("path");
process.env.TS_NODE_PROJECT = path.resolve(__dirname, "tsconfig.hardhat.json");

require("@nomicfoundation/hardhat-toolbox");
require("dotenv/config");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    cronosTestnet: {
      url: process.env.CRONOS_TESTNET_RPC || "https://evm-t3.cronos.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 338,
    },
    hardhat: { chainId: 1337 },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};