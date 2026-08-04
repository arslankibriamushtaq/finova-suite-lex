import { useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  getOnboardingBusinessTypes,
  getOnboardingCountries,
  submitBusinessInfo,
  toBusinessOnboardingError,
  type BusinessType,
  type CountryConfig,
} from "../../../redux/apis/apisBusinessOnboarding";
import FormRow from "../components/FormRow";
import StatusMessage from "../components/StatusMessage";
import StepCard from "../components/StepCard";
import SubmitButton from "../components/SubmitButton";
import { useBusinessOnboarding } from "../OnboardingContext";
import { documentKindLabelKey } from "../documentKinds";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FieldErrors {
  countryCode?: string;
  businessTypeCode?: string;
  registrationNumber?: string;
  businessName?: string;
  businessEmail?: string;
}

export default function BusinessDetailsStep() {
  const { t, i18n } = useTranslation("businessOnboarding");
  const { sessionId, data, goNext } = useBusinessOnboarding();
  const isArabic = i18n.language?.startsWith("ar");

  const [countries, setCountries] = useState<CountryConfig[]>([]);
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(false);

  const [countryCode, setCountryCode] = useState("");
  const [businessTypeCode, setBusinessTypeCode] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // The step is re-submittable, and /status returns everything already
  // captured — so a returning applicant sees their own answers, not a blank form.
  useEffect(() => {
    if (data.countryCode) setCountryCode((v) => v || data.countryCode!);
    if (data.businessTypeCode) setBusinessTypeCode((v) => v || data.businessTypeCode!);
    if (data.registrationNumber)
      setRegistrationNumber((v) => v || data.registrationNumber!);
    if (data.businessName) setBusinessName((v) => v || data.businessName!);
    if (data.businessEmail) setBusinessEmail((v) => v || data.businessEmail!);
    if (data.website) setWebsite((v) => v || data.website!);
    if (data.description) setDescription((v) => v || data.description!);
  }, [data]);

  useEffect(() => {
    let cancelled = false;
    getOnboardingCountries()
      .then((list) => {
        if (cancelled) return;
        setCountries(list.filter((c) => c.active !== false));
      })
      .catch(() => setError(t("details.error.referenceData")));
    return () => {
      cancelled = true;
    };
  }, [t]);

  useEffect(() => {
    if (!countryCode) {
      setBusinessTypes([]);
      return;
    }

    let cancelled = false;
    setLoadingTypes(true);
    getOnboardingBusinessTypes(countryCode)
      .then((types) => {
        if (cancelled) return;
        setBusinessTypes(types);
        // A type from a previously chosen country is not valid here.
        setBusinessTypeCode((current) =>
          types.some((type) => type.typeCode === current) ? current : ""
        );
      })
      .catch(() => {
        if (!cancelled) setError(t("details.error.businessTypes"));
      })
      .finally(() => {
        if (!cancelled) setLoadingTypes(false);
      });

    return () => {
      cancelled = true;
    };
  }, [countryCode, t]);

  const selectedType = businessTypes.find((type) => type.typeCode === businessTypeCode);
  const typeLabel = (type: BusinessType) =>
    (isArabic ? type.labelAr : type.labelEn) || type.labelEn || type.typeCode;

  const validate = (): boolean => {
    const errors: FieldErrors = {};
    if (!countryCode) errors.countryCode = t("common.error.required");
    if (!businessTypeCode) errors.businessTypeCode = t("common.error.required");
    if (!registrationNumber.trim()) errors.registrationNumber = t("common.error.required");
    if (!businessName.trim()) errors.businessName = t("common.error.required");
    if (businessEmail.trim() && !EMAIL_PATTERN.test(businessEmail.trim())) {
      errors.businessEmail = t("start.error.email");
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!sessionId || !validate()) return;

    setSubmitting(true);
    try {
      const res = await submitBusinessInfo({
        sessionId,
        countryCode,
        businessTypeCode,
        registrationNumber: registrationNumber.trim(),
        businessName: businessName.trim(),
        businessEmail: businessEmail.trim() || undefined,
        website: website.trim() || undefined,
        description: description.trim() || undefined,
      });

      if (res.failureReason) {
        setError(res.failureReason);
        return;
      }

      goNext(res);
    } catch (err) {
      const apiError = toBusinessOnboardingError(err, t("common.error.generic"));

      // The registration number is the one field the applicant must fix; put
      // the message on it rather than in a banner that scrolls away.
      if (apiError.code === "ONBOARDING.BUSINESS.ALREADY_REGISTERED") {
        setFieldErrors((prev) => ({
          ...prev,
          registrationNumber: apiError.message || t("details.error.registrationTaken"),
        }));
        return;
      }

      setError(apiError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <StepCard title={t("details.title")} description={t("details.description")}>
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div className="space-y-5">
          <FormRow
            id="biz-country"
            label={t("details.field.country")}
            required
            error={fieldErrors.countryCode}
          >
            <Select
              value={countryCode}
              onValueChange={setCountryCode}
              disabled={submitting || countries.length === 0}
            >
              <SelectTrigger id="biz-country" className="w-full">
                <SelectValue placeholder={t("details.placeholder.country")} />
              </SelectTrigger>
              <SelectContent>
                {/* No flag emoji — Windows renders regional indicators as bare
                    letter pairs, so 🇸🇦 shows up as "SA". */}
                {countries.map((country) => (
                  <SelectItem key={country.countryCode} value={country.countryCode}>
                    {isArabic && country.countryNameAr
                      ? country.countryNameAr
                      : country.countryName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormRow>

          <FormRow
            id="biz-type"
            label={t("details.field.businessType")}
            required
            error={fieldErrors.businessTypeCode}
          >
            <Select
              value={businessTypeCode}
              onValueChange={setBusinessTypeCode}
              disabled={submitting || loadingTypes || businessTypes.length === 0}
            >
              <SelectTrigger id="biz-type" className="w-full">
                <SelectValue
                  placeholder={
                    countryCode
                      ? loadingTypes
                        ? t("common.loading")
                        : t("details.placeholder.businessType")
                      : t("details.placeholder.selectCountryFirst")
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {businessTypes.map((type) => (
                  <SelectItem key={type.typeCode} value={type.typeCode}>
                    {typeLabel(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormRow>
        </div>

        {selectedType?.requiredDocuments?.length ? (
          <StatusMessage tone="info" title={t("details.requiredDocsTitle")}>
            <ul className="biz-list mt-1 list-disc space-y-0.5">
              {selectedType.requiredDocuments.map((kind) => (
                <li key={kind}>{t(documentKindLabelKey(kind))}</li>
              ))}
            </ul>
          </StatusMessage>
        ) : null}

        <FormRow
          id="biz-name"
          label={t("details.field.businessName")}
          required
          error={fieldErrors.businessName}
        >
          <Input
            id="biz-name"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder={t("details.placeholder.businessName")}
            aria-invalid={Boolean(fieldErrors.businessName)}
            disabled={submitting}
          />
        </FormRow>

        <FormRow
          id="biz-registration"
          label={t("details.field.registrationNumber")}
          required
          hint={t("details.hint.registrationNumber")}
          error={fieldErrors.registrationNumber}
        >
          <Input
            id="biz-registration"
            value={registrationNumber}
            onChange={(e) => setRegistrationNumber(e.target.value)}
            placeholder="CR-1010101010"
            aria-invalid={Boolean(fieldErrors.registrationNumber)}
            disabled={submitting}
          />
        </FormRow>

        <div className="space-y-5">
          <FormRow
            id="biz-email-business"
            label={t("details.field.businessEmail")}
            hint={t("details.hint.businessEmail")}
            error={fieldErrors.businessEmail}
          >
            <Input
              id="biz-email-business"
              type="email"
              value={businessEmail}
              onChange={(e) => setBusinessEmail(e.target.value)}
              placeholder="info@company.example"
              aria-invalid={Boolean(fieldErrors.businessEmail)}
              disabled={submitting}
            />
          </FormRow>

          <FormRow id="biz-website" label={t("details.field.website")}>
            <Input
              id="biz-website"
              type="url"
              dir="ltr"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://company.example"
              disabled={submitting}
            />
          </FormRow>
        </div>

        <FormRow
          id="biz-description"
          label={t("details.field.description")}
          hint={t("details.hint.description")}
        >
          <Textarea
            id="biz-description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("details.placeholder.description")}
            disabled={submitting}
          />
        </FormRow>

        {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}

        <SubmitButton loading={submitting} loadingLabel={t("common.saving")}>
          {t("common.continue")}
        </SubmitButton>
      </form>
    </StepCard>
  );
}
