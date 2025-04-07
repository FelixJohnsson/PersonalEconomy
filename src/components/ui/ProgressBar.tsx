import React from "react";
import { formatCurrency, formatPercentage } from "../../utils/formatters";

interface ProgressBarProps {
  current: number;
  target: number;
  showValues?: boolean;
  showPercentage?: boolean;
  className?: string;
  height?: string;
  valueFormatter?: (value: number) => string;
}

/**
 * Reusable progress bar component for financial goals and metrics
 */
const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  target,
  showValues = true,
  showPercentage = true,
  className = "",
  height = "h-2.5",
  valueFormatter = formatCurrency,
}) => {
  const percentage = target > 0 ? (current / target) * 100 : 0;

  return (
    <div className={className}>
      {showValues && (
        <div className="flex justify-between mb-1 text-sm">
          <span>
            {valueFormatter(current)}
            {target > 0 && ` of ${valueFormatter(target)}`}
          </span>
          {showPercentage && <span>{formatPercentage(percentage)}</span>}
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${height}`}>
        <div
          className="bg-blue-600 rounded-full h-full"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
