import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  toBusinessOnboardingError,
  verifyBusinessResumePin,
} from "../../../redux/apis/apisBusinessOnboarding";
import CodeInput from "../components/CodeInput";
import StatusMessage from "../components/StatusMessage";
import StepCard from "../components/StepCard";
import SubmitButton from "../components/SubmitButton";
import { useBusinessOnboarding } from "../OnboardingContext";

const PIN_LENGTH = 6;

/**
 * Resume gate. The mPIN is re-verified on every return — there is no way back
 * into an in-flight application without it, so nothing is cached as "signed in".
 */
export default function ResumePinStep() {
  const { t } = useTranslation("businessOnboarding");
  const { sessionId, data, goNext, restart } = useBusinessOnboarding();

  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (value: string) => {
    if (!sessionId || value.length !== PIN_LENGTH || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await verifyBusinessResumePin({ sessionId, pin: value });

      if (res.failureReason) {
        setError(res.failureReason);
        setPin("");
        return;
      }

      // The response carries a fresh token pair; goNext persists it.
      goNext(res);
    } catch (err) {
      setError(toBusinessOnboardingError(err, t("common.error.generic")).message);
      setPin("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <StepCard
      title={t("resumePin.title")}
      description={t("resumePin.description", { email: data.maskedEmail ?? "" })}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(pin);
        }}
        className="space-y-6"
      >
        <StatusMessage tone="info">{t("resumePin.noOtpNote")}</StatusMessage>

        <CodeInput
          id="biz-resume-pin"
          label={t("resumePin.field")}
          value={pin}
          onChange={setPin}
          length={PIN_LENGTH}
          masked
          autoFocus
          disabled={submitting}
          invalid={Boolean(error)}
          onComplete={submit}
        />

        {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}

        <SubmitButton
          loading={submitting}
          disabled={pin.length !== PIN_LENGTH}
          loadingLabel={t("common.verifying")}
        >
          {t("resumePin.submit")}
        </SubmitButton>
      </form>

      <button
        type="button"
        onClick={restart}
        className="mt-6 block w-full text-center text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        {t("resumePin.startOver")}
      </button>
    </StepCard>
  );
}
