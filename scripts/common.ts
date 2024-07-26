import {task, types} from "hardhat/config";
import {time} from "@nomicfoundation/hardhat-network-helpers";
import { Signer, BigNumberish  } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";


task("check-balance", "Prints out the balance of your account")
    .setAction(async function(taskArgs, hre:HardhatRuntimeEnvironment) {        
        const [deployer] = await hre.ethers.getSigners();        
        console.log(`Account balance for ${deployer.getAddress()}:${await hre.ethers.getDefaultProvider().getBalance(deployer.getAddress())}`);
    });

task("block-timestamp", "prints the current block timestamp")
    .setAction(async function(taskArgs, hre:HardhatRuntimeEnvironment) {
        const blockTime = await time.latest();
        const blockNumber = await time.latestBlock();
        console.log(`Last 
            block#:${blockNumber} 
            blockTimestamp:${blockTime}`);
    });
task("toDatetime", "prints datetime for unix timestamp")
    .addParam("unixTime", "unix timestamp in seconds")
    .setAction(async function(taskArgs, hre:HardhatRuntimeEnvironment) {
        const unix_t: number = (taskArgs.unixTime) ? taskArgs.unixTime : 0;
        const sys_t: Date = new Date(unix_t * 1000);
        console.log(`Unix time:${unix_t} Datetime:${sys_t}`);
    });

task("toUnixtime", "prints unix time")
    .addOptionalParam("date", "date in yyyy.mm.dd", "", types.string)
    .setAction(async function(taskArgs, hre:HardhatRuntimeEnvironment) {
        const date_s: string = (taskArgs.date) ? taskArgs.date : 0;
        const date_t: Date = new Date(date_s);
        console.log(`Date:${date_t} Unix:${Math.floor(date_t.getTime()/1000)}`);
    });
