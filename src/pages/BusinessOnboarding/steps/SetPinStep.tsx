import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  setBusinessPin,
  toBusinessOnboardingError,
} from "../../../redux/apis/apisBusinessOnboarding";
import CodeInput from "../components/CodeInput";
import StatusMessage from "../components/StatusMessage";
import StepCard from "../components/StepCard";
import SubmitButton from "../components/SubmitButton";
import { useBusinessOnboarding } from "../OnboardingContext";

const PIN_LENGTH = 6;

/** The PIN the applicant re-enters to resume later — say so, plainly. */
export default function SetPinStep() {
  const { t } = useTranslation("businessOnboarding");
  const { sessionId, goNext } = useBusinessOnboarding();

  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const mismatch =
    confirmPin.length === PIN_LENGTH && pin.length === PIN_LENGTH && pin !== confirmPin;

  const handleSubmit = async () => {
    if (!sessionId || submitting) return;

    if (pin.length !== PIN_LENGTH || confirmPin.length !== PIN_LENGTH) {
      setError(t("setPin.error.length", { length: PIN_LENGTH }));
      return;
    }
    if (pin !== confirmPin) {
      setError(t("setPin.error.mismatch"));
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await setBusinessPin({ sessionId, pin, confirmPin });

      if (res.failureReason) {
        setError(res.failureReason);
        return;
      }

      goNext(res);
    } catch (err) {
      setError(toBusinessOnboardingError(err, t("common.error.generic")).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <StepCard title={t("setPin.title")} description={t("setPin.description")}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="space-y-7"
      >
        <fieldset className="space-y-3">
          <legend className="biz-legend">
            {t("setPin.field.pin")}
          </legend>
          <CodeInput
            id="biz-pin"
            label={t("setPin.field.pin")}
            value={pin}
            onChange={setPin}
            length={PIN_LENGTH}
            masked
            autoFocus
            disabled={submitting}
            invalid={Boolean(error) && !mismatch}
          />
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="biz-legend">
            {t("setPin.field.confirm")}
          </legend>
          <CodeInput
            id="biz-pin-confirm"
            label={t("setPin.field.confirm")}
            value={confirmPin}
            onChange={setConfirmPin}
            length={PIN_LENGTH}
            masked
            disabled={submitting}
            invalid={mismatch}
          />
          {mismatch ? (
            <p role="alert" className="text-center text-xs text-destructive">
              {t("setPin.error.mismatch")}
            </p>
          ) : null}
        </fieldset>

        <StatusMessage tone="info">{t("setPin.rememberNote")}</StatusMessage>

        {error && !mismatch ? (
          <StatusMessage tone="error">{error}</StatusMessage>
        ) : null}

        <SubmitButton
          loading={submitting}
          disabled={pin.length !== PIN_LENGTH || confirmPin.length !== PIN_LENGTH}
          loadingLabel={t("common.saving")}
        >
          {t("setPin.submit")}
        </SubmitButton>
      </form>
    </StepCard>
  );
}
