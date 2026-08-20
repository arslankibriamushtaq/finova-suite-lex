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
import { getPermissionByRole, getPermissionsForCaller } from "../../redux/apis/apisCrudFactoring";
import { getLandingRoute, isSuperAdminFromToken } from "../../utils/getLandingRoute";
import { getAllModulesFromPermissionData } from "../../hooks/useProductPermissions";
import { lexModulesForRoles } from "../../utils/lexRoleGrants";

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
        const superAdmin = isSuperAdminFromToken(decodedToken);
        let loadedPermissions: any[] = [];
        try {
          const roleId = userData?.roleId || decodedToken?.role || decodedToken?.roleId;
          if (roleId) {
            const permissionRes = await getPermissionByRole(roleId);
            // `/v1/permissions` answers as a bare array for some roles and as
            // `{ los: [...] }` for others. Only the array was being stored, so a
            // role served the other shape landed with zero permissions and every
            // gated module hidden — which reads as "nothing was granted".
            const permissions = getAllModulesFromPermissionData(permissionRes?.data?.data);
            if (permissions.length > 0) {
              loadedPermissions = permissions;
              dispatch(setPermissions(permissions));
              localStorage.setItem("permissions", JSON.stringify(permissions));
            }
          } else if (superAdmin) {
            // Super admin has no role row by design and is granted everything
            // from the realm role — clear permissions so the sidebar shows all.
            dispatch(setPermissions([]));
            localStorage.removeItem("permissions");
          } else {
            // A Keycloak-only account: real permissions, but `roleId: null`, so
            // there is no id to ask `/permissions/role/{id}` about. Ask the
            // server what *this caller* may do instead of clearing the store —
            // clearing it hid every gated module and looked exactly like a user
            // who had been granted nothing.
            let permissions: any[] = [];
            try {
              const callerRes = await getPermissionsForCaller();
              permissions = getAllModulesFromPermissionData(callerRes?.data?.data);
            } catch {
              // Falls through to the realm-role seed below.
            }
            if (permissions.length === 0) {
              // Last resort, LEX only: mirror the grants the migration records
              // for `lex_underwriter_*`. This restores the menu, never access —
              // Casbin still refuses on the server for every call these screens
              // make.
              permissions = lexModulesForRoles(decodedToken?.realm_access?.roles);
            }
            loadedPermissions = permissions;
            dispatch(setPermissions(permissions));
            if (permissions.length > 0) {
              localStorage.setItem("permissions", JSON.stringify(permissions));
            } else {
              localStorage.removeItem("permissions");
            }
          }
        } catch {
          // Continue even if permissions fail
        }

        // Cleanup
        sessionStorage.removeItem("sso_state");

        toast.success("Login Successful");
        // Land on the wallet dashboard only if permitted; otherwise the first
        // sidebar page the user has permission for.
        navigate(getLandingRoute(loadedPermissions, superAdmin), { replace: true });
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
            borderRadius: "2px",
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
