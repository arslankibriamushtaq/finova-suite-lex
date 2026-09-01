import { Loader2, MailCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  getSignupStatus,
  toTenantSignupError,
  type SignupStatus,
} from "../../../redux/apis/apisTenantProvisioning";
import { getReferenceNo, getSummary } from "../../../utils/tenantSignupSession";
import StatusMessage from "../components/StatusMessage";
import StepCard from "../components/StepCard";
import SubmitButton from "../components/SubmitButton";
import { TENANT_SIGNUP_ROUTES } from "../navigation";

/**
 * Screen 4 — the gap between "paid" and "ready".
 *
 * Confirming a payment returns as soon as the money is verified; the workspace
 * is built asynchronously afterwards. This screen exists because of that gap,
 * and its real job is the branches that are not the happy path: FAILED (the
 * money is taken and refundable, and saying so plainly beats a spinner) and the
 * ceiling (beyond ~90 seconds it is not a slow build, it is stuck).
 */

const POLL_INTERVAL_MS = 2500;
const POLL_CEILING_MS = 90_000;

/**
 * Statuses that mean "keep polling". `PAYMENT_IN_PROGRESS` is in here because
 * BurqPay's confirmation can land after the customer reaches this screen —
 * without it the poll would stop on a status that is neither done nor failed,
 * and the spinner would never resolve.
 */
const IN_FLIGHT: SignupStatus[] = [
  "PAYMENT_IN_PROGRESS",
  "PAID",
  "PROVISIONING",
];
const TERMINAL_DEAD_END: SignupStatus[] = ["EXPIRED", "CANCELLED"];

export default function ProvisioningStep() {
  const { t } = useTranslation("tenantSignup");
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  // As on the return page, a `ref` on the URL wins over session storage: the
  // gateway's hand-back carries one, and it is the only reference a buyer whose
  // storage was never written has.
  const [referenceNo] = useState(
    () => searchParams.get("ref") || getReferenceNo()
  );
  const [summary] = useState(getSummary);

  const [status, setStatus] = useState<SignupStatus | null>(null);
  const [failureReason, setFailureReason] = useState<string | null>(null);
  const [stalled, setStalled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startedAtRef = useRef(Date.now());

  useEffect(() => {
    if (!referenceNo) {
      navigate(TENANT_SIGNUP_ROUTES.pricing, { replace: true });
      return;
    }

    let live = true;
    let timer: number | undefined;

    const poll = async () => {
      try {
        const signup = await getSignupStatus(referenceNo);
        if (!live) return;

        setStatus(signup.status);
        setFailureReason(signup.failureReason);
        setError(null);

        if (!IN_FLIGHT.includes(signup.status)) return;

        if (Date.now() - startedAtRef.current > POLL_CEILING_MS) {
          setStalled(true);
          return;
        }

        timer = window.setTimeout(poll, POLL_INTERVAL_MS);
      } catch (err) {
        if (!live) return;

        // A blip mid-build should not look like a failed purchase, so the poll
        // keeps going and only the ceiling ends it.
        setError(toTenantSignupError(err, t("common.error.generic")).message);

        if (Date.now() - startedAtRef.current > POLL_CEILING_MS) {
          setStalled(true);
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

  if (!referenceNo) return null;

  const reference = t("prov.reference", { ref: referenceNo });

  // --- Done ---------------------------------------------------------------
  // COMPLETED does NOT mean they can sign in: the tenant stays inactive until
  // the activation link is redeemed. So there is no "go to login" button here
  // — the inbox instruction is the loudest thing on the screen.
  if (status === "COMPLETED") {
    return (
      <StepCard title={t("prov.done.title")}>
        <div className="space-y-5 text-center">
          <MailCheck
            className="mx-auto size-10 text-[var(--primary)]"
            aria-hidden="true"
          />
          <p className="text-sm leading-relaxed text-foreground">
            {t("prov.done.body", { email: summary?.adminEmail ?? "" })}
          </p>
          <p className="ts-xs text-muted-foreground">{t("prov.done.note")}</p>
          <p className="ts-xs ts-num text-muted-foreground">{reference}</p>
        </div>
      </StepCard>
    );
  }

  // --- Build failed --------------------------------------------------------
  if (status === "FAILED") {
    return (
      <StepCard title={t("prov.failed.title")}>
        <div className="space-y-4">
          {failureReason ? (
            <StatusMessage>{failureReason}</StatusMessage>
          ) : null}
          <StatusMessage tone="info">
            {t("prov.failed.refund", { ref: referenceNo })}
          </StatusMessage>
        </div>
      </StepCard>
    );
  }

  // --- Dead ends -----------------------------------------------------------
  if (status && TERMINAL_DEAD_END.includes(status)) {
    return (
      <StepCard
        title={t("prov.terminal.title")}
        description={t("prov.terminal.body")}
      >
        <SubmitButton
          type="button"
          onClick={() => navigate(TENANT_SIGNUP_ROUTES.pricing)}
        >
          {t("payment.startOver")}
        </SubmitButton>
      </StepCard>
    );
  }

  // --- Stuck ---------------------------------------------------------------
  if (stalled) {
    return (
      <StepCard title={t("prov.stalled.title")}>
        <StatusMessage tone="warning">
          {t("prov.stalled.body", { ref: referenceNo })}
        </StatusMessage>
      </StepCard>
    );
  }

  // --- Still building ------------------------------------------------------
  return (
    <StepCard title={t("prov.title")} description={t("prov.sub")}>
      <div className="space-y-4 py-6 text-center">
        <Loader2
          className="mx-auto size-8 animate-spin text-[var(--primary)]"
          aria-hidden="true"
          role="status"
          aria-label={t("prov.title")}
        />
        <p className="ts-xs ts-num text-muted-foreground">{reference}</p>
        {error ? (
          <p className="ts-xs text-muted-foreground">{error}</p>
        ) : null}
      </div>
    </StepCard>
  );
}
