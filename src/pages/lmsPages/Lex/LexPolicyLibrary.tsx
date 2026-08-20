import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  Archive,
  BookOpen,
  ChevronDown,
  FilePlus2,
  History,
  Pencil,
  RefreshCw,
  Upload,
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
import { Textarea } from "../../../components/ui/textarea";
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
  LexVersionTimeline,
} from "../../../components/shared/lexKit";
import { LEX_PERMISSIONS } from "../../../hooks/useProductPermissions";
import { useLexAccess } from "../../../hooks/useLexAccess";
import { emptyPage, lexErrorCode, lexErrorMessage, logForbidden, type LexPage } from "../../../redux/apis/apisLexCore";
import {
  DOCUMENT_CATEGORIES,
  getPolicyDocument,
  getPolicyDocuments,
  getPolicyVersions,
  normalizeDocumentKey,
  retirePolicyDocument,
  revisePolicyDocument,
  searchPolicyDocuments,
  uploadPolicyDocument,
  type LexPolicyDocument,
} from "../../../redux/apis/apisLexKnowledge";

/**
 * The policy library.
 *
 * Three rules the API enforces and this screen states rather than discovers:
 *
 * - the document key is the identity across versions and is normalized
 *   server-side, so the normalized value is shown as the user types;
 * - a revision is a new version and the old text survives as SUPERSEDED;
 * - retire is not delete. The policy stops being cited going forward and stays
 *   readable backwards, and afterwards the read endpoint answers 422
 *   NO_LIVE_VERSION rather than 404.
 */
const SELECT_TRIGGER_CLS =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-foreground/30 bg-foreground px-4 py-2 text-sm font-medium text-background shadow-sm transition-colors hover:bg-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60";

const LexPolicyLibrary = () => {
  const { t } = useTranslation("lex");
  // Ungated while the LEX permission codes are unregistered — see useLexAccess.
  const { can } = useLexAccess();

  const canRead = can(LEX_PERMISSIONS.KNOWLEDGE_DOC_READ);
  const canWrite = can(LEX_PERMISSIONS.KNOWLEDGE_DOC_WRITE);
  const canRetire = can(LEX_PERMISSIONS.KNOWLEDGE_DOC_RETIRE);

  const [result, setResult] = useState<LexPage<LexPolicyDocument>>(emptyPage<LexPolicyDocument>());
  const [isLoading, setIsLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [category, setCategory] = useState("ALL");

  const [query, setQuery] = useState("");
  const [searchHits, setSearchHits] = useState<LexPolicyDocument[] | null>(null);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [documentKey, setDocumentKey] = useState("");
  const [title, setTitle] = useState("");
  const [uploadCategory, setUploadCategory] = useState<string>(DOCUMENT_CATEGORIES[1]);
  const [parsedContent, setParsedContent] = useState("");

  const [reviseOpen, setReviseOpen] = useState(false);
  const [reviseTarget, setReviseTarget] = useState<LexPolicyDocument | null>(null);
  const [revisionNote, setRevisionNote] = useState("");

  const [versionsOpen, setVersionsOpen] = useState(false);
  const [versions, setVersions] = useState<LexPolicyDocument[]>([]);
  const [viewing, setViewing] = useState<LexPolicyDocument | null>(null);
  /** Set when the current document has been retired — 422, not 404. */
  const [noLiveVersion, setNoLiveVersion] = useState<string | null>(null);

  const [retireOpen, setRetireOpen] = useState(false);
  const [retireTarget, setRetireTarget] = useState<LexPolicyDocument | null>(null);
  const [retireReason, setRetireReason] = useState("");

  const errorsByCode = useMemo(
    () => ({
      "COMMON.AUTH.ACCESS_DENIED": t("err.accessDenied"),
      "COMMON.VALIDATION.FAILED": t("err.validation"),
      "LEX.KNOWLEDGE.NO_LIVE_VERSION": t("kb.err.noLiveVersion"),
      "LEX.KNOWLEDGE.DOCUMENT_KEY_TAKEN": t("kb.err.keyTaken"),
    }),
    [t]
  );

  const load = async () => {
    if (!canRead) return;
    setIsLoading(true);
    try {
      setResult(
        await getPolicyDocuments({
          page,
          size: pageSize,
          category: category === "ALL" ? undefined : category,
        })
      );
    } catch (error) {
      logForbidden(error, "GET /knowledge/documents");
      toast.error(lexErrorMessage(error, t("kb.toast.loadFailed"), errorsByCode));
      setResult(emptyPage<LexPolicyDocument>(pageSize));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, category]);

  // Search hits live versions only — the UI says so, so a user who cannot find
  // a retired policy understands why rather than assuming it was deleted.
  useEffect(() => {
    if (!query) return setSearchHits(null);
    searchPolicyDocuments(query, 20)
      .then(setSearchHits)
      .catch(() => setSearchHits([]));
  }, [query]);

  const normalizedKey = normalizeDocumentKey(documentKey);

  const onUpload = async () => {
    if (!normalizedKey) return toast.error(t("kb.valid.key"));
    if (!title.trim()) return toast.error(t("kb.valid.title"));
    if (!parsedContent.trim()) return toast.error(t("kb.valid.content"));

    setBusy(true);
    try {
      await uploadPolicyDocument({
        documentKey: normalizedKey,
        title: title.trim(),
        category: uploadCategory,
        parsedContent,
      });
      toast.success(t("kb.toast.uploaded"));
      setUploadOpen(false);
      setDocumentKey("");
      setTitle("");
      setParsedContent("");
      load();
    } catch (error) {
      // A taken key means the user meant to revise the existing document —
      // so offer exactly that rather than leaving them at a validation error.
      if (lexErrorCode(error) === "LEX.KNOWLEDGE.DOCUMENT_KEY_TAKEN") {
        toast.error(t("kb.err.keyTaken"));
        try {
          const existing = await getPolicyDocument(normalizedKey);
          setUploadOpen(false);
          openRevise(existing);
        } catch {
          /* the toast above already explains the refusal */
        }
        return;
      }
      logForbidden(error, "POST /knowledge/documents");
      toast.error(lexErrorMessage(error, t("kb.toast.uploadFailed"), errorsByCode));
    } finally {
      setBusy(false);
    }
  };

  const openRevise = (doc: LexPolicyDocument) => {
    setReviseTarget(doc);
    setParsedContent(doc.parsedContent || "");
    setRevisionNote("");
    setReviseOpen(true);
  };

  const onRevise = async () => {
    if (!reviseTarget) return;
    if (!parsedContent.trim()) return toast.error(t("kb.valid.content"));
    // Required by the API, and worth requiring: a version history with no
    // reasons is a pile of files.
    if (!revisionNote.trim()) return toast.error(t("kb.valid.revisionNote"));

    setBusy(true);
    try {
      await revisePolicyDocument(reviseTarget.documentKey, {
        parsedContent,
        revisionNote: revisionNote.trim(),
      });
      toast.success(t("kb.toast.revised"));
      setReviseOpen(false);
      load();
    } catch (error) {
      logForbidden(error, "POST /knowledge/documents/{key}/revisions");
      toast.error(lexErrorMessage(error, t("kb.toast.reviseFailed"), errorsByCode));
    } finally {
      setBusy(false);
    }
  };

  const openVersions = async (doc: LexPolicyDocument) => {
    setNoLiveVersion(null);
    try {
      const list = await getPolicyVersions(doc.documentKey);
      setVersions(list);
      setViewing(list[0] || null);
      setVersionsOpen(true);
    } catch (error) {
      toast.error(lexErrorMessage(error, t("kb.toast.versionsFailed"), errorsByCode));
    }
  };

  const onRetire = async () => {
    if (!retireTarget) return;
    if (!retireReason.trim()) return toast.error(t("kb.valid.retireReason"));

    setBusy(true);
    try {
      await retirePolicyDocument(retireTarget.documentKey, retireReason.trim());
      toast.success(t("kb.toast.retired"));
      setRetireOpen(false);
      setRetireReason("");
      setNoLiveVersion(retireTarget.documentKey);
      load();
    } catch (error) {
      logForbidden(error, "POST /knowledge/documents/{key}/retire");
      toast.error(lexErrorMessage(error, t("kb.toast.retireFailed"), errorsByCode));
    } finally {
      setBusy(false);
    }
  };

  const headers = [
    {
      name: t("kb.col.title"),
      cell: (row: LexPolicyDocument) => (
        <div className="min-w-0">
          <p className="m-0 text-sm font-medium">{row.title}</p>
          <p className="m-0 font-mono text-xs text-muted-foreground">{row.documentKey}</p>
        </div>
      ),
    },
    {
      name: t("kb.col.category"),
      cell: (row: LexPolicyDocument) => (
        <Badge variant="outline" className={`border font-medium ${TONES.sky}`}>
          {row.category}
        </Badge>
      ),
      width: "150px",
    },
    {
      name: t("kb.col.status"),
      cell: (row: LexPolicyDocument) => <LexStatusBadge status={row.lifecycle} />,
      width: "140px",
    },
    {
      name: t("kb.col.version"),
      cell: (row: LexPolicyDocument) => <span>v{row.version}</span>,
      width: "90px",
    },
    {
      name: t("kb.col.updated"),
      cell: (row: LexPolicyDocument) => <span>{formatDateTime(row.createdAt) || "—"}</span>,
      width: "170px",
    },
    {
      name: t("common:actions"),
      // Stops the row's own click handling from firing as the menu opens.
      cell: (row: LexPolicyDocument) => (
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
                  openVersions(row);
                }}
              >
                <History className="h-4 w-4" />
                {t("kb.versions")}
              </DropdownMenuItem>
              {canWrite && (
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    openRevise(row);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                  {t("kb.revise")}
                </DropdownMenuItem>
              )}
              {canRetire && row.lifecycle === "ACTIVE" && (
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    setRetireTarget(row);
                    setRetireReason("");
                    setRetireOpen(true);
                  }}
                >
                  <Archive className="h-4 w-4" />
                  {t("kb.retire")}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      width: "120px",
    },
  ];

  if (!canRead) return <PermissionDenied />;

  const listData = searchHits ?? result.content;
  const totalRows = searchHits ? searchHits.length : result.pagination?.totalElements ?? 0;
  const from = totalRows === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalRows);

  return (
    <div className="service">
      <LexPageHeader icon={BookOpen} title={t("kb.title")} subtitle={t("kb.subtitle")} />

      <div className="pro-card p-3 mb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <LexSearch
            id="kb-search"
            className="flex-1"
            value={query}
            onChange={setQuery}
            placeholder={t("kb.searchPlaceholder")}
          />
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Label htmlFor="kb-category" className="sr-only">
              {t("kb.col.category")}
            </Label>
            <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1); }}>
              <SelectTrigger id="kb-category" className="w-44 bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t("kb.allCategories")}</SelectItem>
                {DOCUMENT_CATEGORIES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2" onClick={load} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              {t("common:refresh")}
            </Button>
            {canWrite && (
              <Button className="wallet-brand-btn gap-2" onClick={() => setUploadOpen(true)}>
                <Upload className="h-4 w-4" />
                {t("kb.upload")}
              </Button>
            )}
          </div>
        </div>
      </div>
      {noLiveVersion && (
        <LexNotice tone="slate" icon={Archive}>
          {t("kb.noLiveVersionNote", { key: noLiveVersion })}
        </LexNotice>
      )}

      <div className="pro-card">
        {!isLoading && listData.length === 0 ? (
          <EmptyState icon={BookOpen} text={t("kb.empty")} />
        ) : (
          <TableView
            header={headers}
            data={listData}
            totalRows={totalRows}
            isLoading={isLoading}
            from={from}
            to={to}
            page={page}
            totalPage={searchHits ? 1 : result.pagination?.totalPages || 1}
            setPage={setPage}
            pageSize={pageSize}
            setPageSize={(size: number) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        )}
      </div>

      {/* Upload */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="pro-dialog sm:max-w-2xl">
          <DialogHeader className="text-start">
            <DialogTitle>{t("kb.upload")}</DialogTitle>
            <DialogDescription>{t("kb.uploadExplain")}</DialogDescription>
          </DialogHeader>

          {/* Nothing extracts text from a PDF today, so the screen does not
              pretend otherwise: the text is pasted in. */}
          <LexNotice tone="amber" icon={FilePlus2}>
            {t("kb.noParsingNote")}
          </LexNotice>

          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="kb-key">{t("kb.field.key")}</Label>
                <Input
                  id="kb-key"
                  className="h-10"
                  value={documentKey}
                  onChange={(e) => setDocumentKey(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="kb-title">{t("kb.field.title")}</Label>
                <Input
                  id="kb-title"
                  className="h-10"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="kb-cat">{t("kb.field.category")} *</Label>
              <Select value={uploadCategory} onValueChange={setUploadCategory}>
                <SelectTrigger id="kb-cat" className="w-full data-[size=default]:h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="kb-content">{t("kb.field.content")}</Label>
              <Textarea
                id="kb-content"
                rows={10}
                value={parsedContent}
                onChange={(e) => setParsedContent(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-end">
            <Button variant="ghost" onClick={() => setUploadOpen(false)} disabled={busy}>
              {t("common:cancel")}
            </Button>
            <Button className="wallet-brand-btn" onClick={onUpload} disabled={busy}>
              {t("kb.upload")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revise */}
      <Dialog open={reviseOpen} onOpenChange={setReviseOpen}>
        <DialogContent className="pro-dialog sm:max-w-2xl">
          <DialogHeader className="text-start">
            <DialogTitle>{t("kb.reviseTitle", { title: reviseTarget?.title })}</DialogTitle>
            <DialogDescription>{t("kb.reviseExplain")}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="kb-note">{t("kb.field.revisionNote")} *</Label>
              <Input
                id="kb-note"
                className="h-10"
                placeholder={t("kb.field.revisionNotePlaceholder")}
                value={revisionNote}
                onChange={(e) => setRevisionNote(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="kb-revised">{t("kb.field.content")}</Label>
              <Textarea
                id="kb-revised"
                rows={12}
                value={parsedContent}
                onChange={(e) => setParsedContent(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-end">
            <Button variant="ghost" onClick={() => setReviseOpen(false)} disabled={busy}>
              {t("common:cancel")}
            </Button>
            <Button className="wallet-brand-btn" onClick={onRevise} disabled={busy}>
              {t("kb.reviseSave")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Version history — the screen that answers "what did the policy say when
          this case was flagged". */}
      <Dialog open={versionsOpen} onOpenChange={setVersionsOpen}>
        <DialogContent className="pro-dialog sm:max-w-3xl">
          <DialogHeader className="text-start">
            <DialogTitle>{t("kb.versionsTitle")}</DialogTitle>
            <DialogDescription>{t("kb.versionsExplain")}</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[280px_1fr]">
            <div className="max-h-[55vh] overflow-y-auto">
              <LexVersionTimeline
                currentId={viewing?.id}
                emptyText={t("kb.versionsEmpty")}
                entries={versions.map((v) => ({
                  id: v.id,
                  version: v.version,
                  status: v.lifecycle,
                  at: v.createdAt,
                  by: v.uploadedBy,
                  note: v.revisionNote || undefined,
                }))}
                onSelect={(id) => setViewing(versions.find((v) => v.id === id) || null)}
              />
            </div>
            <div className="max-h-[55vh] overflow-y-auto rounded-lg border border-border bg-muted/20 p-3">
              <pre className="m-0 whitespace-pre-wrap break-words text-xs text-foreground">
                {viewing?.parsedContent || t("kb.versionNoContent")}
              </pre>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Retire — labelled Retire, never Delete, with the consequence stated. */}
      <Dialog open={retireOpen} onOpenChange={setRetireOpen}>
        <DialogContent className="pro-dialog sm:max-w-md">
          <DialogHeader className="text-start">
            <DialogTitle>{t("kb.retireTitle", { title: retireTarget?.title })}</DialogTitle>
            <DialogDescription>{t("kb.retireExplain")}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="kb-retire-reason">{t("kb.field.retireReason")}</Label>
            <Input
              id="kb-retire-reason"
              className="h-10"
              value={retireReason}
              onChange={(e) => setRetireReason(e.target.value)}
            />
          </div>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button variant="ghost" onClick={() => setRetireOpen(false)} disabled={busy}>
              {t("common:cancel")}
            </Button>
            <Button className="wallet-brand-btn" onClick={onRetire} disabled={busy}>
              {t("kb.retire")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LexPolicyLibrary;
