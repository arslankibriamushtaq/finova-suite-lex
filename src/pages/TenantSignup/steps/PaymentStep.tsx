import { Clock, ExternalLink, Loader2, Lock } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import {
  createCheckout,
  toTenantSignupError,
} from "../../../redux/apis/apisTenantProvisioning";
import {
  getSignupId,
  getSummary,
  setOrderId,
} from "../../../utils/tenantSignupSession";
import StatusMessage from "../components/StatusMessage";
import StepCard from "../components/StepCard";
import SubmitButton from "../components/SubmitButton";
import { formatDateTime, formatMoney } from "../format";
import { TENANT_SIGNUP_ROUTES } from "../navigation";

/**
 * Screen 3 — hand the customer over to BurqPay.
 *
 * There is no payment form here and no card field anywhere in this app: BurqPay
 * is a hosted checkout, so the entire integration is "open a checkout, send the
 * browser to `checkoutUrl`". Whether the money moved is decided by BurqPay
 * POSTing the outcome to our backend, not by anything that happens in this tab
 * — which is why the return page (§6) polls rather than confirms.
 *
 * The redirect is behind a button rather than automatic. The amount and the
 * quote expiry are the last thing we owe the buyer before they leave for a
 * third-party domain, and a page that throws them there on mount also makes the
 * back button a trap.
 */
export default function PaymentStep() {
  const { t } = useTranslation("tenantSignup");
  const navigate = useNavigate();

  // Read once, not per render: these come from sessionStorage, and a fresh
  // object identity every render would re-fire the effects below.
  const [summary] = useState(getSummary);
  const [signupId] = useState(getSignupId);

  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [opening, setOpening] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [terminal, setTerminal] = useState<
    "expired" | "invalidState" | "aboveLimit" | null
  >(null);

  // React StrictMode mounts effects twice in development; without this the
  // screen would open two checkouts on every load.
  const startedRef = useRef(false);

  useEffect(() => {
    if (!signupId || !summary) {
      navigate(TENANT_SIGNUP_ROUTES.pricing, { replace: true });
    }
  }, [signupId, summary, navigate]);

  /**
   * `idempotencyKey` is left to default on the first attempt, so a refresh or a
   * back button re-enters the checkout already open. A retry after a failed
   * payment passes a fresh key on purpose — that customer needs a new BurqPay
   * page, and the spent one would only fail again.
   */
  const openCheckout = useCallback(
    async (freshKey = false) => {
      if (!signupId) return;

      setOpening(true);
      setMessage(null);
      setTerminal(null);

      try {
        const session = await createCheckout(
          signupId,
          freshKey ? `checkout-${signupId}-${Date.now()}` : undefined
        );

        setOrderId(session.orderId);
        setCheckoutUrl(session.checkoutUrl);
      } catch (err) {
        const error = toTenantSignupError(err, t("payment.checkoutFailed"));

        switch (error.code) {
          case "TENANCY.SIGNUP.QUOTE_EXPIRED":
            // Prices may have moved in the 72 hours since the form. Retrying
            // the payment cannot help; only a new signup can.
            setTerminal("expired");
            setMessage(t("payment.quoteExpired"));
            break;
          case "TENANCY.SIGNUP.INVALID_STATE":
            setTerminal("invalidState");
            setMessage(t("payment.invalidState"));
            break;
          case "TENANCY.PAYMENT.AMOUNT_ABOVE_GATEWAY_LIMIT":
            // The basket is worth more than BurqPay will take in one checkout.
            // A fresh key buys nothing — only a smaller selection or monthly
            // billing can, so this offers the form rather than a retry.
            setTerminal("aboveLimit");
            setMessage(t("payment.aboveGatewayLimit"));
            break;
          default:
            setMessage(error.message);
        }
      } finally {
        setOpening(false);
      }
    },
    [signupId, t]
  );

  useEffect(() => {
    if (!signupId || startedRef.current) return;
    startedRef.current = true;
    void openCheckout();
  }, [signupId, openCheckout]);

  if (!summary) return null;

  return (
    <StepCard title={t("payment.title")} description={t("payment.sub")}>
      <div className="space-y-6">
        {/* The last thing the buyer reads before they leave for a hosted
            checkout on someone else's domain, so it states the figure, what it
            is against, and how long it stands. Two bands rather than four rows
            of equal weight: the amount is the decision, the reference and the
            hold are the small print under it. */}
        <dl className="ts-pay-panel">
          <div className="ts-pay-head">
            <dt className="ts-caps">{t("payment.amountDue")}</dt>
            <dd className="ts-pay-total">
              {formatMoney(summary.totalAmount, summary.currency)}
            </dd>
          </div>

          <div className="ts-pay-meta">
            <div className="min-w-0">
              <dt className="ts-caps">{t("payment.referenceLabel")}</dt>
              {/* Monospace because this is the string a buyer reads back to
                  support over the phone. */}
              <dd className="mt-1 break-all font-mono text-[13px] text-foreground">
                {summary.referenceNo}
              </dd>
            </div>

            {summary.expiresAt ? (
              <div className="min-w-0 sm:text-end">
                <dt className="ts-caps">{t("payment.holdLabel")}</dt>
                <dd className="mt-1 flex items-center gap-1.5 text-[13px] font-medium text-foreground sm:justify-end">
                  <Clock className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                  {formatDateTime(summary.expiresAt)}
                </dd>
              </div>
            ) : null}
          </div>
        </dl>

        {message ? <StatusMessage>{message}</StatusMessage> : null}

        {terminal === "expired" || terminal === "aboveLimit" ? (
          <SubmitButton
            type="button"
            onClick={() => navigate(TENANT_SIGNUP_ROUTES.pricing)}
          >
            {t("payment.startOver")}
          </SubmitButton>
        ) : terminal === "invalidState" ? (
          <SubmitButton
            type="button"
            onClick={() => navigate(TENANT_SIGNUP_ROUTES.provisioning)}
          >
            {t("payment.checkStatus")}
          </SubmitButton>
        ) : opening ? (
          <p
            role="status"
            className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground"
          >
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            {t("payment.opening")}
          </p>
        ) : checkoutUrl ? (
          <div className="space-y-3">
            <SubmitButton
              type="button"
              onClick={() => window.location.assign(checkoutUrl)}
            >
              <ExternalLink className="size-4" aria-hidden="true" />
              {t("payment.payAmount", {
                amount: formatMoney(summary.totalAmount, summary.currency),
              })}
            </SubmitButton>
            <p className="ts-xs text-center text-muted-foreground">
              {t("payment.leavingNote")}
            </p>
          </div>
        ) : (
          <SubmitButton type="button" onClick={() => void openCheckout(true)}>
            {t("common.retry")}
          </SubmitButton>
        )}

        <p className="flex items-center justify-center gap-1.5 border-t border-[var(--surface-border)] pt-4 text-xs text-muted-foreground">
          <Lock className="size-3 shrink-0" aria-hidden="true" />
          {t("shell.support")}
        </p>
      </div>
    </StepCard>
  );
}
