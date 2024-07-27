import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ignition-ethers";

// import custom tasks
import "./scripts/common";
import "./scripts/wizschool-tasks";
import "./scripts/saleminter-tasks.ts";
import { account_pk, ethscan_key, node_url } from "./utils/network";

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.19",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          }
        }
      },
      {
        version: "0.8.24",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          }
        }
      }
    ],
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId:1337,
      gas: 12000000,
      blockGasLimit: 0x00000fffffffff,
      allowUnlimitedContractSize: true,
      ignition: {
        maxPriorityFeePerGas:20_000_000_000n, // 20 gwei
        maxFeePerGasLimit:1000_000_000_000n, // 1000 gwei
      }
    },
    localhost: {
      chainId: 1337,
      url: node_url('localhost'),
      allowUnlimitedContractSize: true,
      ignition: {
        maxPriorityFeePerGas:20_000_000_000n, // 20 gwei
        maxFeePerGasLimit:1000_000_000_000n, // 1000 gwei
      }
    },
    testnet: {
      chainId: 13473,
      url: node_url('testnet'),
      accounts:[
        account_pk('deployer'), account_pk('royalty')
      ],
      ignition: {
        maxPriorityFeePerGas: 10_000_000_000n, // 10 gwei
        maxFeePerGasLimit:100_000_000_000n, // 100 gwei
      }
    }
  },
  etherscan: {
    apiKey: {
      immutabletestnet: ethscan_key("testnet")
    },
    customChains: [
      {
        network: "immutabletestnet",
        chainId: 13473,
        urls: {
          apiURL: "https://rpc.testnet.immutable.com/",
          browserURL: "https://explorer.testnet.immutable.com/"
        }
      }
    ]
  }
  

};

export default config;
