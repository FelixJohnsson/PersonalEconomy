import React, { useState, useRef } from "react";
import { useAppContext } from "../../../context/AppContext";

interface SubscriptionSetupFormProps {
  onNext: () => void;
  onBack: () => void;
}

interface SubscriptionFormData {
  name: string;
  amount: string;
  category: string;
  billingCycle: "monthly" | "annual" | "quarterly";
  renewalDate: string;
  autoRenews: boolean;
  id?: string;
}

// Common subscription categories
const subscriptionCategories = [
  "Entertainment",
  "Software",
  "Gaming",
  "Music",
  "Video Streaming",
  "News & Magazines",
  "Health & Fitness",
  "Food Delivery",
  "Cloud Storage",
  "Other",
];

const initialSubscription: SubscriptionFormData = {
  name: "",
  amount: "",
  category: "Entertainment",
  billingCycle: "monthly",
  renewalDate: new Date().toISOString().split("T")[0],
  autoRenews: true,
};

const SubscriptionSetupForm: React.FC<SubscriptionSetupFormProps> = ({
  onNext,
  onBack,
}) => {
  const { addSubscription, subscriptions, deleteSubscription } =
    useAppContext();
  const [subscriptionItems, setSubscriptionItems] = useState<
    SubscriptionFormData[]
  >(
    subscriptions.length > 0
      ? subscriptions.map((sub) => ({
          name: sub.name,
          amount: sub.amount.toString(),
          category: sub.category,
          billingCycle: sub.billingCycle || "monthly",
          renewalDate:
            sub.renewalDate || new Date().toISOString().split("T")[0],
          autoRenews: sub.autoRenews || true,
          id: sub.id,
        }))
      : [{ ...initialSubscription }]
  );
  const [currentSubscriptionIndex, setCurrentSubscriptionIndex] =
    useState<number>(0);
  const isSubmitting = useRef(false);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const updatedItems = [...subscriptionItems];

    updatedItems[currentSubscriptionIndex] = {
      ...updatedItems[currentSubscriptionIndex],
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    };

    setSubscriptionItems(updatedItems);
  };

  // Add a new subscription item form
  const addSubscriptionItem = () => {
    setSubscriptionItems([...subscriptionItems, { ...initialSubscription }]);
    setCurrentSubscriptionIndex(subscriptionItems.length);
  };

  // Remove a subscription item
  const removeSubscriptionItem = (index: number) => {
    const item = subscriptionItems[index];

    // If the item has an ID, it exists in the context, so delete it
    if (item.id) {
      deleteSubscription(item.id);
    }

    if (subscriptionItems.length === 1) {
      // If it's the last item, just clear it
      setSubscriptionItems([{ ...initialSubscription }]);
      setCurrentSubscriptionIndex(0);
      return;
    }

    const updatedItems = subscriptionItems.filter((_, i) => i !== index);
    setSubscriptionItems(updatedItems);

    // Adjust currentSubscriptionIndex if needed
    if (currentSubscriptionIndex >= updatedItems.length) {
      setCurrentSubscriptionIndex(updatedItems.length - 1);
    } else if (currentSubscriptionIndex === index) {
      setCurrentSubscriptionIndex(Math.max(0, index - 1));
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    // Prevent double submission
    if (isSubmitting.current) return;
    isSubmitting.current = true;

    // Save all valid subscription items
    const validSubscriptions = subscriptionItems.filter(
      (item) => item.name.trim() !== "" && parseFloat(item.amount) > 0
    );

    // Add new subscriptions (only if they don't have an ID)
    validSubscriptions.forEach((item) => {
      if (!item.id) {
        addSubscription({
          name: item.name,
          amount: parseFloat(item.amount),
          category: item.category,
          // Convert quarterly to monthly for backend compatibility
          billingCycle:
            item.billingCycle === "quarterly" ? "monthly" : item.billingCycle,
          renewalDate: item.renewalDate,
          autoRenews: item.autoRenews,
          // Convert quarterly to monthly for backend compatibility
          frequency:
            item.billingCycle === "quarterly" ? "monthly" : item.billingCycle,
          billingDate: item.renewalDate,
          isActive: true,
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

  // Select a subscription item to edit
  const selectSubscriptionItem = (index: number) => {
    setCurrentSubscriptionIndex(index);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Set Up Your Subscriptions
      </h2>
      <p className="text-gray-600 mb-6">
        Track your recurring subscriptions like Netflix, Spotify, gym
        memberships, etc.
      </p>

      <div className="mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {subscriptionItems.map((item, index) => (
            <button
              key={index}
              type="button"
              onClick={() => selectSubscriptionItem(index)}
              className={`px-3 py-2 rounded-md text-sm ${
                currentSubscriptionIndex === index
                  ? "bg-blue-100 text-blue-700 border border-blue-300"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {item.name || `Subscription ${index + 1}`}
            </button>
          ))}
          <button
            type="button"
            onClick={addSubscriptionItem}
            className="px-3 py-2 rounded-md text-sm bg-blue-50 text-blue-700 hover:bg-blue-100"
          >
            + Add Subscription
          </button>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Subscription Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={subscriptionItems[currentSubscriptionIndex]?.name || ""}
                onChange={handleChange}
                placeholder="e.g., Netflix, Spotify, Adobe CC"
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
                  value={
                    subscriptionItems[currentSubscriptionIndex]?.amount || ""
                  }
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
                value={
                  subscriptionItems[currentSubscriptionIndex]?.category ||
                  "Entertainment"
                }
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {subscriptionCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="billingCycle"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Billing Cycle
              </label>
              <select
                id="billingCycle"
                name="billingCycle"
                value={
                  subscriptionItems[currentSubscriptionIndex]?.billingCycle ||
                  "monthly"
                }
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annual">Annual</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="renewalDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Next Renewal Date
              </label>
              <input
                type="date"
                id="renewalDate"
                name="renewalDate"
                value={
                  subscriptionItems[currentSubscriptionIndex]?.renewalDate || ""
                }
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoRenews"
                name="autoRenews"
                checked={
                  subscriptionItems[currentSubscriptionIndex]?.autoRenews ||
                  false
                }
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="autoRenews"
                className="ml-2 block text-sm text-gray-700"
              >
                Auto-renews
              </label>
            </div>

            <div className="flex items-end md:col-span-2">
              <button
                type="button"
                onClick={() => removeSubscriptionItem(currentSubscriptionIndex)}
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

export default SubscriptionSetupForm;
