import React, { useState, useMemo } from "react";
import { useAppContext } from "../context/AppContext";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseSummary from "../components/ExpenseSummary";
import { formatCurrency } from "../utils/formatters";
import { NecessityLevel, EXPENSE_CATEGORIES } from "../types";

// Define sort options
type SortField =
  | "name"
  | "amount"
  | "category"
  | "necessityLevel"
  | "frequency"
  | "date";
type SortDirection = "asc" | "desc";

const ExpensesPage: React.FC = () => {
  const { expenses, deleteExpense, getAllCategories } = useAppContext();
  const [selectedExpense, setSelectedExpense] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showNotes, setShowNotes] = useState<boolean>(false);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

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

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      deleteExpense(id);
      if (selectedExpense === id) {
        setSelectedExpense(null);
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

  // Calculate totals
  const categoryTotals = useMemo(() => {
    const totals: { [key: string]: { monthly: number; annual: number } } = {};

    expenses.forEach((expense) => {
      if (!totals[expense.category]) {
        totals[expense.category] = { monthly: 0, annual: 0 };
      }

      if (expense.frequency === "monthly") {
        totals[expense.category].monthly += expense.amount;
        totals[expense.category].annual += expense.amount * 12;
      } else {
        totals[expense.category].monthly += expense.amount;
        totals[expense.category].annual += expense.amount;
      }
    });

    return totals;
  }, [expenses]);

  // Get a color based on category
  const getCategoryColor = (category: string): string => {
    // Simple color hash function
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
      hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Convert to hex color
    const c = (hash & 0x00ffffff).toString(16).toUpperCase();

    return "#" + "00000".substring(0, 6 - c.length) + c;
  };

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

  // Render sort indicator
  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) return null;
    return <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>;
  };

  // Format date
  const formatExpenseDate = (dateString?: string): string => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Expenses</h1>

      <div className="grid grid-cols-1 gap-6 mb-6">
        <ExpenseSummary />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white shadow-md rounded p-6">
            <div className="flex flex-col md:flex-row justify-between mb-4">
              <h2 className="text-xl font-semibold">Your Expenses</h2>

              <div className="flex items-center mt-4 md:mt-0 space-x-4">
                <div>
                  <label
                    htmlFor="category-filter"
                    className="mr-2 text-sm font-medium text-gray-700"
                  >
                    Filter by:
                  </label>
                  <select
                    id="category-filter"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {EXPENSE_CATEGORIES.includes(category as any)
                          ? category
                          : `${category} (Custom)`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    id="show-notes"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={showNotes}
                    onChange={(e) => setShowNotes(e.target.checked)}
                  />
                  <label
                    htmlFor="show-notes"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Show Notes
                  </label>
                </div>
              </div>
            </div>

            {sortedExpenses.length === 0 ? (
              <p className="text-gray-500">No expenses found.</p>
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
                        onClick={() => handleSort("category")}
                      >
                        Category {renderSortIndicator("category")}
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("amount")}
                      >
                        Amount {renderSortIndicator("amount")}
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("frequency")}
                      >
                        Frequency {renderSortIndicator("frequency")}
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("date")}
                      >
                        Date {renderSortIndicator("date")}
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
                    {sortedExpenses.map((expense) => (
                      <React.Fragment key={expense.id}>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {expense.name.length > 20
                                ? expense.name.substring(0, 20) + "..."
                                : expense.name}
                            </div>
                            {expense.isRecurring && (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Recurring
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div
                                className="w-3 h-3 rounded-full mr-2"
                                style={{
                                  backgroundColor: getCategoryColor(
                                    expense.category
                                  ),
                                }}
                              />
                              {expense.category}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {formatCurrency(expense.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {expense.isRecurring
                              ? expense.frequency === "annual"
                                ? "Yearly"
                                : "Monthly"
                              : "One-time"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {formatExpenseDate(expense.date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {expense.necessityLevel ? (
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getNecessityLevelColor(
                                  expense.necessityLevel
                                )}`}
                              >
                                {expense.necessityLevel}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => setSelectedExpense(expense.id)}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(expense.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                        {showNotes && expense.notes && (
                          <tr className="bg-gray-50">
                            <td
                              colSpan={6}
                              className="px-6 py-2 text-sm text-gray-500"
                            >
                              <div className="flex items-start">
                                <span className="font-medium mr-2">Notes:</span>
                                <span>{expense.notes}</span>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Category Summary */}
          <div className="bg-white shadow-md rounded p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Category Summary</h2>
            {Object.keys(categoryTotals).length === 0 ? (
              <p className="text-gray-500">No expense data available.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monthly Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Annual Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(categoryTotals).map(
                      ([category, totals]) => (
                        <tr key={category}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div
                                className="w-3 h-3 rounded-full mr-2"
                                style={{
                                  backgroundColor: getCategoryColor(category),
                                }}
                              />
                              {category}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {formatCurrency(totals.monthly)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {formatCurrency(totals.annual)}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="bg-white shadow-md rounded p-6">
            <h2 className="text-xl font-semibold mb-4">
              {selectedExpense ? "Edit Expense" : "Add New Expense"}
            </h2>
            <ExpenseForm
              initialExpense={
                selectedExpense
                  ? expenses.find((e) => e.id === selectedExpense)
                  : undefined
              }
              onSubmit={() => setSelectedExpense(null)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpensesPage;
