import React from "react";
import { Link } from "react-router-dom";
import { useContract } from "../hooks/useContract.js";

const Home = () => {
  const { isConnected, userRole, connectWallet } = useContract();

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Blockchain Supply Chain Management</h1>
          <p className="text-xl mb-8">
            Transparent, secure, and efficient supply chain tracking using blockchain technology
          </p>
          {!isConnected && (
            <button
              onClick={connectWallet}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Connect Wallet to Get Started
            </button>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-4">🔐</div>
              <h3 className="text-xl font-semibold mb-2">Role-Based Access</h3>
              <p className="text-gray-600">
                Secure access control with different roles: Manufacturer, Transporter, Retailer, and Admin
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-xl font-semibold mb-2">Product Tracking</h3>
              <p className="text-gray-600">
                Track products through the entire supply chain with immutable blockchain records
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-4">🔗</div>
              <h3 className="text-xl font-semibold mb-2">Data Integrity</h3>
              <p className="text-gray-600">
                Verify data integrity using cryptographic hashes stored on-chain
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Role-Based Actions */}
      {isConnected && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Your Dashboard</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {userRole === "MANUFACTURER" || userRole === "ADMIN" ? (
                <Link
                  to="/products/create"
                  className="bg-blue-500 text-white p-6 rounded-lg hover:bg-blue-600 transition"
                >
                  <h3 className="text-xl font-semibold mb-2">Create Product</h3>
                  <p>Manufacturers can create new products in the supply chain</p>
                </Link>
              ) : null}

              {userRole === "TRANSPORTER" || userRole === "ADMIN" ? (
                <Link
                  to="/shipments/upload"
                  className="bg-yellow-500 text-white p-6 rounded-lg hover:bg-yellow-600 transition"
                >
                  <h3 className="text-xl font-semibold mb-2">Upload Batch Data</h3>
                  <p>Transporters can upload sensor data and record proofs</p>
                </Link>
              ) : null}

              {userRole === "RETAILER" || userRole === "ADMIN" ? (
                <Link
                  to="/shipments"
                  className="bg-green-500 text-white p-6 rounded-lg hover:bg-green-600 transition"
                >
                  <h3 className="text-xl font-semibold mb-2">Confirm Delivery</h3>
                  <p>Retailers can confirm delivery of shipments</p>
                </Link>
              ) : null}

              {userRole === "ADMIN" && (
                <Link
                  to="/admin"
                  className="bg-red-500 text-white p-6 rounded-lg hover:bg-red-600 transition"
                >
                  <h3 className="text-xl font-semibold mb-2">Admin Panel</h3>
                  <p>Manage roles and system settings</p>
                </Link>
              )}

              {!userRole || userRole === "NONE" ? (
                <div className="bg-gray-200 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-2">No Role Assigned</h3>
                  <p>Contact an administrator to assign you a role</p>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
