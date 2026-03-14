// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ClawNamehash
/// @notice Library for computing ENS-style namehashes for .claw domains
library ClawNamehash {
    /// @notice Compute ENS-style namehash for a .claw domain label
    /// @dev namehash("alice.claw") = keccak256(keccak256(bytes32(0), keccak256("claw")), keccak256("alice"))
    /// @param label The domain label (e.g. "alice" for "alice.claw")
    /// @return The namehash as bytes32
    function namehash(string memory label) internal pure returns (bytes32) {
        // Start from the root namehash (bytes32(0))
        bytes32 node = bytes32(0);
        // Hash the TLD "claw"
        node = keccak256(abi.encodePacked(node, keccak256(abi.encodePacked("claw"))));
        // Hash the label
        node = keccak256(abi.encodePacked(node, keccak256(abi.encodePacked(label))));
        return node;
    }

    /// @notice Convert a domain label to its uint256 token ID
    /// @param label The domain label
    /// @return The uint256 token ID
    function labelToId(string memory label) internal pure returns (uint256) {
        return uint256(namehash(label));
    }

    /// @notice Validate a domain label
    /// @dev Labels must be 1-63 chars, lowercase alphanumeric + hyphens, no leading/trailing hyphens
    /// @param label The label to validate
    /// @return True if valid, false otherwise
    function isValidLabel(string memory label) internal pure returns (bool) {
        bytes memory b = bytes(label);
        uint256 len = b.length;

        // Length check: 1-63 characters
        if (len == 0 || len > 63) {
            return false;
        }

        // No leading hyphen
        if (b[0] == 0x2D) {
            return false;
        }

        // No trailing hyphen
        if (b[len - 1] == 0x2D) {
            return false;
        }

        // All characters must be lowercase alphanumeric or hyphen
        for (uint256 i = 0; i < len; i++) {
            bytes1 c = b[i];
            bool isLowerAlpha = (c >= 0x61 && c <= 0x7A); // a-z
            bool isDigit = (c >= 0x30 && c <= 0x39);       // 0-9
            bool isHyphen = (c == 0x2D);                    // -
            if (!isLowerAlpha && !isDigit && !isHyphen) {
                return false;
            }
        }

        return true;
    }
}
