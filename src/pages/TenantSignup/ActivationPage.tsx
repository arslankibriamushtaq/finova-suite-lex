import { Check, Eye, EyeOff, Loader2, PartyPopper, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

import { Images } from "../../components/Config/Images";
import { Input } from "../../components/ui/input";
import { cn } from "../../lib/utils";
import {
  activateTenant,
  previewActivation,
  toTenantSignupError,
  type ActivationPreview,
  type ActivationResult,
} from "../../redux/apis/apisTenantProvisioning";
import FormRow from "./components/FormRow";
import StatusMessage from "./components/StatusMessage";
import StepCard from "./components/StepCard";
import SubmitButton from "./components/SubmitButton";

/**
 * Screen 5 — the activation link from the invitation email.
 *
 * Reached at `/activate?token=…`, days after the purchase and usually on a
 * different device, so it shares nothing with the signup flow's session — the
 * token in the URL is the entire context.
 *
 * This path is configured server-side as `PLATFORM_WEB_BASE_URL` +
 * `PLATFORM_SET_PASSWORD_PATH`. If it moves, the backend must move with it, or
 * every invitation email sent since points at a 404.
 */

/** Mirrors the server's policy, which is enforced regardless. */
const PASSWORD_RULES = [
  { key: "length", test: (value: string) => value.length >= 12 },
  { key: "upper", test: (value: string) => /[A-Z]/.test(value) },
  { key: "lower", test: (value: string) => /[a-z]/.test(value) },
  { key: "digit", test: (value: string) => /\d/.test(value) },
  {
    key: "special",
    test: (value: string) => /[^A-Za-z0-9]/.test(value),
  },
] as const;

export default function ActivationPage() {
  const { t } = useTranslation("tenantSignup");
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [preview, setPreview] = useState<ActivationPreview | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [alreadyUsed, setAlreadyUsed] = useState(false);
  const [result, setResult] = useState<ActivationResult | null>(null);

  // Check the token BEFORE rendering the password form. Asking someone to type
  // a password into a form that is going to be rejected is the worst version
  // of this screen — and here it would also burn one of five attempts.
  useEffect(() => {
    if (!token) {
      setChecking(false);
      setPreview({ valid: false, email: null, companyName: null, reason: null });
      return;
    }

    let live = true;

    previewActivation(token)
      .then((data) => live && setPreview(data))
      .catch((err) => {
        if (!live) return;
        const error = toTenantSignupError(err, t("common.error.generic"));

        // An already-redeemed link is a success story told badly: point at
        // login rather than at an error.
        if (error.code === "TENANCY.ACTIVATION.TOKEN_USED") {
          setAlreadyUsed(true);
        } else {
          setPreviewError(error.message);
        }
        setPreview({ valid: false, email: null, companyName: null, reason: null });
      })
      .finally(() => live && setChecking(false));

    return () => {
      live = false;
    };
  }, [token, t]);

  const failedRules = useMemo(
    () => PASSWORD_RULES.filter((rule) => !rule.test(password)),
    [password]
  );

  const mismatch = submitted && confirmPassword !== password;

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    setSubmitError(null);

    // Client-side first, deliberately: a server-rejected password counts as a
    // failed attempt, and five failures void the link permanently. This is one
    // of the rare cases where duplicated validation protects the user rather
    // than just saving a round trip.
    if (failedRules.length > 0 || confirmPassword !== password) return;

    setSubmitting(true);

    try {
      setResult(await activateTenant({ token, password }));
    } catch (err) {
      const error = toTenantSignupError(err, t("common.error.generic"));

      if (error.code === "TENANCY.ACTIVATION.TOKEN_USED") {
        setAlreadyUsed(true);
      } else {
        setSubmitError(error.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Shell>
      {checking ? (
        <p
          role="status"
          className="flex items-center justify-center gap-2 py-20 text-sm text-muted-foreground"
        >
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          {t("act.checking")}
        </p>
      ) : result ? (
        <StepCard title={t("act.success.title")}>
          <div className="space-y-5 text-center">
            <PartyPopper
              className="mx-auto size-10 text-[var(--primary)]"
              aria-hidden="true"
            />
            <p className="text-sm leading-relaxed">
              {t("act.success.body", {
                company: preview?.companyName ?? result.tenantCode,
                email: result.email,
              })}
            </p>
            <SubmitButton
              type="button"
              onClick={() => window.location.assign(result.loginUrl)}
            >
              {t("act.goToLogin")}
            </SubmitButton>
          </div>
        </StepCard>
      ) : alreadyUsed ? (
        <StepCard title={t("act.used.title")} description={t("act.used.body")}>
          <SubmitButton
            type="button"
            onClick={() => window.location.assign("/login")}
          >
            {t("act.goToLogin")}
          </SubmitButton>
        </StepCard>
      ) : preview && !preview.valid ? (
        <StepCard title={t("act.invalid.title")}>
          {/* `reason` is the server's human explanation — not valid, expired,
              or already used — and is localized by Accept-Language. */}
          <StatusMessage>
            {preview.reason || previewError || t("act.expired.body")}
          </StatusMessage>
        </StepCard>
      ) : (
        <StepCard
          title={t("act.title")}
          description={t("act.sub", {
            company: preview?.companyName ?? "",
            email: preview?.email ?? "",
          })}
        >
          <form onSubmit={onSubmit} noValidate className="space-y-5">
            <FormRow
              id="password"
              label={t("act.password")}
              required
              error={submitted && failedRules.length > 0 ? " " : null}
            >
              <div className="relative">
                <Input
                  id="password"
                  type={revealed ? "text" : "password"}
                  dir="ltr"
                  autoComplete="new-password"
                  value={password}
                  aria-invalid={submitted && failedRules.length > 0}
                  aria-describedby="password-rules"
                  onChange={(e) => setPassword(e.target.value)}
                  className="pe-10"
                />
                <button
                  type="button"
                  onClick={() => setRevealed((r) => !r)}
                  aria-label={revealed ? t("act.hide") : t("act.show")}
                  className="ts-link absolute inset-y-0 end-0 flex items-center px-3 text-muted-foreground"
                >
                  {revealed ? (
                    <EyeOff className="size-4" aria-hidden="true" />
                  ) : (
                    <Eye className="size-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </FormRow>

            <div id="password-rules" className="space-y-1.5">
              <p className="ts-xs text-muted-foreground">{t("act.rules")}</p>
              <ul className="space-y-1">
                {PASSWORD_RULES.map((rule) => {
                  const met = rule.test(password);
                  return (
                    <li
                      key={rule.key}
                      className={cn(
                        "ts-xs flex items-center gap-1.5",
                        met
                          ? "text-[var(--color-success-text)]"
                          : "text-muted-foreground"
                      )}
                    >
                      <Check
                        className={cn("size-3.5", met ? "opacity-100" : "opacity-30")}
                        aria-hidden="true"
                      />
                      {t(`act.rule.${rule.key}`)}
                    </li>
                  );
                })}
              </ul>
            </div>

            <FormRow
              id="confirmPassword"
              label={t("act.confirmPassword")}
              required
              error={mismatch ? t("act.mismatch") : null}
            >
              <Input
                id="confirmPassword"
                type={revealed ? "text" : "password"}
                dir="ltr"
                autoComplete="new-password"
                value={confirmPassword}
                aria-invalid={mismatch}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </FormRow>

            {submitError ? <StatusMessage>{submitError}</StatusMessage> : null}

            <p className="ts-xs text-muted-foreground">
              {t("act.attemptsWarning")}
            </p>

            <SubmitButton loading={submitting} loadingLabel={t("act.submitting")}>
              {t("act.submit")}
            </SubmitButton>
          </form>
        </StepCard>
      )}
    </Shell>
  );
}

/**
 * Its own shell rather than the signup layout's: there is no stepper to show
 * (this is not step five of anything the buyer is currently doing) and no
 * signup context to provide.
 */
function Shell({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation("tenantSignup");

  return (
    <div className="tenant-signup flex min-h-screen flex-col bg-[var(--color-surface-page)] text-foreground">
      <header className="border-b border-[color-mix(in_srgb,var(--primary)_12%,var(--surface-border))] bg-[var(--surface-card)]">
        <div className="mx-auto flex h-16 w-full max-w-2xl items-center px-[1.25rem] sm:px-8">
          <img
            src={Images.DashboardLogo}
            alt={t("shell.brandAlt")}
            className="h-8 w-auto"
          />
        </div>
      </header>

      <main className="mx-auto w-full max-w-xl flex-1 px-[1.25rem] py-10 sm:px-8 sm:py-14">
        {children}
      </main>

      <footer className="px-[1.25rem] pb-10 sm:px-8">
        <p className="mx-auto flex max-w-xl items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5 shrink-0" aria-hidden="true" />
          {t("shell.footer")}
        </p>
      </footer>
    </div>
  );
}
