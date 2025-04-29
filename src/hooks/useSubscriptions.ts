import { useState, useMemo, useCallback, useEffect } from "react";
import { apiRequest } from "../services/api";
import {
  Subscription,
  Frequency,
  NecessityLevel,
  SubscriptionFormData,
} from "../types";
import { useAuth } from "../context/AuthContext";

// Define sort options
export type SortField = "name" | "amount" | "necessityLevel" | "billingDate";
export type SortDirection = "asc" | "desc";

export const useSubscriptions = () => {
  const { isAuthenticated } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const [sortField, setSortField] = useState<SortField>("billingDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Fetch subscriptions from API
  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const data = await apiRequest("/api/user-data/subscriptions", "GET");
        setSubscriptions(data || []);
      } catch (err) {
        console.error("Error fetching subscriptions:", err);
        setError("Failed to load subscriptions");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptions();
  }, [isAuthenticated]);

  // CRUD operations for subscriptions
  const addSubscription = async (subscription: SubscriptionFormData) => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      const newSubscription = await apiRequest(
        "/api/user-data/subscriptions",
        "POST",
        subscription
      );
      setSubscriptions([...subscriptions, newSubscription]);
      return newSubscription;
    } catch (err) {
      console.error("Error adding subscription:", err);
      setError("Failed to add subscription");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateSubscription = async (subscription: Subscription) => {
    if (!isAuthenticated) return;

    console.log(subscription);

    try {
      setIsLoading(true);
      const updatedSubscription = await apiRequest(
        `/api/user-data/subscriptions/${subscription._id}`,
        "PUT",
        subscription
      );

      setSubscriptions(
        subscriptions.map((s) =>
          s._id === subscription._id ? updatedSubscription : s
        )
      );

      return updatedSubscription;
    } catch (err) {
      console.error("Error updating subscription:", err);
      setError("Failed to update subscription");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSubscriptionFromApi = async (id: string) => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      const res = await apiRequest(
        `/api/user-data/subscriptions/${id}`,
        "DELETE"
      );
      setSubscriptions(res.subscriptions);
    } catch (err) {
      console.error("Error deleting subscription:", err);
      setError("Failed to delete subscription");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Get selected subscription
  const selectedSubscription = useMemo(() => {
    return subscriptions.find((sub) => sub._id === selectedId);
  }, [subscriptions, selectedId]);

  // Filter subscriptions by active status
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter(
      (sub) => filterActive === null || sub.active === filterActive
    );
  }, [subscriptions, filterActive]);

  // Sort subscriptions
  const sortedSubscriptions = useMemo(() => {
    const subscriptionsCopy = [...filteredSubscriptions];

    if (subscriptionsCopy.length === 0) return [];

    // Define sorting functions
    const compareStrings = (a: string, b: string) => a.localeCompare(b);
    const compareNumbers = (a: number, b: number) => a - b;
    const compareDates = (a: string, b: string) =>
      new Date(a).getTime() - new Date(b).getTime();
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
    subscriptionsCopy.sort((a, b) => {
      let result = 0;

      switch (sortField) {
        case "name":
          result = compareStrings(a.name, b.name);
          break;
        case "amount":
          // Normalize amounts to monthly for fair comparison
          const aMonthly =
            a.frequency === Frequency.YEARLY ? a.amount / 12 : a.amount;
          const bMonthly =
            b.frequency === Frequency.YEARLY ? b.amount / 12 : b.amount;
          result = compareNumbers(aMonthly, bMonthly);
          break;
        case "billingDate":
          result = compareDates(a.billingDate, b.billingDate);
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
          // First sort by active status, then by billing date as a fallback
          result = compareBooleans(a.active, b.active);
          if (result === 0) {
            result = compareDates(a.billingDate, b.billingDate);
          }
      }

      // Apply sort direction
      return sortDirection === "asc" ? result : -result;
    });

    return subscriptionsCopy;
  }, [filteredSubscriptions, sortField, sortDirection]);

  // Calculate monthly and annual totals for active subscriptions
  const totals = useMemo(() => {
    const active = subscriptions.filter((sub) => sub.active);

    const monthlyTotal = active.reduce((sum, sub) => {
      return (
        sum +
        (sub.frequency === Frequency.MONTHLY ? sub.amount : sub.amount / 12)
      );
    }, 0);

    const annualTotal = active.reduce((sum, sub) => {
      return (
        sum +
        (sub.frequency === Frequency.YEARLY ? sub.amount : sub.amount * 12)
      );
    }, 0);

    return { monthlyTotal, annualTotal };
  }, [subscriptions]);

  // Handle subscription deletion with confirmation
  const handleDelete = useCallback(
    (id: string) => {
      if (
        window.confirm("Are you sure you want to delete this subscription?")
      ) {
        deleteSubscriptionFromApi(id);
        if (selectedId === id) {
          setSelectedId(null);
        }
      }
    },
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

  // Format billing date
  const formatBillingDate = useCallback((dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, []);

  // Get next billing date
  const getNextBillingDate = useCallback(
    (subscription: Subscription): string => {
      const billingDate = new Date(subscription.billingDate);
      const today = new Date();

      // Create date objects for comparison
      const currentMonthBillingDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        billingDate.getDate()
      );

      // If this is a monthly subscription
      if (subscription.frequency === Frequency.MONTHLY) {
        // If billing date for current month has already passed, move to next month
        if (currentMonthBillingDate < today) {
          currentMonthBillingDate.setMonth(
            currentMonthBillingDate.getMonth() + 1
          );
        }

        return formatBillingDate(currentMonthBillingDate.toISOString());
      } else {
        // For annual subscriptions
        // Get the billing date for this year
        const currentYearBillingDate = new Date(
          today.getFullYear(),
          billingDate.getMonth(),
          billingDate.getDate()
        );

        // If the billing date for this year has already passed, add a year
        if (currentYearBillingDate < today) {
          currentYearBillingDate.setFullYear(
            currentYearBillingDate.getFullYear() + 1
          );
        }

        return formatBillingDate(currentYearBillingDate.toISOString());
      }
    },
    [formatBillingDate]
  );

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

  return {
    // Data
    subscriptions,
    filteredSubscriptions,
    sortedSubscriptions,
    selectedSubscription,
    isLoading,
    error,
    totals,

    // State setters
    setSelectedId,
    setFilterActive,

    // Current state
    selectedId,
    filterActive,
    sortField,
    sortDirection,

    // Actions
    addSubscription,
    updateSubscription,
    deleteSubscription: handleDelete,
    handleSort,

    // Utility functions
    formatBillingDate,
    getNextBillingDate,
    getNecessityLevelColor,
  };
};
