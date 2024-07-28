# Wizschool Contracts
This project is part of the Wizschool solution template (for Immutable zkEVM) covering a dApp for minting Non Fungible Token, backed up by a custom API backend and set of smart contracts.

1. [Wizschool smart contracts](https://github.com/ajaybha/wizschool-contracts) ** This project ** 
2. [Wizschool API backend](https://github.com/ajaybha/wizschool-api) 
3. [Wizschool web application](https://github.com/ajaybha/wizschool-web) 

This project covers the required smart contracts for the Wizschool solution template. It has the required smart contracts, tests for the contracts,  Hardhat Ignition modules that deploys the contracts and custom hardhat tasks and util functions. 

Before building this project locally, you will need to have `nodejs` and a package manager `npm`, `pnpm` or `yarn` installed. The deployment instructions below have been tested with WSL2 on windows.

Familiarity with `Solidity`, `chai/mocha` and `hardhat` is required. 

# Initialize the project
After cloning the repository locally, navigate to the project root directory and execute the following commands from a shell or a terminal window within VSCode. 

> Note: The project is built using node.js along with `hardhat`.

Follow the instructions below to get the project ready

Install the project dependencies by running the 'npm install" command on the project root.
``` shell
npm install
```
After installing all the dependencies, please have a look at the environment configuration (`.env.sample` and the `hardhat.config` and make any adjustments neccessary for your environment. 

You can copy or rename the `.env.sample` to `.env` and work on collecting neccessary details to update the key values. Most of these are required post deployment to run the tests and/or hardhat tasks to interact with the deployed contracts. 

## TODO 
TODO : Explain the minimum neccessary config and environment entries to be updated.

## Run the tests

Before running the tests for the contract, please compile the contracts by using the hardhat compile command. This will automatically generate the typemappings for the contracts which are usefull for writing tests.
``` shell
npx hardhat compile
```

After compile is successfull, run the included tests in the project using the command below
``` shell
npx hardhat test
```

## Other hardhat features
Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.ts
```
# Deploy to localhost 

## Running the hardhat local node

```shell
npx hardhat node
```
Note down the list of static accounts. If using metamask, add the first two accounts in metamask using the private keys.

It is recommended that you create another terminal shell to execute the following steps. This way you wil be able to refer to the hardhat node shell in a side-by-side view.

## Deploying the Wizschool contracts

The base Erc721 contracts from Immutable mandate a royalty receiver allow list to ensure that the royalty features work seamlessly for minting and transfer of tokens through external marketplaces also. 

For the local development, there is a mock-allowlist contract we have created to ensure that the subsequent deployment of the Erc721 derived contracts works well. 

### Deploy the MockAllowList contract 

``` shell
 npx hardhat ignition deploy ignition/modules/MockAllowlist.ts --network localhost
 ```
Note down the deployed address of this contract as it will be requied in subsequent steps. 

### Deploy the Wizschool Broom (Erc721) and SaleMinter (public minter) contracts

The Wizschool Broom contract checks that royalty features are not compromised by other ecosystem players and mandates a standard royalty allowlist contract address to be provided. 

For deploying locally, we will pass on the address of the MockAllowlist contract deployed above. 

Please find the parameters json file under the ignition directory, we have multiple of these, one for each netowrk. Open file for the "local" network and update the "allowList" key to the address of the MockAllowlist contract deployed above. You can also update other parameters as required. 

Since the PrimarySaleMinter internally includes the WizschoolBroom module, we can deploy both of these together from one single command as below

``` shell
npx hardhat ignition deploy ignition/modules/PrimarySaleMinter.ts --network localhost --parameters ignition/param.local.json
```

Please copy the deployed address for the WizschoolBroomErc721 and PrimarySaleMinter contracts. These need to be referenced in the subsequent initializattion steps and also updated in the Wizschool-web application configuration.

### Initialize the Wizschool contracts

The contracts for the Wizschool solution are deployed in the most basic form and features such as minting, sale creation, blacklisting are restricted to certain roles using the AccessRole RBAC. 

The following steps setup the PrimarySaleMinter contract as a "MINTER" for the WizschoolBroomErc721 and then intializes the PrimarySaleMinter contract by creating a new sale event. Custom hardhat tasks have been created to ease this process. You can see list of the hardhat tasks by running "npx hardhat" on your terminal window. 

Before you start, please update the contact addresses copied earlier to the relevant entries in the local .env file. 

#### TODO 
TODO: link to section on the env configuration 

#### Grant minter role permission to PrimarySaleMinter contract

``` shell
npx hardhat wb-grant-mintrole --minter <saleminter_contract_address> --network localhost
```

There are other hardhat tasks for the Wizschool Broom contract (find ones with "wb-***" suffix). These could be used to configure other features that are available for admin-rol (deployer) only such as setting "base URI" for the token metadata retrieval and "contract URI" for retrieving contract specific metadata. 

#### Grant seller role to another user account (account#2)

Note down another account (from list of 20) and use it in the following command. This will grant seller role to the specified account in the PrimarySaleMinter contract

``` shell
npx hardhat ps-grant-seller-role --seller <account_address> --network localhost
```

#### Setting up a token sale

To setup a token sale through the PrimarySaleMinter contract, we need to pass on parameters including start and end time for the sale, token supply available for minting, unit price and per wallet mint limit. 

The start and end time value need to be in seconds since epoch time. One way to get this is to fetch block time from the chain for the most recent minted block. We have written couple of helper tasks for getting block time and coverting unit time to date-time. Use these to generate the parameters values for the start and end time of the sale so they can be passed to the next command as follows

``` shell
npx hardhat block-timestamp --network localhost ## note down the unix timestamp for the recent minted block. This can be used as start-time parameter

npx hardhat toUnixtime --date 'yyyy.mm.dd' --network localhost

npx hardhat ps-config-sale --seller <account_address> --start <start-time> --end <end-time> --supply 10 --price '0.200' --limit 5 --network localhost
``` 
You can check if the sale configuration has been set successfully by running the following task to fetch the config details

``` shell
npx hardhat ps-get-sale --network localhost
```

This completes the configuration for the two contracts. Please keep note of the contract addresses as they will be usefull to setup the webapplication for minting functionality. 
