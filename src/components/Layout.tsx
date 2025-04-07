import React from "react";
import { Link, useLocation } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path
      ? "bg-blue-100 text-blue-700"
      : "text-gray-700 hover:bg-gray-100";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-blue-600">
                  Economy Tracker
                </h1>
              </div>
              <div className="ml-6 flex space-x-4">
                <Link
                  to="/"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive(
                    "/"
                  )}`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/expenses"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive(
                    "/expenses"
                  )}`}
                >
                  Expenses
                </Link>
                <Link
                  to="/budget"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive(
                    "/budget"
                  )}`}
                >
                  Budget
                </Link>
                <Link
                  to="/categories"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive(
                    "/categories"
                  )}`}
                >
                  Categories
                </Link>
                <Link
                  to="/assets"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive(
                    "/assets"
                  )}`}
                >
                  Assets
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;
