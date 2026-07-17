// src/utils/axios.js
import Axios from "axios";
import { store } from "../redux/store";
import { setToken } from "../redux/apis/apisSlice";
import { attachAcceptLanguage } from "./acceptLanguage";
import toast from "react-hot-toast";

const axios = Axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

attachAcceptLanguage(axios);

axios.interceptors.request.use((reqConfig) => {
  const config = { ...reqConfig };
  const token = (store.getState() as any).block.token;

  if (token) {
    // config.headers["Authorization"] = `Bearer ${token}`;
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
      console.warn("Unauthorized, redirecting to login...");
      toast.error("Session expired, please login again.");

      // Clear authentication data from localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("userData");

      // Clear redux-persist persisted state so PublicRoute won't redirect back
      localStorage.removeItem("persist:root");

      // Clear token from Redux store
      store.dispatch(setToken({ token: "" }));

      window.location.href = "/login";
    }
    // }
    if (status === 422) {
      // First check if error is a string
      if (typeof data.errors === 'string') {
        toast.error(data.errors);
      } else if (typeof data.message === 'string') {
        toast.error(data.message);
      } else if (data.errors && Object.keys(data.errors).length > 0) {
        // If errors is an object, get the first field's error
        const firstField = Object.keys(data.errors)[0];
        const firstError = data.errors[firstField];
        
        // Check if the first error is a string
        if (typeof firstError === 'string') {
          toast.error(firstError);
        } else if (Array.isArray(firstError) && firstError.length > 0) {
          // If it's an array, show the first element
          toast.error(firstError[0]);
        } else if (firstError) {
          toast.error(firstError);
        }
      }
    }
    if (status === 500) {
    toast.error(data.message);
    }
    if (status === 409 && data) {
      // loop through all validation errors
      toast.error(data.message);
    }
    return Promise.reject(error); // make sure errors still propagate
  }
);

export default axios;
