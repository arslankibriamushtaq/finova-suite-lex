import { lexConfigApi } from "../../utils/axiosLexService";
import { getProductsList } from "./apisCrudProductManagement";
import {
  clean,
  pageOf,
  toServerPage,
  unwrap,
  unwrapList,
  type LexConfigStatus,
  type LexPage,
  type LexPageQuery,
} from "./apisLexCore";

/**
 * lex-config-service (:8201) — the authority ladder, the rule library, the
 * delegation of authority and the SLA targets.
 *
 * Casbin objects: `lex.config.levels`, `lex.config.processes`,
 * `lex.config.delegation`, `lex.config.sla`.
 *
 * Three of the four share one lifecycle exactly:
 *
 *   create draft → edit draft → PUBLISH → (immutable)
 *                                   └─ to change it: CLONE → new draft → PUBLISH
 *
 * There is no "update published" verb because there is no such operation, and
 * only one open draft may exist per lineage so two admins cannot silently
 * diverge the same rule. Published records are archived, never deleted.
 */

const PROCESSES = "/api/v1/lex/config/processes";
const DELEGATION = "/api/v1/lex/config/delegation";
const SLA = "/api/v1/lex/config/sla";
const LEVELS = "/api/v1/lex/config/levels";

/* ------------------------------------------------------------------ */
/* Authority levels                                                    */
/* ------------------------------------------------------------------ */

/**
 * The delegation ladder. L0, L1 and L2 are active at go-live; L3 is a POST, not
 * a release.
 *
 * Escalation moves to the next-highest ordinal, so the ordinal *is* the
 * escalation path. Routing, the DoA configurator and the authority matrix all
 * read this list — nothing in the UI may hardcode a level.
 */
export interface LexAuthorityLevel {
  id: string;
  /** Identity. Normalised to upper case, unique per company, cannot change. */
  code: string;
  displayName: string;
  /** Unique, ascending. The escalation path. */
  ordinal: number;
  active: boolean;
}

export const getAuthorityLevels = async (
  params: { activeOnly?: boolean } = {}
): Promise<LexAuthorityLevel[]> => {
  return unwrapList(await lexConfigApi.get(LEVELS, { params: clean(params) }));
};

export const getAuthorityLevel = async (id: string): Promise<LexAuthorityLevel> =>
  unwrap(await lexConfigApi.get(`${LEVELS}/${id}`));

export const createAuthorityLevel = async (body: {
  code: string;
  displayName: string;
  ordinal: number;
}): Promise<LexAuthorityLevel> => unwrap(await lexConfigApi.post(LEVELS, body));

/**
 * `code` is identity and is not sent on update — the form disables it rather
 * than letting a save fail.
 */
export const updateAuthorityLevel = async (
  id: string,
  body: { displayName?: string; ordinal?: number; active?: boolean }
): Promise<LexAuthorityLevel> => unwrap(await lexConfigApi.put(`${LEVELS}/${id}`, body));

/**
 * Deactivate, never delete: this removes the level from routing without erasing
 * the history of the cases it decided. There is no delete endpoint.
 */
export const setAuthorityLevelActive = async (
  id: string,
  active: boolean
): Promise<LexAuthorityLevel> => unwrap(await lexConfigApi.put(`${LEVELS}/${id}`, { active }));

/* ------------------------------------------------------------------ */
/* Products — the LOS half of every scope                              */
/* ------------------------------------------------------------------ */

/** Just enough of a LOS product to fill a scope picker. */
export interface LexScopeProduct {
  id: string;
  name: string;
}

/**
 * The Product half of a scope, read from LOS (`product-service`).
 *
 * **LEX does not validate product ids** — the catalogue belongs to another
 * service and this one deliberately does not reach into it. So this list is
 * only ever the picker's options; a scope carrying an id LEX has never seen is
 * accepted, which is why the picker matters more here than for sectors.
 *
 * The response shape is normalised defensively because it comes from outside
 * LEX and is not covered by the LEX response envelope.
 */
export const getScopeProducts = async (): Promise<LexScopeProduct[]> => {
  const response = await getProductsList();
  const rows = findRows(response?.data);
  if (!rows.length) return [];

  return rows
    .map((row) => {
      const item = row as Record<string, unknown>;
      const id = item.id ?? item.productId ?? item.uuid;
      if (!id) return null;

      // `product-service` names the column `nameEn` (and `name_en` on some
      // payloads); the generic `name` is the fallback, not the first guess.
      // Getting this order wrong is why the picker showed raw UUIDs.
      const name = firstText(
        item.nameEn,
        item.name_en,
        item.name,
        item.productName,
        item.displayName,
        item.title,
        item.nameAr,
        item.name_ar
      );

      // Falling back to the id keeps the option selectable — a scope that
      // already names this product must not vanish just because the catalogue
      // stopped labelling it.
      return { id: String(id), name: name ?? String(id) };
    })
    .filter((item): item is LexScopeProduct => item !== null);
};

/**
 * The row array inside a response this service does not own.
 *
 * `product-service` has been seen wrapping its list as `data`, `data.data`,
 * `data.content` and `data.data.content` depending on the endpoint. Rather than
 * encode one of those and break on the next, this walks a bounded number of
 * levels down the usual keys and takes the first array it finds.
 */
const findRows = (body: unknown, depth = 0): Record<string, unknown>[] => {
  if (Array.isArray(body)) return body as Record<string, unknown>[];
  if (!body || typeof body !== "object" || depth > 3) return [];

  const node = body as Record<string, unknown>;
  for (const key of ["data", "content", "items", "results", "products"]) {
    const found = findRows(node[key], depth + 1);
    if (found.length) return found;
  }
  return [];
};

/** The first value that is actually a non-blank string. */
const firstText = (...values: unknown[]): string | undefined => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
};

/* ------------------------------------------------------------------ */
/* Sectors — the other half of every scope                             */
/* ------------------------------------------------------------------ */

/**
 * Every scope in LEX is *Product + Sector*. **Product comes from LOS**
 * (`product-service`); **Sector is governed here.**
 *
 * Like the authority ladder, the list is data and not an enum — a company that
 * needs a seventh segment adds a row rather than waiting for a release. So
 * nothing in the UI may hardcode a sector.
 */
export interface LexSector {
  id: string;
  /** Identity. Upper-cased, spaces to underscores, unique per company, immutable. */
  code: string;
  displayName: string;
  displayNameAr?: string | null;
  /** Render position in the pickers. */
  ordinal: number;
  active: boolean;
}

const SECTORS = "/api/v1/lex/config/sectors";

/**
 * Ascending by ordinal — what the Sector picker renders.
 *
 * **"All Sectors" is not in this array.** It is the wildcard (`sectorId: null`)
 * and the picker adds it itself, exactly as it does for "All Products". Sending
 * a literal id for it would name a sector that does not exist.
 */
export const getSectors = async (
  params: { activeOnly?: boolean } = {}
): Promise<LexSector[]> => unwrapList(await lexConfigApi.get(SECTORS, { params: clean(params) }));

export const getSector = async (id: string): Promise<LexSector> =>
  unwrap(await lexConfigApi.get(`${SECTORS}/${id}`));

/** The platform catalogue, previewable without writing anything. */
export const getSectorTemplates = async (): Promise<LexSector[]> =>
  unwrapList(await lexConfigApi.get(`${SECTORS}/templates`));

/**
 * Copies the platform catalogue into this company. **Idempotent by code**, so
 * re-running after the catalogue grows adds only the missing rows — which is
 * why it is safe to offer even when nobody remembers whether it has been run.
 */
export const bootstrapSectors = async (): Promise<LexBootstrapResult> =>
  unwrap(await lexConfigApi.post(`${SECTORS}/bootstrap`, {}));

export const createSector = async (body: {
  code: string;
  displayName: string;
  displayNameAr?: string;
  ordinal: number;
}): Promise<LexSector> => unwrap(await lexConfigApi.post(SECTORS, clean(body)));

/** `code` is identity and is not sent on update — the form disables it. */
export const updateSector = async (
  id: string,
  body: { displayName?: string; displayNameAr?: string; ordinal?: number; active?: boolean }
): Promise<LexSector> => unwrap(await lexConfigApi.put(`${SECTORS}/${id}`, clean(body)));

/**
 * Deactivate, never delete: this hides the sector from new configuration
 * without breaking the published scopes that already name it. There is no
 * delete endpoint.
 */
export const setSectorActive = async (id: string, active: boolean): Promise<LexSector> =>
  unwrap(await lexConfigApi.put(`${SECTORS}/${id}`, { active }));

/**
 * The code is normalised server-side; showing it as the admin types stops the
 * saved value being a surprise.
 */
export const normalizeSectorCode = (raw: string) =>
  raw.trim().toUpperCase().replace(/[\s-]+/g, "_");

/* ------------------------------------------------------------------ */
/* Reason Code processes                                               */
/* ------------------------------------------------------------------ */

export type LexSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export const SEVERITIES: LexSeverity[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

/**
 * Where a Reason Code sends the case.
 *
 * `AUTO_RESOLVE` means no human was involved at all — not that nobody objected.
 */
export type LexRoutingType = "AUTO_RESOLVE" | "DELEGATION" | "SUPERVISOR" | "APPLICATION_SOURCE";

export const ROUTING_TYPES: LexRoutingType[] = [
  "AUTO_RESOLVE",
  "DELEGATION",
  "SUPERVISOR",
  "APPLICATION_SOURCE",
];

/**
 * The two rules the domain aggregate AND a database CHECK constraint enforce.
 * Mirrored here so the form never offers the refused combination:
 *
 * 1. `DELEGATION` must name a `linkedPolicyParameter` — without one there is
 *    nothing for the matrix to compare a value against.
 * 2. `APPLICATION_SOURCE` must not carry an `evidenceType`. A data problem is
 *    not a credit decision and must never be closable with credit-decision
 *    evidence. `DELEGATION` and `SUPERVISOR` must always state what closes it.
 */
export const requiresPolicyParameter = (routingType?: string) => routingType === "DELEGATION";

export const requiresEvidence = (routingType?: string) =>
  routingType === "DELEGATION" || routingType === "SUPERVISOR";

export const forbidsEvidence = (routingType?: string) => routingType === "APPLICATION_SOURCE";

/**
 * The action vocabulary is per-process, not one fixed global set — nothing
 * validates these strings against a catalogue, which is why the picker offers
 * previously-used verbs alongside free entry: **a typo becomes a button label.**
 *
 * The one boundary the server does enforce: a source-routed process cannot
 * carry credit verbs, and a credit-routed one cannot carry source verbs.
 */
export const CREDIT_VERBS = ["Verify", "Escalate", "Overrule", "Approve", "Decline", "Reject", "Co-sign"];
export const SOURCE_VERBS = [
  "Request re-upload",
  "Request clarification",
  "Contact applicant",
  "Return to source",
];
const CREDIT_VERB_KEYS = ["APPROVE", "DECLINE", "OVERRULE"];
const SOURCE_VERB_KEYS = ["REQUEST_RE_UPLOAD", "REQUEST_CLARIFICATION"];

const normalizeVerb = (verb: string) => verb.trim().toUpperCase().replace(/[\s-]+/g, "_");

/** The verbs a routing type may offer. Free entry is still allowed alongside. */
export const verbsForRouting = (routingType?: string): string[] => {
  if (routingType === "APPLICATION_SOURCE") return SOURCE_VERBS;
  if (routingType === "DELEGATION" || routingType === "SUPERVISOR") return CREDIT_VERBS;
  return [];
};

/** A verb the server would refuse for this routing type, or null. */
export const forbiddenVerb = (routingType: string | undefined, verb: string): boolean => {
  const key = normalizeVerb(verb);
  if (routingType === "APPLICATION_SOURCE") return CREDIT_VERB_KEYS.includes(key);
  if (routingType === "DELEGATION" || routingType === "SUPERVISOR") {
    return SOURCE_VERB_KEYS.includes(key);
  }
  return false;
};

export const EVIDENCE_TYPES = [
  "MANUAL_DOCUMENT_CHECK",
  "SYSTEM_RECALCULATION",
  "BUREAU_REPORT",
  "APPLICANT_DECLARATION",
  "SUPERVISOR_SIGN_OFF",
];

export const POLICY_PARAMETERS = ["DBR", "LOAN_AMOUNT", "AGE", "TENURE", "EXPOSURE"];

/** `null` on both sides means All Products / All Sectors — never blank on screen. */
export interface LexScopeRef {
  productId?: string | null;
  productName?: string | null;
  sectorId?: string | null;
  sectorName?: string | null;
  /**
   * The label the server already built ("All Products / All Sectors"). Render
   * it rather than assembling one from two nulls — the server's version is what
   * resolution actually used.
   */
  describe?: string;
  /** 3 · 2 · 1 · 0 — product+sector beats product, which beats sector, which beats all. */
  specificity?: number;
}

export interface LexExecutionStep {
  /** Renumbered 1..n on save, so reordering is lossless — send the order, not the numbers. */
  ordinal?: number;
  instruction: string;
  policyParameter?: string | null;
}

export interface LexProcess extends LexScopeRef {
  id: string;
  lineageId: string;
  /** The exact key the Decision Agent stamps. Identity — ignored on update. */
  referenceCode: string;
  title: string;
  purpose?: string;
  severity: LexSeverity | string;
  status: LexConfigStatus;
  version: number;
  routingType: LexRoutingType | string;
  linkedPolicyParameter?: string | null;
  scopes?: LexScopeRef[];
  executionSteps?: LexExecutionStep[];
  /** The server's own answer to "may this be edited". Drive the form off this. */
  editable?: boolean;
  primaryActions?: string[];
  additionalActions?: string[];
  evidenceType?: string | null;
  expectedOutcome?: string;
  effectiveDate?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  publishedBy?: string;
}

export interface LexProcessTemplate {
  referenceCode: string;
  title: string;
  purpose?: string;
  severity?: string;
  routingType?: string;
}

export const getProcesses = async (
  query: LexPageQuery & { status?: string; severity?: string; routingType?: string } = {}
): Promise<LexPage<LexProcess>> => {
  const { page = 1, size = 20, ...rest } = query;
  return pageOf(await lexConfigApi.get(PROCESSES, {
    params: clean({ page: toServerPage(page), size, ...rest }),
  }), size, page);
};

export const getProcess = async (id: string): Promise<LexProcess> =>
  unwrap(await lexConfigApi.get(`${PROCESSES}/${id}`));

/** Every version of one rule, newest first. "What did this rule say in March?" */
export const getProcessLineage = async (lineageId: string): Promise<LexProcess[]> => {
  return unwrapList(await lexConfigApi.get(`${PROCESSES}/lineage/${lineageId}`));
};

/** Preview the starting catalogue. Writes nothing. */
export const getProcessTemplates = async (): Promise<LexProcessTemplate[]> => {
  return unwrapList(await lexConfigApi.get(`${PROCESSES}/templates`));
};

export interface LexBootstrapResult {
  created: number;
  skippedExisting: number;
  createdCodes: string[];
  /** Surfaced so a re-run visibly did something rather than appearing to no-op. */
  skippedCodes: string[];
}

/**
 * Idempotent by reference code — re-running adds nothing and reports what it
 * skipped, which is why it is safe to offer when the admin is unsure.
 *
 * Defaults to drafts for review rather than publishing ~30 live rules in one
 * click.
 */
export const bootstrapProcesses = async (publishImmediately = false): Promise<LexBootstrapResult> =>
  unwrap(await lexConfigApi.post(`${PROCESSES}/bootstrap`, { publishImmediately }));

export type LexProcessBody = Omit<
  Partial<LexProcess>,
  "id" | "lineageId" | "status" | "version" | "createdAt" | "updatedAt" | "publishedAt" | "publishedBy"
>;

export const createProcess = async (body: LexProcessBody): Promise<LexProcess> =>
  unwrap(await lexConfigApi.post(PROCESSES, body));

/** Drafts only. `referenceCode` is identity and is ignored here. */
export const updateProcess = async (id: string, body: LexProcessBody): Promise<LexProcess> =>
  unwrap(await lexConfigApi.put(`${PROCESSES}/${id}`, body));

/**
 * The only way to change a published rule. `LEX.PROCESS.OPEN_DRAFT_EXISTS`
 * means one already exists — link to it rather than showing the error alone.
 */
export const cloneProcess = async (id: string): Promise<LexProcess> =>
  unwrap(await lexConfigApi.post(`${PROCESSES}/${id}/clone`, {}));

export const publishProcess = async (id: string): Promise<LexProcess> =>
  unwrap(await lexConfigApi.post(`${PROCESSES}/${id}/publish`, {}));

/** Out of force going forward; the version stays readable. Not a delete. */
export const archiveProcess = async (id: string): Promise<LexProcess> =>
  unwrap(await lexConfigApi.post(`${PROCESSES}/${id}/archive`, {}));

/** Drafts only — the one discardable thing in the configurator. */
export const deleteProcessDraft = async (id: string): Promise<void> => {
  await lexConfigApi.delete(`${PROCESSES}/${id}`);
};

/**
 * Scope specificity, for explaining resolution on the scope picker.
 *
 * Naming a Product always beats naming only a Sector. Ties break on later
 * effective date, then higher version.
 */
export const scopeRank = (scope: LexScopeRef): number =>
  (scope.productId ? 2 : 0) + (scope.sectorId ? 1 : 0);

/* ------------------------------------------------------------------ */
/* Delegation of authority                                             */
/* ------------------------------------------------------------------ */

/**
 * Value ranges each authority level may approve, per Product / Sector / policy
 * parameter. This covers the **Delegation Underwriter path only** — Supervisor
 * and Application Source routing follow their own paths regardless of any
 * tolerance configured here.
 */
export interface LexDelegationBand {
  id?: string;
  authorityLevelId: string;
  authorityLevelCode?: string;
  /** Boundaries are inclusive: a DBR of exactly 40 resolves to the band ending at 40. */
  minValue: number;
  maxValue: number;
}

export interface LexDelegationMatrix extends LexScopeRef {
  id: string;
  lineageId: string;
  /** Pre-built label, e.g. "All Products / All Sectors". */
  scopeDescription?: string;
  editable?: boolean;
  policyParameter: string;
  status: LexConfigStatus;
  version: number;
  bands: LexDelegationBand[];
  effectiveDate?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

export const getDelegationMatrices = async (
  query: LexPageQuery & { status?: string; policyParameter?: string } = {}
): Promise<LexPage<LexDelegationMatrix>> => {
  const { page = 1, size = 20, ...rest } = query;
  return pageOf(await lexConfigApi.get(DELEGATION, {
    params: clean({ page: toServerPage(page), size, ...rest }),
  }), size, page);
};

export const getDelegationMatrix = async (id: string): Promise<LexDelegationMatrix> =>
  unwrap(await lexConfigApi.get(`${DELEGATION}/${id}`));

export const getDelegationLineage = async (lineageId: string): Promise<LexDelegationMatrix[]> => {
  return unwrapList(await lexConfigApi.get(`${DELEGATION}/lineage/${lineageId}`));
};

export type LexDelegationBody = Pick<
  Partial<LexDelegationMatrix>,
  "productId" | "sectorId" | "policyParameter" | "bands" | "effectiveDate"
>;

export const createDelegationMatrix = async (
  body: LexDelegationBody
): Promise<LexDelegationMatrix> => unwrap(await lexConfigApi.post(DELEGATION, body));

export const updateDelegationMatrix = async (
  id: string,
  body: LexDelegationBody
): Promise<LexDelegationMatrix> => unwrap(await lexConfigApi.put(`${DELEGATION}/${id}`, body));

export const cloneDelegationMatrix = async (id: string): Promise<LexDelegationMatrix> =>
  unwrap(await lexConfigApi.post(`${DELEGATION}/${id}/clone`, {}));

export const publishDelegationMatrix = async (id: string): Promise<LexDelegationMatrix> =>
  unwrap(await lexConfigApi.post(`${DELEGATION}/${id}/publish`, {}));

export const archiveDelegationMatrix = async (id: string): Promise<LexDelegationMatrix> =>
  unwrap(await lexConfigApi.post(`${DELEGATION}/${id}/archive`, {}));

export const deleteDelegationDraft = async (id: string): Promise<void> => {
  await lexConfigApi.delete(`${DELEGATION}/${id}`);
};

/** `DBR` is a percentage, so it is capped at 100. */
export const DBR_MAX = 100;

export interface LexBandProblems {
  /** Bands whose max is below their min, or which are negative. */
  invalid: number[];
  /** Bands that overlap the previous rung. */
  overlaps: number[];
  /** Active levels with no row at all. */
  missingLevelIds: string[];
  /** True when a DBR band exceeds 100. */
  overDbrCap: boolean;
}

/**
 * The rules evaluated live while the admin types.
 *
 * **No gap check.** Whether consecutive bands must touch (`0–40, 40–100`) or
 * succeed each other (`0–40, 41–100`) depends on how the server reads the
 * boundaries, and this file guessed. The guess rejected correctly-written
 * matrices, so the check is gone — the server validates the ladder when the
 * matrix is published and answers with `doa.err.invalid`. Do not restore it
 * without confirming the convention against lex-config-service.
 *
 * A missing level row IS still reported: that is not a boundary convention, it
 * is a rung nobody is authorized to approve at.
 *
 * A value *above the last band* is deliberately NOT reported. It resolves to
 * empty, and LEX opens the case at the highest active level with
 * `beyondDelegation` set — a handled case, not a misconfiguration.
 */
export const validateBands = (
  bands: LexDelegationBand[],
  activeLevels: LexAuthorityLevel[],
  policyParameter?: string
): LexBandProblems => {
  const indexed = bands.map((b, i) => ({ ...b, i }));
  const ordered = [...indexed].sort((a, b) => Number(a.minValue) - Number(b.minValue));
  const invalid: number[] = [];
  const overlaps: number[] = [];

  ordered.forEach((band, idx) => {
    if (Number(band.maxValue) < Number(band.minValue)) invalid.push(band.i);
    if (Number(band.minValue) < 0 || Number(band.maxValue) < 0) invalid.push(band.i);

    const next = ordered[idx + 1];
    if (!next) return;
    if (Number(next.minValue) < Number(band.maxValue)) overlaps.push(next.i);
  });

  const covered = new Set(bands.map((b) => b.authorityLevelId));
  const missingLevelIds = activeLevels.filter((l) => !covered.has(l.id)).map((l) => l.id);

  const overDbrCap =
    policyParameter === "DBR" && bands.some((b) => Number(b.maxValue) > DBR_MAX);

  return { invalid, overlaps, missingLevelIds, overDbrCap };
};

export const hasBandProblem = (problems: LexBandProblems): boolean =>
  problems.invalid.length > 0 ||
  problems.overlaps.length > 0 ||
  problems.missingLevelIds.length > 0 ||
  problems.overDbrCap;

/* ------------------------------------------------------------------ */
/* SLA policies                                                        */
/* ------------------------------------------------------------------ */

export interface LexSlaStage {
  ordinal: number;
  stageCode: string;
  displayName: string;
  targetMinutes: number;
  /**
   * Resolved server-side from the policy percentages. Display these; never
   * recompute them, and never show a bare percentage instead.
   */
  nearBreachMinutes?: number;
  criticalBreachMinutes?: number;
}

export interface LexSlaPolicy extends LexScopeRef {
  id: string;
  lineageId: string;
  /** Pre-built label, e.g. "All Products / All Sectors". */
  scopeDescription?: string;
  editable?: boolean;
  policyName: string;
  status: LexConfigStatus;
  version: number;
  stages: LexSlaStage[];
  nearBreachPercent: number;
  criticalBreachPercent: number;
  effectiveDate?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

/** The five stages the shipped policy defines. Free text — this is a starting set. */
export const SLA_STAGE_CODES = ["INTAKE", "FRAUD_TRIAGE", "SUPPORT", "CREDIT_REVIEW", "PAYOUT"];

export const getSlaPolicies = async (
  query: LexPageQuery & { status?: string } = {}
): Promise<LexPage<LexSlaPolicy>> => {
  const { page = 1, size = 20, ...rest } = query;
  return pageOf(await lexConfigApi.get(SLA, {
    params: clean({ page: toServerPage(page), size, ...rest }),
  }), size, page);
};

export const getSlaPolicy = async (id: string): Promise<LexSlaPolicy> =>
  unwrap(await lexConfigApi.get(`${SLA}/${id}`));

export const getSlaLineage = async (lineageId: string): Promise<LexSlaPolicy[]> => {
  return unwrapList(await lexConfigApi.get(`${SLA}/lineage/${lineageId}`));
};

export type LexSlaBody = Pick<
  Partial<LexSlaPolicy>,
  | "productId"
  | "sectorId"
  | "policyName"
  | "stages"
  | "nearBreachPercent"
  | "criticalBreachPercent"
  | "effectiveDate"
>;

export const createSlaPolicy = async (body: LexSlaBody): Promise<LexSlaPolicy> =>
  unwrap(await lexConfigApi.post(SLA, body));

export const updateSlaPolicy = async (id: string, body: LexSlaBody): Promise<LexSlaPolicy> =>
  unwrap(await lexConfigApi.put(`${SLA}/${id}`, body));

export const cloneSlaPolicy = async (id: string): Promise<LexSlaPolicy> =>
  unwrap(await lexConfigApi.post(`${SLA}/${id}/clone`, {}));

export const publishSlaPolicy = async (id: string): Promise<LexSlaPolicy> =>
  unwrap(await lexConfigApi.post(`${SLA}/${id}/publish`, {}));

export const archiveSlaPolicy = async (id: string): Promise<LexSlaPolicy> =>
  unwrap(await lexConfigApi.post(`${SLA}/${id}/archive`, {}));

export const deleteSlaDraft = async (id: string): Promise<void> => {
  await lexConfigApi.delete(`${SLA}/${id}`);
};

/**
 * Near breach must come before critical, otherwise a case jumps straight to
 * critical and the warning state never renders at all.
 */
export const slaPercentProblem = (
  nearBreachPercent: number,
  criticalBreachPercent: number
): "range" | "order" | null => {
  const inRange = (v: number) => v > 0 && v < 100;
  if (!inRange(nearBreachPercent) || !inRange(criticalBreachPercent)) return "range";
  if (nearBreachPercent >= criticalBreachPercent) return "order";
  return null;
};

/**
 * Preview of the resolved thresholds while editing a draft. The server sends
 * them back on read; this only fills the gap between typing a percentage and
 * saving, so the admin sees the minutes the board will report.
 */
export const resolveThresholds = (
  targetMinutes: number,
  nearBreachPercent: number,
  criticalBreachPercent: number
) => ({
  nearBreachMinutes: Math.round((targetMinutes * nearBreachPercent) / 100),
  criticalBreachMinutes: Math.round((targetMinutes * criticalBreachPercent) / 100),
});

/** Hours in the form, minutes on the wire — and the minutes stay on screen. */
export const minutesToHours = (minutes?: number) =>
  // Four decimals still round-trips a whole minute through hoursToMinutes
  // (2 min -> 0.0333 -> 1.998 -> 2) and Number() drops the trailing zeros, so
  // 120 stays "2" rather than becoming "2.0000".
  minutes === undefined || minutes === null
    ? ""
    : String(Number((Number(minutes) / 60).toFixed(4)));

export const hoursToMinutes = (hours: string | number) => Math.round(Number(hours) * 60);

/** "4h 30m" — for reading, never for storage. */
export const formatMinutes = (minutes?: number | null): string => {
  if (minutes === null || minutes === undefined || Number.isNaN(Number(minutes))) return "—";
  const total = Math.max(0, Math.round(Number(minutes)));
  const days = Math.floor(total / 1440);
  const hours = Math.floor((total % 1440) / 60);
  const mins = total % 60;
  const parts = [days && `${days}d`, hours && `${hours}h`, (mins || !total) && `${mins}m`];
  return parts.filter(Boolean).join(" ");
};
