import Axios from "axios";
import { attachAcceptLanguage } from "./acceptLanguage";
import { store } from "../redux/store";
import { clearAdminSession } from "./adminSession";
import toast from "react-hot-toast";

const axiosRiskService = Axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/risk-service`,
});

axiosRiskService.interceptors.request.use((reqConfig) => {
  const config = { ...reqConfig };
  const token = (store.getState() as any).block.token;

  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

axiosRiskService.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const data = error?.response?.data;

    if (status === 401) {
      void clearAdminSession();
      window.location.href = "/login";
    }

    if (status === 500) {
      toast.error(data?.message || "Internal server error");
    }

    return Promise.reject(error);
  }
);

attachAcceptLanguage(axiosRiskService);

export default axiosRiskService;
