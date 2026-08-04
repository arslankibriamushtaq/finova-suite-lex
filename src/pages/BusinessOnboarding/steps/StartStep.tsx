import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  getOnboardingCountries,
  initiateBusinessOnboarding,
  toBusinessOnboardingError,
  type CountryConfig,
} from "../../../redux/apis/apisBusinessOnboarding";
import { clearSession } from "../../../utils/businessOnboardingSession";
import FormRow from "../components/FormRow";
import StatusMessage from "../components/StatusMessage";
import StepCard from "../components/StepCard";
import SubmitButton from "../components/SubmitButton";
import { useBusinessOnboarding } from "../OnboardingContext";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_DIAL_CODE = "+966";

const REGIONAL_INDICATOR_A = 0x1f1e6;

/**
 * Recover the ISO alpha-2 code ("SA", "PK") from a flag emoji.
 *
 * The reference data only carries alpha-3 (`SAU`), but a flag emoji *is* its
 * alpha-2 code — two regional-indicator codepoints offset from 'A'. Decoding it
 * is how the field shows "SA" on purpose rather than as the Windows fallback
 * for a glyph it cannot draw.
 */
const alpha2FromFlag = (flag?: string): string | null => {
  if (!flag) return null;

  const letters = Array.from(flag).map(
    (char) => (char.codePointAt(0) ?? 0) - REGIONAL_INDICATOR_A
  );
  if (letters.length !== 2 || letters.some((n) => n < 0 || n > 25)) return null;

  return letters.map((n) => String.fromCharCode(65 + n)).join("");
};

interface DialOption {
  value: string;
  dialCode: string;
  /** ISO alpha-2 when it could be decoded, otherwise the alpha-3 from the API. */
  short: string;
  name: string;
}

/**
 * Flag artwork for one country, falling back to the country code as text when
 * the alpha-2 could not be resolved — a label always beats a blank box.
 */
function CountryFlag({ option }: { option?: DialOption }) {
  if (!option) return null;

  const isAlpha2 = option.short.length === 2;
  if (!isAlpha2) {
    return (
      <span className="w-6 shrink-0 text-xs font-medium text-muted-foreground">
        {option.short}
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`fi fi-${option.short.toLowerCase()} biz-flag shrink-0`}
    />
  );
}

export default function StartStep() {
  const { t, i18n } = useTranslation("businessOnboarding");
  const { goNext } = useBusinessOnboarding();

  const [countries, setCountries] = useState<CountryConfig[]>([]);
  const [dialCode, setDialCode] = useState(DEFAULT_DIAL_CODE);
  const [email, setEmail] = useState("");
  const [nationalNumber, setNationalNumber] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; mobile?: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [blocked, setBlocked] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isArabic = i18n.language?.startsWith("ar");

  useEffect(() => {
    let cancelled = false;
    getOnboardingCountries()
      .then((list) => {
        if (cancelled) return;
        const active = list.filter((c) => c.active !== false && c.dialCode);
        setCountries(active);
      })
      .catch(() => {
        // Reference data is a convenience here — the field still accepts a
        // full international number typed by hand.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Several countries share a dial code (+1), so options are keyed by country
   * code. The flag emoji itself is never rendered — Windows has no
   * regional-indicator glyphs — only decoded into its alpha-2 label.
   */
  const dialOptions = useMemo(
    () =>
      countries.map((country) => ({
        value: country.countryCode,
        dialCode: country.dialCode as string,
        short: alpha2FromFlag(country.flagEmoji) ?? country.countryCode,
        name:
          isArabic && country.countryNameAr
            ? country.countryNameAr
            : country.countryName,
      })),
    [countries, isArabic]
  );

  const selectedCountryCode =
    dialOptions.find((option) => option.dialCode === dialCode)?.value ?? "";
  const selectedOption = dialOptions.find(
    (option) => option.value === selectedCountryCode
  );

  const validate = (): boolean => {
    const errors: { email?: string; mobile?: string } = {};

    if (!EMAIL_PATTERN.test(email.trim())) {
      errors.email = t("start.error.email");
    }

    const digits = nationalNumber.replace(/\D/g, "");
    const full = `${dialCode.replace(/\D/g, "")}${digits}`;
    if (full.length < 7 || full.length > 15) {
      errors.mobile = t("start.error.mobile");
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitError(null);
    setBlocked(null);
    if (!validate()) return;

    const mobileNumber = `${dialCode}${nationalNumber.replace(/\D/g, "")}`;

    setSubmitting(true);
    try {
      // Drop any stale session/token first: /initiate needs no auth, and a
      // leftover expired bearer from an abandoned attempt would only 401.
      clearSession();

      const res = await initiateBusinessOnboarding({
        email: email.trim(),
        mobileNumber,
      });

      // A 200 can still be a refusal — the risk gate reports it in the body.
      if (res.status === "BLOCKED") {
        setBlocked(res.failureReason || t("start.error.blocked"));
        return;
      }

      // No session means there is nothing to continue with. Routing on it would
      // land back on this very screen and read as a button that does nothing.
      if (!res.sessionId && !res.workflowId) {
        setSubmitError(t("common.error.generic"));
        return;
      }

      goNext(res);
    } catch (err) {
      const error = toBusinessOnboardingError(err, t("common.error.generic"));
      setSubmitError(
        error.code === "ONBOARDING.BUSINESS.ALREADY_REGISTERED"
          ? t("start.error.alreadyRegistered")
          : error.message
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <StepCard title={t("start.title")} description={t("start.description")}>
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <FormRow
          id="biz-email"
          label={t("start.field.email")}
          required
          hint={t("start.hint.email")}
          error={fieldErrors.email}
        >
          <Input
            id="biz-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="owner@example.com"
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? "biz-email-error" : "biz-email-hint"}
            disabled={submitting}
          />
        </FormRow>

        <FormRow
          id="biz-mobile"
          label={t("start.field.mobile")}
          required
          hint={t("start.hint.mobile")}
          error={fieldErrors.mobile}
        >
          <div className="flex gap-2">
            <Select
              value={selectedCountryCode}
              onValueChange={(countryCode) => {
                const match = dialOptions.find((o) => o.value === countryCode);
                if (match) setDialCode(match.dialCode);
              }}
              disabled={submitting || dialOptions.length === 0}
            >
              {/* Alpha-2 + dial code: a full country name never fits beside a
                  phone field, and those two are what the applicant is actually
                  confirming. Names live in the open list. */}
              <SelectTrigger
                className="biz-dial-trigger"
                aria-label={t("start.field.dialCode")}
              >
                <SelectValue placeholder={dialCode}>
                  <span dir="ltr" className="flex items-center gap-2">
                    <CountryFlag option={selectedOption} />
                    <span className="tabular-nums">{dialCode}</span>
                    <span className="sr-only">{selectedOption?.name}</span>
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {dialOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <span className="flex w-full items-center gap-2" dir="ltr">
                      <CountryFlag option={option} />
                      <span className="w-12 shrink-0 tabular-nums text-muted-foreground">
                        {option.dialCode}
                      </span>
                      <span className="truncate">{option.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              id="biz-mobile"
              type="tel"
              dir="ltr"
              inputMode="numeric"
              value={nationalNumber}
              onChange={(e) => setNationalNumber(e.target.value)}
              autoComplete="tel-national"
              placeholder="500000000"
              aria-invalid={Boolean(fieldErrors.mobile)}
              aria-describedby={
                fieldErrors.mobile ? "biz-mobile-error" : "biz-mobile-hint"
              }
              disabled={submitting}
            />
          </div>
        </FormRow>

        {blocked ? (
          <StatusMessage tone="error" title={t("start.error.blockedTitle")}>
            {blocked}
          </StatusMessage>
        ) : null}

        {submitError ? <StatusMessage tone="error">{submitError}</StatusMessage> : null}

        <SubmitButton loading={submitting} loadingLabel={t("common.sending")}>
          {t("start.submit")}
        </SubmitButton>

        <p className="text-center text-xs text-muted-foreground">
          {t("start.resumeNote")}
        </p>
      </form>
    </StepCard>
  );
}
