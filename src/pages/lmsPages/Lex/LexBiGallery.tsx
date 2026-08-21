import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Ban,
  BarChart3,
  ChevronDown,
  Plus,
  RefreshCw,
  Share2,
  Trash2,
  Users,
} from "lucide-react";

import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Tabs, TabsContent } from "../../../components/ui/tabs";
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
import {
  DetailTabsList,
  DetailTabsTrigger,
  EmptyState,
  PermissionDenied,
} from "../../../components/shared/detailKit";
import { humanizeCode, TONES } from "../../../components/shared/detailKitUtils";
import { LexPageHeader, LexSearch } from "../../../components/shared/lexKit";
import { LEX_PERMISSIONS } from "../../../hooks/useProductPermissions";
import { useLexAccess } from "../../../hooks/useLexAccess";
import { lexErrorMessage, logForbidden } from "../../../redux/apis/apisLexCore";
import {
  deleteSavedReport,
  getGallery,
  getSavedReports,
  updateReportSharing,
  type LexGalleryCard,
  type LexSavedReport,
} from "../../../redux/apis/apisLexBi";

/**
 * The BI landing: Standard Reports and My Reports.
 *
 * Unavailable gallery cards are **rendered, muted, with their reason as the
 * body**. Two of the ten have no projection yet, and a gallery silently missing
 * two of ten reads as a bug — whereas a card that says what it is waiting for
 * is information an admin can act on.
 */
const SELECT_TRIGGER_CLS =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-foreground/30 bg-foreground px-4 py-2 text-sm font-medium text-background shadow-sm transition-colors hover:bg-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60";

const LexBiGallery = () => {
  const { t } = useTranslation("lex");
  const navigate = useNavigate();
  // Ungated while the LEX permission codes are unregistered — see useLexAccess.
  const { can } = useLexAccess();

  const canRead = can(LEX_PERMISSIONS.BI_READ);
  const canWrite = can(LEX_PERMISSIONS.BI_WRITE);

  const [cards, setCards] = useState<LexGalleryCard[]>([]);
  const [reports, setReports] = useState<LexSavedReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [pendingDelete, setPendingDelete] = useState<LexSavedReport | null>(null);
  const [busy, setBusy] = useState(false);

  const [sharing, setSharing] = useState<LexSavedReport | null>(null);
  const [visibility, setVisibility] = useState("PERSONAL");
  const [sharedWith, setSharedWith] = useState("");

  const errorsByCode = useMemo(
    () => ({
      "COMMON.AUTH.ACCESS_DENIED": t("err.accessDenied"),
      "LEX.BI.REPORT_NOT_VISIBLE": t("bi.err.notVisible"),
      "LEX.BI.REPORT_UNAVAILABLE": t("bi.err.unavailable"),
      "LEX.BI.REPORT_NAME_TAKEN": t("bi.err.nameTaken"),
    }),
    [t]
  );

  const load = async () => {
    if (!canRead) return;
    setIsLoading(true);
    try {
      const [gallery, saved] = await Promise.all([getGallery(), getSavedReports({ size: 50 })]);
      setCards(gallery);
      setReports(saved.content || []);
    } catch (error) {
      logForbidden(error, "GET /bi/gallery");
      toast.error(lexErrorMessage(error, t("bi.toast.loadFailed"), errorsByCode));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const groups = useMemo(() => {
    const map = new Map<string, LexGalleryCard[]>();
    cards.forEach((card) => {
      const list = map.get(card.group) || [];
      list.push(card);
      map.set(card.group, list);
    });
    return Array.from(map.entries());
  }, [cards]);

  const openSharing = (report: LexSavedReport) => {
    setSharing(report);
    setVisibility(report.visibility || "PERSONAL");
    setSharedWith((report.sharedWith || []).join(", "));
  };

  const onSaveSharing = async () => {
    if (!sharing) return;
    const roles = sharedWith
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean);
    if (visibility === "SHARED" && roles.length === 0) return toast.error(t("bi.valid.sharedWith"));

    setBusy(true);
    try {
      await updateReportSharing(sharing.id, { visibility, sharedWith: roles });
      toast.success(t("bi.toast.sharingSaved"));
      setSharing(null);
      load();
    } catch (error) {
      toast.error(lexErrorMessage(error, t("bi.toast.sharingFailed"), errorsByCode));
    } finally {
      setBusy(false);
    }
  };

  // Irreversible and unrecoverable, so it is confirmed rather than fired on
  // a single click of an unlabelled glyph.
  const onDelete = async (report: LexSavedReport) => {
    setBusy(true);
    try {
      await deleteSavedReport(report.id);
      toast.success(t("bi.toast.deleted"));
      setPendingDelete(null);
      load();
    } catch (error) {
      toast.error(lexErrorMessage(error, t("bi.toast.deleteFailed"), errorsByCode));
    } finally {
      setBusy(false);
    }
  };

  // Both lists arrive whole, so this filters the entire gallery rather than
  // a page of it.
  const needle = search.trim().toLowerCase();
  const match = (...parts: (string | undefined | null)[]) =>
    !needle || parts.filter(Boolean).some((v) => String(v).toLowerCase().includes(needle));

  if (!canRead) return <PermissionDenied />;

  return (
    <div className="service">
      <LexPageHeader icon={BarChart3} title={t("bi.title")} subtitle={t("bi.subtitle")} />

      <div className="pro-card p-3 mb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <LexSearch
            id="bi-search"
            className="flex-1"
            value={search}
            onChange={setSearch}
            placeholder={t("bi.search")}
          />
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button variant="outline" className="gap-2" onClick={load} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              {t("common:refresh")}
            </Button>
            {canWrite && (
              <Button
                className="wallet-brand-btn gap-2"
                onClick={() => navigate("/LOS/Lex/Bi/Builder")}
              >
                <Plus className="h-4 w-4" />
                {t("bi.build")}
              </Button>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="standard">
        <DetailTabsList>
          <DetailTabsTrigger value="standard">{t("bi.tab.standard")}</DetailTabsTrigger>
          <DetailTabsTrigger value="mine">{t("bi.tab.mine")}</DetailTabsTrigger>
        </DetailTabsList>

        <TabsContent value="standard" className="pt-3">

          {groups.length === 0 && !isLoading ? (
            <div className="pro-card">
              <EmptyState icon={BarChart3} text={t("bi.emptyGallery")} />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {groups.flatMap(([group, groupCards]) =>
                groupCards
                  .filter((card) => match(card.title, card.summaryLabel, group))
                  .map((card) => (
                    <div
                      key={card.key}
                      // A clickable div is unreachable by keyboard; as a
                      // button it is tabbable and responds to Enter/Space.
                      role={card.available ? "button" : undefined}
                      tabIndex={card.available ? 0 : undefined}
                      className={`pro-card flex flex-col gap-2 p-4 ${
                        card.available
                          ? "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          : "opacity-60"
                      }`}
                      onClick={() =>
                        card.available && navigate(`/LOS/Lex/Bi/Standard/${card.key}`)
                      }
                      onKeyDown={(e) => {
                        if (!card.available) return;
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          navigate(`/LOS/Lex/Bi/Standard/${card.key}`);
                        }
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="pro-tile__label">{humanizeCode(group)}</span>
                          <p className="m-0 mt-0.5 text-sm font-semibold text-foreground">
                            {card.title}
                          </p>
                        </div>
                        {!card.available && (
                          <Badge
                            variant="outline"
                            className={`border shrink-0 gap-1 font-medium ${TONES.slate}`}
                          >
                            <Ban className="h-3 w-3" />
                            {t("bi.unavailable")}
                          </Badge>
                        )}
                      </div>

                      {card.available ? (
                        <div className="mt-auto">
                          {card.summaryValue !== undefined && (
                            <p className="m-0 text-xl font-bold tabular-nums text-foreground">
                              {String(card.summaryValue)}
                            </p>
                          )}
                          <p className="m-0 text-xs text-muted-foreground">{card.summaryLabel}</p>
                        </div>
                      ) : (
                        // The reason is the card body — that is the whole point
                        // of not hiding it.
                        <p className="m-0 mt-auto text-xs text-muted-foreground">
                          {card.unavailableReason}
                        </p>
                      )}
                    </div>
                  ))
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="mine" className="pt-3">
          {reports.length === 0 && !isLoading ? (
            <div className="pro-card">
              <EmptyState icon={BarChart3} text={t("bi.emptyMine")} />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {reports
                .filter((report) => match(report.name, report.measure, report.dimension))
                .map((report) => (
                <div key={report.id} className="pro-card p-4">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <p className="m-0 min-w-0 truncate text-sm font-semibold text-foreground">
                      {report.name}
                    </p>
                    {report.visibility === "SHARED" && (
                      <Badge variant="outline" className={`border gap-1 font-medium ${TONES.sky}`}>
                        <Users className="h-3 w-3" />
                        {t("bi.shared")}
                      </Badge>
                    )}
                  </div>
                  <p className="m-0 text-xs text-muted-foreground">
                    {[report.measure, report.dimension, report.visualization]
                      .filter(Boolean)
                      .map((v) => humanizeCode(String(v)))
                      .join(" · ")}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/LOS/Lex/Bi/Report/${report.id}`)}
                    >
                      {t("bi.run")}
                    </Button>
                    {/* Sharing grants reading, not editing — only the author
                        gets reshare and delete. */}
                    {report.isAuthor !== false && canWrite && (
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
                              openSharing(report);
                            }}
                          >
                            <Share2 className="h-4 w-4" />
                            {t("bi.share")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={(e) => {
                              e.preventDefault();
                              setPendingDelete(report);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                            {t("common:delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <DialogContent className="pro-dialog confirm-dialog sm:max-w-md">
          <DialogHeader className="text-start">
            <DialogTitle>{t("bi.deleteConfirm.title")}</DialogTitle>
            <DialogDescription>
              {t("bi.deleteConfirm.body", { name: pendingDelete?.name })}
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

      <Dialog open={!!sharing} onOpenChange={(open) => !open && setSharing(null)}>
        <DialogContent className="pro-dialog sm:max-w-md">
          <DialogHeader className="text-start">
            <DialogTitle>{t("bi.shareTitle", { name: sharing?.name })}</DialogTitle>
            <DialogDescription>{t("bi.shareExplain")}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>{t("bi.field.visibility")}</Label>
              <Select value={visibility} onValueChange={setVisibility}>
                <SelectTrigger className="w-full data-[size=default]:h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERSONAL">PERSONAL</SelectItem>
                  <SelectItem value="SHARED">SHARED</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {visibility === "SHARED" && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="bi-shared">{t("bi.field.sharedWith")}</Label>
                <Input
                  id="bi-shared"
                  className="h-10"
                  placeholder={t("bi.field.sharedWithPlaceholder")}
                  value={sharedWith}
                  onChange={(e) => setSharedWith(e.target.value)}
                />
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:justify-end">
            <Button variant="ghost" onClick={() => setSharing(null)} disabled={busy}>
              {t("common:cancel")}
            </Button>
            <Button className="wallet-brand-btn" onClick={onSaveSharing} disabled={busy}>
              {t("common:save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LexBiGallery;
