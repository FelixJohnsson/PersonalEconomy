import React, { useState } from "react";
import { Asset, SavingsGoal } from "../../types";
import { formatCurrency } from "../../utils/formatters";

interface UpdateLinkedGoalFormProps {
  asset: Asset;
  savingsGoals: SavingsGoal[];
  onSubmit: (goalId: string | null) => void;
  onCancel: () => void;
}

const UpdateLinkedGoalForm: React.FC<UpdateLinkedGoalFormProps> = ({
  asset,
  savingsGoals,
  onSubmit,
  onCancel,
}) => {
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(
    asset.savingsGoalId || null
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(selectedGoalId);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label
          htmlFor="linkedGoal"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Linked Savings Goal
        </label>
        <select
          id="linkedGoal"
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          value={selectedGoalId || ""}
          onChange={(e) =>
            setSelectedGoalId(e.target.value === "" ? null : e.target.value)
          }
        >
          <option value="">None</option>
          {savingsGoals.map((goal) => (
            <option key={goal.id} value={goal.id}>
              {goal.name} (Target: {formatCurrency(goal.targetAmount)})
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 flex items-center justify-end space-x-4">
        <button
          type="button"
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
        >
          Update Goal
        </button>
      </div>
    </form>
  );
};

export default UpdateLinkedGoalForm;
