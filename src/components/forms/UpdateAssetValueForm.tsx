import React, { useState } from "react";
import { formatCurrency } from "../../utils/formatters";
import FormInput from "./FormInput";

interface UpdateAssetValueFormProps {
  currentValue: number;
  onSubmit: (newValue: number) => void;
  onCancel: () => void;
}

/**
 * A form component for updating asset values
 */
const UpdateAssetValueForm: React.FC<UpdateAssetValueFormProps> = ({
  currentValue,
  onSubmit,
  onCancel,
}) => {
  const [newValue, setNewValue] = useState(currentValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(newValue);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600">Current Value:</p>
        <p className="text-xl font-semibold">{formatCurrency(currentValue)}</p>
      </div>

      <FormInput
        label="New Value"
        name="newValue"
        type="number"
        value={newValue}
        onChange={(e) => setNewValue(Number(e.target.value))}
        required
        min={0}
        step={0.01}
      />

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Update Value
        </button>
      </div>
    </form>
  );
};

export default UpdateAssetValueForm;
