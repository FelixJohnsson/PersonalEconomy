import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useAppContext } from "../context/AppContext";
import { apiRequest } from "../services/api";
import DatabaseTools from "../components/DatabaseTools";

const ProfilePage: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const { syncWithMongoDB, useMongoDBData } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{
    isLoading: boolean;
    message: string | null;
    isError: boolean;
  }>({
    isLoading: false,
    message: null,
    isError: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      // Validate passwords if they're being updated
      if (formData.password) {
        if (formData.password.length < 6) {
          throw new Error("Password must be at least 6 characters");
        }
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords do not match");
        }
      }

      // Prepare update data
      const updateData: Record<string, any> = {
        name: formData.name,
      };

      // Only include password if it's being changed
      if (formData.password) {
        updateData.password = formData.password;
      }

      // Update profile
      const response = await apiRequest("/users/profile", "PUT", updateData);

      // Update local user state
      updateUser({
        name: response.name,
        email: response.email,
        isSetupComplete: response.isSetupComplete,
      });

      setSuccess("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncData = async () => {
    setSyncStatus({
      isLoading: true,
      message: "Syncing data from MongoDB...",
      isError: false,
    });

    try {
      const success = await syncWithMongoDB();
      if (success) {
        setSyncStatus({
          isLoading: false,
          message: "Data successfully synced from MongoDB!",
          isError: false,
        });
      } else {
        setSyncStatus({
          isLoading: false,
          message: "Failed to sync data from MongoDB.",
          isError: true,
        });
      }
    } catch (error) {
      setSyncStatus({
        isLoading: false,
        message: `Error syncing data: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        isError: true,
      });
    }

    // Clear message after 5 seconds
    setTimeout(() => {
      setSyncStatus((prev) => ({ ...prev, message: null }));
    }, 5000);
  };

  return (
    <div className="max-w-4xl p-6 mx-auto">
      <h1 className="mb-6 text-2xl font-bold">Your Profile</h1>

      {/* Data Sync Section */}
      <div className="p-6 mb-6 bg-white rounded-lg shadow">
        <h2 className="mb-4 text-xl font-semibold">Database Synchronization</h2>

        <div className="mb-4">
          <div className="flex items-center mb-2">
            <div
              className={`w-3 h-3 rounded-full mr-2 ${
                useMongoDBData ? "bg-green-500" : "bg-yellow-500"
              }`}
            ></div>
            <p>
              {useMongoDBData
                ? "Using data from MongoDB"
                : "Using data from localStorage (not synced with MongoDB)"}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSyncData}
              disabled={syncStatus.isLoading}
              className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {syncStatus.isLoading ? "Syncing..." : "Sync Data from MongoDB"}
            </button>

            <button
              onClick={async () => {
                try {
                  setSyncStatus({
                    isLoading: true,
                    message: "Testing API connection...",
                    isError: false,
                  });

                  const API_URL =
                    process.env.REACT_APP_API_URL || "http://localhost:5001";
                  const token = localStorage.getItem("token");

                  // Try API requests to test endpoints
                  const results: {
                    root: boolean;
                    users: boolean;
                    userData: boolean;
                    token: boolean;
                    auth?: boolean;
                  } = {
                    root: await fetch(`${API_URL}/api`)
                      .then((r) => r.ok)
                      .catch(() => false),
                    users: await fetch(`${API_URL}/api/users`)
                      .then((r) => r.ok)
                      .catch(() => false),
                    userData: await fetch(`${API_URL}/api/user-data`)
                      .then((r) => r.ok)
                      .catch(() => false),
                    token: !!token,
                  };

                  // Test authenticated request if token exists
                  if (token) {
                    try {
                      const authResult = await fetch(
                        `${API_URL}/api/users/profile`,
                        {
                          headers: {
                            Authorization: `Bearer ${token}`,
                          },
                        }
                      );

                      results.auth = authResult.ok;
                      if (authResult.ok) {
                        const profileData = await authResult.json();
                        console.log("Profile data retrieved:", profileData);
                      }
                    } catch (error) {
                      results.auth = false;
                      console.error("Auth test failed:", error);
                    }
                  }

                  console.log("API Connection Test Results:", results);

                  setSyncStatus({
                    isLoading: false,
                    message: `Connection test: Root: ${
                      results.root ? "✅" : "❌"
                    }, Users: ${results.users ? "✅" : "❌"}, User Data: ${
                      results.userData ? "✅" : "❌"
                    }, Token: ${results.token ? "✅" : "❌"}${
                      results.auth !== undefined
                        ? `, Auth: ${results.auth ? "✅" : "❌"}`
                        : ""
                    }`,
                    isError: false,
                  });
                } catch (error) {
                  setSyncStatus({
                    isLoading: false,
                    message: `Error testing connection: ${
                      error instanceof Error ? error.message : "Unknown error"
                    }`,
                    isError: true,
                  });
                }
              }}
              className="px-4 py-2 text-white bg-gray-600 rounded hover:bg-gray-700"
            >
              Test Connection
            </button>

            <button
              onClick={async () => {
                try {
                  setSyncStatus({
                    isLoading: true,
                    message: "Fetching user data directly...",
                    isError: false,
                  });

                  const API_URL =
                    process.env.REACT_APP_API_URL || "http://localhost:5001";
                  const token = localStorage.getItem("token");

                  if (!token) {
                    setSyncStatus({
                      isLoading: false,
                      message: "No auth token found",
                      isError: true,
                    });
                    return;
                  }

                  const response = await fetch(`${API_URL}/api/user-data`, {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  });

                  if (!response.ok) {
                    throw new Error(
                      `API error: ${response.status} ${response.statusText}`
                    );
                  }

                  const data = await response.json();
                  console.log("User data:", data);

                  setSyncStatus({
                    isLoading: false,
                    message: `Retrieved data: ${data.incomes.length} incomes, ${data.expenses.length} expenses, ${data.assets.length} assets, ${data.liabilities.length} liabilities`,
                    isError: false,
                  });
                } catch (error) {
                  console.error("Direct data test failed:", error);
                  setSyncStatus({
                    isLoading: false,
                    message: `Error fetching data: ${
                      error instanceof Error ? error.message : "Unknown error"
                    }`,
                    isError: true,
                  });
                }
              }}
              className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700"
            >
              Test Data Fetch
            </button>
          </div>

          {syncStatus.message && (
            <div
              className={`mt-2 p-2 text-sm rounded ${
                syncStatus.isError
                  ? "bg-red-100 text-red-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {syncStatus.message}
            </div>
          )}
        </div>
      </div>

      {/* Profile information */}
      <div className="p-6 mb-6 bg-white rounded-lg shadow">
        {!isEditing ? (
          <div className="space-y-4">
            <div className="flex justify-between">
              <h2 className="text-xl font-semibold">Account Information</h2>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                Edit Profile
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{user?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
            </div>
            <div className="pt-4 mt-4 border-t">
              <button
                onClick={logout}
                className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl font-semibold">Edit Profile</h2>

            {/* Error message */}
            {error && (
              <div className="p-3 text-sm text-white bg-red-500 rounded">
                {error}
              </div>
            )}

            {/* Success message */}
            {success && (
              <div className="p-3 text-sm text-white bg-green-500 rounded">
                {success}
              </div>
            )}

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                disabled
                value={formData.email}
                className="w-full px-3 py-2 mt-1 text-gray-500 bg-gray-100 border border-gray-300 rounded-md"
              />
              <p className="mt-1 text-xs text-gray-500">
                Email cannot be changed
              </p>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                New Password (leave blank to keep current)
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex gap-3 pt-4 mt-4 border-t">
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Database Tools section */}
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="mb-4 text-xl font-semibold">Database Tools</h2>
        <DatabaseTools />
      </div>
    </div>
  );
};

export default ProfilePage;
