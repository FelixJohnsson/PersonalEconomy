import { useState, useMemo, useCallback, useEffect } from "react";
import { apiRequest } from "../services/api";
import { Income, IncomeFormData, Frequency } from "../types";
import { useAuth } from "../context/AuthContext";

export const useIncome = () => {
  const { isAuthenticated } = useAuth();
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Fetch incomes from API
  useEffect(() => {
    const fetchIncomes = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const data = await apiRequest("/api/user-data/incomes", "GET");
        setIncomes(data || []);
      } catch (err) {
        console.error("Error fetching incomes:", err);
        setError("Failed to load incomes");
      } finally {
        setIsLoading(false);
      }
    };

    fetchIncomes();
  }, [isAuthenticated]);

  // CRUD operations for incomes
  const addIncome = async (income: IncomeFormData) => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      const newIncome = await apiRequest(
        "/api/user-data/incomes",
        "POST",
        income
      );
      setIncomes([...incomes, newIncome]);
      return newIncome;
    } catch (err) {
      console.error("Error adding income:", err);
      setError("Failed to add income");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateIncome = async (income: Income) => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      const incomes = await apiRequest(
        `/api/user-data/incomes/${income._id}`,
        "PUT",
        income
      );

      setIncomes(incomes);

      return incomes;
    } catch (err) {
      console.error("Error updating income:", err);
      setError("Failed to update income");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteIncomeFromApi = async (id: string) => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      const incomes = await apiRequest(
        `/api/user-data/incomes/${id}`,
        "DELETE"
      );
      setIncomes(incomes);
    } catch (err) {
      console.error("Error deleting income:", err);
      setError("Failed to delete income");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Get selected income
  const selectedIncome = useMemo(() => {
    return incomes.find((inc) => inc._id === selectedId);
  }, [incomes, selectedId]);

  // Sort incomes by recurring status first, then alphabetically
  const sortedIncomes = useMemo(() => {
    return [...incomes].sort((a, b) => {
      // First sort by frequency (monthly first)
      if (a.frequency === Frequency.MONTHLY && b.frequency === Frequency.YEARLY)
        return -1;
      if (a.frequency === Frequency.YEARLY && b.frequency === Frequency.MONTHLY)
        return 1;

      // Then sort by name
      return a.name?.localeCompare(b.name);
    });
  }, [incomes]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalGrossIncome = incomes.reduce((sum, income) => {
      return sum + income.grossAmount;
    }, 0);

    const totalNetIncome = incomes.reduce((sum, income) => {
      return sum + income.netAmount;
    }, 0);

    const totalTaxAmount = totalGrossIncome - totalNetIncome;
    const effectiveTaxRate =
      totalGrossIncome > 0 ? (totalTaxAmount / totalGrossIncome) * 100 : 0;

    return {
      totalGrossIncome,
      totalNetIncome,
      totalTaxAmount,
      effectiveTaxRate,
    };
  }, [incomes]);

  // Handle income deletion with confirmation
  const handleDelete = useCallback(
    (id: string) => {
      if (window.confirm("Are you sure you want to delete this income?")) {
        deleteIncomeFromApi(id);
        if (selectedId === id) {
          setSelectedId(null);
        }
      }
    },
    [selectedId]
  );

  // Get a color based on category
  const getCategoryColor = useCallback((category: string): string => {
    // Simple color hash function
    let hash = 0;
    for (let i = 0; i < category?.length; i++) {
      hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Convert to hex color
    const c = (hash & 0x00ffffff).toString(16).toUpperCase();

    return "#" + "00000".substring(0, 6 - c.length) + c;
  }, []);

  return {
    // Data
    incomes,
    sortedIncomes,
    selectedIncome,
    isLoading,
    error,
    totals,

    // State setters
    setSelectedId,

    // Current state
    selectedId,

    // Actions
    addIncome,
    updateIncome,
    deleteIncome: handleDelete,

    // Utility functions
    getCategoryColor,
  };
};
