/**
 * Utility for importing data from localStorage to MongoDB
 */

import { apiRequest } from "../services/api";

/**
 * Import data from localStorage to MongoDB
 * @returns {Promise<object>} Result of import operation
 */
export const importLocalStorageToMongoDB = async () => {
  try {
    // Get data from localStorage
    const incomes = JSON.parse(localStorage.getItem("incomes") || "[]");
    const expenses = JSON.parse(localStorage.getItem("expenses") || "[]");
    const assets = JSON.parse(localStorage.getItem("assets") || "[]");
    const liabilities = JSON.parse(localStorage.getItem("liabilities") || "[]");

    // Create payload
    const payload = {
      incomes,
      expenses,
      assets,
      liabilities,
    };

    // Send to server
    const response = await apiRequest("/import/localStorage", "POST", payload);

    return {
      success: true,
      message: "Data imported successfully to MongoDB",
      details: response,
    };
  } catch (error) {
    console.error("Error importing data to MongoDB:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

/**
 * Test MongoDB connection
 * @returns {Promise<object>} Connection status
 */
export const testMongoDBConnection = async () => {
  try {
    const response = await apiRequest("/test/db", "GET");
    return {
      success: true,
      ...response,
    };
  } catch (error) {
    console.error("Error testing MongoDB connection:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};
