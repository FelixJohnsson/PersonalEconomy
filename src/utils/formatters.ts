// Format a number as currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format a number as currency in a compact way for chart display (K, M)
export const formatCompactCurrency = (amount: number): string => {
  if (amount === 0) return "0";

  if (amount >= 1000000) {
    return new Intl.NumberFormat("sv-SE", {
      style: "currency",
      currency: "SEK",
      notation: "compact",
      compactDisplay: "short",
      maximumFractionDigits: 1,
    }).format(amount);
  }

  if (amount >= 1000) {
    return new Intl.NumberFormat("sv-SE", {
      style: "currency",
      currency: "SEK",
      notation: "compact",
      compactDisplay: "short",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  return formatCurrency(amount);
};

// Format a date as a string
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

// Format a number as a percentage
export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
};
