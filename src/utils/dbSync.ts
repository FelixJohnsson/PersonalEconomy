import { apiRequest } from "../services/api";

interface User {
  _id: string;
  name: string;
  email: string;
  isSetupComplete: boolean;
  incomes: any[]; // Define more specifically if needed
  expenses: any[]; // Define more specifically if needed
  assets: any[]; // Define more specifically if needed
  liabilities: any[]; // Define more specifically if needed
  subscriptions: any[];
  createdAt: string; // Date as string, can be Date type if necessary
  updatedAt: string; // Date as string, can be Date type if necessary
  __v: number;
}

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
    subscriptions: [],
  };

  try {
    // Fetch all user data from the consolidated endpoint
    console.log("📥 dbSync: Fetching user data from consolidated endpoint...");
    const userData: User = await apiRequest("/api/user-data", "GET");

    console.log("✅ dbSync: Completed fetching data from MongoDB", {
      userData,
    });

    return results;
  } catch (error) {
    console.error("❌ dbSync: Error in fetchUserDataFromMongoDB", error);
    return results;
  }
};

/**
 * Synchronizes user data between MongoDB and the app context
 * @param setters Object containing state setter functions
 */
export const syncUserDataFromMongoDB = async (setters: {
  setIncomes: (data: any[]) => void;
  setExpenses: (data: any[]) => void;
  setAssets: (data: any[]) => void;
  setLiabilities: (data: any[]) => void;
}) => {
  console.log("🔄 dbSync: Syncing user data from MongoDB to app state");

  try {
    const data: User = await apiRequest("/api/user-data", "GET");

    // Update app state with fetched data
    console.log("💾 dbSync: Updating incomes in app state");
    setters.setIncomes(data.incomes);

    console.log("💾 dbSync: Updating expenses in app state");
    setters.setExpenses(data.expenses);

    console.log("💾 dbSync: Updating assets in app state");
    setters.setAssets(data.assets);

    console.log("💾 dbSync: Updating liabilities in app state");
    setters.setLiabilities(data.liabilities);

    return data;
  } catch (error) {
    console.error("❌ dbSync: Error syncing data from MongoDB", error);
    throw error;
  }
};
