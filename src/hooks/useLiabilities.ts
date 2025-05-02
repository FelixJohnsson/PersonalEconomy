import { useState, useMemo, useCallback, useEffect } from "react";
import { liabilityApi } from "../services/api";
import { Liability, LiabilityFormData } from "../types";
import { useAuth } from "../context/AuthContext";

export const useLiabilities = () => {
  const { isAuthenticated } = useAuth();
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchLiabilities = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const data = await liabilityApi.getLiabilities();
        console.log(data);
        setLiabilities(data || []);
      } catch (err) {
        console.error("Error fetching liabilities:", err);
        setError("Failed to load liabilities");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLiabilities();
  }, [isAuthenticated]);

  // CRUD operations for liabilities
  const addLiability = async (liability: LiabilityFormData) => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      const updatedLiabilities = await liabilityApi.createLiability(liability);
      setLiabilities(updatedLiabilities);
      console.warn("Updated liabilities", updatedLiabilities);
    } catch (err) {
      console.error("Error adding liability:", err);
      setError("Failed to add liability");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateLiability = async (liability: Liability) => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      const updatedLiability = await liabilityApi.updateLiability(
        liability._id,
        liability
      );

      setLiabilities(
        liabilities.map((l) => (l._id === liability._id ? updatedLiability : l))
      );

      return updatedLiability;
    } catch (err) {
      console.error("Error updating liability:", err);
      setError("Failed to update liability");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteLiability = async (liability: Liability) => {
    if (!isAuthenticated) return;

    console.warn("Deleting liability", liability._id);

    try {
      setIsLoading(true);
      const updated = await liabilityApi.deleteLiability(liability);
      console.warn("Updated liabilities", updated);
      setLiabilities(updated);
    } catch (err) {
      console.error("Error deleting liability:", err);
      setError("Failed to delete liability");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Get selected liability
  const selectedLiability = useMemo(() => {
    if (liabilities.length === 0) return undefined;
    console.warn("Selected liability", liabilities);
    console.warn("Selected ID", selectedId);
    return liabilities.find((l) => l._id === selectedId);
  }, [liabilities, selectedId]);

  // Sort liabilities by type and then by name
  const sortedLiabilities = useMemo(() => {
    return [...liabilities].sort((a, b) => {
      // First sort by type
      if (a.type !== b.type) {
        const typeOrder = {
          mortgage: 1,
          loan: 2,
          credit_card: 3,
          other: 4,
        };
        return typeOrder[a.type] - typeOrder[b.type];
      }
      // Then sort by name
      return a.name.localeCompare(b.name);
    });
  }, [liabilities]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalLiabilityAmount = liabilities.reduce(
      (sum, liability) => sum + liability.amount,
      0
    );
    const totalMonthlyPayment = liabilities.reduce(
      (sum, liability) => sum + liability.minimumPayment,
      0
    );
    const averageInterestRate =
      liabilities.length > 0
        ? liabilities.reduce(
            (sum, liability) => sum + liability.interestRate,
            0
          ) / liabilities.length
        : 0;

    return {
      totalLiabilityAmount,
      totalMonthlyPayment,
      averageInterestRate,
    };
  }, [liabilities]);

  // Handle liability deletion with confirmation
  const handleDelete = useCallback(
    (liability: Liability) => {
      if (window.confirm("Are you sure you want to delete this liability?")) {
        deleteLiability(liability);
        if (selectedId === liability._id) {
          setSelectedId(null);
        }
      }
    },
    [selectedId]
  );

  // Get a color based on liability type
  const getLiabilityTypeColor = useCallback((type: string): string => {
    switch (type) {
      case "mortgage":
        return "#3B82F6"; // blue-500
      case "loan":
        return "#8B5CF6"; // purple-500
      case "credit_card":
        return "#EF4444"; // red-500
      default:
        return "#6B7280"; // gray-500
    }
  }, []);

  // Format liability type for display
  const formatLiabilityType = useCallback((type: string): string => {
    switch (type) {
      case "credit_card":
        return "Credit Card";
      case "loan":
        return "Loan";
      case "mortgage":
        return "Mortgage";
      default:
        return "Other";
    }
  }, []);

  return {
    // Data
    liabilities,
    sortedLiabilities,
    selectedLiability,
    isLoading,
    error,
    totals,

    // State setters
    setSelectedId,

    // Current state
    selectedId,

    // Actions
    addLiability,
    updateLiability,
    deleteLiability: handleDelete,

    // Utility functions
    getLiabilityTypeColor,
    formatLiabilityType,
  };
};
