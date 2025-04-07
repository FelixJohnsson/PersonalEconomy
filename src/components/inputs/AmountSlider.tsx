import React from "react";
import { formatCurrency } from "../../utils/formatters";

interface AmountSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  className?: string;
  showResetButton?: boolean;
  originalValue?: number;
  onReset?: () => void;
}

/**
 * A reusable slider component for adjusting financial amounts
 */
const AmountSlider: React.FC<AmountSliderProps> = ({
  value,
  onChange,
  min = 0,
  max = 10000,
  step = 100,
  label = "Adjust Amount",
  className = "",
  showResetButton = false,
  originalValue,
  onReset,
}) => {
  return (
    <div className={`${className}`}>
      <h4 className="text-lg font-medium mb-2">{label}</h4>
      <div className="flex items-center space-x-4">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="min-w-[120px]">
          <input
            type="number"
            min={min}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            onBlur={(e) => {
              const num = Number(e.target.value);
              if (num < min) onChange(min);
            }}
            className="w-full p-1 border border-gray-300 rounded text-right"
          />
          <div className="text-xs text-gray-500 mt-1">per month</div>
        </div>
      </div>

      <div className="mt-2 flex justify-between text-xs text-gray-500">
        <span>{formatCurrency(min)}</span>
        <span>{formatCurrency(max)}</span>
      </div>

      {showResetButton &&
        originalValue !== undefined &&
        value !== originalValue && (
          <div className="mt-3 flex justify-end">
            <button
              onClick={onReset}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Reset to original ({formatCurrency(originalValue)})
            </button>
          </div>
        )}
    </div>
  );
};

export default AmountSlider;
