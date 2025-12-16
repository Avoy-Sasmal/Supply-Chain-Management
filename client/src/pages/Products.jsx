import React, { useEffect, useState } from "react";
import { useContract } from "../hooks/useContract.js";
import { Link } from "react-router-dom";

const Products = () => {
  const { isConnected, userRole, getAllProducts, loading } = useContract();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (isConnected) {
      loadProducts();
    }
  }, [isConnected]);

  const loadProducts = async () => {
    const prods = await getAllProducts();
    setProducts(prods);
  };

  const formatAddress = (addr) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  if (!isConnected) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please Connect Your Wallet</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Products</h1>
          {(userRole === "MANUFACTURER" || userRole === "ADMIN") && (
            <Link
              to="/products/create"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              + Create Product
            </Link>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-600">No products found.</p>
            {(userRole === "MANUFACTURER" || userRole === "ADMIN") && (
              <Link
                to="/products/create"
                className="inline-block mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Create Your First Product
              </Link>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold">{product.name}</h3>
                  <span className="bg-gray-200 px-2 py-1 rounded text-sm">#{product.id}</span>
                </div>
                <p className="text-gray-600 mb-4">{product.description}</p>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Manufacturer:</span>
                    <p className="font-mono text-xs">{formatAddress(product.manufacturer)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Current Owner:</span>
                    <p className="font-mono text-xs">{formatAddress(product.currentOwner)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Created:</span>
                    <p className="text-xs">{formatDate(product.timestamp)}</p>
                  </div>
                </div>
                {(userRole === "MANUFACTURER" || userRole === "ADMIN") && (
                  <div className="mt-4 pt-4 border-t">
                    <Link
                      to={`/products/${product.id}/edit`}
                      className="text-blue-500 hover:text-blue-600 text-sm"
                    >
                      Edit Product
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;

