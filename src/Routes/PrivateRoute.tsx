// components/PrivateRoute.tsx
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { store } from "../redux/store";
import { setNavigator } from "../utils/const.utils";

const PrivateRoute = () => {
  const token = (store.getState() as any).block.token;
  const navigate = useNavigate();
  setNavigator(navigate);
  
  // Check both Redux state and localStorage for token
  const localStorageToken = localStorage.getItem("token");
  
  if ((!token || token.trim() === "") && !localStorageToken) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
