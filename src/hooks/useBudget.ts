import { useState, useEffect, useCallback, useMemo } from "react";
import {
  budgetApi,
  BudgetPayload,
  BudgetTrackingPayload,
} from "../services/api";
import { useAuth } from "../context/AuthContext";

export interface Budget {
  _id: string;
  name: string;
  amount: number;
  category: string;
  tracking?: {
    _id: string;
    date: string;
    amount: number;
    description?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  spendingPercentage: number;
}

export const useBudget = () => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Fetch budgets when the user is authenticated
  useEffect(() => {
    if (user) {
      fetchBudgets();
    }
  }, [user]);

  // Fetch all budgets
  const fetchBudgets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await budgetApi.getBudgets();
      setBudgets(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch budgets");
      console.error("Error fetching budgets:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add a new budget
  const addBudget = useCallback(async (budget: BudgetPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const newBudget = await budgetApi.createBudget(budget);
      console.warn("New budget", newBudget);
      setBudgets(newBudget);
      return newBudget;
    } catch (err: any) {
      setError(err.message || "Failed to add budget");
      console.error("Error adding budget:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update a budget
  const updateBudget = useCallback(
    async (id: string, budget: Partial<BudgetPayload>) => {
      setIsLoading(true);
      setError(null);
      try {
        const updatedBudget = await budgetApi.updateBudget(id, budget);
        setBudgets((prev) =>
          prev.map((b) => (b._id === id ? updatedBudget : b))
        );
        return updatedBudget;
      } catch (err: any) {
        setError(err.message || "Failed to update budget");
        console.error("Error updating budget:", err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Delete a budget
  const deleteBudget = useCallback(
    async (id: string) => {
      if (!window.confirm("Are you sure you want to delete this budget?")) {
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        await budgetApi.deleteBudget(id);
        setBudgets((prev) => prev.filter((b) => b._id !== id));
        if (selectedId === id) {
          setSelectedId(null);
        }
      } catch (err: any) {
        setError(err.message || "Failed to delete budget");
        console.error("Error deleting budget:", err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [selectedId]
  );

  // Track spending in a budget
  const trackSpending = useCallback(
    async (id: string, tracking: BudgetTrackingPayload) => {
      setIsLoading(true);
      setError(null);
      try {
        const updatedBudget = await budgetApi.trackSpending(id, tracking);
        setBudgets((prev) =>
          prev.map((b) => (b._id === id ? updatedBudget : b))
        );
        return updatedBudget;
      } catch (err: any) {
        setError(err.message || "Failed to track spending");
        console.error("Error tracking spending:", err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Selected budget
  const selectedBudget = useMemo(() => {
    return budgets.find((b) => b._id === selectedId) || null;
  }, [budgets, selectedId]);

  // Sort budgets by creation date (newest first)
  const sortedBudgets = useMemo(() => {
    return [...budgets].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [budgets]);

  // Calculate budget summaries
  const budgetSummaries = useMemo(() => {
    return budgets.map((budget) => {
      const totalSpent = budget.tracking
        ? budget.tracking.reduce((sum, item) => sum + item.amount, 0)
        : 0;

      return {
        budgetId: budget._id,
        name: budget.name,
        totalBudget: budget.amount,
        totalSpent,
        remainingBudget: budget.amount - totalSpent,
        spendingPercentage: (totalSpent / budget.amount) * 100,
      };
    });
  }, [budgets]);

  // Overall summary
  const overallSummary = useMemo((): BudgetSummary => {
    const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
    const totalSpent = budgets.reduce((sum, budget) => {
      const budgetSpent = budget.tracking
        ? budget.tracking.reduce((s, item) => s + item.amount, 0)
        : 0;
      return sum + budgetSpent;
    }, 0);

    return {
      totalBudget,
      totalSpent,
      remainingBudget: totalBudget - totalSpent,
      spendingPercentage:
        totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
    };
  }, [budgets]);

  // Get a color based on the spending percentage
  const getBudgetHealthColor = useCallback((percentage: number) => {
    if (percentage <= 50) return "text-green-500";
    if (percentage <= 75) return "text-yellow-500";
    if (percentage <= 90) return "text-orange-500";
    return "text-red-500";
  }, []);

  // Format the recurrence string for display
  const formatRecurrence = useCallback((recurrence?: string) => {
    if (!recurrence) return "One-time";

    const capitalizeFirst = (str: string) =>
      str.charAt(0).toUpperCase() + str.slice(1);

    return capitalizeFirst(recurrence);
  }, []);

  return {
    budgets,
    sortedBudgets,
    selectedBudget,
    isLoading,
    error,
    budgetSummaries,
    overallSummary,
    setSelectedId,
    fetchBudgets,
    addBudget,
    updateBudget,
    deleteBudget,
    trackSpending,
    getBudgetHealthColor,
    formatRecurrence,
  };
};
