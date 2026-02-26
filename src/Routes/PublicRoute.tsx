// components/PublicRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { store } from "../redux/store";

const PublicRoute = () => {
  const token = (store.getState() as any).block.token;
  const localStorageToken = localStorage.getItem("token");
  
  // If user is already logged in (check both Redux and localStorage), redirect to dashboard
  if ((token && token.trim() !== "") || localStorageToken) {
    // Get user data from localStorage to determine role
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        const roleValue = parsedData?.user?.role || parsedData?.user?.user_role;
        
        // Redirect based on role
        if (roleValue === "partner_admin") {
          return <Navigate to="/partner" replace />;
        } else if (roleValue === "customer") {
          return <Navigate to="/customer" replace />;
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
    
    // Default redirect to main dashboard
    return <Navigate to="/LOS/Dashboard" replace />;
  }

  // If not logged in, allow access to public routes (like login)
  return <Outlet />;
};

export default PublicRoute;

