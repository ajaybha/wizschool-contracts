import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import {BigNumber} from "@ethersproject/bignumber";
import MockAllowlistModule from "./MockAllowlist";

const COLLECTION_NAME:string = "Wizschool Broom for Wizards";
const SYMBOL:string = "WBW";
const BASE_URI:string = "https://ajaybha.github.io/";
const CONTRACT_URI:string = "https://ajaybha.github.io/";
const FEE_NUMERATOR = "5";


const WizschoolBroomModule = buildModule("WizschoolBroomModule", (m) => {
    
    /*
    */
    // when deploying on local network, use a mock contract for allowlist
    const {mockAllowlist} = m.useModule(MockAllowlistModule);

       
    /*
    Instead of named accounts, we get the configured accounts through the getAccount method
    */
    const owner = m.getAccount(0);
    const royaltyReceiver = m.getAccount(1);
    //const owner = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";     
    /*
    Get parameters from the param file
    */
    const collectionName = m.getParameter("name", COLLECTION_NAME);
    const collectionSymbol = m.getParameter("symbol", SYMBOL);
    const baseUri = m.getParameter("baseURI", BASE_URI);
    const contractURI = m.getParameter("contractURI", CONTRACT_URI);
    const feeNumerator = m.getParameter("feeNumerator",FEE_NUMERATOR );

    const wizschoolBroom = m.contract("WizschoolBroomERC721", [
        owner,
        collectionName,
        collectionSymbol,
        baseUri,
        contractURI,
        mockAllowlist,
        royaltyReceiver,
        feeNumerator
    ]);
    return { wizschoolBroom};
});

export default WizschoolBroomModule;