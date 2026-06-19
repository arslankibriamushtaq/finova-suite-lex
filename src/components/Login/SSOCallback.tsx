import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { useDispatch } from "react-redux";
import {
  setToken,
  setRefreshToken,
  setPermissions,
} from "../../redux/apis/apisSlice";
import Loader from "../Loader/Loader";
import { getPermissionByRole } from "../../redux/apis/apisCrudFactoring";

const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
};

const SSOCallback: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const exchangeCode = async () => {
      const code = searchParams.get("code");
      const state = searchParams.get("state");

      if (!code) {
        setError("Authorization code not found.");
        return;
      }

      // Verify state matches what we stored
      const savedState = sessionStorage.getItem("sso_state");
      if (state && savedState && state !== savedState) {
        setError("Invalid state parameter. Please try logging in again.");
        return;
      }

      try {
        const ssoBaseUrl = import.meta.env.VITE_API_BASE_URL;
        const res = await axios.post(
          `${ssoBaseUrl}/identity-service/api/v1/auth/sso/token`,
          { code, state }
        );

        const data = res.data?.data;
        if (!data?.accessToken) {
          setError("Failed to retrieve access token.");
          return;
        }

        // Store tokens
        dispatch(setToken({ token: data.accessToken }));
        localStorage.setItem("token", data.accessToken);

        if (data.refreshToken) {
          dispatch(setRefreshToken({ refreshToken: data.refreshToken }));
        }

        // Decode JWT to get user information
        const decodedToken = decodeJWT(data.accessToken);
        
        const userData = {
          ...data,
          user: decodedToken,
        };

        localStorage.setItem("userData", JSON.stringify(userData));

        // Fetch permissions by roleId
        try {
          const roleId = userData?.roleId || decodedToken?.role || decodedToken?.roleId;
          if (roleId) {
            const permissionRes = await getPermissionByRole(roleId);
            const permissions = permissionRes?.data?.data;
            if (Array.isArray(permissions)) {
              dispatch(setPermissions(permissions));
              localStorage.setItem("permissions", JSON.stringify(permissions));
            }
          } else {
            // No roleId (e.g. super_admin) — clear permissions so sidebar shows all items
            dispatch(setPermissions([]));
            localStorage.removeItem("permissions");
          }
        } catch {
          // Continue even if permissions fail
        }

        // Cleanup
        sessionStorage.removeItem("sso_state");

        toast.success("Login Successful");
        navigate("/LOS/Wallet/Home", { replace: true });
      } catch (err: any) {
        const message =
          err?.response?.data?.message || "SSO authentication failed.";
        setError(message);
      }
    };

    exchangeCode();
  }, []);

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          gap: "16px",
        }}
      >
        <p style={{ color: "#ff4d4f", fontSize: "16px" }}>{error}</p>
        <button
          onClick={() => navigate("/login", { replace: true })}
          style={{
            padding: "10px 24px",
            backgroundColor: "var(--primary, #1963b9)",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Back to Login
        </button>
      </div>
    );
  }

  return <Loader />;
};

export default SSOCallback;
