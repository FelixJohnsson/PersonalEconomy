import React, { useState, useRef } from "react";
import { useAppContext } from "../../../context/AppContext";
import Button from "../../buttons/Button";
import Card from "../../cards/Card";
import { Expense } from "../../../types";
import {
  ExpenseFormData,
  expenseFromForm,
  expenseToForm,
} from "../../../types/forms";

interface ExpenseSetupFormProps {
  onNext: () => void;
  onBack: () => void;
}

// Common expense categories
const expenseCategories = [
  "Housing",
  "Transportation",
  "Food",
  "Utilities",
  "Insurance",
  "Healthcare",
  "Entertainment",
  "Personal Care",
  "Education",
  "Miscellaneous",
];

const initialExpense: ExpenseFormData = {
  name: "",
  amount: "",
  category: "Housing",
  isRecurring: true,
  frequency: "monthly",
  date: new Date().toISOString().split("T")[0],
};

const ExpenseSetupForm: React.FC<ExpenseSetupFormProps> = ({
  onNext,
  onBack,
}) => {
  const { addExpense, expenses, deleteExpense } = useAppContext();
  const [expenseItems, setExpenseItems] = useState<ExpenseFormData[]>(
    expenses.length > 0 ? expenses.map(expenseToForm) : [{ ...initialExpense }]
  );
  const [currentExpenseIndex, setCurrentExpenseIndex] = useState<number>(0);
  const isSubmitting = useRef(false);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const updatedItems = [...expenseItems];

    updatedItems[currentExpenseIndex] = {
      ...updatedItems[currentExpenseIndex],
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    };

    setExpenseItems(updatedItems);
  };

  // Add a new expense item form
  const addExpenseItem = () => {
    setExpenseItems([...expenseItems, { ...initialExpense }]);
    setCurrentExpenseIndex(expenseItems.length);
  };

  // Remove an expense item
  const removeExpenseItem = (index: number) => {
    const item = expenseItems[index];

    // If the item has an ID, it exists in the context, so delete it
    if (item.id) {
      deleteExpense(item.id);
    }

    if (expenseItems.length === 1) {
      // If it's the last item, just clear it
      setExpenseItems([{ ...initialExpense }]);
      setCurrentExpenseIndex(0);
      return;
    }

    const updatedItems = expenseItems.filter((_, i) => i !== index);
    setExpenseItems(updatedItems);

    // Adjust currentExpenseIndex if needed
    if (currentExpenseIndex >= updatedItems.length) {
      setCurrentExpenseIndex(updatedItems.length - 1);
    } else if (currentExpenseIndex === index) {
      setCurrentExpenseIndex(Math.max(0, index - 1));
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    // Prevent double submission
    if (isSubmitting.current) return;
    isSubmitting.current = true;

    // Save all valid expense items
    const validExpenses = expenseItems.filter(
      (item) => item.name.trim() !== "" && parseFloat(item.amount) > 0
    );

    // Add new expenses (only if they don't have an ID)
    validExpenses.forEach((item) => {
      if (!item.id) {
        // Convert form data to proper expense format
        const expenseData = expenseFromForm(item);
        addExpense(expenseData);
      }
    });

    // Go to next step
    onNext();

    // Reset after navigation
    setTimeout(() => {
      isSubmitting.current = false;
    }, 500);
  };

  // Select an expense item to edit
  const selectExpenseItem = (index: number) => {
    setCurrentExpenseIndex(index);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Set Up Your Expenses
      </h2>
      <p className="text-gray-600 mb-6">
        Add your regular expenses such as rent, utilities, groceries, etc.
      </p>

      <div className="mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {expenseItems.map((item, index) => (
            <Button
              key={index}
              onClick={() => selectExpenseItem(index)}
              variant={currentExpenseIndex === index ? "info" : "ghost"}
              size="sm"
              index={index}
            >
              {item.name || `Expense ${index + 1}`}
            </Button>
          ))}
          <Button
            onClick={addExpenseItem}
            variant="info"
            size="sm"
            icon={<span>+</span>}
          >
            Add Expense
          </Button>
        </div>

        <Card variant="default" size="lg" className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Expense Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={expenseItems[currentExpenseIndex]?.name || ""}
                onChange={handleChange}
                placeholder="e.g., Rent, Groceries, Car Payment"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Amount
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">kr</span>
                </div>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={expenseItems[currentExpenseIndex]?.amount || ""}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Category
              </label>
              <select
                id="category"
                name="category"
                value={expenseItems[currentExpenseIndex]?.category || "Housing"}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {expenseCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isRecurring"
                name="isRecurring"
                checked={
                  expenseItems[currentExpenseIndex]?.isRecurring || false
                }
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="isRecurring"
                className="ml-2 block text-sm text-gray-700"
              >
                This is a recurring expense
              </label>
            </div>

            {expenseItems[currentExpenseIndex]?.isRecurring && (
              <div>
                <label
                  htmlFor="frequency"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Frequency
                </label>
                <select
                  id="frequency"
                  name="frequency"
                  value={
                    expenseItems[currentExpenseIndex]?.frequency || "monthly"
                  }
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="monthly">Monthly</option>
                  <option value="annual">Annual</option>
                </select>
              </div>
            )}

            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={expenseItems[currentExpenseIndex]?.date || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-end md:col-span-2">
              <Button
                onClick={() => removeExpenseItem(currentExpenseIndex)}
                variant="danger"
                size="md"
              >
                Remove
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex justify-between">
        <Button onClick={onBack} variant="secondary" size="md">
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          variant="primary"
          size="md"
          isLoading={isSubmitting.current}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default ExpenseSetupForm;
