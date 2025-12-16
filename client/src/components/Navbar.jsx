import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaTimes, FaUserCircle } from "react-icons/fa";
import { useContract } from "../hooks/useContract.js";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { isConnected, account, userRole, connectWallet, userRoles } = useContract();
  const navigate = useNavigate();

  const formatAddress = (addr) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      ADMIN: "bg-red-500",
      MANUFACTURER: "bg-blue-500",
      TRANSPORTER: "bg-yellow-500",
      RETAILER: "bg-green-500",
      AUDITOR: "bg-purple-500",
      NONE: "bg-gray-500",
    };
    return colors[role] || colors.NONE;
  };

  return (
    <nav className="bg-gray-900 text-white fixed w-full z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-blue-400">
          🔗 SupplyChain
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="hover:text-blue-400">
            Home
          </Link>
          <Link to="/products" className="hover:text-blue-400">
            Products
          </Link>
          <Link to="/shipments" className="hover:text-blue-400">
            Shipments
          </Link>

          {isConnected ? (
            <>
              {/* User Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center hover:text-blue-400"
                >
                  <FaUserCircle className="mr-1 text-xl" />
                  {formatAddress(account)}
                  {userRole && (
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${getRoleBadgeColor(userRole)}`}>
                      {userRole}
                    </span>
                  )}
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-md shadow-lg">
                    <div className="p-4 border-b border-gray-700">
                      <p className="text-sm text-gray-400">Address</p>
                      <p className="text-xs font-mono">{account}</p>
                      {userRole && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-400">Role</p>
                          <p className="text-sm font-semibold">{userRole}</p>
                          {userRoles && userRoles.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {userRoles.map((role, idx) => (
                                <span
                                  key={idx}
                                  className={`px-2 py-0.5 rounded text-xs ${getRoleBadgeColor(role)}`}
                                >
                                  {role}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 hover:bg-gray-700"
                      onClick={() => setProfileOpen(false)}
                    >
                      View Profile
                    </Link>
                    {(userRole === "ADMIN" || userRoles?.includes("ADMIN")) && (
                      <Link
                        to="/admin"
                        className="block px-4 py-2 hover:bg-gray-700"
                        onClick={() => setProfileOpen(false)}
                      >
                        Admin Panel
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={connectWallet}
              className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md"
            >
              Connect Wallet
            </button>
          )}
        </div>

        {/* Hamburger (Mobile) */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-2xl focus:outline-none"
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-gray-800 px-4 py-3 space-y-3">
          <Link to="/" className="block hover:text-blue-400" onClick={() => setMenuOpen(false)}>
            Home
          </Link>
          <Link
            to="/products"
            className="block hover:text-blue-400"
            onClick={() => setMenuOpen(false)}
          >
            Products
          </Link>
          <Link
            to="/shipments"
            className="block hover:text-blue-400"
            onClick={() => setMenuOpen(false)}
          >
            Shipments
          </Link>

          {isConnected ? (
            <>
              <div className="pt-2 border-t border-gray-700">
                <p className="text-sm text-gray-400">Address</p>
                <p className="text-xs font-mono">{account}</p>
                {userRole && (
                  <p className="mt-1 text-sm">
                    Role: <span className={getRoleBadgeColor(userRole)}>{userRole}</span>
                  </p>
                )}
              </div>
              <Link
                to="/profile"
                className="block hover:text-blue-400"
                onClick={() => setMenuOpen(false)}
              >
                View Profile
              </Link>
            </>
          ) : (
            <button
              onClick={() => {
                connectWallet();
                setMenuOpen(false);
              }}
              className="w-full bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md"
            >
              Connect Wallet
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
