import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  CircleSlash,
  FileSearch,
  FlaskConical,
  FileWarning,
  RefreshCw,
  ScanEye,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

import TableView from "../../../components/TableView/TableView";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { EmptyState, PermissionDenied } from "../../../components/shared/detailKit";
import { TONES, formatDateTime, formatMoney } from "../../../components/shared/detailKitUtils";
import { LexNotice, LexPageHeader, LexSearch } from "../../../components/shared/lexKit";
import { LEX_PERMISSIONS } from "../../../hooks/useProductPermissions";
import { useLexAccess } from "../../../hooks/useLexAccess";
import { emptyPage, lexErrorMessage, logForbidden, type LexPage } from "../../../redux/apis/apisLexCore";
import {
  getAnalyses,
  getAnalysis,
  isDataProblem,
  isStubReader,
  type LexAnalysis,
  type LexAnalysisRow,
} from "../../../redux/apis/apisLexDocuments";

/**
 * The four outcomes, and the one that matters most.
 *
 * `NOT_RUN` means the sequence stopped before reaching this check — it is never
 * a pass and it is never hidden. Rendering it as blank makes a halted sequence
 * look like a clean one, which is the single easiest way to approve a document
 * nobody finished reading.
 */
const OUTCOME_STYLE: Record<string, { tone: string; icon: typeof ShieldCheck }> = {
  PASS: { tone: TONES.emerald, icon: ShieldCheck },
  FAIL: { tone: TONES.red, icon: ShieldAlert },
  FLAGGED: { tone: TONES.amber, icon: FileWarning },
  NOT_RUN: { tone: TONES.slate, icon: CircleSlash },
};

/**
 * The header states. The three data-problem states are styled apart from
 * ADVERSE_FINDINGS deliberately — an unreadable payslip is not an adverse
 * credit finding, and presenting them the same way teaches underwriters to
 * treat a scanning problem as a red flag on a customer.
 */
const STATE_STYLE: Record<string, string> = {
  VERIFIED: TONES.emerald,
  ADVERSE_FINDINGS: TONES.red,
  UNREADABLE: TONES.sky,
  WRONG_TYPE: TONES.sky,
  ANALYSIS_UNAVAILABLE: TONES.sky,
};

/**
 * The check tally as it stands on the list row, before the full `checks` array
 * is fetched. "15/15" reads as done; a non-zero failed/flagged/not-run count is
 * surfaced beside it so a halted or adverse sequence is visible without opening
 * the row. When no checks have run at all the endpoint sends zeros — shown as a
 * dash rather than a misleading "0/0".
 */
const ChecksSummary = ({
  row,
  t,
}: {
  row: LexAnalysis;
  t: (key: string, opts?: Record<string, unknown>) => string;
}) => {
  const total = row.checksTotal ?? 0;
  if (!total) return <span className="text-muted-foreground">—</span>;

  const passed = row.checksPassed ?? 0;
  const failed = row.checksFailed ?? 0;
  const flagged = row.checksFlagged ?? 0;
  const notRun = row.checksNotRun ?? 0;
  const allPassed = passed === total;

  return (
    <div className="flex flex-col gap-1">
      <span className={`text-sm font-medium ${allPassed ? "text-emerald-600" : "text-foreground"}`}>
        {t("ana.checksSummary", { passed, total })}
      </span>
      {(failed > 0 || flagged > 0 || notRun > 0) && (
        <div className="flex flex-wrap gap-1">
          {failed > 0 && (
            <Badge variant="outline" className={`border text-[10px] ${TONES.red}`}>
              {t("ana.checksFailed", { count: failed })}
            </Badge>
          )}
          {flagged > 0 && (
            <Badge variant="outline" className={`border text-[10px] ${TONES.amber}`}>
              {t("ana.checksFlagged", { count: flagged })}
            </Badge>
          )}
          {notRun > 0 && (
            <Badge variant="outline" className={`border text-[10px] ${TONES.slate}`}>
              {t("ana.checksNotRun", { count: notRun })}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

const LexAnalyses = () => {
  const { t } = useTranslation("lex");
  // Ungated while the LEX permission codes are unregistered — see useLexAccess.
  const { can } = useLexAccess();

  const canRead = can(LEX_PERMISSIONS.ANALYSIS_READ);

  const [result, setResult] = useState<LexPage<LexAnalysis>>(emptyPage<LexAnalysis>());
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [applicationId, setApplicationId] = useState("");

  const [selected, setSelected] = useState<LexAnalysis | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const errorsByCode = useMemo(
    () => ({ "COMMON.AUTH.ACCESS_DENIED": t("err.accessDenied") }),
    [t]
  );

  const load = async () => {
    if (!canRead) return;
    setIsLoading(true);
    try {
      setResult(
        await getAnalyses({ page, size: pageSize, applicationId: applicationId || undefined })
      );
    } catch (error) {
      logForbidden(error, "GET /documents/analyses");
      toast.error(lexErrorMessage(error, t("ana.toast.loadFailed"), errorsByCode));
      setResult(emptyPage<LexAnalysis>(pageSize));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, applicationId]);

  const openAnalysis = async (row: LexAnalysis) => {
    try {
      setSelected(await getAnalysis(row.id));
      setDetailOpen(true);
    } catch (error) {
      toast.error(lexErrorMessage(error, t("ana.toast.loadFailed"), errorsByCode));
    }
  };

  const headers = [
    {
      name: t("ana.col.application"),
      cell: (row: LexAnalysis) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-foreground">
            {row.application?.applicantName || t("ana.unknownApplicant")}
          </span>
          <span className="font-mono text-[11px] text-muted-foreground">
            {row.application?.applicationNumber || row.applicationId}
          </span>
        </div>
      ),
      width: "220px",
    },
    {
      name: t("ana.col.product"),
      cell: (row: LexAnalysis) => (
        <div className="flex flex-col gap-0.5">
          <span>{row.application?.productName || "—"}</span>
          {typeof row.application?.requestedAmount === "number" && (
            <span className="text-[11px] text-muted-foreground">
              {formatMoney(row.application.requestedAmount)}
            </span>
          )}
        </div>
      ),
      width: "180px",
    },
    {
      name: t("ana.col.documentType"),
      cell: (row: LexAnalysis) => <span>{row.documentKind || "—"}</span>,
      width: "160px",
    },
    {
      name: t("ana.col.state"),
      cell: (row: LexAnalysis) => (
        <div className="flex flex-col gap-1">
          <Badge
            variant="outline"
            className={`border font-medium ${STATE_STYLE[String(row.state)] || TONES.slate}`}
          >
            {row.state}
          </Badge>
          {/* Said on the row, not only in the detail: the list is where an
              underwriter triages, and "the file was unreadable" must not look
              like "the applicant has a problem". */}
          {isDataProblem(row) && (
            <span className="text-[11px] text-muted-foreground">{t("ana.dataProblemShort")}</span>
          )}
        </div>
      ),
      width: "180px",
    },
    {
      name: t("ana.col.checks"),
      cell: (row: LexAnalysis) => <ChecksSummary row={row} t={t} />,
      width: "170px",
    },
    {
      name: t("ana.col.confidence"),
      cell: (row: LexAnalysis) => (
        <span>
          {typeof row.confidenceScore === "number" ? `${row.confidenceScore.toFixed(1)}%` : "—"}
        </span>
      ),
      width: "110px",
    },
    {
      name: t("ana.col.analysedAt"),
      cell: (row: LexAnalysis) => <span>{formatDateTime(row.analysedAt) || "—"}</span>,
      width: "170px",
    },
    {
      name: t("common:actions"),
      cell: (row: LexAnalysis) => (
        <Button variant="outline" size="sm" onClick={() => openAnalysis(row)}>
          {t("open")}
        </Button>
      ),
      width: "110px",
    },
  ];

  if (!canRead) return <PermissionDenied />;

  const totalRows = result.pagination?.totalElements ?? result.content.length;
  const from = totalRows === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalRows);

  const rows: LexAnalysisRow[] = selected?.checks || [];
  const notRunCount = rows.filter((r) => r.outcome === "NOT_RUN").length;

  return (
    <div className="service">
      <LexPageHeader icon={ScanEye} title={t("ana.title")} subtitle={t("ana.subtitle")}>
        <LexSearch
          value={applicationId}
          onChange={(next) => {
            setApplicationId(next);
            setPage(1);
          }}
          placeholder={t("ana.filterApplication")}
        />
        <Button variant="outline" className="h-10 gap-2" onClick={load} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          {t("common:refresh")}
        </Button>
      </LexPageHeader>

      {/* Said before any of the numbers are read. The reader on this build is a
          deterministic stand-in whose findings derive from the document id — a
          demo that looks like real forensics is how a stub ends up quoted in a
          credit committee. */}
      {result.content.some((row) => isStubReader(row)) && (
        <LexNotice tone="amber" icon={FlaskConical}>
          {t("ana.stubReaderNote")}
        </LexNotice>
      )}

      <div className="pro-card">
        {!isLoading && totalRows === 0 ? (
          <EmptyState icon={FileSearch} text={t("ana.empty")} />
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

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="pro-dialog sm:max-w-2xl">
          <DialogHeader className="text-start">
            <DialogTitle>{t("ana.detail.title")}</DialogTitle>
            <DialogDescription>
              {selected?.application?.applicantName ||
                selected?.application?.applicationNumber ||
                selected?.applicationId}{" "}
              · {formatDateTime(selected?.analysedAt) || "—"}
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <>
              {/* The header verdict. A data problem says plainly that nothing
                  about the applicant has been assessed. */}
              {isDataProblem(selected) ? (
                <LexNotice tone="sky" icon={FileWarning}>
                  <p className="m-0 font-medium">{t(`ana.state.${selected.state}`)}</p>
                  <p className="m-0 mt-1">{t("ana.dataProblemExplain")}</p>
                </LexNotice>
              ) : (
                <LexNotice
                  tone={selected.state === "ADVERSE_FINDINGS" ? "red" : "emerald"}
                  icon={selected.state === "ADVERSE_FINDINGS" ? ShieldAlert : ShieldCheck}
                >
                  <p className="m-0 font-medium">{t(`ana.state.${selected.state}`)}</p>
                  {selected.state === "ADVERSE_FINDINGS" && (
                    <p className="m-0 mt-1">{t("ana.adverseExplain")}</p>
                  )}
                </LexNotice>
              )}

              {isStubReader(selected) && (
                <LexNotice tone="amber" icon={FlaskConical}>
                  {t("ana.stubReaderDetail", {
                    reader: [selected.readerName, selected.readerVersion]
                      .filter(Boolean)
                      .join(" · "),
                  })}
                </LexNotice>
              )}

              {notRunCount > 0 && (
                <LexNotice tone="amber" icon={CircleSlash}>
                  {t("ana.notRunSummary", { count: notRunCount })}
                </LexNotice>
              )}

              <div className="max-h-[50vh] overflow-y-auto">
                {rows.length === 0 ? (
                  <p className="m-0 py-6 text-center text-sm text-muted-foreground">
                    {t("ana.detail.noRows")}
                  </p>
                ) : (
                  rows.map((row, index) => {
                    const style = OUTCOME_STYLE[String(row.outcome)] || OUTCOME_STYLE.NOT_RUN;
                    const Icon = style.icon;
                    return (
                      <div
                        key={`${row.checkCode}-${index}`}
                        className="flex items-start gap-3 border-b border-border/60 py-2.5 last:border-b-0"
                      >
                        <span className="w-6 shrink-0 pt-1 text-center text-xs text-muted-foreground">
                          {row.ordinal ?? index + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="m-0 text-sm font-medium text-foreground">
                            {row.displayName || row.checkCode}
                          </p>
                          {row.detail && (
                            <p className="m-0 mt-0.5 text-xs text-muted-foreground">{row.detail}</p>
                          )}
                          {row.reasonCode && (
                            <p className="m-0 mt-0.5 font-mono text-[11px] text-muted-foreground">
                              {row.reasonCode}
                            </p>
                          )}
                        </div>
                        <Badge
                          variant="outline"
                          className={`border shrink-0 gap-1 font-medium ${style.tone}`}
                        >
                          <Icon className="h-3 w-3" />
                          {t(`ana.outcome.${row.outcome}`)}
                        </Badge>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LexAnalyses;
