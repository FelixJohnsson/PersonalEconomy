import React from "react";
import AssetForm from "../components/AssetForm";
import AssetSummary from "../components/AssetSummary";
import { formatCurrency } from "../utils/formatters";
import AssetValueChart from "../components/charts/AssetValueChart";
import UpdateAssetValueForm from "../components/forms/UpdateAssetValueForm";
import DepositForm from "../components/forms/DepositForm";
import InfoCard from "../components/ui/InfoCard";
import UpdateLinkedGoalForm from "../components/forms/UpdateLinkedGoalForm";
import { useAssets } from "../hooks/useAssets";
import { SavingsGoal } from "../types";

const AssetsPage: React.FC = () => {
  const {
    sortedAssets,
    selectedAsset,
    assetForValueUpdate,
    assetForDeposit,
    assetForGoalUpdate,
    isLoading,
    error,
    setSelectedId,
    setAssetToUpdate,
    setAssetToDeposit,
    setAssetToUpdateGoal,
    selectedId,
    assetToUpdate,
    assetToDeposit,
    assetToUpdateGoal,
    deleteAsset,
    updateAsset,
    updateAssetValue,
    addAssetDeposit,
    getTypeColor,
    getValueChange,
    addAsset,
  } = useAssets();

  // We could create a similar hook for savings goals
  // For now we'll assume this exists
  const savingsGoals: any = [];

  // Handle updating an asset's goal
  const handleUpdateGoal = (assetId: string, goalId: string | null) => {
    const asset = sortedAssets.find((a) => a._id === assetId);
    if (asset) {
      const updatedAsset = { ...asset, savingsGoalId: goalId };
      updateAsset(updatedAsset);
      setAssetToUpdateGoal(null);
    }
  };

  // Get the name of a savings goal by ID
  const getSavingsGoalName = (goalId: string | null | undefined): string => {
    if (!goalId) return "None";
    const goal = savingsGoals.find((g: SavingsGoal) => g.id === goalId);
    return goal ? goal.name : "Unknown";
  };

  // Show loading indicator while data is being fetched
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading asset data...</p>
        </div>
      </div>
    );
  }

  // Show error message if data fetching failed
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <p className="text-red-600 font-bold mb-2">
            Error loading asset data
          </p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Assets</h1>

      <div className="mb-8">{<AssetSummary />}</div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white shadow-md rounded p-6">
            <h2 className="text-xl font-semibold mb-4">Your Assets</h2>

            {sortedAssets.length === 0 ? (
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
                        <tr key={asset._id}>
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
                              onClick={() => setAssetToDeposit(asset._id)}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                            >
                              Deposit
                            </button>
                            <button
                              onClick={() => setAssetToUpdate(asset._id)}
                              className="text-green-600 hover:text-green-900 mr-4"
                            >
                              Update Value
                            </button>
                            <button
                              onClick={() => setSelectedId(asset._id)}
                              className="text-purple-600 hover:text-purple-900 mr-4"
                            >
                              View History
                            </button>
                            <button
                              onClick={() => setAssetToUpdateGoal(asset._id)}
                              className="text-indigo-600 hover:text-indigo-900 mr-4"
                            >
                              Change Goal
                            </button>
                            <button
                              onClick={() => deleteAsset(asset._id)}
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
          {selectedAsset && (
            <div className="mt-6">
              <InfoCard
                title={`${selectedAsset.name} - Value History`}
                className="mb-6"
              >
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    Last updated:{" "}
                    {selectedAsset.historicalValues &&
                      selectedAsset.historicalValues.length > 0 &&
                      new Date(
                        selectedAsset.historicalValues[
                          selectedAsset.historicalValues.length - 1
                        ].date
                      ).toLocaleDateString()}
                  </p>
                  {getValueChange(selectedAsset) !== null && (
                    <p className="text-sm text-gray-600">
                      Value change since last update:{" "}
                      <span
                        className={
                          getValueChange(selectedAsset)! >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {getValueChange(selectedAsset)! >= 0 ? "+" : ""}
                        {getValueChange(selectedAsset)!.toFixed(2)}%
                      </span>
                    </p>
                  )}
                  <p className="text-sm text-gray-600">
                    Total deposits:{" "}
                    {formatCurrency(selectedAsset.totalDeposits || 0)}
                  </p>
                </div>
                <AssetValueChart
                  data={selectedAsset.historicalValues || []}
                  height={400}
                />
              </InfoCard>
            </div>
          )}
        </div>

        <div>
          <div className="bg-white shadow-md rounded p-6">
            <h2 className="text-xl font-semibold mb-4">
              {assetToDeposit
                ? "Add Deposit"
                : assetToUpdate
                ? "Update Asset Value"
                : assetToUpdateGoal
                ? "Update Linked Goal"
                : selectedId
                ? "Edit Asset"
                : "Add New Asset"}
            </h2>
            {assetToDeposit && assetForDeposit ? (
              <DepositForm
                currentValue={assetForDeposit.value}
                onSubmit={(depositAmount) =>
                  addAssetDeposit(assetForDeposit._id, depositAmount)
                }
                onCancel={() => setAssetToDeposit(null)}
              />
            ) : assetToUpdate && assetForValueUpdate ? (
              <UpdateAssetValueForm
                currentValue={assetForValueUpdate.value}
                onSubmit={(newValue) =>
                  updateAssetValue(assetForValueUpdate._id, newValue)
                }
                onCancel={() => setAssetToUpdate(null)}
              />
            ) : assetToUpdateGoal && assetForGoalUpdate ? (
              <UpdateLinkedGoalForm
                asset={assetForGoalUpdate}
                savingsGoals={savingsGoals}
                onSubmit={(goalId) =>
                  handleUpdateGoal(assetForGoalUpdate._id, goalId)
                }
                onCancel={() => setAssetToUpdateGoal(null)}
              />
            ) : (
              <AssetForm
                initialAsset={selectedAsset}
                onSubmit={() => setSelectedId(null)}
                addAsset={addAsset}
                updateAsset={updateAsset}
                deselectAsset={() => setSelectedId(null)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetsPage;
