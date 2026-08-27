import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  Building2,
  ChevronDown,
  Eye,
  History,
  RefreshCw,
  Search,
  UserMinus,
} from "lucide-react";

import TableView from "../../../components/TableView/TableView";
import { SearchField } from "../../../components/shared/filterKit";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Switch } from "../../../components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { EmptyState, Field, PermissionDenied } from "../../../components/shared/detailKit";
import {
  TONES,
  formatDate,
  formatDateTime,
  formatMoney,
} from "../../../components/shared/detailKitUtils";
import { LexPageHeader, LexStatusBadge } from "../../../components/shared/lexKit";
import { LEX_PERMISSIONS } from "../../../hooks/useProductPermissions";
import { useLexAccess } from "../../../hooks/useLexAccess";
import { emptyPage, lexErrorMessage, lexErrorStatus, logForbidden, type LexPage } from "../../../redux/apis/apisLexCore";
import {
  delistEmployer,
  getEmployer,
  getEmployerHistory,
  getEmployers,
  lookupEmployer,
  type LexEmployer,
} from "../../../redux/apis/apisLexKnowledge";

/**
 * The Approved Employer List.
 *
 * > **This screen has no "Add Employer" button. That is a requirement, not an
 * > omission.**
 *
 * The list is a record of what the Agent Configurator already decided.
 * Employers are added by the agent on completion of the Employer Not
 * 'Whitelisted' process, through an internal route the UI cannot reach — so
 * there is no manual add and no manual edit anywhere on this screen, and the
 * note at the top says how an employer actually gets listed.
 *
 * Delist is the only write a person gets, and it does not destroy the entry:
 * it moves to the history, which is linked from here so that is obvious.
 */
const SELECT_TRIGGER_CLS =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-foreground/30 bg-foreground px-4 py-2 text-sm font-medium text-background shadow-sm transition-colors hover:bg-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60";

const LexEmployers = () => {
  const { t } = useTranslation("lex");
  // Ungated while the LEX permission codes are unregistered — see useLexAccess.
  const { can } = useLexAccess();

  const canRead = can(LEX_PERMISSIONS.EMPLOYER_READ);
  const canDelist = can(LEX_PERMISSIONS.EMPLOYER_DELIST);

  const [result, setResult] = useState<LexPage<LexEmployer>>(emptyPage<LexEmployer>());
  const [isLoading, setIsLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeOnly, setActiveOnly] = useState(true);

  const [cr, setCr] = useState("");
  const [lookupResult, setLookupResult] = useState<LexEmployer | null>(null);
  const [lookupMiss, setLookupMiss] = useState(false);

  const [detail, setDetail] = useState<LexEmployer | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [history, setHistory] = useState<LexEmployer[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);

  const [delistTarget, setDelistTarget] = useState<LexEmployer | null>(null);
  const [delistReason, setDelistReason] = useState("");

  const errorsByCode = useMemo(
    () => ({ "COMMON.AUTH.ACCESS_DENIED": t("err.accessDenied") }),
    [t]
  );

  const load = async () => {
    if (!canRead) return;
    setIsLoading(true);
    try {
      setResult(await getEmployers({ page, size: pageSize, active: activeOnly || undefined }));
    } catch (error) {
      logForbidden(error, "GET /knowledge/employers");
      toast.error(lexErrorMessage(error, t("emp.toast.loadFailed"), errorsByCode));
      setResult(emptyPage<LexEmployer>(pageSize));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, activeOnly]);

  /** Keyed on CR number. Spaces and dashes are fine — the server normalizes. */
  const onLookup = async () => {
    if (!cr.trim()) return;
    setBusy(true);
    setLookupMiss(false);
    setLookupResult(null);
    try {
      setLookupResult(await lookupEmployer(cr.trim()));
    } catch (error) {
      // 404 has a specific meaning here: not currently approved. It is not an
      // error to report as a failure.
      if (lexErrorStatus(error) === 404) setLookupMiss(true);
      else toast.error(lexErrorMessage(error, t("emp.toast.lookupFailed"), errorsByCode));
    } finally {
      setBusy(false);
    }
  };

  const openDetail = async (row: LexEmployer) => {
    try {
      setDetail(await getEmployer(row.id));
      setDetailOpen(true);
    } catch (error) {
      toast.error(lexErrorMessage(error, t("emp.toast.loadFailed"), errorsByCode));
    }
  };

  const openHistory = async (commercialRegistration: string) => {
    try {
      setHistory(await getEmployerHistory(commercialRegistration));
      setHistoryOpen(true);
    } catch (error) {
      toast.error(lexErrorMessage(error, t("emp.toast.historyFailed"), errorsByCode));
    }
  };

  const onDelist = async () => {
    if (!delistTarget) return;
    if (!delistReason.trim()) return toast.error(t("emp.valid.reason"));

    setBusy(true);
    try {
      await delistEmployer(delistTarget.id, delistReason.trim());
      toast.success(t("emp.toast.delisted"));
      setDelistTarget(null);
      setDelistReason("");
      setDetailOpen(false);
      load();
    } catch (error) {
      logForbidden(error, "POST /employers/{id}/delist");
      toast.error(lexErrorMessage(error, t("emp.toast.delistFailed"), errorsByCode));
    } finally {
      setBusy(false);
    }
  };

  const headers = [
    {
      name: t("emp.col.employer"),
      cell: (row: LexEmployer) => <span className="font-medium">{row.employerName}</span>,
    },
    {
      name: t("emp.col.cr"),
      cell: (row: LexEmployer) => (
        <span className="font-mono text-xs">{row.commercialRegistration}</span>
      ),
      width: "170px",
    },
    {
      name: t("emp.col.sector"),
      cell: (row: LexEmployer) => (
        <Badge variant="outline" className={`border font-medium ${TONES.sky}`}>
          {row.sector}
        </Badge>
      ),
      width: "130px",
    },
    {
      name: t("emp.col.reach"),
      cell: (row: LexEmployer) => <span>{row.reach}</span>,
      width: "150px",
    },
    {
      name: t("emp.col.category"),
      cell: (row: LexEmployer) => <span>{row.listingCategory || "—"}</span>,
      width: "150px",
    },
    {
      name: t("emp.col.listed"),
      cell: (row: LexEmployer) => <span>{formatDate(row.listedAt) || "—"}</span>,
      width: "140px",
    },
    {
      name: t("emp.col.status"),
      cell: (row: LexEmployer) => <LexStatusBadge status={row.active ? "ACTIVE" : "INACTIVE"} />,
      width: "130px",
    },
    {
      name: t("common:actions"),
      // Stops the row's own click handling from firing as the menu opens.
      cell: (row: LexEmployer) => (
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
                  openDetail(row);
                }}
              >
                <Eye className="h-4 w-4" />
                {t("open")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  openHistory(row.commercialRegistration);
                }}
              >
                <History className="h-4 w-4" />
                {t("emp.history")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      width: "120px",
    },
  ];

  if (!canRead) return <PermissionDenied />;

  const totalRows = result.pagination?.totalElements ?? result.content.length;
  const from = totalRows === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalRows);

  return (
    <div className="service">
      <LexPageHeader icon={Building2} title={t("emp.title")} subtitle={t("emp.subtitle")} />

      <div className="pro-card p-3 mb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex-1" onKeyDown={(e) => e.key === "Enter" && onLookup()}>
            <SearchField
              id="emp-cr"
              value={cr}
              onChange={setCr}
              placeholder={t("emp.lookup.label")}
            />
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button variant="outline" className="gap-2" onClick={onLookup} disabled={busy}>
              <Search className="h-4 w-4" />
              {t("emp.lookup.action")}
            </Button>
            <div className="flex items-center gap-2 ps-1">
              <Label htmlFor="emp-active" className="text-xs text-muted-foreground">
                {t("emp.activeOnly")}
              </Label>
              <Switch
                id="emp-active"
                checked={activeOnly}
                onCheckedChange={(checked) => {
                  setActiveOnly(checked);
                  setPage(1);
                }}
              />
            </div>
            <Button variant="outline" className="gap-2" onClick={load} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              {t("common:refresh")}
            </Button>
          </div>
        </div>

        {lookupMiss && (
          <p className="m-0 mt-3 text-sm text-muted-foreground">{t("emp.lookup.notApproved")}</p>
        )}
        {lookupResult && (
          <div className="pro-tile mt-3 flex flex-wrap items-center gap-3">
            <span className="font-medium">{lookupResult.employerName}</span>
            <LexStatusBadge status={lookupResult.active ? "ACTIVE" : "INACTIVE"} />
            <Button variant="outline" className="gap-2" onClick={() => openDetail(lookupResult)}>
              <Eye className="h-4 w-4" />
              {t("open")}
            </Button>
          </div>
        )}
      </div>
      <div className="pro-card">
        {!isLoading && totalRows === 0 ? (
          <EmptyState icon={Building2} text={t("emp.empty")} />
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

      {/* Detail — the verification facts are evidence, shown as read-only. */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="pro-dialog sm:max-w-lg">
          <DialogHeader className="text-start">
            <DialogTitle className="flex flex-wrap items-center gap-2">
              {detail?.employerName}
              {detail && <LexStatusBadge status={detail.active ? "ACTIVE" : "INACTIVE"} />}
            </DialogTitle>
            <DialogDescription className="font-mono">
              {detail?.commercialRegistration}
            </DialogDescription>
          </DialogHeader>

          {detail && (
            <div className="max-h-[55vh] overflow-y-auto">
              <Field label={t("emp.col.sector")} value={detail.sector} />
              <Field label={t("emp.col.reach")} value={detail.reach} />
              <Field label={t("emp.col.category")} value={detail.listingCategory} />
              <Field label={t("emp.col.listed")} value={formatDateTime(detail.listedAt)} />
              <Field label={t("emp.field.crStatus")} value={detail.crStatus} />
              <Field label={t("emp.field.zakatStatus")} value={detail.zakatStatus} />
              <Field label={t("emp.field.vatStatus")} value={detail.vatStatus} />
              <Field label={t("emp.field.incorporatedOn")} value={formatDate(detail.incorporatedOn)} />
              <Field
                label={t("emp.field.paidUpCapital")}
                value={detail.paidUpCapital != null ? formatMoney(detail.paidUpCapital) : undefined}
              />
              {/* Provenance: every listing names the application that produced
                  it, which is what makes the entry auditable. */}
              <Field
                label={t("emp.field.originApplication")}
                mono
                value={
                  detail.originApplicationId ? (
                    <a
                      href={`/LOS/FinancingApplications/AllApplications/View/${detail.originApplicationId}`}
                      title={detail.originApplicationId}
                      className="text-red-600 underline-offset-2 hover:underline dark:text-red-400"
                    >
                      <span className="inline-block max-w-[12rem] truncate align-bottom">
                        {detail.originApplicationId}
                      </span>
                    </a>
                  ) : (
                    "—"
                  )
                }
              />
              {detail.delistedReason && (
                <Field label={t("emp.field.delistReason")} value={detail.delistedReason} />
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:justify-end">
            <Button variant="ghost" onClick={() => setDetailOpen(false)}>
              {t("common:close")}
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => detail && openHistory(detail.commercialRegistration)}
            >
              <History className="h-4 w-4" />
              {t("emp.history")}
            </Button>
            {canDelist && detail?.active && (
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => {
                  setDelistTarget(detail);
                  setDelistReason("");
                }}
              >
                <UserMinus className="h-4 w-4" />
                {t("emp.delist")}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delist — the consequence, stated. */}
      <Dialog open={!!delistTarget} onOpenChange={(open) => !open && setDelistTarget(null)}>
        <DialogContent className="pro-dialog sm:max-w-md">
          <DialogHeader className="text-start">
            <DialogTitle>{t("emp.delistTitle", { employer: delistTarget?.employerName })}</DialogTitle>
            <DialogDescription>{t("emp.delistExplain")}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="emp-reason">{t("emp.field.delistReason")}</Label>
            <Input
              id="emp-reason"
              className="h-10"
              value={delistReason}
              onChange={(e) => setDelistReason(e.target.value)}
            />
          </div>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button variant="ghost" onClick={() => setDelistTarget(null)} disabled={busy}>
              {t("common:cancel")}
            </Button>
            <Button className="wallet-brand-btn" onClick={onDelist} disabled={busy}>
              {t("emp.delist")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History — nothing is destroyed, and this is where it goes. */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="pro-dialog sm:max-w-2xl">
          <DialogHeader className="text-start">
            <DialogTitle>{t("emp.historyTitle")}</DialogTitle>
            <DialogDescription>{t("emp.historyExplain")}</DialogDescription>
          </DialogHeader>
          <div className="max-h-[55vh] overflow-y-auto">
            {history.length === 0 ? (
              <p className="m-0 py-6 text-center text-sm text-muted-foreground">
                {t("emp.historyEmpty")}
              </p>
            ) : (
              history.map((entry) => (
                <div
                  key={entry.id}
                  className="pro-tile mb-2 flex flex-wrap items-center justify-between gap-2 last:mb-0"
                >
                  <div className="min-w-0">
                    <p className="m-0 text-sm font-medium">{entry.employerName}</p>
                    <p className="m-0 text-xs text-muted-foreground">
                      {formatDate(entry.listedAt)} → {formatDate(entry.delistedAt || undefined) || t("emp.current")}
                    </p>
                    {entry.delistedReason && (
                      <p className="m-0 mt-0.5 text-xs text-muted-foreground">{entry.delistedReason}</p>
                    )}
                  </div>
                  <LexStatusBadge status={entry.active ? "ACTIVE" : "INACTIVE"} />
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LexEmployers;
