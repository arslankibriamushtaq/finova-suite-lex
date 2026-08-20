import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Gauge, RefreshCw } from "lucide-react";

import TableView from "../../../components/TableView/TableView";
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
import { TONES } from "../../../components/shared/detailKitUtils";
import { LexNotice, LexPageHeader, LexTile } from "../../../components/shared/lexKit";
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

  return (
    <div className="service">
      <LexPageHeader icon={Gauge} title={t("board.title")} subtitle={t("board.subtitle")}>
        <Button variant="outline" className="h-10 gap-2" onClick={load} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          {t("common:refresh")}
        </Button>
      </LexPageHeader>

      {/* Six tiles, and `notTracked` is one of them — never folded into "within
          SLA". Those cases have no published policy for their product and
          sector; counting them as compliant would show an unconfigured tenant a
          perfect figure. */}
      <div className="mb-3 grid grid-cols-2 gap-3 lg:grid-cols-6">
        <LexTile label={t("board.tile.inFlight")} value={snapshot?.inFlight ?? "—"} loading={isLoading} />
        <LexTile
          label={t("board.tile.withinSla")}
          value={snapshot?.withinSla ?? "—"}
          tone="accent"
          loading={isLoading}
        />
        <LexTile label={t("board.tile.nearBreach")} value={snapshot?.nearBreach ?? "—"} loading={isLoading} />
        <LexTile
          label={t("board.tile.criticalBreach")}
          value={snapshot?.criticalBreach ?? "—"}
          loading={isLoading}
        />
        <LexTile
          label={t("board.tile.stoppedClock")}
          value={snapshot?.stoppedClock ?? "—"}
          hint={t("board.tile.stoppedClockHint")}
          loading={isLoading}
        />
        <LexTile
          label={t("board.tile.notTracked")}
          value={snapshot?.notTracked ?? "—"}
          hint={t("board.tile.notTrackedHint")}
          loading={isLoading}
        />
      </div>

      {snapshot?.averageMinutesInFlight !== undefined && (
        <div className="mb-3">
          <LexTile
            label={t("board.tile.averageInFlight")}
            value={formatMinutes(snapshot.averageMinutesInFlight)}
            hint={t("board.onClockHint")}
          />
        </div>
      )}

      {!!snapshot?.notTracked && (
        <LexNotice tone="amber">{t("board.notTrackedWarning", { count: snapshot.notTracked })}</LexNotice>
      )}

      {/* Shown because it demonstrates that clocks run on all three referral
          paths, not only the underwriter queue. */}
      {byRouting.length > 0 && (
        <div className="pro-card mb-3 p-4">
          <h4 className="m-0 mb-3 text-sm font-semibold tracking-tight text-foreground">
            {t("board.byRouting")}
          </h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {byRouting.map(([routing, count]) => (
              <LexTile key={routing} label={routing} value={count} />
            ))}
          </div>
        </div>
      )}

      <div className="pro-card">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 p-3 pb-0">
          <h4 className="m-0 text-sm font-semibold tracking-tight text-foreground">
            {t("board.breaching")}
          </h4>
          <Select value={minimum} onValueChange={(v) => setMinimum(v as LexBreachLevel)}>
            <SelectTrigger className="w-52 bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NEAR_BREACH">{t("board.min.near")}</SelectItem>
              <SelectItem value="CRITICAL_BREACH">{t("board.min.critical")}</SelectItem>
            </SelectContent>
          </Select>
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
