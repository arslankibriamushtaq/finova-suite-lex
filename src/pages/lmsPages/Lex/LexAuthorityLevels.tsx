import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { AlertTriangle, ListOrdered, Pencil, Plus, RefreshCw } from "lucide-react";

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
import { EmptyState, PermissionDenied } from "../../../components/shared/detailKit";
import { LexNotice, LexPageHeader, LexStatusBadge } from "../../../components/shared/lexKit";
import { LEX_PERMISSIONS } from "../../../hooks/useProductPermissions";
import { useLexAccess } from "../../../hooks/useLexAccess";
import { lexErrorMessage, logForbidden } from "../../../redux/apis/apisLexCore";
import {
  createAuthorityLevel,
  getAuthorityLevels,
  setAuthorityLevelActive,
  updateAuthorityLevel,
  type LexAuthorityLevel,
} from "../../../redux/apis/apisLexConfig";

/**
 * Authority levels — a flat ordered list, and the escalation path.
 *
 * Escalation moves to the next-highest ordinal, so the ordinal *is* the path.
 * Levels are data, not an enum: L3 is a POST, not a release, which is why the
 * delegation band picker reads this endpoint instead of a constant.
 *
 * **No drag-to-reorder, deliberately.** Ordinals are unique per company and
 * there is no bulk reorder endpoint, so a drag would have to issue two PUTs
 * whose intermediate state collides with the uniqueness constraint and fails
 * halfway. The ordinal is an explicit field instead, and a collision comes back
 * as `DUPLICATE_ORDINAL` naming the level that already holds the position.
 *
 * `code` is identity and cannot change after creation — the field is disabled
 * on edit rather than allowed to fail on save.
 *
 * Deactivating does not delete: cases already assigned to a level keep their
 * assignment, and there is no delete endpoint at all.
 */
const LexAuthorityLevels = () => {
  const { t } = useTranslation("lex");
  // Ungated while the LEX permission codes are unregistered — see useLexAccess.
  const { can } = useLexAccess();

  const canRead = can(LEX_PERMISSIONS.LEVEL_READ);
  const canWrite = can(LEX_PERMISSIONS.LEVEL_WRITE);

  const [levels, setLevels] = useState<LexAuthorityLevel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<LexAuthorityLevel | null>(null);
  const [code, setCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [ordinal, setOrdinal] = useState(0);

  const errorsByCode = useMemo(
    () => ({
      "COMMON.AUTH.ACCESS_DENIED": t("err.accessDenied"),
      "COMMON.VALIDATION.FAILED": t("err.validation"),
      "LEX.AUTHORITY_LEVEL.DUPLICATE_CODE": t("lvl.err.duplicateCode"),
      "LEX.AUTHORITY_LEVEL.DUPLICATE_ORDINAL": t("lvl.err.duplicateOrdinal"),
      "LEX.AUTHORITY_LEVEL.NOT_FOUND": t("lvl.err.notFound"),
    }),
    [t]
  );

  const load = async () => {
    if (!canRead) return;
    setIsLoading(true);
    try {
      const data = await getAuthorityLevels();
      setLevels([...data].sort((a, b) => a.ordinal - b.ordinal));
    } catch (error) {
      logForbidden(error, "GET /levels");
      toast.error(lexErrorMessage(error, t("lvl.toast.loadFailed"), errorsByCode));
      setLevels([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleActive = async (level: LexAuthorityLevel, active: boolean) => {
    try {
      await setAuthorityLevelActive(level.id, active);
      toast.success(active ? t("lvl.toast.activated") : t("lvl.toast.deactivated"));
      load();
    } catch (error) {
      toast.error(lexErrorMessage(error, t("lvl.toast.saveFailed"), errorsByCode));
    }
  };

  const openForm = (level?: LexAuthorityLevel) => {
    setEditing(level || null);
    setCode(level?.code || "");
    setDisplayName(level?.displayName || "");
    setOrdinal(level?.ordinal ?? (levels.length ? Math.max(...levels.map((l) => l.ordinal)) + 1 : 0));
    setFormOpen(true);
  };

  const onSave = async () => {
    if (!code.trim()) return toast.error(t("lvl.valid.code"));
    if (!displayName.trim()) return toast.error(t("lvl.valid.name"));

    setBusy(true);
    try {
      if (editing) {
        // `code` is identity and is not sent — the server ignores it anyway.
        await updateAuthorityLevel(editing.id, { displayName: displayName.trim(), ordinal });
      } else {
        await createAuthorityLevel({
          code: code.trim().toUpperCase(),
          displayName: displayName.trim(),
          ordinal,
        });
      }
      toast.success(t("lvl.toast.saved"));
      setFormOpen(false);
      load();
    } catch (error) {
      logForbidden(error, "POST /levels");
      toast.error(lexErrorMessage(error, t("lvl.toast.saveFailed"), errorsByCode));
    } finally {
      setBusy(false);
    }
  };

  if (!canRead) return <PermissionDenied />;

  return (
    <div className="service">
      <LexPageHeader icon={ListOrdered} title={t("lvl.title")} subtitle={t("lvl.subtitle")}>
        <Button variant="outline" className="h-10 gap-2" onClick={load} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          {t("common:refresh")}
        </Button>
        {canWrite && (
          <Button className="wallet-brand-btn h-10 gap-2" onClick={() => openForm()}>
            <Plus className="h-4 w-4" />
            {t("lvl.new")}
          </Button>
        )}
      </LexPageHeader>

      <LexNotice tone="slate">{t("lvl.escalationNote")}</LexNotice>

      {/* Adding a rung does not retro-fit anything: published matrices keep
          their old rows, and each needs cloning and re-publishing before the
          new level can approve anything. Said here, at the point of adding. */}
      <LexNotice tone="amber" icon={AlertTriangle}>
        {t("lvl.addLevelWarning")}
      </LexNotice>

      <div className="pro-card p-3">
        {!isLoading && levels.length === 0 ? (
          <EmptyState icon={ListOrdered} text={t("lvl.empty")} />
        ) : (
          <ol className="m-0 list-none p-0">
            {levels.map((level) => (
              <li
                key={level.id}
                className="flex flex-wrap items-center gap-3 border-b border-border/60 py-3 last:border-b-0"
              >
                <span className="w-8 shrink-0 text-center text-sm font-semibold text-muted-foreground">
                  {level.ordinal}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="m-0 text-sm font-medium text-foreground">{level.displayName}</p>
                  <p className="m-0 font-mono text-xs text-muted-foreground">{level.code}</p>
                </div>
                <LexStatusBadge status={level.active ? "ACTIVE" : "INACTIVE"} />
                {canWrite && (
                  <>
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`lvl-${level.id}`} className="text-xs text-muted-foreground">
                        {t("lvl.active")}
                      </Label>
                      <Switch
                        id={`lvl-${level.id}`}
                        checked={level.active}
                        onCheckedChange={(checked) => toggleActive(level, checked)}
                      />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => openForm(level)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="pro-dialog sm:max-w-md">
          <DialogHeader className="text-start">
            <DialogTitle>{editing ? t("lvl.form.editTitle") : t("lvl.form.newTitle")}</DialogTitle>
            <DialogDescription>{t("lvl.form.explain")}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lvl-code">{t("lvl.field.code")}</Label>
              <Input
                id="lvl-code"
                className="h-10 font-mono text-xs"
                value={code}
                disabled={!!editing}
                onChange={(e) => setCode(e.target.value)}
              />
              <p className="m-0 text-xs text-muted-foreground">
                {editing ? t("lvl.field.codeLocked") : t("lvl.field.codeHint")}
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lvl-ordinal">{t("lvl.field.ordinal")}</Label>
              <Input
                id="lvl-ordinal"
                type="number"
                className="h-10"
                value={ordinal}
                onChange={(e) => setOrdinal(Number(e.target.value))}
              />
              <p className="m-0 text-xs text-muted-foreground">{t("lvl.field.ordinalHint")}</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lvl-name">{t("lvl.field.name")}</Label>
              <Input
                id="lvl-name"
                className="h-10"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <p className="m-0 text-xs text-muted-foreground">{t("lvl.form.deactivateHint")}</p>
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

export default LexAuthorityLevels;
