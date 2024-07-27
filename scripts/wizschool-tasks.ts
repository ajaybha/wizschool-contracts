import {task, types} from "hardhat/config";
import {time} from "@nomicfoundation/hardhat-network-helpers";
import { Signer, BigNumberish  } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { contract_addr } from "../utils/network";


// for type-safe interactions with smart contract, import the
// generated types from smart contracts
import { WizschoolBroomERC721 } from "../typechain-types";

const contractName = "WizschoolBroomERC721";
const defaultContractAddr = "";


function getContractAddress(networkName:string, contractPrefix:string) : string {
    return (contract_addr(contractPrefix, networkName)) ? contract_addr(contractPrefix, networkName) : defaultContractAddr;
}

task("wb-grant-mintrole", "set the minter role to given address")
    .addParam("minter", "the address of the minter")
    .setAction(async function(taskArgs, hre:HardhatRuntimeEnvironment) {
        const [deployer] = await hre.ethers.getSigners();        

        const contractAddr: string = getContractAddress(hre.network.name, "WBW");
        console.log(`Contract Addres:${contractAddr}`);
        const contract: WizschoolBroomERC721 = await hre.ethers.getContractAt(contractName, contractAddr, deployer) as WizschoolBroomERC721;
        // add to minter role
        const minterAddr: string = (taskArgs.minter) ? taskArgs.minter : deployer.address;
        const tx = await contract.grantMinterRole(minterAddr);
        console.log(`Transaction Hash: ${tx.hash}`);
    });

task("wb-revoke-mintrole", "reovke the minter role for given address")
    .addParam("minter", "the address of the minter")
    .setAction(async function(taskArgs, hre:HardhatRuntimeEnvironment) {
        const [deployer] = await hre.ethers.getSigners();        

        const contractAddr: string = getContractAddress(hre.network.name, "WBW");
        const contract: WizschoolBroomERC721 = await hre.ethers.getContractAt(contractName, contractAddr, deployer) as WizschoolBroomERC721;
        // remove from minter role
        const minterAddr: string = (taskArgs.minter) ? taskArgs.minter : deployer.address;
        const tx = await contract.revokeMinterRole(minterAddr);
        console.log(`Transaction Hash: ${tx.hash}`);
    });

task("wb-set-baseuri", "updates the metadata URI endpoint")
    .addParam("uri", "the metadata URI used as base")
    .setAction(async function (taskArgs, hre: HardhatRuntimeEnvironment) {
        const [deployer] = await hre.ethers.getSigners(); 
        const contractAddr: string = getContractAddress(hre.network.name, "WBW");
        const contract: WizschoolBroomERC721 = await hre.ethers.getContractAt(contractName, contractAddr, deployer) as WizschoolBroomERC721;
        // sets the URI
        if (taskArgs.uri) {
            const newUri: string = taskArgs.uri;
            const tx = await contract.setBaseURI(newUri);
            console.log(`Transaction Hash: ${tx.hash}`);
        } else {
            console.log('uri parameter is not specified.');
        }
    });

task("wb-get-baseuri", "gets the metadata URI endpoint")
    .setAction(async function(taskArgs, hre:HardhatRuntimeEnvironment) {
        const [deployer] = await hre.ethers.getSigners(); 
        const contractAddr: string = getContractAddress(hre.network.name, "WBW");
        const contract: WizschoolBroomERC721 = await hre.ethers.getContractAt(contractName, contractAddr, deployer) as WizschoolBroomERC721;

        const baseuri = await contract.baseURI();
        console.log(`baseURI for contract ${contractAddr} is [${baseuri}]`);
    });
task("wb-set-contracturi", "updates the conract metadata URI endpoint")
    .addParam("uri", "the contract metadata URI")
    .setAction(async function (taskArgs, hre: HardhatRuntimeEnvironment) {
        const [deployer] = await hre.ethers.getSigners(); 
        const contractAddr: string = getContractAddress(hre.network.name, "WBW");
        const contract: WizschoolBroomERC721 = await hre.ethers.getContractAt(contractName, contractAddr, deployer) as WizschoolBroomERC721;
        // sets the URI
        if (taskArgs.uri) {
            const newUri: string = taskArgs.uri;
            const tx = await contract.setContractURI(newUri);
            console.log(`Transaction Hash: ${tx.hash}`);
        } else {
            console.log('uri parameter is not specified.');
        }
    });
    task("wb-get-contracturi", "gets the contract metadata URI endpoint")
    .setAction(async function(taskArgs, hre:HardhatRuntimeEnvironment) {
        const [deployer] = await hre.ethers.getSigners(); 
        const contractAddr: string = getContractAddress(hre.network.name, "WBW");
        const contract: WizschoolBroomERC721 = await hre.ethers.getContractAt(contractName, contractAddr, deployer) as WizschoolBroomERC721;

        const cnturi = await contract.contractURI;
        console.log(`contractURI for contract ${contractAddr} is [${cnturi}]`);
    });
