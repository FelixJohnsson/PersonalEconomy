import React, { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAppContext } from "../context/AppContext";

interface ProtectedRouteProps {
  redirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  redirectPath = "/auth",
}) => {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { isLoading: appLoading } = useAppContext();
  const location = useLocation();

  useEffect(() => {
    console.log("🔒 ProtectedRoute: Checking auth", {
      path: location.pathname,
      isAuthenticated,
      isLoading: authLoading || appLoading,
      setupComplete: user?.isSetupComplete,
    });
  }, [isAuthenticated, authLoading, appLoading, location, user]);

  if (authLoading || appLoading) {
    console.log("⏳ ProtectedRoute: Still loading auth and app status");
    // Show loading indicator while checking authentication and app state
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // If not authenticated, redirect to the auth page
  if (!isAuthenticated) {
    console.log(
      "🚫 ProtectedRoute: Not authenticated, redirecting to",
      redirectPath
    );
    return <Navigate to={redirectPath} replace />;
  }

  // If authenticated but setup not complete, redirect to setup
  if (!user?.isSetupComplete && location.pathname !== "/setup") {
    console.log("🔄 ProtectedRoute: Setup not complete, redirecting to setup");
    return <Navigate to="/setup" replace />;
  }

  // If authenticated and setup complete, render the child routes
  console.log(
    "✅ ProtectedRoute: User authenticated and setup complete, rendering route",
    location.pathname
  );
  return <Outlet />;
};

export default ProtectedRoute;
