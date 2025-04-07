import React, { useState } from "react";
import FormInput from "./FormInput";

interface DepositFormProps {
  currentValue: number;
  onSubmit: (depositAmount: number) => void;
  onCancel: () => void;
}

const DepositForm: React.FC<DepositFormProps> = ({
  currentValue,
  onSubmit,
  onCancel,
}) => {
  const [depositAmount, setDepositAmount] = useState<number>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (depositAmount > 0) {
      onSubmit(depositAmount);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Current Value: {currentValue.toLocaleString()} kr
        </p>
      </div>
      <FormInput
        label="Deposit Amount"
        name="depositAmount"
        type="number"
        value={depositAmount}
        onChange={(e) => setDepositAmount(Number(e.target.value))}
        required
        min={0}
        step={0.01}
      />
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
        >
          Add Deposit
        </button>
      </div>
    </form>
  );
};

export default DepositForm;
