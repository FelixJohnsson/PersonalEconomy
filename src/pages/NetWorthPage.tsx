import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "../utils/formatters";
import {
  NetWorthHistoryService,
  NetWorthHistoryPoint,
} from "../services/NetWorthHistory";
import Card from "../components/cards/Card";
import { Link } from "react-router-dom";

const NetWorthPage: React.FC = () => {
  const { assets, liabilities } = useAppContext();
  const [historyData, setHistoryData] = useState<NetWorthHistoryPoint[]>([]);

  useEffect(() => {
    // Calculate net worth history from asset historical values
    const history = NetWorthHistoryService.getOrGenerateHistory(
      assets,
      liabilities
    );
    setHistoryData(history);
  }, [assets, liabilities]);

  // Calculate summary data
  const currentNetWorth = historyData.length
    ? historyData[historyData.length - 1].netWorth
    : 0;
  const oldestNetWorth = historyData.length ? historyData[0].netWorth : 0;
  const netWorthChange = currentNetWorth - oldestNetWorth;
  const percentChange =
    oldestNetWorth !== 0
      ? (netWorthChange / Math.abs(oldestNetWorth)) * 100
      : 0;

  // Calculate asset and liability distribution
  const totalAssets = assets.reduce((total, asset) => total + asset.value, 0);
  const totalLiabilities = liabilities.reduce(
    (total, liability) => total + liability.amount,
    0
  );

  // Format data for the chart
  const chartData = historyData.map((point) => ({
    date: new Date(point.date).toLocaleDateString(),
    netWorth: point.netWorth,
    assets: point.assets,
    liabilities: -point.liabilities, // Negative to show below the axis
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow">
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <p className="text-sm">
            <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-1"></span>
            Net Worth: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-sm">
            <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span>
            Assets: {formatCurrency(payload[1].value)}
          </p>
          <p className="text-sm">
            <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-1"></span>
            Liabilities: {formatCurrency(-payload[2].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Net Worth History</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card variant="default" size="md">
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Current Net Worth
          </h3>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(currentNetWorth)}
          </p>
        </Card>

        <Card variant="default" size="md">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Change</h3>
          <p
            className={`text-2xl font-bold ${
              netWorthChange >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {formatCurrency(netWorthChange)}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {percentChange >= 0 ? "+" : ""}
            {percentChange.toFixed(1)}% since first record
          </p>
        </Card>

        <Card variant="default" size="md">
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Debt-to-Asset Ratio
          </h3>
          <p className="text-2xl font-bold text-gray-900">
            {totalAssets > 0
              ? ((totalLiabilities / totalAssets) * 100).toFixed(1)
              : 0}
            %
          </p>
          <p className="text-sm text-gray-600 mt-1">Lower is better</p>
        </Card>
      </div>

      <Card variant="default" size="lg" className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Net Worth Over Time</h2>

        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 30, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="netWorth"
                name="Net Worth"
                stroke="#4F46E5"
                fill="#4F46E5"
                fillOpacity={0.1}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="assets"
                name="Assets"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.1}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="liabilities"
                name="Liabilities"
                stroke="#EF4444"
                fill="#EF4444"
                fillOpacity={0.1}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="default" size="md">
          <h2 className="text-xl font-semibold mb-4">Assets</h2>

          {assets.length === 0 ? (
            <p className="text-gray-500">No assets recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assets.map((asset) => (
                    <tr key={asset.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {asset.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {asset.type}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold text-green-600">
                        {formatCurrency(asset.value)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50">
                    <td
                      className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900"
                      colSpan={2}
                    >
                      Total Assets
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-green-600">
                      {formatCurrency(totalAssets)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card variant="default" size="md">
          <h2 className="text-xl font-semibold mb-4">Liabilities</h2>

          {liabilities.length === 0 ? (
            <p className="text-gray-500">No liabilities recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {liabilities.map((liability) => (
                    <tr key={liability.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {liability.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {liability.type}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold text-red-600">
                        {formatCurrency(liability.amount)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50">
                    <td
                      className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900"
                      colSpan={2}
                    >
                      Total Liabilities
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-red-600">
                      {formatCurrency(totalLiabilities)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-4">
            <Link
              to="/liabilities"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Manage Liabilities →
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default NetWorthPage;
