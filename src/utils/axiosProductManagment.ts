import Axios from "axios";
import { attachAcceptLanguage } from "./acceptLanguage";
import { store } from "../redux/store";
import { setToken } from "../redux/apis/apisSlice";
 
 
const axiosProductManagement = Axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/product-service`,
});
// let tokenValue = localStorage.getItem("accessToken");
axiosProductManagement.interceptors.request.use((reqConfig) => {
  const config = { ...reqConfig };
  const token = (store.getState() as any).block.token;

  // if (token) {
    // config.headers["Authorization"] = `Bearer ${token}`;
    config.headers["Authorization"] = `Bearer ${token}`;
    config.headers["Content-Type"] = "application/json";
  // }

  return config;
});
 
axiosProductManagement.interceptors.response.use(
  function (response) {
 
    return response;
  },
 
  async function (error) {
    if (error?.response?.status === 401) {
      // Clear authentication data from localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      
      // Clear token from Redux store
      store.dispatch(setToken({ token: "" }));
      
      // Redirect to login page
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);
 
// const refreshAccessToken = async () => {
//   const refreshToken = Cookies.get("refreshToken");
//   const token = Cookies.get("token");
 
//   if (
//     !(refreshToken && token) ||
//     refreshToken === "undefined" ||
//     token === "undefined"
//   ) {
//     return Promise.reject("Access denied... No token found");
//   }
 
//   const tokens = await axios.post("/v1/auth/refresh-token", {
//     refreshToken: refreshToken,
//   });
 
//   Cookies.set("token", tokens.token);
//   Cookies.set("refreshToken", tokens.refreshToken);
//   return Promise.resolve(tokens);
// };
 
attachAcceptLanguage(axiosProductManagement);

export default axiosProductManagement;