import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  ChevronDown,
  Eye,
  Gauge,
  GitBranch,
  ListOrdered,
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
import { TONES, humanizeCode } from "../../../components/shared/detailKitUtils";
import {
  LexMetricTile,
  LexNotice,
  LexPageHeader,
  LexTile,
} from "../../../components/shared/lexKit";
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
const SELECT_TRIGGER_CLS =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-foreground/30 bg-foreground px-4 py-2 text-sm font-medium text-background shadow-sm transition-colors hover:bg-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60";

const LexSlaBoard = () => {
  const { t } = useTranslation("lex");
  const navigate = useNavigate();
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
    {
      // Negative is the point of this board — how far past due, not a
      // countdown. `formatMinutes` floors at zero, so the sign is applied here.
      name: t("board.col.remaining"),
      cell: (row: LexBreachingCase) => {
        const remaining = (row.targetMinutes ?? 0) - (row.elapsedMinutes ?? 0);
        if (row.targetMinutes == null || row.elapsedMinutes == null) return <span>—</span>;
        return (
          <span className={remaining < 0 ? "font-medium text-red-600 dark:text-red-400" : undefined}>
            {remaining < 0
              ? t("case.sla.overdue", { time: formatMinutes(-remaining) })
              : t("case.sla.remaining", { time: formatMinutes(remaining) })}
          </span>
        );
      },
      width: "160px",
    },
    {
      name: t("common:actions"),
      // Stops the row's own click handling from firing as the menu opens.
      cell: (row: LexBreachingCase) => (
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
                  navigate(`/LOS/Lex/Cases/${row.caseId}`);
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

  const totalRows = cases.length;
  const from = totalRows === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalRows);
  const pageRows = cases.slice((page - 1) * pageSize, page * pageSize);

  const byRouting = Object.entries(snapshot?.byRoutingType || {});
  const byStage = Object.entries(snapshot?.byStage || {});

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

      {/* Six tiles, and `notTracked` is one of them — never folded into "within
          SLA". Those cases have no published policy for their product and
          sector; counting them as compliant would show an unconfigured tenant a
          perfect figure.

          The mockup's STRAIGHT-THROUGH RATE tile is not here: a straight-through
          application never reaches LEX, so LEX cannot measure the rate at which
          it happens. */}
      <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <LexMetricTile
          label={t("board.tile.withinSla")}
          value={snapshot?.withinSla}
          denominator={snapshot?.inFlight}
          tone="emerald"
          hint={t("board.tile.withinSlaHint", { inFlight: snapshot?.inFlight ?? 0 })}
          loading={isLoading}
        />
        <LexMetricTile
          label={t("board.tile.criticalBreach")}
          value={snapshot?.criticalBreach}
          denominator={snapshot?.inFlight}
          tone="red"
          loading={isLoading}
        />
        <LexMetricTile
          label={t("board.tile.nearBreach")}
          value={snapshot?.nearBreach}
          denominator={snapshot?.inFlight}
          tone="amber"
          loading={isLoading}
        />
        <LexMetricTile
          label={t("board.tile.stoppedClock")}
          value={snapshot?.stoppedClock}
          denominator={snapshot?.inFlight}
          hint={t("board.tile.stoppedClockHint")}
          loading={isLoading}
        />
        <LexMetricTile
          label={t("board.tile.notTracked")}
          value={snapshot?.notTracked}
          denominator={snapshot?.inFlight}
          tone="amber"
          hint={t("board.tile.notTrackedHint")}
          loading={isLoading}
        />
        {/* Null when nothing is in flight — "—", never a zero that reads as
            instant processing. */}
        <LexTile
          label={t("board.tile.averageInFlight")}
          value={formatMinutes(snapshot?.averageMinutesInFlight)}
          hint={t("board.onClockHint")}
          loading={isLoading}
        />
      </div>

      {/* Queue pipeline journey. Stage names and live counts come from
          `byStage`; the target beside each comes from the published SLA policy.
          The mockup's "Responsible: Digital Channels / Fraud Control / …" line
          is not here — stages carry a code and a target, not an owning team,
          and no LEX service models one. */}
      {byStage.length > 0 && (
        <div className="pro-card mb-3 p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="pro-head-badge">
                <ListOrdered className="h-4 w-4" />
              </span>
              <h4 className="m-0 text-sm font-semibold tracking-tight text-foreground">
                {t("board.pipeline")}
              </h4>
            </div>
            <Badge variant="outline" className={`border font-medium ${TONES.sky}`}>
              {t("board.pipelineActive")}
            </Badge>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {byStage.map(([stage, count], index) => (
              <div key={stage} className="pro-tile">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {index + 1}. {humanizeCode(stage)}
                  </span>
                </div>
                <p className="m-0 mt-2 text-xs text-muted-foreground">
                  {t("board.inQueue", { count })}
                </p>
              </div>
            ))}
          </div>
          <p className="m-0 mt-3 text-xs text-muted-foreground">{t("board.pipelineTeamGap")}</p>
        </div>
      )}

      {!!snapshot?.notTracked && (
        <LexNotice tone="amber">{t("board.notTrackedWarning", { count: snapshot.notTracked })}</LexNotice>
      )}

      {/* Shown because it demonstrates that clocks run on all three referral
          paths, not only the underwriter queue. */}
      {byRouting.length > 0 && (
        <div className="pro-card mb-3 p-4">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="pro-head-badge">
              <GitBranch className="h-4 w-4" />
            </span>
            <h4 className="m-0 text-sm font-semibold tracking-tight text-foreground">
              {t("board.byRouting")}
            </h4>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {byRouting.map(([routing, count]) => (
              <LexTile key={routing} label={routing} value={count} />
            ))}
          </div>
        </div>
      )}

      <div className="pro-card">
        <div className="flex flex-wrap items-center gap-2.5 p-3 pb-2">
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
          {/* The breaching endpoint does not carry the applicant name — the
              mockup's column would need a join or a wider contract. Open the
              case for it rather than showing an empty column. */}
          <p className="m-0 basis-full text-xs text-muted-foreground">{t("board.nameGap")}</p>
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
