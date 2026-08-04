import { useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import {
  submitBusinessAddress,
  toBusinessOnboardingError,
} from "../../../redux/apis/apisBusinessOnboarding";
import FormRow from "../components/FormRow";
import StatusMessage from "../components/StatusMessage";
import StepCard from "../components/StepCard";
import SubmitButton from "../components/SubmitButton";
import { useBusinessOnboarding } from "../OnboardingContext";

export default function AddressStep() {
  const { t } = useTranslation("businessOnboarding");
  const { sessionId, data, goNext } = useBusinessOnboarding();

  const [city, setCity] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ city?: string; address?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (data.city) setCity((v) => v || data.city!);
    if (data.businessAddress) setBusinessAddress((v) => v || data.businessAddress!);
    if (data.postalCode) setPostalCode((v) => v || data.postalCode!);
  }, [data]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    const errors: { city?: string; address?: string } = {};
    if (!city.trim()) errors.city = t("common.error.required");
    if (!businessAddress.trim()) errors.address = t("common.error.required");
    setFieldErrors(errors);
    if (Object.keys(errors).length || !sessionId) return;

    setSubmitting(true);
    try {
      const res = await submitBusinessAddress({
        sessionId,
        city: city.trim(),
        businessAddress: businessAddress.trim(),
        postalCode: postalCode.trim() || undefined,
      });

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
    <StepCard title={t("address.title")} description={t("address.description")}>
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <FormRow
          id="biz-address"
          label={t("address.field.street")}
          required
          hint={t("address.hint.street")}
          error={fieldErrors.address}
        >
          <Textarea
            id="biz-address"
            rows={3}
            value={businessAddress}
            onChange={(e) => setBusinessAddress(e.target.value)}
            placeholder={t("address.placeholder.street")}
            aria-invalid={Boolean(fieldErrors.address)}
            disabled={submitting}
          />
        </FormRow>

        <div className="grid gap-[1.25rem] sm:grid-cols-2">
          <FormRow
            id="biz-city"
            label={t("address.field.city")}
            required
            error={fieldErrors.city}
          >
            <Input
              id="biz-city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder={t("address.placeholder.city")}
              aria-invalid={Boolean(fieldErrors.city)}
              disabled={submitting}
            />
          </FormRow>

          <FormRow id="biz-postal" label={t("address.field.postalCode")}>
            <Input
              id="biz-postal"
              dir="ltr"
              inputMode="numeric"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="12211"
              disabled={submitting}
            />
          </FormRow>
        </div>

        {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}

        <SubmitButton loading={submitting} loadingLabel={t("common.saving")}>
          {t("common.continue")}
        </SubmitButton>
      </form>
    </StepCard>
  );
}
