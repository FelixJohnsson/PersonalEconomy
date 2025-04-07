import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { Income } from "../types";
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
    initialIncome?.grossAmount || initialIncome?.amount || 0
  );
  const [taxRate, setTaxRate] = useState(initialIncome?.taxRate || 30); // Default tax rate of 30%
  const [netAmount, setNetAmount] = useState(initialIncome?.netAmount || 0);
  const [frequency, setFrequency] = useState<"monthly" | "annual">(
    initialIncome?.frequency || "monthly"
  );
  const [category, setCategory] = useState(initialIncome?.category || "Salary");
  const [error, setError] = useState("");

  // Calculate net amount when gross amount or tax rate changes
  useEffect(() => {
    const calculatedNetAmount = grossAmount * (1 - taxRate / 100);
    setNetAmount(Math.round(calculatedNetAmount * 100) / 100); // Round to 2 decimal places
  }, [grossAmount, taxRate]);

  // Update form state when initialIncome changes (for editing)
  useEffect(() => {
    if (initialIncome) {
      setName(initialIncome.name);
      // If we have grossAmount, use it, otherwise fall back to amount (for backward compatibility)
      setGrossAmount(initialIncome.grossAmount || initialIncome.amount);
      setTaxRate(initialIncome.taxRate || 30);
      setNetAmount(initialIncome.netAmount || initialIncome.amount);
      setFrequency(initialIncome.frequency);
      setCategory(initialIncome.category);
      setError("");
    }
  }, [initialIncome]);

  // Update gross amount when net amount changes
  const handleNetAmountChange = (value: number) => {
    setNetAmount(value);
    // Calculate gross amount based on net amount and tax rate
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

    const incomeData: Omit<Income, "id"> = {
      name,
      amount: netAmount, // Keep amount as netAmount for backward compatibility
      grossAmount,
      netAmount,
      taxRate,
      frequency,
      category,
    };

    if (initialIncome) {
      updateIncome({ ...incomeData, id: initialIncome.id });
    } else {
      addIncome(incomeData);
    }

    // Reset form
    if (!initialIncome) {
      setName("");
      setGrossAmount(0);
      setTaxRate(30);
      setNetAmount(0);
      setFrequency("monthly");
      setCategory("Salary");
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
                setFrequency(e.target.value as "monthly" | "annual")
              }
            >
              <option value="monthly">Monthly</option>
              <option value="annual">Annual</option>
            </select>
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
