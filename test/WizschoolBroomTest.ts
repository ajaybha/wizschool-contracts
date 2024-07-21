import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import {ethers, ignition } from "hardhat";
import { Signer, BigNumberish  } from "ethers";

describe ("WizschoolBroomTest", function() {

    let owner:Signer, minterRole:Signer, royaltyAccount:Signer, otherRole:Signer, tokenReceiver1:Signer, tokenReceiver2:Signer;
    const DEFAULT_ADMIN_ROLE = ethers.ZeroHash;
    // this const is defined as byte32 string in solidity, if it was keccak256 hashed then uncomment the next line 
    // ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
    const MINTER_ROLE = ethers.encodeBytes32String("MINTER_ROLE");

    beforeEach(async function() {
        [owner, royaltyAccount, minterRole, otherRole, tokenReceiver1, tokenReceiver2] = await ethers.getSigners();
    });
    /*
    We define a fixture to reuse the same setup in every test. We use the loadFixture to run this setup once, snapshot that shate,
    and reset Hardhat Network to that snapshot in every test
    */
   async function deployWizschoolBroomLocalFixture() {
    //const wizschoolBroom = await ignition.deploy(WizschoolBroomModule);
    //return {wizschoolBroom};

    // define the input parameters for contract instantiation
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
    return {wizschoolBroomContract, mockAllowlistContract, owner, name, symbol, baseUri, contractUri, royaltyAccount, feeNumerator};

   }
   describe("Deployment", function() {
    it("Should set the right name", async function() {
        const { wizschoolBroomContract, name} = await loadFixture(deployWizschoolBroomLocalFixture);
        expect(await wizschoolBroomContract.name()).to.equal(name);
    });
    it("Should set the right symbol", async function() {
        const { wizschoolBroomContract, symbol} = await loadFixture(deployWizschoolBroomLocalFixture);
        expect(await wizschoolBroomContract.symbol()).to.equal(symbol);
    });
    it("Should set the right baseUri", async function() {
        const { wizschoolBroomContract, baseUri} = await loadFixture(deployWizschoolBroomLocalFixture);
        expect(await wizschoolBroomContract.baseURI()).to.equal(baseUri);
    });
    it("Should set the right contractUri", async function() {
        const { wizschoolBroomContract, contractUri} = await loadFixture(deployWizschoolBroomLocalFixture);
        expect(await wizschoolBroomContract.contractURI()).to.equal(contractUri);
    });
    it("Should set owner with DEFAULT_ADMIN_ROLE", async function() {
        const { wizschoolBroomContract, owner} = await loadFixture(deployWizschoolBroomLocalFixture);
        const hasAdminRole = await wizschoolBroomContract.hasRole(DEFAULT_ADMIN_ROLE, owner);
        expect(hasAdminRole).is.true;
    });
    it("Should set the totalSupply to zero", async function() {
        const { wizschoolBroomContract} = await loadFixture(deployWizschoolBroomLocalFixture);
        expect(await wizschoolBroomContract.totalSupply()).to.equal(0);

    });
    it("Should set the royaltyallowlistaddress in allowlist", async function() {
        const { wizschoolBroomContract, mockAllowlistContract, royaltyAccount} = await loadFixture(deployWizschoolBroomLocalFixture);
        expect(await mockAllowlistContract.isAllowlisted(royaltyAccount)).is.true;
    });
    it("Should set the default royalty info", async function() {
        const { wizschoolBroomContract, royaltyAccount, feeNumerator} = await loadFixture(deployWizschoolBroomLocalFixture);
        const salePrice:bigint = BigInt(100);
        const [royaltyReceiver,royaltyAmount ] = await wizschoolBroomContract.royaltyInfo(ethers.ZeroAddress, salePrice);
        expect(royaltyAccount).is.equal(royaltyReceiver);
        expect(royaltyAmount).is.equal((salePrice*feeNumerator)/BigInt(10000));
    });
   });

   describe("Admin Updates", function() {
    it("Should update the baseUri", async function() {
        const { wizschoolBroomContract, baseUri} = await loadFixture(deployWizschoolBroomLocalFixture);
        expect(await wizschoolBroomContract.baseURI()).to.equal(baseUri);
        const newBaseUri = "https://ajaybha.github.io/v2/";
        await wizschoolBroomContract.setBaseURI(newBaseUri);
        expect(await wizschoolBroomContract.baseURI()).to.equal(newBaseUri);
    });
    it("Should fail update of baseURI for non-admin sender", async function() {
        const { wizschoolBroomContract, baseUri} = await loadFixture(deployWizschoolBroomLocalFixture);
        expect(await wizschoolBroomContract.baseURI()).to.equal(baseUri);
        const newBaseUri = "https://ajaybha.github.io/v2/";
        await expect(wizschoolBroomContract.connect(otherRole).setBaseURI(newBaseUri)).to.be.reverted;
    });
    it("Should update contractUri", async function() {
        const { wizschoolBroomContract, contractUri} = await loadFixture(deployWizschoolBroomLocalFixture);
        expect(await wizschoolBroomContract.contractURI()).to.equal(contractUri);
        const newContractUri ="https://ajaybha.github.io/v2/tokens/";
        await wizschoolBroomContract.setContractURI(newContractUri);
        expect(await wizschoolBroomContract.contractURI()).to.equal(newContractUri);
    });
    it("Should fail update of contractURI for non-admin sender", async function() {
        const { wizschoolBroomContract, contractUri} = await loadFixture(deployWizschoolBroomLocalFixture);
        expect(await wizschoolBroomContract.contractURI()).to.equal(contractUri);
        const newContractUri ="https://ajaybha.github.io/v2/tokens/";
        await expect(wizschoolBroomContract.connect(otherRole).setContractURI(newContractUri)).to.be.reverted;
    });
    it("Should update the default-royalty-receiver", async function() {
        const { wizschoolBroomContract, royaltyAccount, feeNumerator} = await loadFixture(deployWizschoolBroomLocalFixture);
        const salePrice:bigint = BigInt(100);
        let [royaltyReceiver,royaltyAmount ] = await wizschoolBroomContract.royaltyInfo(ethers.ZeroAddress, salePrice);
        expect(royaltyReceiver).is.equal(royaltyAccount);
        expect(royaltyAmount).is.equal((salePrice*feeNumerator)/BigInt(10000));
        // update the royalty receiver address and feeNum
        const newFee:bigint = BigInt(7);
        await wizschoolBroomContract.setDefaultRoyaltyReceiver(otherRole, newFee);
        [royaltyReceiver,royaltyAmount ] = await wizschoolBroomContract.royaltyInfo(ethers.ZeroAddress, salePrice);
        expect(royaltyReceiver).is.equal(otherRole);
        expect(royaltyAmount).is.equal((salePrice*newFee)/BigInt(10000));
    });
    it("Should fail update of default-royalty-receiver for non-admin sender", async function() {
        const { wizschoolBroomContract, royaltyAccount, feeNumerator} = await loadFixture(deployWizschoolBroomLocalFixture);
        const salePrice:bigint = BigInt(100);
        let [royaltyReceiver,royaltyAmount ] = await wizschoolBroomContract.royaltyInfo(ethers.ZeroAddress, salePrice);
        expect(royaltyReceiver).is.equal(royaltyAccount);
        expect(royaltyAmount).is.equal((salePrice*feeNumerator)/BigInt(10000));
        // update the default-royalty-receiver with non-admin account
        await expect(wizschoolBroomContract.connect(otherRole).setDefaultRoyaltyReceiver(otherRole, feeNumerator)).to.be.reverted;
    });
   });

   describe("Single Minting", function() {
    it("Should grant mint-role", async function() {
        const { wizschoolBroomContract} = await loadFixture(deployWizschoolBroomLocalFixture);
        let hasMinterRole = await wizschoolBroomContract.hasRole(MINTER_ROLE, minterRole);
        expect(hasMinterRole).is.false;
        let tx = await wizschoolBroomContract.grantMinterRole(minterRole);
        await tx.wait();        
        hasMinterRole = await wizschoolBroomContract.hasRole(MINTER_ROLE, minterRole);
        expect(hasMinterRole).is.true;
    });
    it("Should revoke mint-role", async function() {
        const { wizschoolBroomContract} = await loadFixture(deployWizschoolBroomLocalFixture);
        let hasMinterRole = await wizschoolBroomContract.hasRole(MINTER_ROLE, minterRole);
        expect(hasMinterRole).is.false;
        let tx = await wizschoolBroomContract.grantMinterRole(minterRole);
        await tx.wait();        
        hasMinterRole = await wizschoolBroomContract.hasRole(MINTER_ROLE, minterRole);
        expect(hasMinterRole).is.true;
        // revoke now
        tx = await wizschoolBroomContract.revokeMinterRole(minterRole);
        await tx.wait();
        hasMinterRole = await wizschoolBroomContract.hasRole(MINTER_ROLE, minterRole);
        expect(hasMinterRole).is.false;
    });
    it("Should fail grant-mint-role for non-admin", async function() {
        const { wizschoolBroomContract} = await loadFixture(deployWizschoolBroomLocalFixture);
        await expect(wizschoolBroomContract.connect(minterRole).grantMinterRole(minterRole)).to.be.reverted;
    });
    it("Should fail mint for non-minter role", async function() {
        const { wizschoolBroomContract} = await loadFixture(deployWizschoolBroomLocalFixture);
        const hasMinterRole = await wizschoolBroomContract.hasRole(MINTER_ROLE, owner);
        expect(hasMinterRole).is.false;
        const tokenId = BigInt(1);
        await expect(wizschoolBroomContract.mint(tokenReceiver1, tokenId)).to.be.reverted;
    });
    it("Should mint single token", async function() {
        // grant minter role 
        const { wizschoolBroomContract} = await loadFixture(deployWizschoolBroomLocalFixture);
        let hasMinterRole = await wizschoolBroomContract.hasRole(MINTER_ROLE, minterRole);
        expect(hasMinterRole).is.false;
        let tx = await wizschoolBroomContract.grantMinterRole(minterRole);
        await tx.wait();        
        hasMinterRole = await wizschoolBroomContract.hasRole(MINTER_ROLE, minterRole);
        expect(hasMinterRole).is.true;

        let prevBalance:BigNumberish = await wizschoolBroomContract.balanceOf(tokenReceiver1);
        let prevTotal:BigNumberish = await wizschoolBroomContract.totalSupply();
        
        // mint single token
        const tokenId = BigInt(1);
        tx = await wizschoolBroomContract.connect(minterRole).mint(tokenReceiver1, tokenId);
        tx.wait();

        // checks
        let newBalance:BigNumberish = await wizschoolBroomContract.balanceOf(tokenReceiver1);
        let newTotal:BigNumberish = await wizschoolBroomContract.totalSupply();
        let tokenOwner = await wizschoolBroomContract.ownerOf(tokenId);
        expect(newBalance).is.equal(prevBalance + BigInt(1));
        expect(newTotal).is.equal(prevTotal + BigInt(1));
        expect(tokenReceiver1).is.equal(tokenOwner);
    });
    it("Should safe-mint single token", async function() {
        // grant minter role 
        const { wizschoolBroomContract} = await loadFixture(deployWizschoolBroomLocalFixture);
        let hasMinterRole = await wizschoolBroomContract.hasRole(MINTER_ROLE, minterRole);
        expect(hasMinterRole).is.false;
        let tx = await wizschoolBroomContract.grantMinterRole(minterRole);
        await tx.wait();        
        hasMinterRole = await wizschoolBroomContract.hasRole(MINTER_ROLE, minterRole);
        expect(hasMinterRole).is.true;

        let prevBalance:BigNumberish = await wizschoolBroomContract.balanceOf(tokenReceiver1);
        let prevTotal:BigNumberish = await wizschoolBroomContract.totalSupply();
        
        // mint single token
        const tokenId = BigInt(1);
        tx = await wizschoolBroomContract.connect(minterRole).safeMint(tokenReceiver1, tokenId);
        tx.wait();

        // checks
        let newBalance:BigNumberish = await wizschoolBroomContract.balanceOf(tokenReceiver1);
        let newTotal:BigNumberish = await wizschoolBroomContract.totalSupply();
        let tokenOwner = await wizschoolBroomContract.ownerOf(tokenId);
        expect(newBalance).is.equal(prevBalance + BigInt(1));
        expect(newTotal).is.equal(prevTotal + BigInt(1));
        expect(tokenReceiver1).is.equal(tokenOwner);
    })
   })
});
