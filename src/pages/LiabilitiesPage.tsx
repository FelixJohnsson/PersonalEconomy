import React from "react";
import LiabilityForm from "../components/LiabilityForm";
import { formatCurrency } from "../utils/formatters";
import Card from "../components/cards/Card";
import { useLiabilities } from "../hooks/useLiabilities";

const LiabilitiesPage: React.FC = () => {
  const {
    liabilities,
    selectedLiability,
    isLoading,
    error,
    totals,
    setSelectedId,
    deleteLiability,
    getLiabilityTypeColor,
    formatLiabilityType,
    addLiability,
    updateLiability,
  } = useLiabilities();

  // Show loading indicator while data is being fetched
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading liabilities data...</p>
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
            Error loading liabilities data
          </p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Liabilities & Debt</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card variant="default" size="md">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Total Debt</h3>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(totals.totalLiabilityAmount)}
          </p>
        </Card>

        <Card variant="default" size="md">
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Monthly Payments
          </h3>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(totals.totalMonthlyPayment)}
          </p>
        </Card>

        <Card variant="default" size="md">
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Avg. Interest Rate
          </h3>
          <p className="text-2xl font-bold text-gray-900">
            {totals.averageInterestRate.toFixed(2)}%
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card variant="default" size="lg">
            <h2 className="text-xl font-semibold mb-4">Your Liabilities</h2>

            {liabilities.length === 0 ? (
              <p className="text-gray-500">No liabilities recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Interest Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monthly Payment
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {liabilities.map((liability) => (
                      <tr key={liability._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {liability.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div
                              className="w-3 h-3 rounded-full mr-2"
                              style={{
                                backgroundColor: getLiabilityTypeColor(
                                  liability.type
                                ),
                              }}
                            />
                            {formatLiabilityType(liability.type)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                          {formatCurrency(liability.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {liability.interestRate}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {formatCurrency(liability.minimumPayment)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => setSelectedId(liability._id)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteLiability(liability)}
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
          <LiabilityForm
            initialLiability={selectedLiability}
            onSubmit={() => setSelectedId(null)}
            addLiability={addLiability}
            updateLiability={updateLiability}
          />

          <Card variant="default" size="lg" className="mt-6">
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              Debt Management Tips
            </h3>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
              <li>
                Focus on paying high-interest debt first to save money in the
                long run.
              </li>
              <li>
                Make at least the minimum payment on all debts to avoid
                penalties.
              </li>
              <li>
                Consider consolidating multiple high-interest debts into a
                lower-interest loan.
              </li>
              <li>
                Set up automatic payments to ensure you never miss a due date.
              </li>
              <li>
                Consider the debt snowball (smallest balance first) or debt
                avalanche (highest interest first) methods.
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LiabilitiesPage;
