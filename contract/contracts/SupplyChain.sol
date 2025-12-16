// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract SupplyChain is AccessControl {
    // --- Roles ---
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MANUFACTURER_ROLE = keccak256("MANUFACTURER_ROLE");
    bytes32 public constant TRANSPORTER_ROLE = keccak256("TRANSPORTER_ROLE");
    bytes32 public constant RETAILER_ROLE = keccak256("RETAILER_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");

    // --- Product (kept for backward compatibility with existing frontend) ---
    struct Product {
        uint256 id;
        string name;
        string description;
        address manufacturer;
        address currentOwner;
        uint256 timestamp;
        bool exists;
    }

    mapping(uint256 => Product) public products;
    uint256[] public productIds;
    uint256 private productCounter;

    event ProductCreated(uint256 indexed productId, string name, address manufacturer);
    event ProductTransferred(uint256 indexed productId, address from, address to);
    event ProductUpdated(uint256 indexed productId, string name, string description);

    modifier productExists(uint256 _productId) {
        require(products[_productId].exists, "Product does not exist");
        _;
    }

    modifier onlyOwner(uint256 _productId) {
        require(products[_productId].currentOwner == msg.sender, "Not the owner of this product");
        _;
    }

    // --- Shipments & Proofs for Cold Chain ---
    enum ShipmentStatus {
        Created,
        InTransit,
        Delivered
    }

    struct Shipment {
        uint256 id;
        address manufacturer;
        string metadata; // e.g., CID or description
        ShipmentStatus status;
        bool exists;
    }

    struct Proof {
        bytes32 hash; // hash of JSON batch (sha256 / keccak)
        uint256 timestamp;
        address uploader; // transporter account
    }

    mapping(uint256 => Shipment) private shipments;
    mapping(uint256 => Proof[]) private proofsByShipment;

    event ShipmentCreated(uint256 indexed shipmentId, address indexed manufacturer, string metadata);
    event ProofRecorded(uint256 indexed shipmentId, bytes32 hash, address indexed uploader);
    event DeliveryConfirmed(uint256 indexed shipmentId, address indexed confirmer);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MANUFACTURER_ROLE, msg.sender);
        _grantRole(TRANSPORTER_ROLE, msg.sender);
        _grantRole(RETAILER_ROLE, msg.sender);
        _grantRole(AUDITOR_ROLE, msg.sender);
    }

    // --- Role management ---
    function grantRoleTo(bytes32 role, address account) external onlyRole(ADMIN_ROLE) {
        _grantRole(role, account);
    }

    function revokeRoleFrom(bytes32 role, address account) external onlyRole(ADMIN_ROLE) {
        _revokeRole(role, account);
    }

    // --- Shipments ---
    function createShipment(uint256 shipmentId, string calldata metadata) external onlyRole(MANUFACTURER_ROLE) {
        require(!shipments[shipmentId].exists, "Shipment already exists");
        shipments[shipmentId] = Shipment({
            id: shipmentId,
            manufacturer: msg.sender,
            metadata: metadata,
            status: ShipmentStatus.Created,
            exists: true
        });
        emit ShipmentCreated(shipmentId, msg.sender, metadata);
    }

    function recordProof(uint256 shipmentId, bytes32 proofHash) external onlyRole(TRANSPORTER_ROLE) {
        Shipment storage s = shipments[shipmentId];
        require(s.exists, "Shipment not found");

        // Update status if first proof
        if (s.status == ShipmentStatus.Created) {
            s.status = ShipmentStatus.InTransit;
        }

        proofsByShipment[shipmentId].push(
            Proof({hash: proofHash, timestamp: block.timestamp, uploader: msg.sender})
        );

        emit ProofRecorded(shipmentId, proofHash, msg.sender);
    }

    function confirmDelivery(uint256 shipmentId) external onlyRole(RETAILER_ROLE) {
        Shipment storage s = shipments[shipmentId];
        require(s.exists, "Shipment not found");
        require(s.status != ShipmentStatus.Delivered, "Already delivered");

        s.status = ShipmentStatus.Delivered;
        emit DeliveryConfirmed(shipmentId, msg.sender);
    }

    function getShipment(uint256 shipmentId)
        external
        view
        returns (
            uint256 id,
            address manufacturer,
            string memory metadata,
            ShipmentStatus status,
            bool exists
        )
    {
        Shipment memory s = shipments[shipmentId];
        return (s.id, s.manufacturer, s.metadata, s.status, s.exists);
    }

    function getProofs(uint256 shipmentId) external view returns (Proof[] memory) {
        return proofsByShipment[shipmentId];
    }

    function getProofCount(uint256 shipmentId) external view returns (uint256) {
        return proofsByShipment[shipmentId].length;
    }

    // --- Product functions (Role-based) ---
    // Only MANUFACTURER can create products
    function createProduct(
        string memory _name,
        string memory _description
    ) public onlyRole(MANUFACTURER_ROLE) returns (uint256) {
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

    // Only MANUFACTURER or TRANSPORTER can transfer products
    function transferProduct(
        uint256 _productId,
        address _to
    ) public productExists(_productId) {
        require(_to != address(0), "Cannot transfer to zero address");
        require(_to != msg.sender, "Cannot transfer to yourself");
        
        // Check if caller is owner OR has MANUFACTURER/TRANSPORTER role
        bool isOwner = products[_productId].currentOwner == msg.sender;
        bool hasTransferRole = hasRole(MANUFACTURER_ROLE, msg.sender) || 
                               hasRole(TRANSPORTER_ROLE, msg.sender);
        require(isOwner || hasTransferRole, "Not authorized to transfer");

        address previousOwner = products[_productId].currentOwner;
        products[_productId].currentOwner = _to;

        emit ProductTransferred(_productId, previousOwner, _to);
    }

    // Only MANUFACTURER can update products
    function updateProduct(
        uint256 _productId,
        string memory _name,
        string memory _description
    ) public productExists(_productId) onlyRole(MANUFACTURER_ROLE) {
        products[_productId].name = _name;
        products[_productId].description = _description;

        emit ProductUpdated(_productId, _name, _description);
    }
    
    // Check user role (for frontend)
    function getUserRole(address user) public view returns (string memory) {
        if (hasRole(ADMIN_ROLE, user)) return "ADMIN";
        if (hasRole(MANUFACTURER_ROLE, user)) return "MANUFACTURER";
        if (hasRole(TRANSPORTER_ROLE, user)) return "TRANSPORTER";
        if (hasRole(RETAILER_ROLE, user)) return "RETAILER";
        if (hasRole(AUDITOR_ROLE, user)) return "AUDITOR";
        return "NONE";
    }
    
    // Get all roles for a user (returns array of role names)
    function getUserRoles(address user) public view returns (string[] memory) {
        string[] memory roles = new string[](5);
        uint256 count = 0;
        
        if (hasRole(ADMIN_ROLE, user)) roles[count++] = "ADMIN";
        if (hasRole(MANUFACTURER_ROLE, user)) roles[count++] = "MANUFACTURER";
        if (hasRole(TRANSPORTER_ROLE, user)) roles[count++] = "TRANSPORTER";
        if (hasRole(RETAILER_ROLE, user)) roles[count++] = "RETAILER";
        if (hasRole(AUDITOR_ROLE, user)) roles[count++] = "AUDITOR";
        
        // Resize array to actual count
        string[] memory result = new string[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = roles[i];
        }
        return result;
    }

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

    function getProductCount() public view returns (uint256) {
        return productCounter;
    }

    function getAllProductIds() public view returns (uint256[] memory) {
        return productIds;
    }
}

