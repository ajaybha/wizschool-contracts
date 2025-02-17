import {task, types} from "hardhat/config";
import {time} from "@nomicfoundation/hardhat-network-helpers";
import { Signer, BigNumberish  } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { contract_addr } from "../utils/network";


// for type-safe interactions with smart contract, import the
// generated types from smart contracts
import { PrimarySaleMinter } from "../typechain-types";


const contractName = "PrimarySaleMinter";
const defaultContractAddr = "";

function getContractAddress(networkName:string, contractPrefix:string) : string {
    return (contract_addr(contractPrefix, networkName)) ? contract_addr(contractPrefix, networkName) : defaultContractAddr;
}

task("ps-grant-seller-role", "set the seller role to given address")
    .addParam("seller", "the address of the seller")
    .setAction(async function(taskArgs, hre:HardhatRuntimeEnvironment) {
        const SELLER_ROLE = hre.ethers.id("SELLER_ROLE");
        const [deployer] = await hre.ethers.getSigners();        

        const contractAddr: string = getContractAddress(hre.network.name, "PSM");
        const contract: PrimarySaleMinter = await hre.ethers.getContractAt(contractName, contractAddr, deployer) as PrimarySaleMinter;
        // add to seller role
        const sellerAddr: string = (taskArgs.seller) ? taskArgs.seller : deployer.address;
        const tx = await contract.grantRole(SELLER_ROLE, sellerAddr);
        console.log(`Transaction Hash: ${tx.hash}`);
    });
task("ps-check-seller-role", "get the seller role")
    .addParam("seller", "the address of the seller")
    .setAction(async function(taskArgs, hre:HardhatRuntimeEnvironment){
        const SELLER_ROLE = hre.ethers.id("SELLER_ROLE");
        const [deployer] = await hre.ethers.getSigners();       
        const contractAddr: string = getContractAddress(hre.network.name, "PSM");
        const contract: PrimarySaleMinter = await hre.ethers.getContractAt(contractName, contractAddr, deployer) as PrimarySaleMinter;

        // check if seller role
        const sellerAddr: string = (taskArgs.seller) ? taskArgs.seller : deployer.address;
        const isSellerRole:boolean = await contract.hasRole(SELLER_ROLE, sellerAddr);
        isSellerRole ? console.log(`The addr:${sellerAddr} is in seller-role`) : console.log(`The addr:${sellerAddr} is not seller-role`);
    });
task("ps-revoke-seller-role", "revoke the seller role for given address")
    .addParam("seller", "the address of the seller")
    .setAction(async function(taskArgs, hre:HardhatRuntimeEnvironment) {
        const SELLER_ROLE = hre.ethers.id("SELLER_ROLE");
        const [deployer] = await hre.ethers.getSigners();        

        const contractAddr: string = getContractAddress(hre.network.name, "PSM");
        const contract: PrimarySaleMinter = await hre.ethers.getContractAt(contractName, contractAddr, deployer) as PrimarySaleMinter;
        // add to seller role
        const sellerAddr: string = (taskArgs.seller) ? taskArgs.seller : deployer.address;
        const tx = await contract.revokeRole(SELLER_ROLE, sellerAddr);
        console.log(`Transaction Hash: ${tx.hash}`);
    });

task("ps-config-sale", "configure the NFT sale")
    .addParam("seller", "the account doing the configuration")
    .addParam("start", "the start time (in secs) from current block")
    .addParam("end", "the end time (in secs) from current block")
    .addParam("supply", "the maximum token supply for sale")
    .addOptionalParam("price", "the unit price of token to mint", "0.200", types.string)
    .addOptionalParam("limit", "max mint allowed per wallet", 10, types.int)
    .setAction(async function(taskArgs, hre:HardhatRuntimeEnvironment) {
        const [deployer] = await hre.ethers.getSigners();        
        // get the sender-signer (from specified address) to invoke the transaction
        const sellerAddr: string = (taskArgs.seller) ? taskArgs.seller : deployer.address;
        const sellerSigner:Signer = await hre.ethers.getSigner(sellerAddr);        
        const contractAddr: string = getContractAddress(hre.network.name, "PSM");
        // contract instantion based on signer-address as invoker
        const contract: PrimarySaleMinter = await 
            hre.ethers.getContractAt(contractName, contractAddr, sellerSigner) as PrimarySaleMinter;
        
        // set the primary sale
        const tx = await contract.setPrimarySaleConfig(
            BigInt(taskArgs.start), 
            BigInt(taskArgs.end),
            BigInt(taskArgs.supply),
            BigInt(hre.ethers.parseEther(taskArgs.price)),
            BigInt(taskArgs.limit));
        console.log(`Tx hash: ${tx.hash}`);
    });
task("ps-get-sale", "Get the details of the private sale")
    .setAction(async function(taskArgs, hre:HardhatRuntimeEnvironment) {
        const [deployer] = await hre.ethers.getSigners();        
        const contractAddr: string = getContractAddress(hre.network.name, "PSM");
        const contract: PrimarySaleMinter = await hre.ethers.getContractAt(contractName, contractAddr, deployer) as PrimarySaleMinter;
        // get the primary sale 
        console.log("getting sale config...");
        const [startTime, endTime,supply, price, maxNFTAllowed] = await contract.saleConfig();
        console.log("printing sale details...");
        console.log(`Private Sale:              
            startTime:${new Date(Number(startTime*1000n))}
            endTime:${new Date(Number(endTime*1000n))}          
            supply:${Number(supply)}            
            unitPrice:${hre.ethers.formatEther(price)}
            waletLimit:${Number(maxNFTAllowed)}`);
        const saleCount = await contract.totalSaleCount();
        console.log(`Total Sales:${(saleCount)}`);        
    });
task("ps-get-sale-by-account", "Get the details of the sale for given address")
    .addParam("address", "the account for which sale data is desired")
    .setAction(async function(taskArgs, hre:HardhatRuntimeEnvironment) {
        const [deployer] = await hre.ethers.getSigners();        
        const contractAddr: string = getContractAddress(hre.network.name, "PSM");
        const contract: PrimarySaleMinter = await hre.ethers.getContractAt(contractName, contractAddr, deployer) as PrimarySaleMinter;
        // get the address for which sales is requested
        const buyerAddr: string = (taskArgs.address) ? taskArgs.address : deployer.address;
        const saleCount = await contract.totalSaleCount();
        console.log(`Total Sales:${saleCount}`); 
        const accountSaleCount = await contract.accountSaleCount(buyerAddr);
        console.log(`Sales for ${buyerAddr} :${accountSaleCount}`);
    });
task("ps-balance", "show balance accumulatd on sale contract")
    .setAction(async function (taskArgs, hre:HardhatRuntimeEnvironment) {
        const [deployer] = await hre.ethers.getSigners();        
        const contractAddr: string = getContractAddress(hre.network.name, "PSM");
        const contract: PrimarySaleMinter = await hre.ethers.getContractAt(contractName, contractAddr, deployer) as PrimarySaleMinter;
        console.log(`Account balance on contract:${await hre.ethers.getDefaultProvider().getBalance(contract.getAddress())}`);
        
    });

task("ps-withdraw", "withdraw the balance to wallet")
    .setAction(async function (taskArgs, hre: HardhatRuntimeEnvironment) {
        const [deployer] = await hre.ethers.getSigners();        
        const contractAddr: string = getContractAddress(hre.network.name, "PSM");
        const contract: PrimarySaleMinter = await hre.ethers.getContractAt(contractName, contractAddr, deployer) as PrimarySaleMinter;
        const tx = await contract.withdraw();
        console.log(`Transaction Hash: ${tx.hash}`);
});