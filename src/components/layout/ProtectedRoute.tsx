import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Store the intended path so we can redirect after login
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  return children;
};
