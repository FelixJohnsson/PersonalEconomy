import React, { ChangeEvent } from "react";

interface FormInputProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  placeholder?: string;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  disabled?: boolean;
}

/**
 * A reusable form input component
 */
const FormInput: React.FC<FormInputProps> = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  min,
  max,
  step,
  placeholder,
  className = "",
  labelClassName = "",
  inputClassName = "",
  disabled = false,
}) => {
  return (
    <div className={className}>
      <label
        htmlFor={name}
        className={`block text-sm font-medium text-gray-700 mb-1 ${labelClassName}`}
      >
        {label}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        disabled={disabled}
        className={`border border-gray-300 rounded-md p-2 w-full ${inputClassName}`}
      />
    </div>
  );
};

export default FormInput;
