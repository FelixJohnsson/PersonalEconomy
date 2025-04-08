import React, { useState, FormEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type AuthMode = "login" | "register";

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    login,
    register,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    console.log("🔄 AuthPage: Checking authentication status", {
      isAuthenticated,
    });
    if (isAuthenticated) {
      console.log("🚀 AuthPage: User is authenticated, redirecting to home");
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log("📝 AuthPage: Form submitted", { mode, email: formData.email });
    setError(null);
    setIsLoading(true);

    try {
      if (mode === "register") {
        // Validate form
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords do not match");
        }

        if (formData.password.length < 6) {
          throw new Error("Password must be at least 6 characters");
        }

        console.log("👤 AuthPage: Registering user");
        // Register user
        await register(formData.name, formData.email, formData.password);
        console.log("✅ AuthPage: Registration successful");
      } else {
        console.log("🔑 AuthPage: Logging in user");
        // Login user
        await login(formData.email, formData.password);
        console.log("✅ AuthPage: Login successful");
      }
    } catch (error) {
      console.error("❌ AuthPage: Authentication error:", error);
      setError(
        error instanceof Error ? error.message : "Authentication failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render anything if still checking auth status
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Economy Tracker</h1>
          <p className="mt-2 text-gray-600">
            {mode === "login"
              ? "Sign in to your account"
              : "Create a new account"}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={`px-4 py-2 ${
              mode === "login"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500"
            }`}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            className={`px-4 py-2 ${
              mode === "register"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500"
            }`}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 text-sm text-white bg-red-500 rounded">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {mode === "register" && (
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading
                ? "Processing..."
                : mode === "login"
                ? "Sign In"
                : "Create Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
