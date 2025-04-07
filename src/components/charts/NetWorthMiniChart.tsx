import React from "react";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "../../utils/formatters";

interface NetWorthDataPoint {
  date: string;
  netWorth: number;
}

interface NetWorthMiniChartProps {
  data: NetWorthDataPoint[];
  height?: number;
  className?: string;
}

/**
 * A small chart component for displaying net worth history in a MetricCard
 */
const NetWorthMiniChart: React.FC<NetWorthMiniChartProps> = ({
  data,
  height = 60,
  className = "",
}) => {
  // Sort data by date
  const sortedData = [...data].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Determine if the trend is positive by comparing first and last values
  const isPositive =
    sortedData.length >= 2 &&
    sortedData[sortedData.length - 1].netWorth > sortedData[0].netWorth;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border border-gray-200 rounded shadow text-xs">
          <p className="text-gray-600">
            {new Date(data.date).toLocaleDateString()}
          </p>
          <p className="font-medium">{formatCurrency(data.netWorth)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={sortedData}>
          <defs>
            <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={isPositive ? "#48BB78" : "#F56565"}
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor={isPositive ? "#48BB78" : "#F56565"}
                stopOpacity={0.2}
              />
            </linearGradient>
          </defs>
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="netWorth"
            stroke={isPositive ? "#48BB78" : "#F56565"}
            fill="url(#netWorthGradient)"
            fillOpacity={0.5}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default NetWorthMiniChart;
