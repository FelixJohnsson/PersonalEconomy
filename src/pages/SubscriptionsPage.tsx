import React from "react";
import SubscriptionForm from "../components/SubscriptionForm";
import { formatCurrency } from "../utils/formatters";
import { useSubscriptions } from "../hooks/useSubscriptions";

const SubscriptionsPage: React.FC = () => {
  const {
    sortedSubscriptions,
    selectedSubscription,
    isLoading,
    error,
    totals,
    selectedId,
    filterActive,
    sortField,
    sortDirection,
    setSelectedId,
    setFilterActive,
    handleSort,
    deleteSubscription,
    addSubscription,
    updateSubscription,
    getNextBillingDate,
    getNecessityLevelColor,
  } = useSubscriptions();

  // Show loading indicator while data is being fetched
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subscriptions...</p>
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
            Error loading subscriptions
          </p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  // Render sort indicator
  const renderSortIndicator = (field: typeof sortField) => {
    if (sortField !== field) return null;
    return <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Subscriptions</h1>

      {/* Summary Card */}
      <div className="bg-white shadow-md rounded p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Subscription Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded">
            <p className="text-sm text-gray-600 mb-1">
              Monthly Subscription Cost
            </p>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(totals.monthlyTotal)}
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded">
            <p className="text-sm text-gray-600 mb-1">
              Annual Subscription Cost
            </p>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(totals.annualTotal)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white shadow-md rounded p-6">
            <div className="flex flex-col md:flex-row justify-between mb-4">
              <h2 className="text-xl font-semibold">Your Subscriptions</h2>

              <div className="flex items-center mt-4 md:mt-0 space-x-4">
                <div>
                  <label
                    htmlFor="status-filter"
                    className="mr-2 text-sm font-medium text-gray-700"
                  >
                    Filter by:
                  </label>
                  <select
                    id="status-filter"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={
                      filterActive === null
                        ? "all"
                        : filterActive
                        ? "active"
                        : "inactive"
                    }
                    onChange={(e) => {
                      if (e.target.value === "all") setFilterActive(null);
                      else if (e.target.value === "active")
                        setFilterActive(true);
                      else setFilterActive(false);
                    }}
                  >
                    <option value="all">All Subscriptions</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                  </select>
                </div>
              </div>
            </div>

            {sortedSubscriptions.length === 0 ? (
              <p className="text-gray-500">No subscriptions found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("name")}
                      >
                        Name {renderSortIndicator("name")}
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("amount")}
                      >
                        Amount {renderSortIndicator("amount")}
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("billingDate")}
                      >
                        Next Billing {renderSortIndicator("billingDate")}
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("necessityLevel")}
                      >
                        Necessity {renderSortIndicator("necessityLevel")}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedSubscriptions.map((subscription) => (
                      <tr key={subscription._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {subscription.name}
                              </div>
                              {!subscription.active && (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                  Inactive
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatCurrency(subscription.amount)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {subscription.frequency === "yearly"
                              ? "Yearly"
                              : "Monthly"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {subscription.active
                            ? getNextBillingDate(subscription)
                            : "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {subscription.necessityLevel ? (
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getNecessityLevelColor(
                                subscription.necessityLevel
                              )}`}
                            >
                              {subscription.necessityLevel}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => setSelectedId(subscription._id)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteSubscription(subscription._id)}
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
        </div>

        <div>
          <div className="bg-white shadow-md rounded p-6">
            <h2 className="text-xl font-semibold mb-4">
              {selectedId ? "Edit Subscription" : "Add New Subscription"}
            </h2>
            <SubscriptionForm
              initialSubscription={selectedSubscription}
              onSubmit={() => setSelectedId(null)}
              addSubscription={addSubscription}
              updateSubscription={updateSubscription}
              deselectSubscription={() => setSelectedId(null)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionsPage;
