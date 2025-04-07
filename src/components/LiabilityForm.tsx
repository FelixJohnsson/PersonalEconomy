import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { Liability } from "../types";
import Card from "./cards/Card";
import Button from "./buttons/Button";

interface LiabilityFormProps {
  initialLiability?: Liability;
  onSubmit?: () => void;
}

const LiabilityForm: React.FC<LiabilityFormProps> = ({
  initialLiability,
  onSubmit,
}) => {
  const { addLiability, updateLiability } = useAppContext();

  const [name, setName] = useState(initialLiability?.name || "");
  const [amount, setAmount] = useState(initialLiability?.amount || 0);
  const [interestRate, setInterestRate] = useState(
    initialLiability?.interestRate || 0
  );
  const [minimumPayment, setMinimumPayment] = useState(
    initialLiability?.minimumPayment || 0
  );
  const [type, setType] = useState<
    "credit_card" | "loan" | "mortgage" | "other"
  >(initialLiability?.type || "other");
  const [error, setError] = useState("");

  // Update form state when initialLiability changes (for editing)
  useEffect(() => {
    if (initialLiability) {
      setName(initialLiability.name);
      setAmount(initialLiability.amount);
      setInterestRate(initialLiability.interestRate);
      setMinimumPayment(initialLiability.minimumPayment);
      setType(initialLiability.type);
      setError("");
    }
  }, [initialLiability]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Please enter a liability name");
      return;
    }

    if (amount <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    const liabilityData: Omit<Liability, "id"> = {
      name,
      amount,
      interestRate,
      minimumPayment,
      type,
    };

    if (initialLiability) {
      updateLiability({ ...liabilityData, id: initialLiability.id });
    } else {
      addLiability(liabilityData);
    }

    // Reset form
    if (!initialLiability) {
      setName("");
      setAmount(0);
      setInterestRate(0);
      setMinimumPayment(0);
      setType("other");
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
              Liability Name
            </label>
            <input
              id="name"
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="E.g., Credit Card, Student Loan, Mortgage"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="type"
            >
              Liability Type
            </label>
            <select
              id="type"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={type}
              onChange={(e) =>
                setType(
                  e.target.value as
                    | "credit_card"
                    | "loan"
                    | "mortgage"
                    | "other"
                )
              }
            >
              <option value="credit_card">Credit Card</option>
              <option value="loan">Loan</option>
              <option value="mortgage">Mortgage</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="mb-4">
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="amount"
            >
              Amount Owed
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">kr</span>
              </div>
              <input
                id="amount"
                type="number"
                className="w-full pl-10 py-2 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
                min="0"
                step="0.01"
                value={amount || ""}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="mb-4">
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="interestRate"
            >
              Interest Rate (%)
            </label>
            <input
              id="interestRate"
              type="number"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
              min="0"
              step="0.01"
              value={interestRate || ""}
              onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="minimumPayment"
            >
              Minimum Monthly Payment
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">kr</span>
              </div>
              <input
                id="minimumPayment"
                type="number"
                className="w-full pl-10 py-2 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
                min="0"
                step="0.01"
                value={minimumPayment || ""}
                onChange={(e) =>
                  setMinimumPayment(parseFloat(e.target.value) || 0)
                }
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-6">
          <Button type="submit" variant="primary" size="md">
            {initialLiability ? "Update Liability" : "Add Liability"}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default LiabilityForm;
