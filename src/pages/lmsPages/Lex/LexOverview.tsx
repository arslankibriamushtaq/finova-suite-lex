import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Activity,
  ChevronDown,
  Eye,
  HelpCircle,
  Inbox,
  LayoutDashboard,
  PauseCircle,
  RefreshCw,
} from "lucide-react";

import TableView from "../../../components/TableView/TableView";
import { Badge } from "../../../components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { Button } from "../../../components/ui/button";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { EmptyState, PermissionDenied } from "../../../components/shared/detailKit";
import {
  TONES,
  formatDate,
  formatMoney,
  humanizeCode,
} from "../../../components/shared/detailKitUtils";
import {
  LexEmployerBadge,
  LexMetricTile,
  LexNotice,
  LexPageHeader,
  LexSearch,
  LexStatusBadge,
  LexUnavailableFilter,
} from "../../../components/shared/lexKit";
import { LEX_PERMISSIONS } from "../../../hooks/useProductPermissions";
import { useLexAccess } from "../../../hooks/useLexAccess";
import { emptyPage, lexErrorMessage, logForbidden, type LexPage } from "../../../redux/apis/apisLexCore";
import { formatMinutes } from "../../../redux/apis/apisLexConfig";
import {
  CASE_SORTS,
  caseChip,
  getCaseCounts,
  getCases,
  slaChip,
  type LexCaseCounts,
  type LexCaseSummary,
} from "../../../redux/apis/apisLexCases";

const SLA_TONE: Record<string, string> = {
  WITHIN_SLA: TONES.emerald,
  NEAR_BREACH: TONES.amber,
  CRITICAL_BREACH: TONES.red,
  STOPPED: TONES.slate,
  NOT_TRACKED: TONES.slate,
};

/**
 * The portfolio as it stands right now, and a way into any single application.
 *
 * **The tiles count referrals, not applications.** `lending-service` calls LEX
 * exactly once, when its approval gate returns MANUAL_REVIEW: an application
 * that auto-approves or auto-declines never opens a case here and never emits a
 * LEX event. So LEX genuinely does not know the portfolio total, and it cannot
 * know how many decisions were autonomous.
 *
 * The mockup's TOTAL APPLICATIONS and DECIDED AUTONOMOUSLY tiles are therefore
 * not built. Rendering LEX's referral count under the label "Total
 * Applications" would misstate the automation rate by design — and it would be
 * read as measured, because it sits beside eight figures that are. The tiles
 * below are the eight `/counts` actually answers.
 */
const SELECT_TRIGGER_CLS =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-foreground/30 bg-foreground px-4 py-2 text-sm font-medium text-background shadow-sm transition-colors hover:bg-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60";

/**
 * The row already carries every one of these, so expanding costs no second
 * call. Rendered by DataTable beneath its row.
 */
const ExpandedRow = ({ data: row }: { data: LexCaseSummary }) => {
  const { t } = useTranslation("lex");
  return (
    <div className="grid grid-cols-1 gap-4 px-4 py-3 sm:grid-cols-2 lg:grid-cols-4">
      <ExpandedField
        label={t("case.field.requestedAmount")}
        value={row.requestedAmount != null ? formatMoney(row.requestedAmount) : undefined}
      />
      <ExpandedField
        label={t("dash.field.incomeAndDbr")}
        value={
          [
            row.monthlyInstallment != null ? formatMoney(row.monthlyInstallment) : null,
            row.dbr != null ? `DBR ${row.dbr}%` : null,
          ]
            .filter(Boolean)
            .join(" · ") || undefined
        }
      />
      <ExpandedField label={t("dash.field.creditScore")} value={row.creditScore} />
      <div className="min-w-0">
        <span className="mb-1 block text-xs text-muted-foreground">
          {t("dash.field.referralReason")}
        </span>
        {/* Title and severity are null when the code is unrecognized. Show the
            code itself and mark the row as needing configuration — a blank
            cell says nothing at all. */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge
            variant="outline"
            className={`border font-medium ${row.hasUnrecognizedCode ? TONES.amber : TONES.sky}`}
          >
            {row.drivingReasonTitle || row.drivingReasonCode || "—"}
          </Badge>
          {row.hasUnrecognizedCode && (
            <Badge variant="outline" className={`border gap-1 font-medium ${TONES.amber}`}>
              <HelpCircle className="h-3 w-3" />
              {t("case.unrecognized")}
            </Badge>
          )}
        </div>
      </div>
      {/* Employment. Resolved end to end now: name, sector and vintage come
          from customer-service via lending; the category is LEX's own lookup
          against the Approved Employer List. */}
      <div className="grid grid-cols-1 gap-4 border-t border-border/60 pt-3 sm:col-span-2 sm:grid-cols-2 lg:col-span-4 lg:grid-cols-4">
        <ExpandedField
          label={t("dash.field.incomeSector")}
          value={row.incomeSector ? humanizeCode(row.incomeSector) : undefined}
        />
        <ExpandedField label={t("dash.field.employerName")} value={row.employerName} />
        <div className="min-w-0">
          <span className="mb-1 block text-xs text-muted-foreground">
            {t("dash.field.employerCategory")}
          </span>
          {/* UNKNOWN means nobody ran the check. It is never rendered as
              "Non-Whitelisted" — only a failed check is grounds for declining. */}
          <LexEmployerBadge category={row.employerCategory} t={t} />
        </div>
        <ExpandedField
          label={t("dash.field.employmentVintage")}
          value={
            row.employmentDurationMonths != null
              ? t("dash.months", { count: row.employmentDurationMonths })
              : undefined
          }
        />
      </div>
    </div>
  );
};
const LexOverview = () => {
  const { t } = useTranslation("lex");
  const navigate = useNavigate();
  const { can } = useLexAccess();

  const canRead = can(LEX_PERMISSIONS.CASE_READ);

  const [result, setResult] = useState<LexPage<LexCaseSummary>>(emptyPage<LexCaseSummary>());
  const [counts, setCounts] = useState<LexCaseCounts | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<string>(CASE_SORTS[0]);
  /** One row open at a time — the expansion is a detail, not a second list. */

  const errorsByCode = useMemo(
    () => ({ "COMMON.AUTH.ACCESS_DENIED": t("err.accessDenied") }),
    [t]
  );

  const load = async () => {
    if (!canRead) return;
    setIsLoading(true);
    try {
      setResult(await getCases({ page, size: pageSize, search: search || undefined, sort }));
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
      // The rows are the screen; the header is decoration. A failed count must
      // not take the activity list down with it.
      setCounts(null);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, search, sort]);

  useEffect(() => {
    loadCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canRead]);

  const headers = [
    {
      name: t("dash.col.date"),
      cell: (row: LexCaseSummary) => (
        <span className="whitespace-nowrap">{formatDate(row.openedAt)}</span>
      ),
      width: "130px",
    },
    {
      name: t("dash.col.appId"),
      cell: (row: LexCaseSummary) => (
        <span className="font-mono text-xs">{row.applicationNumber || row.applicationId}</span>
      ),
      width: "160px",
    },
    {
      // Blank on cases opened during the identity-service outage — the case
      // package is append-only, so those stay blank. Never a placeholder name.
      name: t("dash.col.name"),
      cell: (row: LexCaseSummary) => <span>{row.applicantName || "—"}</span>,
      width: "170px",
    },
    {
      name: t("dash.col.product"),
      cell: (row: LexCaseSummary) => <span>{row.productName || "—"}</span>,
      width: "150px",
    },
    {
      // Derived from the token's OAuth client, so a caller cannot misreport
      // it. Null when the client is unrecognised — "unknown" is a true
      // answer and a default would not be.
      name: t("dash.col.channel"),
      cell: (row: LexCaseSummary) =>
        row.sourceChannel ? (
          <Badge variant="outline" className={`border font-medium ${TONES.slate}`}>
            {humanizeCode(row.sourceChannel)}
          </Badge>
        ) : (
          <span>—</span>
        ),
      width: "140px",
    },
    {
      name: t("dash.col.status"),
      cell: (row: LexCaseSummary) => {
        const chip = caseChip(row);
        return <LexStatusBadge status={chip} label={t(`case.chip.${chip}`)} />;
      },
      width: "150px",
    },
    {
      // Null is the true answer for a self-service application, not a
      // missing value.
      name: t("dash.col.salesId"),
      cell: (row: LexCaseSummary) =>
        row.salesId ? (
          <span>{row.salesId}</span>
        ) : (
          <span className="text-muted-foreground" title={t("dash.selfServiceHint")}>
            {t("dash.selfService")}
          </span>
        ),
      width: "120px",
    },
    {
      name: t("dash.col.sla"),
      cell: (row: LexCaseSummary) => {
        const sla = slaChip(row);
        return (
          <div className="flex flex-col gap-1">
            <Badge
              variant="outline"
              className={`border w-fit gap-1 font-medium ${SLA_TONE[String(row.slaStatus)] || TONES.slate}`}
            >
              {sla.kind === "stopped" && <PauseCircle className="h-3 w-3" />}
              {row.slaStatus || t("case.sla.notTracked")}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {sla.kind === "remaining" &&
                t("case.sla.remaining", { time: formatMinutes(sla.minutes) })}
              {sla.kind === "overdue" &&
                t("case.sla.overdue", { time: formatMinutes(sla.minutes) })}
              {sla.kind === "stopped" && t("case.sla.stopped")}
              {sla.kind === "untracked" && t("case.sla.notTracked")}
            </span>
          </div>
        );
      },
      width: "180px",
    },
    {
      name: t("common:actions"),
      // Stops the row expanding as the menu opens.
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
  if (!canRead) return <PermissionDenied />;

  const total = counts?.allIngested ?? null;
  const totalRows = result.pagination?.totalElements ?? result.content.length;
  const totalPages = result.pagination?.totalPages || 1;

  return (
    <div className="service">
      <LexPageHeader
        icon={LayoutDashboard}
        title={t("dash.title")}
        subtitle={t("dash.subtitle")}
      />

      <div className="pro-card p-3 mb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <LexSearch
            id="dash-search"
            className="flex-1"
            value={search}
            onChange={(next) => {
              setSearch(next);
              setPage(1);
            }}
            placeholder={t("case.search")}
          />
          {/* No product catalogue endpoint exists in LEX — products arrive on
              cases as strings from lending — and /counts takes no date range.
              Both controls are shown disabled rather than wired to nothing. */}
          <LexUnavailableFilter label={t("dash.filter.allProducts")} title={t("dash.filter.productGap")} />
          <LexUnavailableFilter label={t("dash.filter.allTime")} title={t("dash.filter.dateGap")} />
          <Label htmlFor="dash-sort" className="sr-only">
            {t("case.filter.sort")}
          </Label>
          <Select
            value={sort}
            onValueChange={(v) => {
              setSort(v);
              setPage(1);
            }}
          >
            <SelectTrigger id="dash-sort" className="w-52 bg-card">
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
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              load();
              loadCounts();
            }}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            {t("common:refresh")}
          </Button>
        </div>
      </div>

      <LexNotice tone="sky">{t("case.referralScopeNote")}</LexNotice>

      {/* Eight tiles, every one of them a number /counts returns. The share
          under each is our own arithmetic against referrals — the server never
          sends percentages. */}
      <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <LexMetricTile
          label={t("dash.tile.referred")}
          value={counts?.allIngested}
          hint={t("dash.tile.referredHint")}
          loading={isLoading && !counts}
        />
        <LexMetricTile
          label={t("dash.tile.approved")}
          value={counts?.approved}
          denominator={total}
          tone="emerald"
          loading={isLoading && !counts}
        />
        <LexMetricTile
          label={t("dash.tile.declined")}
          value={counts?.declined}
          denominator={total}
          tone="red"
          loading={isLoading && !counts}
        />
        <LexMetricTile
          label={t("dash.tile.humanReview")}
          value={counts?.humanReview}
          denominator={total}
          tone="amber"
          loading={isLoading && !counts}
        />
        <LexMetricTile
          label={t("dash.tile.customerSupport")}
          value={counts?.returned}
          denominator={total}
          hint={t("dash.tile.customerSupportHint")}
          loading={isLoading && !counts}
        />
        <LexMetricTile
          label={t("dash.tile.nearBreach")}
          value={counts?.nearBreach}
          denominator={total}
          tone="amber"
          loading={isLoading && !counts}
        />
        <LexMetricTile
          label={t("dash.tile.criticalBreach")}
          value={counts?.criticalBreach}
          denominator={total}
          tone="red"
          loading={isLoading && !counts}
        />
        {/* The most actionable number on the page: codes nobody has configured,
            each one falling through to the Supervisor queue. */}
        <LexMetricTile
          label={t("dash.tile.unrecognized")}
          value={counts?.unrecognizedCode}
          denominator={total}
          tone="amber"
          hint={t("dash.tile.unrecognizedHint")}
          loading={isLoading && !counts}
        />
      </div>

      <div className="pro-card p-4">
        <div className="mb-3 flex items-center gap-2.5">
          <span className="pro-head-badge">
            <Activity className="h-4 w-4" />
          </span>
          <h4 className="m-0 text-sm font-semibold tracking-tight text-foreground">
            {t("dash.activity")}
          </h4>
        </div>

        {!isLoading && result.content.length === 0 ? (
          <EmptyState icon={Inbox} text={t("case.empty")} />
        ) : (
          <TableView
            header={headers}
            data={result.content}
            totalRows={totalRows}
            isLoading={isLoading}
            from={totalRows === 0 ? 0 : (page - 1) * pageSize + 1}
            to={Math.min(page * pageSize, totalRows)}
            page={page}
            totalPage={totalPages}
            setPage={setPage}
            pageSize={pageSize}
            setPageSize={(size: number) => {
              setPageSize(size);
              setPage(1);
            }}
            expandableRows
            expandableRowsComponent={ExpandedRow}
          />

        )}
      </div>
    </div>
  );
};

const ExpandedField = ({ label, value }: { label: string; value?: React.ReactNode }) => (
  <div className="min-w-0">
    <span className="mb-1 block text-xs text-muted-foreground">{label}</span>
    <span className="block text-sm font-medium text-foreground">
      {value === null || value === undefined || value === "" ? "—" : value}
    </span>
  </div>
);

export default LexOverview;
