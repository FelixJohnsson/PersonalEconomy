import React from "react";
import IncomeForm from "../components/IncomeForm";
import { formatCurrency } from "../utils/formatters";
import Card from "../components/cards/Card";
import { useIncome } from "../hooks/useIncome";

const IncomePage: React.FC = () => {
  const {
    sortedIncomes,
    selectedIncome,
    isLoading,
    error,
    totals,
    setSelectedId,
    addIncome,
    updateIncome,
    deleteIncome,
    getCategoryColor,
  } = useIncome();

  // Show loading indicator while data is being fetched
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading income data...</p>
        </div>
      </div>
    );
  }

  // Show error message if data fetching failed
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <p className="text-red-600 font-bold mb-2">
            Error loading income data
          </p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Income</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card variant="default" size="md">
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Gross Income
          </h3>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(totals.totalGrossIncome)}
          </p>
          <p className="text-sm text-gray-600 mt-1">Before taxes</p>
        </Card>

        <Card variant="default" size="md">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Net Income</h3>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(totals.totalNetIncome)}
          </p>
          <p className="text-sm text-gray-600 mt-1">After taxes</p>
        </Card>

        <Card variant="default" size="md">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Tax Amount</h3>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(totals.totalTaxAmount)}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Effective rate: {totals.effectiveTaxRate.toFixed(1)}%
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card variant="default" size="lg">
            <h2 className="text-xl font-semibold mb-4">Your Income</h2>

            {sortedIncomes.length === 0 ? (
              <p className="text-gray-500">No income recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gross
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tax Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Net
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Frequency
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedIncomes.map((income) => (
                      <tr key={income._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {income.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div
                              className="w-3 h-3 rounded-full mr-2"
                              style={{
                                backgroundColor: getCategoryColor(income.type),
                              }}
                            />
                            {income.type}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {formatCurrency(income.grossAmount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {income.taxRate !== undefined
                            ? `${income.taxRate}%`
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {formatCurrency(income.netAmount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {income.frequency}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => setSelectedId(income._id)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteIncome(income._id)}
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
          </Card>
        </div>

        <div>
          <IncomeForm
            initialIncome={selectedIncome}
            onSubmit={() => setSelectedId(null)}
            addIncome={addIncome}
            updateIncome={updateIncome}
            deselectIncome={() => setSelectedId(null)}
          />
        </div>
      </div>
    </div>
  );
};

export default IncomePage;
