import React, { useState, useEffect } from "react";
import {
  Subscription,
  NecessityLevel,
  EXPENSE_CATEGORIES,
  Frequency,
} from "../types";

interface SubscriptionFormProps {
  initialSubscription?: Subscription;
  onSubmit?: () => void;
  addSubscription: (subscription: Subscription) => void;
  updateSubscription: (subscription: Subscription) => void;
  deselectSubscription: () => void;
}

const SubscriptionForm: React.FC<SubscriptionFormProps> = ({
  initialSubscription,
  onSubmit,
  addSubscription,
  updateSubscription,
  deselectSubscription,
}) => {
  const [name, setName] = useState(initialSubscription?.name || "");
  const [amount, setAmount] = useState(initialSubscription?.amount || 0);
  const [frequency, setFrequency] = useState<Frequency>(
    initialSubscription?.frequency || Frequency.MONTHLY
  );
  const [billingDate, setBillingDate] = useState(
    initialSubscription?.billingDate || new Date().toISOString().split("T")[0]
  );
  const [isActive, setIsActive] = useState(
    initialSubscription?.active !== undefined
      ? initialSubscription.active
      : true
  );
  const [necessityLevel, setNecessityLevel] = useState<NecessityLevel>(
    initialSubscription?.necessityLevel || "C"
  );
  const [category, setCategory] = useState(initialSubscription?.category || "");
  const [error, setError] = useState("");

  // Update form state when initialSubscription changes (for editing)
  useEffect(() => {
    if (initialSubscription) {
      setName(initialSubscription.name);
      setAmount(initialSubscription.amount);
      setFrequency(initialSubscription.frequency);
      setBillingDate(initialSubscription.billingDate);
      setIsActive(initialSubscription.active);
      setNecessityLevel(initialSubscription.necessityLevel);
      setCategory(initialSubscription.category || "");
      setError("");
    }
  }, [initialSubscription]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Please enter a subscription name");
      return;
    }

    if (amount <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    if (!category) {
      setError("Please select a category");
      return;
    }

    const updatedSubscription: Subscription = {
      _id: initialSubscription?._id || "",
      updatedAt: initialSubscription?.updatedAt || "",
      createdAt: initialSubscription?.createdAt || "",
      name,
      amount,
      frequency,
      category,
      billingDate,
      active: isActive,
      necessityLevel,
    };

    if (initialSubscription) {
      updateSubscription({ ...updatedSubscription });
    } else {
      addSubscription(updatedSubscription);
    }

    // Reset form
    if (!initialSubscription) {
      setName("");
      setAmount(0);
      setFrequency(Frequency.MONTHLY);
      setBillingDate(new Date().toISOString().split("T")[0]);
      setIsActive(true);
      setNecessityLevel("C");
      setCategory("");
    }

    setError("");
    if (onSubmit) onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="name"
        >
          Subscription Name
        </label>
        <input
          id="name"
          type="text"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="E.g., Netflix, Spotify, Microsoft Office"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div>
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="amount"
        >
          Amount
        </label>
        <input
          id="amount"
          type="number"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="0.00"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
        />
      </div>

      <div>
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="frequency"
        >
          Billing Frequency
        </label>
        <select
          id="frequency"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as Frequency)}
        >
          <option value={Frequency.MONTHLY}>Monthly</option>
          <option value={Frequency.YEARLY}>Yearly</option>
        </select>
      </div>

      <div>
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="category"
        >
          Category
        </label>
        <select
          id="category"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="">-- Select Category --</option>
          {EXPENSE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="billingDate"
        >
          Next Billing Date
        </label>
        <input
          id="billingDate"
          type="date"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={billingDate}
          onChange={(e) => setBillingDate(e.target.value)}
        />
      </div>

      <div>
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="necessityLevel"
        >
          Necessity Level
        </label>
        <select
          id="necessityLevel"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={necessityLevel}
          onChange={(e) => setNecessityLevel(e.target.value as NecessityLevel)}
        >
          <option value="A+">A+ (Essential)</option>
          <option value="A">A (Very Important)</option>
          <option value="B">B (Important)</option>
          <option value="C">C (Useful)</option>
          <option value="D">D (Nice to Have)</option>
          <option value="E">E (Luxury)</option>
          <option value="F">F (Unnecessary)</option>
        </select>
      </div>

      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            className="form-checkbox h-5 w-5 text-blue-600"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          <span className="ml-2 text-gray-700">Active Subscription</span>
        </label>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {initialSubscription ? "Update Subscription" : "Add Subscription"}
        </button>
        {initialSubscription ? (
          <button
            type="button"
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={() => {
              setName("");
              setAmount(0);
              setFrequency(Frequency.MONTHLY);
              setBillingDate(new Date().toISOString().split("T")[0]);
              setIsActive(true);
              setNecessityLevel("C");
              setCategory("");
              deselectSubscription();
            }}
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
};

export default SubscriptionForm;
