/**
 * Calculate compound interest projection data
 */
export interface ProjectionData {
  chartData: Array<{
    month: number;
    principal: number;
    interest: number;
    total: number;
  }>;
  finalTotal: number;
  finalInterest: number;
  principal: number;
  monthsToTarget?: number;
}

/**
 * Calculate financial projection with compound interest
 */
export const calculateProjection = (
  currentAmount: number,
  monthlySavings: number,
  expectedReturnRate: number,
  totalMonths: number,
  targetAmount?: number
): ProjectionData => {
  const monthlyReturnRate = expectedReturnRate / 100 / 12;
  let currentBalance = currentAmount;
  const chartData = [];
  let monthsToTarget = undefined;

  for (let month = 0; month <= totalMonths; month++) {
    // Add this month's savings
    if (month > 0) {
      currentBalance += monthlySavings;
    }

    // Calculate this month's interest
    const monthlyInterest = currentBalance * monthlyReturnRate;
    currentBalance += monthlyInterest;

    // Store data point
    chartData.push({
      month,
      principal:
        month === 0 ? currentAmount : currentAmount + monthlySavings * month,
      interest: currentBalance - (currentAmount + monthlySavings * month),
      total: currentBalance,
    });

    // Check if target amount reached
    if (targetAmount && !monthsToTarget && currentBalance >= targetAmount) {
      monthsToTarget = month;
    }
  }

  return {
    chartData,
    finalTotal: chartData[chartData.length - 1].total,
    finalInterest: chartData[chartData.length - 1].interest,
    principal: chartData[chartData.length - 1].principal,
    monthsToTarget,
  };
};

/**
 * Calculate required monthly savings to reach a target amount
 */
export const calculateRequiredSavings = (
  currentAmount: number,
  targetAmount: number,
  expectedReturnRate: number,
  totalMonths: number
): number => {
  const monthlyReturnRate = expectedReturnRate / 100 / 12;
  const remainingAmount = targetAmount - currentAmount;

  // Handle edge cases
  if (totalMonths <= 0) return 0;
  if (remainingAmount <= 0) return 0;
  if (expectedReturnRate === 0) return remainingAmount / totalMonths;

  // Using the future value formula: FV = PMT * ((1 + r)^n - 1) / r
  // Solved for PMT (monthly payment)
  const requiredMonthly =
    (remainingAmount * monthlyReturnRate) /
    (Math.pow(1 + monthlyReturnRate, totalMonths) - 1);

  return Math.ceil(requiredMonthly);
};

/**
 * Calculate the number of months between two dates
 */
export const calculateMonthsBetweenDates = (
  startDate: string | Date,
  endDate: string | Date
): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  return Math.max(
    0,
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30.44))
  );
};
