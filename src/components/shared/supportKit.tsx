import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";
import type { Complaint, ComplaintEvent } from "../../redux/apis/apisSupport";
import {
  breachedClock,
  csatLabel,
  hasCsat,
  isEscalated,
  slaState,
} from "./supportKitUtils";

/**
 * Shared rendering for the two complaint registers — the tenant's Support tab
 * and the platform's Tenant Complaints tab.
 *
 * The rows are the same shape whoever is looking at them, so the cells are
 * shared. The COPY is not, and lives in the screens.
 */

const COMPLAINT_TONES: Record<string, string> = {
  OPEN: "border-sky-500/40 bg-sky-500/10 text-sky-600",
  PENDING: "border-amber-500/40 bg-amber-500/10 text-amber-600",
  RESOLVED: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600",
};

export const ComplaintStatusBadge = ({ status }: { status?: string | null }) => (
  <Badge
    variant="outline"
    className={cn(
      "border font-medium",
      COMPLAINT_TONES[status || ""] || "border-border bg-muted text-muted-foreground"
    )}
  >
    {status || "—"}
  </Badge>
);

/**
 * A reference number is LTR whatever the page direction is — an RTL layout
 * renders a bare `CMP-2026-000123` as `000123-2026-CMP`, which is not the
 * number a regulator asked about.
 */
export const ReferenceNo = ({ value }: { value?: string | null }) => (
  <span dir="ltr" className="font-mono text-xs">
    {value || "—"}
  </span>
);

const OUTCOME_TONES: Record<string, string> = {
  RESOLVED: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600",
  REJECTED: "border-rose-500/40 bg-rose-500/10 text-rose-600",
  INVALID: "border-slate-500/40 bg-slate-500/10 text-slate-600",
  DUPLICATE: "border-violet-500/40 bg-violet-500/10 text-violet-600",
};

/**
 * How the complaint ended, which is not the same claim as its status. A
 * RESOLVED complaint with no outcome is unclassified, not upheld, so the
 * absence is rendered as such rather than left blank.
 */
export const ComplaintOutcomeBadge = ({ outcome }: { outcome?: string | null }) =>
  outcome ? (
    <Badge variant="outline" className={cn("border font-medium", OUTCOME_TONES[outcome])}>
      {outcome}
    </Badge>
  ) : (
    <span className="text-xs text-muted-foreground">Not classified</span>
  );

/**
 * The SLA clock, coloured from the service's own fields.
 *
 * Never from a threshold computed here: the targets are per priority and per
 * tenant, and a local rule would disagree with the backend the first time a
 * tenant edits one. "No target" is rendered as such — only a sub-category
 * carries a priority, so a complaint filed at category level alone genuinely
 * has none.
 */
const SLA_TONES: Record<string, string> = {
  breached: "border-rose-500/40 bg-rose-500/10 text-rose-600",
  "due-soon": "border-amber-500/40 bg-amber-500/10 text-amber-600",
  paused: "border-slate-500/40 bg-slate-500/10 text-slate-600",
  "on-track": "border-emerald-500/40 bg-emerald-500/10 text-emerald-600",
};

export const SlaBadge = ({ complaint }: { complaint: Complaint }) => {
  const state = slaState(complaint);
  if (state === "none")
    return (
      <span className="text-xs text-muted-foreground" title="Only a sub-category carries an SLA target.">
        No target
      </span>
    );

  const clock = breachedClock(complaint);
  const label =
    state === "breached"
      ? clock === "RESOLUTION"
        ? "Resolution breached"
        : "Acknowledgement breached"
      : state === "paused"
        ? "Paused — waiting on customer"
        : state === "due-soon"
          ? "Due soon"
          : "On track";

  // `whitespace-normal` on purpose: "Acknowledgement breached" is wider than
  // the SLA column, and a badge that clips reads as "Resolution breache" —
  // which is the one word in it that carries the meaning. Two lines is better
  // than a truncated one.
  return (
    <Badge
      variant="outline"
      className={cn("border whitespace-normal text-center font-medium leading-tight", SLA_TONES[state])}
    >
      {label}
    </Badge>
  );
};

/** Which rung it climbed to, and to whom. Display only — nothing here escalates. */
export const EscalationBadge = ({ complaint }: { complaint: Complaint }) =>
  isEscalated(complaint) ? (
    <Badge
      variant="outline"
      className="border-violet-500/40 bg-violet-500/10 font-medium text-violet-600"
    >
      L{complaint.escalationLevel}
      {complaint.escalationTeam ? ` · ${complaint.escalationTeam}` : ""}
    </Badge>
  ) : null;

/**
 * What the complainant said about how it went, on the scale the service uses:
 * **1 worst, 5 best**. The direction is rendered alongside the number because
 * a bare "2/5" is exactly the ambiguity that had agents and reports reading
 * opposite values in the system this replaced.
 */
export const CsatBadge = ({ complaint }: { complaint: Complaint }) =>
  hasCsat(complaint) ? (
    <Badge
      variant="outline"
      className={cn(
        "border font-medium",
        (complaint.csatRating ?? 0) >= 4
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600"
          : (complaint.csatRating ?? 0) === 3
            ? "border-amber-500/40 bg-amber-500/10 text-amber-600"
            : "border-rose-500/40 bg-rose-500/10 text-rose-600"
      )}
      title="1 worst, 5 best. The first answer stands."
    >
      {csatLabel(complaint.csatRating)}
    </Badge>
  ) : (
    <span className="text-xs text-muted-foreground">Not rated</span>
  );

/**
 * Plain words for the event types, including the two nothing writes yet and
 * the two the subject links write.
 */
const EVENT_LABELS: Record<string, string> = {
  OPENED: "Opened",
  ASSIGNED: "Assigned",
  UNASSIGNED: "Unassigned",
  AGENT_REPLIED: "Agent replied",
  STATUS_CHANGED: "Status changed",
  REOPENED: "Reopened",
  OUTCOME_RECORDED: "Outcome recorded",
  ESCALATED: "Escalated",
  SLA_BREACHED: "SLA breached",
  LINKED: "Linked to a subject",
  UNLINKED: "Link removed",
  CSAT_RECORDED: "Satisfaction recorded",
};

/**
 * The trail, in the order the API returned it.
 *
 * Not re-sorted on `occurredAt`, deliberately: the engine stamps to the whole
 * second, so several events routinely share one, and sorting would shuffle
 * them into an order that never happened. Insertion order is the real one.
 *
 * An unrecognised `type` renders as its raw code rather than being dropped —
 * `ESCALATED` and `SLA_BREACHED` are reserved today and a screen that hid what
 * it did not know would silently lose them the day they start being written.
 */
export const ComplaintTimeline = ({
  events,
  formatWhen,
}: {
  events: ComplaintEvent[];
  formatWhen: (value?: string) => string;
}) => (
  <ol className="relative space-y-3 border-s border-[var(--surface-border)] ps-4">
    {events.map((event, index) => (
      <li key={`${event.occurredAt}-${index}`} className="relative">
        <span className="absolute -start-[21px] top-1.5 h-2 w-2 rounded-full bg-muted-foreground/50" />
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-sm font-medium text-foreground">
            {EVENT_LABELS[event.type] || event.type}
          </span>
          {/* Free-form on both sides — statuses here, agent names there. Shown
              as text, never parsed into meaning. */}
          {(event.fromValue || event.toValue) && (
            <span className="text-xs text-muted-foreground">
              {event.fromValue ? `${event.fromValue} → ` : ""}
              {event.toValue || "—"}
            </span>
          )}
          <span className="ms-auto text-xs text-muted-foreground">
            {formatWhen(event.occurredAt)}
          </span>
        </div>
        {(event.actorName || event.actorType) && (
          <div className="text-xs text-muted-foreground">
            {event.actorName || event.actorType}
            {event.actorName && event.actorType ? ` (${event.actorType})` : ""}
          </div>
        )}
        {event.note && <div className="mt-0.5 text-xs text-foreground/80">{event.note}</div>}
      </li>
    ))}
  </ol>
);
