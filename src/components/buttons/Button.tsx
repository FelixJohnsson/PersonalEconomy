import React from "react";
import classNames from "classnames";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "success"
  | "warning"
  | "info"
  | "ghost"
  | "link";

export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  index?: number;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  className = "",
  variant = "primary",
  size = "md",
  type = "button",
  disabled = false,
  isLoading = false,
  icon,
  iconPosition = "left",
  fullWidth = false,
  index,
  ...props
}) => {
  // Base button styles
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-md transition-colors";

  // Size styles
  const sizeStyles = {
    xs: "text-xs px-2 py-1",
    sm: "text-sm px-3 py-1.5",
    md: "text-sm px-4 py-2",
    lg: "text-base px-5 py-2.5",
    xl: "text-lg px-6 py-3",
  };

  // Variant styles
  const variantStyles = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 border border-transparent",
    secondary:
      "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500 border border-transparent",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 border border-transparent",
    success:
      "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 border border-transparent",
    warning:
      "bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500 border border-transparent",
    info: "bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200 focus:ring-blue-500",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
    link: "bg-transparent text-blue-600 hover:underline p-0 focus:ring-0",
  };

  // Focus and width styles
  const focusStyles =
    variant !== "link"
      ? "focus:outline-none focus:ring-2 focus:ring-offset-2"
      : "";
  const widthStyles = fullWidth ? "w-full" : "";

  // Disabled and loading styles
  const stateStyles = {
    disabled: disabled ? "opacity-50 cursor-not-allowed" : "",
    loading: isLoading ? "relative" : "",
  };

  return (
    <button
      key={index}
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={classNames(
        baseStyles,
        sizeStyles[size],
        variantStyles[variant],
        focusStyles,
        widthStyles,
        stateStyles.disabled,
        stateStyles.loading,
        className
      )}
      {...props}
    >
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <svg
            className="animate-spin h-5 w-5 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </span>
      )}

      <span className={isLoading ? "invisible" : ""}>
        {icon && iconPosition === "left" && (
          <span className="mr-2">{icon}</span>
        )}
        {children}
        {icon && iconPosition === "right" && (
          <span className="ml-2">{icon}</span>
        )}
      </span>
    </button>
  );
};

export default Button;
