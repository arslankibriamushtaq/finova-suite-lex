import { useEffect } from "react";
import { getToken } from "firebase/messaging";
import { messaging, VAPID_KEY } from "../firebase/config";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://148.251.185.111:8000";

export const useFcmRegistration = (jwt: string | null) => {
  useEffect(() => {
    if (!jwt) return;

    (async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          console.warn("[FCM] Notification permission denied");
          return;
        }

        const fcmToken = await getToken(messaging, { vapidKey: VAPID_KEY });
        if (!fcmToken) {
          console.warn("[FCM] No token received");
          return;
        }

        const res = await fetch(
          `${API_BASE}/notification-service/api/v1/devices/register`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${jwt}`,
            },
            body: JSON.stringify({
              customerId: "admin_global",
              fcmToken,
            }),
          }
        );

        if (!res.ok) throw new Error(`Register failed: ${res.status}`);
        console.log("[FCM] Token registered for admin_global");
      } catch (err) {
        console.error("[FCM] Registration error:", err);
      }
    })();
  }, [jwt]);
};
