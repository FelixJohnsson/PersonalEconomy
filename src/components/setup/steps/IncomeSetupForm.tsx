import React, { useState, useRef, useEffect } from "react";
import { useAppContext } from "../../../context/AppContext";
import Button from "../../buttons/Button";
import Card from "../../cards/Card";

interface IncomeSetupFormProps {
  onNext: () => void;
  onBack: () => void;
}

interface IncomeFormData {
  name: string;
  amount: string;
  grossAmount: string;
  netAmount: string;
  taxRate: number;
  frequency: "monthly" | "annual";
  category: string;
  id?: string;
}

const initialIncome: IncomeFormData = {
  name: "",
  amount: "",
  grossAmount: "",
  netAmount: "",
  taxRate: 30, // Default tax rate of 30%
  frequency: "monthly",
  category: "Salary",
};

// Common income categories
const incomeCategories = [
  "Salary",
  "Freelance",
  "Business",
  "Investment",
  "Rental",
  "Other",
];

const IncomeSetupForm: React.FC<IncomeSetupFormProps> = ({
  onNext,
  onBack,
}) => {
  const { addIncome, incomes, deleteIncome } = useAppContext();
  const [incomeItems, setIncomeItems] = useState<IncomeFormData[]>(
    incomes.length > 0
      ? incomes.map((income) => ({
          name: income.name,
          amount: income.amount.toString(),
          grossAmount: (income.grossAmount || income.amount).toString(),
          netAmount: (income.netAmount || income.amount).toString(),
          taxRate: income.taxRate || 30,
          frequency: income.frequency,
          category: income.category,
          id: income.id,
        }))
      : [{ ...initialIncome }]
  );
  const [currentIncomeIndex, setCurrentIncomeIndex] = useState<number>(0);
  const isSubmitting = useRef(false);

  // Calculate net amount when gross amount or tax rate changes
  useEffect(() => {
    const currentItem = incomeItems[currentIncomeIndex];
    if (currentItem) {
      const grossAmount = parseFloat(currentItem.grossAmount) || 0;
      const taxRate = currentItem.taxRate || 30;

      // Only update if we have valid numbers
      if (grossAmount > 0) {
        const netAmount = grossAmount * (1 - taxRate / 100);

        const updatedItems = [...incomeItems];
        updatedItems[currentIncomeIndex] = {
          ...currentItem,
          netAmount: netAmount.toFixed(2),
          amount: netAmount.toFixed(2), // For backward compatibility
        };

        setIncomeItems(updatedItems);
      }
    }
  }, [
    incomeItems[currentIncomeIndex]?.grossAmount,
    incomeItems[currentIncomeIndex]?.taxRate,
  ]);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const updatedItems = [...incomeItems];

    // For tax rate, ensure it's a number
    if (name === "taxRate") {
      updatedItems[currentIncomeIndex] = {
        ...updatedItems[currentIncomeIndex],
        [name]: parseFloat(value) || 0,
      };
    } else {
      updatedItems[currentIncomeIndex] = {
        ...updatedItems[currentIncomeIndex],
        [name]:
          type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
      };
    }

    setIncomeItems(updatedItems);
  };

  // When net amount changes, recalculate gross amount
  const handleNetAmountChange = (value: string) => {
    const netAmount = parseFloat(value) || 0;
    const taxRate = incomeItems[currentIncomeIndex].taxRate || 30;

    if (netAmount > 0) {
      // Calculate gross amount based on net amount and tax rate
      const grossAmount = netAmount / (1 - taxRate / 100);

      const updatedItems = [...incomeItems];
      updatedItems[currentIncomeIndex] = {
        ...updatedItems[currentIncomeIndex],
        netAmount: value,
        amount: value, // For backward compatibility
        grossAmount: grossAmount.toFixed(2),
      };

      setIncomeItems(updatedItems);
    }
  };

  // Add a new income item form
  const addIncomeItem = () => {
    setIncomeItems([...incomeItems, { ...initialIncome }]);
    setCurrentIncomeIndex(incomeItems.length);
  };

  // Remove an income item
  const removeIncomeItem = (index: number) => {
    const item = incomeItems[index];

    // If the item has an ID, it exists in the context, so delete it
    if (item.id) {
      deleteIncome(item.id);
    }

    if (incomeItems.length === 1) {
      // If it's the last item, just clear it
      setIncomeItems([{ ...initialIncome }]);
      setCurrentIncomeIndex(0);
      return;
    }

    const updatedItems = incomeItems.filter((_, i) => i !== index);
    setIncomeItems(updatedItems);

    // Adjust currentIncomeIndex if needed
    if (currentIncomeIndex >= updatedItems.length) {
      setCurrentIncomeIndex(updatedItems.length - 1);
    } else if (currentIncomeIndex === index) {
      setCurrentIncomeIndex(Math.max(0, index - 1));
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    // Prevent double submission
    if (isSubmitting.current) return;
    isSubmitting.current = true;

    // Save all valid income items
    const validIncomes = incomeItems.filter(
      (item) =>
        item.name.trim() !== "" &&
        (parseFloat(item.grossAmount) > 0 || parseFloat(item.netAmount) > 0)
    );

    // Add new incomes (only if they don't have an ID)
    validIncomes.forEach((item) => {
      if (!item.id) {
        addIncome({
          name: item.name,
          // Use netAmount as amount for backward compatibility
          amount: parseFloat(item.netAmount || item.amount),
          grossAmount: parseFloat(item.grossAmount),
          netAmount: parseFloat(item.netAmount || item.amount),
          taxRate: item.taxRate,
          frequency: item.frequency,
          category: item.category || "Salary",
        });
      }
    });

    // Go to next step
    onNext();

    // Reset after navigation
    setTimeout(() => {
      isSubmitting.current = false;
    }, 500);
  };

  // Select an income item to edit
  const selectIncomeItem = (index: number) => {
    setCurrentIncomeIndex(index);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Set Up Your Income
      </h2>
      <p className="text-gray-600 mb-6">
        Add your regular income sources such as salary, freelance work, or other
        recurring earnings.
      </p>

      <div className="mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {incomeItems.map((item, index) => (
            <Button
              key={index}
              onClick={() => selectIncomeItem(index)}
              variant={currentIncomeIndex === index ? "info" : "ghost"}
              size="sm"
              index={index}
            >
              {item.name || `Income ${index + 1}`}
            </Button>
          ))}
          <Button
            onClick={addIncomeItem}
            variant="info"
            size="sm"
            icon={<span>+</span>}
          >
            Add Income
          </Button>
        </div>

        <Card variant="default" size="lg" className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Income Source
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={incomeItems[currentIncomeIndex]?.name || ""}
                onChange={handleChange}
                placeholder="e.g., Salary, Freelance, Rental Income"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="grossAmount"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Gross Amount (Before Tax)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">kr</span>
                </div>
                <input
                  type="number"
                  id="grossAmount"
                  name="grossAmount"
                  value={incomeItems[currentIncomeIndex]?.grossAmount || ""}
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
                htmlFor="taxRate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Tax Rate (%)
              </label>
              <input
                type="number"
                id="taxRate"
                name="taxRate"
                value={incomeItems[currentIncomeIndex]?.taxRate || ""}
                onChange={handleChange}
                placeholder="30"
                min="0"
                max="100"
                step="0.1"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="netAmount"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Net Amount (After Tax)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">kr</span>
                </div>
                <input
                  type="number"
                  id="netAmount"
                  name="netAmount"
                  value={incomeItems[currentIncomeIndex]?.netAmount || ""}
                  onChange={(e) => handleNetAmountChange(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

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
                value={incomeItems[currentIncomeIndex]?.frequency || "monthly"}
                onChange={
                  handleChange as React.ChangeEventHandler<HTMLSelectElement>
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="monthly">Monthly</option>
                <option value="annual">Annual</option>
              </select>
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
                value={incomeItems[currentIncomeIndex]?.category || "Salary"}
                onChange={
                  handleChange as React.ChangeEventHandler<HTMLSelectElement>
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {incomeCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end md:col-span-2">
              <Button
                onClick={() => removeIncomeItem(currentIncomeIndex)}
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

export default IncomeSetupForm;
