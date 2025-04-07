import React, { ReactNode } from "react";

interface InfoCardProps {
  title: string;
  value?: string | number | ReactNode;
  caption?: string | ReactNode;
  footer?: string | ReactNode;
  className?: string;
  contentClassName?: string;
  children?: ReactNode;
}

/**
 * A reusable card component for displaying financial information
 */
const InfoCard: React.FC<InfoCardProps> = ({
  title,
  value,
  caption,
  footer,
  className = "",
  contentClassName = "",
  children,
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>

      {caption && <p className="text-sm text-gray-600 mb-2">{caption}</p>}

      {value && <div className="text-xl font-semibold mb-4">{value}</div>}

      {children && <div className={`${contentClassName}`}>{children}</div>}

      {footer && (
        <div className="mt-4 pt-3 border-t border-gray-200">{footer}</div>
      )}
    </div>
  );
};

export default InfoCard;
