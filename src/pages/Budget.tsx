import React from "react";
import BudgetPlanner from "../components/BudgetPlanner";
import { useAppContext } from "../context/AppContext";

const Budget: React.FC = () => {
  const { isLoading } = useAppContext();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Budget Planning</h1>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading your budget data...</p>
        </div>
      ) : (
        <BudgetPlanner />
      )}
    </div>
  );
};

export default Budget;
