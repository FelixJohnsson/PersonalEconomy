import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import MetricCard from "../components/metrics/MetricCard";
import NetIncomeMetric from "../components/metrics/NetIncomeMetric";
import { formatCurrency, formatPercentage } from "../utils/formatters";
import { Period } from "../types";
import DateRangeSelector from "../components/forms/DateRangeSelector";
import InfoCard from "../components/ui/InfoCard";
import NetWorthMiniChart from "../components/charts/NetWorthMiniChart";
import { NetWorthHistoryService } from "../services/NetWorthHistory";

const Dashboard: React.FC = () => {
  const {
    getFinancialSummary,
    getActiveSubscriptions,
    getBudgetItems,
    assets,
    liabilities,
  } = useAppContext();
  const [customPeriod, setCustomPeriod] = useState<Period>(() => {
    const today = new Date();

    // Start date is always 25th of previous month
    const startDate = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      25 + 1
    );

    // End date is always 25th of current month
    const endDate = new Date(today.getFullYear(), today.getMonth(), 25 + 1);

    return {
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    };
  });

  // Get net worth history data
  const [netWorthHistory, setNetWorthHistory] = useState<
    Array<{ date: string; netWorth: number }>
  >([]);

  useEffect(() => {
    // Calculate net worth history from asset historical values
    const history = NetWorthHistoryService.getOrGenerateHistory(
      assets,
      liabilities
    );

    // Transform for the chart component (only need date and netWorth)
    setNetWorthHistory(
      history.map((point) => ({
        date: point.date,
        netWorth: point.netWorth,
      }))
    );
  }, [assets, liabilities]);

  // Get financial summary with custom period
  const summary = getFinancialSummary(customPeriod);
  const activeSubscriptions = getActiveSubscriptions();
  const budgetItems = getBudgetItems();

  // Handle date changes
  const handleDateChange = (
    dateType: "startDate" | "endDate",
    value: string
  ) => {
    setCustomPeriod((prev) => ({
      ...prev,
      [dateType]: value,
    }));
  };

  // Calculate subscriptions total
  const subscriptionTotal = activeSubscriptions.reduce((total, sub) => {
    if (sub.frequency === "monthly") {
      return total + sub.amount;
    } else {
      return total + sub.amount / 12;
    }
  }, 0);

  // Get housing cost from budget
  const housingBudget =
    budgetItems.find((item) => item.category === "Housing")?.amount || 0;

  // Calculate fixed costs total (subscriptions + housing)
  const fixedCostsTotal = subscriptionTotal + housingBudget;

  // Get upcoming subscriptions (next 30 days)
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  const upcomingSubscriptions = activeSubscriptions
    .filter((sub) => {
      const billingDay = new Date(sub.billingDate).getDate();

      // Start with this month's billing date
      const nextDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        billingDay
      );

      // If this month's date has passed, move to next month
      if (nextDate < today) {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }

      return nextDate <= thirtyDaysFromNow;
    })
    .sort((a, b) => {
      const dateA = new Date(a.billingDate);
      const dateB = new Date(b.billingDate);
      return dateA.getDate() - dateB.getDate();
    })
    .slice(0, 3); // Show top 3 upcoming

  return (
    <div className="space-y-6 pb-10">
      <section className="py-6">
        <h1 className="text-3xl font-bold mb-2">Welcome to EconomyTracker</h1>
        <p className="text-gray-600 max-w-3xl">
          Your personal finance dashboard. Track your income, expenses, assets,
          and plan for the future.
        </p>
      </section>

      <section>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold">Financial Overview</h2>
            <DateRangeSelector
              period={customPeriod}
              onChange={handleDateChange}
              className="mt-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <NetIncomeMetric
            income={summary.totalIncome}
            expenses={summary.totalExpenses}
            subscriptionsTotalCost={subscriptionTotal}
          />

          <MetricCard
            title="Savings Rate"
            value={formatPercentage(summary.savingsRate)}
          />

          <Link to="/net-worth" className="block">
            <MetricCard
              title="Net Worth"
              value={formatCurrency(summary.netWorth)}
              trend={summary.netWorth > 0 ? "up" : "down"}
              footer={
                <>
                  {netWorthHistory.length > 0 && (
                    <div className="mb-2 mt-3">
                      <NetWorthMiniChart data={netWorthHistory} />
                    </div>
                  )}
                  <div className="flex justify-between text-xs">
                    <span>Assets: {formatCurrency(summary.totalAssets)}</span>
                    <span>
                      Liabilities: {formatCurrency(summary.totalLiabilities)}
                    </span>
                  </div>
                </>
              }
            />
          </Link>

          <Link to="/future-tracker" className="block">
            <div className="h-full bg-white rounded-lg shadow-md p-6 border-2 border-transparent hover:border-blue-500 transition-colors">
              <h3 className="text-lg font-semibold mb-2">Savings Goals</h3>
              <p className="text-sm text-gray-600 mb-4">
                Track progress towards your financial goals
              </p>
              <div className="text-blue-600 font-medium">View Goals →</div>
            </div>
          </Link>

          <Link to="/budget" className="block">
            <div className="h-full bg-white rounded-lg shadow-md p-6 border-2 border-transparent hover:border-blue-500 transition-colors">
              <h3 className="text-lg font-semibold mb-2">Budget Planner</h3>
              <p className="text-sm text-gray-600 mb-4">
                Plan and allocate your income to different expense categories
              </p>
              <div className="text-blue-600 font-medium">Create Budget →</div>
            </div>
          </Link>

          <Link to="/notes" className="block">
            <div className="h-full bg-white rounded-lg shadow-md p-6 border-2 border-transparent hover:border-blue-500 transition-colors">
              <h3 className="text-lg font-semibold mb-2">Financial Notes</h3>
              <p className="text-sm text-gray-600 mb-4">
                Keep track of important financial decisions and reminders
              </p>
              <div className="text-blue-600 font-medium">View Notes →</div>
            </div>
          </Link>

          <Link to="/tax-returns" className="block">
            <div className="h-full bg-white rounded-lg shadow-md p-6 border-2 border-transparent hover:border-blue-500 transition-colors">
              <h3 className="text-lg font-semibold mb-2">Tax Returns</h3>
              <p className="text-sm text-gray-600 mb-4">
                Track your income tax return history and visualize yearly trends
              </p>
              <div className="text-blue-600 font-medium">
                View Tax Returns →
              </div>
            </div>
          </Link>

          <Link to="/settings" className="block">
            <div className="h-full bg-white rounded-lg shadow-md p-6 border-2 border-transparent hover:border-blue-500 transition-colors">
              <h3 className="text-lg font-semibold mb-2">Settings</h3>
              <p className="text-sm text-gray-600 mb-4">
                Configure app settings and import/export your financial data
              </p>
              <div className="text-blue-600 font-medium">Open Settings →</div>
            </div>
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <InfoCard
          title="Income vs Expenses"
          footer={
            <div className="flex space-x-2">
              <Link
                to="/income"
                className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium hover:bg-blue-200 flex text-center"
              >
                Manage Income
              </Link>
              <Link
                to="/expenses"
                className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium hover:bg-blue-200 flex text-center"
              >
                Manage Expenses
              </Link>
            </div>
          }
        >
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Period Income</span>
              <span className="text-green-600 font-semibold">
                {formatCurrency(summary.totalIncome)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Period Expenses</span>
              <span className="text-red-600 font-semibold">
                {formatCurrency(summary.totalExpenses)}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
              <span className="font-semibold">Net Income</span>
              <span
                className={`font-semibold ${
                  summary.netIncome >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {`${formatCurrency(summary.netIncome)}`}
              </span>
            </div>
          </div>
        </InfoCard>

        <InfoCard
          title="Fixed Monthly Costs"
          footer={
            <div className="flex space-x-2">
              <Link
                to="/subscriptions"
                className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium hover:bg-blue-200 flex text-center"
              >
                Manage Subscriptions
              </Link>
              <Link
                to="/budget"
                className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium hover:bg-blue-200 flex text-center"
              >
                Manage Budget
              </Link>
            </div>
          }
        >
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Housing</span>
              <span className="text-red-600 font-semibold">
                {formatCurrency(housingBudget)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Subscriptions</span>
              <span className="text-red-600 font-semibold">
                {formatCurrency(subscriptionTotal)}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
              <span className="font-semibold">Total Fixed Costs</span>
              <span className="text-red-600 font-semibold">
                {formatCurrency(fixedCostsTotal)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>
                {((fixedCostsTotal / summary.totalIncome) * 100).toFixed(1)}% of
                income
              </span>
            </div>
          </div>
        </InfoCard>

        <InfoCard
          title="Assets vs Liabilities"
          footer={
            <div className="flex space-x-2">
              <Link
                to="/assets"
                className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium hover:bg-blue-200 inline-block"
              >
                Manage Assets
              </Link>
              <Link
                to="/liabilities"
                className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium hover:bg-blue-200 inline-block"
              >
                Manage Debt
              </Link>
            </div>
          }
        >
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Assets</span>
              <span className="text-green-600 font-semibold">
                {formatCurrency(summary.totalAssets)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Liabilities</span>
              <span className="text-red-600 font-semibold">
                {formatCurrency(summary.totalLiabilities)}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
              <span className="font-semibold">Net Worth</span>
              <span
                className={`font-semibold ${
                  summary.netWorth >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatCurrency(summary.netWorth)}
              </span>
            </div>
          </div>
        </InfoCard>

        <InfoCard
          title="Subscriptions"
          footer={
            <Link
              to="/subscriptions"
              className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium hover:bg-blue-200 inline-block"
            >
              Manage Subscriptions
            </Link>
          }
        >
          {activeSubscriptions.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500 mb-2">No active subscriptions</p>
              <Link
                to="/subscriptions"
                className="text-blue-600 hover:text-blue-800"
              >
                Add your first subscription
              </Link>
            </div>
          ) : (
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Monthly Total</span>
                <span className="text-red-600 font-semibold">
                  {formatCurrency(subscriptionTotal)}
                </span>
              </div>

              {upcomingSubscriptions.length > 0 && (
                <>
                  <div className="pt-2 border-t border-gray-200">
                    <h3 className="text-sm font-semibold mb-2">
                      Upcoming Payments
                    </h3>
                    <ul className="space-y-2">
                      {upcomingSubscriptions.map((sub) => {
                        const billingDay = new Date(sub.billingDate).getDate();
                        const today = new Date();

                        // Start with this month's billing date
                        const nextDate = new Date(
                          today.getFullYear(),
                          today.getMonth(),
                          billingDay
                        );

                        return (
                          <li
                            key={sub.id}
                            className="flex justify-between items-center text-sm"
                          >
                            <span>{sub.name}</span>
                            <div className="flex items-center">
                              <span className="text-gray-600 mr-2">
                                {nextDate.getDate()}{" "}
                                {nextDate.toLocaleString("default", {
                                  month: "short",
                                })}
                              </span>
                              <span className="font-medium">
                                {formatCurrency(sub.amount)}
                              </span>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  <Link
                    to="/subscriptions"
                    className="text-blue-600 hover:text-blue-800 text-sm text-center"
                  >
                    View all subscriptions
                  </Link>
                </>
              )}
            </div>
          )}
        </InfoCard>
      </section>
    </div>
  );
};

export default Dashboard;
