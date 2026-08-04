import { useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import {
  resendBusinessOtp,
  submitBusinessContact,
  toBusinessOnboardingError,
  verifyBusinessOtp,
} from "../../../redux/apis/apisBusinessOnboarding";
import CodeInput from "../components/CodeInput";
import FormRow from "../components/FormRow";
import StatusMessage from "../components/StatusMessage";
import StepCard from "../components/StepCard";
import SubmitButton from "../components/SubmitButton";
import { useBusinessOnboarding } from "../OnboardingContext";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 45;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function OtpStep() {
  const { t } = useTranslation("businessOnboarding");
  const { sessionId, data, applyStep, goNext } = useBusinessOnboarding();

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  // Contact correction — allowed only until the OTP is verified.
  const [editing, setEditing] = useState(false);
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [contactError, setContactError] = useState<string | null>(null);
  const [savingContact, setSavingContact] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const submit = async (value: string) => {
    if (!sessionId || value.length !== OTP_LENGTH || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await verifyBusinessOtp({ sessionId, mobileOtp: value });

      // A 200 carrying failureReason is a retryable step failure, not success.
      if (res.failureReason) {
        setError(res.failureReason);
        setCode("");
        return;
      }

      goNext(res);
    } catch (err) {
      const apiError = toBusinessOnboardingError(err, t("common.error.generic"));
      setError(apiError.message);
      setCode("");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!sessionId || cooldown > 0) return;
    try {
      await resendBusinessOtp({ sessionId });
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setError(null);
      toast.success(t("otp.resent"));
    } catch (err) {
      setError(toBusinessOnboardingError(err, t("common.error.generic")).message);
    }
  };

  const handleContactSave = async (event: FormEvent) => {
    event.preventDefault();
    if (!sessionId) return;

    if (!EMAIL_PATTERN.test(email.trim())) {
      setContactError(t("start.error.email"));
      return;
    }
    const digits = mobile.replace(/[^\d]/g, "");
    if (digits.length < 7 || digits.length > 15) {
      setContactError(t("start.error.mobile"));
      return;
    }

    setSavingContact(true);
    setContactError(null);
    try {
      const res = await submitBusinessContact({
        sessionId,
        email: email.trim(),
        mobileNumber: mobile.trim().startsWith("+") ? mobile.trim() : `+${digits}`,
      });
      applyStep(res);
      setEditing(false);
      setCode("");
      setCooldown(RESEND_COOLDOWN_SECONDS);
      toast.success(t("otp.contactUpdated"));
    } catch (err) {
      setContactError(
        toBusinessOnboardingError(err, t("common.error.generic")).message
      );
    } finally {
      setSavingContact(false);
    }
  };

  return (
    <StepCard
      title={t("otp.title")}
      description={t("otp.description", { mobile: data.maskedMobile ?? "" })}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(code);
        }}
        className="space-y-6"
      >
        <CodeInput
          id="biz-otp"
          label={t("otp.field")}
          value={code}
          onChange={setCode}
          length={OTP_LENGTH}
          disabled={submitting}
          invalid={Boolean(error)}
          autoFocus
          onComplete={submit}
        />

        {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}

        <SubmitButton
          loading={submitting}
          disabled={code.length !== OTP_LENGTH}
          loadingLabel={t("common.verifying")}
        >
          {t("otp.submit")}
        </SubmitButton>
      </form>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-[1rem] gap-y-2">
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0}
          className="biz-link"
        >
          {cooldown > 0 ? t("otp.resendIn", { seconds: cooldown }) : t("otp.resend")}
        </button>

        <span aria-hidden="true" className="h-3 w-px bg-border" />

        <button
          type="button"
          onClick={() => {
            setEditing((open) => !open);
            setContactError(null);
          }}
          className="biz-link"
        >
          {t("otp.wrongNumber")}
        </button>
      </div>

      {editing ? (
        <form
          onSubmit={handleContactSave}
          className="mt-6 space-y-5 rounded-xl border-[1px] border-border bg-muted/40 p-[1.25rem]"
        >
          <div className="space-y-1">
            <p className="biz-label text-foreground">{t("otp.editTitle")}</p>
            <p className="biz-xs text-muted-foreground">{t("otp.editDescription")}</p>
          </div>

          <FormRow id="otp-email" label={t("start.field.email")} required>
            <Input
              id="otp-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={data.maskedEmail ?? "owner@example.com"}
              disabled={savingContact}
            />
          </FormRow>

          <FormRow
            id="otp-mobile"
            label={t("start.field.mobile")}
            required
            hint={t("otp.editMobileHint")}
          >
            <Input
              id="otp-mobile"
              type="tel"
              dir="ltr"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="+966500000000"
              disabled={savingContact}
            />
          </FormRow>

          {contactError ? (
            <StatusMessage tone="error">{contactError}</StatusMessage>
          ) : null}

          {/* Grid, not flex: two `w-full` children in a flex row each claim the
              full track and push the second one out of the card. */}
          <div className="grid grid-cols-2 gap-[0.75rem]">
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full"
              onClick={() => setEditing(false)}
              disabled={savingContact}
            >
              {t("common.cancel")}
            </Button>
            <SubmitButton loading={savingContact} loadingLabel={t("common.saving")}>
              {t("otp.editSubmit")}
            </SubmitButton>
          </div>
        </form>
      ) : null}
    </StepCard>
  );
}
