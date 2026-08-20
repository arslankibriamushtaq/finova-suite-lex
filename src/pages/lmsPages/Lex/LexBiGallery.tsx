import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { BarChart3, Ban, Plus, RefreshCw, Share2, Trash2, Users } from "lucide-react";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
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
import { LexPageHeader } from "../../../components/shared/lexKit";
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

  const onDelete = async (report: LexSavedReport) => {
    setBusy(true);
    try {
      await deleteSavedReport(report.id);
      toast.success(t("bi.toast.deleted"));
      load();
    } catch (error) {
      toast.error(lexErrorMessage(error, t("bi.toast.deleteFailed"), errorsByCode));
    } finally {
      setBusy(false);
    }
  };

  if (!canRead) return <PermissionDenied />;

  return (
    <div className="service">
      <LexPageHeader icon={BarChart3} title={t("bi.title")} subtitle={t("bi.subtitle")}>
        <Button variant="outline" className="h-10 gap-2" onClick={load} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          {t("common:refresh")}
        </Button>
        {canWrite && (
          <Button
            className="wallet-brand-btn h-10 gap-2"
            onClick={() => navigate("/LOS/Lex/Bi/Builder")}
          >
            <Plus className="h-4 w-4" />
            {t("bi.build")}
          </Button>
        )}
      </LexPageHeader>

      <Tabs defaultValue="standard">
        <TabsList>
          <TabsTrigger value="standard">{t("bi.tab.standard")}</TabsTrigger>
          <TabsTrigger value="mine">{t("bi.tab.mine")}</TabsTrigger>
        </TabsList>

        <TabsContent value="standard" className="pt-3">
          {/* No edit affordance anywhere on a gallery card: the standard set
              stays consistent so everyone reads the same baseline numbers, and
              a variation is built as a custom report instead. */}
          <p className="mb-3 text-xs text-muted-foreground">{t("bi.standardFixedNote")}</p>
          {groups.length === 0 && !isLoading ? (
            <div className="pro-card">
              <EmptyState icon={BarChart3} text={t("bi.emptyGallery")} />
            </div>
          ) : (
            groups.map(([group, groupCards]) => (
              <div key={group} className="mb-4">
                <h4 className="mb-2 text-sm font-semibold tracking-tight text-foreground">{group}</h4>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {groupCards.map((card) => (
                    <div
                      key={card.key}
                      className={`pro-card p-4 ${
                        card.available ? "cursor-pointer" : "opacity-60"
                      }`}
                      onClick={() =>
                        card.available && navigate(`/LOS/Lex/Bi/Standard/${card.key}`)
                      }
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <p className="m-0 text-sm font-semibold text-foreground">{card.title}</p>
                        {!card.available && (
                          <Badge variant="outline" className={`border gap-1 font-medium ${TONES.slate}`}>
                            <Ban className="h-3 w-3" />
                            {t("bi.unavailable")}
                          </Badge>
                        )}
                      </div>

                      {card.available ? (
                        <>
                          {card.summaryValue !== undefined && (
                            <p className="m-0 text-2xl font-semibold text-foreground">
                              {String(card.summaryValue)}
                            </p>
                          )}
                          <p className="m-0 text-xs text-muted-foreground">{card.summaryLabel}</p>
                        </>
                      ) : (
                        // The reason is the card body — that is the whole point
                        // of not hiding it.
                        <p className="m-0 text-xs text-muted-foreground">{card.unavailableReason}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="mine" className="pt-3">
          {reports.length === 0 && !isLoading ? (
            <div className="pro-card">
              <EmptyState icon={BarChart3} text={t("bi.emptyMine")} />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {reports.map((report) => (
                <div key={report.id} className="pro-card p-4">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <p
                      className="m-0 cursor-pointer text-sm font-semibold text-foreground"
                      onClick={() => navigate(`/LOS/Lex/Bi/Report/${report.id}`)}
                    >
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
                    {report.measure} · {report.dimension} · {report.visualization}
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
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          title={t("bi.share")}
                          onClick={() => openSharing(report)}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title={t("common:delete")}
                          disabled={busy}
                          onClick={() => onDelete(report)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

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
