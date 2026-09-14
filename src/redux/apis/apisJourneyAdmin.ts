import axiosProductManagement from "../../utils/axiosProductManagment";
import axiosCustomerService from "../../utils/axiosCustomerService";
import axiosOnboardingService from "../../utils/axiosOnboardingService";

/**
 * Journey admin — two surfaces, one shape.
 *
 * The loan journey lives in product-service and is scoped to tenant + product;
 * onboarding lives in customer-service and is scoped to a country. Both answer
 * catalogues → steps → fields with the same field names, which is why one
 * screen drives both. The two differences that matter are encoded in
 * `JourneySurface` below: where the requests go, and whether reordering does
 * anything.
 *
 * See docs/JOURNEY_ADMIN_FLOW.md.
 */

/* ------------------------------------------------------------------ */
/* Envelope                                                            */
/* ------------------------------------------------------------------ */

/** Every 2xx body is `{ data, message, timestamp }`. */
const unwrap = <T,>(response: any): T => response?.data?.data ?? response?.data;

/**
 * A 422 carries the real reason in `details.reason`; `message` is only a
 * localised "Validation failed", which tells an operator nothing about which
 * step they may not move or which field they may not delete.
 */
export const journeyErrorMessage = (error: any, fallback: string): string => {
  const body = error?.response?.data;
  return (
    body?.details?.reason ||
    body?.details?.message ||
    body?.message ||
    error?.message ||
    fallback
  );
};

/* ------------------------------------------------------------------ */
/* Catalogues                                                          */
/* ------------------------------------------------------------------ */

export interface StepType {
  stepType: string;
  mandatory?: boolean;
  defaultDriver?: string;
  dependsOn?: string[];
  repeatable?: boolean;
  collectsFields?: boolean;
  label?: string;
}

export interface FieldType {
  fieldType: string;
  choice?: boolean;
  numeric?: boolean;
  collectsValue?: boolean;
  label?: string;
}

export interface StepDriver {
  driver?: string;
  stepDriver?: string;
  label?: string;
  collectsFields?: boolean;
}

/* ------------------------------------------------------------------ */
/* Steps and fields                                                    */
/* ------------------------------------------------------------------ */

export interface JourneyField {
  fieldKey: string;
  fieldType?: string;
  fieldOrder?: number;
  label?: string;
  labelEn?: string;
  labelAr?: string;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  enabled?: boolean;
  pii?: boolean;
  /** Raw JSON strings on the wire: `{regex, minLength, maxLength, min, max}`. */
  validation?: string | Record<string, any> | null;
  options?: string | any[] | null;
  lovSource?: string | null;
  visibleWhen?: string | Record<string, any> | null;
}

/** The wire wraps each field: `{ field, system, enabled }`. */
export interface JourneyFieldRow {
  field: JourneyField;
  system?: boolean;
  enabled?: boolean;
}

export interface JourneyStep {
  stepCode?: string;
  stepType?: string;
  stepOrder?: number;
  stepDriver?: string;
  label?: string;
  labelEn?: string;
  labelAr?: string;
  description?: string;
  descriptionAr?: string;
  timeoutMinutes?: number | null;
  maxAttempts?: number | null;
  visible?: boolean;
  blocking?: boolean;
  required?: boolean;
  providerCode?: string | null;
  config?: string | Record<string, any> | null;
  fields?: JourneyFieldRow[];
}

export interface JourneyStepRow {
  step: JourneyStep;
  enabled?: boolean;
  mandatory?: boolean;
}

export interface JourneyStepsResponse {
  templateId?: string;
  totalSteps?: number;
  enabledSteps?: number;
  steps: JourneyStepRow[];
}

/**
 * The wire is not consistent about wrapping.
 *
 * The fields endpoint answers `{ field, system, enabled }` per row, and the
 * docs describe that shape throughout — but the `fields` carried inside a step
 * on the steps endpoint come back flat. Reading one shape and being handed the
 * other is a crash, not a missing label, so both are accepted here and the
 * components see only the wrapped form.
 */
export const asFieldRow = (row: any): JourneyFieldRow => {
  if (row && typeof row === 'object' && row.field) {
    return { field: row.field || {}, system: row.system, enabled: row.enabled };
  }
  const field = (row || {}) as JourneyField;
  return { field, system: (row || {}).system, enabled: (row || {}).enabled };
};

/** Same question one level up: a step may or may not be wrapped in `{ step }`. */
export const asStepRow = (row: any): JourneyStepRow => {
  const step = row && row.step ? row.step : row || {};
  return {
    step: { ...step, fields: (step.fields || []).map(asFieldRow) },
    enabled: row?.enabled ?? step.enabled,
    mandatory: row?.mandatory ?? step.mandatory,
  };
};

/** A row's identity on the wire: loan journeys key on code, onboarding on type. */
export const stepKey = (row: JourneyStepRow): string =>
  row.step.stepCode || row.step.stepType || "";

/* ------------------------------------------------------------------ */
/* Loan journey — product-service                                      */
/* ------------------------------------------------------------------ */

const LOAN_BASE = "/api/v1/admin/products";

export async function getLoanStepTypes(): Promise<StepType[]> {
  return unwrap(await axiosProductManagement.get(`${LOAN_BASE}/journey/step-types`));
}

export async function getLoanFieldTypes(): Promise<FieldType[]> {
  return unwrap(await axiosProductManagement.get(`${LOAN_BASE}/journey/field-types`));
}

export async function getLoanDrivers(): Promise<StepDriver[]> {
  return unwrap(await axiosProductManagement.get(`${LOAN_BASE}/journey/drivers`));
}

export async function getLoanTemplates(productId: string) {
  return unwrap<any>(
    await axiosProductManagement.get(`${LOAN_BASE}/${productId}/journey/templates`)
  );
}

/** Admin view: disabled steps included, and each step carries its own fields. */
export async function getLoanSteps(productId: string): Promise<JourneyStepsResponse> {
  return unwrap(await axiosProductManagement.get(`${LOAN_BASE}/${productId}/journey/steps`));
}

/**
 * Replace-all. The list sent becomes the whole configuration — a step left out
 * is removed from the journey. Null fields fall back to what is stored, so
 * sending `{ stepCode }` alone reorders without touching labels or timeouts;
 * re-enabling a disabled step needs `enabled: true` written explicitly.
 *
 * `stepOrder` is not sent: the server renumbers 1..n from list order.
 */
export async function putLoanSteps(
  productId: string,
  steps: Array<Partial<JourneyStep> & { stepCode: string; enabled?: boolean }>
): Promise<JourneyStepsResponse> {
  return unwrap(
    await axiosProductManagement.put(`${LOAN_BASE}/${productId}/journey/steps`, { steps })
  );
}

export async function getLoanStepFields(productId: string, stepCode: string) {
  return unwrap<{ fields: JourneyFieldRow[] }>(
    await axiosProductManagement.get(`${LOAN_BASE}/${productId}/journey/steps/${stepCode}/fields`)
  );
}

/** Replace-all within the step. */
export async function putLoanStepFields(
  productId: string,
  stepCode: string,
  fields: Array<Partial<JourneyField> & { fieldKey: string }>
) {
  return unwrap<{ fields: JourneyFieldRow[] }>(
    await axiosProductManagement.put(
      `${LOAN_BASE}/${productId}/journey/steps/${stepCode}/fields`,
      { fields }
    )
  );
}

/* ------------------------------------------------------------------ */
/* Onboarding — customer-service                                       */
/* ------------------------------------------------------------------ */

const COUNTRY_BASE = "/api/v1/admin/country-config";

export async function getCountryStepTypes(): Promise<StepType[]> {
  return unwrap(await axiosCustomerService.get(`${COUNTRY_BASE}/step-types`));
}

export async function getCountryFieldTypes(): Promise<FieldType[]> {
  return unwrap(await axiosCustomerService.get(`${COUNTRY_BASE}/field-types`));
}

export async function getCountrySteps(countryCode: string): Promise<JourneyStepsResponse> {
  return unwrap(await axiosCustomerService.get(`${COUNTRY_BASE}/${countryCode}/steps`));
}

/**
 * Replace-all, same as the loan surface. Order here is display-only — the
 * workflow's activity sequence is fixed in Temporal — so the screen labels the
 * control accordingly rather than implying the flow changed.
 *
 * May answer 202 with a `requestId` instead of 200 when an approval chain is
 * configured for `COUNTRY_CONFIG`.
 */
export async function putCountrySteps(
  countryCode: string,
  steps: Array<Partial<JourneyStep> & { stepType: string; enabled?: boolean }>
) {
  const response = await axiosCustomerService.put(`${COUNTRY_BASE}/${countryCode}/steps`, {
    steps,
  });
  return { status: response.status, data: unwrap<any>(response) };
}

export async function getCountryStepFields(countryCode: string, stepType: string) {
  return unwrap<{ fields: JourneyFieldRow[] }>(
    await axiosCustomerService.get(`${COUNTRY_BASE}/${countryCode}/steps/${stepType}/fields`)
  );
}

export async function putCountryStepFields(
  countryCode: string,
  stepType: string,
  fields: Array<Partial<JourneyField> & { fieldKey: string }>
) {
  const response = await axiosCustomerService.put(
    `${COUNTRY_BASE}/${countryCode}/steps/${stepType}/fields`,
    { fields }
  );
  return { status: response.status, data: unwrap<any>(response) };
}

/**
 * The onboarding workflow caches step config, so a change is invisible to the
 * app until this is called.
 */
export async function refreshCountryStepCache(countryCode: string) {
  return axiosOnboardingService.post(
    `/internal/api/v1/onboarding/step-config/refresh?countryCode=${countryCode}`
  );
}
