import Axios from "axios";
import { attachAcceptLanguage } from "./acceptLanguage";
import { store } from "../redux/store";
import { clearAdminSession } from "./adminSession";
import { redirectToLogin } from "./redirectToLogin";
 
const axiosCms = Axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_API_BASE_CMS_URL,
  // withCredentials: true,
});
// let tokenValue = localStorage.getItem("accessToken");
axiosCms.interceptors.request.use((reqConfig) => {
  const config = { ...reqConfig };
  const token = (store.getState() as any).block.token;

  if (token) {
    // config.headers["Authorization"] = `Bearer ${token}`;
    config.headers["Authorization"] = `Bearer ${token}`;
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});
 
axiosCms.interceptors.response.use(
  function (response) {
 
    return response;
  },
 
  async function (error) {
    if (error?.response?.status === 401) {
      
      void clearAdminSession();
      
      // Redirect to login page
      redirectToLogin();
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
 
attachAcceptLanguage(axiosCms);

export default axiosCms;