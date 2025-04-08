import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { Income, IncomeFrequency } from "../types";
import Card from "./cards/Card";
import Button from "./buttons/Button";

interface IncomeFormProps {
  initialIncome?: Income;
  onSubmit?: () => void;
}

const IncomeForm: React.FC<IncomeFormProps> = ({ initialIncome, onSubmit }) => {
  const { addIncome, updateIncome } = useAppContext();

  const [name, setName] = useState(initialIncome?.name || "");
  const [grossAmount, setGrossAmount] = useState(
    initialIncome?.grossAmount || 0
  );
  const [taxRate, setTaxRate] = useState(initialIncome?.taxRate || 23); // Default tax rate of 30%
  const [netAmount, setNetAmount] = useState(initialIncome?.netAmount || 0);
  const [isRecurring, setIsRecurring] = useState<boolean>(
    initialIncome?.isRecurring || true
  );
  const [frequency, setFrequency] = useState<IncomeFrequency>(
    initialIncome?.frequency || IncomeFrequency.MONTHLY
  );
  const [category, setCategory] = useState(initialIncome?.type || "Salary");
  const [date, setDate] = useState(
    initialIncome?.date || new Date().toISOString().split("T")[0]
  );
  const [error, setError] = useState("");

  // Calculate net amount when gross amount or tax rate changes
  useEffect(() => {
    const calculatedNetAmount = grossAmount * (1 - taxRate / 100);
    setNetAmount(Math.round(calculatedNetAmount * 100) / 100); // Round to 2 decimal places
  }, [grossAmount, taxRate]);

  // Update form state when initialIncome changes (for editing)
  useEffect(() => {
    if (initialIncome) {
      console.log("Initializing form with income:", initialIncome);
      setName(initialIncome.name);
      // If we have grossAmount, use it, otherwise fall back to amount (for backward compatibility)
      setGrossAmount(initialIncome.grossAmount);
      setTaxRate(initialIncome.taxRate || 30);
      setNetAmount(initialIncome.netAmount);
      setIsRecurring(initialIncome.isRecurring);
      setFrequency(initialIncome.frequency);
      setCategory(initialIncome.type);
      setDate(initialIncome.date || new Date().toISOString().split("T")[0]);
      setError("");
    }
  }, [initialIncome]);

  const handleNetAmountChange = (value: number) => {
    setNetAmount(value);
    const calculatedGrossAmount = value / (1 - taxRate / 100);
    setGrossAmount(Math.round(calculatedGrossAmount * 100) / 100);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Please enter an income name");
      return;
    }

    if (grossAmount <= 0) {
      setError("Gross amount must be greater than 0");
      return;
    }

    if (!category.trim()) {
      setError("Please enter a category");
      return;
    }

    if (!date) {
      setError("Please select a date");
      return;
    }

    const incomeData = {
      name,
      amount: grossAmount.toString(), // For form compatibility
      grossAmount: grossAmount.toString(),
      netAmount: netAmount.toString(),
      taxRate: taxRate.toString(),
      frequency,
      category,
      isRecurring,
      date,
    };

    console.log("Form submitted with data:", incomeData);

    // Convert form data to the format expected by addIncome
    addIncome({
      name,
      grossAmount: parseFloat(grossAmount.toString()),
      netAmount: parseFloat(netAmount.toString()),
      taxRate: parseFloat(taxRate.toString()),
      frequency,
      type: category,
      isRecurring,
      date,
    });

    // Reset form
    if (!initialIncome) {
      setName("");
      setGrossAmount(0);
      setTaxRate(23);
      setNetAmount(0);
      setIsRecurring(true);
      setFrequency(IncomeFrequency.MONTHLY);
      setCategory("Salary");
      setDate(new Date().toISOString().split("T")[0]);
    }

    setError("");
    if (onSubmit) onSubmit();
  };

  return (
    <Card variant="default" size="lg" className="mb-6">
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="mb-4">
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="name"
            >
              Income Name
            </label>
            <input
              id="name"
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="E.g., Salary, Freelance Work, Dividend"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="grossAmount"
            >
              Gross Amount (Before Tax)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">kr</span>
              </div>
              <input
                id="grossAmount"
                type="number"
                className="w-full pl-10 py-2 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
                min="0"
                step="0.01"
                value={grossAmount || ""}
                onChange={(e) =>
                  setGrossAmount(parseFloat(e.target.value) || 0)
                }
              />
            </div>
          </div>

          <div className="mb-4">
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="taxRate"
            >
              Tax Rate (%)
            </label>
            <input
              id="taxRate"
              type="number"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="E.g., 30"
              min="0"
              max="100"
              step="0.1"
              value={taxRate || ""}
              onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="netAmount"
            >
              Net Amount (After Tax)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">kr</span>
              </div>
              <input
                id="netAmount"
                type="number"
                className="w-full pl-10 py-2 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
                min="0"
                step="0.01"
                value={netAmount || ""}
                onChange={(e) =>
                  handleNetAmountChange(parseFloat(e.target.value) || 0)
                }
              />
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isRecurring"
                name="isRecurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="isRecurring"
                className="ml-2 block text-sm text-gray-700"
              >
                This is a recurring income
              </label>
            </div>
          </div>

          {isRecurring && (
            <div className="mb-4">
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="frequency"
              >
                Frequency
              </label>
              <select
                id="frequency"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={frequency}
                onChange={(e) =>
                  setFrequency(e.target.value as IncomeFrequency)
                }
              >
                <option value={IncomeFrequency.MONTHLY}>Monthly</option>
                <option value={IncomeFrequency.WEEKLY}>Weekly</option>
                <option value={IncomeFrequency.BIWEEKLY}>Bi-weekly</option>
                <option value={IncomeFrequency.DAILY}>Daily</option>
              </select>
            </div>
          )}

          <div className="mb-4">
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="date"
            >
              Income Date
            </label>
            <input
              id="date"
              type="date"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="category"
            >
              Category
            </label>
            <input
              id="category"
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="E.g., Salary, Investment, Side Hustle"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-6">
          <Button type="submit" variant="primary" size="md">
            {initialIncome ? "Update Income" : "Add Income"}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default IncomeForm;
