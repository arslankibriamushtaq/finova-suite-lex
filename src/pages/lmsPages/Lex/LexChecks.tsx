import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { ListChecks, OctagonAlert, Pencil, Plus, RefreshCw, Sparkles } from "lucide-react";

import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Switch } from "../../../components/ui/switch";
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
import { TONES } from "../../../components/shared/detailKitUtils";
import { cn } from "../../../lib/utils";
import { LexPageHeader } from "../../../components/shared/lexKit";
import { LEX_PERMISSIONS } from "../../../hooks/useProductPermissions";
import { useLexAccess } from "../../../hooks/useLexAccess";
import { lexErrorMessage, logForbidden } from "../../../redux/apis/apisLexCore";
import {
  CHECK_GROUPS,
  createCheck,
  getChecks,
  seedChecks,
  setCheckActive,
  updateCheck,
  type LexCheck,
} from "../../../redux/apis/apisLexDocuments";

const GROUP_TONE: Record<string, string> = {
  AUTHENTICITY: TONES.sky,
  FINANCIAL: TONES.emerald,
  FORENSIC: TONES.orange,
  SCORING: TONES.slate,
};

/**
 * The document verification sequence — the order the runner executes checks in.
 *
 * Two properties of a check drive everything else on this screen:
 *
 * - **blocking**: a blocking check that fails halts the sequence, and every
 *   check after it is recorded NOT_RUN. That is said next to the toggle, not
 *   in a help page.
 * - **reasonCode**: required, because a failure with no code reaches a human as
 *   an unexplained flag.
 *
 * Retiring a check sets `active: false`. There is no delete: past analyses keep
 * their recorded rows, so the sequence a document was judged against stays
 * readable.
 *
 * Position is the `ordinal` field, unique per tenant, and there is no bulk
 * reorder endpoint — so this screen edits the ordinal explicitly rather than
 * offering a drag whose intermediate state would collide with the uniqueness
 * constraint and fail halfway.
 */
const LexChecks = () => {
  const { t } = useTranslation("lex");
  // Ungated while the LEX permission codes are unregistered — see useLexAccess.
  const { can } = useLexAccess();

  const canRead = can(LEX_PERMISSIONS.CHECK_READ);
  const canWrite = can(LEX_PERMISSIONS.CHECK_WRITE);

  const [checks, setChecks] = useState<LexCheck[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<LexCheck | null>(null);
  const [ordinal, setOrdinal] = useState(1);
  const [checkCode, setCheckCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [group, setGroup] = useState<string>(CHECK_GROUPS[0]);
  const [blocking, setBlocking] = useState(false);
  const [reasonCode, setReasonCode] = useState("");

  const errorsByCode = useMemo(
    () => ({
      "COMMON.AUTH.ACCESS_DENIED": t("err.accessDenied"),
      "COMMON.VALIDATION.FAILED": t("err.validation"),
      "LEX.DOCUMENT.CHECK_DUPLICATE_CODE": t("chk.err.duplicateCode"),
      "LEX.DOCUMENT.CHECK_DUPLICATE_ORDINAL": t("chk.err.duplicateOrdinal"),
      "LEX.DOCUMENT.CHECK_NOT_FOUND": t("chk.err.notFound"),
      "LEX.DOCUMENT.NO_SEQUENCE_CONFIGURED": t("chk.err.noSequence"),
    }),
    [t]
  );

  const load = async () => {
    if (!canRead) return;
    setIsLoading(true);
    try {
      const data = await getChecks();
      setChecks([...data].sort((a, b) => a.ordinal - b.ordinal));
    } catch (error) {
      logForbidden(error, "GET /documents/checks");
      toast.error(lexErrorMessage(error, t("chk.toast.loadFailed"), errorsByCode));
      setChecks([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Idempotent, so it is safe to offer even when the admin is unsure. */
  const onSeed = async () => {
    setBusy(true);
    try {
      // The response says which of the two happened, so a re-run that adds
      // nothing still reports something rather than looking like a no-op.
      const result = await seedChecks();
      const seeded = result.created ?? result.seeded ?? 0;
      toast.success(
        seeded > 0
          ? t("chk.toast.seeded", { seeded })
          : t("chk.toast.seedAlreadyPresent", { present: result.alreadyPresent ?? 0 })
      );
      load();
    } catch (error) {
      logForbidden(error, "POST /checks/seed");
      toast.error(lexErrorMessage(error, t("chk.toast.seedFailed"), errorsByCode));
    } finally {
      setBusy(false);
    }
  };

  const openForm = (check?: LexCheck) => {
    setEditing(check || null);
    setOrdinal(check?.ordinal ?? (checks.length ? Math.max(...checks.map((c) => c.ordinal)) + 1 : 1));
    setCheckCode(check?.checkCode || "");
    setDisplayName(check?.displayName || "");
    setGroup(String(check?.group || CHECK_GROUPS[0]));
    setBlocking(!!check?.blocking);
    setReasonCode(check?.reasonCode || "");
    setFormOpen(true);
  };

  const onSave = async () => {
    if (!checkCode.trim()) return toast.error(t("chk.valid.code"));
    if (!displayName.trim()) return toast.error(t("chk.valid.name"));
    // Required by the API and required here for a reason worth repeating: a
    // failure with no code reaches a human as an unexplained flag.
    if (!reasonCode.trim()) return toast.error(t("chk.valid.reasonCode"));

    setBusy(true);
    try {
      const body = {
        ordinal,
        checkCode: checkCode.trim().toUpperCase(),
        displayName: displayName.trim(),
        group,
        blocking,
        reasonCode: reasonCode.trim().toUpperCase(),
      };
      if (editing) await updateCheck(editing.id, body);
      else await createCheck({ ...body, active: true });
      toast.success(t("chk.toast.saved"));
      // A new check's reason code has to exist in the Agent Configurator, or a
      // failure routes to a Supervisor as unrecognized.
      if (!editing) toast(t("chk.toast.addReasonCode", { code: body.reasonCode }));
      setFormOpen(false);
      load();
    } catch (error) {
      logForbidden(error, "POST /documents/checks");
      toast.error(lexErrorMessage(error, t("chk.toast.saveFailed"), errorsByCode));
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (check: LexCheck, active: boolean) => {
    try {
      await setCheckActive(check.id, active);
      toast.success(active ? t("chk.toast.reactivated") : t("chk.toast.retired"));
      load();
    } catch (error) {
      toast.error(lexErrorMessage(error, t("chk.toast.saveFailed"), errorsByCode));
    }
  };

  if (!canRead) return <PermissionDenied />;

  return (
    <div className="service">
      <LexPageHeader icon={ListChecks} title={t("chk.title")} subtitle={t("chk.subtitle")} />

      <div className="pro-card p-3 mb-3">
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button variant="outline" className="gap-2" onClick={load} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            {t("common:refresh")}
          </Button>
          {canWrite && (
            <Button className="wallet-brand-btn gap-2" onClick={() => openForm()}>
              <Plus className="h-4 w-4" />
              {t("chk.new")}
            </Button>
          )}
        </div>
      </div>

      <div className="pro-card p-4">
        {!isLoading && checks.length === 0 ? (
          <div className="py-8">
            <EmptyState icon={ListChecks} text={t("chk.empty")} />
            {canWrite && (
              <div className="mt-3 flex justify-center">
                <Button variant="outline" className="gap-2" onClick={onSeed} disabled={busy}>
                  <Sparkles className="h-4 w-4" />
                  {t("chk.seed")}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <ol className="m-0 -mb-2 list-none p-0">
            {checks.map((check, index) => {
              // The runner stops here if this one fails, so the rung itself is
              // marked rather than the fact being stated in a banner up top.
              const halts = check.blocking && check.active;
              return (
                <li key={check.id} className="relative flex items-center gap-3">
                  {index > 0 && (
                    <span aria-hidden className="absolute start-3.5 top-0 h-1/2 w-px bg-border" />
                  )}
                  {index < checks.length - 1 && (
                    <span aria-hidden className="absolute start-3.5 top-1/2 bottom-0 w-px bg-border" />
                  )}
                  <span
                    className={cn(
                      "relative z-[1] flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                      !check.active
                        ? "bg-muted text-muted-foreground ring-1 ring-border"
                        : halts
                          ? "bg-amber-500 text-white"
                          : "bg-emerald-500 text-white"
                    )}
                  >
                    {check.ordinal}
                  </span>

                  <div
                    className={cn(
                      "pro-tile mb-2 flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-2",
                      !check.active && "opacity-60"
                    )}
                  >
                    <div className="min-w-0 flex-1 basis-48">
                      <p className="m-0 truncate text-sm font-medium text-foreground">
                        {check.displayName}
                      </p>
                      {/* Code and reason code on one line: stacked they read as
                          noise, paired they read as one identity. */}
                      <p className="m-0 truncate font-mono text-xs text-muted-foreground">
                        {check.checkCode}
                        {check.reasonCode ? " · " + check.reasonCode : ""}
                      </p>
                    </div>

                    <Badge
                      variant="outline"
                      className={`border font-medium ${GROUP_TONE[String(check.group)] || TONES.slate}`}
                    >
                      {check.group}
                    </Badge>

                    {check.blocking && (
                      <Badge
                        variant="outline"
                        className={`border gap-1 font-medium ${TONES.amber}`}
                        title={t("chk.blockingHint")}
                      >
                        <OctagonAlert className="h-3 w-3" />
                        {t("chk.blocking")}
                      </Badge>
                    )}

                    {canWrite && (
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={check.active}
                          onCheckedChange={(checked) => toggleActive(check, checked)}
                          aria-label={t("chk.retire")}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label={t("common:edit")}
                          onClick={() => openForm(check)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="pro-dialog sm:max-w-lg">
          <DialogHeader className="text-start">
            <DialogTitle>{editing ? t("chk.form.editTitle") : t("chk.form.newTitle")}</DialogTitle>
            <DialogDescription>{t("chk.form.explain")}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="chk-ordinal">{t("chk.field.ordinal")}</Label>
                <Input
                  id="chk-ordinal"
                  type="number"
                  className="h-10"
                  value={ordinal}
                  onChange={(e) => setOrdinal(Number(e.target.value))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="chk-code">{t("chk.field.code")}</Label>
                <Input
                  id="chk-code"
                  className="h-10 font-mono text-xs"
                  value={checkCode}
                  disabled={!!editing}
                  onChange={(e) => setCheckCode(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="chk-name">{t("chk.field.name")}</Label>
                <Input
                  id="chk-name"
                  className="h-10"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="chk-group">{t("chk.field.group")}</Label>
              <Select value={group} onValueChange={setGroup}>
                <SelectTrigger id="chk-group" className="w-full data-[size=default]:h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHECK_GROUPS.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="chk-reason">{t("chk.field.reasonCode")} *</Label>
              <Input
                id="chk-reason"
                className="h-10 font-mono text-xs"
                value={reasonCode}
                onChange={(e) => setReasonCode(e.target.value)}
              />
            </div>

            {/* The consequence of blocking, said where the toggle is. */}
            <div className="pro-tile flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Label htmlFor="chk-blocking">{t("chk.field.blocking")}</Label>
                <p className="m-0 mt-1 text-xs text-muted-foreground">{t("chk.field.blockingHint")}</p>
              </div>
              <Switch id="chk-blocking" checked={blocking} onCheckedChange={setBlocking} />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-end">
            <Button variant="ghost" onClick={() => setFormOpen(false)} disabled={busy}>
              {t("common:cancel")}
            </Button>
            <Button className="wallet-brand-btn" onClick={onSave} disabled={busy}>
              {t("common:save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LexChecks;
