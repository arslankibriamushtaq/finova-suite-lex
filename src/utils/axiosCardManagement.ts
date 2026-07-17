import Axios from "axios";
import { attachAcceptLanguage } from "./acceptLanguage";
import { store } from "../redux/store";
import { setToken } from "../redux/apis/apisSlice";
import toast from "react-hot-toast";

const axiosCardManagement = Axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/card-service`,
});

axiosCardManagement.interceptors.request.use((reqConfig) => {
  const config = { ...reqConfig };
  const token = (store.getState() as any).block.token;

  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

axiosCardManagement.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const data = error?.response?.data;

    if (status === 401) {
      toast.error("Session expired, please login again.");
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      localStorage.removeItem("persist:root");
      store.dispatch(setToken({ token: "" }));
      window.location.href = "/login";
    }
    // Business-rule / validation / conflict errors surface the API message.
    if ((status === 400 || status === 409 || status === 422 || status === 500) && data?.message) {
      toast.error(data.message);
    }
    return Promise.reject(error);
  }
);

attachAcceptLanguage(axiosCardManagement);

export default axiosCardManagement;
