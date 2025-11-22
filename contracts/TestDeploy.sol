// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Minimal version for testing deployment
contract CarbonLedgerSimple {
    address public owner;
    uint256 public totalTransactions;
    
    event Deployed(address owner);
    
    constructor() {
        owner = msg.sender;
        totalTransactions = 0;
        emit Deployed(owner);
    }
    
    function getStats() public view returns (uint256) {
        return totalTransactions;
    }
}
