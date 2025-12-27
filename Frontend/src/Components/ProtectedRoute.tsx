import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { authAPI } from "../api/index";
import { getAuthToken, clearAuth } from "../utils/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      const token = getAuthToken();
      
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }
      
      try {
        // Verify token with backend
        await authAPI.verifyToken(token);
        setIsAuthenticated(true);
      } catch (err) {
        console.error("Token verification failed:", err);
        clearAuth();
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    verifyAuth();
  }, []);

  // Show loading state while verifying
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600 text-lg">Verifying authentication...</div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
