import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { loading, isAuthenticated } = useAuth();

  // Still restoring session → show spinner / loading UI
  if (loading) {
    return <div>Loading...</div>;
  }

  // Not logged in → redirect to login
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Authenticated → render protected component
  return <>{children}</>;
};

export default ProtectedRoute;
