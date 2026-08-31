import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  ADMIN_RELATIONSHIPS,
  createSignup,
  getQuote,
  toTenantSignupError,
  type AdminRelationship,
  type Quote,
  type SignupRequest,
} from "../../../redux/apis/apisTenantProvisioning";
import { getCurrentLanguage } from "../../../utils/acceptLanguage";
import { cn } from "../../../lib/utils";
import { normalizeDigits } from "../digits";
import { resetIdempotencyKey } from "../../../utils/tenantSignupSession";
import {
  DEFAULT_COUNTRY_CODE,
  getCountryOptions,
} from "../countries";
import FormRow from "../components/FormRow";
import QuoteLines from "../components/QuoteLines";
import StatusMessage from "../components/StatusMessage";
import StepCard from "../components/StepCard";
import SubmitButton from "../components/SubmitButton";
import { TENANT_SIGNUP_ROUTES } from "../navigation";
import { useTenantSignup } from "../TenantSignupContext";

/**
 * Screen 2 — the company, then the buyer, in two parts.
 *
 * That order is the contract's, and the second part exists because the person
 * filling the form is not necessarily the owner: the platform records which,
 * via `adminRelationship`.
 *
 * The two parts are one route and one piece of state, not two screens: the
 * URL, the frozen-quote contract and the idempotency key all belong to a single
 * submission, and nothing is sent until the buyer confirms at the end of part
 * two. Splitting them only shortens what a buyer faces at once — going back is
 * free and loses nothing, because no request has been made yet.
 *
 * Submitting FREEZES the quote for 72 hours. From here on, the amount rendered
 * is the one the signup came back with — catalog prices may move underneath a
 * buyer mid-form, and they are billed what they were shown.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Saudi commercial registration: exactly ten digits. */
const CR_PATTERN = /^\d{10}$/;
/** ZATCA VAT registration: fifteen digits, first and last both 3. */
const VAT_PATTERN = /^3\d{13}3$/;

type FormState = {
  companyName: string;
  companyNameAr: string;
  crNumber: string;
  vatNumber: string;
  countryCode: string;
  city: string;
  addressLine: string;
  postalCode: string;
  companyEmail: string;
  companyPhone: string;
  website: string;
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminMobile: string;
  adminJobTitle: string;
  adminRelationship: AdminRelationship;
};

const EMPTY_FORM: FormState = {
  companyName: "",
  companyNameAr: "",
  crNumber: "",
  vatNumber: "",
  countryCode: DEFAULT_COUNTRY_CODE,
  city: "",
  addressLine: "",
  postalCode: "",
  companyEmail: "",
  companyPhone: "",
  website: "",
  adminFirstName: "",
  adminLastName: "",
  adminEmail: "",
  adminMobile: "",
  adminJobTitle: "",
  adminRelationship: "OWNER",
};

type Errors = Partial<Record<keyof FormState, string>>;

export default function DetailsStep() {
  const { t } = useTranslation("tenantSignup");
  const navigate = useNavigate();

  const { packageCodes, billingCycle, acceptSignup } = useTenantSignup();

  // Which half of the form is on screen. Both halves live in the same state,
  // so moving between them keeps every answer.
  const [part, setPart] = useState<"company" | "admin">("company");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [quote, setQuote] = useState<Quote | null>(null);

  // One key per form render, reused on every retry: a double-click or a flaky
  // network then returns the original signup rather than a second quote the
  // buyer could pay for twice. Reset here — arriving at a blank form means a
  // genuinely new signup.
  const [idempotencyKey, setIdempotencyKey] = useState(() => resetIdempotencyKey());

  // Nobody should be filling this in without having chosen something.
  useEffect(() => {
    if (packageCodes.length === 0) {
      navigate(TENANT_SIGNUP_ROUTES.pricing, { replace: true });
    }
  }, [packageCodes, navigate]);

  // The order summary shown beside the form. It is the same live quote as the
  // pricing screen's — the frozen one only exists once the form is submitted.
  useEffect(() => {
    if (packageCodes.length === 0) return;

    let live = true;
    getQuote({ packageCodes, billingCycle })
      .then((data) => live && setQuote(data))
      .catch(() => live && setQuote(null));

    return () => {
      live = false;
    };
  }, [packageCodes, billingCycle]);

  // Names are localized, so the list is rebuilt when the language changes.
  const language = getCurrentLanguage();
  const countryOptions = useMemo(() => getCountryOptions(language), [language]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  /**
   * Mirrors the server's rules, field for field — split by part so leaving part
   * one does not demand fields the buyer has not been shown yet, and so the
   * final submit still checks everything.
   */
  const validateCompany = (): Errors => {
    const next: Errors = {};
    const required = t("common.error.required");

    if (!form.companyName.trim()) next.companyName = required;

    if (!form.companyEmail.trim()) next.companyEmail = required;
    else if (!EMAIL_PATTERN.test(form.companyEmail.trim())) next.companyEmail = t("error.email");

    // Only Saudi registrations have a checked format; other jurisdictions are
    // passed through as typed.
    if (
      form.countryCode === "SA" &&
      form.crNumber.trim() &&
      !CR_PATTERN.test(form.crNumber.trim())
    ) {
      next.crNumber = t("error.crNumber");
    }

    if (form.vatNumber.trim() && !VAT_PATTERN.test(form.vatNumber.trim()))
      next.vatNumber = t("error.vatNumber");

    if (form.website.trim() && !/^https?:\/\/\S+$/i.test(form.website.trim()))
      next.website = t("error.website");

    return next;
  };

  const validateAdmin = (): Errors => {
    const next: Errors = {};
    const required = t("common.error.required");

    if (!form.adminFirstName.trim()) next.adminFirstName = required;

    if (!form.adminEmail.trim()) next.adminEmail = required;
    else if (!EMAIL_PATTERN.test(form.adminEmail.trim())) next.adminEmail = t("error.email");

    return next;
  };

  const validate = (): Errors => ({ ...validateCompany(), ...validateAdmin() });

  const COMPANY_FIELDS: (keyof FormState)[] = [
    "companyName",
    "companyNameAr",
    "crNumber",
    "vatNumber",
    "countryCode",
    "city",
    "addressLine",
    "postalCode",
    "companyEmail",
    "companyPhone",
    "website",
  ];

  /** Part one is done when nothing it owns is wrong. */
  const goToAdmin = () => {
    const found = validateCompany();
    setErrors(found);
    setFormError(null);
    if (Object.keys(found).length > 0) return;
    setPart("admin");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    // Enter in part one means "next", not "buy".
    if (part === "company") {
      goToAdmin();
      return;
    }

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setFormError(null);
      // An error the buyer cannot see is an error they cannot fix: if anything
      // in part one failed, that is where they are taken.
      if (COMPANY_FIELDS.some((field) => found[field])) setPart("company");
      return;
    }

    const trimmed = (value: string) => value.trim() || undefined;

    const payload: SignupRequest = {
      companyName: form.companyName.trim(),
      companyNameAr: trimmed(form.companyNameAr),
      crNumber: trimmed(form.crNumber),
      vatNumber: trimmed(form.vatNumber),
      countryCode: form.countryCode,
      city: trimmed(form.city),
      addressLine: trimmed(form.addressLine),
      postalCode: trimmed(form.postalCode),
      companyEmail: form.companyEmail.trim(),
      companyPhone: trimmed(form.companyPhone),
      website: trimmed(form.website),

      adminFirstName: form.adminFirstName.trim(),
      adminLastName: trimmed(form.adminLastName),
      adminEmail: form.adminEmail.trim(),
      adminMobile: trimmed(form.adminMobile),
      adminJobTitle: trimmed(form.adminJobTitle),
      adminRelationship: form.adminRelationship,

      billingCycle,
      // CORE is added server-side; sending it would be sending a package the
      // catalog does not offer.
      packageCodes,
      // Decides the language of every email that follows, including the
      // activation link — so it is the buyer's current choice, not a default.
      locale: getCurrentLanguage(),
    };

    setSubmitting(true);
    setFormError(null);

    try {
      const signup = await createSignup(payload, idempotencyKey);
      acceptSignup(signup);
      navigate(TENANT_SIGNUP_ROUTES.payment);
    } catch (err) {
      const error = toTenantSignupError(err, t("common.error.generic"));

      switch (error.code) {
        case "COMMON.VALIDATION.FAILED":
          // `message` is only ever "Validation failed"; the useful text is in
          // `details`, keyed by request field. Anything that does not map to a
          // field on this form still has to be shown somewhere, so it falls
          // through to the banner.
          if (error.details) {
            const fieldErrors: Errors = {};
            const unmapped: string[] = [];

            Object.entries(error.details).forEach(([field, text]) => {
              if (field in EMPTY_FORM) {
                fieldErrors[field as keyof FormState] = text;
              } else {
                unmapped.push(text);
              }
            });

            setErrors(fieldErrors);
            setFormError(unmapped.length > 0 ? unmapped.join(" ") : null);
          } else {
            setFormError(error.message);
          }
          break;

        case "TENANCY.SIGNUP.DUPLICATE":
        case "TENANCY.TENANT.DUPLICATE_EMAIL":
          // Both are about the email they typed, so the message belongs on the
          // field rather than in a banner they have to map back to one.
          setErrors((current) => ({ ...current, companyEmail: error.message }));
          // The field it belongs to is in part one.
          setPart("company");
          break;

        case "TENANCY.PACKAGE.INACTIVE":
        case "TENANCY.PACKAGE.NOT_FOUND":
          // The catalog moved under them. Their answers are kept; only the
          // selection has to be made again.
          setFormError(error.message);
          break;

        default:
          setFormError(error.message);
      }

      // A rejected submission is a new attempt, not a retry of the same one:
      // the buyer will edit something before trying again, and reusing the key
      // would replay the original (rejected) request.
      setIdempotencyKey(resetIdempotencyKey());
    } finally {
      setSubmitting(false);
    }
  };

  return (
    // Form and running total side by side from `lg` up, the same shape as the
    // pricing screen. Below that the rail drops under the form rather than
    // squeezing both into a phone's width.
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <StepCard
        title={part === "company" ? t("form.title") : t("form.title.admin")}
        description={part === "company" ? t("form.sub") : t("form.sub.admin")}
        aside={
          <button
            type="button"
            className="ts-link ts-xs"
            onClick={() => navigate(TENANT_SIGNUP_ROUTES.pricing)}
          >
            {t("form.changePlan")}
          </button>
        }
      >
        {/* Just the count. The <legend> below already names the section, and
            printing "Step 1 of 2 · Your company" above a "Your company"
            heading said it twice. */}
        <p className="ts-xs -mt-4 mb-6 font-medium text-muted-foreground">
          {t("form.partShort", { current: part === "company" ? 1 : 2 })}
        </p>

        <form onSubmit={onSubmit} noValidate className="space-y-8">
          {/* Only the current half is rendered. The answers live in `form`,
              outside the fieldsets, so unmounting one loses nothing. */}
          {part === "company" ? (
            <fieldset className="space-y-4">
              <legend className="ts-legend mb-1">{t("form.company.legend")}</legend>

              <FormRow
                id="companyName"
                label={t("form.companyName")}
                required
                error={errors.companyName}
              >
                <Input
                  id="companyName"
                  value={form.companyName}
                  autoComplete="organization"
                  aria-invalid={Boolean(errors.companyName)}
                  onChange={(e) => set("companyName", e.target.value)}
                />
              </FormRow>

              <FormRow id="companyNameAr" label={t("form.companyNameAr")}>
                <Input
                  id="companyNameAr"
                  dir="rtl"
                  value={form.companyNameAr}
                  onChange={(e) => set("companyNameAr", e.target.value)}
                />
              </FormRow>

              <FormRow id="countryCode" label={t("form.countryCode")} required>
                <Select
                  value={form.countryCode}
                  onValueChange={(value) => set("countryCode", value)}
                >
                  <SelectTrigger id="countryCode">
                    <SelectValue placeholder={t("common.select")} />
                  </SelectTrigger>
                  <SelectContent>
                    {countryOptions.map((country, index) => (
                      <SelectItem
                        key={country.code}
                        value={country.code}
                        // A hairline under the pinned regional block, so it
                        // reads as "these first" rather than a broken sort.
                        className={cn(
                          country.priority &&
                            !countryOptions[index + 1]?.priority &&
                            "border-b border-[var(--surface-border)]"
                        )}
                      >
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormRow>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormRow
                  id="crNumber"
                  label={t("form.crNumber")}
                  hint={form.countryCode === "SA" ? t("form.crNumber.hint") : undefined}
                  error={errors.crNumber}
                >
                  <Input
                    id="crNumber"
                    inputMode="numeric"
                    dir="ltr"
                    maxLength={10}
                    value={form.crNumber}
                    aria-invalid={Boolean(errors.crNumber)}
                    aria-describedby="crNumber-hint"
                    // Separators and Arabic-Indic numerals are normalised as
                    // they are typed, so a pasted "1010-101010" or a
                    // keyboard's ١٠١٠١٠١٠١٠ becomes a valid CR instead of an
                    // error the buyer cannot see the cause of.
                    onChange={(e) => set("crNumber", normalizeDigits(e.target.value))}
                  />
                </FormRow>

                <FormRow
                  id="vatNumber"
                  label={t("form.vatNumber")}
                  hint={t("form.vatNumber.hint")}
                  error={errors.vatNumber}
                >
                  <Input
                    id="vatNumber"
                    inputMode="numeric"
                    dir="ltr"
                    maxLength={15}
                    value={form.vatNumber}
                    aria-invalid={Boolean(errors.vatNumber)}
                    aria-describedby="vatNumber-hint"
                    onChange={(e) => set("vatNumber", normalizeDigits(e.target.value))}
                  />
                </FormRow>
              </div>

              <FormRow
                id="companyEmail"
                label={t("form.companyEmail")}
                required
                hint={t("form.companyEmail.hint")}
                error={errors.companyEmail}
              >
                <Input
                  id="companyEmail"
                  type="email"
                  dir="ltr"
                  autoComplete="email"
                  value={form.companyEmail}
                  aria-invalid={Boolean(errors.companyEmail)}
                  aria-describedby="companyEmail-hint"
                  onChange={(e) => set("companyEmail", e.target.value)}
                />
              </FormRow>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormRow id="companyPhone" label={t("form.companyPhone")}>
                  <Input
                    id="companyPhone"
                    type="tel"
                    dir="ltr"
                    autoComplete="tel"
                    value={form.companyPhone}
                    onChange={(e) => set("companyPhone", e.target.value)}
                  />
                </FormRow>

                <FormRow id="website" label={t("form.website")} error={errors.website}>
                  <Input
                    id="website"
                    type="url"
                    dir="ltr"
                    placeholder="https://"
                    value={form.website}
                    aria-invalid={Boolean(errors.website)}
                    onChange={(e) => set("website", e.target.value)}
                  />
                </FormRow>
              </div>

              <FormRow id="addressLine" label={t("form.addressLine")}>
                <Input
                  id="addressLine"
                  autoComplete="street-address"
                  value={form.addressLine}
                  onChange={(e) => set("addressLine", e.target.value)}
                />
              </FormRow>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormRow id="city" label={t("form.city")}>
                  <Input
                    id="city"
                    autoComplete="address-level2"
                    value={form.city}
                    onChange={(e) => set("city", e.target.value)}
                  />
                </FormRow>

                <FormRow id="postalCode" label={t("form.postalCode")}>
                  <Input
                    id="postalCode"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    value={form.postalCode}
                    onChange={(e) => set("postalCode", e.target.value)}
                  />
                </FormRow>
              </div>
            </fieldset>
          ) : (
            <fieldset className="space-y-4">
              <legend className="ts-legend mb-1">{t("form.admin.legend")}</legend>
              <p className="ts-xs -mt-2 text-muted-foreground">{t("form.admin.hint")}</p>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormRow
                  id="adminFirstName"
                  label={t("form.adminFirstName")}
                  required
                  error={errors.adminFirstName}
                >
                  <Input
                    id="adminFirstName"
                    autoComplete="given-name"
                    value={form.adminFirstName}
                    aria-invalid={Boolean(errors.adminFirstName)}
                    onChange={(e) => set("adminFirstName", e.target.value)}
                  />
                </FormRow>

                <FormRow id="adminLastName" label={t("form.adminLastName")}>
                  <Input
                    id="adminLastName"
                    autoComplete="family-name"
                    value={form.adminLastName}
                    onChange={(e) => set("adminLastName", e.target.value)}
                  />
                </FormRow>
              </div>

              <FormRow
                id="adminEmail"
                label={t("form.adminEmail")}
                required
                hint={t("form.adminEmail.hint")}
                error={errors.adminEmail}
              >
                <Input
                  id="adminEmail"
                  type="email"
                  dir="ltr"
                  autoComplete="email"
                  value={form.adminEmail}
                  aria-invalid={Boolean(errors.adminEmail)}
                  aria-describedby="adminEmail-hint"
                  onChange={(e) => set("adminEmail", e.target.value)}
                />
              </FormRow>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormRow id="adminMobile" label={t("form.adminMobile")}>
                  <Input
                    id="adminMobile"
                    type="tel"
                    dir="ltr"
                    autoComplete="tel"
                    value={form.adminMobile}
                    onChange={(e) => set("adminMobile", e.target.value)}
                  />
                </FormRow>

                <FormRow id="adminJobTitle" label={t("form.adminJobTitle")}>
                  <Input
                    id="adminJobTitle"
                    autoComplete="organization-title"
                    value={form.adminJobTitle}
                    onChange={(e) => set("adminJobTitle", e.target.value)}
                  />
                </FormRow>
              </div>

              {/* Required server-side ("Tell us your relationship to the
                  company"), so it is marked as such here — the field defaults
                  to a value, but labelling it Optional would be a lie. */}
              <FormRow
                id="adminRelationship"
                label={t("form.adminRelationship")}
                required
                error={errors.adminRelationship}
              >
                <Select
                  value={form.adminRelationship}
                  onValueChange={(value) => set("adminRelationship", value as AdminRelationship)}
                >
                  <SelectTrigger id="adminRelationship">
                    <SelectValue placeholder={t("common.select")} />
                  </SelectTrigger>
                  <SelectContent>
                    {ADMIN_RELATIONSHIPS.map((relationship) => (
                      <SelectItem key={relationship} value={relationship}>
                        {t(`relationship.${relationship}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormRow>
            </fieldset>
          )}

          {formError ? <StatusMessage>{formError}</StatusMessage> : null}

          {part === "company" ? (
            <SubmitButton type="button" onClick={goToAdmin}>
              {t("form.next")}
            </SubmitButton>
          ) : (
            <div className="ts-action-row flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                className="ts-back"
                onClick={() => {
                  setPart("company");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                {t("form.back")}
              </button>
              <SubmitButton loading={submitting} loadingLabel={t("form.submitting")}>
                {t("form.submit")}
              </SubmitButton>
            </div>
          )}
        </form>
      </StepCard>

      {quote ? (
        // Sticky so the total stays in view while the buyer works down a long
        // form — the number they are committing to should never scroll away.
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <section className="ts-card space-y-4 p-[1.25rem]">
            <h2 className="ts-card-title">{t("form.summaryTitle")}</h2>
            <hr className="ts-divider" />
            <QuoteLines quote={quote} />
          </section>
        </aside>
      ) : null}
    </div>
  );
}
