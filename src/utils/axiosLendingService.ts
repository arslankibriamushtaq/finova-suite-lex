import Axios from "axios";
import { attachAcceptLanguage } from "./acceptLanguage";
import { store } from "../redux/store";
import { clearAdminSession } from "./adminSession";

const axiosLendingService = Axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/lending-service`,
});

axiosLendingService.interceptors.request.use((reqConfig) => {
  const config = { ...reqConfig };
  const token = (store.getState() as any).block.token;

  config.headers["Authorization"] = `Bearer ${token}`;
  config.headers["Content-Type"] = "application/json";

  return config;
});

axiosLendingService.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      void clearAdminSession();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

attachAcceptLanguage(axiosLendingService);

export default axiosLendingService;
