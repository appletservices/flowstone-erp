import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

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
  const location = useLocation();

  useEffect(() => {
    async function checkAuth() {
      const token = localStorage.getItem("auth_token");
      const storedUser = localStorage.getItem("auth_user");

      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // Demo token check
      if (token === "demo-token" && storedUser) {
        setIsAuthenticated(true);
        setUser(JSON.parse(storedUser));
        setIsLoading(false);
        return;
      }

      // Verify token with backend
      try {
        const response = await fetch(`${API_URL}/user`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(true);
          setUser(data.user || JSON.parse(storedUser || "{}"));
        } else {
          throw new Error("Invalid token");
        }
      } catch {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
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
