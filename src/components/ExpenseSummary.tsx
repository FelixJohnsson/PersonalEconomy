import React, { useState, useEffect } from "react";
import { useExpenses } from "../hooks/useExpenses";
import { Expense } from "../types";
import { formatCurrency } from "../utils/formatters";

interface ExpenseSummaryProps {
  period?: Record<string, string>;
}

interface CategorySummary {
  category: string;
  amount: number;
  count: number;
}

const ExpenseSummary: React.FC<ExpenseSummaryProps> = ({
  period: propPeriod,
}) => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const { expenses } = useExpenses();
  const [period, setPeriod] = useState<Record<string, string>>(() => {
    const startMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const startYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const startDate = new Date(startYear, startMonth, 25 + 1);

    const endDate = new Date(currentYear, currentMonth, 25 + 1);

    return {
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    };
  });

  // Use provided period if it exists
  useEffect(() => {
    if (propPeriod) {
      setPeriod(propPeriod);
    }
  }, [propPeriod]);

  // Handle date changes
  const handleDateChange = (
    dateType: "startDate" | "endDate",
    value: string
  ) => {
    setPeriod((prev) => ({
      ...prev,
      [dateType]: value,
    }));
  };

  // Filter expenses by date range
  const filteredExpenses = expenses.filter((expense) => {
    if (!expense.date) return false;
    return expense.date >= period.startDate && expense.date <= period.endDate;
  });

  // Group expenses by category and calculate total per category
  const groupByCategory = (expenseList: Expense[]): CategorySummary[] => {
    const groups: Record<string, CategorySummary> = {};

    expenseList.forEach((expense) => {
      if (!groups[expense.category]) {
        groups[expense.category] = {
          category: expense.category,
          amount: 0,
          count: 0,
        };
      }

      groups[expense.category].amount += expense.amount;
      groups[expense.category].count += 1;
    });

    // Sort by amount (highest first)
    return Object.values(groups).sort((a, b) => b.amount - a.amount);
  };

  const summaryData = groupByCategory(filteredExpenses);
  const totalExpenses = summaryData.reduce((sum, item) => sum + item.amount, 0);
  const totalCount = summaryData.reduce((sum, item) => sum + item.count, 0);

  // Get a color based on category name
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

  return (
    <div className="bg-white shadow-md rounded p-6 mb-4">
      <h2 className="text-xl font-semibold mb-4">Expense Report</h2>

      {/* Date Range Selector */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            className="shadow border rounded py-1 px-2 text-gray-700"
            value={period.startDate}
            onChange={(e) => handleDateChange("startDate", e.target.value)}
          />
        </div>
        <div className="self-end pb-1">to</div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            className="shadow border rounded py-1 px-2 text-gray-700"
            value={period.endDate}
            onChange={(e) => handleDateChange("endDate", e.target.value)}
          />
        </div>
      </div>

      {filteredExpenses.length === 0 ? (
        <p className="text-gray-500">
          No expenses recorded in this time period.
        </p>
      ) : (
        <>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium">
                Period Total: {formatCurrency(totalExpenses)}
              </h3>
              <span className="text-sm text-gray-500">
                {totalCount} {totalCount === 1 ? "expense" : "expenses"}
              </span>
            </div>

            {/* Pie Chart Visualization */}
            <div className="h-4 w-full rounded-full overflow-hidden bg-gray-200 mb-4">
              {summaryData.map((item, index) => (
                <div
                  key={`${item.category}-${index}`}
                  className="h-full float-left"
                  style={{
                    width: `${(item.amount / totalExpenses) * 100}%`,
                    backgroundColor: getCategoryColor(item.category),
                  }}
                  title={`${item.category}: ${formatCurrency(item.amount)}`}
                />
              ))}
            </div>
          </div>

          {/* Category Breakdown */}
          <div>
            <h3 className="text-lg font-medium mb-2">Category Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Count
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Percentage
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {summaryData.map((item, index) => (
                    <tr key={`${item.category}-${index}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{
                              backgroundColor: getCategoryColor(item.category),
                            }}
                          />
                          {item.category}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        {formatCurrency(item.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {Math.round((item.amount / totalExpenses) * 100)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr className="font-medium">
                    <td className="px-6 py-3">Total</td>
                    <td className="px-6 py-3">{totalCount}</td>
                    <td className="px-6 py-3">
                      {formatCurrency(totalExpenses)}
                    </td>
                    <td className="px-6 py-3">100%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Necessity Level Summary */}
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">
              Necessity Level Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { level: "F", label: "F" },
                { level: "E", label: "E" },
                { level: "D", label: "D" },
                { level: "C", label: "C" },
                { level: "B", label: "B" },
                { level: "A", label: "A" },
                { level: "A+", label: "A+" },
              ].map(({ level, label }) => {
                const levelExpenses = filteredExpenses.filter(
                  (expense) => expense.necessityLevel === level
                );
                const total = levelExpenses.reduce(
                  (sum, expense) => sum + expense.amount,
                  0
                );
                const count = levelExpenses.length;

                return (
                  <div key={level} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">{label}</span>
                      <span className="font-semibold">
                        {formatCurrency(total)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mb-2">
                      {count} {count === 1 ? "expense" : "expenses"}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          level === "A+"
                            ? "bg-green-500"
                            : level === "A"
                            ? "bg-green-400"
                            : level === "B"
                            ? "bg-green-300"
                            : level === "C"
                            ? "bg-yellow-300"
                            : level === "D"
                            ? "bg-yellow-400"
                            : level === "E"
                            ? "bg-red-400"
                            : "bg-red-500"
                        }`}
                        style={{
                          width: `${(total / totalExpenses) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ExpenseSummary;
