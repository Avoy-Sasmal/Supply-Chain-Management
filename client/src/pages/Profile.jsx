import React, { useEffect, useState } from "react";
import { useContract } from "../hooks/useContract.js";
import { BACKEND_URL } from "../config.js";

const Profile = () => {
  const { account, isConnected, userRole, userRoles, connectWallet } = useContract();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isConnected && account) {
      fetchProfile();
    }
  }, [account, isConnected]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/auth/profile/${account}`);
      const data = await response.json();
      setProfileData(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
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

  if (!isConnected) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please Connect Your Wallet</h2>
          <button
            onClick={connectWallet}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">User Profile</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Wallet Information</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Address</p>
              <p className="font-mono text-sm break-all">{account}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Primary Role</p>
              <span className={`inline-block px-3 py-1 rounded text-white ${getRoleBadgeColor(userRole)}`}>
                {userRole || "NONE"}
              </span>
            </div>
            {userRoles && userRoles.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">All Roles</p>
                <div className="flex flex-wrap gap-2">
                  {userRoles.map((role, idx) => (
                    <span
                      key={idx}
                      className={`px-3 py-1 rounded text-white text-sm ${getRoleBadgeColor(role)}`}
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Role Permissions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Role Permissions</h2>
          <div className="space-y-4">
            {userRole === "MANUFACTURER" || userRoles?.includes("MANUFACTURER") ? (
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-blue-500">Manufacturer</h3>
                <ul className="text-sm text-gray-600 mt-2 space-y-1">
                  <li>✓ Create products</li>
                  <li>✓ Update product information</li>
                  <li>✓ Transfer products</li>
                  <li>✓ Create shipments</li>
                </ul>
              </div>
            ) : null}

            {userRole === "TRANSPORTER" || userRoles?.includes("TRANSPORTER") ? (
              <div className="border-l-4 border-yellow-500 pl-4">
                <h3 className="font-semibold text-yellow-500">Transporter</h3>
                <ul className="text-sm text-gray-600 mt-2 space-y-1">
                  <li>✓ Upload batch data (sensor/temperature)</li>
                  <li>✓ Record proofs on blockchain</li>
                  <li>✓ Transfer products</li>
                </ul>
              </div>
            ) : null}

            {userRole === "RETAILER" || userRoles?.includes("RETAILER") ? (
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-green-500">Retailer</h3>
                <ul className="text-sm text-gray-600 mt-2 space-y-1">
                  <li>✓ Confirm delivery</li>
                  <li>✓ View shipment details</li>
                  <li>✓ Verify data integrity</li>
                </ul>
              </div>
            ) : null}

            {userRole === "ADMIN" || userRoles?.includes("ADMIN") ? (
              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="font-semibold text-red-500">Admin</h3>
                <ul className="text-sm text-gray-600 mt-2 space-y-1">
                  <li>✓ Grant roles to users</li>
                  <li>✓ Revoke roles from users</li>
                  <li>✓ Full system access</li>
                </ul>
              </div>
            ) : null}

            {(!userRole || userRole === "NONE") && (
              <div className="border-l-4 border-gray-500 pl-4">
                <h3 className="font-semibold text-gray-500">No Role Assigned</h3>
                <p className="text-sm text-gray-600 mt-2">
                  Contact an administrator to assign you a role
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

