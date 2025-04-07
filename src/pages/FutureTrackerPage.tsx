import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { SavingsGoal } from "../types";
import { formatCurrency } from "../utils/formatters";
import {
  calculateProjection,
  calculateRequiredSavings,
  calculateMonthsBetweenDates,
} from "../utils/financialCalculations";
import ProgressBar from "../components/ui/ProgressBar";
import AmountSlider from "../components/inputs/AmountSlider";
import ProjectionChart from "../components/charts/ProjectionChart";
import InfoCard from "../components/ui/InfoCard";
import FormInput from "../components/forms/FormInput";

const SavingsGoalForm: React.FC<{
  initialGoal?: SavingsGoal;
  onSubmit: (goal: Omit<SavingsGoal, "id">) => void;
  onCancel?: () => void;
}> = ({ initialGoal, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: initialGoal?.name || "",
    targetAmount: initialGoal?.targetAmount || 0,
    startDate: initialGoal?.startDate || new Date().toISOString().split("T")[0],
    targetDate:
      initialGoal?.targetDate ||
      new Date(new Date().setFullYear(new Date().getFullYear() + 1))
        .toISOString()
        .split("T")[0],
    monthlySavings: initialGoal?.monthlySavings || 0,
    expectedReturnRate: initialGoal?.expectedReturnRate || 5,
  });

  // Calculate suggested monthly savings whenever target amount or dates change
  useEffect(() => {
    if (!initialGoal) {
      // Only auto-calculate if creating new goal
      const start = new Date(formData.startDate);
      const end = new Date(formData.targetDate);
      const monthsDiff =
        (end.getFullYear() - start.getFullYear()) * 12 +
        (end.getMonth() - start.getMonth());

      if (monthsDiff > 0 && formData.targetAmount > 0) {
        // Simple calculation without interest for initial suggestion
        const suggestedMonthlySavings = formData.targetAmount / monthsDiff;
        setFormData((prev) => ({
          ...prev,
          monthlySavings: Math.ceil(suggestedMonthlySavings),
        }));
      }
    }
  }, [
    formData.targetAmount,
    formData.startDate,
    formData.targetDate,
    initialGoal,
  ]);

  // Update form state when initialGoal changes (for editing)
  useEffect(() => {
    if (initialGoal) {
      setFormData({
        name: initialGoal.name,
        targetAmount: initialGoal.targetAmount,
        startDate: initialGoal.startDate,
        targetDate: initialGoal.targetDate,
        monthlySavings: initialGoal.monthlySavings,
        expectedReturnRate: initialGoal.expectedReturnRate,
      });
    }
  }, [initialGoal]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);

    // Only reset the form if we're not editing
    if (!initialGoal) {
      setFormData({
        name: "",
        targetAmount: 0,
        startDate: new Date().toISOString().split("T")[0],
        targetDate: new Date(
          new Date().setFullYear(new Date().getFullYear() + 1)
        )
          .toISOString()
          .split("T")[0],
        monthlySavings: 0,
        expectedReturnRate: 5,
      });
    }

    if (onCancel) onCancel();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow-md mb-6"
    >
      <h2 className="text-xl font-semibold mb-4">
        {initialGoal ? "Edit Savings Goal" : "Create Savings Goal"}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Goal Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <FormInput
          label="Target Amount"
          name="targetAmount"
          value={formData.targetAmount}
          onChange={handleChange}
          type="number"
          required
          min={0}
        />

        <FormInput
          label="Start Date"
          name="startDate"
          value={formData.startDate}
          onChange={handleChange}
          type="date"
          required
        />

        <FormInput
          label="Target Date"
          name="targetDate"
          value={formData.targetDate}
          onChange={handleChange}
          type="date"
          required
        />

        <FormInput
          label="Monthly Savings"
          name="monthlySavings"
          value={formData.monthlySavings}
          onChange={handleChange}
          type="number"
          required
          min={0}
        />

        <FormInput
          label="Expected Return Rate (%)"
          name="expectedReturnRate"
          value={formData.expectedReturnRate}
          onChange={handleChange}
          type="number"
          required
          min={0}
          step={0.1}
        />
      </div>
      <div className="flex justify-between mt-4">
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {initialGoal ? "Update Goal" : "Create Goal"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

// Component to display savings projection
const SavingsProjection: React.FC<{ goal: SavingsGoal }> = ({ goal }) => {
  const { getSavingsGoalProgress, getAssetsForSavingsGoal } = useAppContext();

  // Local state for the monthly savings amount that can be adjusted
  const [monthlySavings, setMonthlySavings] = useState(goal.monthlySavings);
  const [projectionData, setProjectionData] = useState<any>(null);

  // Current progress
  const currentAmount = getSavingsGoalProgress(goal.id);
  const linkedAssets = getAssetsForSavingsGoal(goal.id);

  // Calculate months between start and target date
  const totalMonths = calculateMonthsBetweenDates(
    goal.startDate,
    goal.targetDate
  );

  // Calculate required monthly savings to reach goal
  const requiredMonthlySavings = calculateRequiredSavings(
    currentAmount,
    goal.targetAmount,
    goal.expectedReturnRate,
    totalMonths
  );

  // Update the projection when monthlySavings changes
  useEffect(() => {
    const projection = calculateProjection(
      currentAmount,
      monthlySavings,
      goal.expectedReturnRate,
      totalMonths,
      goal.targetAmount
    );

    setProjectionData(projection);
  }, [
    monthlySavings,
    goal.expectedReturnRate,
    currentAmount,
    totalMonths,
    goal.targetAmount,
  ]);

  return (
    <InfoCard title={`${goal.name} - Projection`} className="mb-6">
      {/* Progress Section */}
      <div className="mb-6">
        <h4 className="text-lg font-medium mb-2">Current Progress</h4>
        <ProgressBar current={currentAmount} target={goal.targetAmount} />

        {/* Required Monthly Savings Info */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Required monthly savings to reach goal:
          </p>
          <p className="text-xl font-semibold text-blue-700">
            {formatCurrency(requiredMonthlySavings)}
          </p>
          <button
            onClick={() => setMonthlySavings(requiredMonthlySavings)}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            Apply recommended amount
          </button>
        </div>

        {/* Monthly Contribution Slider */}
        <AmountSlider
          value={monthlySavings}
          onChange={setMonthlySavings}
          min={0}
          max={Math.max(requiredMonthlySavings * 1.5, 10000)}
          step={100}
          label="Adjust Monthly Contribution"
          className="mt-6"
          showResetButton={true}
          originalValue={goal.monthlySavings}
          onReset={() => setMonthlySavings(goal.monthlySavings)}
        />

        {linkedAssets.length > 0 && (
          <div className="mt-4">
            <h5 className="text-md font-medium mb-2">Linked Assets:</h5>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asset Name
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {linkedAssets.map((asset) => (
                  <tr key={asset.id}>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {asset.name}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatCurrency(asset.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Projection Chart */}
      {projectionData && (
        <div className="mb-6">
          <h4 className="text-lg font-medium mb-2">Growth Projection</h4>
          <ProjectionChart
            data={projectionData.chartData}
            targetAmount={goal.targetAmount}
            currentSavings={currentAmount}
            height={400}
          />

          {/* Explanation of the chart lines */}
          <div className="text-xs text-gray-500 mt-2 mb-4">
            <p>
              <span className="inline-block w-3 h-3 bg-indigo-400 mr-1"></span>{" "}
              Principal: Your total deposits over time
              <span className="inline-block w-3 h-3 bg-green-400 ml-4 mr-1"></span>{" "}
              Interest: Earnings from your investments
              <span
                className="inline-block w-8 h-0 ml-4 mr-1 border-b-2 border-purple-600"
                style={{ borderBottomStyle: "dashed" }}
              ></span>{" "}
              Current Savings: Your current progress shown across time
            </p>
          </div>

          {/* Goal Achievement Status */}
          <div className="text-sm text-gray-600 mt-1">
            {projectionData.finalTotal >= goal.targetAmount ? (
              <div className="text-green-600">
                You'll reach your goal in approximately{" "}
                {projectionData.monthsToTarget ||
                  Math.ceil(
                    projectionData.chartData.findIndex(
                      (data: any) => data.total >= goal.targetAmount
                    )
                  )}{" "}
                months
                {monthlySavings < requiredMonthlySavings && (
                  <span className="text-blue-600">
                    {" "}
                    (but increasing to the recommended amount would get you
                    there faster)
                  </span>
                )}
                .
              </div>
            ) : (
              <div className="text-yellow-600">
                With this monthly contribution, you won't reach your goal of{" "}
                {formatCurrency(goal.targetAmount)}. Consider increasing to the
                recommended amount of {formatCurrency(requiredMonthlySavings)}{" "}
                per month.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Projection Details */}
      {projectionData && (
        <>
          <div className="mb-4">
            <h4 className="text-lg font-medium mb-2">Projection Summary</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-500">Monthly Contribution</p>
                <p className="text-xl font-semibold">
                  {formatCurrency(monthlySavings)}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-500">Expected Return Rate</p>
                <p className="text-xl font-semibold">
                  {goal.expectedReturnRate}%
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-500">Current Amount</p>
                <p className="text-xl font-semibold">
                  {formatCurrency(currentAmount)}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-500">Target Amount</p>
                <p className="text-xl font-semibold">
                  {formatCurrency(goal.targetAmount)}
                </p>
              </div>
            </div>
          </div>

          {/* Final numbers */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-lg font-medium mb-2">Projected Result</h4>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <p className="text-sm text-gray-600">Principal</p>
                <p className="text-lg font-semibold">
                  {formatCurrency(projectionData.principal)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Interest</p>
                <p className="text-lg font-semibold text-green-600">
                  {formatCurrency(projectionData.finalInterest)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Final Amount</p>
                <p className="text-lg font-semibold text-blue-600">
                  {formatCurrency(projectionData.finalTotal)}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </InfoCard>
  );
};

const FutureTrackerPage: React.FC = () => {
  const {
    savingsGoals,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    getSavingsGoalProgress,
  } = useAppContext();

  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);
  const [projectionGoal, setProjectionGoal] = useState<SavingsGoal | null>(
    null
  );
  const [showProjection, setShowProjection] = useState(false);

  const handleEdit = (goal: SavingsGoal) => {
    setSelectedGoal(goal);
  };

  const handleShowProjection = (goal: SavingsGoal) => {
    setProjectionGoal(goal);
    setShowProjection(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this savings goal?")) {
      deleteSavingsGoal(id);
      if (selectedGoal?.id === id) {
        setSelectedGoal(null);
      }
      if (projectionGoal?.id === id) {
        setProjectionGoal(null);
        setShowProjection(false);
      }
    }
  };

  const handleFormSubmit = (goalData: Omit<SavingsGoal, "id">) => {
    if (selectedGoal) {
      updateSavingsGoal({ ...goalData, id: selectedGoal.id });
      setSelectedGoal(null);
    } else {
      addSavingsGoal(goalData);
    }
  };

  const handleCancel = () => {
    setSelectedGoal(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Future Tracker</h1>

      {/* Savings Goals Form Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          {selectedGoal ? "Edit Savings Goal" : "Create New Savings Goal"}
        </h2>
        <SavingsGoalForm
          initialGoal={selectedGoal || undefined}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
        />
      </section>

      {/* Savings Goals List Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Your Savings Goals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {savingsGoals.map((goal) => (
            <div
              key={goal.id}
              className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500"
            >
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-medium">{goal.name}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(goal)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Target: {formatCurrency(goal.targetAmount)}</span>
                  <span>
                    Progress: {formatCurrency(getSavingsGoalProgress(goal.id))}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{
                      width: `${Math.min(
                        (getSavingsGoalProgress(goal.id) / goal.targetAmount) *
                          100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => handleShowProjection(goal)}
                    className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
                  >
                    View Projection
                  </button>
                  <div className="text-sm">
                    <span>Monthly: {formatCurrency(goal.monthlySavings)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Projection Section */}
      {showProjection && projectionGoal && (
        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">
            Projection for {projectionGoal.name}
          </h2>
          <SavingsProjection goal={projectionGoal} />
        </section>
      )}
    </div>
  );
};

export default FutureTrackerPage;
