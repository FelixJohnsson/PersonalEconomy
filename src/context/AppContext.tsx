// @ts-nocheck
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { syncUserDataFromMongoDB } from "../utils/dbSync";
import {
  apiRequest,
  incomeApi,
  expenseApi,
  assetApi,
  liabilityApi,
} from "../services/api";
import {
  Income,
  Expense,
  Asset,
  Liability,
  SavingsGoal,
  FinancialSummary,
  SavingsProjection,
  Subscription,
  AssetValue,
  BudgetItem,
  Note,
  TaxReturn,
  IncomeFormData,
  Frequency,
} from "../types";

const generateId = () => Date.now().toString();

const initialAssets: Asset[] = [];

interface AppContextType {
  // State
  incomes: Income[];
  expenses: Expense[];
  assets: Asset[];
  liabilities: Liability[];
  savingsGoals: SavingsGoal[];
  notes: Note[];
  taxReturns: TaxReturn[];
  isLoading: boolean;

  // Income methods
  addIncome: (income: IncomeFormData) => void;
  updateIncome: (income: Income) => void;
  deleteIncome: (id: string) => void;

  // Expense methods
  addExpense: (expense: Omit<Expense, "id">) => void;
  updateExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;

  // Asset methods
  addAsset: (asset: Omit<Asset, "id">) => void;
  updateAsset: (asset: Asset) => void;
  deleteAsset: (id: string) => void;

  // Liability methods
  addLiability: (liability: Omit<Liability, "id">) => void;
  updateLiability: (liability: Liability) => void;
  deleteLiability: (id: string) => void;

  // Savings goal methods
  addSavingsGoal: (goal: Omit<SavingsGoal, "id">) => void;
  updateSavingsGoal: (goal: SavingsGoal) => void;
  deleteSavingsGoal: (id: string) => void;
  getSavingsGoalProgress: (goalId: string) => number;
  getAssetsForSavingsGoal: (goalId: string) => Asset[];

  // Summary methods
  getFinancialSummary: (
    customPeriod?: Record<string, string>
  ) => FinancialSummary;
  calculateSavingsProjection: (goal: SavingsGoal) => SavingsProjection;

  // Filter methods
  getExpensesByCategory: (category: string) => Expense[];
  getAllCategories: () => string[];

  // New methods
  updateAssetValue: (assetId: string, newValue: number) => void;
  addAssetDeposit: (assetId: string, depositAmount: number) => void;

  // Budget methods
  getBudgetItems: () => BudgetItem[];

  // Note methods
  addNote: (note: Omit<Note, "id" | "createdAt" | "updatedAt">) => void;
  updateNote: (note: Note) => void;
  deleteNote: (id: string) => void;
  toggleNotePin: (id: string) => void;

  // Tax return methods
  addTaxReturn: (taxReturn: Omit<TaxReturn, "id">) => void;
  updateTaxReturn: (taxReturn: TaxReturn) => void;
  deleteTaxReturn: (id: string) => void;

  // Setup state
  isFirstTimeUser: boolean;
  completeSetup: () => void;

  // Data import/export methods
  exportData: () => string;
  importData: (jsonData: string) => boolean;

  // Add new sync method
  syncWithMongoDB: () => Promise<boolean>;
  useMongoDBData: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, updateUser, user } = useAuth();

  // State with initialization flag
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [taxReturns, setTaxReturns] = useState<TaxReturn[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState<boolean>(
    user ? !user.isSetupComplete : true
  );
  const [useMongoDBData, setUseMongoDBData] = useState<boolean>(true);

  // Load data from MongoDB if authenticated
  useEffect(() => {
    const fetchMongoDBData = async () => {
      if (isAuthenticated) {
        console.log(
          "🔄 AppContext: User is authenticated, fetching data from MongoDB"
        );
        try {
          setIsLoading(true);
          await syncUserDataFromMongoDB({
            setIncomes,
            setExpenses,
            setAssets,
            setLiabilities,
          });
          setUseMongoDBData(true);
          console.log("✅ AppContext: Successfully loaded data from MongoDB");

          // Set first-time user status based on user profile
          if (user) {
            setIsFirstTimeUser(!user.isSetupComplete);
          }
        } catch (error) {
          console.error(
            "❌ AppContext: Error loading data from MongoDB:",
            error
          );
          setUseMongoDBData(false);
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (isAuthenticated) {
      fetchMongoDBData();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  // Update first-time user status when user changes
  useEffect(() => {
    if (user) {
      setIsFirstTimeUser(!user.isSetupComplete);
    }
  }, [user]);

  // Income methods
  const addIncome = async (income: IncomeFormData) => {
    try {
      if (useMongoDBData && isAuthenticated) {
        console.log("📝 AppContext: Adding income to MongoDB");

        const newIncome = await incomeApi.createIncome(income);
        console.warn("New income:", newIncome);
        setIncomes([...incomes, newIncome]);
      } else {
        console.warn("Error adding income", income);
      }
    } catch (error) {
      console.error(
        "❌ AppContext: Error adding income:",
        error,
        "useMongoDBData",
        useMongoDBData,
        "isAuthenticated",
        isAuthenticated
      );
    }
  };

  const updateIncome = async (income: Income) => {
    try {
      if (useMongoDBData && isAuthenticated) {
        console.log(`📝 AppContext: Updating income in MongoDB: ${income._id}`);
        console.log("Income object to update:", income);

        const updatedIncome = await incomeApi.updateIncome(income._id, income);
        setIncomes(updatedIncome);
      }
    } catch (error) {
      console.error("❌ AppContext: Error updating income:", error);
    }
  };

  const deleteIncome = async (id: string) => {
    try {
      if (useMongoDBData && isAuthenticated) {
        console.log(`📝 AppContext: Deleting income from MongoDB: ${id}`);

        // Find the income to be deleted to check if it has _id
        const incomeToDelete = incomes.find(
          (i) => String(i._id) === String(id)
        );
        if (!incomeToDelete) {
          console.error(`❌ AppContext: Income with ID ${id} not found`);
          return;
        }

        // Use MongoDB _id if available
        const mongoId = (incomeToDelete as any)._id || id;
        console.log(`Using ID for deletion: ${mongoId}`);

        await incomeApi.deleteIncome(mongoId);
      }
      // Remove from local state
      setIncomes(incomes.filter((i) => String(i._id) !== String(id)));
    } catch (error) {
      console.error("❌ AppContext: Error deleting income:", error);
    }
  };

  // Expense methods
  const addExpense = async (expense: Omit<Expense, "id">) => {
    try {
      const expenseWithDate = {
        ...expense,
        date: expense.date || new Date().toISOString().split("T")[0],
      };

      if (useMongoDBData && isAuthenticated) {
        console.log("📝 AppContext: Adding expense to MongoDB");
        const newExpense = await expenseApi.createExpense(expenseWithDate);
        setExpenses((prev) => [...prev, newExpense]);
      } else {
        const newExpense = {
          ...expenseWithDate,
          id: Date.now().toString(),
        };
        setExpenses((prev) => [...prev, newExpense]);
      }
    } catch (error) {
      console.error("❌ AppContext: Error adding expense:", error);
    }
  };

  const updateExpense = async (updatedExpense: Expense) => {
    try {
      const expenseWithDate = {
        ...updatedExpense,
        date: updatedExpense.date || new Date().toISOString().split("T")[0],
      };

      if (useMongoDBData && isAuthenticated) {
        console.log(
          `📝 AppContext: Updating expense in MongoDB: ${updatedExpense._id}`
        );
        const result = await expenseApi.updateExpense(
          updatedExpense._id,
          expenseWithDate
        );
        setExpenses((prev) =>
          prev.map((expense) =>
            expense._id === updatedExpense._id ? result : expense
          )
        );
      } else {
        setExpenses((prev) =>
          prev.map((expense) =>
            expense._id === updatedExpense._id ? expenseWithDate : expense
          )
        );
      }
    } catch (error) {
      console.error("❌ AppContext: Error updating expense:", error);
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      if (useMongoDBData && isAuthenticated) {
        console.log(`📝 AppContext: Deleting expense from MongoDB: ${id}`);
        await expenseApi.deleteExpense(id);
      }
      setExpenses(expenses.filter((e) => e._id !== id));
    } catch (error) {
      console.error("❌ AppContext: Error deleting expense:", error);
    }
  };

  // Asset methods
  const addAsset = async (asset: Omit<Asset, "id">) => {
    try {
      if (useMongoDBData && isAuthenticated) {
        console.log("📝 AppContext: Adding asset to MongoDB");
        const newAsset = await assetApi.createAsset({
          ...asset,
          id: generateId(),
        });
        setAssets((prev) => [...prev, newAsset]);
      } else {
        const newAsset: Asset = {
          ...asset,
          id: generateId(),
        };
        setAssets((prev) => [...prev, newAsset]);
      }
    } catch (error) {
      console.error("❌ AppContext: Error adding asset:", error);
    }
  };

  const updateAsset = async (asset: Asset) => {
    try {
      if (useMongoDBData && isAuthenticated) {
        console.log(`📝 AppContext: Updating asset in MongoDB: ${asset.id}`);
        const updatedAsset = await assetApi.updateAsset(asset.id, asset);
        setAssets((prev) =>
          prev.map((a) => (a.id === asset.id ? updatedAsset : a))
        );
      } else {
        setAssets((prev) => prev.map((a) => (a.id === asset.id ? asset : a)));
      }
    } catch (error) {
      console.error("❌ AppContext: Error updating asset:", error);
    }
  };

  const deleteAsset = async (assetId: string) => {
    try {
      if (useMongoDBData && isAuthenticated) {
        console.log(`📝 AppContext: Deleting asset from MongoDB: ${assetId}`);
        await assetApi.deleteAsset(assetId);
      }
      setAssets((prev) => prev.filter((asset) => asset.id !== assetId));
    } catch (error) {
      console.error("❌ AppContext: Error deleting asset:", error);
    }
  };

  // Liability methods
  const addLiability = async (liability: Omit<Liability, "id">) => {
    try {
      if (useMongoDBData && isAuthenticated) {
        console.log("📝 AppContext: Adding liability to MongoDB");
        const newLiability = await liabilityApi.createLiability(liability);
        setLiabilities((prev) => [...prev, newLiability]);
      } else {
        const newLiability = {
          ...liability,
          id: generateId(),
        };
        setLiabilities((prev) => [...prev, newLiability]);
      }
    } catch (error) {
      console.error("❌ AppContext: Error adding liability:", error);
    }
  };

  const updateLiability = async (liability: Liability) => {
    try {
      if (useMongoDBData && isAuthenticated) {
        console.log(
          `📝 AppContext: Updating liability in MongoDB: ${liability.id}`
        );
        const updatedLiability = await liabilityApi.updateLiability(
          liability.id,
          liability
        );
        setLiabilities((prev) =>
          prev.map((l) => (l.id === liability.id ? updatedLiability : l))
        );
      } else {
        setLiabilities((prev) =>
          prev.map((l) => (l.id === liability.id ? liability : l))
        );
      }
    } catch (error) {
      console.error("❌ AppContext: Error updating liability:", error);
    }
  };

  const deleteLiability = async (id: string) => {
    try {
      if (useMongoDBData && isAuthenticated) {
        console.log(`📝 AppContext: Deleting liability from MongoDB: ${id}`);
        await liabilityApi.deleteLiability(id);
      }
      setLiabilities((prev) => prev.filter((liability) => liability.id !== id));
    } catch (error) {
      console.error("❌ AppContext: Error deleting liability:", error);
    }
  };

  const updateSubscription = async (subscription: Subscription) => {
    try {
      if (useMongoDBData && isAuthenticated) {
        console.log(
          `📝 AppContext: Updating subscription in MongoDB: ${subscription._id}`
        );
        const updatedSubscription = await apiRequest(
          `/api/subscriptions/${subscription._id}`,
          "PUT",
          subscription
        );
        setSubscriptions(
          subscriptions.map((s) =>
            s._id === subscription._id ? updatedSubscription : s
          )
        );
      } else {
        setSubscriptions(
          subscriptions.map((s) =>
            s._id === subscription._id ? subscription : s
          )
        );
      }
    } catch (error) {
      console.error("❌ AppContext: Error updating subscription:", error);
    }
  };

  const getActiveSubscriptions = () => {
    return subscriptions.filter((sub) => sub.active);
  };

  // Savings goal methods
  const addSavingsGoal = async (goal: Omit<SavingsGoal, "id">) => {
    try {
      if (useMongoDBData && isAuthenticated) {
        console.log("📝 AppContext: Adding savings goal to MongoDB");
        const newGoal = await apiRequest("/api/savings-goals", "POST", goal);
        setSavingsGoals([...savingsGoals, newGoal]);
      } else {
        const newGoal = { ...goal, id: Date.now().toString() };
        setSavingsGoals([...savingsGoals, newGoal]);
      }
    } catch (error) {
      console.error("❌ AppContext: Error adding savings goal:", error);
    }
  };

  const updateSavingsGoal = async (goal: SavingsGoal) => {
    try {
      if (useMongoDBData && isAuthenticated) {
        console.log(
          `📝 AppContext: Updating savings goal in MongoDB: ${goal.id}`
        );
        const updatedGoal = await apiRequest(
          `/api/savings-goals/${goal.id}`,
          "PUT",
          goal
        );
        setSavingsGoals(
          savingsGoals.map((g) => (g.id === goal.id ? updatedGoal : g))
        );
      } else {
        setSavingsGoals(savingsGoals.map((g) => (g.id === goal.id ? goal : g)));
      }
    } catch (error) {
      console.error("❌ AppContext: Error updating savings goal:", error);
    }
  };

  const deleteSavingsGoal = async (id: string) => {
    try {
      if (useMongoDBData && isAuthenticated) {
        console.log(`📝 AppContext: Deleting savings goal from MongoDB: ${id}`);
        await apiRequest(`/api/savings-goals/${id}`, "DELETE");
      }

      // Remove the goal
      setSavingsGoals(savingsGoals.filter((g) => g.id !== id));

      // Unlink any assets associated with this goal
      setAssets(
        assets.map((asset) =>
          asset.savingsGoalId === id ? { ...asset, savingsGoalId: null } : asset
        )
      );
    } catch (error) {
      console.error("❌ AppContext: Error deleting savings goal:", error);
    }
  };

  // Calculate the current amount saved towards a savings goal
  const getSavingsGoalProgress = (goalId: string): number => {
    return assets
      .filter((asset) => asset.savingsGoalId === goalId)
      .reduce((total, asset) => total + asset.value, 0);
  };

  // Get all assets linked to a savings goal
  const getAssetsForSavingsGoal = (goalId: string): Asset[] => {
    return assets.filter((asset) => asset.savingsGoalId === goalId);
  };

  // Get expenses by category
  const getExpensesByCategory = (category: string): Expense[] => {
    return expenses.filter((expense) => expense.category === category);
  };

  // Get all unique categories from expenses and subscriptions
  const getAllCategories = (): string[] => {
    const expenseCategories = expenses.map((expense) => expense.category);
    const subscriptionCategories = subscriptions.map((sub) => sub.category);
    const allCategories = [...expenseCategories, ...subscriptionCategories];

    // Return unique categories only
    return Array.from(new Set(allCategories));
  };

  // Summary methods
  const getFinancialSummary = (
    customPeriod?: Record<string, string>
  ): FinancialSummary => {
    // Calculate billing period dates (25th to 25th)
    let startStr: string;
    let endStr: string;

    if (customPeriod) {
      // Use custom period dates if provided
      startStr = customPeriod.startDate;
      endStr = customPeriod.endDate;
    } else {
      // Default to billing period (25th of previous month to 25th of current month)
      const today = new Date();

      // Start date is always 25th of previous month
      const periodStartDate = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        25
      );

      // End date is always 25th of current month
      const periodEndDate = new Date(today.getFullYear(), today.getMonth(), 25);

      startStr = periodStartDate.toISOString().split("T")[0];
      endStr = periodEndDate.toISOString().split("T")[0];
    }

    // Calculate regular income for the period
    const totalIncome = incomes?.reduce((sum, income) => {
      const incomeAmount = income.netAmount;

      if (income.frequency === Frequency.YEARLY) {
        return sum + incomeAmount;
      }
      return sum + incomeAmount;
    }, 0);

    // Calculate expenses for the period
    const totalExpenses = expenses?.reduce((sum, expense) => {
      // Skip expenses outside the billing period
      if (expense.date && (expense.date < startStr || expense.date > endStr)) {
        return sum;
      }

      // For non-recurring expenses within the period, add the full amount
      if (!expense.isRecurring) {
        return sum + expense.amount;
      }

      // For recurring expenses, calculate monthly equivalent
      const amount =
        expense.frequency === Frequency.YEARLY
          ? expense.amount
          : expense.amount;
      return sum + amount;
    }, 0);

    // Calculate subscription expenses for the period
    const totalSubscriptions = getActiveSubscriptions().reduce(
      (sum, subscription) => {
        const amount =
          subscription.frequency === Frequency.YEARLY
            ? subscription.amount / 12
            : subscription.amount;
        return sum + amount;
      },
      0
    );

    // Total all expenses including subscriptions
    const combinedExpenses = totalExpenses + totalSubscriptions;

    const netIncome = totalIncome - combinedExpenses;
    const savingsRate = totalIncome > 0 ? (netIncome / totalIncome) * 100 : 0;

    const totalAssets = 0;
    const netWorth = totalAssets;

    return {
      totalIncome,
      totalExpenses: combinedExpenses,
      netIncome,
      savingsRate,
      totalAssets,
      netWorth,
      periodStartDate: startStr,
      periodEndDate: endStr,
    };
  };

  // Calculate savings projection
  const calculateSavingsProjection = (goal: SavingsGoal): SavingsProjection => {
    const startDate = new Date(goal.startDate);
    const targetDate = new Date(goal.targetDate);

    // Calculate number of months between start and target date
    const months = Math.ceil(
      (targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    );

    const monthlyReturnRate = goal.expectedReturnRate / 100 / 12;

    const monthsArray: number[] = [];
    const savingsArray: number[] = [];
    const interestArray: number[] = [];
    const totalArray: number[] = [];

    // Get the current progress
    const currentProgress = getSavingsGoalProgress(goal.id);

    let currentSavings = currentProgress;
    let totalInterest = 0;

    for (let i = 0; i <= months; i++) {
      monthsArray.push(i);

      if (i > 0) {
        // Add monthly savings
        currentSavings += goal.monthlySavings;

        // Calculate interest for this month
        const interestThisMonth = currentSavings * monthlyReturnRate;
        totalInterest += interestThisMonth;

        // Add interest to current savings
        currentSavings += interestThisMonth;
      }

      savingsArray.push(
        i === 0 ? currentProgress : currentProgress + goal.monthlySavings * i
      );
      interestArray.push(totalInterest);
      totalArray.push(currentSavings);
    }

    return {
      months: monthsArray,
      savings: savingsArray,
      interest: interestArray,
      total: totalArray,
    };
  };

  const updateAssetValue = async (assetId: string, newValue: number) => {
    try {
      const assetsCopy = [...assets];
      const asset = assetsCopy.find((a) => a.id === assetId);

      if (!asset) return;

      const date = new Date().toISOString().split("T")[0];
      const assetValue: AssetValue = { date, value: newValue };

      // Add to values array if it doesn't exist or update it
      if (!asset.values) {
        asset.values = [assetValue];
      } else {
        const existingValueIndex = asset.values.findIndex(
          (v: AssetValue) => v.date === date
        );
        if (existingValueIndex >= 0) {
          asset.values[existingValueIndex] = assetValue;
        } else {
          asset.values.push(assetValue);
        }
      }

      // Update the current value
      asset.value = newValue;

      if (useMongoDBData && isAuthenticated) {
        console.log(
          `📝 AppContext: Updating asset value in MongoDB: ${assetId}`
        );
        await assetApi.updateAssetValue(assetId, { value: newValue, date });
      }

      setAssets(assetsCopy);
    } catch (error) {
      console.error("❌ AppContext: Error updating asset value:", error);
    }
  };

  const addAssetDeposit = async (assetId: string, depositAmount: number) => {
    try {
      const assetsCopy = [...assets];
      const asset = assetsCopy.find((a) => a.id === assetId);

      if (!asset) return;

      const date = new Date().toISOString().split("T")[0];
      const deposit = { date, amount: depositAmount };

      // Add to deposits array if it doesn't exist
      if (!asset.deposits) {
        asset.deposits = [deposit];
      } else {
        asset.deposits.push(deposit);
      }

      // Update the current value by adding deposit
      asset.value += depositAmount;

      if (useMongoDBData && isAuthenticated) {
        console.log(
          `📝 AppContext: Adding asset deposit in MongoDB: ${assetId}`
        );
        await assetApi.addAssetDeposit(assetId, {
          amount: depositAmount,
          date,
        });
      }

      setAssets(assetsCopy);
    } catch (error) {
      console.error("❌ AppContext: Error adding asset deposit:", error);
    }
  };

  const getBudgetItems = () => {
    return budgetItems;
  };

  // Note methods
  const addNote = async (
    note: Omit<Note, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      const now = new Date().toISOString();

      if (useMongoDBData && isAuthenticated) {
        console.log("📝 AppContext: Adding note to MongoDB");
        const newNote = await apiRequest("/api/notes", "POST", {
          ...note,
          createdAt: now,
          updatedAt: now,
        });
        setNotes([newNote, ...notes]);
      } else {
        const newNote: Note = {
          ...note,
          id: Date.now().toString(),
          createdAt: now,
          updatedAt: now,
        };
        setNotes([newNote, ...notes]);
      }
    } catch (error) {
      console.error("❌ AppContext: Error adding note:", error);
    }
  };

  const updateNote = async (note: Note) => {
    try {
      const now = new Date().toISOString();

      if (useMongoDBData && isAuthenticated) {
        console.log(`📝 AppContext: Updating note in MongoDB: ${note.id}`);
        const updatedNote = await apiRequest(`/api/notes/${note.id}`, "PUT", {
          ...note,
          updatedAt: now,
        });
        setNotes(notes.map((n) => (n.id === note.id ? updatedNote : n)));
      } else {
        setNotes(
          notes.map((n) => (n.id === note.id ? { ...note, updatedAt: now } : n))
        );
      }
    } catch (error) {
      console.error("❌ AppContext: Error updating note:", error);
    }
  };

  const deleteNote = async (id: string) => {
    try {
      if (useMongoDBData && isAuthenticated) {
        console.log(`📝 AppContext: Deleting note from MongoDB: ${id}`);
        await apiRequest(`/api/notes/${id}`, "DELETE");
      }
      setNotes(notes.filter((n) => n.id !== id));
    } catch (error) {
      console.error("❌ AppContext: Error deleting note:", error);
    }
  };

  const toggleNotePin = async (id: string) => {
    try {
      const noteToToggle = notes.find((note) => note.id === id);
      if (!noteToToggle) return;

      if (useMongoDBData && isAuthenticated) {
        console.log(`📝 AppContext: Toggling note pin in MongoDB: ${id}`);
        await apiRequest(`/api/notes/${id}/toggle-pin`, "PUT");
      }

      setNotes(
        notes.map((note) =>
          note.id === id ? { ...note, isPinned: !note.isPinned } : note
        )
      );
    } catch (error) {
      console.error("❌ AppContext: Error toggling note pin:", error);
    }
  };

  // Tax return methods
  const addTaxReturn = async (taxReturn: Omit<TaxReturn, "id">) => {
    try {
      if (useMongoDBData && isAuthenticated) {
        console.log("📝 AppContext: Adding tax return to MongoDB");
        const newTaxReturn = await apiRequest(
          "/api/tax-returns",
          "POST",
          taxReturn
        );
        setTaxReturns([...taxReturns, newTaxReturn]);
      } else {
        const newTaxReturn = { ...taxReturn, id: Date.now().toString() };
        setTaxReturns([...taxReturns, newTaxReturn]);
      }
    } catch (error) {
      console.error("❌ AppContext: Error adding tax return:", error);
    }
  };

  const updateTaxReturn = async (taxReturn: TaxReturn) => {
    try {
      if (useMongoDBData && isAuthenticated) {
        console.log(
          `📝 AppContext: Updating tax return in MongoDB: ${taxReturn.id}`
        );
        const updatedTaxReturn = await apiRequest(
          `/api/tax-returns/${taxReturn.id}`,
          "PUT",
          taxReturn
        );
        setTaxReturns(
          taxReturns.map((tr) =>
            tr.id === taxReturn.id ? updatedTaxReturn : tr
          )
        );
      } else {
        setTaxReturns(
          taxReturns.map((tr) => (tr.id === taxReturn.id ? taxReturn : tr))
        );
      }
    } catch (error) {
      console.error("❌ AppContext: Error updating tax return:", error);
    }
  };

  const deleteTaxReturn = async (id: string) => {
    try {
      if (useMongoDBData && isAuthenticated) {
        console.log(`📝 AppContext: Deleting tax return from MongoDB: ${id}`);
        await apiRequest(`/api/tax-returns/${id}`, "DELETE");
      }
      setTaxReturns(taxReturns.filter((tr) => tr.id !== id));
    } catch (error) {
      console.error("❌ AppContext: Error deleting tax return:", error);
    }
  };

  // Mark setup as complete
  const completeSetup = async () => {
    try {
      console.log("🔄 AppContext: Marking setup as complete");
      setIsFirstTimeUser(false);

      // Update user's setup status in the database
      if (isAuthenticated) {
        // Make API call to update user's setup status
        await apiRequest("/api/users/profile", "PUT", {
          isSetupComplete: true,
        });

        // Update local user state
        updateUser({ isSetupComplete: true });

        console.log("✅ AppContext: User setup status updated in database");
      }
    } catch (error) {
      console.error("❌ AppContext: Error updating setup status:", error);
      // Still mark as complete locally even if the API call fails
      setIsFirstTimeUser(false);
    }
  };

  // Data export - returns JSON string of all data
  const exportData = () => {
    const data = {
      incomes,
      expenses,
      assets,
      liabilities,
      savingsGoals,
      subscriptions,
      budgetItems,
      notes,
      taxReturns,
      exportDate: new Date().toISOString(),
      appVersion: "1.0.0", // For future compatibility checks
    };

    return JSON.stringify(data, null, 2);
  };

  // Data import - takes JSON string and loads it
  const importData = (jsonData: string) => {
    try {
      const data = JSON.parse(jsonData);

      // Validate data structure
      if (!data.appVersion) {
        console.error("Invalid data format: missing appVersion");
        return false;
      }

      // Import all data
      if (data.incomes) setIncomes(data.incomes);
      if (data.expenses) setExpenses(data.expenses);
      if (data.assets) setAssets(data.assets);
      if (data.liabilities) setLiabilities(data.liabilities);
      if (data.savingsGoals) setSavingsGoals(data.savingsGoals);
      if (data.subscriptions) setSubscriptions(data.subscriptions);
      if (data.notes) setNotes(data.notes);
      if (data.taxReturns) setTaxReturns(data.taxReturns);

      console.log(
        `Data successfully imported (from ${data.exportDate || "unknown date"})`
      );
      return true;
    } catch (error) {
      console.error("Error importing data:", error);
      return false;
    }
  };

  // Add new method to manually sync with MongoDB
  const syncWithMongoDB = async () => {
    if (!isAuthenticated) {
      console.log(
        "⚠️ AppContext: User not authenticated, cannot sync with MongoDB"
      );
      return false;
    }

    try {
      setIsLoading(true);
      await syncUserDataFromMongoDB({
        setIncomes,
        setExpenses,
        setAssets,
        setLiabilities,
      });
      console.log("✅ AppContext: Manual sync with MongoDB successful");
      return true;
    } catch (error) {
      console.error("❌ AppContext: Manual sync with MongoDB failed:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        // State
        incomes,
        expenses,
        assets,
        liabilities,
        savingsGoals,
        notes,
        taxReturns,
        isLoading,

        // Income methods
        addIncome,
        updateIncome,
        deleteIncome,

        // Expense methods
        addExpense,
        updateExpense,
        deleteExpense,

        // Asset methods
        addAsset,
        updateAsset,
        deleteAsset,

        // Liability methods
        addLiability,
        updateLiability,
        deleteLiability,

        // Savings goal methods
        addSavingsGoal,
        updateSavingsGoal,
        deleteSavingsGoal,
        getSavingsGoalProgress,
        getAssetsForSavingsGoal,

        // Summary methods
        getFinancialSummary,
        calculateSavingsProjection,

        // Filter methods
        getExpensesByCategory,
        getAllCategories,

        // New methods
        updateAssetValue,
        addAssetDeposit,

        // Budget methods
        getBudgetItems,

        // Note methods
        addNote,
        updateNote,
        deleteNote,
        toggleNotePin,

        // Tax return methods
        addTaxReturn,
        updateTaxReturn,
        deleteTaxReturn,

        // Setup state
        isFirstTimeUser,
        completeSetup,

        // Data import/export
        exportData,
        importData,

        // Add new sync method
        syncWithMongoDB,
        useMongoDBData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
