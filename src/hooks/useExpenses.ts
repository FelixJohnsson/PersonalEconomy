import { useState, useMemo, useCallback, useEffect } from "react";
import { apiRequest } from "../services/api";
import {
  Expense,
  ExpenseFormData,
  NecessityLevel,
  EXPENSE_CATEGORIES,
  Frequency,
} from "../types";
import { useAuth } from "../context/AuthContext";

// Define sort options
export type SortField =
  | "name"
  | "amount"
  | "category"
  | "necessityLevel"
  | "frequency"
  | "date";
export type SortDirection = "asc" | "desc";

export const useExpenses = () => {
  const { isAuthenticated } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showNotes, setShowNotes] = useState<boolean>(false);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Fetch expenses from API
  useEffect(() => {
    const fetchExpenses = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const data = await apiRequest("/api/user-data/expenses", "GET");
        setExpenses(data || []);
      } catch (err) {
        console.error("Error fetching expenses:", err);
        setError("Failed to load expenses");
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpenses();
  }, [isAuthenticated]);

  const totalExpenses = useMemo(() => {
    return expenses.reduce((acc, expense) => {
      if (expense.category === "Savings") {
        return acc;
      }
      return acc + expense.amount;
    }, 0);
  }, [expenses]);

  // CRUD operations for expenses
  const addExpense = async (expense: ExpenseFormData) => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      const newExpense = await apiRequest(
        "/api/user-data/expenses",
        "POST",
        expense
      );
      setExpenses([...expenses, newExpense]);
      return newExpense;
    } catch (err) {
      console.error("Error adding expense:", err);
      setError("Failed to add expense");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateExpense = async (expense: Expense) => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      const updatedExpense = await apiRequest(
        `/api/user-data/expenses/${expense._id}`,
        "PUT",
        expense
      );

      setExpenses(
        expenses.map((exp) => (exp._id === expense._id ? updatedExpense : exp))
      );

      return updatedExpense;
    } catch (err) {
      console.error("Error updating expense:", err);
      setError("Failed to update expense");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteExpenseFromApi = async (id: string) => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      const user = await apiRequest(`/api/user-data/expenses/${id}`, "DELETE");
      setExpenses(user.expenses);
    } catch (err) {
      console.error("Error deleting expense:", err);
      setError("Failed to delete expense");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Get all unique categories from expenses
  const getAllCategories = useCallback(() => {
    const categoriesSet = new Set<string>();

    expenses.forEach((expense) => {
      if (expense.category) {
        categoriesSet.add(expense.category);
      }
    });

    return Array.from(categoriesSet);
  }, [expenses]);

  // Get selected expense
  const selectedExpense = useMemo(() => {
    return expenses.find((exp) => exp._id === selectedId);
  }, [expenses, selectedId]);

  // Get all unique categories and prioritize the predefined ones
  const categories = useMemo(() => {
    const allCategories = getAllCategories();

    // Move predefined categories to the top
    const predefinedCategories = EXPENSE_CATEGORIES.filter((cat) =>
      allCategories.includes(cat)
    );

    // Add custom categories (those not in predefined list)
    const customCategories = allCategories.filter(
      (cat) => !EXPENSE_CATEGORIES.includes(cat as any)
    );

    return [...predefinedCategories, ...customCategories];
  }, [getAllCategories]);

  // Filter expenses by selected category
  const filteredExpenses = useMemo(() => {
    if (selectedCategory === "all") {
      return expenses;
    }
    return expenses.filter((expense) => expense.category === selectedCategory);
  }, [expenses, selectedCategory]);

  // Sort expenses
  const sortedExpenses = useMemo(() => {
    const expensesCopy = [...filteredExpenses];

    // Define sorting functions
    const compareStrings = (a: string, b: string) => a.localeCompare(b);
    const compareNumbers = (a: number, b: number) => a - b;
    const compareDates = (a: string | undefined, b: string | undefined) => {
      // Handle undefined dates
      if (!a && !b) return 0;
      if (!a) return -1;
      if (!b) return 1;
      return new Date(a).getTime() - new Date(b).getTime();
    };
    const compareBooleans = (a: boolean, b: boolean) =>
      a === b ? 0 : a ? -1 : 1;

    // Define necessity level order for sorting
    const necessityLevelOrder: { [key in NecessityLevel]: number } = {
      "A+": 7,
      A: 6,
      B: 5,
      C: 4,
      D: 3,
      E: 2,
      F: 1,
    };

    // Sort based on selected field
    expensesCopy.sort((a, b) => {
      let result = 0;

      switch (sortField) {
        case "name":
          result = compareStrings(a.name, b.name);
          break;
        case "amount":
          result = compareNumbers(a.amount, b.amount);
          break;
        case "category":
          result = compareStrings(a.category, b.category);
          break;
        case "frequency":
          // Handle undefined frequency (for non-recurring expenses)
          if (!a.isRecurring && !b.isRecurring) {
            result = 0; // Both are one-time, so equal
          } else if (!a.isRecurring) {
            result = -1; // One-time comes before recurring
          } else if (!b.isRecurring) {
            result = 1; // Recurring comes after one-time
          } else {
            // Both are recurring, compare frequency
            result = compareStrings(
              a.frequency || "monthly",
              b.frequency || "monthly"
            );
          }
          break;
        case "date":
          result = compareDates(a.date, b.date);
          break;
        case "necessityLevel":
          // Handle cases where necessityLevel might be undefined
          if (!a.necessityLevel && !b.necessityLevel) {
            result = 0;
          } else if (!a.necessityLevel) {
            result = -1;
          } else if (!b.necessityLevel) {
            result = 1;
          } else {
            result =
              necessityLevelOrder[b.necessityLevel] -
              necessityLevelOrder[a.necessityLevel];
          }
          break;
        default:
          // First sort by recurring status, then by name as a fallback
          result = compareBooleans(a.isRecurring, b.isRecurring);
          if (result === 0) {
            result = compareStrings(a.name, b.name);
          }
      }

      // Apply sort direction
      return sortDirection === "asc" ? result : -result;
    });

    return expensesCopy;
  }, [filteredExpenses, sortField, sortDirection]);

  // Calculate category totals
  const categoryTotals = useMemo(() => {
    const totals: { [key: string]: { monthly: number; annual: number } } = {};

    expenses.forEach((expense) => {
      if (!totals[expense.category]) {
        totals[expense.category] = { monthly: 0, annual: 0 };
      }

      if (expense.frequency === "monthly") {
        totals[expense.category].monthly += expense.amount;
        totals[expense.category].annual += expense.amount * 12;
      } else if (expense.frequency === "yearly") {
        totals[expense.category].monthly += expense.amount / 12;
        totals[expense.category].annual += expense.amount;
      } else {
        // For non-recurring expenses, treat as monthly for simplicity
        totals[expense.category].monthly += expense.amount;
        totals[expense.category].annual += expense.amount * 12;
      }
    });

    return totals;
  }, [expenses]);

  // Handle expense deletion with confirmation
  const handleDelete = useCallback(
    (id: string) => {
      if (window.confirm("Are you sure you want to delete this expense?")) {
        deleteExpenseFromApi(id);
        if (selectedId === id) {
          setSelectedId(null);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedId]
  );

  // Handle sort change
  const handleSort = useCallback(
    (field: SortField) => {
      if (field === sortField) {
        // Toggle direction if clicking the same field
        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
      } else {
        // Set new field and default to ascending
        setSortField(field);
        setSortDirection("asc");
      }
    },
    [sortField, sortDirection]
  );

  // Get a color based on category
  const getCategoryColor = useCallback((category: string): string => {
    // Simple color hash function
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
      hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Convert to hex color
    const c = (hash & 0x00ffffff).toString(16).toUpperCase();

    return "#" + "00000".substring(0, 6 - c.length) + c;
  }, []);

  // Get color for necessity level
  const getNecessityLevelColor = useCallback((level?: NecessityLevel) => {
    switch (level) {
      case "A+":
        return "bg-green-100 text-green-800";
      case "A":
        return "bg-green-100 text-green-800";
      case "B":
        return "bg-blue-100 text-blue-800";
      case "C":
        return "bg-yellow-100 text-yellow-800";
      case "D":
        return "bg-orange-100 text-orange-800";
      case "E":
        return "bg-red-100 text-red-800";
      case "F":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }, []);

  // Format date
  const formatExpenseDate = useCallback((dateString?: string): string => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, []);

  const importExpensesToUser = async () => {
    try {
      const response = await apiRequest(
        "/api/user-data/expenses/import",
        "POST"
      );
      console.log(response);
    } catch (err) {
      console.error("Error importing expenses:", err);
      setError("Failed to import expenses");
      throw err;
    }
  };

  return {
    // Data
    expenses,
    totalExpenses,
    filteredExpenses,
    sortedExpenses,
    categories,
    selectedExpense,
    categoryTotals,
    isLoading,
    error,

    // State setters
    setSelectedId,
    setSelectedCategory,
    setShowNotes,
    setSortField,
    setSortDirection,

    // Current state
    selectedId,
    selectedCategory,
    showNotes,
    sortField,
    sortDirection,

    // Actions
    addExpense,
    updateExpense,
    deleteExpense: handleDelete,
    handleSort,
    getAllCategories,

    // Utility functions
    getCategoryColor,
    getNecessityLevelColor,
    formatExpenseDate,
    importExpensesToUser,
  };
};
