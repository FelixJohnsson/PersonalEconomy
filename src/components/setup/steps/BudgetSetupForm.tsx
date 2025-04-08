import React, { useState, useEffect, useRef } from "react";
import { useAppContext } from "../../../context/AppContext";
import { EXPENSE_CATEGORIES, ExpenseCategory, Frequency } from "../../../types";

interface BudgetSetupFormProps {
  onNext: () => void;
  onBack: () => void;
}

interface BudgetItemFormData {
  category: ExpenseCategory;
  amount: string;
  percentage: number;
}

const BudgetSetupForm: React.FC<BudgetSetupFormProps> = ({
  onNext,
  onBack,
}) => {
  const { incomes, budgetItems, setBudgetItems } = useAppContext();
  const [totalMonthlyIncome, setTotalMonthlyIncome] = useState<number>(0);
  const [budgetAllocations, setBudgetAllocations] = useState<
    BudgetItemFormData[]
  >([]);
  const [remainingPercentage, setRemainingPercentage] = useState<number>(100);
  const [error, setError] = useState<string>("");
  const isSubmitting = useRef(false);

  // Calculate total monthly income
  useEffect(() => {
    const monthlyTotal = incomes.reduce((total, income) => {
      if (income.frequency === Frequency.MONTHLY) {
        return total + income.netAmount;
      } else if (income.frequency === Frequency.YEARLY) {
        return total + income.netAmount / 12;
      }
      return total;
    }, 0);

    setTotalMonthlyIncome(monthlyTotal);

    // Initialize budget allocations based on existing budgetItems or default categories
    if (budgetItems.length > 0) {
      setBudgetAllocations(
        budgetItems.map((item) => ({
          category: item.category,
          amount: item.amount.toString(),
          percentage: item.percentage,
        }))
      );

      // Calculate remaining percentage
      const totalPercentage = budgetItems.reduce(
        (total, item) => total + item.percentage,
        0
      );
      setRemainingPercentage(100 - totalPercentage);
    } else {
      // Initialize with default categories
      const initialAllocations = EXPENSE_CATEGORIES.map((category) => ({
        category,
        amount: "0",
        percentage: 0,
      }));
      setBudgetAllocations(initialAllocations);
    }
  }, [incomes, budgetItems]);

  // Update amount when percentage changes
  const handlePercentageChange = (index: number, percentage: number) => {
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;

    const newAllocations = [...budgetAllocations];
    const oldPercentage = newAllocations[index].percentage;
    const percentageDiff = percentage - oldPercentage;

    // Check if we have enough remaining percentage
    if (remainingPercentage - percentageDiff < 0 && percentageDiff > 0) {
      setError("You have allocated 100% of your budget already.");
      return;
    }

    setError("");
    newAllocations[index].percentage = percentage;
    newAllocations[index].amount = (
      (totalMonthlyIncome * percentage) /
      100
    ).toFixed(2);

    setBudgetAllocations(newAllocations);
    setRemainingPercentage(remainingPercentage - percentageDiff);
  };

  // Update percentage when amount changes
  const handleAmountChange = (index: number, amount: string) => {
    const newAmount = parseFloat(amount) || 0;

    const newAllocations = [...budgetAllocations];
    const oldPercentage = newAllocations[index].percentage;
    const newPercentage =
      totalMonthlyIncome > 0 ? (newAmount / totalMonthlyIncome) * 100 : 0;

    const percentageDiff = newPercentage - oldPercentage;

    // Check if we have enough remaining percentage
    if (remainingPercentage - percentageDiff < 0 && percentageDiff > 0) {
      setError("You have allocated 100% of your budget already.");
      return;
    }

    setError("");
    newAllocations[index].amount = amount;
    newAllocations[index].percentage = newPercentage;

    setBudgetAllocations(newAllocations);
    setRemainingPercentage(remainingPercentage - percentageDiff);
  };

  // Save budget allocations
  const handleSubmit = () => {
    // Prevent double submission
    if (isSubmitting.current) return;
    isSubmitting.current = true;

    // Validate allocations
    if (remainingPercentage < 0) {
      setError("Your budget allocations exceed 100% of your income.");
      isSubmitting.current = false;
      return;
    }

    // Filter out zero allocations
    const validAllocations = budgetAllocations.filter(
      (item) => item.percentage > 0
    );

    // Save budget items
    const newBudgetItems = validAllocations.map((item, index) => ({
      id: index.toString(),
      category: item.category,
      amount: parseFloat(item.amount),
      percentage: item.percentage,
    }));

    setBudgetItems(newBudgetItems);
    onNext();

    // Reset after navigation
    setTimeout(() => {
      isSubmitting.current = false;
    }, 500);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Set Up Your Budget
      </h2>
      <p className="text-gray-600 mb-6">
        Allocate your monthly income across different expense categories.
      </p>

      {totalMonthlyIncome > 0 ? (
        <>
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-blue-700 font-medium">Monthly Income:</p>
                <p className="text-blue-900 text-2xl font-bold">
                  kr {totalMonthlyIncome.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-blue-700 font-medium">Remaining:</p>
                <p
                  className={`text-xl font-bold ${
                    remainingPercentage === 0
                      ? "text-green-600"
                      : remainingPercentage < 0
                      ? "text-red-600"
                      : "text-blue-600"
                  }`}
                >
                  {remainingPercentage.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
              {error}
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {budgetAllocations.map((item, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500">kr</span>
                        </div>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.amount}
                          onChange={(e) =>
                            handleAmountChange(index, e.target.value)
                          }
                          className="pl-10 px-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          value={item.percentage}
                          onChange={(e) =>
                            handlePercentageChange(
                              index,
                              parseFloat(e.target.value)
                            )
                          }
                          className="w-full mr-2"
                        />
                        <span className="w-12 text-right">
                          {item.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="bg-yellow-50 p-4 rounded-lg mb-6 text-yellow-800">
          <p className="font-medium">No income has been set up yet.</p>
          <p>Please go back and add your income sources to create a budget.</p>
        </div>
      )}

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="px-4 py-2 text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          disabled={totalMonthlyIncome === 0}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default BudgetSetupForm;
