import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ExternalLink, LifeBuoy, MessageSquareWarning, RefreshCw } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Skeleton } from "../ui/skeleton";
import ComplaintDetailDialog from "./ComplaintDetailDialog";
import ComplaintReportPanel from "./ComplaintReportPanel";
import { EmptyState } from "./detailKit";
import { formatDateTime } from "./detailKitUtils";
import { FilterField } from "./filterKit";
import { LexNotice, LexPageHeader, LexTile } from "./lexKit";
import TablePager from "./TablePager";
import TableView from "../TableView/TableView";
import {
  ComplaintOutcomeBadge,
  ComplaintStatusBadge,
  CsatBadge,
  EscalationBadge,
  ReferenceNo,
  SlaBadge,
} from "./supportKit";
import {
  awaitingClassification,
  formatDuration,
  isReopened,
  isRepeatOffender,
  isUnanswered,
  hasCsat,
  slaState,
  timeToResolution,
} from "./supportKitUtils";
import {
  COMPLAINT_STATUSES,
  isNotProvisioned,
  isSuspended,
  primeSupportErrorCatalog,
  toSupportError,
  type Complaint,
  type ComplaintEvent,
  type ComplaintOutcome,
  type ComplaintPage,
  type ComplaintQuery,
  type ComplaintStatus,
  type SupportCategory,
  type SupportReportQuery,
  type SupportReportSummary,
  type SupportSubCategory,
} from "../../redux/apis/apisSupport";

/** "All statuses" — Radix Select forbids an empty string as an item value. */
const ALL = "__all__";

type Row = Complaint & { Sr: number };

export interface ComplaintRegisterProps {
  icon?: LucideIcon;
  title: string;
  subtitle: string;
  /** The queue read — tenant-scoped or platform-wide, chosen by the screen. */
  fetchPage: (params: ComplaintQuery) => Promise<ComplaintPage>;
  /** The append-only trail behind one complaint. */
  fetchEvents: (id: string) => Promise<ComplaintEvent[]>;
  /** The one write in the register: how the complaint ended. */
  recordOutcome: (
    id: string,
    body: { outcome: ComplaintOutcome; note?: string }
  ) => Promise<void>;
  /** Fetched on click and used immediately; never stored, never logged. */
  openConsole: () => Promise<{ loginUrl: string }>;
  /** Copy for the button that hands off to the engine's agent console. */
  consoleLabel: string;
  /** The tenant's own taxonomy, for filing a complaint. Omitted on the platform queue. */
  categories?: SupportCategory[];
  subCategories?: SupportSubCategory[];
  /** The platform queue shows which tenant complained; the tenant queue cannot. */
  showTenant?: boolean;
  /** Resolves a tenant id to a company name. A bare UUID is useless in a queue. */
  tenantName?: (tenantId: string) => string | undefined;
  /**
   * The numbers over a window, from the service rather than from the page in
   * hand — a page of rows is not a month.
   */
  fetchSummary?: (query?: SupportReportQuery) => Promise<SupportReportSummary>;
  /** Subject links are a `/tenant` endpoint; the platform register has none. */
  showLinks?: boolean;
}

/**
 * The register — read-only, on purpose.
 *
 * Replying, assigning, resolving and snoozing all happen in the support
 * engine's own console, which this screen opens by SSO. What the engine does
 * not have is the reference number a regulator asks about, the tenant boundary
 * the platform enforces, or a trail that outlives it — that is what is rendered
 * here. There is no assign or resolve action anywhere below and there should
 * not be one: two systems writing the same state is how they drift apart.
 */
export default function ComplaintRegister({
  icon: Icon = MessageSquareWarning,
  title,
  subtitle,
  fetchPage,
  fetchEvents,
  recordOutcome,
  openConsole,
  consoleLabel,
  categories,
  subCategories,
  showTenant,
  tenantName,
  fetchSummary,
  showLinks,
}: ComplaintRegisterProps) {
  const [rows, setRows] = useState<Complaint[]>([]);
  const [totalRows, setTotalRows] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState<ComplaintStatus | "">("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState<Complaint | null>(null);
  const [consoleBusy, setConsoleBusy] = useState(false);

  /**
   * A tenant provisioned before the support channel existed answers 422 until
   * it is backfilled. That is an empty state with an explanation, not a red
   * error — provisioning may still be catching up.
   */
  const [notProvisioned, setNotProvisioned] = useState(false);
  const [suspended, setSuspended] = useState(false);

  const load = useCallback(
    async (nextPage: number) => {
      setIsLoading(true);
      try {
        const result = await fetchPage({ status, page: nextPage, size: pageSize });
        setRows(result.data);
        // An open dialog is looking at one of these rows. Point it at the fresh
        // copy so a just-recorded outcome shows there too, rather than only
        // after the dialog is closed and reopened.
        setOpen((prev) => (prev ? (result.data.find((r) => r.id === prev.id) ?? prev) : prev));
        setTotalRows(result.pagination.totalElements);
        setHasMore(!result.pagination.last);
        setPage(nextPage);
        setNotProvisioned(false);
        setSuspended(false);
      } catch (error) {
        setRows([]);
        setTotalRows(undefined);
        setHasMore(false);
        if (isNotProvisioned(error)) {
          setNotProvisioned(true);
        } else if (isSuspended(error)) {
          // The queue still reads when the account is suspended; only the
          // console button is withheld.
          setSuspended(true);
        } else {
          toast.error(toSupportError(error, "Could not load complaints.").message);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [fetchPage, pageSize, status]
  );

  useEffect(() => {
    load(0);
  }, [load]);

  // The service publishes its own error codes with their localised templates,
  // so a refusal that arrives with a code and no body still reads as a
  // sentence. Unauthenticated, cached after the first call, and never fatal.
  useEffect(() => {
    primeSupportErrorCatalog();
  }, []);

  /**
   * The hand-off into the agent console — its own window, not a tab.
   *
   * The window is opened BEFORE the request and pointed at the URL afterwards:
   * a browser blocks `window.open` that happens after an await, because by then
   * it is no longer attributable to the click. Giving it a size is what makes
   * it a window rather than a tab; the console is a workspace of its own, so
   * the portal stays whole behind it.
   *
   * `noopener` is deliberately NOT passed. It nulls the returned reference,
   * which is the very handle this needs to navigate the window once the URL
   * arrives — with it, every click silently fell back to the same tab. The
   * opener is severed after the navigation instead, which gets the same
   * protection without losing the handle.
   *
   * The URL itself is a single-use credential that signs its holder in as that
   * tenant's support administrator, so it is never put in state, a log, or
   * anything shareable.
   */
  const goToConsole = async () => {
    // Centred on the screen it was opened from — a popup pinned to the top-left
    // of a wide monitor reads as something that escaped rather than opened.
    const width = Math.min(1280, window.screen.availWidth);
    const height = Math.min(900, window.screen.availHeight);
    const left = window.screenX + Math.max(0, (window.outerWidth - width) / 2);
    const top = window.screenY + Math.max(0, (window.outerHeight - height) / 2);

    const consoleWindow = window.open(
      "",
      "supportConsole",
      `popup=yes,width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
    setConsoleBusy(true);
    try {
      const { loginUrl } = await openConsole();
      if (consoleWindow) {
        consoleWindow.location.href = loginUrl;
        // What `noopener` would have done, minus the null handle: the console
        // gets no scripting access back into the portal.
        consoleWindow.opener = null;
        consoleWindow.focus();
      } else {
        // A popup blocker ate the window. Better the same tab than nothing —
        // the URL expires and cannot be offered again.
        window.location.assign(loginUrl);
      }
    } catch (error) {
      consoleWindow?.close();
      if (isNotProvisioned(error)) setNotProvisioned(true);
      else if (isSuspended(error)) setSuspended(true);
      else toast.error(toSupportError(error, "Could not open the support console.").message);
    } finally {
      setConsoleBusy(false);
    }
  };

  const mapped: Row[] = rows.map((complaint, index) => ({
    ...complaint,
    Sr: page * pageSize + index + 1,
  }));

  const columns = [
    { name: "#", selector: (row: Row) => row.Sr, width: "60px" },
    {
      name: "Reference",
      cell: (row: Row) => <ReferenceNo value={row.referenceNo} />,
    },
    ...(showTenant
      ? [
          {
            name: "Tenant",
            cell: (row: Row) => (
              <span className="min-w-0 truncate" title={row.tenantId}>
                {tenantName?.(row.tenantId) || row.tenantId}
              </span>
            ),
          },
        ]
      : []),
    { name: "Status", cell: (row: Row) => <ComplaintStatusBadge status={row.status} /> },
    {
      // Coloured from the service's own SLA fields — never a threshold worked
      // out here. The targets are per priority and per tenant, so a local rule
      // would disagree with the backend the first time a tenant edits one.
      name: "SLA",
      cell: (row: Row) => (
        <span className="flex flex-wrap items-center gap-1">
          <SlaBadge complaint={row} />
          <EscalationBadge complaint={row} />
        </span>
      ),
    },
    {
      // Mirrored from the engine, so it says who is holding it without
      // pretending this screen can change that.
      name: "Assignee",
      cell: (row: Row) => (
        <span className={row.assigneeName ? "" : "text-xs text-muted-foreground"}>
          {row.assigneeName || "Unassigned"}
        </span>
      ),
    },
    { name: "Opened", selector: (row: Row) => formatDateTime(row.openedAt) },
    { name: "Last activity", selector: (row: Row) => formatDateTime(row.lastEventAt) },
    {
      // Signals the payload gives for free. Deliberately words, not colours:
      // a red badge here would be an SLA rule invented in the browser.
      name: "Signal",
      cell: (row: Row) => (
        <span className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
          {isRepeatOffender(row) && (
            <span className="rounded-[2px] bg-muted px-1 py-0.5">×{row.reopenCount} reopened</span>
          )}
          {isUnanswered(row)
            ? "Awaiting first response"
            : awaitingClassification(row)
              ? "Awaiting classification"
              : isReopened(row)
                ? "Answered, still open"
                : row.status === "RESOLVED"
                  ? `Resolved in ${formatDuration(timeToResolution(row))}`
                  : "—"}
        </span>
      ),
    },
    // What it is about. The id resolves through the tenant's own taxonomy, so
    // the platform queue — which has none — drops the column rather than
    // printing a UUID nobody here can resolve.
    ...(categories
      ? [
          {
            name: "Category",
            cell: (row: Row) => (
              <span className="text-xs">
                {categories.find((c) => c.id === row.categoryId)?.nameEn || "—"}
              </span>
            ),
          },
        ]
      : []),
    {
      // A status says the conversation closed; this says whether the
      // complainant was right. Two different questions, two columns.
      name: "Outcome",
      cell: (row: Row) => <ComplaintOutcomeBadge outcome={row.resolutionOutcome} />,
    },
    {
      // 1 worst, 5 best — the direction travels with the number, because the
      // system this replaced had two contradictory definitions of its own.
      name: "Satisfaction",
      cell: (row: Row) =>
        hasCsat(row) ? <CsatBadge complaint={row} /> : <span className="text-xs text-muted-foreground">—</span>,
    },
    {
      name: "Action",
      width: "10%",
      cell: (row: Row) => (
        <Button size="sm" variant="outline" onClick={() => setOpen(row)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <div>
      <LexPageHeader icon={Icon} title={title} subtitle={subtitle}>
        {/* Withheld while the channel is missing or suspended, rather than
            offered as a button that can only fail. */}
        {!notProvisioned && !suspended && (
          <Button size="sm" onClick={goToConsole} disabled={consoleBusy}>
            <ExternalLink className="me-1 h-3.5 w-3.5" />
            {consoleBusy ? "Opening…" : consoleLabel}
          </Button>
        )}
      </LexPageHeader>

      {notProvisioned && (
        <LexNotice tone="amber" icon={LifeBuoy}>
          The support channel has not been set up for this organisation yet. Complaints will
          appear here once provisioning completes.
        </LexNotice>
      )}
      {suspended && (
        <LexNotice tone="amber" icon={LifeBuoy}>
          This support account is suspended. The register still reads, but the agent console
          cannot be opened.
        </LexNotice>
      )}

      {fetchSummary && <ComplaintReportPanel fetchSummary={fetchSummary} />}

      {/* Counts come from the page in hand, not a stats endpoint — the service
          has none, and `pagination.totalElements` already answers the question
          for whichever status is filtered.

          Suppressed entirely when the report is on screen: it answers the same
          questions over the whole window rather than over one page, and two
          rows of tiles disagreeing about "total" is worse than one row fewer.
          Only the two signals the report has no field for survive, folded into
          the filter bar below. */}
      {!fetchSummary && (
        <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
          <LexTile
            label={status ? `${status} complaints` : "Total complaints"}
            value={totalRows ?? "—"}
            loading={isLoading}
          />
          <LexTile
            label="Awaiting first response"
            value={rows.filter(isUnanswered).length}
            hint="On this page. Filter by OPEN for the full count."
            loading={isLoading}
          />
          <LexTile
            label="Answered, still open"
            value={rows.filter(isReopened).length}
            hint="On this page."
            loading={isLoading}
          />
          <LexTile
            label="SLA breached"
            value={rows.filter((row) => slaState(row) === "breached").length}
            hint="On this page. A paused complaint is not counted — its clock stopped."
            loading={isLoading}
          />
          <LexTile
            label="Awaiting classification"
            value={rows.filter(awaitingClassification).length}
            hint="Resolved on this page, but nobody has recorded how it ended."
            loading={isLoading}
          />
        </div>
      )}

      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <FilterField label="Status" htmlFor="complaint-status" className="w-full sm:w-56">
          <Select
            value={status || ALL}
            onValueChange={(value) => {
              setStatus(value === ALL ? "" : (value as ComplaintStatus));
              setPage(0);
            }}
          >
            <SelectTrigger id="complaint-status" className="w-full data-[size=default]:h-10">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All statuses</SelectItem>
              {COMPLAINT_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>

        <div className="flex flex-wrap items-center gap-3">
          {/* On this page only, which is why they are a sentence beside the
              filter rather than tiles pretending to be the window's totals. */}
          {!isLoading && rows.length > 0 && (
            <p className="mb-0 text-xs text-muted-foreground">
              On this page:{" "}
              <strong className="font-medium text-foreground">
                {rows.filter(isUnanswered).length}
              </strong>{" "}
              awaiting a first response,{" "}
              <strong className="font-medium text-foreground">
                {rows.filter((row) => slaState(row) === "breached").length}
              </strong>{" "}
              past an SLA target,{" "}
              <strong className="font-medium text-foreground">
                {rows.filter(awaitingClassification).length}
              </strong>{" "}
              awaiting classification.
            </p>
          )}
          <Button size="sm" variant="outline" onClick={() => load(page)} disabled={isLoading}>
            <RefreshCw className={`me-1 h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {isLoading && rows.length === 0 ? (
        <div className="grid gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState icon={MessageSquareWarning} text="No complaints in this queue." />
      ) : (
        <div className="pro-card overflow-hidden">
          <TableView header={columns} data={mapped} isLoading={isLoading} paginationShow={false} />
        </div>
      )}

      <TablePager
        page={page}
        pageSize={pageSize}
        count={rows.length}
        totalRows={totalRows}
        hasMore={hasMore}
        isLoading={isLoading}
        onPageChange={load}
        onPageSizeChange={setPageSize}
      />

      <ComplaintDetailDialog
        complaint={open}
        onClose={() => setOpen(null)}
        fetchEvents={fetchEvents}
        recordOutcome={recordOutcome}
        // A classification changes the row, so the page is reread rather than
        // patched in place — the outcome and its note come back from the
        // service with the actor it stamped on them.
        onRecorded={() => load(page)}
        showTenant={showTenant}
        tenantName={tenantName}
        categories={categories}
        subCategories={subCategories}
        showLinks={showLinks}
      />
    </div>
  );
}
