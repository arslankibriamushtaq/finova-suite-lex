
import { store } from "../redux/store";
import toast from "react-hot-toast";
import Axios from "axios";
import { handleUnauthorized } from "./handleAuthError";

const axios = Axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_API_NOTIFICATION_URL || import.meta.env.VITE_API_BASE_URL,
});

axios.interceptors.request.use((reqConfig) => {
  const config = { ...reqConfig };
  const token = (store.getState() as any).block.token;

  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const data = error?.response?.data;
    

    if (status === 401) {
      // Only log out when genuinely unauthenticated; a single endpoint's 401
      // shouldn't nuke the session and hard-redirect to login.
      if (handleUnauthorized()) {
        toast.error("Session expired, please login again.");
      }
    }

    // 400 errors are handled entirely by component-level toast.promise

    if (status === 409 && data) {
      toast.error(data.message);
    }
    return Promise.reject(error);
  }
);

export default axios;
