// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.19;
import '@imtbl/contracts/contracts/token/erc721/preset/ImmutableERC721MintByID.sol';
import {INFTMintable} from './interfaces/INFTMintable.sol';

contract WizschoolBroomERC721 is ImmutableERC721MintByID, INFTMintable {
    constructor(
        address owner,
        string memory name,
        string memory symbol,
        string memory baseURI,
        string memory contractURI,
        address royaltyAllowlist,
        address _receiver,
        uint96 _feeNumerator
    )
        ImmutableERC721MintByID(
            owner,
            name,
            symbol,
            baseURI,
            contractURI,
            royaltyAllowlist,
            _receiver,
            _feeNumerator
        )
    {}

     /**********************************************
     * public (MINTER_ROLE) functions (INFTMintable interface)
     ***********************************************/

    /**
     * @notice Allows minter to mint `tokenID` to `to`
     *  @param to the address to mint the token to
     *  @param tokenID the ID of the token to mint
     */
    function publicMint(address to, uint256 tokenID) external override(INFTMintable) onlyRole(MINTER_ROLE)  {
        _totalSupply++;
        _mint(to, tokenID);
    }
    /**
     * @notice Allows minter to safe mint `tokenID` to `to`
     *  @param to the address to mint the token to
     *  @param tokenID the ID of the token to mint
     */
    function publicSafeMint(address to, uint256 tokenID) external override(INFTMintable) onlyRole(MINTER_ROLE) {
        _totalSupply++;
        _safeMint(to, tokenID, "");
    }
}