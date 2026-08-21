import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Landmark, RefreshCcwDot, RefreshCw } from "lucide-react";

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
import TableView from "../../../components/TableView/TableView";
import { EmptyState, PermissionDenied } from "../../../components/shared/detailKit";
import { TONES, formatDateTime } from "../../../components/shared/detailKitUtils";
import { LexNotice, LexPageHeader, LexSearch } from "../../../components/shared/lexKit";
import { LEX_PERMISSIONS } from "../../../hooks/useProductPermissions";
import { useLexAccess } from "../../../hooks/useLexAccess";
import { lexErrorMessage, logForbidden } from "../../../redux/apis/apisLexCore";
import {
  GOVERNANCE_RECORD_TYPES,
  getGovernanceRecords,
  refreshGovernance,
  type LexGovernanceRecord,
} from "../../../redux/apis/apisLexKnowledge";

/**
 * The governance mirror — published DoA and SLA records shown beside the policy
 * documents they came from. Read-only, apart from the refresh that re-projects.
 *
 * `mirroredAt` is on every record and is not decoration: this is a copy, not
 * the source, and a reader must be able to see how stale it is rather than
 * assume it is current.
 */
const LexGovernance = () => {
  const { t } = useTranslation("lex");
  // Ungated while the LEX permission codes are unregistered — see useLexAccess.
  const { can } = useLexAccess();

  const canRead = can(LEX_PERMISSIONS.GOVERNANCE_READ);
  const canRefresh = can(LEX_PERMISSIONS.GOVERNANCE_REFRESH);

  const [records, setRecords] = useState<LexGovernanceRecord[]>([]);
  const [recordType, setRecordType] = useState("ALL");
  const [isLoading, setIsLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  /** The result of the last refresh, including a skip — which is not a failure. */
  const [refreshNote, setRefreshNote] = useState<{ skipped?: boolean; note?: string } | null>(null);

  const errorsByCode = useMemo(
    () => ({ "COMMON.AUTH.ACCESS_DENIED": t("err.accessDenied") }),
    [t]
  );

  const load = async () => {
    if (!canRead) return;
    setIsLoading(true);
    try {
      setRecords(await getGovernanceRecords(recordType === "ALL" ? undefined : recordType));
      setPage(1);
    } catch (error) {
      logForbidden(error, "GET /knowledge/governance");
      toast.error(lexErrorMessage(error, t("gov.toast.loadFailed"), errorsByCode));
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordType]);

  /**
   * Read the response rather than assuming a projection happened. `skipped:
   * true` means the configurator returned nothing and the existing mirror was
   * deliberately left alone — a user who sees "0 records projected" without
   * that explanation will assume something broke.
   */
  const onRefresh = async () => {
    setBusy(true);
    try {
      const result = await refreshGovernance();
      setRefreshNote(result);
      if (result.skipped) toast(result.note || t("gov.refreshSkipped"));
      else toast.success(t("gov.refreshed", { count: result.projected ?? 0 }));
      load();
    } catch (error) {
      logForbidden(error, "POST /governance/refresh");
      toast.error(lexErrorMessage(error, t("gov.toast.refreshFailed"), errorsByCode));
    } finally {
      setBusy(false);
    }
  };

  // The records are homogeneous — type, name, code, version, two dates — so
  // they are compared down a column rather than hunted across a grid of
  // cards. Staleness in particular is the question this screen exists to
  // answer, and a column of dates answers it at a glance.
  const headers = [
    {
      name: t("gov.col.type"),
      cell: (row: LexGovernanceRecord) => (
        <Badge variant="outline" className={`border font-medium ${TONES.sky}`}>
          {row.recordType}
        </Badge>
      ),
      width: "180px",
    },
    {
      name: t("gov.col.record"),
      cell: (row: LexGovernanceRecord) => (
        <div className="min-w-0">
          <p className="m-0 truncate text-sm font-medium text-foreground">
            {row.title || row.referenceCode || row.sourceId}
          </p>
          {row.referenceCode && row.title && (
            <p className="m-0 truncate font-mono text-xs text-muted-foreground">
              {row.referenceCode}
            </p>
          )}
        </div>
      ),
    },
    {
      // The configurator version this copy was taken from — with the mirror
      // date beside it, the two say exactly what is being read.
      name: t("gov.col.version"),
      cell: (row: LexGovernanceRecord) => (
        <span>
          {row.configVersion !== undefined
            ? t("gov.configVersion", { version: row.configVersion })
            : "—"}
        </span>
      ),
      width: "160px",
    },
    {
      name: t("gov.col.published"),
      cell: (row: LexGovernanceRecord) => <span>{formatDateTime(row.publishedAt) || "—"}</span>,
      width: "180px",
    },
    {
      // Never omitted: this is a copy, and how old it is decides whether it
      // can be trusted for the question being asked.
      name: t("gov.col.mirrored"),
      cell: (row: LexGovernanceRecord) => <span>{formatDateTime(row.mirroredAt) || "—"}</span>,
      width: "180px",
    },
  ];

  // Every record is already loaded, so this narrows the whole mirror rather
  // than the page on screen.
  const needle = search.trim().toLowerCase();
  const filtered = needle
    ? records.filter((r) =>
        [r.recordType, r.title, r.referenceCode, r.sourceId]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(needle))
      )
    : records;

  const totalRows = filtered.length;
  const from = totalRows === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalRows);
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  if (!canRead) return <PermissionDenied />;

  const oldest = records.reduce<string | undefined>(
    (acc, r) => (!acc || (r.mirroredAt && r.mirroredAt < acc) ? r.mirroredAt || acc : acc),
    undefined
  );

  return (
    <div className="service">
      <LexPageHeader icon={Landmark} title={t("gov.title")} subtitle={t("gov.subtitle")} />

      <div className="pro-card p-3 mb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <LexSearch
            id="gov-search"
            className="flex-1"
            value={search}
            onChange={(next) => {
              setSearch(next);
              setPage(1);
            }}
            placeholder={t("gov.search")}
          />
          <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Label htmlFor="gov-type" className="sr-only">
            {t("gov.allTypes")}
          </Label>
          <Select value={recordType} onValueChange={setRecordType}>
            <SelectTrigger id="gov-type" className="w-56 bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t("gov.allTypes")}</SelectItem>
              {GOVERNANCE_RECORD_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2" onClick={load} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            {t("common:refresh")}
          </Button>
          {canRefresh && (
            <Button className="wallet-brand-btn gap-2" onClick={onRefresh} disabled={busy}>
              <RefreshCcwDot className="h-4 w-4" />
              {t("gov.reproject")}
            </Button>
          )}
          </div>
        </div>
      </div>

      <LexNotice tone="slate">
        {oldest ? t("gov.mirrorNoteWithAge", { at: formatDateTime(oldest) }) : t("gov.mirrorNote")}
      </LexNotice>

      {refreshNote?.note && (
        <LexNotice tone={refreshNote.skipped ? "amber" : "emerald"}>{refreshNote.note}</LexNotice>
      )}

      {!isLoading && totalRows === 0 ? (
        <div className="pro-card">
          <EmptyState icon={Landmark} text={t("gov.empty")} />
        </div>
      ) : (
        <div className="pro-card">
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
        </div>
      )}
    </div>
  );
};

export default LexGovernance;
