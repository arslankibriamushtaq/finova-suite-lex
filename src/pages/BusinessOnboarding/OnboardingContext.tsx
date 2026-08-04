import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";

import {
  getBusinessOnboardingStatus,
  type BusinessOnboardingStatus,
  type BusinessStepResponse,
} from "../../redux/apis/apisBusinessOnboarding";
import {
  clearSession,
  getSessionId,
  setSessionId as persistSessionId,
  setTokens,
} from "../../utils/businessOnboardingSession";
import { BUSINESS_ONBOARDING_ROUTES, routeForNextAction } from "./navigation";

/**
 * Shared state for the applicant journey.
 *
 * Screens read what earlier steps captured (masked mobile, required documents,
 * OCR fields) from here rather than passing router state around — a reload has
 * to work, and `GET /status` returns the whole picture, so rehydration is the
 * default path rather than a special case.
 */
interface BusinessOnboardingContextValue {
  sessionId: string | null;
  /** Everything captured so far — merged from `/status` and each step response. */
  data: BusinessOnboardingStatus;
  /** True while the first `/status` rehydration is in flight. */
  rehydrating: boolean;
  /** Merge a step response into the snapshot and persist session id + tokens. */
  applyStep: (res: BusinessStepResponse) => void;
  /** `applyStep`, then route on `nextAction`. The normal way to finish a step. */
  goNext: (res: BusinessStepResponse) => void;
  /** Pull a fresh `/status` (used after a hard reload or a slow upload). */
  refreshStatus: () => Promise<void>;
  /** Tear the local session down and return to the entry screen. */
  restart: () => void;
}

const BusinessOnboardingContext =
  createContext<BusinessOnboardingContextValue | undefined>(undefined);

export function BusinessOnboardingProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [sessionId, setSessionIdState] = useState<string | null>(() => getSessionId());
  const [data, setData] = useState<BusinessOnboardingStatus>({});
  const [rehydrating, setRehydrating] = useState<boolean>(() => Boolean(getSessionId()));

  // Guards the one-shot rehydration in StrictMode's double-invoked effects.
  const rehydratedRef = useRef(false);

  const applyStep = useCallback((res: BusinessStepResponse) => {
    if (!res) return;

    const nextSessionId = res.sessionId || res.workflowId;
    if (nextSessionId) {
      persistSessionId(nextSessionId);
      setSessionIdState(nextSessionId);
    }

    // `/verify-resume-pin` mints a fresh pair that must replace the old one.
    setTokens(res.accessToken, res.refreshToken);

    setData((prev) => {
      // A different session id means a different application — registering a
      // second business in the same tab must not inherit the first one's name,
      // documents or required-document list.
      const isSameApplication =
        !nextSessionId ||
        !prev.workflowId ||
        prev.workflowId === nextSessionId ||
        prev.sessionId === nextSessionId;

      return isSameApplication ? { ...prev, ...res } : { ...res };
    });
  }, []);

  const goNext = useCallback(
    (res: BusinessStepResponse) => {
      applyStep(res);

      // Without a nextAction the route falls back to the entry screen, which on
      // the entry screen looks exactly like a dead button. Say so out loud
      // rather than leaving it to be diagnosed from the outside.
      if (!res?.nextAction) {
        console.warn(
          "[business onboarding] step response carried no nextAction; " +
            "cannot advance. Response was:",
          res
        );
      }

      navigate(routeForNextAction(res?.nextAction));
    },
    [applyStep, navigate]
  );

  const refreshStatus = useCallback(async () => {
    const id = getSessionId();
    if (!id) return;
    try {
      const status = await getBusinessOnboardingStatus(id);
      setData((prev) => ({ ...prev, ...status }));
    } catch {
      // A dead session id is not worth an error screen — the guard in the shell
      // sends the user back to the start, where /initiate re-finds their flow.
    }
  }, []);

  const restart = useCallback(() => {
    clearSession();
    setSessionIdState(null);
    setData({});
    navigate(BUSINESS_ONBOARDING_ROUTES.start, { replace: true });
  }, [navigate]);

  useEffect(() => {
    if (rehydratedRef.current) return;
    rehydratedRef.current = true;

    if (!sessionId) {
      setRehydrating(false);
      return;
    }

    refreshStatus().finally(() => setRehydrating(false));
  }, [sessionId, refreshStatus]);

  const value = useMemo(
    () => ({ sessionId, data, rehydrating, applyStep, goNext, refreshStatus, restart }),
    [sessionId, data, rehydrating, applyStep, goNext, refreshStatus, restart]
  );

  return (
    <BusinessOnboardingContext.Provider value={value}>
      {children}
    </BusinessOnboardingContext.Provider>
  );
}

export function useBusinessOnboarding(): BusinessOnboardingContextValue {
  const ctx = useContext(BusinessOnboardingContext);
  if (!ctx) {
    throw new Error(
      "useBusinessOnboarding must be used inside <BusinessOnboardingProvider>"
    );
  }
  return ctx;
}
