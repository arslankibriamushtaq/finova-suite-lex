import Axios from "axios";
import { store } from "../redux/store";
import { setToken } from "../redux/apis/apisSlice";
import { v4 as uuidv4 } from 'uuid'
import toast from "react-hot-toast";
const axiosFactoring = Axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_API_FACTORING,
  // withCredentials: true,
});
// let tokenValue = localStorage.getItem("awn-token");
axiosFactoring.interceptors.request.use((reqConfig) => {
  const config = { ...reqConfig };
  const token = (store.getState() as any).block.token;
  // console.log("Trying to add token")
  // if (!config.headers["Authorization"]) {
 
 
    // console.log(accessToken);
    // if (accessToken && accessToken !== "undefined") {
    //   config.headers["Authorization"] = `Bearer ${tokenValue}`;
     config.headers["Authorization"] = `Bearer ${token}`;
      // Let axios set Content-Type for FormData (multipart/form-data with boundary)
      if (!(config.data instanceof FormData)) {
        config.headers["Content-Type"] = "application/json";
      }
      config.headers["Request-Id"] = uuidv4();
 
      // console.log("Adding token", accessToken)
    //   headers: {
    //     "Content-Type": "application/json",
    //     "Request-Id": "eef836f0-1a0d-43e5-8200-b02fe4730ce4",
    //   },
      // config.headers.authorization = accessToken;
    // }
  // }
  return config;
});
 
axiosFactoring.interceptors.response.use(
  function (response) {
 
    return response;
  },
 
  async function (error) {
    // console.log(error)
    if (error?.response?.status === 401) {
      // Clear authentication data from localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("userData");

      // Clear token from Redux store
      store.dispatch(setToken({ token: "" }));
      
      // Redirect to login page
      if(window.location.pathname !== "/login"){
        toast.error("Session expired, redirecting to login...");
        window.location.href = "/login";
      }
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
 
export default axiosFactoring;