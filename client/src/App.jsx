import { useEffect, useState } from "react";
import { useContract } from "./hooks/useContract";
import "./App.css";

function App() {
  const {
    account,
    isConnected,
    loading,
    error,
    connectWallet,
    createProduct,
    transferProduct,
    updateProduct,
    getAllProducts,
    getProductCount,
  } = useContract();

  const [products, setProducts] = useState([]);
  const [productCount, setProductCount] = useState(0);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [transferAddress, setTransferAddress] = useState("");
  const [transferProductId, setTransferProductId] = useState("");

  useEffect(() => {
    if (isConnected) {
      loadProducts();
    }
  }, [isConnected]);

  const loadProducts = async () => {
    try {
      const count = await getProductCount();
      setProductCount(count);

      if (count > 0) {
        const allProducts = await getAllProducts();
        setProducts(allProducts);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("Error loading products:", err);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await createProduct(productName, productDescription);
      setProductName("");
      setProductDescription("");
      setShowCreateForm(false);
      await loadProducts();
      alert("Product created successfully!");
    } catch (err) {
      console.error("Error creating product:", err);
    }
  };

  const handleTransferProduct = async (e) => {
    e.preventDefault();
    try {
      await transferProduct(Number(transferProductId), transferAddress);
      setTransferProductId("");
      setTransferAddress("");
      setShowTransferForm(false);
      await loadProducts();
      alert("Product transferred successfully!");
    } catch (err) {
      console.error("Error transferring product:", err);
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      await updateProduct(selectedProduct.id, productName, productDescription);
      setProductName("");
      setProductDescription("");
      setShowUpdateForm(false);
      setSelectedProduct(null);
      await loadProducts();
      alert("Product updated successfully!");
    } catch (err) {
      console.error("Error updating product:", err);
    }
  };

  const handleUpdateClick = (product) => {
    setSelectedProduct(product);
    setProductName(product.name);
    setProductDescription(product.description);
    setShowUpdateForm(true);
  };

  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🔗 Supply Chain Management</h1>
        <div className="wallet-section">
          {!isConnected ? (
            <button onClick={connectWallet} disabled={loading} className="connect-btn">
              {loading ? "Connecting..." : "Connect Wallet"}
            </button>
          ) : (
            <div className="wallet-info">
              <span className="account">Connected: {formatAddress(account || "")}</span>
            </div>
          )}
        </div>
      </header>

      {error && <div className="error-message">⚠️ {error}</div>}

      {isConnected ? (
        <div className="main-content">
          <div className="stats-section">
            <div className="stat-card">
              <h3>Total Products</h3>
              <p className="stat-number">{productCount}</p>
            </div>
          </div>

          <div className="actions-section">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="action-btn primary"
            >
              {showCreateForm ? "Cancel" : "+ Create Product"}
            </button>
            <button
              onClick={() => setShowTransferForm(!showTransferForm)}
              className="action-btn secondary"
            >
              {showTransferForm ? "Cancel" : "Transfer Product"}
            </button>
            <button onClick={loadProducts} className="action-btn" disabled={loading}>
              🔄 Refresh
            </button>
          </div>

          {showCreateForm && (
            <div className="form-card">
              <h2>Create New Product</h2>
              <form onSubmit={handleCreateProduct}>
                <div className="form-group">
                  <label>Product Name</label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    required
                    placeholder="Enter product name"
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    required
                    placeholder="Enter product description"
                    rows={4}
                  />
                </div>
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? "Creating..." : "Create Product"}
                </button>
              </form>
            </div>
          )}

          {showTransferForm && (
            <div className="form-card">
              <h2>Transfer Product</h2>
              <form onSubmit={handleTransferProduct}>
                <div className="form-group">
                  <label>Product ID</label>
                  <input
                    type="number"
                    value={transferProductId}
                    onChange={(e) => setTransferProductId(e.target.value)}
                    required
                    placeholder="Enter product ID"
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label>Transfer To Address</label>
                  <input
                    type="text"
                    value={transferAddress}
                    onChange={(e) => setTransferAddress(e.target.value)}
                    required
                    placeholder="0x..."
                  />
                </div>
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? "Transferring..." : "Transfer Product"}
                </button>
              </form>
            </div>
          )}

          {showUpdateForm && selectedProduct && (
            <div className="form-card">
              <h2>Update Product #{selectedProduct.id}</h2>
              <form onSubmit={handleUpdateProduct}>
                <div className="form-group">
                  <label>Product Name</label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    required
                    rows={4}
                  />
                </div>
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? "Updating..." : "Update Product"}
                </button>
              </form>
            </div>
          )}

          <div className="products-section">
            <h2>Products</h2>
            {products.length === 0 ? (
              <div className="empty-state">
                <p>No products yet. Create your first product!</p>
              </div>
            ) : (
              <div className="products-grid">
                {products.map((product) => (
                  <div key={product.id} className="product-card">
                    <div className="product-header">
                      <h3>{product.name}</h3>
                      <span className="product-id">#{product.id}</span>
                    </div>
                    <p className="product-description">{product.description}</p>
                    <div className="product-info">
                      <div className="info-item">
                        <strong>Manufacturer:</strong>
                        <span>{formatAddress(product.manufacturer)}</span>
                      </div>
                      <div className="info-item">
                        <strong>Current Owner:</strong>
                        <span>{formatAddress(product.currentOwner)}</span>
                      </div>
                      <div className="info-item">
                        <strong>Created:</strong>
                        <span>{formatDate(product.timestamp)}</span>
                      </div>
                    </div>
                    {product.currentOwner?.toLowerCase() === account?.toLowerCase() && (
                      <div className="product-actions">
                        <button onClick={() => handleUpdateClick(product)} className="update-btn">
                          ✏️ Update
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="welcome-section">
          <h2>Welcome to Supply Chain Management</h2>
          <p>Connect your MetaMask wallet to get started</p>
          <div className="instructions">
            <h3>Setup Instructions:</h3>
            <ol>
              <li>Make sure MetaMask is installed in your browser</li>
              <li>Start Hardhat local node: <code>npm run node</code> (in contract folder)</li>
              <li>Deploy the contract: <code>npm run deploy</code> (in contract folder)</li>
              <li>Update CONTRACT_ADDRESS in <code>src/config.js</code> with deployed address</li>
              <li>Connect MetaMask to Hardhat Network (localhost:8545)</li>
              <li>Click \"Connect Wallet\" above</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

