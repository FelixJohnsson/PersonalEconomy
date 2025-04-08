import React from "react";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseSummary from "../components/ExpenseSummary";
import { formatCurrency } from "../utils/formatters";
import { useExpenses } from "../hooks/useExpenses";

const ExpensesPage: React.FC = () => {
  const {
    sortedExpenses,
    categories,
    selectedExpense,
    categoryTotals,
    isLoading,
    error,
    selectedId,
    selectedCategory,
    showNotes,
    sortField,
    sortDirection,
    setSelectedId,
    setSelectedCategory,
    setShowNotes,
    deleteExpense,
    addExpense,
    updateExpense,
    handleSort,
    getCategoryColor,
    getNecessityLevelColor,
    formatExpenseDate,
  } = useExpenses();

  // Show loading indicator while data is being fetched
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading expense data...</p>
        </div>
      </div>
    );
  }

  // Show error message if data fetching failed
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <p className="text-red-600 font-bold mb-2">
            Error loading expense data
          </p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  // Render sort indicator
  const renderSortIndicator = (field: string) => {
    if (sortField !== field) return null;
    return <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>;
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
                        {category}
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
                      <React.Fragment key={expense._id}>
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
                              ? expense.frequency === "yearly"
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
                              onClick={() => setSelectedId(expense._id)}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteExpense(expense._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
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
              {selectedId ? "Edit Expense" : "Add New Expense"}
            </h2>
            <ExpenseForm
              initialExpense={selectedExpense}
              onSubmit={() => setSelectedId(null)}
              addExpense={addExpense}
              updateExpense={updateExpense}
              deselectExpense={() => setSelectedId(null)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpensesPage;
