import React, { useState, useMemo } from "react";
import { useAppContext } from "../context/AppContext";
import { formatCurrency } from "../utils/formatters";
import { Frequency } from "../types";
import { useSubscriptions } from "../hooks/useSubscriptions";

const CategoriesPage: React.FC = () => {
  const { expenses, incomes } = useAppContext();
  const { subscriptions } = useSubscriptions();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Calculate totals for each category
  const categoryData = useMemo(() => {
    const data: {
      [key: string]: {
        expenseCount: number;
        expenseTotal: { monthly: number; annual: number };
        incomeCount: number;
        incomeTotal: { monthly: number; annual: number };
        subscriptionCount: number;
        subscriptionTotal: { monthly: number; annual: number };
      };
    } = {};

    // Collect all possible categories from all data sources
    const allCategoriesSet = new Set<string>();

    // Add categories from expenses
    expenses.forEach((expense) => {
      if (expense.category) {
        allCategoriesSet.add(expense.category);
      }
    });

    // Add categories from incomes
    incomes.forEach((income) => {
      if (income.type) {
        allCategoriesSet.add(income.type);
      }
    });

    // Add categories from subscriptions
    subscriptions.forEach((subscription) => {
      if (subscription.category) {
        allCategoriesSet.add(subscription.category);
      }
    });

    // Initialize data structure for each category
    Array.from(allCategoriesSet).forEach((category) => {
      data[category] = {
        expenseCount: 0,
        expenseTotal: { monthly: 0, annual: 0 },
        incomeCount: 0,
        incomeTotal: { monthly: 0, annual: 0 },
        subscriptionCount: 0,
        subscriptionTotal: { monthly: 0, annual: 0 },
      };
    });

    // Add expenses data
    expenses.forEach((expense) => {
      if (!expense.category || !data[expense.category]) return;

      data[expense.category].expenseCount++;

      if (expense.frequency === "monthly") {
        data[expense.category].expenseTotal.monthly += expense.amount;
        data[expense.category].expenseTotal.annual += expense.amount * 12;
      } else {
        data[expense.category].expenseTotal.monthly += expense.amount / 12;
        data[expense.category].expenseTotal.annual += expense.amount;
      }
    });

    // Add income data
    incomes.forEach((income) => {
      if (!income.type || !data[income.type]) return;

      data[income.type].incomeCount++;

      if (income.frequency === "monthly") {
        data[income.type].incomeTotal.monthly += income.netAmount;
        data[income.type].incomeTotal.annual += income.netAmount * 12;
      } else {
        data[income.type].incomeTotal.monthly += income.netAmount / 12;
        data[income.type].incomeTotal.annual += income.netAmount;
      }
    });

    // Add subscription data (only active subscriptions)
    subscriptions.forEach((subscription) => {
      if (!subscription.category || !data[subscription.category]) return;

      data[subscription.category].subscriptionCount++;

      if (subscription.frequency === "monthly") {
        data[subscription.category].subscriptionTotal.monthly +=
          subscription.amount;
        data[subscription.category].subscriptionTotal.annual +=
          subscription.amount * 12;
      } else {
        data[subscription.category].subscriptionTotal.monthly +=
          subscription.amount / 12;
        data[subscription.category].subscriptionTotal.annual +=
          subscription.amount;
      }
    });

    return data;
  }, [expenses, incomes, subscriptions]);

  // Get actual categories that have data
  const validCategories = useMemo(() => {
    return Object.keys(categoryData);
  }, [categoryData]);

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

  // Get category items when a category is selected
  const getCategoryItems = () => {
    if (!selectedCategory)
      return { expenses: [], incomes: [], subscriptions: [] };

    return {
      expenses: expenses.filter((e) => e.category === selectedCategory),
      incomes: incomes.filter((i) => i.type === selectedCategory),
      subscriptions: subscriptions.filter(
        (s) => s.category === selectedCategory
      ),
    };
  };

  const {
    expenses: categoryExpenses,
    incomes: categoryIncomes,
    subscriptions: categorySubscriptions,
  } = useMemo(getCategoryItems, [
    selectedCategory,
    expenses,
    incomes,
    subscriptions,
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Categories</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white shadow-md rounded p-6">
            <h2 className="text-xl font-semibold mb-4">Categories Overview</h2>

            {validCategories.length === 0 ? (
              <p className="text-gray-500">No categories found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Expenses
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Income
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subscriptions
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monthly Net
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {validCategories.map((category) => {
                      const data = categoryData[category];
                      if (!data) return null;

                      const monthlyNet =
                        data.incomeTotal.monthly -
                        data.expenseTotal.monthly -
                        data.subscriptionTotal.monthly;

                      return (
                        <tr
                          key={category}
                          className={`hover:bg-gray-50 cursor-pointer ${
                            selectedCategory === category ? "bg-blue-50" : ""
                          }`}
                          onClick={() =>
                            setSelectedCategory(
                              selectedCategory === category ? null : category
                            )
                          }
                        >
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
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {data.expenseCount > 0 ? (
                              <div>
                                <span className="text-sm font-medium">
                                  {data.expenseCount}
                                </span>
                                <span className="text-xs text-gray-500 ml-1">
                                  ({formatCurrency(data.expenseTotal.monthly)}
                                  /mo)
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {data.incomeCount > 0 ? (
                              <div>
                                <span className="text-sm font-medium">
                                  {data.incomeCount}
                                </span>
                                <span className="text-xs text-gray-500 ml-1">
                                  ({formatCurrency(data.incomeTotal.monthly)}
                                  /mo)
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {data.subscriptionCount > 0 ? (
                              <div>
                                <span className="text-sm font-medium">
                                  {data.subscriptionCount}
                                </span>
                                <span className="text-xs text-gray-500 ml-1">
                                  (
                                  {formatCurrency(
                                    data.subscriptionTotal.monthly
                                  )}
                                  /mo)
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <span
                              className={`font-medium ${
                                monthlyNet >= 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {formatCurrency(monthlyNet)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div>
          {selectedCategory && categoryData[selectedCategory] && (
            <div className="bg-white shadow-md rounded p-6">
              <div className="flex items-center mb-4">
                <div
                  className="w-4 h-4 rounded-full mr-2"
                  style={{
                    backgroundColor: getCategoryColor(selectedCategory),
                  }}
                />
                <h2 className="text-xl font-semibold">
                  {selectedCategory} Details
                </h2>
              </div>

              {categoryExpenses.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-md font-medium mb-2">Expenses</h3>
                  <ul className="text-sm space-y-1">
                    {categoryExpenses.map((expense) => (
                      <li key={expense._id} className="flex justify-between">
                        <span>{expense.name}</span>
                        <span>
                          {formatCurrency(expense.amount)}
                          {expense.frequency === Frequency.YEARLY
                            ? "/year"
                            : "/month"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {categoryIncomes.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-md font-medium mb-2">Income</h3>
                  <ul className="text-sm space-y-1">
                    {categoryIncomes.map((income) => (
                      <li key={income._id} className="flex justify-between">
                        <span>{income.name}</span>
                        <span>
                          {formatCurrency(income.netAmount)}
                          {income.frequency === Frequency.YEARLY
                            ? "/year"
                            : "/month"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {categorySubscriptions.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-md font-medium mb-2">Subscriptions</h3>
                  <ul className="text-sm space-y-1">
                    {categorySubscriptions.map((subscription) => (
                      <li
                        key={subscription._id}
                        className="flex justify-between"
                      >
                        <span>{subscription.name}</span>
                        <span>
                          {formatCurrency(subscription.amount)}
                          {subscription.frequency === Frequency.YEARLY
                            ? "/year"
                            : "/month"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-sm font-medium">
                  <span>Monthly total:</span>
                  <span className="font-semibold">
                    {formatCurrency(
                      categoryData[selectedCategory].incomeTotal.monthly -
                        categoryData[selectedCategory].expenseTotal.monthly -
                        categoryData[selectedCategory].subscriptionTotal.monthly
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-medium mt-1">
                  <span>Annual total:</span>
                  <span className="font-semibold">
                    {formatCurrency(
                      categoryData[selectedCategory].incomeTotal.annual -
                        categoryData[selectedCategory].expenseTotal.annual -
                        categoryData[selectedCategory].subscriptionTotal.annual
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
