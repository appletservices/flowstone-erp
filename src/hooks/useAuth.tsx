import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem("auth_token");
      const storedUser = localStorage.getItem("auth_user");

      if (!token || !storedUser) {
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        // Validate token with backend
        const response = await fetch(`${API_URL}/validate-token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok && data.valid) {
          setIsAuthenticated(true);
          // Update user data if backend returns fresh data
          if (data.user) {
            setUser(data.user);
            localStorage.setItem("auth_user", JSON.stringify(data.user));
          } else {
            setUser(JSON.parse(storedUser));
          }
        } else {
          // Token is invalid or expired - clear storage
          localStorage.removeItem("auth_token");
          localStorage.removeItem("auth_user");
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error("Token validation failed:", error);
        // On network error, clear auth state for security
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, []);

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setIsAuthenticated(false);
    setUser(null);
    navigate("/auth", { replace: true });
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
