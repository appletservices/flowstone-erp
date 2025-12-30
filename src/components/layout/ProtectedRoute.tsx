import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
<<<<<<< HEAD
  const { isAuthenticated } = useAuth();
  const location = useLocation();
=======
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
>>>>>>> c326f3c136df0f0f7c231326c558a1d778e6cbb2

  if (!isAuthenticated) {
    // Store the intended path so we can redirect after login
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  return children;
};
