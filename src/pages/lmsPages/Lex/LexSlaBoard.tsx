import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Activity, AlertTriangle, Gauge, GitBranch, RefreshCw } from "lucide-react";

import TableView from "../../../components/TableView/TableView";
import { Badge } from "../../../components/ui/badge";
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
import { TONES } from "../../../components/shared/detailKitUtils";
import { LexNotice, LexPageHeader } from "../../../components/shared/lexKit";
import { LEX_PERMISSIONS } from "../../../hooks/useProductPermissions";
import { useLexAccess } from "../../../hooks/useLexAccess";
import { lexErrorMessage, logForbidden } from "../../../redux/apis/apisLexCore";
import { formatMinutes } from "../../../redux/apis/apisLexConfig";
import {
  getBreachingCases,
  getSlaSnapshot,
  type LexBreachLevel,
  type LexBreachingCase,
  type LexSlaSnapshot,
} from "../../../redux/apis/apisLexSla";

/**
 * The SLA operations board.
 *
 * **Read-only, and there are no edit controls anywhere on it.** Every target
 * comes from the SLA Configurator and no endpoint here writes one — a control
 * that looked editable would be a promise the service cannot keep.
 */
/**
 * Routing gets its own hues. Reusing the health bar's emerald/amber/red
 * would imply a delegated case is "good" and a supervisor case is "bad",
 * which is not what the split means.
 */
const ROUTING_SWATCH: Record<string, string> = {
  DELEGATION: "bg-sky-500",
  SUPERVISOR: "bg-indigo-500",
  APPLICATION_SOURCE: "bg-orange-500",
  AUTO_RESOLVE: "bg-teal-500",
};
const routingSwatch = (key: string) => ROUTING_SWATCH[key] || "bg-slate-400";

/** One slice of the proportion bar, named and counted. */
const Slice = ({ swatch, label, value }: { swatch: string; label: string; value: number }) => (
  <span className="inline-flex items-center gap-1.5 text-xs">
    <span className={`size-2 shrink-0 rounded-full ${swatch}`} />
    <span className="text-muted-foreground">{label}</span>
    <span className="font-semibold text-foreground">{value}</span>
  </span>
);

/** A headline number: bigger than a tile, no box around it. */
const Headline = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="min-w-0">
    <span className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
      {label}
    </span>
    <span className="mt-0.5 block text-xl font-bold tabular-nums text-foreground">{value}</span>
  </div>
);
const LexSlaBoard = () => {
  const { t } = useTranslation("lex");
  // Ungated while the LEX permission codes are unregistered — see useLexAccess.
  const { can } = useLexAccess();

  const canRead = can(LEX_PERMISSIONS.SLA_BOARD_READ);

  const [snapshot, setSnapshot] = useState<LexSlaSnapshot | null>(null);
  const [cases, setCases] = useState<LexBreachingCase[]>([]);
  const [minimum, setMinimum] = useState<LexBreachLevel>("NEAR_BREACH");
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const errorsByCode = useMemo(
    () => ({ "COMMON.AUTH.ACCESS_DENIED": t("err.accessDenied") }),
    [t]
  );

  const load = async () => {
    if (!canRead) return;
    setIsLoading(true);
    try {
      const [snap, breaching] = await Promise.all([
        getSlaSnapshot(),
        getBreachingCases(minimum),
      ]);
      setSnapshot(snap);
      setCases(breaching);
    } catch (error) {
      logForbidden(error, "GET /sla/snapshot");
      toast.error(lexErrorMessage(error, t("board.toast.loadFailed"), errorsByCode));
      setSnapshot(null);
      setCases([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minimum]);

  const headers = [
    {
      name: t("board.col.case"),
      cell: (row: LexBreachingCase) => (
        <span className="font-mono text-xs">{row.applicationNumber || row.applicationId || row.caseId}</span>
      ),
      width: "200px",
    },
    {
      name: t("board.col.stage"),
      cell: (row: LexBreachingCase) => <span>{row.stageCode || "—"}</span>,
      width: "180px",
    },
    {
      name: t("board.col.reasonCode"),
      cell: (row: LexBreachingCase) => (
        <span className="font-mono text-xs">{row.drivingReasonCode || "—"}</span>
      ),
      width: "180px",
    },
    {
      name: t("board.col.level"),
      cell: (row: LexBreachingCase) => <span>{row.assignedLevelCode || "—"}</span>,
      width: "150px",
    },
    {
      name: t("board.col.breach"),
      cell: (row: LexBreachingCase) => (
        <Badge
          variant="outline"
          className={`border font-medium ${
            row.slaStatus === "CRITICAL_BREACH" ? TONES.red : TONES.amber
          }`}
        >
          {row.slaStatus}
        </Badge>
      ),
      width: "170px",
    },
    {
      // Not "time open": stopped-clock periods are excluded, and the two
      // numbers differ. Labelling it wrong invites a supervisor to argue with
      // the board rather than with the case.
      name: t("board.col.onClock"),
      cell: (row: LexBreachingCase) => (
        <span title={t("board.onClockHint")}>{formatMinutes(row.elapsedMinutes)}</span>
      ),
      width: "180px",
    },
    {
      name: t("board.col.target"),
      cell: (row: LexBreachingCase) => <span>{formatMinutes(row.targetMinutes)}</span>,
      width: "140px",
    },
  ];

  if (!canRead) return <PermissionDenied />;

  const totalRows = cases.length;
  const from = totalRows === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalRows);
  const pageRows = cases.slice((page - 1) * pageSize, page * pageSize);

  const byRouting = Object.entries(snapshot?.byRoutingType || {});

  // The bar is a proportion of the measured cases, so stopped and untracked
  // are excluded from the denominator rather than shrinking the other slices.
  const tracked =
    (snapshot?.withinSla ?? 0) + (snapshot?.nearBreach ?? 0) + (snapshot?.criticalBreach ?? 0);
  const pct = (value?: number) =>
    tracked > 0 ? `${((value ?? 0) / tracked) * 100}%` : "0%";

  const routedTotal = byRouting.reduce((sum, [, count]) => sum + Number(count || 0), 0);
  const routingPct = (value: number) =>
    routedTotal > 0 ? `${(value / routedTotal) * 100}%` : "0%";

  return (
    <div className="service">
      <LexPageHeader icon={Gauge} title={t("board.title")} subtitle={t("board.subtitle")} />

      <div className="pro-card p-3 mb-3">
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Label htmlFor="board-minimum" className="sr-only">
            {t("board.col.breach")}
          </Label>
          <Select value={minimum} onValueChange={(v) => setMinimum(v as LexBreachLevel)}>
            <SelectTrigger id="board-minimum" className="w-52 bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NEAR_BREACH">{t("board.min.near")}</SelectItem>
              <SelectItem value="CRITICAL_BREACH">{t("board.min.critical")}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2" onClick={load} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            {t("common:refresh")}
          </Button>
        </div>
      </div>

      {/* `notTracked` and `stoppedClock` are shown apart from the breakdown,
          never folded into it: an unmeasured case is not a compliant one, and
          combining them hands an unconfigured tenant a perfect figure. */}
      <div className="pro-card mb-3 p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="pro-head-badge">
              <Activity className="h-4 w-4" />
            </span>
            <h4 className="m-0 text-sm font-semibold tracking-tight text-foreground">
              {t("board.health")}
            </h4>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <Headline label={t("board.tile.inFlight")} value={snapshot?.inFlight ?? "—"} />
            {snapshot?.averageMinutesInFlight !== undefined && (
              <Headline
                label={t("board.tile.averageInFlight")}
                value={formatMinutes(snapshot.averageMinutesInFlight)}
              />
            )}
          </div>
        </div>

        <div className="flex h-2.5 w-full overflow-hidden rounded-[2px] bg-muted">
          <div className="bg-emerald-500" style={{ width: pct(snapshot?.withinSla) }} />
          <div className="bg-amber-500" style={{ width: pct(snapshot?.nearBreach) }} />
          <div className="bg-red-500" style={{ width: pct(snapshot?.criticalBreach) }} />
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1.5">
          <Slice
            swatch="bg-emerald-500"
            label={t("board.tile.withinSla")}
            value={snapshot?.withinSla ?? 0}
          />
          <Slice
            swatch="bg-amber-500"
            label={t("board.tile.nearBreach")}
            value={snapshot?.nearBreach ?? 0}
          />
          <Slice
            swatch="bg-red-500"
            label={t("board.tile.criticalBreach")}
            value={snapshot?.criticalBreach ?? 0}
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 border-t border-border/60 pt-2.5">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {t("board.notMeasured")}
          </span>
          <Slice
            swatch="bg-muted-foreground/40"
            label={t("board.tile.stoppedClock")}
            value={snapshot?.stoppedClock ?? 0}
          />
          <Slice
            swatch="bg-muted-foreground/40"
            label={t("board.tile.notTracked")}
            value={snapshot?.notTracked ?? 0}
          />
        </div>

        {/* The same population split a second way — which path each case is
            on, rather than how its clock is doing. */}
        {byRouting.length > 0 && (
          <div className="mt-3 border-t border-border/60 pt-3">
            <div className="mb-2 flex items-center gap-1.5">
              <GitBranch className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {t("board.byRouting")}
              </span>
            </div>
            <div className="flex h-2.5 w-full overflow-hidden rounded-[2px] bg-muted">
              {byRouting.map(([routing, count]) => (
                <div
                  key={routing}
                  className={routingSwatch(routing)}
                  style={{ width: routingPct(Number(count || 0)) }}
                />
              ))}
            </div>
            <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1.5">
              {byRouting.map(([routing, count]) => (
                <Slice
                  key={routing}
                  swatch={routingSwatch(routing)}
                  label={routing}
                  value={Number(count || 0)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      {!!snapshot?.notTracked && (
        <LexNotice tone="amber">{t("board.notTrackedWarning", { count: snapshot.notTracked })}</LexNotice>
      )}

      <div className="pro-card">
        <div className="flex items-center gap-2.5 p-3 pb-2">
          <span className="pro-head-badge">
            <AlertTriangle className="h-4 w-4" />
          </span>
          <h4 className="m-0 text-sm font-semibold tracking-tight text-foreground">
            {t("board.breaching")}
          </h4>
          {totalRows > 0 && (
            <Badge variant="outline" className={`border font-medium ${TONES.red}`}>
              {totalRows}
            </Badge>
          )}
        </div>

        {!isLoading && totalRows === 0 ? (
          <EmptyState icon={Gauge} text={t("board.emptyBreaching")} />
        ) : (
          <TableView
            header={headers}
            data={pageRows}
            totalRows={totalRows}
            isLoading={isLoading}
            from={from}
            to={to}
            page={page}
            totalPage={Math.ceil(totalRows / pageSize) || 1}
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

export default LexSlaBoard;
