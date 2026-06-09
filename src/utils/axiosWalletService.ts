import Axios from "axios";
import { store } from "../redux/store";
import { handleUnauthorized } from "./handleAuthError";
import toast from "react-hot-toast";

const axiosWalletService = Axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/wallet-service`,
});

axiosWalletService.interceptors.request.use((reqConfig) => {
  const config = { ...reqConfig };
  const token = (store.getState() as any).block.token;

  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

axiosWalletService.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const data = error?.response?.data;

    if (status === 401) {
      handleUnauthorized();
    }

    if (status === 500) {
      toast.error(data?.message || "Internal server error");
    }

    return Promise.reject(error);
  }
);

export default axiosWalletService;
