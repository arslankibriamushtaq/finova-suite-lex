import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Layers, PackagePlus, Pencil, RefreshCw } from "lucide-react";

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
import { EmptyState, PermissionDenied } from "../../../components/shared/detailKit";
import { TONES } from "../../../components/shared/detailKitUtils";
import { LexNotice, LexPageHeader } from "../../../components/shared/lexKit";
import { LEX_PERMISSIONS } from "../../../hooks/useProductPermissions";
import { useLexAccess } from "../../../hooks/useLexAccess";
import { lexErrorMessage, logForbidden } from "../../../redux/apis/apisLexCore";
import {
  bootstrapSectors,
  createSector,
  getSectors,
  normalizeSectorCode,
  setSectorActive,
  updateSector,
  type LexSector,
} from "../../../redux/apis/apisLexConfig";

/**
 * The sector list — the other half of every scope in LEX.
 *
 * **Product comes from LOS; sector is governed here.** Like the authority
 * ladder, the list is data and not an enum: a company that needs a seventh
 * segment adds a row rather than waiting for a release, so nothing anywhere in
 * the UI may hardcode a sector.
 *
 * Two things this screen does not do:
 *
 * - **No "All Sectors" row.** That is the wildcard — `sectorId: null` — and the
 *   scope pickers add it themselves. Listing it here would invite someone to
 *   send its id, naming a sector that does not exist.
 * - **No delete.** Deactivating removes a sector from new configuration without
 *   breaking the published scopes that already name it, and there is no delete
 *   endpoint to call.
 */
const LexSectors = () => {
  const { t } = useTranslation("lex");
  const { can } = useLexAccess();

  const canRead = can(LEX_PERMISSIONS.SECTOR_READ);
  const canWrite = can(LEX_PERMISSIONS.SECTOR_WRITE);

  const [sectors, setSectors] = useState<LexSector[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<LexSector | null>(null);
  const [code, setCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [displayNameAr, setDisplayNameAr] = useState("");
  const [ordinal, setOrdinal] = useState("1");

  const errorsByCode = useMemo(
    () => ({
      "COMMON.AUTH.ACCESS_DENIED": t("err.accessDenied"),
      "LEX.SECTOR.DUPLICATE_CODE": t("sector.err.duplicateCode"),
      "LEX.SECTOR.NOT_FOUND": t("sector.err.notFound"),
    }),
    [t]
  );

  const load = async () => {
    if (!canRead) return;
    setIsLoading(true);
    try {
      // Deactivated sectors are shown too: they still appear in published
      // scopes, and hiding them here makes those scopes unexplainable.
      setSectors(await getSectors());
    } catch (error) {
      logForbidden(error, "GET /config/sectors");
      toast.error(lexErrorMessage(error, t("sector.toast.loadFailed"), errorsByCode));
      setSectors([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canRead]);

  const openCreate = () => {
    setEditing(null);
    setCode("");
    setDisplayName("");
    setDisplayNameAr("");
    setOrdinal(String((sectors[sectors.length - 1]?.ordinal ?? 0) + 1));
    setEditorOpen(true);
  };

  const openEdit = (sector: LexSector) => {
    setEditing(sector);
    setCode(sector.code);
    setDisplayName(sector.displayName);
    setDisplayNameAr(sector.displayNameAr || "");
    setOrdinal(String(sector.ordinal));
    setEditorOpen(true);
  };

  const onSave = async () => {
    if (!displayName.trim()) return toast.error(t("sector.valid.displayName"));
    if (!editing && !code.trim()) return toast.error(t("sector.valid.code"));

    setBusy(true);
    try {
      if (editing) {
        // `code` is identity and is deliberately not sent.
        await updateSector(editing.id, {
          displayName: displayName.trim(),
          displayNameAr: displayNameAr.trim() || undefined,
          ordinal: Number(ordinal),
        });
      } else {
        await createSector({
          code: normalizeSectorCode(code),
          displayName: displayName.trim(),
          displayNameAr: displayNameAr.trim() || undefined,
          ordinal: Number(ordinal),
        });
      }
      toast.success(t("sector.toast.saved"));
      setEditorOpen(false);
      load();
    } catch (error) {
      logForbidden(error, "POST/PUT /config/sectors");
      toast.error(lexErrorMessage(error, t("sector.toast.saveFailed"), errorsByCode));
    } finally {
      setBusy(false);
    }
  };

  const onToggleActive = async (sector: LexSector) => {
    setBusy(true);
    try {
      await setSectorActive(sector.id, !sector.active);
      toast.success(t(sector.active ? "sector.toast.deactivated" : "sector.toast.activated"));
      load();
    } catch (error) {
      logForbidden(error, "PUT /config/sectors/{id}");
      toast.error(lexErrorMessage(error, t("sector.toast.saveFailed"), errorsByCode));
    } finally {
      setBusy(false);
    }
  };

  const onBootstrap = async () => {
    setBusy(true);
    try {
      const result = await bootstrapSectors();
      // Report what was skipped as well as what was created — otherwise a
      // safe re-run looks like it did nothing at all.
      toast.success(
        t("sector.toast.bootstrapped", {
          created: result.created ?? 0,
          skipped: result.skippedExisting ?? 0,
        })
      );
      load();
    } catch (error) {
      logForbidden(error, "POST /config/sectors/bootstrap");
      toast.error(lexErrorMessage(error, t("sector.toast.bootstrapFailed"), errorsByCode));
    } finally {
      setBusy(false);
    }
  };

  if (!canRead) return <PermissionDenied />;

  return (
    <div className="service">
      <LexPageHeader icon={Layers} title={t("sector.title")} subtitle={t("sector.subtitle")}>
        <Button variant="outline" className="h-10 gap-2" onClick={load} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          {t("common:refresh")}
        </Button>
        {canWrite && sectors.length > 0 && (
          <Button className="wallet-brand-btn h-10 gap-2" onClick={openCreate} disabled={busy}>
            <PackagePlus className="h-4 w-4" />
            {t("sector.add")}
          </Button>
        )}
      </LexPageHeader>

      {/* "All Sectors" is the wildcard, not a row. Said here because the first
          thing an admin looks for in this list is the option they see in the
          scope pickers. */}
      <LexNotice tone="sky">{t("sector.wildcardNote")}</LexNotice>

      {!isLoading && sectors.length === 0 ? (
        <div className="pro-card">
          <EmptyState icon={Layers} text={t("sector.empty")} />
          {canWrite && (
            <div className="flex flex-col items-center gap-2 pb-4">
              <p className="m-0 max-w-lg text-center text-xs text-muted-foreground">
                {t("sector.bootstrapExplain")}
              </p>
              <Button className="wallet-brand-btn gap-2" onClick={onBootstrap} disabled={busy}>
                <PackagePlus className="h-4 w-4" />
                {t("sector.bootstrap")}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="pro-card overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border">
                {["sector.col.ordinal", "sector.col.code", "sector.col.name", "sector.col.nameAr", "sector.col.active"].map(
                  (key) => (
                    <th
                      key={key}
                      className="px-3 py-2 text-start text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
                    >
                      {t(key)}
                    </th>
                  )
                )}
                <th className="px-3 py-2 text-start text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("common:actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {sectors.map((sector) => (
                <tr key={sector.id} className="border-b border-border/60 last:border-b-0">
                  <td className="px-3 py-2.5">{sector.ordinal}</td>
                  <td className="px-3 py-2.5 font-mono text-xs">{sector.code}</td>
                  <td className="px-3 py-2.5">{sector.displayName}</td>
                  <td className="px-3 py-2.5" dir="rtl">
                    {sector.displayNameAr || "—"}
                  </td>
                  <td className="px-3 py-2.5">
                    <Badge
                      variant="outline"
                      className={`border font-medium ${sector.active ? TONES.emerald : TONES.slate}`}
                    >
                      {t(sector.active ? "sector.active" : "sector.inactive")}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5">
                    {canWrite && (
                      <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => openEdit(sector)}>
                          <Pencil className="h-3.5 w-3.5" />
                          {t("common:edit")}
                        </Button>
                        {/* Deactivate, never delete — published scopes still
                            name this sector and must stay explainable. */}
                        <Switch
                          checked={sector.active}
                          disabled={busy}
                          onCheckedChange={() => onToggleActive(sector)}
                          aria-label={t("sector.col.active")}
                        />
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="pro-dialog sm:max-w-lg">
          <DialogHeader className="text-start">
            <DialogTitle>{t(editing ? "sector.editTitle" : "sector.addTitle")}</DialogTitle>
            <DialogDescription>{t("sector.editExplain")}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sector-code">{t("sector.col.code")}</Label>
              {/* Identity: disabled on edit rather than letting the save fail,
                  and the normalisation is shown as it is typed so the stored
                  value is not a surprise. */}
              <Input
                id="sector-code"
                className="h-10 font-mono"
                value={editing ? code : normalizeSectorCode(code)}
                disabled={!!editing}
                onChange={(e) => setCode(e.target.value)}
              />
              <p className="m-0 text-xs text-muted-foreground">
                {t(editing ? "sector.field.codeLocked" : "sector.field.codeHint")}
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sector-name">{t("sector.col.name")}</Label>
              <Input
                id="sector-name"
                className="h-10"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sector-name-ar">{t("sector.col.nameAr")}</Label>
              <Input
                id="sector-name-ar"
                className="h-10"
                dir="rtl"
                value={displayNameAr}
                onChange={(e) => setDisplayNameAr(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sector-ordinal">{t("sector.col.ordinal")}</Label>
              <Input
                id="sector-ordinal"
                type="number"
                min={0}
                className="h-10"
                value={ordinal}
                onChange={(e) => setOrdinal(e.target.value)}
              />
              <p className="m-0 text-xs text-muted-foreground">{t("sector.field.ordinalHint")}</p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-end">
            <Button variant="ghost" onClick={() => setEditorOpen(false)} disabled={busy}>
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

export default LexSectors;
