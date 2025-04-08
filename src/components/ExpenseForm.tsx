import React, { useState, useEffect } from "react";
import {
  NecessityLevel,
  EXPENSE_CATEGORIES,
  Frequency,
  Expense,
  ExpenseFormData,
} from "../types";

interface ExpenseFormProps {
  initialExpense?: Expense;
  onSubmit: () => void;
  addExpense: (expense: ExpenseFormData) => void;
  updateExpense: (expense: Expense) => void;
  deselectExpense: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({
  initialExpense,
  onSubmit,
  addExpense,
  updateExpense,
  deselectExpense,
}) => {
  const [name, setName] = useState(initialExpense?.name || "");
  const [amount, setAmount] = useState(initialExpense?.amount.toString() || "");
  const [category, setCategory] = useState(initialExpense?.category || "");
  const [customCategory, setCustomCategory] = useState("");
  const [showCustomCategory, setShowCustomCategory] = useState(
    initialExpense?.category
      ? !EXPENSE_CATEGORIES.includes(initialExpense.category as any)
      : false
  );
  const [frequency, setFrequency] = useState<Frequency>(
    initialExpense?.frequency || Frequency.MONTHLY
  );
  const [isRecurring, setIsRecurring] = useState(
    initialExpense?.isRecurring || false
  );
  const [date, setDate] = useState(
    initialExpense?.date || new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState("");
  const [necessityLevel, setNecessityLevel] = useState<
    NecessityLevel | undefined
  >(initialExpense?.necessityLevel || undefined);
  const [error, setError] = useState("");

  // Update form state when initialExpense changes (for editing)
  useEffect(() => {
    if (initialExpense) {
      setName(initialExpense.name);
      setAmount(initialExpense.amount.toString());
      setCategory(initialExpense.category);
      setShowCustomCategory(
        !EXPENSE_CATEGORIES.includes(initialExpense.category as any)
      );
      setCustomCategory(
        !EXPENSE_CATEGORIES.includes(initialExpense.category as any)
          ? initialExpense.category
          : ""
      );
      setFrequency(initialExpense.frequency || Frequency.MONTHLY);
      setIsRecurring(initialExpense.isRecurring);
      setDate(initialExpense.date || new Date().toISOString().split("T")[0]);
      setNotes("");
      setNecessityLevel(initialExpense.necessityLevel);
      setError("");
    }
  }, [initialExpense]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Amount must be a positive number");
      return;
    }

    const finalCategory = showCustomCategory ? customCategory : category;
    if (!finalCategory.trim()) {
      setError("Category is required");
      return;
    }

    const expenseData: ExpenseFormData = {
      name,
      amount: numAmount,
      category: finalCategory,
      isRecurring,
      date,
      necessityLevel,
    };

    // Only include frequency if this is a recurring expense
    if (isRecurring) {
      expenseData.frequency = frequency;
    }

    if (initialExpense) {
      updateExpense({
        ...expenseData,
        _id: initialExpense._id,
        updatedAt: initialExpense.updatedAt,
        createdAt: initialExpense.createdAt,
      });
    } else {
      addExpense(expenseData);
    }

    // Reset form
    setName("");
    setAmount("");
    setCategory("");
    setCustomCategory("");
    setShowCustomCategory(false);
    setFrequency(Frequency.MONTHLY);
    setIsRecurring(false);
    setDate(new Date().toISOString().split("T")[0]);
    setNotes("");
    setNecessityLevel(undefined);
    setError("");

    onSubmit();
  };

  const getNecessityLevelColor = (level?: NecessityLevel) => {
    switch (level) {
      case "A+":
        return "bg-green-700 text-white";
      case "A":
        return "bg-green-500 text-white";
      case "B":
        return "bg-green-300";
      case "C":
        return "bg-yellow-300";
      case "D":
        return "bg-orange-300";
      case "E":
        return "bg-red-300";
      case "F":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-200";
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="name"
        >
          Expense Name
        </label>
        <input
          id="name"
          type="text"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Expense name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="amount"
        >
          Amount
        </label>
        <input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>

      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="category"
        >
          Category
        </label>
        <select
          id="category"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={showCustomCategory ? "custom" : category}
          onChange={(e) => {
            if (e.target.value === "custom") {
              setShowCustomCategory(true);
              setCustomCategory("");
            } else {
              setShowCustomCategory(false);
              setCategory(e.target.value);
            }
          }}
          required
        >
          <option value="">-- Select Category --</option>
          {EXPENSE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
          <option value="custom">Custom Category</option>
        </select>
      </div>

      {showCustomCategory && (
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="customCategory"
          >
            Custom Category
          </label>
          <input
            id="customCategory"
            type="text"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter custom category"
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
            required
          />
        </div>
      )}

      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="necessityLevel"
        >
          Necessity Level
        </label>
        <select
          id="necessityLevel"
          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${getNecessityLevelColor(
            necessityLevel
          )}`}
          value={necessityLevel || ""}
          onChange={(e) =>
            setNecessityLevel((e.target.value as NecessityLevel) || undefined)
          }
        >
          <option value="">-- Select Necessity Level --</option>
          <option value="A+" className="bg-green-700 text-white">
            A+ (Essential)
          </option>
          <option value="A" className="bg-green-500 text-white">
            A
          </option>
          <option value="B" className="bg-green-300">
            B
          </option>
          <option value="C" className="bg-yellow-300">
            C
          </option>
          <option value="D" className="bg-orange-300">
            D
          </option>
          <option value="E" className="bg-red-300">
            E
          </option>
          <option value="F" className="bg-red-500 text-white">
            F (Unnecessary)
          </option>
        </select>
      </div>

      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            className="form-checkbox h-5 w-5 text-blue-600"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
          />
          <span className="ml-2 text-gray-700">Recurring Expense</span>
        </label>
      </div>

      {isRecurring && (
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="frequency"
          >
            Frequency
          </label>
          <select
            id="frequency"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as Frequency)}
          >
            <option value={Frequency.MONTHLY}>Monthly</option>
            <option value={Frequency.YEARLY}>Annual</option>
          </select>
        </div>
      )}

      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="date"
        >
          {isRecurring ? "Due Date" : "Date"}
        </label>
        <input
          id="date"
          type="date"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="notes"
        >
          Notes
        </label>
        <textarea
          id="notes"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Additional notes about this expense"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      <div className="flex items-center justify-between">
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {initialExpense ? "Update" : "Add"} Expense
        </button>
        {initialExpense && (
          <button
            type="button"
            onClick={deselectExpense}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default ExpenseForm;
