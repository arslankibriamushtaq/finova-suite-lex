import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  ChevronDown,
  Layers,
  PackagePlus,
  Pencil,
  RefreshCw,
} from "lucide-react";

import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Switch } from "../../../components/ui/switch";
import TableView from "../../../components/TableView/TableView";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
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
import { LexNotice, LexPageHeader, LexSearch } from "../../../components/shared/lexKit";
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
const SELECT_TRIGGER_CLS =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-foreground/30 bg-foreground px-4 py-2 text-sm font-medium text-background shadow-sm transition-colors hover:bg-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60";

const LexSectors = () => {
  const { t } = useTranslation("lex");
  const { can } = useLexAccess();

  const canRead = can(LEX_PERMISSIONS.SECTOR_READ);
  const canWrite = can(LEX_PERMISSIONS.SECTOR_WRITE);

  const [sectors, setSectors] = useState<LexSector[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  const headers = [
    {
      name: t("sector.col.ordinal"),
      cell: (row: LexSector) => <span>{row.ordinal}</span>,
      width: "100px",
    },
    {
      name: t("sector.col.code"),
      cell: (row: LexSector) => <span className="font-mono text-xs">{row.code}</span>,
      width: "180px",
    },
    {
      name: t("sector.col.name"),
      cell: (row: LexSector) => <span>{row.displayName}</span>,
    },
    {
      name: t("sector.col.nameAr"),
      // Arabic regardless of the interface language: it is the Arabic name,
      // not a translation of the row.
      cell: (row: LexSector) => <span dir="rtl">{row.displayNameAr || "—"}</span>,
      width: "200px",
    },
    {
      // The switch is both the state and the control. A badge beside it would
      // say the same thing twice.
      name: t("sector.col.active"),
      cell: (row: LexSector) =>
        canWrite ? (
          <Switch
            checked={row.active}
            disabled={busy}
            onCheckedChange={() => onToggleActive(row)}
            aria-label={t("sector.col.active")}
          />
        ) : (
          <Badge
            variant="outline"
            className={`border font-medium ${row.active ? TONES.emerald : TONES.slate}`}
          >
            {t(row.active ? "sector.active" : "sector.inactive")}
          </Badge>
        ),
      width: "120px",
    },
    ...(canWrite
      ? [
          {
            name: t("common:actions"),
            // Stops the row's own click handling from firing as the menu opens.
            cell: (row: LexSector) => (
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
                        openEdit(row);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                      {t("common:edit")}
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

  // Every sector arrives in one response, so this narrows the whole list.
  const needle = search.trim().toLowerCase();
  const filtered = needle
    ? sectors.filter((row) =>
        [row.code, row.displayName, row.displayNameAr]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(needle))
      )
    : sectors;

  const totalRows = filtered.length;
  const from = totalRows === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalRows);
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  return (
    <div className="service">
      <LexPageHeader icon={Layers} title={t("sector.title")} subtitle={t("sector.subtitle")} />

      <div className="pro-card p-3 mb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <LexSearch
            id="sector-search"
            className="flex-1"
            value={search}
            onChange={(next) => {
              setSearch(next);
              setPage(1);
            }}
            placeholder={t("sector.search")}
          />
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button variant="outline" className="gap-2" onClick={load} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              {t("common:refresh")}
            </Button>
            {canWrite && sectors.length > 0 && (
              <Button className="wallet-brand-btn gap-2" onClick={openCreate} disabled={busy}>
                <PackagePlus className="h-4 w-4" />
                {t("sector.add")}
              </Button>
            )}
          </div>
        </div>
      </div>

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
