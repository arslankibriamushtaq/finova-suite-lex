import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Landmark, RefreshCcwDot, RefreshCw } from "lucide-react";

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
import { TONES, formatDateTime } from "../../../components/shared/detailKitUtils";
import { LexNotice, LexPageHeader } from "../../../components/shared/lexKit";
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

  if (!canRead) return <PermissionDenied />;

  const oldest = records.reduce<string | undefined>(
    (acc, r) => (!acc || (r.mirroredAt && r.mirroredAt < acc) ? r.mirroredAt || acc : acc),
    undefined
  );

  return (
    <div className="service">
      <LexPageHeader icon={Landmark} title={t("gov.title")} subtitle={t("gov.subtitle")}>
        <Select value={recordType} onValueChange={setRecordType}>
          <SelectTrigger className="w-56 bg-card">
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
        <Button variant="outline" className="h-10 gap-2" onClick={load} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          {t("common:refresh")}
        </Button>
        {canRefresh && (
          <Button className="wallet-brand-btn h-10 gap-2" onClick={onRefresh} disabled={busy}>
            <RefreshCcwDot className="h-4 w-4" />
            {t("gov.reproject")}
          </Button>
        )}
      </LexPageHeader>

      <LexNotice tone="slate">
        {oldest ? t("gov.mirrorNoteWithAge", { at: formatDateTime(oldest) }) : t("gov.mirrorNote")}
      </LexNotice>

      {refreshNote?.note && (
        <LexNotice tone={refreshNote.skipped ? "amber" : "emerald"}>{refreshNote.note}</LexNotice>
      )}

      {!isLoading && records.length === 0 ? (
        <div className="pro-card">
          <EmptyState icon={Landmark} text={t("gov.empty")} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {records.map((record) => (
            <div key={record.sourceId} className="pro-card p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <Badge variant="outline" className={`border font-medium ${TONES.sky}`}>
                  {record.recordType}
                </Badge>
                {/* On every record, prominently. */}
                <span className="text-xs text-muted-foreground">
                  {t("gov.mirroredAt", { at: formatDateTime(record.mirroredAt) || "—" })}
                </span>
              </div>
              <p className="m-0 text-sm font-medium text-foreground">
                {record.title || record.referenceCode || record.sourceId}
              </p>
              {record.referenceCode && (
                <p className="m-0 font-mono text-xs text-muted-foreground">{record.referenceCode}</p>
              )}
              {/* The configurator version this copy was taken from, beside when
                  it was taken — together they say exactly what is being read. */}
              {record.configVersion !== undefined && (
                <p className="m-0 mt-2 text-xs text-muted-foreground">
                  {t("gov.configVersion", { version: record.configVersion })}
                  {record.publishedAt ? ` · ${t("gov.publishedAt", { at: formatDateTime(record.publishedAt) })}` : ""}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LexGovernance;
