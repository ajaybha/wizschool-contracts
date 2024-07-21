import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import {ethers } from "hardhat";
import { Signer, BigNumberish  } from "ethers";
import { contracts } from "../typechain-types";

describe ("PrimarySaleMinter Tests", function() {
    let owner:Signer, royaltyAccount:Signer, sellerRole:Signer,  blacklistRole:Signer, otherRole:Signer, tokenReceiver1:Signer, tokenReceiver2:Signer;
    const DEFAULT_ADMIN_ROLE = ethers.ZeroHash;
    // this const is defined as byte32 string in solidity, if it was keccak256 hashed then uncomment the next line 
    // ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
    const MINTER_ROLE = ethers.encodeBytes32String("MINTER_ROLE");
    const SELLER_ROLE = ethers.id("SELLER_ROLE");

    beforeEach(async function() {
        [owner, royaltyAccount, sellerRole, blacklistRole, otherRole, tokenReceiver1, tokenReceiver2] = await ethers.getSigners();
    });

    /*
    We define a fixture to reuse the same setup in every test. We use the loadFixture to run this setup once, snapshot that shate,
    and reset Hardhat Network to that snapshot in every test
    */
   async function deployPrimarySaleMinterLocalFixture() {
    //const wizschoolBroom = await ignition.deploy(WizschoolBroomModule);
    //return {wizschoolBroom};

    // define the input parameters for wizschool broom instantiation
    const name:string = "Wizschool Broom for Wizards";
    const symbol:string = "WBW";
    const baseUri:string = "https://ajaybha.github.io/";
    const contractUri:string = "https://ajaybha.github.io/";
    const feeNumerator = BigInt(5);

    // deploy the mock allowlist contract
    const mockAllowlistFactory = await ethers.getContractFactory("MockAllowlistReceiver");
    const mockAllowlistContract = await mockAllowlistFactory.deploy();

    // deploy the wizschoolbroom contract
    const wizschoolBroomFactory = await ethers.getContractFactory("WizschoolBroomERC721");
    const wizschoolBroomContract = await wizschoolBroomFactory.deploy(
        owner,
        name,
        symbol,
        baseUri,
        contractUri,
        mockAllowlistContract.getAddress(),
        royaltyAccount,
        feeNumerator);

    // deploy the primary sale minter contract
    const primarySaleMinterFactory = await ethers.getContractFactory("PrimarySaleMinter");
    const primarySaleMinterContract = await primarySaleMinterFactory.deploy(wizschoolBroomContract.getAddress());

    return {wizschoolBroomContract, mockAllowlistContract, primarySaleMinterContract, owner, royaltyAccount};

   }

   describe("Deployment", function() {
    it("Should set the owner with DEFAULT ADMIN ROLE", async function() {
        const { primarySaleMinterContract, owner} = await loadFixture(deployPrimarySaleMinterLocalFixture);
        const hasAdminRole = await primarySaleMinterContract.hasRole(DEFAULT_ADMIN_ROLE, owner);
        expect(hasAdminRole).is.true;
    });
    it("Should set the totalSalesCount to zero", async function() {
        const { primarySaleMinterContract} = await loadFixture(deployPrimarySaleMinterLocalFixture);
        expect(await primarySaleMinterContract.totalSaleCount()).to.equal(0);
    });
    it("Should deploy without a MINTER ROLE", async function() {
        const {wizschoolBroomContract, primarySaleMinterContract} = await loadFixture(deployPrimarySaleMinterLocalFixture);
        const hasMintRole = await wizschoolBroomContract.hasRole(MINTER_ROLE, primarySaleMinterContract.getAddress());
        expect(hasMintRole).is.false;
    });
   });
   describe("Seller Role Grants", function() {
    it("Should grant seller-role", async function() {
        const {primarySaleMinterContract} = await loadFixture(deployPrimarySaleMinterLocalFixture);
        let hasSellerRole = await primarySaleMinterContract.hasRole(SELLER_ROLE, owner);
        expect(hasSellerRole).is.false;
        hasSellerRole = await primarySaleMinterContract.hasRole(SELLER_ROLE, sellerRole);
        expect(hasSellerRole).is.false;

        // grant SELLER_ROLE to seller
        let tx = await primarySaleMinterContract.grantRole(SELLER_ROLE, sellerRole);
        await tx.wait();
        hasSellerRole = await primarySaleMinterContract.hasRole(SELLER_ROLE, sellerRole);
        expect(hasSellerRole).is.true;
    });
    it("Should revoke seller-role", async function() {
        const {primarySaleMinterContract} = await loadFixture(deployPrimarySaleMinterLocalFixture);
        let hasSellerRole = await primarySaleMinterContract.hasRole(SELLER_ROLE, sellerRole);
        expect(hasSellerRole).is.false;
        
        // grant SELLER_ROLE to seller
        let tx = await primarySaleMinterContract.grantRole(SELLER_ROLE, sellerRole);
        await tx.wait();
        hasSellerRole = await primarySaleMinterContract.hasRole(SELLER_ROLE, sellerRole);
        expect(hasSellerRole).is.true;

        // revoke SELLER_ROLE from seller
        tx = await primarySaleMinterContract.revokeRole(SELLER_ROLE, sellerRole);
        await tx.wait();
        hasSellerRole = await primarySaleMinterContract.hasRole(SELLER_ROLE, sellerRole);
        expect(hasSellerRole).is.false;
    });
    it("Should fail grant seller-role for non-admin", async function() {
        const {primarySaleMinterContract} = await loadFixture(deployPrimarySaleMinterLocalFixture);
        await expect(primarySaleMinterContract.connect(otherRole).grantRole(SELLER_ROLE, sellerRole)).to.be.reverted;
    });    
   });
   describe("Blacklisting by Seller", function() {
    it("Should fail blacklisting for non-seller role", async function() {
        const {primarySaleMinterContract} = await loadFixture(deployPrimarySaleMinterLocalFixture);
        await expect(primarySaleMinterContract.updateBlacklist(blacklistRole, true)).to.be.reverted;
    });
    it("Should blacklist an account", async function() {
        const {primarySaleMinterContract} = await loadFixture(deployPrimarySaleMinterLocalFixture);
        
        // grant seller_role to seller account
        let tx = await primarySaleMinterContract.grantRole(SELLER_ROLE, sellerRole);
        await tx.wait();

        // call updateBlacklist using seller account to blacklist account
        tx = await primarySaleMinterContract.connect(sellerRole).updateBlacklist(blacklistRole, true);
        let promise = await tx.wait();
        // eventSig: event UpdateBlacklist(address indexed account, bool status); 
        expect(promise).emit(primarySaleMinterContract, "UpdateBlacklist").withArgs(blacklistRole.getAddress(), true);
        expect(await primarySaleMinterContract.blacklist(blacklistRole.getAddress())).is.true;

        // call updateBlacklist to remove the blacklist account
        tx = await primarySaleMinterContract.connect(sellerRole).updateBlacklist(blacklistRole, false);
        promise = await tx.wait();
        // eventSig: event UpdateBlacklist(address indexed account, bool status); 
        expect(promise).emit(primarySaleMinterContract, "UpdateBlacklist").withArgs(blacklistRole.getAddress(), false);
        expect(await primarySaleMinterContract.blacklist(blacklistRole.getAddress())).is.false;

    });
   });
   describe("PrimarySale Setup by Seller", function() {
   
    it("Should fail setup for non-seller role", async function() {
        const {primarySaleMinterContract} = await loadFixture(deployPrimarySaleMinterLocalFixture);        
        let startTime:BigNumberish = BigInt(await time.latest() + 100);
        let endTime:BigNumberish = BigInt(await time.latest() + 10000);
        let supply:BigNumberish = BigInt(1000);
        let unitPrice:BigNumberish = ethers.parseEther("0.200");
        let tokenLimit:BigNumberish = BigInt(5);
    
        await expect( primarySaleMinterContract.setPrimarySaleConfig(
            startTime,
            endTime,
            supply,
            unitPrice,
            tokenLimit
        )).to.be.reverted;
    });
    it("Should setup primary sale", async function(){
        const {primarySaleMinterContract} = await loadFixture(deployPrimarySaleMinterLocalFixture); 
        let startTime:BigNumberish = BigInt(await time.latest() + 100);
        let endTime:BigNumberish = BigInt(await time.latest() + 10000);
        let supply:BigNumberish = BigInt(1000);
        let unitPrice:BigNumberish = ethers.parseEther("0.200");
        let tokenLimit:BigNumberish = BigInt(5);
    
        // grant seller_role to seller account
        let tx = await primarySaleMinterContract.grantRole(SELLER_ROLE, sellerRole);
        await tx.wait();

        // setup primary sale
        tx = await primarySaleMinterContract.connect(sellerRole).setPrimarySaleConfig(
            startTime,
            endTime,
            supply,
            unitPrice,
            tokenLimit
        );
        const promise = await tx.wait();
        // event sig: event SetSaleConfig(uint256 startTime, uint256 endTime, uint256 supply, uint256 price);
        expect(promise).emit(primarySaleMinterContract, "SetSaleConfig").withArgs(
            startTime,
            endTime,
            supply,
            tokenLimit
        );
        const saleConfigFetch = await primarySaleMinterContract.saleConfig();
        expect(saleConfigFetch.startTime).to.equal(startTime);
        expect(saleConfigFetch.endTime).to.equal(endTime);
        expect(saleConfigFetch.supply).to.equal(supply);
        expect(saleConfigFetch.price).to.equal(unitPrice);
        expect(saleConfigFetch.maxNFTAllowed).to.equal(tokenLimit);
    });
   });
   describe("primary sale minting", function() {
    let startTime:BigNumberish, endTime:BigNumberish;
    let supply:BigNumberish = BigInt(1000);
    let unitPrice:BigNumberish = ethers.parseEther("0.200");
    let tokenLimit:BigNumberish = BigInt(5);

    
    it("Should fail when sender is blacklisted", async function() {
        /**********************************************************
         * prep for the test
         **********************************************************/
        const {primarySaleMinterContract, wizschoolBroomContract} = await loadFixture(deployPrimarySaleMinterLocalFixture); 
        startTime = BigInt(await time.latest() + 100);
        endTime = BigInt(await time.latest() + 10000);      
    
        // set the primarysale as minterrole on the erc721 contract
        let tx = await wizschoolBroomContract.grantMinterRole(primarySaleMinterContract.getAddress());
        await tx.wait();

        // grant seller_role to seller account
        tx = await primarySaleMinterContract.grantRole(SELLER_ROLE, sellerRole);
        await tx.wait();

        // setup primary sale
        tx = await primarySaleMinterContract.connect(sellerRole).setPrimarySaleConfig(
            startTime,
            endTime,
            supply,
            unitPrice,
            tokenLimit
        );;
        await tx.wait();

        /**********************************************
         * Test 
         *********************************************/
        // call updateBlacklist using seller account to blacklist account
        tx = await primarySaleMinterContract.connect(sellerRole).updateBlacklist(blacklistRole, true);
        await tx.wait();
        expect(await primarySaleMinterContract.blacklist(blacklistRole.getAddress())).is.true;

        // expect the mint to fail when sender is blacklisted
        await expect(primarySaleMinterContract.connect(blacklistRole).mint(BigInt(1))).to.be.revertedWith("0x1");
    });
    it("Should fail when no current sale ongoing", async function() {
        /**********************************************************
         * prep for the test
         **********************************************************/
        const {primarySaleMinterContract, wizschoolBroomContract} = await loadFixture(deployPrimarySaleMinterLocalFixture); 
        // set the primarysale as minterrole on the erc721 contract
        let tx = await wizschoolBroomContract.grantMinterRole(primarySaleMinterContract.getAddress());
        await tx.wait();
        // grant seller_role to seller account
        tx = await primarySaleMinterContract.grantRole(SELLER_ROLE, sellerRole);
        await tx.wait();

        /**********************************************
         * Test 
         *********************************************/
        // expect the mint to fail as there is no sale ongoing by default
        await expect(primarySaleMinterContract.mint(BigInt(1))).to.be.revertedWith("0x2");

        // setup primary sale in future
        startTime = BigInt(await time.latest() + 500);
        endTime = BigInt(await time.latest() + 10000);  
        tx = await primarySaleMinterContract.connect(sellerRole).setPrimarySaleConfig(
            startTime,
            endTime,
            supply,
            unitPrice,
            tokenLimit
        );;
        await tx.wait();
        // expect the mint to fail as sale is in future
        await expect(primarySaleMinterContract.mint(BigInt(1))).to.be.revertedWith("0x2");

        // setup primary sale in past
        startTime = BigInt(await time.latest() - 10000);
        endTime = startTime + BigInt(5000);  
        tx = await primarySaleMinterContract.connect(sellerRole).setPrimarySaleConfig(
            startTime,
            endTime,
            supply,
            unitPrice,
            tokenLimit
        );;
        await tx.wait();
        // expect the mint to fail as sale is in past
        await expect(primarySaleMinterContract.mint(BigInt(1))).to.be.revertedWith("0x2");
        
    });
    it("Should fail when insufficient token sent", async function() {
        /**********************************************************
         * prep for the test
         **********************************************************/
        const {primarySaleMinterContract, wizschoolBroomContract} = await loadFixture(deployPrimarySaleMinterLocalFixture); 
        // set the primarysale as minterrole on the erc721 contract
        let tx = await wizschoolBroomContract.grantMinterRole(primarySaleMinterContract.getAddress());
        await tx.wait();
        // grant seller_role to seller account
        tx = await primarySaleMinterContract.grantRole(SELLER_ROLE, sellerRole);
        await tx.wait();
        // setup primary sale in current time
        startTime = BigInt(await time.latest() - 500);
        endTime = BigInt(await time.latest() + 10000);  
        tx = await primarySaleMinterContract.connect(sellerRole).setPrimarySaleConfig(
            startTime,
            endTime,
            supply,
            unitPrice,
            tokenLimit
        );
        await tx.wait();
        /**********************************************
         * Test 
         *********************************************/
        // expect the mint to fail as insufficient tokens are passed
        await expect(primarySaleMinterContract.mint(BigInt(1), { value: ethers.parseEther("0.100")})).to.be.revertedWith("0x3");
    });
    it("Should mint single NFT to sender account", async function() {
        /**********************************************************
         * prep for the test
         **********************************************************/
        const {primarySaleMinterContract, wizschoolBroomContract} = await loadFixture(deployPrimarySaleMinterLocalFixture); 
        // set the primarysale as minterrole on the erc721 contract
        let tx = await wizschoolBroomContract.grantMinterRole(primarySaleMinterContract.getAddress());
        await tx.wait();
        // grant seller_role to seller account
        tx = await primarySaleMinterContract.grantRole(SELLER_ROLE, sellerRole);
        await tx.wait();
        // setup primary sale in current time
        startTime = BigInt(await time.latest() - 500);
        endTime = BigInt(await time.latest() + 10000);  
        tx = await primarySaleMinterContract.connect(sellerRole).setPrimarySaleConfig(
            startTime,
            endTime,
            supply,
            unitPrice,
            tokenLimit
        );;
        await tx.wait();

        /**********************************************
         * Test 
         *********************************************/
        const totalSalesBefore:BigNumberish = await primarySaleMinterContract.totalSaleCount();
        const accountSalesBefore:BigNumberish = await primarySaleMinterContract.accountSaleCount(owner);
        const nftReceiverBalanceBefore:BigNumberish = await wizschoolBroomContract.balanceOf(owner);
                
        // expect the mint to succeed
        tx = await primarySaleMinterContract.mint(BigInt(1), { value: ethers.parseEther("0.210")});
        const promise = await tx.wait();

        // check the events being emitted
        // from this contract
        // event sig: event MintToken(address indexed sender, uint256 tokenID);
        expect(promise).to.emit(primarySaleMinterContract, "MintToken").withArgs(owner.getAddress(), BigInt(1));
        // from the wizshcoolBroom Contract
        // event sig: event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
        expect(promise).to.emit(wizschoolBroomContract, "Transfer").withArgs(ethers.ZeroAddress, owner.getAddress(), BigInt(1));
        // other checks
        const totalSalesAfter:BigNumberish = await primarySaleMinterContract.totalSaleCount();
        const accountSalesAfter:BigNumberish = await primarySaleMinterContract.accountSaleCount(owner);
        const nftReceiverBalanceAfter:BigNumberish = await wizschoolBroomContract.balanceOf(owner);

        expect(totalSalesAfter).to.equal(totalSalesBefore + BigInt(1));
        expect(accountSalesAfter).to.equal(accountSalesBefore + BigInt(1));
        expect(nftReceiverBalanceAfter).to.equal(nftReceiverBalanceBefore + BigInt(1));
    });
    it("Should mint 3 NFTs to sender account", async function() {
        /**********************************************************
         * prep for the test
         **********************************************************/
        const {primarySaleMinterContract, wizschoolBroomContract} = await loadFixture(deployPrimarySaleMinterLocalFixture); 
        // set the primarysale as minterrole on the erc721 contract
        let tx = await wizschoolBroomContract.grantMinterRole(primarySaleMinterContract.getAddress());
        await tx.wait();
        // grant seller_role to seller account
        tx = await primarySaleMinterContract.grantRole(SELLER_ROLE, sellerRole);
        await tx.wait();
        // setup primary sale in current time
        startTime = BigInt(await time.latest() - 500);
        endTime = BigInt(await time.latest() + 10000);  
        tx = await primarySaleMinterContract.connect(sellerRole).setPrimarySaleConfig(
            startTime,
            endTime,
            supply,
            unitPrice,
            tokenLimit
        );;
        await tx.wait();

        /**********************************************
         * Test 
         *********************************************/
        const totalSalesBefore:BigNumberish = await primarySaleMinterContract.totalSaleCount();
        const accountSalesBefore:BigNumberish = await primarySaleMinterContract.accountSaleCount(owner);
        const nftReceiverBalanceBefore:BigNumberish = await wizschoolBroomContract.balanceOf(owner);
        var mintCount = 3;        
        // expect the mint to succeed
        for(var i=0; i<mintCount; i++) {
            tx = await primarySaleMinterContract.mint(BigInt(i+1), { value: ethers.parseEther("0.210")});
            await tx.wait();
        }
        
        // other checks
        const totalSalesAfter:BigNumberish = await primarySaleMinterContract.totalSaleCount();
        const accountSalesAfter:BigNumberish = await primarySaleMinterContract.accountSaleCount(owner);
        const nftReceiverBalanceAfter:BigNumberish = await wizschoolBroomContract.balanceOf(owner);

        expect(totalSalesAfter).to.equal(totalSalesBefore + BigInt(mintCount));
        expect(accountSalesAfter).to.equal(accountSalesBefore + BigInt(mintCount));
        expect(nftReceiverBalanceAfter).to.equal(nftReceiverBalanceBefore + BigInt(mintCount));
    });
    it("Should fail to mint more than max-allowed NFTs", async function() {
        /**********************************************************
         * prep for the test
         **********************************************************/
        const {primarySaleMinterContract, wizschoolBroomContract} = await loadFixture(deployPrimarySaleMinterLocalFixture); 
        // set the primarysale as minterrole on the erc721 contract
        let tx = await wizschoolBroomContract.grantMinterRole(primarySaleMinterContract.getAddress());
        await tx.wait();
        // grant seller_role to seller account
        tx = await primarySaleMinterContract.grantRole(SELLER_ROLE, sellerRole);
        await tx.wait();
        // setup primary sale in current time
        startTime = BigInt(await time.latest() - 500);
        endTime = BigInt(await time.latest() + 10000);  
        tx = await primarySaleMinterContract.connect(sellerRole).setPrimarySaleConfig(
            startTime,
            endTime,
            supply,
            unitPrice,
            tokenLimit
        );;
        await tx.wait();

        /**********************************************
         * Test 
         *********************************************/
        const totalSalesBefore:BigNumberish = await primarySaleMinterContract.totalSaleCount();
        const accountSalesBefore:BigNumberish = await primarySaleMinterContract.accountSaleCount(owner);
        const nftReceiverBalanceBefore:BigNumberish = await wizschoolBroomContract.balanceOf(owner);
        var mintCount = tokenLimit;        
        // expect the mint to succeed
        for(var i=0; i<mintCount; i++) {
            tx = await primarySaleMinterContract.mint(BigInt(i+1), { value: ethers.parseEther("0.210")});
            await tx.wait();
        }
        
        // other checks
        const totalSalesAfter:BigNumberish = await primarySaleMinterContract.totalSaleCount();
        const accountSalesAfter:BigNumberish = await primarySaleMinterContract.accountSaleCount(owner);
        const nftReceiverBalanceAfter:BigNumberish = await wizschoolBroomContract.balanceOf(owner);

        expect(totalSalesAfter).to.equal(totalSalesBefore + BigInt(mintCount));
        expect(accountSalesAfter).to.equal(accountSalesBefore + BigInt(mintCount));
        expect(nftReceiverBalanceAfter).to.equal(nftReceiverBalanceBefore + BigInt(mintCount));

        // next mint request expected to fail as tokenLimit exceeded
        await expect(primarySaleMinterContract.mint(mintCount + BigInt(1), { value: ethers.parseEther("0.210")})).to.be.revertedWith("0x4");
    });
    it("Should fail to mint more than supply limit for sale", async function() {
        /**********************************************************
         * prep for the test
         **********************************************************/
        const {primarySaleMinterContract, wizschoolBroomContract} = await loadFixture(deployPrimarySaleMinterLocalFixture); 
        // set the primarysale as minterrole on the erc721 contract
        let tx = await wizschoolBroomContract.grantMinterRole(primarySaleMinterContract.getAddress());
        await tx.wait();
        // grant seller_role to seller account
        tx = await primarySaleMinterContract.grantRole(SELLER_ROLE, sellerRole);
        await tx.wait();
        // setup primary sale in current time
        startTime = BigInt(await time.latest() - 500);
        endTime = BigInt(await time.latest() + 10000);  
        // reset supply to manageable limit
        supply = BigInt(10);
        tx = await primarySaleMinterContract.connect(sellerRole).setPrimarySaleConfig(
            startTime,
            endTime,
            supply,
            unitPrice,
            tokenLimit
        );;
        await tx.wait();

        /**********************************************
         * Test 
         *********************************************/
        const totalSalesBefore:BigNumberish = await primarySaleMinterContract.totalSaleCount();
        const account1SalesBefore:BigNumberish = await primarySaleMinterContract.accountSaleCount(tokenReceiver1);
        const nftReceiver1BalanceBefore:BigNumberish = await wizschoolBroomContract.balanceOf(tokenReceiver1);
        const account2SalesBefore:BigNumberish = await primarySaleMinterContract.accountSaleCount(tokenReceiver2);
        const nftReceiver2BalanceBefore:BigNumberish = await wizschoolBroomContract.balanceOf(tokenReceiver2);
        var mintCount = tokenLimit;        
        // expect the mint to succeed for tokenReceiver1
        for(var i=0; i<mintCount; i++) {
            tx = await primarySaleMinterContract.connect(tokenReceiver1).mint(BigInt(i+1), { value: ethers.parseEther("0.210")});
            await tx.wait();
        }  
        // expect the mint to succeed for tokenReceiver2
        for(var i = 5; i< 10; i++) {
            tx = await primarySaleMinterContract.connect(tokenReceiver2).mint(BigInt(i+1), { value: ethers.parseEther("0.210")});
            await tx.wait();
        }           
        // other checks
        const totalSalesAfter:BigNumberish = await primarySaleMinterContract.totalSaleCount();
        const account1SalesAfter:BigNumberish = await primarySaleMinterContract.accountSaleCount(tokenReceiver1);
        const nftReceiver1BalanceAfter:BigNumberish = await wizschoolBroomContract.balanceOf(tokenReceiver1);
        const account2SalesAfter:BigNumberish = await primarySaleMinterContract.accountSaleCount(tokenReceiver2);
        const nftReceiver2BalanceAfter:BigNumberish = await wizschoolBroomContract.balanceOf(tokenReceiver2);

        expect(totalSalesAfter).to.equal(totalSalesBefore + BigInt(mintCount)+ BigInt(mintCount));
        expect(account1SalesAfter).to.equal(account1SalesBefore + BigInt(mintCount));
        expect(nftReceiver1BalanceAfter).to.equal(nftReceiver1BalanceBefore + BigInt(mintCount));
        expect(account2SalesAfter).to.equal(account2SalesBefore + BigInt(mintCount));
        expect(nftReceiver2BalanceAfter).to.equal(nftReceiver2BalanceBefore + BigInt(mintCount));


        // next mint request expected to fail as supply limit exceeded
        await expect(primarySaleMinterContract.mint(mintCount + mintCount + BigInt(1), { value: ethers.parseEther("0.210")})).to.be.revertedWith("0x5");
    });
   });
});