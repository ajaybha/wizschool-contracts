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
      gas: 12000000,
      blockGasLimit: 0x00000fffffffff,
      allowUnlimitedContractSize: true
    },
    localhost: {
      chainId: 31337,
      url: node_url('localhost'),
      allowUnlimitedContractSize: true
    },
    testnet: {
      chainId: 13473,
      url: node_url('testnet'),
      accounts:[
        account_pk('deployer')
      ],
      ignition: {
        maxPriorityFeePerGas:2_000_000_000n, // 20 gwei
        maxFeePerGasLimit:50_00_000_000n, // 50 gwei
      }
    }
  },
  etherscan: {
    apiKey: ethscan_key("testnet")
  }
  

};

export default config;
