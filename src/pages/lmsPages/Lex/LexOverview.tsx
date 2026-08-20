import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Inbox,
  LayoutDashboard,
  PauseCircle,
  RefreshCw,
} from "lucide-react";

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
import { TONES, formatDate, formatMoney } from "../../../components/shared/detailKitUtils";
import {
  LexMetricTile,
  LexNotice,
  LexPageHeader,
  LexSearch,
  LexStatusBadge,
  LexUnavailableFilter,
} from "../../../components/shared/lexKit";
import { cn } from "../../../lib/utils";
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
  const [expanded, setExpanded] = useState<string | null>(null);

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
        <div className="flex flex-wrap items-center justify-end gap-2">
          {/* No product catalogue endpoint exists in LEX — products arrive on
              cases as strings from lending — and /counts takes no date range.
              Both controls are shown disabled rather than wired to nothing. */}
          <LexUnavailableFilter label={t("dash.filter.allProducts")} title={t("dash.filter.productGap")} />
          <LexUnavailableFilter label={t("dash.filter.allTime")} title={t("dash.filter.dateGap")} />
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
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h4 className="m-0 text-sm font-semibold tracking-tight text-foreground">
            {t("dash.activity")}
          </h4>
          <div className="flex flex-wrap items-center gap-2">
            <LexSearch
              value={search}
              onChange={(next) => {
                setSearch(next);
                setPage(1);
              }}
              placeholder={t("case.search")}
            />
            <Select
              value={sort}
              onValueChange={(v) => {
                setSort(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-52 bg-card">
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
          </div>
        </div>

        {!isLoading && result.content.length === 0 ? (
          <EmptyState icon={Inbox} text={t("case.empty")} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-start">
                  <th className="w-8 py-2" />
                  {[
                    "dash.col.date",
                    "dash.col.appId",
                    "dash.col.name",
                    "dash.col.product",
                    "dash.col.channel",
                    "dash.col.status",
                    "dash.col.salesId",
                    "dash.col.sla",
                  ].map((key) => (
                    <th
                      key={key}
                      className="py-2 pe-3 text-start text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
                    >
                      {t(key)}
                    </th>
                  ))}
                  <th className="py-2 text-start text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("common:actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.content.map((row) => {
                  const chip = caseChip(row);
                  const sla = slaChip(row);
                  const isOpen = expanded === row.id;

                  return (
                    <React.Fragment key={row.id}>
                      <tr
                        className={cn(
                          "border-b border-border/60 align-middle",
                          isOpen && "bg-muted/30"
                        )}
                      >
                        <td className="py-2.5">
                          <button
                            type="button"
                            aria-label={t(isOpen ? "dash.collapse" : "dash.expand")}
                            onClick={() => setExpanded(isOpen ? null : row.id)}
                            className="rounded p-1 text-muted-foreground hover:bg-muted"
                          >
                            {isOpen ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4 rtl:rotate-180" />
                            )}
                          </button>
                        </td>
                        <td className="py-2.5 pe-3 whitespace-nowrap">{formatDate(row.openedAt)}</td>
                        <td className="py-2.5 pe-3 font-mono text-xs">
                          {row.applicationNumber || row.applicationId}
                        </td>
                        {/* Blank on cases opened during the identity-service
                            outage — the case package is append-only, so those
                            stay blank. Never a placeholder name. */}
                        <td className="py-2.5 pe-3">{row.applicantName || "—"}</td>
                        <td className="py-2.5 pe-3">{row.productName || "—"}</td>
                        {/* Always the constant "loan-origination": mobile and
                            web are indistinguishable to lending. Showing "App"
                            or "Branch" would be fabricated. */}
                        <td className="py-2.5 pe-3">
                          {row.sourceChannel ? (
                            <Badge variant="outline" className={`border font-medium ${TONES.slate}`}>
                              {row.sourceChannel}
                            </Badge>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="py-2.5 pe-3">
                          <LexStatusBadge status={chip} label={t(`case.chip.${chip}`)} />
                        </td>
                        {/* lending never sends salesId — it is not one of the
                            nineteen fields on the evaluation contract. */}
                        <td className="py-2.5 pe-3">{row.salesId || "—"}</td>
                        <td className="py-2.5 pe-3">
                          <div className="flex flex-col gap-1">
                            <Badge
                              variant="outline"
                              className={`border w-fit gap-1 font-medium ${
                                SLA_TONE[String(row.slaStatus)] || TONES.slate
                              }`}
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
                        </td>
                        <td className="py-2.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/LOS/Lex/Cases/${row.id}`)}
                          >
                            {t("open")}
                          </Button>
                        </td>
                      </tr>

                      {/* Everything here is on the row already — expanding costs
                          no second call. */}
                      {isOpen && (
                        <tr className="border-b border-border/60 bg-muted/20">
                          <td />
                          <td colSpan={9} className="py-3 pe-3">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                              <ExpandedField
                                label={t("case.field.requestedAmount")}
                                value={
                                  row.requestedAmount != null
                                    ? formatMoney(row.requestedAmount)
                                    : undefined
                                }
                              />
                              <ExpandedField
                                label={t("dash.field.incomeAndDbr")}
                                value={
                                  [
                                    row.monthlyInstallment != null
                                      ? formatMoney(row.monthlyInstallment)
                                      : null,
                                    row.dbr != null ? `DBR ${row.dbr}%` : null,
                                  ]
                                    .filter(Boolean)
                                    .join(" · ") || undefined
                                }
                              />
                              <ExpandedField
                                label={t("dash.field.creditScore")}
                                value={row.creditScore}
                              />
                              <div className="min-w-0">
                                <span className="mb-1 block text-xs text-muted-foreground">
                                  {t("dash.field.referralReason")}
                                </span>
                                {/* Title and severity are null when the code is
                                    unrecognized. Show the code itself and mark
                                    the row as needing configuration — a blank
                                    cell says nothing at all. */}
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <Badge
                                    variant="outline"
                                    className={`border font-medium ${
                                      row.hasUnrecognizedCode ? TONES.amber : TONES.sky
                                    }`}
                                  >
                                    {row.drivingReasonTitle || row.drivingReasonCode || "—"}
                                  </Badge>
                                  {!!row.secondaryCodeCount && (
                                    <Badge
                                      variant="outline"
                                      className={`border font-medium ${TONES.slate}`}
                                    >
                                      +{row.secondaryCodeCount}
                                    </Badge>
                                  )}
                                  {row.hasUnrecognizedCode && (
                                    <Badge
                                      variant="outline"
                                      className={`border gap-1 font-medium ${TONES.amber}`}
                                    >
                                      <HelpCircle className="h-3 w-3" />
                                      {t("case.unrecognized")}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            {/* Income sector, employer name and employer
                                category are on the mockup and in no contract.
                                Said once, here, rather than as three empty
                                fields that look like a loading failure. */}
                            <p className="m-0 mt-3 text-xs text-muted-foreground">
                              {t("dash.employmentGap")}
                            </p>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">
            {t("dash.showing", {
              from: totalRows === 0 ? 0 : (page - 1) * pageSize + 1,
              to: Math.min(page * pageSize, totalRows),
              total: totalRows,
            })}
          </span>
          <div className="flex items-center gap-2">
            <Select
              value={String(pageSize)}
              onValueChange={(v) => {
                setPageSize(Number(v));
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-20 bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 50].map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              {t("common:previous")}
            </Button>
            <span className="text-xs text-muted-foreground">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage((p) => p + 1)}
            >
              {t("common:next")}
            </Button>
          </div>
        </div>
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
