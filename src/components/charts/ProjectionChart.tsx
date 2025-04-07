import React from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine,
  Line,
} from "recharts";
import { formatCurrency, formatCompactCurrency } from "../../utils/formatters";

interface ProjectionChartProps {
  data: Array<{
    month: number;
    principal: number;
    interest: number;
    total: number;
  }>;
  targetAmount?: number;
  currentSavings?: number;
  height?: string | number;
  className?: string;
  xAxisFormatter?: (value: number) => string;
  tooltipFormatter?: (value: number) => string;
}

/**
 * A reusable chart component for financial projections
 */
const ProjectionChart: React.FC<ProjectionChartProps> = ({
  data,
  targetAmount,
  currentSavings,
  height = 400,
  className = "",
  xAxisFormatter = (month) => {
    if (month === 0) return "Start";
    if (month % 12 === 0) return `${month / 12}yr`;
    return "";
  },
  tooltipFormatter = formatCurrency,
}) => {
  return (
    <div
      className={`bg-gray-50 p-4 rounded-lg ${className}`}
      style={{ height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            tickFormatter={xAxisFormatter}
            label={{
              value: "Months",
              position: "insideBottom",
              offset: -5,
            }}
          />
          <YAxis
            tickFormatter={(value) => formatCompactCurrency(value)}
            label={{
              value: "Amount",
              angle: -90,
              position: "insideLeft",
            }}
          />
          <Tooltip
            formatter={tooltipFormatter}
            labelFormatter={(month) => `Month ${month}`}
          />
          <Legend />
          {targetAmount && (
            <ReferenceLine
              y={targetAmount}
              label={{
                value: `Target: ${formatCompactCurrency(targetAmount)}`,
                position: "right",
              }}
              stroke="#ff7300"
              strokeDasharray="3 3"
            />
          )}
          {currentSavings && currentSavings > 0 && (
            <ReferenceLine
              y={currentSavings}
              label={{
                value: `Current: ${formatCompactCurrency(currentSavings)}`,
                position: "left",
              }}
              stroke="#9c27b0"
              strokeDasharray="3 3"
            />
          )}
          <Area
            type="monotone"
            dataKey="principal"
            name="Principal"
            stackId="1"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.6}
          />
          <Area
            type="monotone"
            dataKey="interest"
            name="Interest"
            stackId="1"
            stroke="#82ca9d"
            fill="#82ca9d"
            fillOpacity={0.6}
          />
          {currentSavings && currentSavings > 0 && (
            <Line
              type="monotone"
              dataKey={() => currentSavings}
              name="Current Savings"
              stroke="#9c27b0"
              strokeWidth={2}
              dot={false}
              strokeDasharray="5 5"
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProjectionChart;
