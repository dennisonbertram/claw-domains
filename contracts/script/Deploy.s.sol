// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/ClawRegistry.sol";
import "../src/ClawResolver.sol";

/// @title Deploy
/// @notice Deployment script for ClawRegistry and ClawResolver on Arc Network
contract Deploy is Script {
    // Arc testnet chainId
    uint256 constant ARC_TESTNET_CHAIN_ID = 5042002;

    // USDC address on Arc testnet
    address constant ARC_TESTNET_USDC = 0x3600000000000000000000000000000000000000;

    function run() external {
        uint256 chainId = block.chainid;
        require(
            chainId == ARC_TESTNET_CHAIN_ID,
            "Deploy: unsupported chain. Use Arc Testnet (5042002)"
        );

        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deploying on chain:", chainId);
        console.log("Deployer:", deployer);
        console.log("USDC address:", ARC_TESTNET_USDC);

        vm.startBroadcast(deployerPrivateKey);

        // Deploy registry
        ClawRegistry registry = new ClawRegistry(deployer, ARC_TESTNET_USDC);
        console.log("ClawRegistry deployed at:", address(registry));

        // Deploy resolver (pointing to the registry)
        ClawResolver resolver = new ClawResolver(deployer, address(registry));
        console.log("ClawResolver deployed at:", address(resolver));

        vm.stopBroadcast();

        // Log deployment summary
        console.log("\n=== Deployment Summary ===");
        console.log("Network:       ", "Arc Testnet");
        console.log("ClawRegistry:  ", address(registry));
        console.log("ClawResolver:  ", address(resolver));
        console.log("Owner:         ", deployer);
        console.log("USDC:          ", ARC_TESTNET_USDC);
    }
}
