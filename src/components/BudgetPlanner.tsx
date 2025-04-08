import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { EXPENSE_CATEGORIES, BudgetItem, Frequency } from "../types";
import { formatCurrency } from "../utils/formatters";
import { v4 as uuidv4 } from "uuid";
import { useSubscriptions } from "../hooks/useSubscriptions";

const BudgetPlanner: React.FC = () => {
  const {
    expenses,
    incomes,
    budgetItems: savedBudgetItems,
    setBudgetItems,
  } = useAppContext();

  const { sortedSubscriptions } = useSubscriptions();

  const [grossMonthlyIncome, setGrossMonthlyIncome] = useState<number>(0);
  const [monthlySubscriptionCosts, setMonthlySubscriptionCosts] =
    useState<number>(0);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(0);
  const [budgetItems, setBudgetItemsLocal] = useState<BudgetItem[]>([]);
  const [editMode, setEditMode] = useState<"amount" | "percentage">("amount");
  const [unallocated, setUnallocated] = useState<number>(0);
  const [unallocatedPercentage, setUnallocatedPercentage] =
    useState<number>(100);
  const [allocated, setAllocated] = useState<number>(0);
  const [allocatedPercentage, setAllocatedPercentage] = useState<number>(0);

  // Calculate monthly income from all income sources minus subscription costs
  useEffect(() => {
    // Calculate total monthly income
    const totalMonthlyIncome = incomes.reduce((total, income) => {
      if (income.frequency === Frequency.MONTHLY) {
        return total + income.netAmount;
      } else if (income.frequency === Frequency.YEARLY) {
        return total + income.netAmount / 12;
      }
      return total;
    }, 0);

    setGrossMonthlyIncome(totalMonthlyIncome);

    // Calculate monthly subscription costs
    const subscriptionTotal = sortedSubscriptions.reduce(
      (total, subscription) => {
        if (subscription.frequency === Frequency.MONTHLY) {
          return total + subscription.amount;
        } else if (subscription.frequency === Frequency.YEARLY) {
          return total + subscription.amount / 12;
        }
        return total;
      },
      0
    );

    setMonthlySubscriptionCosts(subscriptionTotal);

    // Set income as total income minus subscription costs
    const incomeAfterSubscriptions = totalMonthlyIncome - subscriptionTotal;
    setMonthlyIncome(incomeAfterSubscriptions);
  }, [incomes]);

  // Initialize budget items - either from saved data or with default categories
  useEffect(() => {
    if (savedBudgetItems && savedBudgetItems.length > 0) {
      // Use saved budget items from context
      setBudgetItemsLocal(savedBudgetItems);
    } else {
      // Initialize with default categories
      const initialBudgetItems: BudgetItem[] = EXPENSE_CATEGORIES.map(
        (category) => ({
          id: uuidv4(),
          category,
          amount: 0,
          percentage: 0,
        })
      );

      setBudgetItemsLocal(initialBudgetItems);
      // Save to context/localStorage
      setBudgetItems(initialBudgetItems);
    }
  }, [savedBudgetItems, setBudgetItems]);

  // Calculate unallocated budget whenever budget items change
  useEffect(() => {
    // Calculate total allocated amount
    const totalAllocated = budgetItems.reduce(
      (sum, item) => sum + item.amount,
      0
    );

    // Calculate total allocated percentage - use exact sum rather than stored values
    const rawAllocatedPercentage = budgetItems.reduce(
      (sum, item) =>
        sum + (monthlyIncome > 0 ? (item.amount / monthlyIncome) * 100 : 0),
      0
    );

    // Round to 1 decimal place for consistency
    const totalAllocatedPercentage =
      Math.round(rawAllocatedPercentage * 10) / 10;

    // Set allocated values
    setAllocated(totalAllocated);
    setAllocatedPercentage(totalAllocatedPercentage);

    // Set unallocated values - ensure they're exact complements
    setUnallocated(monthlyIncome - totalAllocated);

    // Ensure unallocated percentage is exactly 100% minus allocated percentage
    // Use Math.max to prevent negative values due to rounding
    setUnallocatedPercentage(
      Math.max(0, Math.round((100 - totalAllocatedPercentage) * 10) / 10)
    );
  }, [budgetItems, monthlyIncome]);

  // Save budget items to context whenever they change
  useEffect(() => {
    // Only save if we have items to save and they're not just the initial load
    if (budgetItems.length > 0) {
      setBudgetItems(budgetItems);
    }
  }, [budgetItems, setBudgetItems]);

  // Handle changing budget allocation
  const handleBudgetChange = (index: number, value: number) => {
    setBudgetItemsLocal((prevItems) => {
      const newItems = [...prevItems];

      if (editMode === "amount") {
        // First, round the amount to 2 decimal places to avoid tiny decimal imprecision
        const roundedAmount = Math.round(value * 100) / 100;
        newItems[index].amount = roundedAmount;

        // Calculate percentage with higher precision than displayed
        if (monthlyIncome > 0) {
          // Calculate exact percentage based on amount
          newItems[index].percentage =
            Math.round((roundedAmount / monthlyIncome) * 1000) / 10;
        } else {
          newItems[index].percentage = 0;
        }
      } else {
        // For percentage mode, store exact percentage (rounded to 1 decimal)
        const roundedPercentage = Math.round(value * 10) / 10;
        newItems[index].percentage = roundedPercentage;

        // Update amount based on new percentage - exact calculation to 2 decimal places
        newItems[index].amount =
          Math.round((roundedPercentage / 100) * monthlyIncome * 100) / 100;
      }

      return newItems;
    });
  };

  // Handle toggling between amount and percentage mode
  const toggleEditMode = () => {
    setEditMode((prev) => (prev === "amount" ? "percentage" : "amount"));
  };

  return (
    <div className="bg-white shadow-md rounded p-6 mb-4">
      <h2 className="text-xl font-semibold mb-4">Budget Planner</h2>

      {/* Income Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Monthly Income
        </label>
        <div className="flex flex-col space-y-2">
          <div className="flex items-center">
            <span className="mr-2">Gross Income:</span>
            <p>{grossMonthlyIncome}</p>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">Subscription Costs:</span>
            <span className="text-red-500">
              -{formatCurrency(monthlySubscriptionCosts)}
            </span>
          </div>
          <div className="flex items-center font-medium">
            <span className="mr-2">Available Income:</span>
            <span className="text-green-600">
              {formatCurrency(monthlyIncome)}
            </span>
            <button
              className="ml-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded"
              onClick={toggleEditMode}
            >
              {editMode === "amount" ? "Edit Percentages" : "Edit Amounts"}
            </button>
          </div>
        </div>
      </div>

      {/* Budget Allocation Table */}
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {editMode === "amount" ? "Amount (kr)" : "Percentage"}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {editMode === "amount" ? "% of Income" : "Amount (kr)"}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {budgetItems.map((item, index) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap">{item.category}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <input
                      type="number"
                      className="shadow border rounded py-1 px-2 text-gray-700 w-32"
                      value={
                        editMode === "amount" ? item.amount : item.percentage
                      }
                      onChange={(e) =>
                        handleBudgetChange(
                          index,
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                    {editMode === "percentage" && (
                      <span className="ml-1">%</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editMode === "amount"
                    ? `${(monthlyIncome > 0
                        ? (item.amount / monthlyIncome) * 100
                        : 0
                      ).toFixed(1)}%`
                    : formatCurrency(item.amount)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr className="font-medium">
              <td className="px-6 py-3">Unallocated</td>
              <td className="px-6 py-3">
                {editMode === "amount"
                  ? formatCurrency(unallocated)
                  : `${unallocatedPercentage.toFixed(1)}%`}
              </td>
              <td className="px-6 py-3">
                {editMode === "amount"
                  ? `${unallocatedPercentage.toFixed(1)}%`
                  : formatCurrency(unallocated)}
              </td>
            </tr>
            <tr className="font-medium">
              <td className="px-6 py-3">Allocated</td>
              <td className="px-6 py-3">
                {editMode === "amount"
                  ? formatCurrency(allocated)
                  : `${allocatedPercentage.toFixed(1)}%`}
              </td>
              <td className="px-6 py-3">
                {editMode === "amount"
                  ? `${allocatedPercentage.toFixed(1)}%`
                  : formatCurrency(allocated)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Budget Visualization */}
      <div>
        <h3 className="text-lg font-medium mb-2">Budget Allocation</h3>
        {/* Progress Bar showing budget allocation */}
        <div className="h-8 w-full rounded-lg  bg-gray-200 mb-4 flex flex-row">
          {budgetItems
            .sort((a, b) => b.percentage - a.percentage)
            .map((item, index) => {
              return (
                <div
                  key={item.id}
                  className="h-full float-left"
                  style={{
                    width: `${item.percentage}%`,
                    marginLeft: index === 0 ? `0%` : `0`,
                    backgroundColor: getColorForIndex(index),
                  }}
                ></div>
              );
            })}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {budgetItems
            .filter((item) => item.percentage > 0)
            .sort((a, b) => b.percentage - a.percentage)
            .map((item, index) => (
              <div key={item.id} className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{
                    backgroundColor: getColorForIndex(
                      budgetItems.findIndex((i) => i.id === item.id)
                    ),
                  }}
                />
                <span className="text-sm">
                  {item.category}: {item.percentage.toFixed(1)}%
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Comparison with Actual Spending */}
      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Budget vs. Actual Spending</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Budgeted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actual (25th to 25th)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Difference
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {budgetItems.map((item) => {
                // Calculate actual spending for the period from 25th to 25th
                const today = new Date();
                const currentDay = today.getDate();

                // If today is before the 25th, then period is 25th of last month to 25th of this month
                // Otherwise, it's 25th of this month to 25th of next month
                let startMonth, endMonth;

                if (currentDay < 25) {
                  // Before the 25th - period is previous month's 25th to current month's 25th
                  startMonth = today.getMonth() - 1;
                  endMonth = today.getMonth();
                } else {
                  // On or after the 25th - period is current month's 25th to next month's 25th
                  startMonth = today.getMonth();
                  endMonth = today.getMonth() + 1;
                }

                // Create the start and end dates
                const startDate = new Date(today.getFullYear(), startMonth, 25);
                const endDate = new Date(today.getFullYear(), endMonth, 25);

                // Handle year boundary cases
                if (startMonth < 0) {
                  // If the start month is negative (January with day < 25), adjust to December of previous year
                  startDate.setFullYear(today.getFullYear() - 1);
                  startDate.setMonth(11); // December
                }

                if (endMonth > 11) {
                  // If the end month is > 11 (December with day >= 25), adjust to January of next year
                  endDate.setFullYear(today.getFullYear() + 1);
                  endDate.setMonth(0); // January
                }

                // Format dates for display
                const startDateStr = startDate.toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                });
                const endDateStr = endDate.toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                });

                // Convert dates to string format for comparison with expense dates
                const startDateISO = startDate.toISOString().split("T")[0];
                const endDateISO = endDate.toISOString().split("T")[0];

                // Filter expenses for this category within the date range
                const actualSpending = expenses
                  .filter(
                    (expense) =>
                      expense.category === item.category &&
                      expense.date &&
                      expense.date >= startDateISO &&
                      expense.date <= endDateISO
                  )
                  .reduce((sum, expense) => sum + expense.amount, 0);

                const difference = item.amount - actualSpending;

                return (
                  <tr key={`actual-${item.id}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        {formatCurrency(actualSpending)}
                        <div className="text-xs text-gray-500">
                          {startDateStr} - {endDateStr}
                        </div>
                      </div>
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap ${
                        difference >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {difference >= 0
                        ? `+${formatCurrency(difference)}`
                        : formatCurrency(difference)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Helper function to get a color for the budget visualization
function getColorForIndex(index: number): string {
  const colors = [
    "#4299E1", // blue-500
    "#48BB78", // green-500
    "#ED8936", // orange-500
    "#9F7AEA", // purple-500
    "#F56565", // red-500
    "#38B2AC", // teal-500
    "#667EEA", // indigo-500
    "#D69E2E", // yellow-600
    "#63B3ED", // blue-400
    "#9AE6B4", // green-300
    "#FBD38D", // orange-300
    "#B794F4", // purple-300
    "#FC8181", // red-300
    "#4FD1C5", // teal-300
    "#7F9CF5", // indigo-300
    "#F6E05E", // yellow-400
    "#F6AD55", // orange-400
    "#90CDF4", // blue-200
    "#C6F6D5", // green-100
    "#FEEBC8", // orange-100
    "#FEE6E6", // red-100
    "#E2E8F0", // gray-200
  ];

  return colors[index % colors.length];
}

export default BudgetPlanner;
