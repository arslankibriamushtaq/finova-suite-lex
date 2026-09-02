import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

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
  createDraft,
  getDraft,
  patchAdmin,
  patchCompany,
  patchSelection,
  sendEmailOtp,
  submitSignup,
  toTenantSignupError,
  verifyEmailOtp,
  type AdminRelationship,
  type OtpChallenge,
  type SignupDraft,
} from "../../../redux/apis/apisTenantProvisioning";
import { getCurrentLanguage } from "../../../utils/acceptLanguage";
import { cn } from "../../../lib/utils";
import { normalizeDigits } from "../digits";
import {
  clearDraftId,
  getDraftId,
  getIdempotencyKey,
  setDraftId,
} from "../../../utils/tenantSignupSession";
import { DEFAULT_COUNTRY_CODE, getCountryOptions } from "../countries";
import FormRow from "../components/FormRow";
import StatusMessage from "../components/StatusMessage";
import SubmitButton from "../components/SubmitButton";
import { TENANT_SIGNUP_ROUTES } from "../navigation";
import { useTenantSignup } from "../TenantSignupContext";

/**
 * Screen 2 — the wizard, over one server-side draft.
 *
 * Four parts, four calls, and every one of them saves: a closed tab costs
 * nothing because `signupId` is in localStorage and the server holds the rest.
 *
 * The order is the contract's, and the email verification in the middle is not
 * optional — a draft whose company address is unproven cannot reach checkout by
 * any route, so a wizard that skipped it would produce signups nobody could pay
 * for.
 *
 * What the buyer typed stays in local state for the session. The server returns
 * the stored fields only once the address is verified, because a company email
 * is guessable and an unverified read must not disclose the record behind it —
 * so `form` here is the source of truth for the current visit, and the server
 * copy is what a *verified* resume gets back.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Saudi commercial registration: exactly ten digits. */
const CR_PATTERN = /^\d{10}$/;
/** ZATCA VAT registration: fifteen digits, first and last both 3. */
const VAT_PATTERN = /^3\d{13}3$/;
const CODE_PATTERN = /^\d{6}$/;

/** The gateway's own cooldown, mirrored so the button cannot be pressed into it. */
const RESEND_COOLDOWN_SECONDS = 60;

type Part = "company" | "verify" | "details" | "you";

type FormState = {
  companyName: string;
  companyEmail: string;
  crNumber: string;

  countryCode: string;
  vatNumber: string;
  companyNameAr: string;
  companyPhone: string;
  website: string;
  city: string;
  addressLine: string;
  postalCode: string;

  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminMobile: string;
  adminJobTitle: string;
  adminRelationship: AdminRelationship;
};

const EMPTY_FORM: FormState = {
  companyName: "",
  companyEmail: "",
  crNumber: "",
  countryCode: DEFAULT_COUNTRY_CODE,
  vatNumber: "",
  companyNameAr: "",
  companyPhone: "",
  website: "",
  city: "",
  addressLine: "",
  postalCode: "",
  adminFirstName: "",
  adminLastName: "",
  adminEmail: "",
  adminMobile: "",
  adminJobTitle: "",
  adminRelationship: "OWNER",
};

type Errors = Partial<Record<keyof FormState | "code" | "terms", string>>;

/** Only overwrite what the server actually holds; nulls are "not disclosed". */
const mergeDraft = (form: FormState, draft: SignupDraft): FormState => {
  const next = { ...form };
  (Object.keys(EMPTY_FORM) as (keyof FormState)[]).forEach((key) => {
    const value = draft[key as keyof SignupDraft];
    if (typeof value === "string" && value) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (next as any)[key] = value;
    }
  });
  return next;
};

export default function BusinessInfoStep() {
  const { t } = useTranslation("tenantSignup");
  const navigate = useNavigate();

  const { packageCodes, billingCycle, acceptSignup } = useTenantSignup();

  const [part, setPart] = useState<Part>("company");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [terms, setTerms] = useState(false);

  const [draft, setDraft] = useState<SignupDraft | null>(null);
  const [challenge, setChallenge] = useState<OtpChallenge | null>(null);
  const [code, setCode] = useState("");
  const [cooldown, setCooldown] = useState(0);

  // One key per wizard, reused on retry: a double-click or a flaky network then
  // resumes the original draft instead of opening a second one.
  const idempotencyKey = useRef(getIdempotencyKey());
  const resumed = useRef(false);

  const countryOptions = getCountryOptions();

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  /** Nothing to buy means nothing to price — the plan is chosen next door. */
  useEffect(() => {
    if (packageCodes.length === 0) {
      navigate(TENANT_SIGNUP_ROUTES.pricing, { replace: true });
    }
  }, [packageCodes.length, navigate]);

  /**
   * Resume.
   *
   * `emailVerified` and `adminProvided` are what decide where the buyer lands —
   * they are the server's answer to "which step is this actually up to", which
   * beats any counter this app could keep across a closed tab.
   */
  useEffect(() => {
    const id = getDraftId();
    if (!id || resumed.current) return;
    resumed.current = true;

    getDraft(id)
      .then(async (found) => {
        setDraft(found);
        setForm((current) => mergeDraft(current, found));

        // The buyer may have changed their mind on the pricing page since. The
        // draft is what gets charged, so it has to be re-priced rather than the
        // basket quietly disagreeing with the invoice.
        const sameCycle = found.billingCycle === billingCycle;
        const sameCodes =
          found.packageCodes.length === packageCodes.length &&
          packageCodes.every((codeName) => found.packageCodes.includes(codeName));

        if (!sameCycle || !sameCodes) {
          try {
            setDraft(await patchSelection(id, { packageCodes, billingCycle }));
          } catch {
            /* A re-price failure is not worth blocking the wizard for; submit
               will refuse loudly if the draft is genuinely unusable. */
          }
        }

        // An unverified draft resumes at part ONE, not at the code screen.
        //
        // Two reasons, and the second is the bug this fixes. A challenge only
        // exists for as long as the page that requested it, so a resumed verify
        // screen had a code field, a Continue button and nothing behind either
        // of them. And the server discloses only step-1 fields until the
        // address is proven — so part one is the one screen whose contents we
        // can actually show. Continuing from there re-sends the code, which is
        // the documented path back in.
        if (!found.emailVerified) setPart("company");
        else if (!found.adminProvided) setPart("details");
        else setPart("you");
      })
      .catch(() => {
        // Paid, expired, or simply gone. Nothing here can tell which, and a
        // handle that no longer opens anything is worse than none.
        clearDraftId();
      });
  }, [billingCycle, packageCodes]);

  /** The resend cooldown, mirrored from the gateway's own throttle. */
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [cooldown]);

  const requestCode = useCallback(async (signupId: string) => {
    setChallenge(await sendEmailOtp(signupId));
    setCooldown(RESEND_COOLDOWN_SECONDS);
  }, []);

  // --- part 1: the company, and the plan ---------------------------------
  const submitCompany = async () => {
    const found: Errors = {};
    if (!form.companyName.trim()) found.companyName = t("common.error.required");
    if (!EMAIL_PATTERN.test(form.companyEmail.trim())) found.companyEmail = t("error.email");
    if (form.crNumber && !CR_PATTERN.test(form.crNumber)) found.crNumber = t("error.crNumber");

    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setBusy(true);
    setFormError(null);
    try {
      const created = await createDraft(
        {
          companyName: form.companyName.trim(),
          companyEmail: form.companyEmail.trim(),
          crNumber: form.crNumber.trim() || undefined,
          billingCycle,
          packageCodes,
          locale: getCurrentLanguage(),
        },
        idempotencyKey.current
      );

      setDraftId(created.signupId);
      setDraft(created);
      // A resumed draft comes back with its verification cleared, which is why
      // this always goes on to ask for a code rather than trusting a flag.
      if (created.emailVerified === false && created.referenceNo) {
        setNotice(created.adminProvided ? t("wizard.resumed") : null);
      }
      await requestCode(created.signupId);
      setPart("verify");
    } catch (error) {
      const failure = toTenantSignupError(error, t("common.error.generic"));
      if (failure.code === "TENANCY.TENANT.DUPLICATE_EMAIL") {
        setFormError(failure.message);
      } else if (failure.details) {
        setErrors(failure.details as Errors);
      } else {
        setFormError(failure.message);
      }
    } finally {
      setBusy(false);
    }
  };

  // --- part 2: prove the company address ---------------------------------
  const submitCode = async () => {
    if (!draft) return;

    // No challenge means no code has been sent yet — which is a state the
    // buyer can reach by reloading. Send one rather than failing silently: a
    // primary action that does nothing at all is the worst kind of bug,
    // because there is nothing on screen to report.
    if (!challenge) {
      setBusy(true);
      setFormError(null);
      try {
        await requestCode(draft.signupId);
      } catch (error) {
        setFormError(toTenantSignupError(error, t("common.error.generic")).message);
      } finally {
        setBusy(false);
      }
      return;
    }

    if (!CODE_PATTERN.test(code)) {
      setErrors({ code: t("wizard.error.code") });
      return;
    }

    setBusy(true);
    setFormError(null);
    try {
      const verified = await verifyEmailOtp(draft.signupId, {
        challengeId: challenge.challengeId,
        code,
      });
      setDraft(verified);
      setForm((current) => mergeDraft(current, verified));
      setPart(verified.adminProvided ? "you" : "details");
    } catch (error) {
      const failure = toTenantSignupError(error, t("common.error.generic"));
      switch (failure.code) {
        case "TENANCY.SIGNUP.EMAIL_ALREADY_VERIFIED":
          // Nothing to prove; do not strand them on this screen.
          setPart("details");
          break;
        case "TENANCY.OTP.EXPIRED":
        case "TENANCY.OTP.MISMATCHED_CHALLENGE":
          setChallenge(null);
          setFormError(failure.message);
          break;
        default:
          setErrors({ code: failure.message });
      }
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    if (!draft || cooldown > 0) return;
    setBusy(true);
    setFormError(null);
    try {
      await requestCode(draft.signupId);
      setNotice(t("wizard.verify.sent"));
    } catch (error) {
      setFormError(toTenantSignupError(error, t("common.error.generic")).message);
    } finally {
      setBusy(false);
    }
  };

  // --- part 3: the rest of the company -----------------------------------
  const submitCompanyDetails = async () => {
    if (!draft) return;

    const found: Errors = {};
    if (form.vatNumber && !VAT_PATTERN.test(form.vatNumber)) found.vatNumber = t("error.vatNumber");
    if (form.website && !/^https?:\/\//i.test(form.website.trim())) {
      found.website = t("error.website");
    }

    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setBusy(true);
    setFormError(null);
    try {
      const saved = await patchCompany(draft.signupId, {
        countryCode: form.countryCode,
        vatNumber: form.vatNumber.trim() || undefined,
        companyNameAr: form.companyNameAr.trim() || undefined,
        companyPhone: form.companyPhone.trim() || undefined,
        website: form.website.trim() || undefined,
        city: form.city.trim() || undefined,
        addressLine: form.addressLine.trim() || undefined,
        postalCode: form.postalCode.trim() || undefined,
      });
      setDraft(saved);
      setPart("you");
    } catch (error) {
      const failure = toTenantSignupError(error, t("common.error.generic"));
      if (failure.code === "TENANCY.SIGNUP.EMAIL_NOT_VERIFIED") setPart("verify");
      else if (failure.details) setErrors(failure.details as Errors);
      else setFormError(failure.message);
    } finally {
      setBusy(false);
    }
  };

  // --- part 4: you, then submit ------------------------------------------
  const submitYou = async () => {
    if (!draft) return;

    const found: Errors = {};
    if (!form.adminFirstName.trim()) found.adminFirstName = t("common.error.required");
    if (!EMAIL_PATTERN.test(form.adminEmail.trim())) found.adminEmail = t("error.email");
    if (!terms) found.terms = t("wizard.terms.required");

    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setBusy(true);
    setFormError(null);
    try {
      await patchAdmin(draft.signupId, {
        adminFirstName: form.adminFirstName.trim(),
        adminLastName: form.adminLastName.trim() || undefined,
        adminEmail: form.adminEmail.trim(),
        adminMobile: form.adminMobile.trim() || undefined,
        adminJobTitle: form.adminJobTitle.trim() || undefined,
        adminRelationship: form.adminRelationship,
      });

      // Submitting is what makes the draft payable, and it is what freezes the
      // quote for 72 hours. The amount it returns is the one that will be
      // charged — the payment screen renders that, never a recomputed total.
      acceptSignup(await submitSignup(draft.signupId));
      navigate(TENANT_SIGNUP_ROUTES.payment);
    } catch (error) {
      const failure = toTenantSignupError(error, t("common.error.generic"));
      switch (failure.code) {
        case "TENANCY.SIGNUP.EMAIL_NOT_VERIFIED":
          setPart("verify");
          break;
        case "TENANCY.SIGNUP.QUOTE_EXPIRED":
          clearDraftId();
          setFormError(t("payment.quoteExpired"));
          break;
        case "TENANCY.SIGNUP.NOT_DRAFT":
          // Already submitted — the payment screen is where they belong.
          navigate(TENANT_SIGNUP_ROUTES.payment);
          break;
        default:
          if (failure.details) setErrors(failure.details as Errors);
          else setFormError(failure.message);
      }
    } finally {
      setBusy(false);
    }
  };

  /**
   * Back.
   *
   * Verify and Details both return to part one rather than to the part directly
   * above them: verification is a gate, not a form, and reopening it once the
   * address is proven would show a code field for an address that no longer
   * needs one. Part one is where the only editable thing behind them lives.
   *
   * Re-submitting part one with an unchanged address still costs a fresh code —
   * the server clears the verification whenever a draft is resumed by email,
   * because an address is guessable and a proven tick must not be inheritable.
   * That is the contract, not a quirk worth working around.
   */
  const goBack = () => {
    setFormError(null);
    setErrors({});
    // state.resume marks this as a step back inside the flow rather than a
    // fresh arrival, so the pricing page keeps the basket instead of
    // clearing it.
    if (part === "company") {
      navigate(TENANT_SIGNUP_ROUTES.pricing, { state: { resume: true } });
    } else if (part === "you") setPart("details");
    else setPart("company");
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    if (part === "company") void submitCompany();
    else if (part === "verify") void submitCode();
    else if (part === "details") void submitCompanyDetails();
    else void submitYou();
  };

  const sameEmail =
    form.adminEmail.trim().length > 0 &&
    form.adminEmail.trim().toLowerCase() === form.companyEmail.trim().toLowerCase();

  return (
    <form onSubmit={onSubmit} noValidate className="ts-wizard space-y-6">
      {notice && <p className="ts-notice">{notice}</p>}

      {/* --- 1. Business Details ---------------------------------------- */}
      <section className="ts-fieldset" data-state={part === "company" ? "open" : "done"}>
        <h2 className="ts-fieldset__title">
          <span className="ts-fieldset__num">1</span>
          {t("wizard.section.business")}
        </h2>

        {part === "company" ? (
          <div className="grid gap-x-4 gap-y-3.5 sm:grid-cols-2">
            <FormRow
              id="companyName"
              label={t("form.companyName")}
              required
              error={errors.companyName}
            >
              <Input
                id="companyName"
                autoComplete="organization"
                value={form.companyName}
                aria-invalid={Boolean(errors.companyName)}
                onChange={(e) => set("companyName", e.target.value)}
              />
            </FormRow>

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

            <FormRow
              id="crNumber"
              label={t("form.crNumber")}
              hint={t("form.crNumber.hint")}
              error={errors.crNumber}
              className="sm:col-span-2"
            >
              <Input
                id="crNumber"
                inputMode="numeric"
                dir="ltr"
                maxLength={10}
                value={form.crNumber}
                aria-invalid={Boolean(errors.crNumber)}
                aria-describedby="crNumber-hint"
                // Separators and Arabic-Indic numerals are normalised as they
                // are typed, so a pasted "1010-101010" becomes a valid CR
                // instead of an error whose cause is invisible.
                onChange={(e) => set("crNumber", normalizeDigits(e.target.value))}
              />
            </FormRow>
          </div>
        ) : (
          // A fixed separator prints a stray dot whenever one side is
          // missing, and the server withholds the company name until the
          // address is verified — so on a resume it printed exactly that.
          <p className="ts-fieldset__summary" dir="ltr">
            {[form.companyName, form.companyEmail].filter(Boolean).join(" · ")}
          </p>
        )}
      </section>

      {/* --- 2. Verify -------------------------------------------------- */}
      {part !== "company" && (
        <section className="ts-fieldset" data-state={part === "verify" ? "open" : "done"}>
          <h2 className="ts-fieldset__title">
            <span className="ts-fieldset__num">2</span>
            {t("wizard.section.verify")}
          </h2>

          {part === "verify" ? (
            <div className="max-w-md">
              <p className="ts-xs mb-3.5 text-muted-foreground">
                {challenge
                  ? t("wizard.verify.sub", { email: challenge.maskedEmail || form.companyEmail })
                  : t("wizard.verify.send")}
              </p>

              <FormRow id="code" label={t("wizard.verify.code")} required error={errors.code}>
                <Input
                  id="code"
                  inputMode="numeric"
                  dir="ltr"
                  maxLength={6}
                  autoComplete="one-time-code"
                  className="ts-otp"
                  disabled={!challenge}
                  value={code}
                  aria-invalid={Boolean(errors.code)}
                  onChange={(e) => {
                    setCode(normalizeDigits(e.target.value).slice(0, 6));
                    setErrors((current) => ({ ...current, code: undefined }));
                  }}
                />
              </FormRow>

              {/* Driven off the gateway's own counters, so the button is never
                  pressable into a throttle it will be refused by. */}
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  className="ts-link ts-xs"
                  disabled={busy || cooldown > 0 || challenge?.resendsRemaining === 0}
                  onClick={() => void resend()}
                >
                  {cooldown > 0
                    ? t("wizard.verify.resendIn", { seconds: cooldown })
                    : t("wizard.verify.resend")}
                </button>
                {challenge && challenge.resendsRemaining > 0 && (
                  <span className="ts-xs text-muted-foreground">
                    {t("wizard.verify.resendsLeft", { count: challenge.resendsRemaining })}
                  </span>
                )}
                {challenge?.resendsRemaining === 0 && (
                  <span className="ts-xs text-muted-foreground">{t("wizard.verify.noneLeft")}</span>
                )}
              </div>
            </div>
          ) : (
            <p className="ts-fieldset__summary inline-flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-[var(--primary)]" aria-hidden="true" />
              <span dir="ltr">{form.companyEmail}</span>
            </p>
          )}
        </section>
      )}

      {/* --- 3. Company details ----------------------------------------- */}
      {(part === "details" || part === "you") && (
        <section className="ts-fieldset" data-state={part === "details" ? "open" : "done"}>
          <h2 className="ts-fieldset__title">
            <span className="ts-fieldset__num">3</span>
            {t("wizard.section.company")}
          </h2>

          {part === "details" ? (
            <div className="grid gap-x-4 gap-y-3.5 sm:grid-cols-2 min-[1400px]:grid-cols-3">
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

              <FormRow id="companyNameAr" label={t("form.companyNameAr")}>
                <Input
                  id="companyNameAr"
                  dir="rtl"
                  value={form.companyNameAr}
                  onChange={(e) => set("companyNameAr", e.target.value)}
                />
              </FormRow>

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

              <FormRow id="city" label={t("form.city")}>
                <Input
                  id="city"
                  autoComplete="address-level2"
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                />
              </FormRow>

              <FormRow
                id="addressLine"
                label={t("form.addressLine")}
                className="sm:col-span-2 min-[1400px]:col-span-2"
              >
                <Input
                  id="addressLine"
                  autoComplete="street-address"
                  value={form.addressLine}
                  onChange={(e) => set("addressLine", e.target.value)}
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
          ) : (
            <p className="ts-fieldset__summary">
              {[form.countryCode, form.city].filter(Boolean).join(" · ")}
            </p>
          )}
        </section>
      )}

      {/* --- 4. You ------------------------------------------------------ */}
      {part === "you" && (
        <section className="ts-fieldset" data-state="open">
          <h2 className="ts-fieldset__title">
            <span className="ts-fieldset__num">4</span>
            {t("wizard.section.you")}
          </h2>

          {/* Not "administrator details". The admin* prefix names the role this
              person is about to be given, not a third party being asked about —
              and reading it the other way is what locks an owner out of the
              workspace they just paid for. */}
          <p className="ts-xs mb-3.5 text-muted-foreground">{t("wizard.you.hint")}</p>

          <div className="grid gap-x-4 gap-y-3.5 sm:grid-cols-2 min-[1400px]:grid-cols-3">
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

            <FormRow
              id="adminEmail"
              label={t("wizard.you.email")}
              required
              hint={sameEmail ? t("wizard.you.sameAsCompany") : t("form.adminEmail.hint")}
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
          </div>

          <label className="ts-terms">
            <input
              type="checkbox"
              checked={terms}
              onChange={(e) => {
                setTerms(e.target.checked);
                setErrors((current) => ({ ...current, terms: undefined }));
              }}
            />
            <span>{t("wizard.terms")}</span>
          </label>
          {errors.terms && (
            <p role="alert" className="ts-xs mt-1 text-destructive">
              {errors.terms}
            </p>
          )}
        </section>
      )}

      {formError && <StatusMessage>{formError}</StatusMessage>}

      <div className="ts-action-row flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
        {/* A real button, not a link: it changes what is on screen rather than
            where the browser is, except on part one where it genuinely leaves. */}
        <button type="button" className="ts-back" onClick={goBack} disabled={busy}>
          {t("form.back")}
        </button>
        <SubmitButton
          loading={busy}
          loadingLabel={t("form.submitting")}
          className="sm:w-auto sm:min-w-40"
        >
          {part === "you"
            ? t("form.submit")
            : part === "verify" && !challenge
              ? t("wizard.verify.send")
              : t("form.next")}
        </SubmitButton>
      </div>
    </form>
  );
}
