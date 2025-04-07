import React from "react";
import DataImportExport from "../components/settings/DataImportExport";

const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-8 pb-10">
      <section className="py-6">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-gray-600 max-w-3xl">
          Manage your application settings and data
        </p>
      </section>

      <div className="grid grid-cols-1 gap-8">
        <DataImportExport />

        {/* Additional settings sections can be added here in the future */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">About</h2>
          <div className="space-y-2">
            <p className="text-gray-600">
              <strong>Version:</strong> 1.0.0
            </p>
            <p className="text-gray-600">
              <strong>EconomyTracker</strong> is your personal finance
              dashboard. Track your income, expenses, assets, and plan for the
              future.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
