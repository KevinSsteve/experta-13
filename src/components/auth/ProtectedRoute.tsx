
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function ProtectedRoute() {
  const { user, isLoading, mustChangePassword } = useAuth();
  
  // Show a loading indicator while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Redirect to login page if not authenticated
  if (!user) {
    console.log("User not authenticated, redirecting to login");
    return <Navigate to="/auth" replace />;
  }
  
  // Redirect to password change page if needed
  if (mustChangePassword) {
    console.log("User needs to change password, redirecting");
    return <Navigate to="/change-password" replace />;
  }
  
  // Render the protected route content
  return <Outlet />;
}
