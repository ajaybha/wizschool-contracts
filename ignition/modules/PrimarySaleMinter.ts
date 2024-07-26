import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import {BigNumber} from "@ethersproject/bignumber";
import WizschoolBroomModule from "./WizschoolBroom";

const PrimarySaleMinterModule = buildModule("PrimarySaleMinterModule", (m) => {
    
    /*
    * reference the dependent modules 
    */
    
    const {wizschoolBroom} = m.useModule(WizschoolBroomModule);
       
    /*
    Instead of named accounts, we get the configured accounts through the getAccount method
    */
    const owner = m.getAccount(0);
    const royaltyReceiver = m.getAccount(1);   
    /*
    Get parameters from the param file
    */


    const primarySaleMinter = m.contract("PrimarySaleMinter", [
        wizschoolBroom
    ]);
    return { primarySaleMinter};
});

export default PrimarySaleMinterModule;