import React, { useState, useEffect } from "react";
import { formatCurrency } from "../utils/formatters";
import {
  calculateProjection,
  calculateRequiredSavings,
  calculateMonthsBetweenDates,
} from "../utils/financialCalculations";
import AmountSlider from "../components/inputs/AmountSlider";
import ProjectionChart from "../components/charts/ProjectionChart";
import InfoCard from "../components/ui/InfoCard";
import FormInput from "../components/forms/FormInput";

// Define return type for calculateTargetDate
type TargetDateResult = {
  date: string;
  months: number;
} | null;

/**
 * What-If Calculator Page
 * Allows users to calculate various financial scenarios
 * Based on the Future Tracker but simplified for quick calculations
 */
const WhatIfCalculatorPage: React.FC = () => {
  // State for form values
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [targetDate, setTargetDate] = useState<string>(
    new Date(new Date().setFullYear(new Date().getFullYear() + 2))
      .toISOString()
      .split("T")[0]
  );
  const [initialAmount, setInitialAmount] = useState<number>(0);
  const [monthlySavings, setMonthlySavings] = useState<number>(2000);
  const [targetAmount, setTargetAmount] = useState<number>(100000);
  const [interestRate, setInterestRate] = useState<number>(5);

  // Projection data
  const [projectionData, setProjectionData] = useState<any>(null);

  // Calculate total months between start and target date
  const totalMonths = calculateMonthsBetweenDates(startDate, targetDate);

  // Calculate required monthly savings for target amount
  const requiredMonthlySavings = calculateRequiredSavings(
    initialAmount,
    targetAmount,
    interestRate,
    totalMonths
  );

  // Calculate target date for given monthly savings
  const calculateTargetDate = (): TargetDateResult => {
    if (!monthlySavings || monthlySavings <= 0 || !targetAmount) return null;

    let currentAmount = initialAmount;
    const monthlyRate = interestRate / 100 / 12;
    let monthsRequired = 0;

    while (currentAmount < targetAmount) {
      currentAmount += monthlySavings;
      currentAmount += currentAmount * monthlyRate;
      monthsRequired++;

      // Safety check to prevent infinite loops
      if (monthsRequired > 600) {
        // 50 years maximum
        return null;
      }
    }

    // Convert months to a formatted date
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + monthsRequired);
    return {
      date: date.toISOString().split("T")[0],
      months: monthsRequired,
    };
  };

  // Calculate potential amount for a given time period
  const calculatePotentialAmount = () => {
    if (!totalMonths || totalMonths <= 0) return null;

    const projection = calculateProjection(
      initialAmount,
      monthlySavings,
      interestRate,
      totalMonths
    );
    return projection.finalTotal;
  };

  // Update projection data when inputs change
  useEffect(() => {
    // Always calculate projection based on available inputs
    const projection = calculateProjection(
      initialAmount,
      monthlySavings,
      interestRate,
      totalMonths,
      targetAmount || undefined
    );

    setProjectionData(projection);
  }, [initialAmount, monthlySavings, interestRate, totalMonths, targetAmount]);

  // Determine what scenario we're in based on inputs
  const getResultsContent = () => {
    const potentialAmount = calculatePotentialAmount();
    const targetDateResult = calculateTargetDate();

    return (
      <div className="space-y-6">
        {/* Calculate final amount */}
        {potentialAmount && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">
              After {totalMonths} months, you will have approximately:
            </p>
            <p className="text-2xl font-semibold text-blue-700">
              {formatCurrency(potentialAmount)}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              This includes {formatCurrency(initialAmount)} initial investment
              and {formatCurrency(monthlySavings * totalMonths)} in deposits.
            </p>
          </div>
        )}

        {/* Calculate required monthly savings */}
        {targetAmount > 0 && totalMonths > 0 && (
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">
              To reach {formatCurrency(targetAmount)} in {totalMonths} months,
              you need to save:
            </p>
            <p className="text-2xl font-semibold text-green-700">
              {formatCurrency(requiredMonthlySavings)} per month
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Starting with {formatCurrency(initialAmount)} and earning{" "}
              {interestRate}% interest.
            </p>
          </div>
        )}

        {/* Calculate target date */}
        {targetDateResult && monthlySavings > 0 && targetAmount > 0 && (
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Saving {formatCurrency(monthlySavings)} monthly, you'll reach{" "}
              {formatCurrency(targetAmount)} in approximately:
            </p>
            <p className="text-2xl font-semibold text-purple-700">
              {targetDateResult.months} months (
              {Math.floor(targetDateResult.months / 12)} years,{" "}
              {targetDateResult.months % 12} months)
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Target date: {targetDateResult.date}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">What-If Calculator</h1>

      <section className="mb-8">
        <InfoCard title="Calculate Financial Scenarios" className="mb-6">
          <p className="text-gray-600 mb-6">
            Fill in the values you know, and the calculator will automatically
            show different projection scenarios.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <FormInput
                label="Starting Amount"
                name="initialAmount"
                type="number"
                value={initialAmount}
                onChange={(e) => setInitialAmount(Number(e.target.value))}
                min={0}
                step={1000}
              />
            </div>

            <div>
              <FormInput
                label="Interest Rate (%)"
                name="interestRate"
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                min={0}
                step={0.1}
              />
            </div>

            <div>
              <FormInput
                label="Target Amount"
                name="targetAmount"
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(Number(e.target.value))}
                min={0}
                step={1000}
              />
            </div>

            <div className="space-y-6">
              <AmountSlider
                value={monthlySavings}
                onChange={setMonthlySavings}
                min={0}
                max={20000}
                step={100}
                label="Monthly Savings"
              />
            </div>

            <div>
              <FormInput
                label="Start Date"
                name="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <FormInput
                label="Target Date"
                name="targetDate"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
            </div>
          </div>

          {/* Results Section */}
          {getResultsContent()}
        </InfoCard>
      </section>

      {/* Projection Chart */}
      {projectionData && (
        <section className="mb-8">
          <InfoCard title="Growth Projection" className="mb-6">
            <ProjectionChart
              data={projectionData.chartData}
              targetAmount={targetAmount > 0 ? targetAmount : undefined}
              height={400}
            />

            {/* Explanation of the chart lines */}
            <div className="text-xs text-gray-500 mt-2 mb-4">
              <p>
                <span className="inline-block w-3 h-3 bg-indigo-400 mr-1"></span>{" "}
                Principal: Your total deposits over time
                <span className="inline-block w-3 h-3 bg-green-400 ml-4 mr-1"></span>{" "}
                Interest: Earnings from your investments
              </p>
            </div>

            {/* Additional projection details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-500">Total Principal</p>
                <p className="text-xl font-semibold">
                  {formatCurrency(projectionData.principal)}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-500">Total Interest</p>
                <p className="text-xl font-semibold text-green-600">
                  {formatCurrency(projectionData.finalInterest)}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-500">Final Amount</p>
                <p className="text-xl font-semibold text-blue-600">
                  {formatCurrency(projectionData.finalTotal)}
                </p>
              </div>
            </div>
          </InfoCard>
        </section>
      )}
    </div>
  );
};

export default WhatIfCalculatorPage;
