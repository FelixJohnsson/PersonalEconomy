import React from "react";
import classNames from "classnames";
import Card from "./Card";

export type TrendDirection = "up" | "down" | "neutral";

export interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: TrendDirection;
  trendValue?: string;
  footer?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const trendIcons = {
  up: (
    <svg
      className="h-4 w-4 text-green-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
      />
    </svg>
  ),
  down: (
    <svg
      className="h-4 w-4 text-red-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6"
      />
    </svg>
  ),
  neutral: (
    <svg
      className="h-4 w-4 text-gray-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 12h14"
      />
    </svg>
  ),
};

const trendColors = {
  up: "text-green-600",
  down: "text-red-600",
  neutral: "text-gray-600",
};

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  description,
  trend = "neutral",
  trendValue,
  footer,
  icon,
  className,
  onClick,
}) => {
  return (
    <Card
      variant="default"
      size="md"
      isHoverable={!!onClick}
      onClick={onClick}
      className={className}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>

      <div className="flex items-baseline">
        <div className="text-2xl font-semibold text-gray-900">{value}</div>

        {trend && (
          <div className="ml-2 flex items-center">
            {trendIcons[trend]}
            {trendValue && (
              <span className={classNames("text-sm ml-1", trendColors[trend])}>
                {trendValue}
              </span>
            )}
          </div>
        )}
      </div>

      {description && (
        <div className="mt-1 text-sm text-gray-600">{description}</div>
      )}

      {footer && (
        <div className="mt-4 pt-3 border-t border-gray-200 text-sm">
          {footer}
        </div>
      )}
    </Card>
  );
};

export default StatsCard;
