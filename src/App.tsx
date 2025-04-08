import React from "react";
import { BrowserRouter, Route, Routes, Link, Navigate } from "react-router-dom";
import { useAppContext } from "./context/AppContext";
import { AppProvider } from "./context/AppContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import ExpensesPage from "./pages/ExpensesPage";
import AssetsPage from "./pages/AssetsPage";
import FutureTrackerPage from "./pages/FutureTrackerPage";
import IncomePage from "./pages/IncomePage";
import SubscriptionsPage from "./pages/SubscriptionsPage";
import CategoriesPage from "./pages/CategoriesPage";
import Budget from "./pages/Budget";
import Notes from "./pages/Notes";
import TaxReturnPage from "./pages/TaxReturnPage";
import SettingsPage from "./pages/SettingsPage";
import SetupPage from "./pages/SetupPage";
import NetWorthPage from "./pages/NetWorthPage";
import LiabilitiesPage from "./pages/LiabilitiesPage";
import WhatIfCalculatorPage from "./pages/WhatIfCalculatorPage";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen">
      <div className="w-64 bg-gray-800 text-white p-5">
        <h1 className="text-2xl font-bold mb-6">Economy Tracker</h1>

        {/* User info section */}
        <div className="mb-6 pb-4 border-b border-gray-700">
          <div className="flex items-center">
            <div className="bg-gray-600 rounded-full w-10 h-10 flex items-center justify-center text-lg font-semibold">
              {user?.name.charAt(0)}
            </div>
            <div className="ml-3">
              <div className="font-medium">{user?.name}</div>
              <Link
                to="/profile"
                className="text-xs text-blue-300 hover:text-blue-200"
              >
                View Profile
              </Link>
            </div>
          </div>
        </div>

        <nav>
          <ul className="space-y-2">
            <li>
              <Link
                to="/"
                className="block py-2 px-4 rounded hover:bg-gray-700 transition-colors"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/profile"
                className="block py-2 px-4 rounded hover:bg-gray-700 transition-colors"
              >
                Profile
              </Link>
            </li>
            <li>
              <Link
                to="/expenses"
                className="block py-2 px-4 rounded hover:bg-gray-700 transition-colors"
              >
                Expenses
              </Link>
            </li>
            <li>
              <Link
                to="/income"
                className="block py-2 px-4 rounded hover:bg-gray-700 transition-colors"
              >
                Income
              </Link>
            </li>
            <li>
              <Link
                to="/subscriptions"
                className="block py-2 px-4 rounded hover:bg-gray-700 transition-colors"
              >
                Subscriptions
              </Link>
            </li>
            <li>
              <Link
                to="/assets"
                className="block py-2 px-4 rounded hover:bg-gray-700 transition-colors"
              >
                Assets
              </Link>
            </li>
            <li>
              <Link
                to="/liabilities"
                className="block py-2 px-4 rounded hover:bg-gray-700 transition-colors"
              >
                Liabilities
              </Link>
            </li>
            <li>
              <Link
                to="/net-worth"
                className="block py-2 px-4 rounded hover:bg-gray-700 transition-colors"
              >
                Net Worth
              </Link>
            </li>
            <li>
              <Link
                to="/categories"
                className="block py-2 px-4 rounded hover:bg-gray-700 transition-colors"
              >
                Categories
              </Link>
            </li>
            <li>
              <Link
                to="/future-tracker"
                className="block py-2 px-4 rounded hover:bg-gray-700 transition-colors"
              >
                Future Tracker
              </Link>
            </li>
            <li>
              <Link
                to="/budget"
                className="block py-2 px-4 rounded hover:bg-gray-700 transition-colors"
              >
                Budget
              </Link>
            </li>
            <li>
              <Link
                to="/notes"
                className="block py-2 px-4 rounded hover:bg-gray-700 transition-colors"
              >
                Notes
              </Link>
            </li>
            <li>
              <Link
                to="/tax-returns"
                className="block py-2 px-4 rounded hover:bg-gray-700 transition-colors"
              >
                Tax Returns
              </Link>
            </li>
            <li>
              <Link
                to="/what-if"
                className="block py-2 px-4 rounded hover:bg-gray-700 transition-colors"
              >
                What-If Calculator
              </Link>
            </li>
            <li>
              <Link
                to="/settings"
                className="block py-2 px-4 rounded hover:bg-gray-700 transition-colors"
              >
                Settings
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="flex-1 bg-gray-100">
        <div className="container mx-auto p-6">{children}</div>
      </div>
    </div>
  );
};

const PlaceholderPage: React.FC<{ name: string }> = ({ name }) => {
  return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">{name} Page</h2>
      <p className="text-gray-600">This page is under development.</p>
    </div>
  );
};

// Main App Router
const AppRouter: React.FC = () => {
  const { isLoading: appLoading } = useAppContext();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();

  // Show loading indicator if data is still loading
  if (authLoading || appLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Auth route - accessible to unauthenticated users */}
      <Route
        path="/auth"
        element={!isAuthenticated ? <AuthPage /> : <Navigate to="/" />}
      />

      {/* Setup route - for authenticated users who haven't completed setup */}
      <Route
        path="/setup"
        element={
          isAuthenticated && !user?.isSetupComplete ? (
            <SetupPage />
          ) : isAuthenticated ? (
            <Navigate to="/" />
          ) : (
            <Navigate to="/auth" />
          )
        }
      />

      {/* Protected routes that require authentication */}
      <Route element={<ProtectedRoute />}>
        {/* If user is authenticated but hasn't completed setup, redirect to setup */}
        <Route
          path="/"
          element={
            !user?.isSetupComplete ? (
              <Navigate to="/setup" />
            ) : (
              <Layout>
                <Dashboard />
              </Layout>
            )
          }
        />

        <Route
          path="/profile"
          element={
            <Layout>
              <ProfilePage />
            </Layout>
          }
        />

        <Route
          path="/expenses"
          element={
            <Layout>
              <ExpensesPage />
            </Layout>
          }
        />

        <Route
          path="/income"
          element={
            <Layout>
              <IncomePage />
            </Layout>
          }
        />

        <Route
          path="/subscriptions"
          element={
            <Layout>
              <SubscriptionsPage />
            </Layout>
          }
        />

        <Route
          path="/assets"
          element={
            <Layout>
              <AssetsPage />
            </Layout>
          }
        />

        <Route
          path="/categories"
          element={
            <Layout>
              <CategoriesPage />
            </Layout>
          }
        />

        <Route
          path="/future-tracker"
          element={
            <Layout>
              <FutureTrackerPage />
            </Layout>
          }
        />

        <Route
          path="/budget"
          element={
            <Layout>
              <Budget />
            </Layout>
          }
        />

        <Route
          path="/notes"
          element={
            <Layout>
              <Notes />
            </Layout>
          }
        />

        <Route
          path="/tax-returns"
          element={
            <Layout>
              <TaxReturnPage />
            </Layout>
          }
        />

        <Route
          path="/liabilities"
          element={
            <Layout>
              <LiabilitiesPage />
            </Layout>
          }
        />

        <Route
          path="/net-worth"
          element={
            <Layout>
              <NetWorthPage />
            </Layout>
          }
        />

        <Route
          path="/what-if"
          element={
            <Layout>
              <WhatIfCalculatorPage />
            </Layout>
          }
        />

        <Route
          path="/settings"
          element={
            <Layout>
              <SettingsPage />
            </Layout>
          }
        />
      </Route>

      {/* Fallback redirect */}
      <Route
        path="*"
        element={
          isAuthenticated ? (
            !user?.isSetupComplete ? (
              <Navigate to="/setup" replace />
            ) : (
              <Navigate to="/" replace />
            )
          ) : (
            <Navigate to="/auth" replace />
          )
        }
      />
    </Routes>
  );
};

// App component with providers
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <AppRouter />
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
