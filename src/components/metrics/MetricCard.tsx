import React from "react";

export interface MetricCardProps {
  title: string;
  value: string;
  trend?: "up" | "down" | "neutral";
  footer?: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, footer }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {footer && <div className="mt-2 text-sm text-gray-600">{footer}</div>}
    </div>
  );
};

export default MetricCard;
