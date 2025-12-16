import React from "react";
import { FaGithub } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-10 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand / About */}
        <div>
          <h1 className="text-2xl font-bold text-blue-400 mb-3">🔗 SupplyChain</h1>
          <p className="text-sm text-gray-400">
            A blockchain-based supply chain management system ensuring transparency,
            security, and data integrity throughout the supply chain.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-white font-semibold mb-3">Quick Links</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="/" className="hover:text-blue-400">
                Home
              </a>
            </li>
            <li>
              <a href="/products" className="hover:text-blue-400">
                Products
              </a>
            </li>
            <li>
              <a href="/shipments" className="hover:text-blue-400">
                Shipments
              </a>
            </li>
            <li>
              <a href="/profile" className="hover:text-blue-400">
                Profile
              </a>
            </li>
          </ul>
        </div>

        {/* About */}
        <div>
          <h2 className="text-white font-semibold mb-3">About</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="#" className="hover:text-blue-400">
                Documentation
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-400">
                Architecture
              </a>
            </li>
            <li>
              <a href="https://github.com" className="hover:text-blue-400 flex items-center">
                <FaGithub className="mr-2" /> GitHub
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Divider & Copyright */}
      <hr className="border-gray-700 my-8" />
      <div className="text-center text-sm text-gray-500">
        © {new Date().getFullYear()}{" "}
        <span className="text-blue-400">SupplyChain Management System</span> — All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
