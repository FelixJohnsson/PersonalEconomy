import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import TaxReturnForm from "../components/tax/TaxReturnForm";
import { TaxReturn } from "../types";
import { formatCurrency } from "../utils/formatters";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";

const TaxReturnPage: React.FC = () => {
  const { taxReturns, addTaxReturn, updateTaxReturn, deleteTaxReturn } =
    useAppContext();
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingTaxReturn, setEditingTaxReturn] = useState<
    TaxReturn | undefined
  >();

  // Sort tax returns by year in descending order
  const sortedTaxReturns = [...taxReturns].sort((a, b) => b.year - a.year);

  // Prepare data for the chart
  const chartData = [...sortedTaxReturns]
    .sort((a, b) => a.year - b.year) // Sort ascending for the chart
    .map((taxReturn) => ({
      year: taxReturn.year,
      declaredIncome: taxReturn.declaredIncome,
      taxPaid: taxReturn.taxPaid,
      returnAmount: taxReturn.returnAmount > 0 ? taxReturn.returnAmount : 0,
      additionalPayment:
        taxReturn.returnAmount < 0 ? -taxReturn.returnAmount : 0,
      effectiveTaxRate: (
        (taxReturn.taxPaid / taxReturn.declaredIncome) *
        100
      ).toFixed(1),
    }));

  const handleSave = (taxReturnData: Omit<TaxReturn, "id">) => {
    if (editingTaxReturn) {
      updateTaxReturn({ ...taxReturnData, id: editingTaxReturn.id });
      setEditingTaxReturn(undefined);
    } else {
      addTaxReturn(taxReturnData);
    }
    setIsAddingNew(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this tax return?")) {
      deleteTaxReturn(id);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <section className="py-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Income Tax Returns</h1>
          {!isAddingNew && !editingTaxReturn && (
            <button
              onClick={() => setIsAddingNew(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Tax Return
            </button>
          )}
        </div>
        <p className="text-gray-600 max-w-3xl">
          Track your income tax return history and visualize year-over-year
          changes in your declared income and tax paid.
        </p>
      </section>

      {(isAddingNew || editingTaxReturn) && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingTaxReturn ? "Edit" : "Add"} Tax Return
          </h2>
          <TaxReturnForm
            taxReturn={editingTaxReturn}
            onSave={handleSave}
            onCancel={() => {
              setIsAddingNew(false);
              setEditingTaxReturn(undefined);
            }}
          />
        </div>
      )}

      {chartData.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">Income Tax History</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  tickFormatter={(value) => `${value / 1000}k`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickFormatter={(value) => `${value}%`}
                />

                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="declaredIncome"
                  name="Declared Income"
                  fill="#3b82f6"
                />
                <Bar
                  yAxisId="left"
                  dataKey="taxPaid"
                  name="Tax Paid"
                  fill="#10b981"
                />
                <Bar
                  yAxisId="left"
                  dataKey="returnAmount"
                  name="Refund"
                  fill="#06b6d4"
                />
                <Bar
                  yAxisId="left"
                  dataKey="additionalPayment"
                  name="Additional Payment"
                  fill="#ef4444"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <h2 className="text-xl font-semibold p-6 pb-4">Tax Return Records</h2>
        {sortedTaxReturns.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No tax returns recorded yet.</p>
            <button
              onClick={() => setIsAddingNew(true)}
              className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
            >
              Add your first tax return
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Year
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Declared Income
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Tax Paid
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Effective Rate
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    After Taxes
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Return Amount
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Submission Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedTaxReturns.map((taxReturn) => (
                  <tr key={taxReturn.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {taxReturn.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(taxReturn.declaredIncome)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(taxReturn.taxPaid)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(
                        (taxReturn.taxPaid / taxReturn.declaredIncome) *
                        100
                      ).toFixed(1)}
                      %
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(
                        taxReturn.declaredIncome - taxReturn.taxPaid
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                        className={
                          taxReturn.returnAmount >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {formatCurrency(Math.abs(taxReturn.returnAmount))}
                        {taxReturn.returnAmount >= 0
                          ? " (refund)"
                          : " (payment)"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(taxReturn.submissionDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setEditingTaxReturn(taxReturn)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(taxReturn.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {sortedTaxReturns.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Tax Return Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Average Declared Income
              </h3>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(
                  taxReturns.reduce((sum, tr) => sum + tr.declaredIncome, 0) /
                    taxReturns.length
                )}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Average Tax Rate
              </h3>
              <p className="text-2xl font-bold text-green-600">
                {(
                  (taxReturns.reduce((sum, tr) => sum + tr.taxPaid, 0) /
                    taxReturns.reduce(
                      (sum, tr) => sum + tr.declaredIncome,
                      0
                    )) *
                  100
                ).toFixed(1)}
                %
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Net Return Amount
              </h3>
              <p
                className={`text-2xl font-bold ${
                  taxReturns.reduce((sum, tr) => sum + tr.returnAmount, 0) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {formatCurrency(
                  Math.abs(
                    taxReturns.reduce((sum, tr) => sum + tr.returnAmount, 0)
                  )
                )}
                {taxReturns.reduce((sum, tr) => sum + tr.returnAmount, 0) >= 0
                  ? " (net refund)"
                  : " (net payment)"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaxReturnPage;
