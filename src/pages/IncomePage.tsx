import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import IncomeForm from "../components/IncomeForm";
import { formatCurrency } from "../utils/formatters";
import Card from "../components/cards/Card";

const IncomePage: React.FC = () => {
  const { incomes, deleteIncome } = useAppContext();
  const [selectedIncome, setSelectedIncome] = useState<string | null>(null);

  // Sort incomes by recurring status first, then alphabetically
  const sortedIncomes = [...incomes].sort((a, b) => {
    // First sort by frequency (monthly first)
    if (a.frequency === "monthly" && b.frequency === "annual") return -1;
    if (a.frequency === "annual" && b.frequency === "monthly") return 1;

    // Then sort by name
    return a.name.localeCompare(b.name);
  });

  // Calculate total gross and net income
  const totalGrossIncome = incomes.reduce((sum, income) => {
    const grossAmount =
      income.grossAmount !== undefined ? income.grossAmount : income.amount;
    return sum + grossAmount;
  }, 0);

  const totalNetIncome = incomes.reduce((sum, income) => {
    const netAmount =
      income.netAmount !== undefined ? income.netAmount : income.amount;
    return sum + netAmount;
  }, 0);

  const totalTaxAmount = totalGrossIncome - totalNetIncome;
  const effectiveTaxRate =
    totalGrossIncome > 0 ? (totalTaxAmount / totalGrossIncome) * 100 : 0;

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this income?")) {
      deleteIncome(id);
      if (selectedIncome === id) {
        setSelectedIncome(null);
      }
    }
  };

  // Get a color based on category
  const getCategoryColor = (category: string): string => {
    // Simple color hash function
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
      hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Convert to hex color
    const c = (hash & 0x00ffffff).toString(16).toUpperCase();

    return "#" + "00000".substring(0, 6 - c.length) + c;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Income</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card variant="default" size="md">
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Gross Income
          </h3>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(totalGrossIncome)}
          </p>
          <p className="text-sm text-gray-600 mt-1">Before taxes</p>
        </Card>

        <Card variant="default" size="md">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Net Income</h3>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(totalNetIncome)}
          </p>
          <p className="text-sm text-gray-600 mt-1">After taxes</p>
        </Card>

        <Card variant="default" size="md">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Tax Amount</h3>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(totalTaxAmount)}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Effective rate: {effectiveTaxRate.toFixed(1)}%
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card variant="default" size="lg">
            <h2 className="text-xl font-semibold mb-4">Your Income</h2>

            {incomes.length === 0 ? (
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
                      <tr key={income.id}>
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
                                backgroundColor: getCategoryColor(
                                  income.category
                                ),
                              }}
                            />
                            {income.category}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {formatCurrency(income.grossAmount || income.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {income.taxRate !== undefined
                            ? `${income.taxRate}%`
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {formatCurrency(income.netAmount || income.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {income.frequency === "annual" ? "Yearly" : "Monthly"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => setSelectedIncome(income.id)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(income.id)}
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
            initialIncome={
              selectedIncome
                ? incomes.find((i) => i.id === selectedIncome)
                : undefined
            }
            onSubmit={() => setSelectedIncome(null)}
          />
        </div>
      </div>
    </div>
  );
};

export default IncomePage;
