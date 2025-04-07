import React from "react";
import classNames from "classnames";

export type CardVariant =
  | "default"
  | "primary"
  | "success"
  | "info"
  | "warning"
  | "danger";
export type CardSize = "sm" | "md" | "lg";

export interface CardProps {
  children?: React.ReactNode;
  className?: string;
  variant?: CardVariant;
  size?: CardSize;
  title?: React.ReactNode;
  text?: string;
  footer?: React.ReactNode;
  onClick?: () => void;
  isActive?: boolean;
  icon?: React.ReactNode;
  isHoverable?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = "",
  variant = "default",
  size = "md",
  title,
  text,
  footer,
  onClick,
  isActive = false,
  icon,
  isHoverable = false,
}) => {
  // Base styles
  const baseStyles = "rounded-lg shadow-sm transition-all duration-200";

  // Size styles
  const sizeStyles = {
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  // Variant styles
  const variantStyles = {
    default: "bg-white border border-gray-200",
    primary: "bg-blue-50 border border-blue-200",
    success: "bg-green-50 border border-green-200",
    info: "bg-blue-50 border border-blue-100",
    warning: "bg-yellow-50 border border-yellow-200",
    danger: "bg-red-50 border border-red-200",
  };

  // Interactive styles
  const interactiveStyles = {
    clickable: onClick ? "cursor-pointer" : "",
    hoverable: isHoverable ? "hover:shadow-md hover:border-gray-300" : "",
    active: isActive ? "ring-2 ring-blue-500 ring-opacity-50" : "",
  };

  return (
    <div
      className={classNames(
        baseStyles,
        sizeStyles[size],
        variantStyles[variant],
        interactiveStyles.clickable,
        interactiveStyles.hoverable,
        interactiveStyles.active,
        className
      )}
      onClick={onClick}
    >
      {title && (
        <div className="flex items-center gap-2 mb-3">
          {icon && <div className="text-gray-500">{icon}</div>}
          <h3 className="font-medium text-gray-800">{title}</h3>
        </div>
      )}

      <div>{text && <p className="text-gray-600">{text}</p>}</div>

      <div>{children}</div>

      {footer && (
        <div className="mt-3 pt-3 border-t border-gray-200">{footer}</div>
      )}
    </div>
  );
};

export default Card;
