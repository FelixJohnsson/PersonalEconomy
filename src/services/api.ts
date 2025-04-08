/**
 * API Service
 * This service handles all API requests to the backend
 */
import {
  Income,
  Expense,
  Asset,
  Liability,
  AssetValue,
  AssetDeposit,
} from "../types";

// API base URL - make sure it doesn't end with /api
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5003";

/**
 * Make API request with authentication
 * @param endpoint API endpoint
 * @param method HTTP method
 * @param data Request data
 * @returns Response data
 */
export const apiRequest = async (
  endpoint: string,
  method = "GET",
  data: any = null
): Promise<any> => {
  const requestUrl = `${API_URL}${
    endpoint.startsWith("/") ? endpoint : `/${endpoint}`
  }`;

  console.log(`🚀 API Request: ${method} ${requestUrl}`);

  try {
    const token = localStorage.getItem("token");

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const config: RequestInit = {
      method,
      headers,
      ...(data && { body: JSON.stringify(data) }),
    };

    console.log("Request config:", {
      url: requestUrl,
      method,
      hasToken: !!token,
      hasData: !!data,
    });

    const response = await fetch(requestUrl, config);
    const responseData = await response.json();

    if (!response.ok) {
      console.error(`❌ API Error (${response.status}):`, responseData);
      throw new Error(responseData.message || "An error occurred");
    }

    console.log(`✅ API Response (${response.status}):`, responseData);
    return responseData;
  } catch (error: any) {
    console.error(`❌ API Request Failed: ${error.message}`);
    throw error;
  }
};

export interface ExpensePayload {
  name: string;
  amount: number;
  category: string;
  date: string;
  isRecurring?: boolean;
  necessityLevel?: string;
  frequency?: string;
  notes?: string;
}

export interface AssetPayload extends Asset {}

export interface LiabilityPayload {
  name: string;
  type: string;
  amount: number;
  interestRate: number;
  minimumPayment: number;
  notes?: string;
}

export interface AssetValuePayload {
  value: number;
  date: string;
}

export interface AssetDepositPayload {
  amount: number;
  date: string;
  notes?: string;
}

/**
 * User API Services
 */
export const userApi = {
  register: (userData: any) => apiRequest("/api/users", "POST", userData),
  login: (credentials: { email: string; password: string }) =>
    apiRequest("/api/users/login", "POST", credentials),
  getProfile: () => apiRequest("/api/users/profile"),
  updateProfile: (userData: any) =>
    apiRequest("/api/users/profile", "PUT", userData),
};

/**
 * Income API Services
 */
export const incomeApi = {
  getIncomes: () =>
    apiRequest("/api/user-data", "GET").then((data) => data.incomes),
  createIncome: (incomeData: Omit<Income, "_id">): Promise<Income> =>
    apiRequest("/api/user-data/incomes", "POST", incomeData),
  updateIncome: (id: string, incomeData: Partial<Income>) =>
    apiRequest(`/api/user-data/incomes/${id}`, "PUT", incomeData),
  deleteIncome: (id: string) =>
    apiRequest(`/api/user-data/incomes/${id}`, "DELETE"),
};

/**
 * Expense API Services
 */
export const expenseApi = {
  getExpenses: () =>
    apiRequest("/api/user-data", "GET").then((data) => data.expenses),
  createExpense: (expenseData: ExpensePayload) =>
    apiRequest("/api/user-data/expenses", "POST", expenseData),
  updateExpense: (id: string, expenseData: Partial<ExpensePayload>) =>
    apiRequest(`/api/user-data/expenses/${id}`, "PUT", expenseData),
  deleteExpense: (id: string) =>
    apiRequest(`/api/user-data/expenses/${id}`, "DELETE"),
};

/**
 * Asset API Services
 */
export const assetApi = {
  getAssets: () =>
    apiRequest("/api/user-data", "GET").then((data) => data.assets),
  createAsset: (assetData: AssetPayload) =>
    apiRequest("/api/user-data/assets", "POST", assetData),
  updateAsset: (id: string, assetData: Partial<AssetPayload>) =>
    apiRequest(`/api/user-data/assets/${id}`, "PUT", assetData),
  deleteAsset: (id: string) =>
    apiRequest(`/api/user-data/assets/${id}`, "DELETE"),
  updateAssetValue: (id: string, valueData: AssetValuePayload) =>
    apiRequest(`/api/user-data/assets/${id}/value`, "PUT", valueData),
  addAssetDeposit: (id: string, depositData: AssetDepositPayload) =>
    apiRequest(`/api/user-data/assets/${id}/deposit`, "POST", depositData),
};

/**
 * Liability API Services
 */
export const liabilityApi = {
  getLiabilities: () =>
    apiRequest("/api/user-data", "GET").then((data) => data.liabilities),
  createLiability: (liabilityData: LiabilityPayload) =>
    apiRequest("/api/user-data/liabilities", "POST", liabilityData),
  updateLiability: (id: string, liabilityData: Partial<LiabilityPayload>) =>
    apiRequest(`/api/user-data/liabilities/${id}`, "PUT", liabilityData),
  deleteLiability: (id: string) =>
    apiRequest(`/api/user-data/liabilities/${id}`, "DELETE"),
};

/**
 * Savings Goal API Services
 */
export const savingsGoalApi = {
  getSavingsGoals: () => apiRequest("/savings-goals"),
  getSavingsGoal: (id: string) => apiRequest(`/savings-goals/${id}`),
  createSavingsGoal: (goalData: any) =>
    apiRequest("/savings-goals", "POST", goalData),
  updateSavingsGoal: (id: string, goalData: any) =>
    apiRequest(`/savings-goals/${id}`, "PUT", goalData),
  deleteSavingsGoal: (id: string) =>
    apiRequest(`/savings-goals/${id}`, "DELETE"),
};

/**
 * Subscription API Services
 */
export const subscriptionApi = {
  getSubscriptions: () => apiRequest("/subscriptions"),
  getSubscription: (id: string) => apiRequest(`/subscriptions/${id}`),
  createSubscription: (subscriptionData: any) =>
    apiRequest("/subscriptions", "POST", subscriptionData),
  updateSubscription: (id: string, subscriptionData: any) =>
    apiRequest(`/subscriptions/${id}`, "PUT", subscriptionData),
  deleteSubscription: (id: string) =>
    apiRequest(`/subscriptions/${id}`, "DELETE"),
};

/**
 * Budget API Services
 */
export const budgetApi = {
  getBudgetItems: () => apiRequest("/budget"),
  updateBudgetItems: (budgetData: any) =>
    apiRequest("/budget", "PUT", budgetData),
};

/**
 * Note API Services
 */
export const noteApi = {
  getNotes: () => apiRequest("/notes"),
  getNote: (id: string) => apiRequest(`/notes/${id}`),
  createNote: (noteData: any) => apiRequest("/notes", "POST", noteData),
  updateNote: (id: string, noteData: any) =>
    apiRequest(`/notes/${id}`, "PUT", noteData),
  deleteNote: (id: string) => apiRequest(`/notes/${id}`, "DELETE"),
  toggleNotePin: (id: string) => apiRequest(`/notes/${id}/pin`, "PUT"),
};

/**
 * Tax Return API Services
 */
export const taxReturnApi = {
  getTaxReturns: () => apiRequest("/tax-returns"),
  getTaxReturn: (id: string) => apiRequest(`/tax-returns/${id}`),
  createTaxReturn: (taxReturnData: any) =>
    apiRequest("/tax-returns", "POST", taxReturnData),
  updateTaxReturn: (id: string, taxReturnData: any) =>
    apiRequest(`/tax-returns/${id}`, "PUT", taxReturnData),
  deleteTaxReturn: (id: string) => apiRequest(`/tax-returns/${id}`, "DELETE"),
};
