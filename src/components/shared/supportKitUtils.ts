import type { Complaint } from "../../redux/apis/apisSupport";

/**
 * The arithmetic behind the complaint registers, kept out of `supportKit` so
 * that file exports components only — same split as `tenancyKit` /
 * `tenancyKitUtils`.
 */

// ---------------------------------------------------------------------------
// Derived signals
//
// Everything here comes out of the timestamps the payload already carries.
//
// The SLA state below reads the service's own fields and never invents a
// threshold: the targets are per priority and per tenant, so a rule hardcoded
// here would disagree with the backend the first time a tenant edits one.
// ---------------------------------------------------------------------------

/** Opened, still live, and nobody has replied yet. */
export const isUnanswered = (c: Complaint) =>
  c.firstResponseAt == null && c.status !== "RESOLVED";

/** It was answered once and is live again — the complainant came back. */
export const isReopened = (c: Complaint) =>
  c.status !== "RESOLVED" && c.firstResponseAt != null;

/** Nothing has happened on a live complaint for longer than the caller's threshold. */
export const isStale = (c: Complaint, thresholdHours: number) => {
  if (c.status === "RESOLVED") return false;
  const idleMs = Date.now() - new Date(c.lastEventAt).getTime();
  return idleMs > thresholdHours * 3600 * 1000;
};

/** Milliseconds between two ISO timestamps, or null when either is missing. */
const elapsed = (from?: string | null, to?: string | null) =>
  from && to ? new Date(to).getTime() - new Date(from).getTime() : null;

export const timeToFirstResponse = (c: Complaint) => elapsed(c.openedAt, c.firstResponseAt);

export const timeToResolution = (c: Complaint) => elapsed(c.openedAt, c.resolvedAt);

/** A duration in the coarsest unit that still says something: 3d, 5h, 12m. */
export const formatDuration = (ms?: number | null) => {
  if (ms == null || ms < 0) return "—";
  const minutes = Math.floor(ms / 60000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours}h ${minutes % 60}m`;
  return `${Math.floor(hours / 24)}d ${hours % 24}h`;
};

/** Nobody has picked it up in the engine yet. */
export const isUnassigned = (c: Complaint) => !c.assigneeName;

/** It has come back at least once — worth a badge of its own. */
export const isRepeatOffender = (c: Complaint) => (c.reopenCount ?? 0) > 0;

/**
 * Answered, but nobody has said whether the complainant was right. This is the
 * gap the outcome field exists to close, so it is the one worth surfacing.
 */
export const awaitingClassification = (c: Complaint) =>
  c.status === "RESOLVED" && c.resolutionOutcome == null;

/** The outcome control is refused by the API until the complaint is resolved. */
export const canRecordOutcome = (c: Complaint) => c.status === "RESOLVED";

/** Anything but an upheld complaint needs a stated reason. */
export const outcomeNeedsNote = (outcome?: string | null) =>
  !!outcome && outcome !== "RESOLVED";

// ---------------------------------------------------------------------------
// SLA
//
// The engine's Community build has no SLA at all — its `/sla_policies`
// endpoint answers 404 — so every target, breach and escalation here is the
// platform's own, and every one of them arrives on the payload.
// ---------------------------------------------------------------------------

/**
 * What to say about the clock, in the order that matters.
 *
 * `none` is a real state, not a missing one: only a sub-category carries a
 * priority, so a complaint filed at category level alone has no target and
 * must not be coloured as though it did.
 */
export type SlaState = "none" | "breached" | "paused" | "due-soon" | "on-track";

/** Minutes of warning before a due timestamp counts as "due soon". */
export const SLA_WARNING_MINUTES = 60;

export const slaState = (c: Complaint, warningMinutes = SLA_WARNING_MINUTES): SlaState => {
  if (c.acknowledgeBreachedAt || c.resolveBreachedAt) return "breached";
  if (!c.acknowledgeDueAt && !c.resolveDueAt) return "none";
  // A paused complaint is NOT running out: the clock stopped when it went
  // PENDING and both targets move forward by whatever the pause costs.
  if (c.slaPaused) return "paused";
  const due = c.acknowledgeDueAt || c.resolveDueAt;
  const remaining = new Date(due as string).getTime() - Date.now();
  return remaining <= warningMinutes * 60000 ? "due-soon" : "on-track";
};

/** Which clock ran out, for a badge that says something rather than just "breached". */
export const breachedClock = (c: Complaint): "ACKNOWLEDGEMENT" | "RESOLUTION" | null =>
  c.resolveBreachedAt ? "RESOLUTION" : c.acknowledgeBreachedAt ? "ACKNOWLEDGEMENT" : null;

/** On a rung above the ground. There is no manual escalate control anywhere. */
export const isEscalated = (c: Complaint) => (c.escalationLevel ?? 0) > 0;

/** Time left on a due timestamp, or null when there is no target to count down. */
export const timeUntilDue = (due?: string | null) =>
  due ? new Date(due).getTime() - Date.now() : null;

/**
 * Minutes as the coarsest unit that still says something, annotating rather
 * than replacing them — minutes are what the API stores, so a 30-minute fraud
 * target stays expressible.
 */
export const minutesInWords = (minutes?: number | null) => {
  if (minutes == null) return "—";
  if (minutes < 60) return `${minutes} min`;
  const hours = minutes / 60;
  return hours < 24 ? `${+hours.toFixed(1)}h` : `${+(hours / 24).toFixed(1)}d`;
};
