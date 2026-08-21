import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  CalendarClock,
  ChevronDown,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Send,
  Trash2,
} from "lucide-react";

import TableView from "../../../components/TableView/TableView";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { EmptyState, PermissionDenied } from "../../../components/shared/detailKit";
import { TONES, formatDateTime } from "../../../components/shared/detailKitUtils";
import {
  LexNotice,
  LexPageHeader,
  LexSearch,
  LexStatusBadge,
} from "../../../components/shared/lexKit";
import { LEX_PERMISSIONS } from "../../../hooks/useProductPermissions";
import { useLexAccess } from "../../../hooks/useLexAccess";
import { lexErrorMessage, logForbidden } from "../../../redux/apis/apisLexCore";
import {
  EXPORT_FORMATS,
  MAX_MONTHLY_DAY,
  SCHEDULE_FREQUENCIES,
  createSchedule,
  deleteSchedule,
  getGallery,
  getSavedReports,
  getSchedules,
  runScheduleNow,
  scheduleProblem,
  setScheduleActive,
  type LexSchedule,
} from "../../../redux/apis/apisLexBi";

const DAYS_OF_WEEK = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

/**
 * Scheduled exports.
 *
 * Two things this screen has to say out loud:
 *
 * - a FAILED last run does **not** mean the schedule stopped. The next run is
 *   still armed, and users who do not know that delete and recreate schedules
 *   that were working. The failure note is shown on the row.
 * - the monthly day picker caps at 28. A schedule on the 30th would skip
 *   February entirely, and a monthly report that silently misses a month is
 *   worse than one that runs three days early.
 */
const SELECT_TRIGGER_CLS =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-foreground/30 bg-foreground px-4 py-2 text-sm font-medium text-background shadow-sm transition-colors hover:bg-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60";

const LexBiSchedules = () => {
  const { t } = useTranslation("lex");
  // Ungated while the LEX permission codes are unregistered — see useLexAccess.
  const { can } = useLexAccess();

  const canRead = can(LEX_PERMISSIONS.SCHEDULE_READ);
  const canWrite = can(LEX_PERMISSIONS.SCHEDULE_WRITE);

  const [schedules, setSchedules] = useState<LexSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [pendingDelete, setPendingDelete] = useState<LexSchedule | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [targetKind, setTargetKind] = useState<"STANDARD" | "SAVED">("STANDARD");
  const [reportKey, setReportKey] = useState("");
  const [reportDefinitionId, setReportDefinitionId] = useState("");
  const [frequency, setFrequency] = useState("DAILY");
  const [dayOfWeek, setDayOfWeek] = useState("MONDAY");
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [timeOfDay, setTimeOfDay] = useState("07:00");
  const [format, setFormat] = useState("XLSX");
  const [recipients, setRecipients] = useState("");

  const [standardKeys, setStandardKeys] = useState<{ key: string; label: string }[]>([]);
  const [savedReports, setSavedReports] = useState<{ key: string; label: string }[]>([]);

  const errorsByCode = useMemo(
    () => ({ "COMMON.AUTH.ACCESS_DENIED": t("err.accessDenied") }),
    [t]
  );

  const load = async () => {
    if (!canRead) return;
    setIsLoading(true);
    try {
      const data = await getSchedules();
      // Next due first, as the reference specifies.
      setSchedules(
        [...data].sort((a, b) => String(a.nextRunAt || "").localeCompare(String(b.nextRunAt || "")))
      );
    } catch (error) {
      logForbidden(error, "GET /bi/schedules");
      toast.error(lexErrorMessage(error, t("sch.toast.loadFailed"), errorsByCode));
      setSchedules([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Only the runnable gallery cards can be scheduled — an unavailable report
  // would produce a schedule that delivers nothing.
  useEffect(() => {
    if (!canWrite) return;
    getGallery()
      .then((cards) =>
        setStandardKeys(
          cards.filter((c) => c.available).map((c) => ({ key: c.key, label: c.title }))
        )
      )
      .catch(() => setStandardKeys([]));
    getSavedReports({ size: 50 })
      .then((res) => setSavedReports((res.content || []).map((r) => ({ key: r.id, label: r.name }))))
      .catch(() => setSavedReports([]));
  }, [canWrite]);

  const draft = (): Partial<LexSchedule> => ({
    reportKey: targetKind === "STANDARD" ? reportKey || undefined : undefined,
    reportDefinitionId: targetKind === "SAVED" ? reportDefinitionId || undefined : undefined,
    frequency,
    dayOfWeek: frequency === "WEEKLY" ? dayOfWeek : undefined,
    dayOfMonth: frequency === "MONTHLY" ? dayOfMonth : undefined,
    timeOfDay,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    format,
    recipients: recipients
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean),
  });

  const onCreate = async () => {
    const body = draft();
    const problem = scheduleProblem(body);
    if (problem) return toast.error(t(`sch.valid.${problem}`));

    setBusy(true);
    try {
      await createSchedule({ ...body, active: true });
      toast.success(t("sch.toast.created"));
      setFormOpen(false);
      load();
    } catch (error) {
      logForbidden(error, "POST /bi/schedules");
      toast.error(lexErrorMessage(error, t("sch.toast.createFailed"), errorsByCode));
    } finally {
      setBusy(false);
    }
  };

  const onToggle = async (schedule: LexSchedule) => {
    try {
      await setScheduleActive(schedule.id, !schedule.active);
      toast.success(schedule.active ? t("sch.toast.paused") : t("sch.toast.resumed"));
      load();
    } catch (error) {
      toast.error(lexErrorMessage(error, t("sch.toast.updateFailed"), errorsByCode));
    }
  };

  /** `delivered: false` with a reason is an outcome, not an error — show the note either way. */
  const onRunNow = async (schedule: LexSchedule) => {
    setBusy(true);
    try {
      const result = await runScheduleNow(schedule.id);
      if (result.delivered) {
        toast.success(result.note || t("sch.toast.delivered", { rows: result.rowCount ?? 0 }));
      } else {
        toast(result.note || t("sch.toast.notDelivered"));
      }
      load();
    } catch (error) {
      toast.error(lexErrorMessage(error, t("sch.toast.runFailed"), errorsByCode));
    } finally {
      setBusy(false);
    }
  };

  // A schedule is not recoverable once removed, and the trigger used to be an
  // unlabelled glyph, so this asks first.
  const onDelete = async (schedule: LexSchedule) => {
    setBusy(true);
    try {
      await deleteSchedule(schedule.id);
      toast.success(t("sch.toast.deleted"));
      setPendingDelete(null);
      load();
    } catch (error) {
      toast.error(lexErrorMessage(error, t("sch.toast.deleteFailed"), errorsByCode));
    } finally {
      setBusy(false);
    }
  };

  const headers = [
    {
      name: t("sch.col.report"),
      cell: (row: LexSchedule) => (
        <span className="font-medium">{row.reportName || row.reportKey || row.reportDefinitionId}</span>
      ),
    },
    {
      name: t("sch.col.frequency"),
      cell: (row: LexSchedule) => (
        <span className="text-sm">
          {row.frequency}
          {row.dayOfWeek ? ` · ${row.dayOfWeek}` : ""}
          {row.dayOfMonth ? ` · ${row.dayOfMonth}` : ""} · {row.timeOfDay} {row.timeZone}
        </span>
      ),
      width: "260px",
    },
    {
      name: t("sch.col.format"),
      cell: (row: LexSchedule) => <span>{row.format}</span>,
      width: "100px",
    },
    {
      name: t("sch.col.recipients"),
      cell: (row: LexSchedule) => (
        <span className="text-xs text-muted-foreground" title={row.recipients?.join(", ")}>
          {row.recipients?.length ?? 0}
        </span>
      ),
      width: "120px",
    },
    {
      name: t("sch.col.lastRun"),
      cell: (row: LexSchedule) => (
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs">{formatDateTime(row.lastRunAt) || "—"}</span>
            {row.lastRunStatus && (
              <Badge
                variant="outline"
                className={`border font-medium ${
                  row.lastRunStatus === "FAILED" ? TONES.red : TONES.emerald
                }`}
              >
                {row.lastRunStatus}
              </Badge>
            )}
          </div>
          {/* A failed run still arms the next one — the note explains what went
              wrong, and the row does not imply the schedule has stopped. */}
          {row.lastRunStatus === "FAILED" && (
            <p className="m-0 mt-0.5 text-[11px] text-muted-foreground">
              {row.lastRunNote || t("sch.failedStillArmed")}
            </p>
          )}
        </div>
      ),
      width: "260px",
    },
    {
      name: t("sch.col.nextRun"),
      cell: (row: LexSchedule) => <span className="text-xs">{formatDateTime(row.nextRunAt) || "—"}</span>,
      width: "170px",
    },
    {
      name: t("sch.col.active"),
      cell: (row: LexSchedule) => <LexStatusBadge status={row.active ? "ACTIVE" : "INACTIVE"} />,
      width: "120px",
    },
    ...(canWrite
      ? [
          {
            name: t("common:actions"),
            // Stops the row's own click handling from firing as the menu opens.
            cell: (row: LexSchedule) => (
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
                        onToggle(row);
                      }}
                    >
                      {row.active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      {row.active ? t("sch.pause") : t("sch.resume")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                        onRunNow(row);
                      }}
                    >
                      <Send className="h-4 w-4" />
                      {t("sch.runNow")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                        setPendingDelete(row);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      {t("common:delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ),
            width: "120px",
          },
        ]
      : []),
  ];

  if (!canRead) return <PermissionDenied />;

  // The endpoint returns every schedule in one response, so this narrows the
  // whole set rather than the page on screen.
  const needle = search.trim().toLowerCase();
  const filtered = needle
    ? schedules.filter((row) =>
        [row.reportName, row.reportKey, row.frequency, row.format, ...(row.recipients || [])]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(needle))
      )
    : schedules;

  const totalRows = filtered.length;
  const from = totalRows === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalRows);
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const targetOptions = targetKind === "STANDARD" ? standardKeys : savedReports;

  return (
    <div className="service">
      <LexPageHeader icon={CalendarClock} title={t("sch.title")} subtitle={t("sch.subtitle")} />

      <div className="pro-card p-3 mb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <LexSearch
            id="sch-search"
            className="flex-1"
            value={search}
            onChange={(next) => {
              setSearch(next);
              setPage(1);
            }}
            placeholder={t("sch.search")}
          />
          <div className="flex shrink-0 flex-wrap items-center gap-2">
        <Button variant="outline" className="gap-2" onClick={load} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          {t("common:refresh")}
        </Button>
        {canWrite && (
          <Button className="wallet-brand-btn gap-2" onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" />
            {t("sch.new")}
          </Button>
        )}
          </div>
        </div>
      </div>

      {schedules.some((s) => s.lastRunStatus === "FAILED") && (
        <LexNotice tone="amber">{t("sch.failedNote")}</LexNotice>
      )}

      <div className="pro-card">
        {!isLoading && totalRows === 0 ? (
          <EmptyState icon={CalendarClock} text={t("sch.empty")} />
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

      <Dialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <DialogContent className="pro-dialog confirm-dialog sm:max-w-md">
          <DialogHeader className="text-start">
            <DialogTitle>{t("sch.deleteConfirm.title")}</DialogTitle>
            <DialogDescription>
              {t("sch.deleteConfirm.body", {
                name: pendingDelete?.reportName || pendingDelete?.reportKey || "",
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button variant="ghost" onClick={() => setPendingDelete(null)} disabled={busy}>
              {t("common:cancel")}
            </Button>
            <Button
              variant="destructive"
              disabled={busy}
              onClick={() => pendingDelete && onDelete(pendingDelete)}
            >
              {t("common:delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="pro-dialog sm:max-w-lg">
          <DialogHeader className="text-start">
            <DialogTitle>{t("sch.form.title")}</DialogTitle>
            <DialogDescription>{t("sch.form.explain")}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            {/* Exactly one of standard / saved — enforced here rather than by a 422. */}
            <div className="flex flex-col gap-1.5">
              <Label>{t("sch.field.targetKind")}</Label>
              <Select
                value={targetKind}
                onValueChange={(v) => {
                  setTargetKind(v as "STANDARD" | "SAVED");
                  setReportKey("");
                  setReportDefinitionId("");
                }}
              >
                <SelectTrigger className="w-full data-[size=default]:h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STANDARD">{t("sch.target.standard")}</SelectItem>
                  <SelectItem value="SAVED">{t("sch.target.saved")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>{t("sch.field.report")}</Label>
              <Select
                value={targetKind === "STANDARD" ? reportKey : reportDefinitionId}
                onValueChange={(v) =>
                  targetKind === "STANDARD" ? setReportKey(v) : setReportDefinitionId(v)
                }
              >
                <SelectTrigger className="w-full data-[size=default]:h-10">
                  <SelectValue placeholder={t("sch.field.reportPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {targetOptions.map((option) => (
                    <SelectItem key={option.key} value={option.key}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label>{t("sch.field.frequency")}</Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger className="w-full data-[size=default]:h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SCHEDULE_FREQUENCIES.map((f) => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {frequency === "WEEKLY" && (
                <div className="flex flex-col gap-1.5">
                  <Label>{t("sch.field.dayOfWeek")}</Label>
                  <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                    <SelectTrigger className="w-full data-[size=default]:h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS_OF_WEEK.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {frequency === "MONTHLY" && (
                <div className="flex flex-col gap-1.5">
                  <Label>{t("sch.field.dayOfMonth")}</Label>
                  <Select value={String(dayOfMonth)} onValueChange={(v) => setDayOfMonth(Number(v))}>
                    <SelectTrigger className="w-full data-[size=default]:h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: MAX_MONTHLY_DAY }, (_, i) => i + 1).map((d) => (
                        <SelectItem key={d} value={String(d)}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {/* The cap, explained where it bites. */}
                  <p className="m-0 text-xs text-muted-foreground">{t("sch.field.dayOfMonthHint")}</p>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="sch-time">{t("sch.field.time")}</Label>
                <Input
                  id="sch-time"
                  type="time"
                  className="h-10"
                  value={timeOfDay}
                  onChange={(e) => setTimeOfDay(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>{t("sch.field.format")}</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger className="w-full data-[size=default]:h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPORT_FORMATS.map((f) => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sch-recipients">{t("sch.field.recipients")}</Label>
              <Input
                id="sch-recipients"
                className="h-10"
                placeholder={t("sch.field.recipientsPlaceholder")}
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
              />
              <p className="m-0 text-xs text-muted-foreground">{t("sch.field.recipientsHint")}</p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-end">
            <Button variant="ghost" onClick={() => setFormOpen(false)} disabled={busy}>
              {t("common:cancel")}
            </Button>
            <Button className="wallet-brand-btn" onClick={onCreate} disabled={busy}>
              {t("common:save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LexBiSchedules;
