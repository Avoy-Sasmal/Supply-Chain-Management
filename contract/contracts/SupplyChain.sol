// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract SupplyChain {
    // Struct to represent a product/item in the supply chain
    struct Product {
        uint256 id;
        string name;
        string description;
        address manufacturer;
        address currentOwner;
        uint256 timestamp;
        bool exists;
    }

    // Mapping from product ID to Product
    mapping(uint256 => Product) public products;
    
    // Array to store all product IDs
    uint256[] public productIds;
    
    // Counter for product IDs
    uint256 private productCounter;

    // Events
    event ProductCreated(uint256 indexed productId, string name, address manufacturer);
    event ProductTransferred(uint256 indexed productId, address from, address to);
    event ProductUpdated(uint256 indexed productId, string name, string description);

    // Modifier to check if product exists
    modifier productExists(uint256 _productId) {
        require(products[_productId].exists, "Product does not exist");
        _;
    }

    // Modifier to check if caller is the current owner
    modifier onlyOwner(uint256 _productId) {
        require(products[_productId].currentOwner == msg.sender, "Not the owner of this product");
        _;
    }

    // Create a new product
    function createProduct(
        string memory _name,
        string memory _description
    ) public returns (uint256) {
        productCounter++;
        uint256 newProductId = productCounter;

        products[newProductId] = Product({
            id: newProductId,
            name: _name,
            description: _description,
            manufacturer: msg.sender,
            currentOwner: msg.sender,
            timestamp: block.timestamp,
            exists: true
        });

        productIds.push(newProductId);

        emit ProductCreated(newProductId, _name, msg.sender);
        return newProductId;
    }

    // Transfer product ownership
    function transferProduct(
        uint256 _productId,
        address _to
    ) public productExists(_productId) onlyOwner(_productId) {
        require(_to != address(0), "Cannot transfer to zero address");
        require(_to != msg.sender, "Cannot transfer to yourself");

        address previousOwner = products[_productId].currentOwner;
        products[_productId].currentOwner = _to;

        emit ProductTransferred(_productId, previousOwner, _to);
    }

    // Update product information
    function updateProduct(
        uint256 _productId,
        string memory _name,
        string memory _description
    ) public productExists(_productId) onlyOwner(_productId) {
        products[_productId].name = _name;
        products[_productId].description = _description;

        emit ProductUpdated(_productId, _name, _description);
    }

    // Get product details
    function getProduct(uint256 _productId) public view productExists(_productId) returns (
        uint256 id,
        string memory name,
        string memory description,
        address manufacturer,
        address currentOwner,
        uint256 timestamp
    ) {
        Product memory product = products[_productId];
        return (
            product.id,
            product.name,
            product.description,
            product.manufacturer,
            product.currentOwner,
            product.timestamp
        );
    }

    // Get total number of products
    function getProductCount() public view returns (uint256) {
        return productCounter;
    }

    // Get all product IDs
    function getAllProductIds() public view returns (uint256[] memory) {
        return productIds;
    }
}

