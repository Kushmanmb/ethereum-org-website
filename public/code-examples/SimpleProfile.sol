// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

// This is a smart contract - a program that can be deployed to the Ethereum blockchain.
contract SimpleProfile {

    // A struct to store profile information for each user.
    struct Profile {
        string ensName;
        string displayName;
    }

    // A `mapping` is essentially a hash table data structure.
    // This `mapping` assigns an address to a Profile struct.
    mapping (address => Profile) public profiles;

    // Events allow for logging of activity on the blockchain.
    // Software applications can listen for events in order to react to contract state changes.
    event ProfileUpdated(address indexed user, string ensName, string displayName);

    // Updates the profile for the message sender with an ENS name and display name.
    function updateProfile(string memory ensName, string memory displayName) public {
        profiles[msg.sender] = Profile(ensName, displayName);
        emit ProfileUpdated(msg.sender, ensName, displayName);
    }

    // Returns the profile for a given address.
    function getProfile(address user) public view returns (string memory ensName, string memory displayName) {
        Profile memory profile = profiles[user];
        return (profile.ensName, profile.displayName);
    }
}
