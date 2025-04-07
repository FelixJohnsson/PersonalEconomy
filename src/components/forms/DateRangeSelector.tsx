import React from "react";
import { Period } from "../../types";

interface DateRangeSelectorProps {
  period: Period;
  onChange: (dateType: "startDate" | "endDate", value: string) => void;
  startLabel?: string;
  endLabel?: string;
  className?: string;
}

/**
 * Reusable date range selector component
 */
const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  period,
  onChange,
  startLabel = "From",
  endLabel = "To",
  className = "",
}) => {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div>
        <label className="block text-sm font-medium text-gray-500 mb-1">
          {startLabel}
        </label>
        <input
          type="date"
          className="shadow border rounded py-1 px-2 text-gray-700 text-sm"
          value={period.startDate}
          onChange={(e) => onChange("startDate", e.target.value)}
        />
      </div>
      <div className="self-end pb-1">to</div>
      <div>
        <label className="block text-sm font-medium text-gray-500 mb-1">
          {endLabel}
        </label>
        <input
          type="date"
          className="shadow border rounded py-1 px-2 text-gray-700 text-sm"
          value={period.endDate}
          onChange={(e) => onChange("endDate", e.target.value)}
        />
      </div>
    </div>
  );
};

export default DateRangeSelector;
