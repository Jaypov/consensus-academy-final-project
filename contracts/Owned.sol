// "SPDX-License-Identifier: UNLICENSED"
pragma solidity ^0.6.0;

contract Owned {
    address internal owner;

    modifier onlyOwner {
        require(msg.sender == owner, "Only owner can call it!");
        _;
    }
}
