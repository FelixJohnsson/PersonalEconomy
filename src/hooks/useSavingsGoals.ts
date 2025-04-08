import { useState, useMemo, useCallback, useEffect } from "react";
import { apiRequest } from "../services/api";
import { SavingsGoal } from "../types";
import { useAuth } from "../context/AuthContext";

export const useSavingsGoals = () => {
  const { isAuthenticated } = useAuth();
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Fetch savings goals from API
  useEffect(() => {
    const fetchSavingsGoals = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const data = await apiRequest("/api/user-data/savings-goals", "GET");
        setSavingsGoals(data || []);
      } catch (err) {
        console.error("Error fetching savings goals:", err);
        setError("Failed to load savings goals");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavingsGoals();
  }, [isAuthenticated]);

  // Get selected savings goal
  const selectedSavingsGoal = useMemo(() => {
    return savingsGoals.find((goal) => goal.id === selectedId);
  }, [savingsGoals, selectedId]);

  // CRUD operations for savings goals
  const addSavingsGoal = async (goal: Omit<SavingsGoal, "id">) => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      const newGoal = await apiRequest(
        "/api/user-data/savings-goals",
        "POST",
        goal
      );
      setSavingsGoals([...savingsGoals, newGoal]);
      return newGoal;
    } catch (err) {
      console.error("Error adding savings goal:", err);
      setError("Failed to add savings goal");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateSavingsGoal = async (goal: SavingsGoal) => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      const updatedGoal = await apiRequest(
        `/api/user-data/savings-goals/${goal.id}`,
        "PUT",
        goal
      );

      setSavingsGoals(
        savingsGoals.map((g) => (g.id === goal.id ? updatedGoal : g))
      );

      return updatedGoal;
    } catch (err) {
      console.error("Error updating savings goal:", err);
      setError("Failed to update savings goal");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSavingsGoal = async (id: string) => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      await apiRequest(`/api/user-data/savings-goals/${id}`, "DELETE");
      setSavingsGoals(savingsGoals.filter((goal) => goal.id !== id));

      if (selectedId === id) {
        setSelectedId(null);
      }
    } catch (err) {
      console.error("Error deleting savings goal:", err);
      setError("Failed to delete savings goal");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // Data
    savingsGoals,
    selectedSavingsGoal,
    isLoading,
    error,

    // State setters
    setSelectedId,

    // Current state
    selectedId,

    // Actions
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
  };
};
