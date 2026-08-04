import { Plus, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { Button } from "../../../components/ui/button";
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
  submitBusinessPep,
  toBusinessOnboardingError,
  type PepRelatedPerson,
} from "../../../redux/apis/apisBusinessOnboarding";
import FormRow from "../components/FormRow";
import StatusMessage from "../components/StatusMessage";
import StepCard from "../components/StepCard";
import SubmitButton from "../components/SubmitButton";
import { BUSINESS_ONBOARDING_ROUTES } from "../navigation";
import { useBusinessOnboarding } from "../OnboardingContext";

/**
 * Wealth / funds codes.
 *
 * customer-service exposes these as tenant reference data
 * (`/api/v1/reference-data/source-of-wealth|source-of-funds`), but those lists
 * are empty on every environment so far — so the flow ships with the codes the
 * contract documents. Swap to the LOV endpoints once they are populated.
 */
const SOURCE_OF_WEALTH_CODES = [
  "BUSINESS_INCOME",
  "EMPLOYMENT_INCOME",
  "INVESTMENTS",
  "INHERITANCE",
  "PROPERTY_SALE",
  "OTHER",
];

const SOURCE_OF_FUNDS_CODES = [
  "BUSINESS_REVENUE",
  "SALARY",
  "INVESTMENT_RETURNS",
  "LOAN",
  "SAVINGS",
  "OTHER",
];

export default function PepStep() {
  const { t } = useTranslation("businessOnboarding");
  const navigate = useNavigate();
  const { sessionId } = useBusinessOnboarding();

  const [isPep, setIsPep] = useState<boolean | null>(null);
  const [primarySourceOfWealth, setPrimarySourceOfWealth] = useState("");
  const [sourceOfFunds, setSourceOfFunds] = useState("");
  const [estimatedNetWorth, setEstimatedNetWorth] = useState("");
  const [occupation, setOccupation] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  const [politicalPosition, setPoliticalPosition] = useState("");
  const [governmentBody, setGovernmentBody] = useState("");
  const [countryOfInfluence, setCountryOfInfluence] = useState("");
  const [positionStartDate, setPositionStartDate] = useState("");
  const [positionEndDate, setPositionEndDate] = useState("");
  const [relatedPersons, setRelatedPersons] = useState<PepRelatedPerson[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const updatePerson = (index: number, key: keyof PepRelatedPerson, value: string) =>
    setRelatedPersons((prev) =>
      prev.map((person, i) => (i === index ? { ...person, [key]: value } : person))
    );

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (isPep === null) {
      setError(t("pep.error.answerRequired"));
      return;
    }
    if (!sessionId) return;

    setSubmitting(true);
    try {
      await submitBusinessPep({
        sessionId,
        isPep,
        primarySourceOfWealth: primarySourceOfWealth || undefined,
        sourceOfFunds: sourceOfFunds || undefined,
        estimatedNetWorth: estimatedNetWorth.trim() || undefined,
        occupation: occupation.trim() || undefined,
        additionalNotes: additionalNotes.trim() || null,
        ...(isPep
          ? {
              politicalPosition: politicalPosition.trim() || undefined,
              governmentBody: governmentBody.trim() || undefined,
              countryOfInfluence: countryOfInfluence.trim() || undefined,
              positionStartDate: positionStartDate || undefined,
              positionEndDate: positionEndDate || undefined,
              relatedPersons: relatedPersons.filter((person) => person.name.trim()),
            }
          : {}),
      });

      toast.success(t("pep.saved"));
      navigate(BUSINESS_ONBOARDING_ROUTES.underReview);
    } catch (err) {
      setError(toBusinessOnboardingError(err, t("common.error.generic")).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <StepCard title={t("pep.title")} description={t("pep.description")}>
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <fieldset className="space-y-3">
          <legend className="biz-legend">{t("pep.field.isPep")}</legend>
          <p className="text-xs text-muted-foreground">{t("pep.hint.isPep")}</p>

          <div className="flex gap-[0.75rem]">
            {[
              { value: false, label: t("common.no") },
              { value: true, label: t("common.yes") },
            ].map((option) => (
              <button
                key={String(option.value)}
                type="button"
                onClick={() => setIsPep(option.value)}
                aria-pressed={isPep === option.value}
                className={
                  isPep === option.value
                    ? "flex-1 rounded-md border-[1px] border-[var(--primary)] bg-[var(--primary)]/10 px-[1rem] py-2 text-sm font-medium text-[var(--primary)]"
                    : "flex-1 rounded-md border-[1px] border-input bg-background px-[1rem] py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                }
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-[1.25rem] sm:grid-cols-2">
          <FormRow id="pep-wealth" label={t("pep.field.sourceOfWealth")}>
            <Select
              value={primarySourceOfWealth}
              onValueChange={setPrimarySourceOfWealth}
              disabled={submitting}
            >
              <SelectTrigger id="pep-wealth" className="w-full">
                <SelectValue placeholder={t("common.select")} />
              </SelectTrigger>
              <SelectContent>
                {SOURCE_OF_WEALTH_CODES.map((code) => (
                  <SelectItem key={code} value={code}>
                    {t(`pep.wealth.${code}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormRow>

          <FormRow id="pep-funds" label={t("pep.field.sourceOfFunds")}>
            <Select
              value={sourceOfFunds}
              onValueChange={setSourceOfFunds}
              disabled={submitting}
            >
              <SelectTrigger id="pep-funds" className="w-full">
                <SelectValue placeholder={t("common.select")} />
              </SelectTrigger>
              <SelectContent>
                {SOURCE_OF_FUNDS_CODES.map((code) => (
                  <SelectItem key={code} value={code}>
                    {t(`pep.funds.${code}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormRow>

          <FormRow id="pep-networth" label={t("pep.field.netWorth")}>
            <Input
              id="pep-networth"
              dir="ltr"
              inputMode="numeric"
              value={estimatedNetWorth}
              onChange={(e) => setEstimatedNetWorth(e.target.value)}
              placeholder="1000000"
              disabled={submitting}
            />
          </FormRow>

          <FormRow id="pep-occupation" label={t("pep.field.occupation")}>
            <Input
              id="pep-occupation"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              placeholder={t("pep.placeholder.occupation")}
              disabled={submitting}
            />
          </FormRow>
        </div>

        {isPep ? (
          <div className="space-y-5 rounded-lg border-[1px] border-border bg-muted/30 p-[1rem]">
            <p className="text-sm font-medium text-foreground">
              {t("pep.positionSectionTitle")}
            </p>

            <div className="grid gap-[1.25rem] sm:grid-cols-2">
              <FormRow id="pep-position" label={t("pep.field.position")}>
                <Input
                  id="pep-position"
                  value={politicalPosition}
                  onChange={(e) => setPoliticalPosition(e.target.value)}
                  disabled={submitting}
                />
              </FormRow>

              <FormRow id="pep-body" label={t("pep.field.governmentBody")}>
                <Input
                  id="pep-body"
                  value={governmentBody}
                  onChange={(e) => setGovernmentBody(e.target.value)}
                  disabled={submitting}
                />
              </FormRow>

              <FormRow id="pep-country" label={t("pep.field.countryOfInfluence")}>
                <Input
                  id="pep-country"
                  value={countryOfInfluence}
                  onChange={(e) => setCountryOfInfluence(e.target.value)}
                  disabled={submitting}
                />
              </FormRow>

              <div className="grid grid-cols-2 gap-[0.75rem]">
                <FormRow id="pep-start" label={t("pep.field.positionStart")}>
                  <Input
                    id="pep-start"
                    type="date"
                    value={positionStartDate}
                    onChange={(e) => setPositionStartDate(e.target.value)}
                    disabled={submitting}
                  />
                </FormRow>
                <FormRow id="pep-end" label={t("pep.field.positionEnd")}>
                  <Input
                    id="pep-end"
                    type="date"
                    value={positionEndDate}
                    onChange={(e) => setPositionEndDate(e.target.value)}
                    disabled={submitting}
                  />
                </FormRow>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">
                {t("pep.relatedPersonsTitle")}
              </p>

              {relatedPersons.map((person, index) => (
                <div
                  key={index}
                  className="grid gap-[0.75rem] rounded-md border-[1px] border-border bg-card p-[0.75rem] sm:grid-cols-[1fr_1fr_1fr_auto]"
                >
                  <Input
                    value={person.name}
                    onChange={(e) => updatePerson(index, "name", e.target.value)}
                    placeholder={t("pep.field.personName")}
                    aria-label={t("pep.field.personName")}
                    disabled={submitting}
                  />
                  <Input
                    value={person.relationship}
                    onChange={(e) => updatePerson(index, "relationship", e.target.value)}
                    placeholder={t("pep.field.personRelationship")}
                    aria-label={t("pep.field.personRelationship")}
                    disabled={submitting}
                  />
                  <Input
                    value={person.position}
                    onChange={(e) => updatePerson(index, "position", e.target.value)}
                    placeholder={t("pep.field.personPosition")}
                    aria-label={t("pep.field.personPosition")}
                    disabled={submitting}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={t("pep.removePerson")}
                    onClick={() =>
                      setRelatedPersons((prev) => prev.filter((_, i) => i !== index))
                    }
                    disabled={submitting}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={submitting}
                onClick={() =>
                  setRelatedPersons((prev) => [
                    ...prev,
                    { name: "", relationship: "", position: "" },
                  ])
                }
              >
                <Plus className="size-4" />
                {t("pep.addPerson")}
              </Button>
            </div>
          </div>
        ) : null}

        <FormRow id="pep-notes" label={t("pep.field.notes")}>
          <Textarea
            id="pep-notes"
            rows={3}
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            disabled={submitting}
          />
        </FormRow>

        {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}

        <div className="space-y-3">
          <SubmitButton loading={submitting} loadingLabel={t("common.saving")}>
            {t("pep.submit")}
          </SubmitButton>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            disabled={submitting}
            onClick={() => navigate(BUSINESS_ONBOARDING_ROUTES.underReview)}
          >
            {t("pep.skip")}
          </Button>
        </div>
      </form>
    </StepCard>
  );
}
