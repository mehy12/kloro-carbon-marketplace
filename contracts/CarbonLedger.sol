// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CarbonLedger
 * @dev Smart contract for recording carbon credit transactions on blockchain
 * @notice This contract provides immutable record-keeping for carbon credit marketplace transactions
 */
contract CarbonLedger {
    struct Transaction {
        address buyer;
        address seller;
        uint256 credits;
        uint256 timestamp;
        string projectId;
        string registry;
        string certificateUrl;
        uint256 priceUsd; // Price in cents to avoid decimals
    }

    // Array to store all transactions
    Transaction[] public transactions;
    
    // Mapping for quick transaction lookups by buyer
    mapping(address => uint256[]) public buyerTransactions;
    
    // Mapping for quick transaction lookups by seller
    mapping(address => uint256[]) public sellerTransactions;
    
    // Contract owner for admin functions
    address public owner;
    
    // Total credits traded through this contract
    uint256 public totalCreditsTraded;

    event TransactionRecorded(
        uint256 indexed transactionIndex,
        address indexed buyer,
        address indexed seller,
        uint256 credits,
        string projectId,
        string registry,
        string certificateUrl,
        uint256 priceUsd,
        uint256 timestamp
    );

    event ContractDeployed(address owner, uint256 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only contract owner can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
        emit ContractDeployed(owner, block.timestamp);
    }

    /**
     * @dev Record a new carbon credit transaction
     * @param _buyer Address of the credit buyer
     * @param _seller Address of the credit seller
     * @param _credits Number of credits in the transaction
     * @param _projectId ID of the carbon credit project
     * @param _registry Registry that issued the credits (e.g., "Verra", "Gold Standard")
     * @param _certificateUrl URL to the certificate document
     * @param _priceUsd Price in USD cents to avoid decimal issues
     */
    function recordTransaction(
        address _buyer,
        address _seller,
        uint256 _credits,
        string memory _projectId,
        string memory _registry,
        string memory _certificateUrl,
        uint256 _priceUsd
    ) public returns (uint256) {
        require(_buyer != address(0), "Buyer address cannot be zero");
        require(_seller != address(0), "Seller address cannot be zero");
        require(_credits > 0, "Credits must be greater than zero");
        require(bytes(_projectId).length > 0, "Project ID cannot be empty");
        require(bytes(_registry).length > 0, "Registry cannot be empty");

        Transaction memory newTx = Transaction(
            _buyer,
            _seller,
            _credits,
            block.timestamp,
            _projectId,
            _registry,
            _certificateUrl,
            _priceUsd
        );

        uint256 transactionIndex = transactions.length;
        transactions.push(newTx);
        
        // Update mappings for quick lookups
        buyerTransactions[_buyer].push(transactionIndex);
        sellerTransactions[_seller].push(transactionIndex);
        
        // Update total credits traded
        totalCreditsTraded += _credits;

        emit TransactionRecorded(
            transactionIndex,
            _buyer, 
            _seller, 
            _credits, 
            _projectId, 
            _registry, 
            _certificateUrl, 
            _priceUsd,
            block.timestamp
        );

        return transactionIndex;
    }

    /**
     * @dev Get a specific transaction by index
     * @param index The transaction index
     * @return Transaction details
     */
    function getTransaction(uint256 index) public view returns (Transaction memory) {
        require(index < transactions.length, "Transaction index out of bounds");
        return transactions[index];
    }

    /**
     * @dev Get total number of transactions
     * @return Total transaction count
     */
    function getTotalTransactions() public view returns (uint256) {
        return transactions.length;
    }

    /**
     * @dev Get all transaction indices for a buyer
     * @param buyer The buyer address
     * @return Array of transaction indices
     */
    function getBuyerTransactions(address buyer) public view returns (uint256[] memory) {
        return buyerTransactions[buyer];
    }

    /**
     * @dev Get all transaction indices for a seller
     * @param seller The seller address
     * @return Array of transaction indices
     */
    function getSellerTransactions(address seller) public view returns (uint256[] memory) {
        return sellerTransactions[seller];
    }

    /**
     * @dev Get contract statistics
     * @return totalTx Total transactions, totalCredits Total credits traded
     */
    function getContractStats() public view returns (uint256 totalTx, uint256 totalCredits) {
        return (transactions.length, totalCreditsTraded);
    }

    /**
     * @dev Emergency function to pause contract (future enhancement)
     * @notice Only owner can call this function
     */
    function emergencyPause() public onlyOwner {
        // Implementation for pausing functionality can be added here
        // For now, this is a placeholder for future security enhancements
    }
}