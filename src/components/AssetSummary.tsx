import React from "react";
import { useAppContext } from "../context/AppContext";
import { formatCurrency } from "../utils/formatters";

const AssetSummary: React.FC = () => {
  const { assets, getFinancialSummary } = useAppContext();

  const { totalAssets } = getFinancialSummary();

  // Group assets by type
  const assetsByType = assets.reduce((acc, asset) => {
    if (!acc[asset.type]) {
      acc[asset.type] = [];
    }
    acc[asset.type].push(asset);
    return acc;
  }, {} as Record<string, typeof assets>);

  // Calculate total by type
  const totalsByType = Object.entries(assetsByType).map(([type, assets]) => ({
    type,
    total: assets.reduce((sum, asset) => sum + asset.value, 0),
  }));

  // Sort by total value (highest first)
  totalsByType.sort((a, b) => b.total - a.total);

  // Get type labels for display
  const getTypeLabel = (type: string) => {
    switch (type) {
      case "cash":
        return "Cash & Savings";
      case "crypto":
        return "Crypto";
      case "stock":
        return "Stocks";
      case "investment":
        return "Investments";
      case "property":
        return "Property";
      case "vehicle":
        return "Vehicles";
      case "collectible":
        return "Collectibles";
      case "other":
        return "Other Assets";
      default:
        return type;
    }
  };

  return (
    <div className="bg-white shadow-md rounded p-6">
      <h2 className="text-xl font-semibold mb-4">Assets Overview</h2>

      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <p className="text-gray-600">Total Assets</p>
          <p className="text-xl font-bold text-green-600">
            {formatCurrency(totalAssets)}
          </p>
        </div>

        {/* Asset Types Bar Chart */}
        <div className="mb-6 space-y-3">
          {totalsByType.map(({ type, total }) => (
            <div key={type}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">
                  {getTypeLabel(type)}
                </span>
                <span className="text-sm text-gray-500">
                  {formatCurrency(total)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${(total / totalAssets) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Asset List */}
      <div>
        <h3 className="text-lg font-medium mb-2">Asset Details</h3>
        {Object.entries(assetsByType).map(([type, assets]) => (
          <div key={type} className="mb-4">
            <h4 className="text-md font-medium mb-1">{getTypeLabel(type)}</h4>
            <ul className="divide-y">
              {assets.map((asset) => (
                <li key={asset.id} className="py-2">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm font-medium">{asset.name}</p>
                      {asset.savingsGoalId && (
                        <p className="text-xs text-blue-600">
                          Linked to savings goal
                        </p>
                      )}
                    </div>
                    <p className="text-sm font-semibold">
                      {formatCurrency(asset.value)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssetSummary;
