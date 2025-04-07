import React, { useState, useRef } from "react";
import { useAppContext } from "../../../context/AppContext";
import { AssetCategory, ASSET_CATEGORIES } from "../../../types";

interface AssetsSetupFormProps {
  onNext: () => void;
  onBack: () => void;
}

interface AssetFormData {
  name: string;
  type: AssetCategory;
  value: string;
  savingsGoalId?: string | null;
  id?: string;
}

const initialAsset: AssetFormData = {
  name: "",
  type: "cash",
  value: "",
  savingsGoalId: null,
};

const AssetsSetupForm: React.FC<AssetsSetupFormProps> = ({
  onNext,
  onBack,
}) => {
  const { addAsset, assets, savingsGoals, deleteAsset } = useAppContext();
  const [assetItems, setAssetItems] = useState<AssetFormData[]>(
    assets.length > 0
      ? assets.map((asset) => ({
          name: asset.name,
          type: asset.type,
          value: asset.value.toString(),
          savingsGoalId: asset.savingsGoalId,
          id: asset.id,
        }))
      : [{ ...initialAsset }]
  );
  const [currentAssetIndex, setCurrentAssetIndex] = useState<number>(0);
  const isSubmitting = useRef(false);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const updatedItems = [...assetItems];

    updatedItems[currentAssetIndex] = {
      ...updatedItems[currentAssetIndex],
      [name]: value,
    };

    setAssetItems(updatedItems);
  };

  // Add a new asset item form
  const addAssetItem = () => {
    setAssetItems([...assetItems, { ...initialAsset }]);
    setCurrentAssetIndex(assetItems.length);
  };

  // Remove an asset item
  const removeAssetItem = (index: number) => {
    const item = assetItems[index];

    // If the item has an ID, it exists in the context, so delete it
    if (item.id) {
      deleteAsset(item.id);
    }

    if (assetItems.length === 1) {
      // If it's the last item, just clear it
      setAssetItems([{ ...initialAsset }]);
      setCurrentAssetIndex(0);
      return;
    }

    const updatedItems = assetItems.filter((_, i) => i !== index);
    setAssetItems(updatedItems);

    // Adjust currentAssetIndex if needed
    if (currentAssetIndex >= updatedItems.length) {
      setCurrentAssetIndex(updatedItems.length - 1);
    } else if (currentAssetIndex === index) {
      setCurrentAssetIndex(Math.max(0, index - 1));
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    // Prevent double submission
    if (isSubmitting.current) return;
    isSubmitting.current = true;

    // Save all valid asset items
    const validAssets = assetItems.filter(
      (item) => item.name.trim() !== "" && parseFloat(item.value) > 0
    );

    // Add new assets (only if they don't have an ID)
    validAssets.forEach((item) => {
      if (!item.id) {
        addAsset({
          name: item.name,
          type: item.type,
          value: parseFloat(item.value),
          savingsGoalId: item.savingsGoalId,
          historicalValues: [
            {
              date: new Date().toISOString().split("T")[0],
              value: parseFloat(item.value),
              isDeposit: true,
              depositAmount: parseFloat(item.value),
            },
          ],
          totalDeposits: parseFloat(item.value),
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

  // Select an asset item to edit
  const selectAssetItem = (index: number) => {
    setCurrentAssetIndex(index);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Set Up Your Assets
      </h2>
      <p className="text-gray-600 mb-6">
        Add your existing assets such as cash, investments, property, etc.
      </p>

      <div className="mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {assetItems.map((item, index) => (
            <button
              key={index}
              type="button"
              onClick={() => selectAssetItem(index)}
              className={`px-3 py-2 rounded-md text-sm ${
                currentAssetIndex === index
                  ? "bg-blue-100 text-blue-700 border border-blue-300"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {item.name || `Asset ${index + 1}`}
            </button>
          ))}
          <button
            type="button"
            onClick={addAssetItem}
            className="px-3 py-2 rounded-md text-sm bg-blue-50 text-blue-700 hover:bg-blue-100"
          >
            + Add Asset
          </button>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Asset Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={assetItems[currentAssetIndex]?.name || ""}
                onChange={handleChange}
                placeholder="e.g., Savings Account, 401(k), Home"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Asset Type
              </label>
              <select
                id="type"
                name="type"
                value={assetItems[currentAssetIndex]?.type || "cash"}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {ASSET_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="value"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Current Value
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">kr</span>
                </div>
                <input
                  type="number"
                  id="value"
                  name="value"
                  value={assetItems[currentAssetIndex]?.value || ""}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {savingsGoals.length > 0 && (
              <div>
                <label
                  htmlFor="savingsGoalId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Link to Savings Goal (Optional)
                </label>
                <select
                  id="savingsGoalId"
                  name="savingsGoalId"
                  value={assetItems[currentAssetIndex]?.savingsGoalId || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">None</option>
                  {savingsGoals.map((goal) => (
                    <option key={goal.id} value={goal.id}>
                      {goal.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-end md:col-span-2">
              <button
                type="button"
                onClick={() => removeAssetItem(currentAssetIndex)}
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

export default AssetsSetupForm;
