import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import AssetForm from "../components/AssetForm";
import AssetSummary from "../components/AssetSummary";
import { formatCurrency } from "../utils/formatters";
import AssetValueChart from "../components/charts/AssetValueChart";
import UpdateAssetValueForm from "../components/forms/UpdateAssetValueForm";
import DepositForm from "../components/forms/DepositForm";
import InfoCard from "../components/ui/InfoCard";
import { Asset } from "../types";
import UpdateLinkedGoalForm from "../components/forms/UpdateLinkedGoalForm";

const AssetsPage: React.FC = () => {
  const {
    assets,
    deleteAsset,
    savingsGoals,
    updateAssetValue,
    addAssetDeposit,
    updateAsset,
  } = useAppContext();
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [assetToUpdate, setAssetToUpdate] = useState<string | null>(null);
  const [assetToDeposit, setAssetToDeposit] = useState<string | null>(null);
  const [assetToUpdateGoal, setAssetToUpdateGoal] = useState<string | null>(
    null
  );

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this asset?")) {
      deleteAsset(id);
      if (selectedAsset === id) {
        setSelectedAsset(null);
      }
      if (assetToUpdate === id) {
        setAssetToUpdate(null);
      }
      if (assetToDeposit === id) {
        setAssetToDeposit(null);
      }
      if (assetToUpdateGoal === id) {
        setAssetToUpdateGoal(null);
      }
    }
  };

  const handleUpdateValue = (assetId: string, newValue: number) => {
    updateAssetValue(assetId, newValue);
    setAssetToUpdate(null);
  };

  const handleDeposit = (assetId: string, depositAmount: number) => {
    addAssetDeposit(assetId, depositAmount);
    setAssetToDeposit(null);
  };

  const handleUpdateGoal = (assetId: string, goalId: string | null) => {
    const asset = assets.find((a) => a.id === assetId);
    if (asset) {
      const updatedAsset = { ...asset, savingsGoalId: goalId };
      updateAsset(updatedAsset);
      setAssetToUpdateGoal(null);
    }
  };

  // Sort assets by type and then value
  const sortedAssets = [...assets].sort((a, b) => {
    if (a.type !== b.type) {
      return a.type.localeCompare(b.type);
    }
    return b.value - a.value;
  });

  // Get the name of a savings goal by ID
  const getSavingsGoalName = (goalId: string | null | undefined): string => {
    if (!goalId) return "None";
    const goal = savingsGoals.find((g) => g.id === goalId);
    return goal ? goal.name : "Unknown";
  };

  // Calculate value change percentage (excluding deposits)
  const getValueChange = (asset: Asset) => {
    if (!asset.historicalValues || asset.historicalValues.length < 2)
      return null;
    const lastValue =
      asset.historicalValues[asset.historicalValues.length - 1].value;
    const previousValue =
      asset.historicalValues[asset.historicalValues.length - 2].value;
    const lastEntry = asset.historicalValues[asset.historicalValues.length - 1];

    // If the last change was a deposit, don't show it as a value change
    if (lastEntry.isDeposit) {
      return null;
    }

    return ((lastValue - previousValue) / previousValue) * 100;
  };

  // Get the selected asset
  const selectedAssetData = selectedAsset
    ? assets.find((a) => a.id === selectedAsset)
    : null;

  // Get the asset being updated
  const updatingAsset = assetToUpdate
    ? assets.find((a) => a.id === assetToUpdate)
    : null;

  // Get the asset being deposited to
  const depositingAsset = assetToDeposit
    ? assets.find((a) => a.id === assetToDeposit)
    : null;

  // Get the asset being updated for goal linking
  const updatingGoalAsset = assetToUpdateGoal
    ? assets.find((a) => a.id === assetToUpdateGoal)
    : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Assets</h1>

      <div className="mb-8">
        <AssetSummary />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white shadow-md rounded p-6">
            <h2 className="text-xl font-semibold mb-4">Your Assets</h2>

            {assets.length === 0 ? (
              <p className="text-gray-500">No assets recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Value Change
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Deposits
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Linked Goal
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedAssets.map((asset) => {
                      const valueChange = getValueChange(asset);
                      return (
                        <tr key={asset.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {asset.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {asset.type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {formatCurrency(asset.value)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {valueChange !== null && (
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  valueChange >= 0
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {valueChange >= 0 ? "+" : ""}
                                {valueChange.toFixed(2)}%
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {formatCurrency(asset.totalDeposits || 0)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {getSavingsGoalName(asset.savingsGoalId)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => setAssetToDeposit(asset.id)}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                            >
                              Deposit
                            </button>
                            <button
                              onClick={() => setAssetToUpdate(asset.id)}
                              className="text-green-600 hover:text-green-900 mr-4"
                            >
                              Update Value
                            </button>
                            <button
                              onClick={() => setSelectedAsset(asset.id)}
                              className="text-purple-600 hover:text-purple-900 mr-4"
                            >
                              View History
                            </button>
                            <button
                              onClick={() => setAssetToUpdateGoal(asset.id)}
                              className="text-indigo-600 hover:text-indigo-900 mr-4"
                            >
                              Change Goal
                            </button>
                            <button
                              onClick={() => handleDelete(asset.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Asset Value History Chart */}
          {selectedAssetData && (
            <div className="mt-6">
              <InfoCard
                title={`${selectedAssetData.name} - Value History`}
                className="mb-6"
              >
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    Last updated:{" "}
                    {selectedAssetData.historicalValues &&
                      selectedAssetData.historicalValues.length > 0 &&
                      new Date(
                        selectedAssetData.historicalValues[
                          selectedAssetData.historicalValues.length - 1
                        ].date
                      ).toLocaleDateString()}
                  </p>
                  {getValueChange(selectedAssetData) !== null && (
                    <p className="text-sm text-gray-600">
                      Value change since last update:{" "}
                      <span
                        className={
                          getValueChange(selectedAssetData)! >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {getValueChange(selectedAssetData)! >= 0 ? "+" : ""}
                        {getValueChange(selectedAssetData)!.toFixed(2)}%
                      </span>
                    </p>
                  )}
                  <p className="text-sm text-gray-600">
                    Total deposits:{" "}
                    {formatCurrency(selectedAssetData.totalDeposits || 0)}
                  </p>
                </div>
                <AssetValueChart
                  data={selectedAssetData.historicalValues || []}
                  height={400}
                />
              </InfoCard>
            </div>
          )}
        </div>

        <div>
          <div className="bg-white shadow-md rounded p-6">
            <h2 className="text-xl font-semibold mb-4">
              {depositingAsset
                ? "Add Deposit"
                : updatingAsset
                ? "Update Asset Value"
                : updatingGoalAsset
                ? "Update Linked Goal"
                : selectedAsset
                ? "Edit Asset"
                : "Add New Asset"}
            </h2>
            {depositingAsset ? (
              <DepositForm
                currentValue={depositingAsset.value}
                onSubmit={(depositAmount) =>
                  handleDeposit(depositingAsset.id, depositAmount)
                }
                onCancel={() => setAssetToDeposit(null)}
              />
            ) : updatingAsset ? (
              <UpdateAssetValueForm
                currentValue={updatingAsset.value}
                onSubmit={(newValue) =>
                  handleUpdateValue(updatingAsset.id, newValue)
                }
                onCancel={() => setAssetToUpdate(null)}
              />
            ) : updatingGoalAsset ? (
              <UpdateLinkedGoalForm
                asset={updatingGoalAsset}
                savingsGoals={savingsGoals}
                onSubmit={(goalId) =>
                  handleUpdateGoal(updatingGoalAsset.id, goalId)
                }
                onCancel={() => setAssetToUpdateGoal(null)}
              />
            ) : (
              <AssetForm
                initialAsset={
                  selectedAsset
                    ? assets.find((a) => a.id === selectedAsset)
                    : undefined
                }
                onSubmit={() => setSelectedAsset(null)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetsPage;
