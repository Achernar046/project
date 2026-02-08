// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title WasteCoin
 * @dev ERC20 token for waste-to-coin incentive system
 * Officers can mint coins to reward users for waste submissions
 */
contract WasteCoin is ERC20, AccessControl, ERC20Burnable, Pausable {
    bytes32 public constant OFFICER_ROLE = keccak256("OFFICER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    event CoinsMinted(address indexed to, uint256 amount, string reason);
    event OfficerAdded(address indexed officer);
    event OfficerRemoved(address indexed officer);

    constructor() ERC20("WasteCoin", "WST") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OFFICER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
    }

    /**
     * @dev Mint coins to a user (only officers can call this)
     * @param to Address to receive coins
     * @param amount Amount of coins to mint (in wei, 18 decimals)
     * @param reason Reason for minting (e.g., waste submission ID)
     */
    function mintCoins(
        address to,
        uint256 amount,
        string memory reason
    ) public onlyRole(OFFICER_ROLE) whenNotPaused {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be greater than 0");
        
        _mint(to, amount);
        emit CoinsMinted(to, amount, reason);
    }

    /**
     * @dev Add a new officer
     */
    function addOfficer(address officer) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(officer != address(0), "Invalid officer address");
        grantRole(OFFICER_ROLE, officer);
        emit OfficerAdded(officer);
    }

    /**
     * @dev Remove an officer
     */
    function removeOfficer(address officer) public onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(OFFICER_ROLE, officer);
        emit OfficerRemoved(officer);
    }

    /**
     * @dev Pause the contract (emergency stop)
     */
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause the contract
     */
    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }
}
