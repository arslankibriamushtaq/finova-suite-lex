import Axios from "axios";
import { store } from "../redux/store";
import { setToken } from "../redux/apis/apisSlice";
import { v4 as uuidv4 } from 'uuid'
import toast from "react-hot-toast";
const axiosLms = Axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  // withCredentials: true,
});
// let tokenValue = localStorage.getItem("awn-token");
axiosLms.interceptors.request.use((reqConfig) => {
  const config = { ...reqConfig };
  const token = (store.getState() as any).block.token;
  // console.log("Trying to add token")
  // if (!config.headers["Authorization"]) {
 
 
    // console.log(accessToken);
    // if (accessToken && accessToken !== "undefined") {
    //   config.headers["Authorization"] = `Bearer ${tokenValue}`;
     config.headers["Authorization"] = `Bearer ${token}`;
      // config.headers["Authorization"] = `Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjQ4QTRGRTg4MzA0RkZFNjI1RTJFN0RFNzk4NjFFQTFEIiwidHlwIjoiYXQrand0In0.eyJuYmYiOjE3NjAxMDE5MjMsImV4cCI6MTc2MDEwNTUyMywiaXNzIjoiaHR0cHM6Ly9kZXYtc2VjLmF3bi1zYS5jb20vIiwiYXVkIjoiaHR0cHM6Ly9kZXYtc2VjLmF3bi1zYS5jb20vcmVzb3VyY2VzIiwiY2xpZW50X2lkIjoiODE5MTUyN2UtMDJkNC00ZWVjLTlkNjUtODk2MDI3MTA3NzhkIiwic3ViIjoiNjYwYzM0NjItZDFhYy00NGY0LWIwNWItNTQ2Y2U3NzllNTJkIiwiYXV0aF90aW1lIjoxNzU5OTI0ODA2LCJpZHAiOiJsb2NhbCIsInJvbGUiOiJTdXBlciBBZG1pbiIsInVzZXJOYW1lIjoic2hhaGlkIiwiVGVuYW50SWQiOiIxMTExMTExMS0yMjIyLTMzMzMtNDQ0NC01NTU1NTU1NTU1NTUiLCJDb21wYW55TmFtZSI6IkF3biIsImp0aSI6IjkxOUYwNUU4N0U0NkY1NzJBQzhERDk5MzA1MzU1OUFGIiwic2lkIjoiODlCNDYxNTQwQ0VBOTg0RDE2OUE1RTczMjgyMUQyMTYiLCJpYXQiOjE3NjAxMDE5MjMsInNjb3BlIjpbIm9wZW5pZCIsInByb2ZpbGUiLCJyb2xlIiwibG1zIl0sImFtciI6WyJwd2QiXX0.s1mpOOlLM5l2ISey1JJq9O0lZHOMTE1atBnWD2jO9sMPrcadexpRjbUjjdgPvew7jGNCK8tN6e_G0IixTzHRxG-aEaIcL3xBhZzPXincmtdkL9nZ7MtiykAFXHE8ntxSDXEil5JtBedE6RrD64BAgssPeIi6lRY44k5bEvctppwXSqYnlZrrpX8pxCs9IqvYRJ-bV2mPdJtuQAPXStd2d_MndGmhWKkpszGiFzhNhOWLMTScka5HEquCZUsDfbE1LRet2NlPiDIVSmlHd6gwbOm5v-NcOT_v8Fmc9RFdbkVL1omUTb1IWke-bmp9PWhs6mRB-q88E7Q1TjP6I3thSw`;
      // config.headers["Content-Type"] = "application/json";
      
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
 
axiosLms.interceptors.response.use(
  function (response) {
 
    return response;
  },
 
  async function (error) {
    // console.log(error)
    if (error?.response?.status === 401) {
      // Clear authentication data from localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      toast.error("Session expired, redirecting to login...");
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
 
export default axiosLms;