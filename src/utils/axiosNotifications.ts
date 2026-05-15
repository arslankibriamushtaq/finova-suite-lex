
import { store } from "../redux/store";
import { setToken } from "../redux/apis/apisSlice";
import toast from "react-hot-toast";
import Axios from "axios";

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
      toast.error("Session expired, please login again.");
      
      // Clear authentication data from localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      
      // Clear token from Redux store
      store.dispatch(setToken({ token: "" }));
      
      // Redirect to login page
      window.location.href = "/login";
    }

    // 400 errors are handled entirely by component-level toast.promise

    if (status === 409 && data) {
      toast.error(data.message);
    }
    return Promise.reject(error);
  }
);

export default axios;
