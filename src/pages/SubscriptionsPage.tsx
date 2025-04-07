import React, { useState, useMemo } from "react";
import { useAppContext } from "../context/AppContext";
import SubscriptionForm from "../components/SubscriptionForm";
import { formatCurrency } from "../utils/formatters";
import { NecessityLevel } from "../types";

// Define sort options
type SortField = "name" | "amount" | "necessityLevel" | "billingDate";
type SortDirection = "asc" | "desc";

const SubscriptionsPage: React.FC = () => {
  const { subscriptions, deleteSubscription } = useAppContext();
  const [selectedSubscription, setSelectedSubscription] = useState<
    string | null
  >(null);
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const [sortField, setSortField] = useState<SortField>("billingDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Filter subscriptions by active status
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter(
      (sub) => filterActive === null || sub.isActive === filterActive
    );
  }, [subscriptions, filterActive]);

  // Sort subscriptions
  const sortedSubscriptions = useMemo(() => {
    const subscriptionsCopy = [...filteredSubscriptions];

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
          const aMonthly = a.frequency === "annual" ? a.amount / 12 : a.amount;
          const bMonthly = b.frequency === "annual" ? b.amount / 12 : b.amount;
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
          result = compareBooleans(a.isActive, b.isActive);
          if (result === 0) {
            result = compareDates(a.billingDate, b.billingDate);
          }
      }

      // Apply sort direction
      return sortDirection === "asc" ? result : -result;
    });

    return subscriptionsCopy;
  }, [filteredSubscriptions, sortField, sortDirection]);

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this subscription?")) {
      deleteSubscription(id);
      if (selectedSubscription === id) {
        setSelectedSubscription(null);
      }
    }
  };

  // Handle sort change
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Calculate monthly and annual totals for active subscriptions
  const calculateTotals = () => {
    const active = subscriptions.filter((sub) => sub.isActive);

    const monthlyTotal = active.reduce((sum, sub) => {
      return sum + (sub.frequency === "monthly" ? sub.amount : sub.amount / 12);
    }, 0);

    const annualTotal = active.reduce((sum, sub) => {
      return sum + (sub.frequency === "annual" ? sub.amount : sub.amount * 12);
    }, 0);

    return { monthlyTotal, annualTotal };
  };

  const { monthlyTotal, annualTotal } = calculateTotals();

  // Get color for necessity level
  const getNecessityLevelColor = (level?: NecessityLevel) => {
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
  };

  // Format billing date
  const formatBillingDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get next billing date
  const getNextBillingDate = (
    subscription: (typeof subscriptions)[0]
  ): string => {
    const billingDate = new Date(subscription.billingDate);
    const today = new Date();

    // Create date objects for comparison
    const currentMonthBillingDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      billingDate.getDate()
    );

    // If this is a monthly subscription
    if (subscription.frequency === "monthly") {
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
  };

  // Render sort indicator
  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) return null;
    return <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Subscriptions</h1>

      {/* Summary Card */}
      <div className="bg-white shadow-md rounded p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Subscription Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded">
            <p className="text-sm text-gray-600 mb-1">
              Monthly Subscription Cost
            </p>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(monthlyTotal)}
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded">
            <p className="text-sm text-gray-600 mb-1">
              Annual Subscription Cost
            </p>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(annualTotal)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white shadow-md rounded p-6">
            <div className="flex flex-col md:flex-row justify-between mb-4">
              <h2 className="text-xl font-semibold">Your Subscriptions</h2>

              <div className="flex items-center mt-4 md:mt-0 space-x-4">
                <div>
                  <label
                    htmlFor="status-filter"
                    className="mr-2 text-sm font-medium text-gray-700"
                  >
                    Filter by:
                  </label>
                  <select
                    id="status-filter"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={
                      filterActive === null
                        ? "all"
                        : filterActive
                        ? "active"
                        : "inactive"
                    }
                    onChange={(e) => {
                      if (e.target.value === "all") setFilterActive(null);
                      else if (e.target.value === "active")
                        setFilterActive(true);
                      else setFilterActive(false);
                    }}
                  >
                    <option value="all">All Subscriptions</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                  </select>
                </div>
              </div>
            </div>

            {sortedSubscriptions.length === 0 ? (
              <p className="text-gray-500">No subscriptions found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("name")}
                      >
                        Name {renderSortIndicator("name")}
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("amount")}
                      >
                        Amount {renderSortIndicator("amount")}
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("billingDate")}
                      >
                        Next Billing {renderSortIndicator("billingDate")}
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("necessityLevel")}
                      >
                        Necessity {renderSortIndicator("necessityLevel")}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedSubscriptions.map((subscription) => (
                      <tr key={subscription.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {subscription.name}
                              </div>
                              {!subscription.isActive && (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                  Inactive
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatCurrency(subscription.amount)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {subscription.frequency === "annual"
                              ? "Yearly"
                              : "Monthly"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {subscription.isActive
                            ? getNextBillingDate(subscription)
                            : "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {subscription.necessityLevel ? (
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getNecessityLevelColor(
                                subscription.necessityLevel
                              )}`}
                            >
                              {subscription.necessityLevel}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() =>
                              setSelectedSubscription(subscription.id)
                            }
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(subscription.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="bg-white shadow-md rounded p-6">
            <h2 className="text-xl font-semibold mb-4">
              {selectedSubscription
                ? "Edit Subscription"
                : "Add New Subscription"}
            </h2>
            <SubscriptionForm
              initialSubscription={
                selectedSubscription
                  ? subscriptions.find((s) => s.id === selectedSubscription)
                  : undefined
              }
              onSubmit={() => setSelectedSubscription(null)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionsPage;
