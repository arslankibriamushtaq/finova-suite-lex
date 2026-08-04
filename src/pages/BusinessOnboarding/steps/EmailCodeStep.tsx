import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  toBusinessOnboardingError,
  verifyBusinessEmailMpin,
} from "../../../redux/apis/apisBusinessOnboarding";
import CodeInput from "../components/CodeInput";
import StatusMessage from "../components/StatusMessage";
import StepCard from "../components/StepCard";
import SubmitButton from "../components/SubmitButton";
import { useBusinessOnboarding } from "../OnboardingContext";

const CODE_LENGTH = 6;

/** Proves the email address. Must pass before a PIN can be set. */
export default function EmailCodeStep() {
  const { t } = useTranslation("businessOnboarding");
  const { sessionId, data, goNext } = useBusinessOnboarding();

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (value: string) => {
    if (!sessionId || value.length !== CODE_LENGTH || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await verifyBusinessEmailMpin({
        sessionId,
        emailMpinCode: value,
      });

      if (res.failureReason) {
        setError(res.failureReason);
        setCode("");
        return;
      }

      goNext(res);
    } catch (err) {
      setError(toBusinessOnboardingError(err, t("common.error.generic")).message);
      setCode("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <StepCard
      title={t("emailCode.title")}
      description={t("emailCode.description", { email: data.maskedEmail ?? "" })}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(code);
        }}
        className="space-y-6"
      >
        <CodeInput
          id="biz-email-code"
          label={t("emailCode.field")}
          value={code}
          onChange={setCode}
          length={CODE_LENGTH}
          autoFocus
          disabled={submitting}
          invalid={Boolean(error)}
          onComplete={submit}
        />

        {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}

        <SubmitButton
          loading={submitting}
          disabled={code.length !== CODE_LENGTH}
          loadingLabel={t("common.verifying")}
        >
          {t("emailCode.submit")}
        </SubmitButton>

        <p className="text-center text-xs text-muted-foreground">
          {t("emailCode.spamHint")}
        </p>
      </form>
    </StepCard>
  );
}
