import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import LiabilityForm from "../components/LiabilityForm";
import { formatCurrency } from "../utils/formatters";
import Card from "../components/cards/Card";

const LiabilitiesPage: React.FC = () => {
  const { liabilities, deleteLiability } = useAppContext();
  const [selectedLiability, setSelectedLiability] = useState<string | null>(
    null
  );

  // Sort liabilities by type and then by name
  const sortedLiabilities = [...liabilities].sort((a, b) => {
    // First sort by type
    if (a.type !== b.type) {
      const typeOrder = {
        mortgage: 1,
        loan: 2,
        credit_card: 3,
        other: 4,
      };
      return typeOrder[a.type] - typeOrder[b.type];
    }
    // Then sort by name
    return a.name.localeCompare(b.name);
  });

  // Calculate total amounts
  const totalLiabilityAmount = liabilities.reduce(
    (sum, liability) => sum + liability.amount,
    0
  );
  const totalMonthlyPayment = liabilities.reduce(
    (sum, liability) => sum + liability.minimumPayment,
    0
  );
  const averageInterestRate =
    liabilities.length > 0
      ? liabilities.reduce(
          (sum, liability) => sum + liability.interestRate,
          0
        ) / liabilities.length
      : 0;

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this liability?")) {
      deleteLiability(id);
      if (selectedLiability === id) {
        setSelectedLiability(null);
      }
    }
  };

  // Format liability type for display
  const formatLiabilityType = (type: string): string => {
    switch (type) {
      case "credit_card":
        return "Credit Card";
      case "loan":
        return "Loan";
      case "mortgage":
        return "Mortgage";
      default:
        return "Other";
    }
  };

  // Get a color based on liability type
  const getLiabilityTypeColor = (type: string): string => {
    switch (type) {
      case "mortgage":
        return "#3B82F6"; // blue-500
      case "loan":
        return "#8B5CF6"; // purple-500
      case "credit_card":
        return "#EF4444"; // red-500
      default:
        return "#6B7280"; // gray-500
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Liabilities & Debt</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card variant="default" size="md">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Total Debt</h3>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(totalLiabilityAmount)}
          </p>
        </Card>

        <Card variant="default" size="md">
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Monthly Payments
          </h3>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(totalMonthlyPayment)}
          </p>
        </Card>

        <Card variant="default" size="md">
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Avg. Interest Rate
          </h3>
          <p className="text-2xl font-bold text-gray-900">
            {averageInterestRate.toFixed(2)}%
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
                    {sortedLiabilities.map((liability) => (
                      <tr key={liability.id}>
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
                            onClick={() => setSelectedLiability(liability.id)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(liability.id)}
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
            initialLiability={
              selectedLiability
                ? liabilities.find((l) => l.id === selectedLiability)
                : undefined
            }
            onSubmit={() => setSelectedLiability(null)}
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
