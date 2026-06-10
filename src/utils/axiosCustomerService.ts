import Axios from "axios";
import { store } from "../redux/store";
import { setToken } from "../redux/apis/apisSlice";
import toast from "react-hot-toast";

const axiosCustomerService = Axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/customer-service`,
});

axiosCustomerService.interceptors.request.use((reqConfig) => {
  const config = { ...reqConfig };
  const token = (store.getState() as any).block.token;

  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

axiosCustomerService.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const data = error?.response?.data;

    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      store.dispatch(setToken({ token: "" }));
      window.location.href = "/login";
    }

    if (status === 500) {
      toast.error(data?.message || "Internal server error");
    }

    return Promise.reject(error);
  }
);

export default axiosCustomerService;
