import Axios from "axios";
import { store } from "../redux/store";
import { handleUnauthorized } from "./handleAuthError";

const axiosCollectionsService = Axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/collections-service`,
});

axiosCollectionsService.interceptors.request.use((reqConfig) => {
  const config = { ...reqConfig };
  const token = (store.getState() as any).block.token;

  config.headers["Authorization"] = `Bearer ${token}`;
  config.headers["Content-Type"] = "application/json";

  return config;
});

axiosCollectionsService.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      handleUnauthorized();
    }
    return Promise.reject(error);
  }
);

export default axiosCollectionsService;
