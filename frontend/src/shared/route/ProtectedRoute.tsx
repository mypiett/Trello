import { Navigate } from "react-router-dom";
import { useAuth } from "@/shared/providers/AuthProvider";
import { PageLoader } from "@/shared/components/Loader";

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
