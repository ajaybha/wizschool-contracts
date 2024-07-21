// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import {AccessControl} from "openzeppelin-contracts-5.0.2/access/AccessControl.sol";
import "./interfaces/INFTMintable.sol";

contract PrimarySaleMinter is AccessControl
{
    bytes32 public constant SELLER_ROLE = keccak256("SELLER_ROLE");

    struct Config {
        uint256 startTime;
        uint256 endTime;
        uint256 supply;
        // unit price of NFT in native token
        uint256 price;
        uint256 maxNFTAllowed;
    }

    /*********************
     * public state
     *********************/
    mapping(address => bool) public blacklist;
    Config public saleConfig;
    uint256 public totalSaleCount;
    mapping(address => uint256) public accountSaleCount;

    /****************************
     * internal state
     ****************************/
     INFTMintable internal _mintableNft;

    /******************************
     * events
     ************************** */
    event SetSaleConfig(uint256 startTime, uint256 endTime, uint256 supply, uint256 price);
    event UpdateBlacklist(address indexed account, bool status); 
    event MintToken(address indexed sender, uint256 tokenID);
    event Withdraw(address indexed sender, uint256 balance);

    constructor(INFTMintable nftContract) {
        _mintableNft = nftContract;
        // add the sender (deployer) to the default admin role
        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
    }

    /**********************************************
     * public or external functions
     ***********************************************/
    /**
     * @notice Mints an NFT with given tokenID 
     * @dev Anyone can call this function
     * @param tokenID TokenID of the asset to mint     
     * @dev Error Details
     * - 0x1: Sender address in black list
     * - 0x2: There is no sale running
     * - 0x3: Invalid price
     * - 0x4: User can't be buy more than max nft allowed
     * - 0x5: User can't buy more than total supply allocated for sale
     */
    function mint(uint256 tokenID) external payable  {
        
        address sender = _msgSender();
        require(blacklist[sender] == false, "0x1");
        require(
            block.timestamp > saleConfig.startTime && 
            block.timestamp < saleConfig.endTime, 
            "0x2");
        require(
            msg.value >= (saleConfig.price), 
            "0x3");
        require(
            (accountSaleCount[sender] + 1) <= saleConfig.maxNFTAllowed, 
            "0x4");
        require(
            (totalSaleCount + 1) <= saleConfig.supply, 
            "0x5");

        _mintableNft.publicSafeMint(sender, tokenID);
        // updates the counters for the NFT mint
        accountSaleCount[sender] = accountSaleCount[sender] + 1;
        totalSaleCount = totalSaleCount + 1;

        // emits the event
        emit MintToken(sender, tokenID);
    }

    /************************************************
     * SELLER ROLE functions
     *************************************************/
 
    /**
     * @notice Set parameters for the primary sale
     * @dev Only calleable by SELLER role
     * @param startTime Start time of sale
     * @param endTime End time of sale
     * @param supply Total supply allocated for sale
     * @param price Price of minting one token
     * @param maxNFTAllowed max allowed NFT per user
     */
    function setPrimarySaleConfig(
        uint256 startTime,
        uint256 endTime,
        uint256 supply,
        uint256 price,
        uint256 maxNFTAllowed) external onlyRole(SELLER_ROLE) {
        //Config psConfig = saleConfigs[SaleType.Private];        
        saleConfig.startTime = startTime;
        saleConfig.endTime = endTime;
        saleConfig.supply = supply;
        saleConfig.price = price;
        saleConfig.maxNFTAllowed = maxNFTAllowed;
        emit SetSaleConfig(startTime, endTime, supply, price);
    }
    /**
     * @notice Update blacklist status of an account address
     * @dev Only callable by SELLER ROLE
     * @param account Address of user account
     * @param status Status of address in blacklist
     */
    function updateBlacklist(address account, bool status) external  onlyRole(SELLER_ROLE) {
        blacklist[account] = status;
        emit UpdateBlacklist(account, status);
    }

     /**********************************************
     * public (ADMIN_ROLE functions)
     ***********************************************/
    /**
     * @notice Withdraw balance from this contract
     * @dev Only callable by owner
     */
    function withdraw() external onlyRole(DEFAULT_ADMIN_ROLE) {
        address payable sender = payable(_msgSender());
        uint256 balance = address(this).balance;
        sender.transfer(balance);

        emit Withdraw(sender, balance);
    }
}