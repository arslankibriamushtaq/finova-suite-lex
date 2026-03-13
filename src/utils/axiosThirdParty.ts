import Axios from "axios";
import { store } from "../redux/store";
import { setToken } from "../redux/apis/apisSlice";
import toast from "react-hot-toast";

const axiosThirdParty = Axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/middleware-third-party`,
});
axiosThirdParty.interceptors.request.use((reqConfig) => {
  const config = { ...reqConfig };
  const token = (store.getState() as any).block.token;

  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

axiosThirdParty.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const data = error?.response?.data;

    // if (status === 401) {
    //   console.warn("Unauthorized, redirecting to login...");
    //   toast.error("Session expired, please login again.");
      
    //   // Clear authentication data from localStorage
    //   localStorage.removeItem("token");
    //   localStorage.removeItem("userData");
      
    //   // Clear token from Redux store
    //   store.dispatch(setToken({ token: "" }));
      
    //   window.location.href = "/login";
    // }

    if (status === 422 && data?.errors) {
      // Validation errors
      Object.keys(data.errors).forEach((field) => {
        data.errors[field].forEach((msg: any) => {
          toast.error(`${field}: ${msg}`);
        });
      });
    }

    if (status === 500) {
      toast.error(data?.message || "Internal server error");
    }

    if (status === 409 && data) {
      toast.error(data.message);
    }

    return Promise.reject(error);
  }
);

export default axiosThirdParty;

