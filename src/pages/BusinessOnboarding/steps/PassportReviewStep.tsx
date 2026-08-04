import { useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import {
  confirmBusinessPassportData,
  toBusinessOnboardingError,
} from "../../../redux/apis/apisBusinessOnboarding";
import FormRow from "../components/FormRow";
import StatusMessage from "../components/StatusMessage";
import StepCard from "../components/StepCard";
import SubmitButton from "../components/SubmitButton";
import { useBusinessOnboarding } from "../OnboardingContext";

/**
 * OCR returns snake_case keys; `/confirm-data` takes camelCase ones. Keeping
 * the translation in one table stops the two vocabularies leaking into the JSX.
 */
const OCR_TO_FORM: Record<string, string> = {
  surname: "surname",
  first_name: "givenName",
  nationality: "nationality",
  dob: "dateOfBirth",
  document_number: "passportNumber",
  date_of_issue: "issueDate",
  expiry_date: "expiryDate",
};

interface PassportForm {
  surname: string;
  givenName: string;
  nationality: string;
  dateOfBirth: string;
  passportNumber: string;
  issueDate: string;
  expiryDate: string;
  homeAddress: string;
  countryOfOrigin: string;
  residentialCountry: string;
}

const EMPTY_FORM: PassportForm = {
  surname: "",
  givenName: "",
  nationality: "",
  dateOfBirth: "",
  passportNumber: "",
  issueDate: "",
  expiryDate: "",
  homeAddress: "",
  countryOfOrigin: "",
  residentialCountry: "",
};

export default function PassportReviewStep() {
  const { t } = useTranslation("businessOnboarding");
  const { sessionId, data, goNext } = useBusinessOnboarding();

  const [form, setForm] = useState<PassportForm>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const extracted = data.extractedData ?? {};
    const confirmed = (data.confirmedData ?? {}) as Record<string, unknown>;

    setForm((prev) => {
      const next = { ...prev };

      Object.entries(OCR_TO_FORM).forEach(([ocrKey, formKey]) => {
        const value = extracted[ocrKey];
        if (!next[formKey as keyof PassportForm] && typeof value === "string") {
          next[formKey as keyof PassportForm] = value;
        }
      });

      // A second visit should show what was already confirmed, not the raw scan.
      Object.keys(EMPTY_FORM).forEach((formKey) => {
        const value = confirmed[formKey];
        if (typeof value === "string" && value) {
          next[formKey as keyof PassportForm] = value;
        }
      });

      return next;
    });
  }, [data.extractedData, data.confirmedData]);

  const update = (key: keyof PassportForm) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!sessionId) return;

    setSubmitting(true);
    setError(null);
    try {
      // Blank fields fall back to the OCR values server-side, so sending the
      // whole form never wipes anything the applicant left untouched.
      const res = await confirmBusinessPassportData({ sessionId, ...form });

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
    <StepCard
      title={t("passportReview.title")}
      description={t("passportReview.description")}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div className="grid gap-[1.25rem] sm:grid-cols-2">
          <FormRow id="pp-given" label={t("passportReview.field.givenName")}>
            <Input
              id="pp-given"
              value={form.givenName}
              onChange={(e) => update("givenName")(e.target.value)}
              disabled={submitting}
            />
          </FormRow>

          <FormRow id="pp-surname" label={t("passportReview.field.surname")}>
            <Input
              id="pp-surname"
              value={form.surname}
              onChange={(e) => update("surname")(e.target.value)}
              disabled={submitting}
            />
          </FormRow>

          <FormRow id="pp-number" label={t("passportReview.field.passportNumber")}>
            <Input
              id="pp-number"
              dir="ltr"
              value={form.passportNumber}
              onChange={(e) => update("passportNumber")(e.target.value)}
              disabled={submitting}
            />
          </FormRow>

          <FormRow id="pp-nationality" label={t("passportReview.field.nationality")}>
            <Input
              id="pp-nationality"
              value={form.nationality}
              onChange={(e) => update("nationality")(e.target.value)}
              disabled={submitting}
            />
          </FormRow>

          <FormRow id="pp-dob" label={t("passportReview.field.dateOfBirth")}>
            <Input
              id="pp-dob"
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => update("dateOfBirth")(e.target.value)}
              disabled={submitting}
            />
          </FormRow>

          <FormRow id="pp-issue" label={t("passportReview.field.issueDate")}>
            <Input
              id="pp-issue"
              type="date"
              value={form.issueDate}
              onChange={(e) => update("issueDate")(e.target.value)}
              disabled={submitting}
            />
          </FormRow>

          <FormRow id="pp-expiry" label={t("passportReview.field.expiryDate")}>
            <Input
              id="pp-expiry"
              type="date"
              value={form.expiryDate}
              onChange={(e) => update("expiryDate")(e.target.value)}
              disabled={submitting}
            />
          </FormRow>

          <FormRow id="pp-origin" label={t("passportReview.field.countryOfOrigin")}>
            <Input
              id="pp-origin"
              value={form.countryOfOrigin}
              onChange={(e) => update("countryOfOrigin")(e.target.value)}
              disabled={submitting}
            />
          </FormRow>
        </div>

        <div className="space-y-4 rounded-lg border-[1px] border-border bg-muted/30 p-[1rem]">
          <p className="text-sm font-medium text-foreground">
            {t("passportReview.ownerSectionTitle")}
          </p>

          <div className="space-y-5">
            <FormRow
              id="pp-home"
              label={t("passportReview.field.homeAddress")}
              hint={t("passportReview.hint.homeAddress")}
            >
              <Textarea
                id="pp-home"
                rows={2}
                value={form.homeAddress}
                onChange={(e) => update("homeAddress")(e.target.value)}
                disabled={submitting}
              />
            </FormRow>

            <FormRow
              id="pp-residential"
              label={t("passportReview.field.residentialCountry")}
            >
              <Input
                id="pp-residential"
                value={form.residentialCountry}
                onChange={(e) => update("residentialCountry")(e.target.value)}
                disabled={submitting}
              />
            </FormRow>
          </div>
        </div>

        <StatusMessage tone="info">{t("passportReview.fallbackNote")}</StatusMessage>

        {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}

        <SubmitButton loading={submitting} loadingLabel={t("common.saving")}>
          {t("passportReview.submit")}
        </SubmitButton>
      </form>
    </StepCard>
  );
}
