import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  createCheckout,
  getPaymentStatus,
  toTenantSignupError,
} from "../../../redux/apis/apisTenantProvisioning";
import {
  getReferenceNo,
  getSignupId,
  getSummary,
  setOrderId,
  setReferenceNo,
} from "../../../utils/tenantSignupSession";
import StatusMessage from "../components/StatusMessage";
import StepCard from "../components/StepCard";
import SubmitButton from "../components/SubmitButton";
import { TENANT_SIGNUP_ROUTES } from "../navigation";

/**
 * Where BurqPay sends the customer back to.
 *
 * This screen deliberately does NOT confirm anything. BurqPay reports the
 * outcome by POSTing our backend, and that call is independent of the redirect
 * — it routinely lands a moment after the browser does. A page that read the
 * status once and declared failure would be wrong most of the time.
 *
 * So it polls, and treats "not paid yet" as the expected first answer right up
 * until the ceiling. Only then is it failure.
 */

const POLL_INTERVAL_MS = 2000;
const POLL_CEILING_MS = 60_000;

export default function PaymentReturnStep() {
  const { t } = useTranslation("tenantSignup");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // The reference is normally in session storage, but the customer may come
  // back in a fresh tab — so a `ref` on the return URL wins if it is there.
  const [referenceNo] = useState(
    () => searchParams.get("ref") || getReferenceNo()
  );
  const [signupId] = useState(getSignupId);
  const [summary] = useState(getSummary);

  const [failedMessage, setFailedMessage] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  const startedAtRef = useRef(Date.now());

  useEffect(() => {
    if (!referenceNo) {
      navigate(TENANT_SIGNUP_ROUTES.pricing, { replace: true });
      return;
    }

    // The reference may have arrived only on the URL — the gateway hands the
    // browser back with `?ref=`, and that redirect can land in a context where
    // session storage was never written. Persist it so the provisioning screen
    // and the failure card have it without threading it through the route.
    setReferenceNo(referenceNo);

    let live = true;
    let timer: number | undefined;

    const poll = async () => {
      try {
        const status = await getPaymentStatus(referenceNo);
        if (!live) return;

        if (status.paid) {
          navigate(
            `${TENANT_SIGNUP_ROUTES.provisioning}?ref=${encodeURIComponent(referenceNo)}`,
            { replace: true }
          );
          return;
        }

        // Not paid *yet*. The distinction between "the gateway has not
        // answered" and "the card was declined" is only ever carried in a
        // localized `message`, and §8 of the contract is explicit that message
        // text is not something to branch on. So the clock decides instead:
        // keep waiting until the ceiling, then show whatever the server last
        // said.
        if (Date.now() - startedAtRef.current > POLL_CEILING_MS) {
          setFailedMessage(status.message || t("payment.notCompleted"));
          return;
        }

        timer = window.setTimeout(poll, POLL_INTERVAL_MS);
      } catch (err) {
        if (!live) return;

        if (Date.now() - startedAtRef.current > POLL_CEILING_MS) {
          setFailedMessage(
            toTenantSignupError(err, t("common.error.generic")).message
          );
          return;
        }

        timer = window.setTimeout(poll, POLL_INTERVAL_MS);
      }
    };

    void poll();

    return () => {
      live = false;
      if (timer) window.clearTimeout(timer);
    };
  }, [referenceNo, navigate, t]);

  /** A retry needs a NEW BurqPay page; the spent checkout would only fail again. */
  const payAgain = useCallback(async () => {
    if (!signupId) {
      navigate(TENANT_SIGNUP_ROUTES.payment);
      return;
    }

    setRetrying(true);

    try {
      const session = await createCheckout(
        signupId,
        `checkout-${signupId}-${Date.now()}`
      );
      setOrderId(session.orderId);
      window.location.assign(session.checkoutUrl);
    } catch (err) {
      setFailedMessage(
        toTenantSignupError(err, t("payment.checkoutFailed")).message
      );
      setRetrying(false);
    }
  }, [signupId, navigate, t]);

  if (!referenceNo) return null;

  if (failedMessage) {
    return (
      <StepCard title={t("payment.notCompletedTitle")}>
        <div className="space-y-4">
          <StatusMessage tone="warning">{failedMessage}</StatusMessage>
          <p className="ts-xs ts-num text-muted-foreground">
            {t("payment.reference", { ref: referenceNo })}
          </p>
          <SubmitButton
            type="button"
            loading={retrying}
            loadingLabel={t("payment.opening")}
            onClick={() => void payAgain()}
          >
            {t("payment.tryAnotherCard")}
          </SubmitButton>
        </div>
      </StepCard>
    );
  }

  return (
    <StepCard title={t("payment.confirmingTitle")} description={t("payment.confirmingSub")}>
      <div className="space-y-4 py-6 text-center">
        <Loader2
          className="mx-auto size-8 animate-spin text-[var(--primary)]"
          aria-hidden="true"
          role="status"
          aria-label={t("payment.confirming")}
        />
        <p className="ts-xs ts-num text-muted-foreground">
          {t("payment.reference", { ref: summary?.referenceNo ?? referenceNo })}
        </p>
      </div>
    </StepCard>
  );
}
