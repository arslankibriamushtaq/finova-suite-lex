// src/utils/axios.js
import Axios from "axios";
import { attachAcceptLanguage } from "./acceptLanguage";
import { store } from "../redux/store";
import { setToken } from "../redux/apis/apisSlice";
import toast from "react-hot-toast";

const axios = Axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_API_WEBPAGES_URL,
});

axios.interceptors.request.use((reqConfig) => {
  const config = { ...reqConfig };
  const token = (store.getState() as any).block.token;

  if (token) {
    // config.headers["Authorization"] = `Bearer ${token}`;
    config.headers["Authorization"] = `Bearer ${token}`;
    config.headers["Content-Type"] = "application/json";
  }
  
  // Add ngrok-skip-browser-warning header to bypass ngrok warning page
  config.headers["ngrok-skip-browser-warning"] = "true";

  return config;
});

axios.interceptors.response.use(
  (response) => {
    // Check if response is HTML (ngrok warning page or other HTML errors)
    const contentType = response.headers["content-type"] || "";
    const responseData = response.data;
    
    // Check if response is HTML by checking content-type or data structure
    if (contentType.includes("text/html") || 
        (typeof responseData === "string" && responseData.trim().startsWith("<!DOCTYPE"))) {
      const error = new Error("Received HTML response instead of JSON. This might be a ngrok warning page or server error.");
      (error as any).response = response;
      return Promise.reject(error);
    }
    return response;
  },
  async (error) => {
    const status = error?.response?.status;
    const data = error?.response?.data;


    if (status === 401) {
      console.warn("Unauthorized, redirecting to login...");
      toast.error("Session expired, please login again.");
      
      // Clear authentication data from localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      
      // Clear token from Redux store
      store.dispatch(setToken({ token: "" }));
      
      window.location.href = "/login";
    }
  
    if (status === 422) {

      
      // loop through all validation errors
      Object.keys(data.errors).forEach((field) => {
        data.errors[field].forEach((msg: any) => {
          toast.error(`${field}: ${msg}`);
        });
      });
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

attachAcceptLanguage(axios);

export default axios;
