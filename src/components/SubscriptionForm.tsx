import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { Subscription, NecessityLevel } from "../types";

interface SubscriptionFormProps {
  initialSubscription?: Subscription;
  onSubmit?: () => void;
}

const SubscriptionForm: React.FC<SubscriptionFormProps> = ({
  initialSubscription,
  onSubmit,
}) => {
  const { addSubscription, updateSubscription } = useAppContext();

  const [name, setName] = useState(initialSubscription?.name || "");
  const [amount, setAmount] = useState(initialSubscription?.amount || 0);
  const [frequency, setFrequency] = useState<"monthly" | "annual">(
    initialSubscription?.frequency || "monthly"
  );
  const [billingDate, setBillingDate] = useState(
    initialSubscription?.billingDate || new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState(initialSubscription?.notes || "");
  const [isActive, setIsActive] = useState(
    initialSubscription?.isActive !== undefined
      ? initialSubscription.isActive
      : true
  );
  const [necessityLevel, setNecessityLevel] = useState<
    NecessityLevel | undefined
  >(initialSubscription?.necessityLevel || undefined);
  const [error, setError] = useState("");

  // Update form state when initialSubscription changes (for editing)
  useEffect(() => {
    if (initialSubscription) {
      setName(initialSubscription.name);
      setAmount(initialSubscription.amount);
      setFrequency(initialSubscription.frequency);
      setBillingDate(initialSubscription.billingDate);
      setNotes(initialSubscription.notes || "");
      setIsActive(initialSubscription.isActive);
      setNecessityLevel(initialSubscription.necessityLevel);
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

    const subscriptionData: Omit<Subscription, "id"> = {
      name,
      amount,
      frequency,
      category: "Subscription", // Use a default category
      billingDate,
      notes,
      isActive,
      necessityLevel,
    };

    if (initialSubscription) {
      updateSubscription({ ...subscriptionData, id: initialSubscription.id });
    } else {
      addSubscription(subscriptionData);
    }

    // Reset form
    if (!initialSubscription) {
      setName("");
      setAmount(0);
      setFrequency("monthly");
      setBillingDate(new Date().toISOString().split("T")[0]);
      setNotes("");
      setIsActive(true);
      setNecessityLevel(undefined);
    }

    setError("");
    if (onSubmit) onSubmit();
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
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded p-6">
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="mb-4">
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
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="0.00"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
        />
      </div>

      <div className="mb-4">
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
          onChange={(e) => setFrequency(e.target.value as "monthly" | "annual")}
        >
          <option value="monthly">Monthly</option>
          <option value="annual">Annual</option>
        </select>
      </div>

      <div className="mb-4">
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

      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="necessityLevel"
        >
          Necessity Level
        </label>
        <select
          id="necessityLevel"
          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
            necessityLevel ? getNecessityLevelColor(necessityLevel) : ""
          }`}
          value={necessityLevel || ""}
          onChange={(e) =>
            setNecessityLevel(
              e.target.value ? (e.target.value as NecessityLevel) : undefined
            )
          }
        >
          <option value="">-- Select Necessity Level --</option>
          <option value="A+">A+ (Essential)</option>
          <option value="A">A (Very Important)</option>
          <option value="B">B (Important)</option>
          <option value="C">C (Useful)</option>
          <option value="D">D (Nice to Have)</option>
          <option value="E">E (Luxury)</option>
          <option value="F">F (Unnecessary)</option>
        </select>
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
          placeholder="Additional notes about this subscription"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      <div className="mb-4">
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
      </div>
    </form>
  );
};

export default SubscriptionForm;
