// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.19;

import {IOperatorAllowlist} from "@imtbl/contracts/contracts/allowlist/IOperatorAllowlist.sol";
//import {IERC165} from "openzeppelin-contracts-5.0.2/utils/introspection/IERC165.sol";
/**
 * @dev Interface of the ERC-165 standard, as defined in the
 * https://eips.ethereum.org/EIPS/eip-165[ERC].
 *
 * Implementers can declare support of contract interfaces, which can then be
 * queried by others ({ERC165Checker}).
 *
 * For an implementation, see {ERC165}.
 */
interface IERC165 {
    /**
     * @dev Returns true if this contract implements the interface defined by
     * `interfaceId`. See the corresponding
     * https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[ERC section]
     * to learn more about how these ids are created.
     *
     * This function call must use less than 30 000 gas.
     */
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}

contract MockAllowlistReceiver is IERC165, IOperatorAllowlist {

    /**
     * @notice Returns true if an address is Allowlisted, false otherwise
     * @param target the address that will be checked for presence in the allowlist
     */
    function isAllowlisted(address target) external view override returns (bool) {
        return true;
    }

    /**
     * @notice ERC-165 interface support
     * @param interfaceId The interface identifier, which is a 4-byte selector.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual returns (bool) {
        return interfaceId == type(IOperatorAllowlist).interfaceId;
    }
}