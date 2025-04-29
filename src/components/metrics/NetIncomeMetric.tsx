import React from "react";
import { formatCurrency } from "../../utils/formatters";

export interface NetIncomeMetricProps {
  income: number;
  expenses: number;
  subscriptionsTotalCost: number;
}

const NetIncomeMetric: React.FC<NetIncomeMetricProps> = ({
  income,
  expenses,
}) => {
  const netIncome = income - expenses;
  const isPositive = netIncome >= 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-2">Net Income</h3>
      <div
        className={`text-3xl font-bold ${
          isPositive ? "text-green-600" : "text-red-600"
        }`}
      >
        {formatCurrency(netIncome)}
      </div>

      <div className="mt-4">
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                Income
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-green-600">
                {formatCurrency(income)}
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-200">
            <div
              style={{ width: "100%" }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
            ></div>
          </div>
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-red-600 bg-red-200">
                Expenses
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-red-600">
                {formatCurrency(expenses)}
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-red-200">
            <div
              style={{
                width: income > 0 ? `${(expenses / income) * 100}%` : "100%",
              }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500"
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetIncomeMetric;
