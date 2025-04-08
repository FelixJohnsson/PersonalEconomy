import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { apiRequest } from "../services/api";

interface User {
  _id: string;
  name: string;
  email: string;
  isSetupComplete: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [isLoading, setIsLoading] = useState(true);

  // Load user from token on mount or token change
  useEffect(() => {
    const loadUser = async () => {
      console.log("🔄 AuthContext: Loading user from token");
      if (!token) {
        console.log("⚠️ AuthContext: No token found, user not authenticated");
        setIsLoading(false);
        return;
      }

      try {
        console.log("🔍 AuthContext: Fetching user profile");
        const userData = await apiRequest("/api/users/profile", "GET");
        console.log("👤 AuthContext: User loaded successfully", userData);
        setUser(userData);
      } catch (error) {
        console.error("❌ AuthContext: Error loading user profile", error);
        // Token might be invalid, remove it
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    console.log("🔑 AuthContext: Login attempt", { email });
    setIsLoading(true);
    try {
      const response = await apiRequest("/api/users/login", "POST", {
        email,
        password,
      });
      console.log("✅ AuthContext: Login successful", response);
      localStorage.setItem("token", response.token);
      setToken(response.token);
      setUser({
        _id: response._id,
        name: response.name,
        email: response.email,
        isSetupComplete: response.isSetupComplete,
      });
    } catch (error) {
      console.error("❌ AuthContext: Login failed", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    console.log("📝 AuthContext: Register attempt", { name, email });
    setIsLoading(true);
    try {
      const response = await apiRequest("/api/users", "POST", {
        name,
        email,
        password,
      });
      console.log("✅ AuthContext: Registration successful", response);
      localStorage.setItem("token", response.token);
      setToken(response.token);
      setUser({
        _id: response._id,
        name: response.name,
        email: response.email,
        isSetupComplete: response.isSetupComplete,
      });
    } catch (error) {
      console.error("❌ AuthContext: Registration failed", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
