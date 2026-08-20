import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ChevronDown,
  Eye,
  HelpCircle,
  Inbox,
  PauseCircle,
  RefreshCw,
  SlidersHorizontal,
  UserCheck,
} from "lucide-react";

import TableView from "../../../components/TableView/TableView";
import { FilterField } from "../../../components/shared/filterKit";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { EmptyState, PermissionDenied } from "../../../components/shared/detailKit";
import { TONES, formatMoney } from "../../../components/shared/detailKitUtils";
import {
  LexNotice,
  LexPageHeader,
  LexSearch,
  LexStatusBadge,
  LexTile,
} from "../../../components/shared/lexKit";
import { cn } from "../../../lib/utils";
import { LEX_PERMISSIONS } from "../../../hooks/useProductPermissions";
import { useLexAccess } from "../../../hooks/useLexAccess";
import { useLexAuthority } from "../../../hooks/useLexAuthority";
import { emptyPage, lexErrorMessage, logForbidden, type LexPage } from "../../../redux/apis/apisLexCore";
import { formatMinutes } from "../../../redux/apis/apisLexConfig";
import {
  CASE_SORTS,
  CASE_TABS,
  caseChip,
  getCaseCounts,
  getCases,
  slaChip,
  type LexCaseCounts,
  type LexCaseSummary,
  type LexCaseTab,
} from "../../../redux/apis/apisLexCases";

const SEVERITY_TONE: Record<string, string> = {
  CRITICAL: TONES.red,
  HIGH: TONES.orange,
  MEDIUM: TONES.amber,
  LOW: TONES.slate,
};

const SLA_TONE: Record<string, string> = {
  WITHIN_SLA: TONES.emerald,
  NEAR_BREACH: TONES.amber,
  CRITICAL_BREACH: TONES.red,
  STOPPED: TONES.slate,
  NOT_TRACKED: TONES.slate,
};

/**
 * The exception queue — the operations team's whole view of what LEX has open.
 *
 * Four tabs, counted in one call rather than four (`GET /cases/counts`), and a
 * wide row on purpose: how urgent, whose, and why are all answerable without
 * opening anything, which is the difference between scanning forty cases and
 * making forty round trips.
 *
 * Default sort is `slaDeadline,asc` — most urgent first, with untracked cases
 * last. An untracked case is not the most urgent thing on the screen just
 * because it has no deadline.
 */
const SELECT_TRIGGER_CLS =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-foreground/30 bg-foreground px-4 py-2 text-sm font-medium text-background shadow-sm transition-colors hover:bg-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60";

const LexCases = () => {
  const { t } = useTranslation("lex");
  const navigate = useNavigate();
  const { can } = useLexAccess();

  const canRead = can(LEX_PERMISSIONS.CASE_READ);

  const [result, setResult] = useState<LexPage<LexCaseSummary>>(emptyPage<LexCaseSummary>());
  const [counts, setCounts] = useState<LexCaseCounts | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<LexCaseTab>("ALL");
  const [sort, setSort] = useState<string>(CASE_SORTS[0]);
  const [showFilters, setShowFilters] = useState(false);
  const [routingType, setRoutingType] = useState("ALL");
  /**
   * Only offered on the tabs that do not already constrain it: the Approved and
   * Declined tabs *are* a `decisionAction` filter, and two of them AND together
   * into an empty list.
   */
  const [decisionAction, setDecisionAction] = useState("ALL");
  const decisionFilterable = tab === "ALL" || tab === "HUMAN_REVIEW";
  /**
   * `scope=mine`: still-open cases at or below the caller's rung, resolved
   * server-side. Offered to underwriters only — an admin is not on the ladder,
   * so "mine" would return the whole queue and the toggle would do nothing
   * visible except imply it had.
   */
  const { levelCode } = useLexAuthority();
  const [myQueue, setMyQueue] = useState(false);

  const errorsByCode = useMemo(
    () => ({
      "COMMON.AUTH.ACCESS_DENIED": t("err.accessDenied"),
      // The service answers a plain list GET with 409 CONFLICT and the generic
      // "conflict with the current state" body. That sentence describes a write
      // that lost a race, so on a page load it tells the reader nothing true.
      // Show the load failure instead until the endpoint is fixed server-side.
      "COMMON.RESOURCE.CONFLICT": t("case.toast.loadFailed"),
    }),
    [t]
  );

  const load = async () => {
    if (!canRead) return;
    setIsLoading(true);
    try {
      const tabFilter = CASE_TABS.find((entry) => entry.key === tab)?.filter;
      // Two filter expressions are joined with a semicolon; the routing filter
      // is only added when the user picked one.
      const filter = [
        tabFilter,
        routingType === "ALL" ? undefined : `routingType:eq:${routingType}`,
        decisionFilterable && decisionAction !== "ALL"
          ? `decisionAction:eq:${decisionAction}`
          : undefined,
      ]
        .filter(Boolean)
        .join(";");

      setResult(
        await getCases({
          page,
          size: pageSize,
          search: search || undefined,
          filter: filter || undefined,
          sort,
          scope: myQueue ? "mine" : undefined,
        })
      );
    } catch (error) {
      logForbidden(error, "GET /cases");
      toast.error(lexErrorMessage(error, t("case.toast.loadFailed"), errorsByCode));
      setResult(emptyPage<LexCaseSummary>(pageSize));
    } finally {
      setIsLoading(false);
    }
  };

  const loadCounts = async () => {
    if (!canRead) return;
    try {
      setCounts(await getCaseCounts());
    } catch {
      // A failed count must not take the queue down with it — the rows are the
      // screen, the header is decoration.
      setCounts(null);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, search, tab, sort, routingType, decisionAction, myQueue]);

  useEffect(() => {
    loadCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canRead]);

  const refresh = () => {
    load();
    loadCounts();
  };

  const headers = [
    {
      name: t("case.col.application"),
      cell: (row: LexCaseSummary) => (
        <div className="min-w-0">
          <p className="m-0 font-mono text-xs font-medium">
            {row.applicationNumber || row.applicationId}
          </p>
          <p className="m-0 truncate text-xs text-muted-foreground">
            {[row.applicantName, row.productName, row.salesId].filter(Boolean).join(" · ") || "—"}
          </p>
        </div>
      ),
      width: "250px",
    },
    {
      name: t("case.col.amount"),
      cell: (row: LexCaseSummary) => (
        <div className="min-w-0">
          <p className="m-0 text-sm">
            {row.requestedAmount != null ? formatMoney(row.requestedAmount) : "—"}
          </p>
          <p className="m-0 text-xs text-muted-foreground">
            {[
              row.requestedTenureMonths ? `${row.requestedTenureMonths}m` : null,
              row.creditScore != null ? `CS ${row.creditScore}` : null,
              row.dbr != null ? `DBR ${row.dbr}%` : null,
            ]
              .filter(Boolean)
              .join(" · ") || "—"}
          </p>
        </div>
      ),
      width: "190px",
    },
    {
      name: t("case.col.reasonCode"),
      cell: (row: LexCaseSummary) => (
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Title and severity are null on an unrecognized code — fall back
                to the code rather than rendering an empty cell. */}
            <span className="truncate text-sm">
              {row.drivingReasonTitle || row.drivingReasonCode || "—"}
            </span>
            {!!row.secondaryCodeCount && (
              <Badge variant="outline" className={`border font-medium ${TONES.slate}`}>
                +{row.secondaryCodeCount}
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {row.drivingSeverity && (
              <Badge
                variant="outline"
                className={`border font-medium ${SEVERITY_TONE[row.drivingSeverity] || TONES.slate}`}
              >
                {row.drivingSeverity}
              </Badge>
            )}
            {row.hasUnrecognizedCode && (
              <Badge variant="outline" className={`border gap-1 font-medium ${TONES.amber}`}>
                <HelpCircle className="h-3 w-3" />
                {t("case.unrecognized")}
              </Badge>
            )}
            {row.beyondDelegation && (
              <Badge variant="outline" className={`border font-medium ${TONES.orange}`}>
                {t("case.beyondDelegation")}
              </Badge>
            )}
          </div>
        </div>
      ),
      width: "280px",
    },
    {
      name: t("case.col.routing"),
      cell: (row: LexCaseSummary) => (
        <div className="flex flex-col gap-1">
          <Badge variant="outline" className={`border w-fit font-medium ${TONES.sky}`}>
            {row.routingType}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {row.assignedLevelCode || t("case.unassigned")}
          </span>
        </div>
      ),
      width: "190px",
    },
    {
      name: t("case.col.status"),
      // Status is two fields, not one: `status` is the lifecycle and
      // `decisionAction` is what a person chose. RESOLVED alone would print the
      // same chip on an approval and a decline.
      cell: (row: LexCaseSummary) => {
        const chip = caseChip(row);
        return row.decisionAction ? (
          <div className="flex flex-col gap-1">
            <LexStatusBadge status={chip} label={t(`case.chip.${chip}`)} />
            <span className="text-xs text-muted-foreground">
              {row.decisionAction}
              {row.decisionLevelCode ? ` · ${row.decisionLevelCode}` : ""}
            </span>
          </div>
        ) : (
          <LexStatusBadge status={chip} label={t(`case.chip.${chip}`)} />
        );
      },
      width: "150px",
    },
    {
      name: t("case.col.sla"),
      cell: (row: LexCaseSummary) => {
        const chip = slaChip(row);
        return (
          <div className="flex flex-col gap-1">
            <Badge
              variant="outline"
              className={`border w-fit gap-1 font-medium ${SLA_TONE[String(row.slaStatus)] || TONES.slate}`}
            >
              {chip.kind === "stopped" && <PauseCircle className="h-3 w-3" />}
              {row.slaStatus || t("case.sla.notTracked")}
            </Badge>
            {/* Null and negative are both "no countdown": untracked, or past
                due. A stopped clock is a state, not a ticking number. */}
            <span className="text-xs text-muted-foreground">
              {chip.kind === "remaining" && t("case.sla.remaining", { time: formatMinutes(chip.minutes) })}
              {chip.kind === "overdue" && t("case.sla.overdue", { time: formatMinutes(chip.minutes) })}
              {chip.kind === "stopped" && t("case.sla.stopped")}
              {chip.kind === "untracked" && t("case.sla.notTracked")}
            </span>
          </div>
        );
      },
      width: "190px",
    },
    {
      name: t("common:actions"),
      // Stops the row's own click handling from firing as the menu opens.
      cell: (row: LexCaseSummary) => (
        <div
          className="relative inline-block"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button type="button" className={SELECT_TRIGGER_CLS}>
                {t("common:select")}
                <ChevronDown className="h-4 w-4 shrink-0 opacity-80" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="bottom" className="z-[9999]" sideOffset={4}>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  navigate(`/LOS/Lex/Cases/${row.id}`);
                }}
              >
                <Eye className="h-4 w-4" />
                {t("open")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      width: "120px",
    },
  ];

  // Sort is a view preference rather than a filter, so only a deliberate
  // narrowing of the routing type shows on the badge.
  const activeFilterCount =
    (routingType !== "ALL" ? 1 : 0) + (decisionFilterable && decisionAction !== "ALL" ? 1 : 0);

  if (!canRead) return <PermissionDenied />;

  const totalRows = result.pagination?.totalElements ?? result.content.length;
  const from = totalRows === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalRows);

  return (
    <div className="service">
      <LexPageHeader icon={Inbox} title={t("case.title")} subtitle={t("case.subtitle")} />

      <div className="pro-card p-3 mb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <LexSearch
            id="case-search"
            className="flex-1"
            value={search}
            onChange={(next) => {
              setSearch(next);
              setPage(1);
            }}
            placeholder={t("case.search")}
          />
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {/* Scoping the list to your own level is a mode, not a filter, so
                it stays on the bar rather than hiding in the panel. */}
            {levelCode && (
              <Button
                variant={myQueue ? "default" : "outline"}
                className={cn("gap-2", myQueue && "wallet-brand-btn")}
                onClick={() => {
                  setMyQueue((on) => !on);
                  setPage(1);
                }}
              >
                <UserCheck className="h-4 w-4" />
                {t("case.myQueue", { level: levelCode })}
              </Button>
            )}
            <Button
              variant="outline"
              className="gap-2"
              aria-expanded={showFilters}
              aria-controls="case-filters"
              onClick={() => setShowFilters((open) => !open)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              {t("common:filters")}
              {activeFilterCount > 0 && (
                <Badge variant="outline" className={`border font-medium ${TONES.emerald}`}>
                  {activeFilterCount}
                </Badge>
              )}
              <ChevronDown
                className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`}
              />
            </Button>
            <Button variant="outline" className="gap-2" onClick={refresh} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              {t("common:refresh")}
            </Button>
          </div>
        </div>

        {showFilters && (
          <div id="case-filters" className="mt-3 border-t pt-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <FilterField label={t("case.col.routing")} htmlFor="case-routing">
                <Select value={routingType} onValueChange={(v) => { setRoutingType(v); setPage(1); }}>
                  <SelectTrigger id="case-routing" className="w-full bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">{t("case.filter.allRouting")}</SelectItem>
                    <SelectItem value="DELEGATION">DELEGATION</SelectItem>
                    <SelectItem value="SUPERVISOR">SUPERVISOR</SelectItem>
                    <SelectItem value="APPLICATION_SOURCE">APPLICATION_SOURCE</SelectItem>
                  </SelectContent>
                </Select>
              </FilterField>

              {/* Only the decided tabs can be narrowed by decision. */}
              {decisionFilterable && (
                <FilterField label={t("case.filter.allDecisions")} htmlFor="case-decision">
                  <Select
                    value={decisionAction}
                    onValueChange={(v) => {
                      setDecisionAction(v);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger id="case-decision" className="w-full bg-card">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">{t("case.filter.allDecisions")}</SelectItem>
                      {["APPROVE", "VERIFY", "OVERRULE", "REJECT", "DECLINE"].map((action) => (
                        <SelectItem key={action} value={action}>
                          {action}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FilterField>
              )}

              <FilterField label={t("case.filter.sort")} htmlFor="case-sort">
                <Select value={sort} onValueChange={(v) => { setSort(v); setPage(1); }}>
                  <SelectTrigger id="case-sort" className="w-full bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CASE_SORTS.map((value) => (
                      <SelectItem key={value} value={value}>
                        {t(`case.sort.${value.split(",")[0]}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FilterField>
            </div>
          </div>
        )}
      </div>

      {/* LEX is called once, when lending's approval gate returns MANUAL_REVIEW.
          An application that auto-approves or auto-declines never reaches here.
          The counts are therefore referrals, and labelling them "applications"
          would misstate the automation rate by design. */}
      <LexNotice tone="sky">{t("case.referralScopeNote")}</LexNotice>

      {/* Counted in one call. Uses the app's own tab strip (.report-switch)
          rather than hand-rolled pills, so a LEX queue tab looks like every
          other tab in the product. */}
      <div className="report-switch" role="tablist" aria-label={t("case.title")}>
        {CASE_TABS.map((entry) => (
          <button
            key={entry.key}
            type="button"
            role="tab"
            aria-selected={tab === entry.key}
            className="report-switch__item"
            onClick={() => {
              setTab(entry.key);
              setPage(1);
            }}
          >
            {t(`case.tab.${entry.key}`)}
            {/* The counts endpoint is tenant-wide. Printing them beside a
                scoped list would label someone's own queue with everyone's
                totals. */}
            {counts && !myQueue && (
              <span className="ms-1.5 font-bold">
                {counts[entry.countKey as keyof LexCaseCounts]}
              </span>
            )}
          </button>
        ))}      </div>

      {/* The figures a supervisor acts on, beside the queue rather than on a
          separate board: breach counts here exclude stopped clocks and
          untracked cases, so they are the ones that need someone now. */}
      {counts && (
        <div className="mb-3 grid grid-cols-2 gap-3 lg:grid-cols-5">
          <LexTile label={t("case.count.nearBreach")} value={counts.nearBreach} />
          <LexTile label={t("case.count.criticalBreach")} value={counts.criticalBreach} />
          <LexTile
            label={t("case.count.unassigned")}
            value={counts.unassigned}
            hint={t("case.count.unassignedHint")}
          />
          <LexTile
            label={t("case.count.beyondDelegation")}
            value={counts.beyondDelegation}
            hint={t("case.count.beyondDelegationHint")}
          />
          <LexTile
            label={t("case.count.unrecognizedCode")}
            value={counts.unrecognizedCode}
            hint={t("case.count.unrecognizedHint")}
          />
        </div>
      )}

      <div className="pro-card">
        {!isLoading && totalRows === 0 ? (
          <EmptyState icon={Inbox} text={t("case.empty")} />
        ) : (
          <TableView
            header={headers}
            data={result.content}
            totalRows={totalRows}
            isLoading={isLoading}
            from={from}
            to={to}
            page={page}
            totalPage={result.pagination?.totalPages || 1}
            setPage={setPage}
            pageSize={pageSize}
            setPageSize={(size: number) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default LexCases;
