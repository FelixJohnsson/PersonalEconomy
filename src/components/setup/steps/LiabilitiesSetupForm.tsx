import React, { useState, useRef } from "react";
import { useAppContext } from "../../../context/AppContext";

interface LiabilitiesSetupFormProps {
  onNext: () => void;
  onBack: () => void;
}

interface LiabilityFormData {
  name: string;
  amount: string;
  interestRate: string;
  minimumPayment: string;
  type: "credit_card" | "loan" | "mortgage" | "other";
  id?: string;
}

const initialLiability: LiabilityFormData = {
  name: "",
  amount: "",
  interestRate: "",
  minimumPayment: "",
  type: "other",
};

const LiabilitiesSetupForm: React.FC<LiabilitiesSetupFormProps> = ({
  onNext,
  onBack,
}) => {
  const { addLiability, liabilities, deleteLiability } = useAppContext();
  const [liabilityItems, setLiabilityItems] = useState<LiabilityFormData[]>(
    liabilities.length > 0
      ? liabilities.map((liability) => ({
          name: liability.name,
          amount: liability.amount.toString(),
          interestRate: liability.interestRate.toString(),
          minimumPayment: liability.minimumPayment.toString(),
          type: liability.type,
          id: liability.id,
        }))
      : [{ ...initialLiability }]
  );
  const [currentLiabilityIndex, setCurrentLiabilityIndex] = useState<number>(0);
  const isSubmitting = useRef(false);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const updatedItems = [...liabilityItems];

    updatedItems[currentLiabilityIndex] = {
      ...updatedItems[currentLiabilityIndex],
      [name]: value,
    };

    setLiabilityItems(updatedItems);
  };

  // Add a new liability item form
  const addLiabilityItem = () => {
    setLiabilityItems([...liabilityItems, { ...initialLiability }]);
    setCurrentLiabilityIndex(liabilityItems.length);
  };

  // Remove a liability item
  const removeLiabilityItem = (index: number) => {
    const item = liabilityItems[index];

    // If the item has an ID, it exists in the context, so delete it
    if (item.id) {
      deleteLiability(item.id);
    }

    if (liabilityItems.length === 1) {
      // If it's the last item, just clear it
      setLiabilityItems([{ ...initialLiability }]);
      setCurrentLiabilityIndex(0);
      return;
    }

    const updatedItems = liabilityItems.filter((_, i) => i !== index);
    setLiabilityItems(updatedItems);

    // Adjust currentLiabilityIndex if needed
    if (currentLiabilityIndex >= updatedItems.length) {
      setCurrentLiabilityIndex(updatedItems.length - 1);
    } else if (currentLiabilityIndex === index) {
      setCurrentLiabilityIndex(Math.max(0, index - 1));
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    // Prevent double submission
    if (isSubmitting.current) return;
    isSubmitting.current = true;

    // Save all valid liability items
    const validLiabilities = liabilityItems.filter(
      (item) => item.name.trim() !== "" && parseFloat(item.amount) > 0
    );

    // Add new liabilities (only if they don't have an ID)
    validLiabilities.forEach((item) => {
      if (!item.id) {
        addLiability({
          name: item.name,
          amount: parseFloat(item.amount),
          interestRate: parseFloat(item.interestRate) || 0,
          minimumPayment: parseFloat(item.minimumPayment) || 0,
          type: item.type,
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

  // Select a liability item to edit
  const selectLiabilityItem = (index: number) => {
    setCurrentLiabilityIndex(index);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Set Up Your Liabilities
      </h2>
      <p className="text-gray-600 mb-6">
        Add your debts such as credit cards, loans, mortgages, etc.
      </p>

      <div className="mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {liabilityItems.map((item, index) => (
            <button
              key={index}
              type="button"
              onClick={() => selectLiabilityItem(index)}
              className={`px-3 py-2 rounded-md text-sm ${
                currentLiabilityIndex === index
                  ? "bg-blue-100 text-blue-700 border border-blue-300"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {item.name || `Liability ${index + 1}`}
            </button>
          ))}
          <button
            type="button"
            onClick={addLiabilityItem}
            className="px-3 py-2 rounded-md text-sm bg-blue-50 text-blue-700 hover:bg-blue-100"
          >
            + Add Liability
          </button>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Liability Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={liabilityItems[currentLiabilityIndex]?.name || ""}
                onChange={handleChange}
                placeholder="e.g., Credit Card, Student Loan, Mortgage"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Liability Type
              </label>
              <select
                id="type"
                name="type"
                value={liabilityItems[currentLiabilityIndex]?.type || "other"}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="credit_card">Credit Card</option>
                <option value="loan">Loan</option>
                <option value="mortgage">Mortgage</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Total Amount Owed
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">kr</span>
                </div>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={liabilityItems[currentLiabilityIndex]?.amount || ""}
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
                htmlFor="interestRate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Interest Rate (%)
              </label>
              <input
                type="number"
                id="interestRate"
                name="interestRate"
                value={
                  liabilityItems[currentLiabilityIndex]?.interestRate || ""
                }
                onChange={handleChange}
                placeholder="0.0"
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="minimumPayment"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Minimum Monthly Payment
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">kr</span>
                </div>
                <input
                  type="number"
                  id="minimumPayment"
                  name="minimumPayment"
                  value={
                    liabilityItems[currentLiabilityIndex]?.minimumPayment || ""
                  }
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-end md:col-span-2">
              <button
                type="button"
                onClick={() => removeLiabilityItem(currentLiabilityIndex)}
                className="px-4 py-2 text-red-600 bg-white border border-red-300 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>

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
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default LiabilitiesSetupForm;
