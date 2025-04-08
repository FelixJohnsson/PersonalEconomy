import { apiRequest } from "../services/api";

/**
 * Fetches user data from MongoDB and returns it
 * @returns Promise containing all user data
 */
export const fetchUserDataFromMongoDB = async () => {
  console.log("📥 dbSync: Fetching user data from MongoDB");

  const results = {
    incomes: [],
    expenses: [],
    assets: [],
    liabilities: [],
  };

  try {
    // Fetch all user data from the consolidated endpoint
    console.log("📥 dbSync: Fetching user data from consolidated endpoint...");
    const userData = await apiRequest("/api/user-data", "GET");

    // Extract data from the response
    results.incomes = userData.incomes || [];
    results.expenses = userData.expenses || [];
    results.assets = userData.assets || [];
    results.liabilities = userData.liabilities || [];

    console.log("✅ dbSync: Completed fetching data from MongoDB", {
      incomesCount: results.incomes.length,
      expensesCount: results.expenses.length,
      assetsCount: results.assets.length,
      liabilitiesCount: results.liabilities.length,
    });

    return results;
  } catch (error) {
    console.error("❌ dbSync: Error in fetchUserDataFromMongoDB", error);
    return results; // Return empty arrays instead of throwing
  }
};

/**
 * Synchronizes user data between MongoDB and the app context
 * @param setters Object containing state setter functions
 */
export const syncUserDataFromMongoDB = async (setters: {
  setIncomes?: (data: any[]) => void;
  setExpenses?: (data: any[]) => void;
  setAssets?: (data: any[]) => void;
  setLiabilities?: (data: any[]) => void;
}) => {
  console.log("🔄 dbSync: Syncing user data from MongoDB to app state");

  try {
    const data = await fetchUserDataFromMongoDB();

    // Update app state with fetched data
    if (setters.setIncomes && data.incomes.length > 0) {
      console.log(
        "💾 dbSync: Updating incomes in app state",
        data.incomes.length
      );
      setters.setIncomes(data.incomes);
    }

    if (setters.setExpenses && data.expenses.length > 0) {
      console.log(
        "💾 dbSync: Updating expenses in app state",
        data.expenses.length
      );
      setters.setExpenses(data.expenses);
    }

    if (setters.setAssets && data.assets.length > 0) {
      console.log(
        "💾 dbSync: Updating assets in app state",
        data.assets.length
      );
      setters.setAssets(data.assets);
    }

    if (setters.setLiabilities && data.liabilities.length > 0) {
      console.log(
        "💾 dbSync: Updating liabilities in app state",
        data.liabilities.length
      );
      setters.setLiabilities(data.liabilities);
    }

    return data;
  } catch (error) {
    console.error("❌ dbSync: Error syncing data from MongoDB", error);
    throw error;
  }
};
