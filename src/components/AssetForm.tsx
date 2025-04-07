import React, { useState, useEffect } from "react";
import { Asset, AssetCategory } from "../types";
import FormInput from "./forms/FormInput";
import { useAppContext } from "../context/AppContext";

interface AssetFormProps {
  initialAsset?: Asset;
  onSubmit: () => void;
}

const AssetForm: React.FC<AssetFormProps> = ({ initialAsset, onSubmit }) => {
  const { addAsset, updateAsset, savingsGoals } = useAppContext();
  const [formData, setFormData] = useState({
    name: initialAsset?.name || "",
    type: initialAsset?.type || "cash",
    value: initialAsset?.value || 0,
    savingsGoalId: initialAsset?.savingsGoalId || "",
  });

  useEffect(() => {
    if (initialAsset) {
      setFormData({
        name: initialAsset.name,
        type: initialAsset.type,
        value: initialAsset.value,
        savingsGoalId: initialAsset.savingsGoalId || "",
      });
    }
  }, [initialAsset]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date().toISOString().split("T")[0];

    const assetData: Omit<Asset, "id"> = {
      ...formData,
      historicalValues: initialAsset?.historicalValues || [
        { date: today, value: formData.value },
      ],
      totalDeposits: initialAsset?.totalDeposits || formData.value,
    };

    if (initialAsset) {
      updateAsset({ ...assetData, id: initialAsset.id });
    } else {
      addAsset(assetData);
    }

    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormInput
        label="Asset Name"
        name="name"
        value={formData.name}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, name: e.target.value }))
        }
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Asset Type
        </label>
        <select
          name="type"
          value={formData.type}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              type: e.target.value as AssetCategory,
            }))
          }
          className="border border-gray-300 rounded-md p-2 w-full"
        >
          <option value="cash">Cash</option>
          <option value="investment">Investment</option>
          <option value="crypto">Crypto</option>
          <option value="stock">Stock</option>
          <option value="property">Property</option>
          <option value="vehicle">Vehicle</option>
          <option value="other">Other</option>
        </select>
      </div>

      <FormInput
        label="Value"
        name="value"
        type="number"
        value={formData.value}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, value: Number(e.target.value) }))
        }
        required
        min={0}
        step={0.01}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Linked Savings Goal (Optional)
        </label>
        <select
          name="savingsGoalId"
          value={formData.savingsGoalId}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, savingsGoalId: e.target.value }))
          }
          className="border border-gray-300 rounded-md p-2 w-full"
        >
          <option value="">None</option>
          {savingsGoals.map((goal) => (
            <option key={goal.id} value={goal.id}>
              {goal.name}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
      >
        {initialAsset ? "Update Asset" : "Add Asset"}
      </button>
    </form>
  );
};

export default AssetForm;
