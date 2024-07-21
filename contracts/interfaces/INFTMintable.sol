// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
/**
* Interface defines the dependent minting functions that minter relies on.
 */
interface INFTMintable {
    function publicMint(address to, uint256 tokenID) external;
    function publicSafeMint(address to, uint256 tokenID) external;
}