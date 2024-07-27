import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import {BigNumber} from "@ethersproject/bignumber";
import MockAllowlistModule from "./MockAllowlist";

const COLLECTION_NAME:string = "Wizschool Broom for Wizards";
const SYMBOL:string = "WBW";
const BASE_URI:string = "https://ajaybha.github.io/";
const CONTRACT_URI:string = "https://ajaybha.github.io/";
//const ALLOW_LIST:string = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const ALLOW_LIST_TESTNET:string = "0x6b969FD89dE634d8DE3271EbE97734FEFfcd58eE";
const FEE_NUMERATOR = "5";


const WizschoolBroomModule = buildModule("WizschoolBroomModule", (m) => {

    /*
    Instead of named accounts, we get the configured accounts through the getAccount method
    */
    const owner = m.getAccount(0); // from the hardhat config,network section [accounts]
    const royaltyReceiver = m.getAccount(1);
    
    /*
    Get parameters from the param file
    */
    const collectionName = m.getParameter("name", COLLECTION_NAME);
    const collectionSymbol = m.getParameter("symbol", SYMBOL);
    const baseUri = m.getParameter("baseURI", BASE_URI);
    const contractURI = m.getParameter("contractURI", CONTRACT_URI);
    //const allowList = m.getParameter("allowList",ALLOW_LIST );
    const allowList = m.getParameter("allowList",ALLOW_LIST_TESTNET );
    const feeNumerator = m.getParameter("feeNumerator",FEE_NUMERATOR );

    console.log(`Parameters read
        name:${collectionName.defaultValue}
        symbol:${collectionSymbol.defaultValue}
        baseUri:${baseUri.defaultValue}
        contractUri:${contractURI.defaultValue}
        allowList:${allowList.defaultValue}
        feeNumerator:${feeNumerator.defaultValue}`
        );
    const wizschoolBroom = m.contract("WizschoolBroomERC721", [
        owner,
        collectionName,
        collectionSymbol,
        baseUri,
        contractURI,
        allowList,
        royaltyReceiver,
        feeNumerator
    ]);
    return { wizschoolBroom};
});

export default WizschoolBroomModule;