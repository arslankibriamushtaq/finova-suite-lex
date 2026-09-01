import Axios from "axios";
import { attachAcceptLanguage } from "./acceptLanguage";
import { store } from "../redux/store";
import { clearAdminSession } from "./adminSession";
import { v4 as uuidv4 } from 'uuid'
import toast from "react-hot-toast";
import { redirectToLogin } from "./redirectToLogin";
const axiosFactoring = Axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}`,
});

// Fallback tenant used before login / if the JWT carries no tenant claim.
const DEFAULT_TENANT_ID = "550e8400-e29b-41d4-a716-446655440000";

// Derive the tenant from the access token's `tenant_id` claim rather than
// hardcoding it, so the header is correct per-tenant if the backend ever starts
// enforcing X-Tenant-Id (it is currently ignored). Falls back to the default on
// any decode failure, preserving today's behavior.
const getTenantId = (token?: string): string => {
  if (!token) return DEFAULT_TENANT_ID;
  try {
    const payload = token.split(".")[1];
    if (!payload) return DEFAULT_TENANT_ID;
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const claims = JSON.parse(json);
    return claims?.tenant_id || claims?.tenantId || DEFAULT_TENANT_ID;
  } catch {
    return DEFAULT_TENANT_ID;
  }
};
// let tokenValue = localStorage.getItem("awn-token");
axiosFactoring.interceptors.request.use((reqConfig) => {
  const config = { ...reqConfig };
  const token = (store.getState() as any).block.token;
  // console.log("Trying to add token")
  // if (!config.headers["Authorization"]) {
 
 
    // console.log(accessToken);
    // if (accessToken && accessToken !== "undefined") {
     config.headers["Authorization"] = `Bearer ${token}`;
     config.headers["Content-Type"] = "application/json";
     config.headers["X-Tenant-Id"] = getTenantId(token);
      // Let axios set Content-Type for FormData (multipart/form-data with boundary)
      if (!(config.data instanceof FormData)) {
        config.headers["Content-Type"] = "application/json";
      }
      // config.headers["Request-Id"] = uuidv4();
 
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

      void clearAdminSession();
      
      // Redirect to login page
      toast.error("Session expired, redirecting to login...");
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
 
attachAcceptLanguage(axiosFactoring);

export default axiosFactoring;