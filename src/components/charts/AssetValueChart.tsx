import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "../../utils/formatters";
import { AssetValue } from "../../types";

interface AssetValueChartProps {
  data: AssetValue[];
  height?: number;
  className?: string;
}

/**
 * A chart component for displaying asset value history
 */
const AssetValueChart: React.FC<AssetValueChartProps> = ({
  data,
  height = 300,
  className = "",
}) => {
  // Sort data by date
  const sortedData = [...data].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border border-gray-200 rounded shadow">
          <p className="text-sm text-gray-600">
            {new Date(label).toLocaleDateString()}
          </p>
          <p className="text-sm font-medium">
            Value: {formatCurrency(data.value)}
          </p>
          {data.isDeposit && (
            <p className="text-sm text-green-600">
              Deposit: +{formatCurrency(data.depositAmount)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`bg-gray-50 p-4 rounded-lg ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={sortedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={(date) => new Date(date).toLocaleDateString()}
          />
          <YAxis
            tickFormatter={(value) => formatCurrency(value)}
            domain={["dataMin", "dataMax"]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#4F46E5"
            fill="#4F46E5"
            fillOpacity={0.2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AssetValueChart;
