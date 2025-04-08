import React, { useState, useEffect } from "react";
import { Asset, AssetCategory, AssetFormData } from "../types";
import FormInput from "./forms/FormInput";
import Button from "./buttons/Button";

interface AssetFormProps {
  initialAsset?: Asset;
  onSubmit: () => void;
  addAsset: (asset: AssetFormData) => Promise<any>;
  updateAsset: (asset: Asset) => Promise<any>;
  deselectAsset: () => void;
}

const AssetForm: React.FC<AssetFormProps> = ({
  initialAsset,
  onSubmit,
  addAsset,
  updateAsset,
  deselectAsset,
}) => {
  const [name, setName] = useState(initialAsset?.name || "");
  const [type, setType] = useState(initialAsset?.type || "cash");
  const [value, setValue] = useState(initialAsset?.value || 0);
  const [savingsGoalId, setSavingsGoalId] = useState(
    initialAsset?.savingsGoalId || ""
  );
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialAsset) {
      setName(initialAsset.name);
      setType(initialAsset.type);
      setValue(initialAsset.value);
      setSavingsGoalId(initialAsset.savingsGoalId || "");
    }
  }, [initialAsset]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Form submitted with data:", {
      name,
      type,
      value,
      savingsGoalId,
    });

    if (!name.trim()) {
      setError("Please enter an income name");
      return;
    }

    if (value <= 0) {
      setError("Value must be greater than 0");
      return;
    }

    if (!type.trim()) {
      setError("Please enter a type");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const assetData: AssetFormData = {
        name,
        type,
        value,
        savingsGoalId,
      };

      console.log("Form submitted with data:", assetData);

      if (initialAsset) {
        const assetToUpdate: Asset = {
          ...assetData,
          _id: initialAsset._id,
          updatedAt: initialAsset.updatedAt,
          createdAt: initialAsset.createdAt,
        };

        console.log("Asset to update:", assetToUpdate);

        await updateAsset(assetToUpdate);
      } else {
        await addAsset(assetData);
      }

      // Reset form
      setName("");
      setType("cash");
      setValue(0);
      setSavingsGoalId("");

      if (onSubmit) onSubmit();
    } catch (err) {
      console.error("Error submitting asset:", err);
      setError("Failed to save asset. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      <FormInput
        label="Asset Name"
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Asset Type
        </label>
        <select
          name="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
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
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
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
          value={savingsGoalId}
          onChange={(e) => setSavingsGoalId(e.target.value)}
          className="border border-gray-300 rounded-md p-2 w-full"
        >
          <option value="">None</option>
          {/*savingsGoals.map((goal) => (
            <option key={goal.id} value={goal.id}>
              {goal.name}
            </option>
          ))}*/}
        </select>
      </div>

      <Button
        type="submit"
        isLoading={isSubmitting}
        disabled={isSubmitting}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
      >
        {initialAsset ? "Update Asset" : "Add Asset"}
      </Button>
    </form>
  );
};

export default AssetForm;
