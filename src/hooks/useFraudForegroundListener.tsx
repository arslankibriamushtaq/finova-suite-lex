import { useEffect } from "react";
import { onMessage } from "firebase/messaging";
import { messaging } from "../firebase/config";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export const useFraudForegroundListener = () => {
  const navigate = useNavigate();

  useEffect(() => {
    return onMessage(messaging, (payload) => {
      const eventType = payload.data?.eventType;
      const isCritical = eventType === "FRAUD_CHECK_FAILED" || eventType === "SUSPICIOUS_ACTIVITY";

      toast(payload.notification?.title || "Notification", {
        duration: isCritical ? 15000 : 5000,
        // Style can be adjusted here if needed, react-hot-toast uses a different style prop
        style: isCritical ? { border: '1px solid #dc2626', background: '#fef2f2' } : {},
      });

      // If you want a more custom toast with an action button, react-hot-toast supports JSX
      if (payload.data?.customerId) {
        toast((t) => (
            <span>
              <b>{payload.notification?.title}</b>
              <p>{payload.notification?.body}</p>
              <button 
                onClick={() => {
                    navigate(`/fraud-alerts/${payload.data!.customerId}`);
                    toast.dismiss(t.id);
                }}
                className="ml-2 px-2 py-1 bg-blue-500 text-white rounded text-xs"
              >
                View
              </button>
            </span>
          ), {
            duration: isCritical ? 15000 : 5000,
          });
      }
    });
  }, [navigate]);
};
