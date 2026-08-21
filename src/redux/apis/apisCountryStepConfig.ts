import axiosCustomerService from "../../utils/axiosCustomerService";

/**
 * Country onboarding step configuration — the admin side.
 *
 * Contract: `customer-service`, base path `/api/v1/admin/country-config`
 * (see docs `ONBOARDING_STEP_CONFIG_ADMIN_API`). Permissions
 * `country-config:read` / `country-config:update`; the JWT must carry a
 * `tenant_id` claim or every call answers 422.
 *
 * Two properties of this API shape the whole screen:
 *
 *  1. **`PUT` is replace-all.** Any step left out of the payload is deleted.
 *     The editor therefore always holds the complete list and always sends it
 *     back — there is no partial save.
 *  2. **`config` is a JSON *string*, not an object.** It is stored as free-form
 *     JSONB so a new toggle needs no migration, and it round-trips as text.
 *     Parse on load, re-stringify on save.
 *
 * Every function returns the unwrapped `data` payload rather than the axios
 * response — the `{ data, message, timestamp }` envelope carries nothing the
 * screen needs.
 */

const BASE = "/api/v1/admin/country-config";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** One row of the closed catalogue from `GET /step-types`. */
export interface StepTypeOption {
  stepType: string;
  mandatory: boolean;
}

export interface CountryOnboardingStep {
  stepOrder: number;
  stepType: string;
  label?: string | null;
  labelAr?: string | null;
  description?: string | null;
  providerCode?: string | null;
  signalWait?: boolean;
  timeoutMinutes?: number;
  required?: boolean;
  enabled: boolean;
  /** Server-derived: this step type can never be disabled or omitted. */
  mandatory: boolean;
  /** A JSON string — see `parseStepConfig`. */
  config?: string | null;
}

export interface CountryStepConfig {
  countryCode: string;
  totalSteps: number;
  enabledSteps: number;
  steps: CountryOnboardingStep[];
}

/** What `PUT` accepts. Every field but `stepType` is null-means-keep. */
export interface CountryOnboardingStepInput {
  stepType: string;
  stepOrder?: number;
  label?: string | null;
  labelAr?: string | null;
  description?: string | null;
  providerCode?: string | null;
  signalWait?: boolean;
  timeoutMinutes?: number;
  required?: boolean;
  enabled?: boolean;
  config?: string | null;
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

const unwrap = <T>(res: { data?: { data?: T } }): T => res?.data?.data as T;

/**
 * The closed catalogue of step types the platform implements. Safe to cache for
 * the life of the session — it is a code-level constant, not tenant data.
 */
export function getStepTypes(): Promise<StepTypeOption[]> {
  return axiosCustomerService
    .get(`${BASE}/step-types`)
    .then((res) => (unwrap<StepTypeOption[]>(res) ?? []) as StepTypeOption[]);
}

/**
 * Every configured step for a country, **disabled ones included**. That is the
 * difference from the public applicant endpoint, and the reason the admin
 * screen must not be built on that one: an operator has to see what they
 * switched off in order to switch it back on.
 */
export function getCountrySteps(countryCode: string): Promise<CountryStepConfig> {
  return axiosCustomerService
    .get(`${BASE}/${countryCode}/steps`)
    .then((res) => unwrap<CountryStepConfig>(res));
}

/**
 * Replace the whole configuration.
 *
 * Returns the configuration **as persisted** — `stepOrder` is renumbered
 * server-side, so the response is the only accurate view of what the app will
 * render. Callers should re-render from it rather than from local state.
 */
export function saveCountrySteps(
  countryCode: string,
  steps: CountryOnboardingStepInput[]
): Promise<CountryStepConfig> {
  return axiosCustomerService
    .put(`${BASE}/${countryCode}/steps`, { steps })
    .then((res) => unwrap<CountryStepConfig>(res));
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

interface StepConfigFailure {
  response?: { status?: number; data?: { code?: string; message?: string } };
}

export const stepConfigErrorCode = (error: unknown): string | undefined =>
  (error as StepConfigFailure)?.response?.data?.code;

export const stepConfigErrorStatus = (error: unknown): number | undefined =>
  (error as StepConfigFailure)?.response?.status;

/**
 * Resolve a failure to something worth showing.
 *
 * Switches on `code` and falls back to the server's `message` — never to a
 * generic "Save failed". The 422 messages on this API name the offending step
 * ("Step NAFATH_VERIFICATION is mandatory…") and are localized by
 * `Accept-Language`; replacing them with our own wording throws away the
 * explanation. `error` is localized too, which is why nothing here reads it.
 */
export const stepConfigErrorMessage = (
  error: unknown,
  fallback: string,
  byCode: Record<string, string> = {}
): string => {
  const code = stepConfigErrorCode(error);
  const status = stepConfigErrorStatus(error);

  // Server-authored 422 text is more specific than anything mapped by code.
  const serverMessage = (error as StepConfigFailure)?.response?.data?.message;
  if (status === 422 && serverMessage) return serverMessage;

  if (code && byCode[code]) return byCode[code];

  // A 502/504 is Kong's own body, not JSON from customer-service.
  if (status === 502 || status === 504) return `${fallback} (the service could not be reached)`;

  return serverMessage || fallback;
};

// ---------------------------------------------------------------------------
// `config` — the behaviour toggles
// ---------------------------------------------------------------------------

/**
 * The only two step types whose `config` the backend actually reads. Everything
 * else carries descriptive metadata that no code branches on — so the screen
 * must not present those as switches, or it promises effects that do not exist.
 */
export const GATED_STEP_TYPES = ["PEP_SCREENING", "ADDITIONAL_INFO"] as const;

export const isGatedStepType = (stepType: string): boolean =>
  (GATED_STEP_TYPES as readonly string[]).includes(stepType);

export interface PepScreeningConfig {
  pep?: { enabled?: boolean };
  sanctions?: { enabled?: boolean; blockOnHit?: boolean };
  aml?: { enabled?: boolean };
}

export interface AdditionalInfoConfig {
  fetchSalary?: boolean;
  requireBank?: boolean;
}

/** Parse the JSON string. An unparseable or absent config is an empty object. */
export const parseStepConfig = (config?: string | null): Record<string, unknown> => {
  if (!config || typeof config !== "string") return {};
  try {
    const parsed = JSON.parse(config);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

export const stringifyStepConfig = (config: Record<string, unknown>): string =>
  JSON.stringify(config);

/** Whether a raw config string is valid JSON — the raw editor gates saving on it. */
export const isValidConfigJson = (raw: string): boolean => {
  if (!raw.trim()) return true;
  try {
    const parsed = JSON.parse(raw);
    return parsed !== null && typeof parsed === "object" && !Array.isArray(parsed);
  } catch {
    return false;
  }
};

/** Read a nested boolean gate, defaulting to `false` when the key is absent. */
export const readGate = (config: Record<string, unknown>, path: string[]): boolean => {
  let node: unknown = config;
  for (const key of path) {
    if (!node || typeof node !== "object") return false;
    node = (node as Record<string, unknown>)[key];
  }
  return node === true;
};

/** Set a nested boolean gate, creating intermediate objects. Returns a new object. */
export const writeGate = (
  config: Record<string, unknown>,
  path: string[],
  value: boolean
): Record<string, unknown> => {
  const next: Record<string, unknown> = { ...config };
  let node = next;
  for (let i = 0; i < path.length - 1; i += 1) {
    const key = path[i];
    const child = node[key];
    node[key] =
      child && typeof child === "object" && !Array.isArray(child)
        ? { ...(child as Record<string, unknown>) }
        : {};
    node = node[key] as Record<string, unknown>;
  }
  node[path[path.length - 1]] = value;
  return next;
};

// ---------------------------------------------------------------------------
// Seeding
// ---------------------------------------------------------------------------

/**
 * The eight-step default journey, used for "seed default steps" on a country
 * that has none and to prefill a step added from the catalogue.
 *
 * Labels are supplied rather than left to the server: `PUT` treats a missing
 * label as "keep the stored one", and a brand-new step has none stored — so
 * omitting them would seed a journey whose screens have no titles. They are
 * editable afterwards.
 */
export const DEFAULT_STEP_SEED: Record<
  string,
  { label: string; labelAr: string; description: string; providerCode?: string; config?: string }
> = {
  MOBILE_VERIFICATION: {
    label: "Mobile Verification",
    labelAr: "التحقق من الجوال",
    description: "Verify mobile number ownership",
    providerCode: "TAHAKUK",
  },
  OTP_VERIFICATION: {
    label: "OTP Verification",
    labelAr: "التحقق من رمز التحقق",
    description: "One-time password sent to the registered mobile",
  },
  TERMS_AND_CONDITIONS: {
    label: "Terms & Conditions",
    labelAr: "الشروط والأحكام",
    description: "Accept the terms and conditions",
  },
  NAFATH_VERIFICATION: {
    label: "Identity Verification",
    labelAr: "التحقق من الهوية",
    description: "National identity verification via Nafath",
    providerCode: "NAFATH",
  },
  ADDITIONAL_INFO: {
    label: "Additional Information",
    labelAr: "معلومات إضافية",
    description: "Employment, income and address details",
    config: '{"fetchSalary":true,"requireBank":true}',
  },
  PEP_SCREENING: {
    label: "Security Screening",
    labelAr: "الفحص الأمني",
    description: "PEP & sanctions screening and risk assessment",
    providerCode: "SAMA_SANCTIONS",
    config:
      '{"pep":{"enabled":true},"sanctions":{"enabled":true,"blockOnHit":false},"aml":{"enabled":true}}',
  },
  PIN_SETUP: {
    label: "PIN Setup",
    labelAr: "إعداد رمز الدخول",
    description: "Choose the app access PIN",
  },
  COMPLETION: {
    label: "Completion",
    labelAr: "اكتمال التسجيل",
    description: "Onboarding complete",
  },
};

/** The canonical order the eight default steps are seeded in. */
export const DEFAULT_STEP_ORDER: string[] = [
  "MOBILE_VERIFICATION",
  "OTP_VERIFICATION",
  "TERMS_AND_CONDITIONS",
  "NAFATH_VERIFICATION",
  "ADDITIONAL_INFO",
  "PEP_SCREENING",
  "PIN_SETUP",
  "COMPLETION",
];

// ---------------------------------------------------------------------------
// Client-side validation
// ---------------------------------------------------------------------------

export type StepListProblemCode =
  | "EMPTY"
  | "ALL_DISABLED"
  | "MANDATORY_DISABLED"
  | "MANDATORY_MISSING"
  | "DUPLICATE"
  | "INVALID_CONFIG";

export interface StepListProblem {
  code: StepListProblemCode;
  /** The step types the problem names, for the message. */
  steps: string[];
}

/**
 * The rules the API answers 422 for, checked here first.
 *
 * Not a replacement for the server check — the server stays the authority and
 * its message is the one shown when it does refuse. This exists so the common
 * mistakes are caught while the operator is still looking at the row that
 * caused them, rather than after a round trip that discards nothing but reads
 * like a failure.
 */
export const validateStepList = (
  steps: Array<{ stepType: string; enabled: boolean; configValid?: boolean }>,
  catalogue: StepTypeOption[]
): StepListProblem[] => {
  const problems: StepListProblem[] = [];

  if (steps.length === 0) {
    problems.push({ code: "EMPTY", steps: [] });
    return problems;
  }

  const duplicates = steps
    .map((s) => s.stepType)
    .filter((type, index, all) => all.indexOf(type) !== index);
  if (duplicates.length) {
    problems.push({ code: "DUPLICATE", steps: Array.from(new Set(duplicates)) });
  }

  if (!steps.some((s) => s.enabled)) {
    problems.push({ code: "ALL_DISABLED", steps: [] });
  }

  const mandatoryTypes = catalogue.filter((c) => c.mandatory).map((c) => c.stepType);

  const disabledMandatory = steps
    .filter((s) => mandatoryTypes.includes(s.stepType) && !s.enabled)
    .map((s) => s.stepType);
  if (disabledMandatory.length) {
    problems.push({ code: "MANDATORY_DISABLED", steps: disabledMandatory });
  }

  const present = steps.map((s) => s.stepType);
  const missingMandatory = mandatoryTypes.filter((type) => !present.includes(type));
  if (missingMandatory.length) {
    problems.push({ code: "MANDATORY_MISSING", steps: missingMandatory });
  }

  const invalidConfig = steps.filter((s) => s.configValid === false).map((s) => s.stepType);
  if (invalidConfig.length) {
    problems.push({ code: "INVALID_CONFIG", steps: invalidConfig });
  }

  return problems;
};
