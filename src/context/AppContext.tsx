import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Income,
  Expense,
  Asset,
  Liability,
  SavingsGoal,
  FinancialSummary,
  SavingsProjection,
  Subscription,
  Period,
  AssetValue,
  BudgetItem,
  Note,
  TaxReturn,
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
  subscriptions: Subscription[];
  budgetItems: BudgetItem[];
  notes: Note[];
  taxReturns: TaxReturn[];
  isLoading: boolean;

  // Income methods
  addIncome: (income: Omit<Income, "id">) => void;
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

  // Subscription methods
  addSubscription: (subscription: Omit<Subscription, "id">) => void;
  updateSubscription: (subscription: Subscription) => void;
  deleteSubscription: (id: string) => void;
  getActiveSubscriptions: () => Subscription[];

  // Savings goal methods
  addSavingsGoal: (goal: Omit<SavingsGoal, "id">) => void;
  updateSavingsGoal: (goal: SavingsGoal) => void;
  deleteSavingsGoal: (id: string) => void;
  getSavingsGoalProgress: (goalId: string) => number;
  getAssetsForSavingsGoal: (goalId: string) => Asset[];

  // Summary methods
  getFinancialSummary: (customPeriod?: Period) => FinancialSummary;
  calculateSavingsProjection: (goal: SavingsGoal) => SavingsProjection;

  // Filter methods
  getExpensesByCategory: (category: string) => Expense[];
  getAllCategories: () => string[];

  // New methods
  updateAssetValue: (assetId: string, newValue: number) => void;
  addAssetDeposit: (assetId: string, depositAmount: number) => void;

  // Budget methods
  setBudgetItems: (items: BudgetItem[]) => void;
  getBudgetItems: () => BudgetItem[];
  updateBudgetItem: (item: BudgetItem) => void;

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
  // State with initialization flag
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [budgetItems, setBudgetItemsState] = useState<BudgetItem[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [taxReturns, setTaxReturns] = useState<TaxReturn[]>([]);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState<boolean>(true);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      try {
        setIsLoading(true);
        let hasData = false;

        // Check if user has completed setup before
        const setupCompleted = localStorage.getItem("setupCompleted");
        if (setupCompleted === "true") {
          setIsFirstTimeUser(false);
        }

        const storedIncomes = localStorage.getItem("incomes");
        if (storedIncomes) {
          setIncomes(JSON.parse(storedIncomes));
          hasData = true;
        }

        const storedExpenses = localStorage.getItem("expenses");
        if (storedExpenses) {
          setExpenses(JSON.parse(storedExpenses));
          hasData = true;
        }

        const storedAssets = localStorage.getItem("assets");
        if (storedAssets) {
          setAssets(JSON.parse(storedAssets));
          hasData = true;
        }

        const storedLiabilities = localStorage.getItem("liabilities");

        if (storedLiabilities) {
          setLiabilities(JSON.parse(storedLiabilities));
          hasData = true;
        }

        const storedSavingsGoals = localStorage.getItem("savingsGoals");

        if (storedSavingsGoals) {
          setSavingsGoals(JSON.parse(storedSavingsGoals));
          hasData = true;
        }

        const storedSubscriptions = localStorage.getItem("subscriptions");

        if (storedSubscriptions) {
          setSubscriptions(JSON.parse(storedSubscriptions));
          hasData = true;
        }

        const storedBudgetItems = localStorage.getItem("budgetItems");

        if (storedBudgetItems) {
          setBudgetItemsState(JSON.parse(storedBudgetItems));
          hasData = true;
        }

        const storedNotes = localStorage.getItem("notes");
        if (storedNotes) {
          setNotes(JSON.parse(storedNotes));
          hasData = true;
        }

        const storedTaxReturns = localStorage.getItem("taxReturns");
        if (storedTaxReturns) {
          setTaxReturns(JSON.parse(storedTaxReturns));
          hasData = true;
        }

        // Initialize with sample data if no data exists
        if (!hasData) {
          console.log(
            "No data found in localStorage, initializing empty state"
          );
          // We no longer automatically load sample data for first-time users
          // They'll go through the setup process instead
        }

        // Mark initialization as complete
        setIsInitialized(true);
      } catch (error) {
        console.error("Error loading data from localStorage:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Save data to localStorage when state changes (but only after initialization)
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("incomes", JSON.stringify(incomes));
    }
  }, [incomes, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("expenses", JSON.stringify(expenses));
    }
  }, [expenses, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("assets", JSON.stringify(assets));
    }
  }, [assets, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("liabilities", JSON.stringify(liabilities));
    }
  }, [liabilities, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("savingsGoals", JSON.stringify(savingsGoals));
    }
  }, [savingsGoals, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("subscriptions", JSON.stringify(subscriptions));
    }
  }, [subscriptions, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("budgetItems", JSON.stringify(budgetItems));
    }
  }, [budgetItems, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("notes", JSON.stringify(notes));
    }
  }, [notes, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("taxReturns", JSON.stringify(taxReturns));
    }
  }, [taxReturns, isInitialized]);

  // Income methods
  const addIncome = (income: Omit<Income, "id">) => {
    const newIncome = { ...income, id: Date.now().toString() };
    setIncomes([...incomes, newIncome]);
  };

  const updateIncome = (income: Income) => {
    setIncomes(incomes.map((i) => (i.id === income.id ? income : i)));
  };

  const deleteIncome = (id: string) => {
    setIncomes(incomes.filter((i) => i.id !== id));
  };

  // Expense methods
  const addExpense = (expense: Omit<Expense, "id">) => {
    const newExpense = {
      ...expense,
      id: Date.now().toString(),
      date: expense.date || new Date().toISOString().split("T")[0],
    };
    setExpenses((prev) => [...prev, newExpense]);
  };

  const updateExpense = (updatedExpense: Expense) => {
    setExpenses((prev) =>
      prev.map((expense) =>
        expense.id === updatedExpense.id
          ? {
              ...updatedExpense,
              date:
                updatedExpense.date ||
                expense.date ||
                new Date().toISOString().split("T")[0],
            }
          : expense
      )
    );
  };

  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter((e) => e.id !== id));
  };

  // Asset methods
  const addAsset = (asset: Omit<Asset, "id">) => {
    const newAsset: Asset = {
      ...asset,
      id: generateId(),
    };
    setAssets((prev) => [...prev, newAsset]);
  };

  const updateAsset = (asset: Asset) => {
    setAssets((prev) => prev.map((a) => (a.id === asset.id ? asset : a)));
  };

  const deleteAsset = (assetId: string) => {
    setAssets((prev) => prev.filter((asset) => asset.id !== assetId));
  };

  // Liability methods
  const addLiability = (liability: Omit<Liability, "id">) => {
    const newLiability = { ...liability, id: Date.now().toString() };
    setLiabilities([...liabilities, newLiability]);
  };

  const updateLiability = (liability: Liability) => {
    setLiabilities(
      liabilities.map((l) => (l.id === liability.id ? liability : l))
    );
  };

  const deleteLiability = (id: string) => {
    setLiabilities(liabilities.filter((l) => l.id !== id));
  };

  // Subscription methods
  const addSubscription = (subscription: Omit<Subscription, "id">) => {
    const newSubscription = { ...subscription, id: Date.now().toString() };
    setSubscriptions([...subscriptions, newSubscription]);
  };

  const updateSubscription = (subscription: Subscription) => {
    setSubscriptions(
      subscriptions.map((s) => (s.id === subscription.id ? subscription : s))
    );
  };

  const deleteSubscription = (id: string) => {
    setSubscriptions(subscriptions.filter((s) => s.id !== id));
  };

  const getActiveSubscriptions = () => {
    return subscriptions.filter((sub) => sub.isActive);
  };

  // Savings goal methods
  const addSavingsGoal = (goal: Omit<SavingsGoal, "id">) => {
    const newGoal = { ...goal, id: Date.now().toString() };
    setSavingsGoals([...savingsGoals, newGoal]);
  };

  const updateSavingsGoal = (goal: SavingsGoal) => {
    setSavingsGoals(savingsGoals.map((g) => (g.id === goal.id ? goal : g)));
  };

  const deleteSavingsGoal = (id: string) => {
    // Remove the goal
    setSavingsGoals(savingsGoals.filter((g) => g.id !== id));

    // Unlink any assets associated with this goal
    setAssets(
      assets.map((asset) =>
        asset.savingsGoalId === id ? { ...asset, savingsGoalId: null } : asset
      )
    );
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
  const getFinancialSummary = (customPeriod?: Period): FinancialSummary => {
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
    const totalIncome = incomes.reduce((sum, income) => {
      // Use netAmount if available, otherwise fall back to amount for backward compatibility
      const incomeAmount =
        income.netAmount !== undefined ? income.netAmount : income.amount;

      if (income.frequency === "annual") {
        return sum + incomeAmount;
      }
      return sum + incomeAmount;
    }, 0);

    // Calculate expenses for the period
    const totalExpenses = expenses.reduce((sum, expense) => {
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
        expense.frequency === "annual" ? expense.amount : expense.amount;
      return sum + amount;
    }, 0);

    // Calculate subscription expenses for the period
    const totalSubscriptions = getActiveSubscriptions().reduce(
      (sum, subscription) => {
        const amount =
          subscription.frequency === "annual"
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

    const totalAssets = assets.reduce((sum, asset) => sum + asset.value, 0);
    const totalLiabilities = liabilities.reduce(
      (sum, liability) => sum + liability.amount,
      0
    );
    const netWorth = totalAssets - totalLiabilities;

    return {
      totalIncome,
      totalExpenses: combinedExpenses,
      netIncome,
      savingsRate,
      totalAssets,
      totalLiabilities,
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

  const updateAssetValue = (assetId: string, newValue: number) => {
    setAssets((prev) =>
      prev.map((asset) => {
        if (asset.id === assetId) {
          const today = new Date().toISOString().split("T")[0];
          return {
            ...asset,
            value: newValue,
            historicalValues: [
              ...asset.historicalValues,
              { date: today, value: newValue } as AssetValue,
            ],
          };
        }
        return asset;
      })
    );
  };

  const addAssetDeposit = (assetId: string, depositAmount: number) => {
    setAssets((prev) =>
      prev.map((asset) => {
        if (asset.id === assetId) {
          const today = new Date().toISOString().split("T")[0];
          const newValue = asset.value + depositAmount;
          return {
            ...asset,
            value: newValue,
            totalDeposits: asset.totalDeposits + depositAmount,
            historicalValues: [
              ...asset.historicalValues,
              {
                date: today,
                value: newValue,
                isDeposit: true,
                depositAmount,
              } as AssetValue,
            ],
          };
        }
        return asset;
      })
    );
  };

  // Budget methods
  const setBudgetItems = (items: BudgetItem[]) => {
    setBudgetItemsState(items);
  };

  const getBudgetItems = () => {
    return budgetItems;
  };

  const updateBudgetItem = (item: BudgetItem) => {
    setBudgetItemsState((prevItems) =>
      prevItems.map((prevItem) => (prevItem.id === item.id ? item : prevItem))
    );
  };

  // Note methods
  const addNote = (note: Omit<Note, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString();
    const newNote: Note = {
      ...note,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now,
    };
    setNotes([newNote, ...notes]);
  };

  const updateNote = (note: Note) => {
    const now = new Date().toISOString();
    setNotes(
      notes.map((n) => (n.id === note.id ? { ...note, updatedAt: now } : n))
    );
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  const toggleNotePin = (id: string) => {
    setNotes(
      notes.map((note) =>
        note.id === id ? { ...note, isPinned: !note.isPinned } : note
      )
    );
  };

  // Tax return methods
  const addTaxReturn = (taxReturn: Omit<TaxReturn, "id">) => {
    const newTaxReturn = { ...taxReturn, id: Date.now().toString() };
    setTaxReturns([...taxReturns, newTaxReturn]);
  };

  const updateTaxReturn = (taxReturn: TaxReturn) => {
    setTaxReturns(
      taxReturns.map((tr) => (tr.id === taxReturn.id ? taxReturn : tr))
    );
  };

  const deleteTaxReturn = (id: string) => {
    setTaxReturns(taxReturns.filter((tr) => tr.id !== id));
  };

  // Mark setup as complete
  const completeSetup = () => {
    localStorage.setItem("setupCompleted", "true");
    setIsFirstTimeUser(false);
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
      if (data.budgetItems) setBudgetItemsState(data.budgetItems);
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

  return (
    <AppContext.Provider
      value={{
        // State
        incomes,
        expenses,
        assets,
        liabilities,
        savingsGoals,
        subscriptions,
        budgetItems,
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

        // Subscription methods
        addSubscription,
        updateSubscription,
        deleteSubscription,
        getActiveSubscriptions,

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
        setBudgetItems,
        getBudgetItems,
        updateBudgetItem,

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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
