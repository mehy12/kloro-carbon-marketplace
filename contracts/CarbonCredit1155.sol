// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title CarbonCredit1155
 * @dev ERC-1155 token for carbon credit batches with role-based minting and retirement (burn)
 */
contract CarbonCredit1155 is ERC1155, ERC1155Pausable, AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    // Optional per-token metadata URI (projectId, vintage, registry) should be resolved off-chain via tokenURI
    mapping(uint256 => string) private _tokenURIs;

    event Retired(address indexed account, uint256 indexed id, uint256 amount, string reason, uint256 timestamp);

    constructor(string memory baseURI) ERC1155(baseURI) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(BURNER_ROLE, msg.sender);
    }

    function setURI(string memory newuri) external onlyRole(ADMIN_ROLE) {
        _setURI(newuri);
    }

    function setTokenURI(uint256 id, string calldata tokenURI_) external onlyRole(ADMIN_ROLE) {
        _tokenURIs[id] = tokenURI_;
        emit URI(tokenURI_, id);
    }

    function uri(uint256 id) public view override returns (string memory) {
        string memory tokenURI_ = _tokenURIs[id];
        if (bytes(tokenURI_).length > 0) {
            return tokenURI_;
        }
        return super.uri(id);
    }

    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    function mint(address to, uint256 id, uint256 amount, bytes memory data) external onlyRole(MINTER_ROLE) whenNotPaused {
        _mint(to, id, amount, data);
    }

    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data) external onlyRole(MINTER_ROLE) whenNotPaused {
        _mintBatch(to, ids, amounts, data);
    }

    // Retirement is modeled as a burn with event
    function retire(uint256 id, uint256 amount, string calldata reason) external whenNotPaused {
        _burn(_msgSender(), id, amount);
        emit Retired(_msgSender(), id, amount, reason, block.timestamp);
    }

    // Admin or burner can retire from any account (e.g., compliance actions)
    function forceRetire(address from, uint256 id, uint256 amount, string calldata reason) external whenNotPaused onlyRole(BURNER_ROLE) {
        _burn(from, id, amount);
        emit Retired(from, id, amount, reason, block.timestamp);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC1155, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    // Resolve multiple inheritance for OZ v5
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override(ERC1155, ERC1155Pausable) {
        super._update(from, to, ids, values);
    }
}
