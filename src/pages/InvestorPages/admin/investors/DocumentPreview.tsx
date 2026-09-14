import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  getInvestorDocumentSlots,
  getInvestorDocumentContent,
  downloadInvestorDocument,
  approveDocument,
  approveKyc,
  approveKyb,
  InvestorDocumentSlots,
  ApproveDocumentRequest,
  ApproveKycRequest,
  ApproveKybRequest,
} from '../../../../redux/apis/apisInvestor';

import {
  ArrowLeft,
  Download,
  Eye,
  FileText,
  Calendar,
  File,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { usePermissions } from '../../../../hooks/useProductPermissions';

import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Skeleton } from '../../../../components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../../components/ui/dialog';
import { EmptyState } from '../../../../components/shared/detailKit';
import { TONES } from '../../../../components/shared/detailKitUtils';
import { LexPageHeader, LexSearch } from '../../../../components/shared/lexKit';
import { cn } from '../../../../lib/utils';

/**
 * The service does not return a list of documents. It returns one record with a
 * fixed slot per required document — an id, a review status and an expiry date
 * each — so the slots are declared here and the response is read through them.
 */
const DOCUMENT_SLOTS = [
  { field: 'nationalIdFront', label: 'National ID (Front)' },
  { field: 'nationalIdBack', label: 'National ID (Back)' },
  { field: 'bankStatement', label: 'Bank Statement' },
  { field: 'salaryCertificate', label: 'Salary Certificate' },
] as const;

type SlotField = (typeof DOCUMENT_SLOTS)[number]['field'];

interface InvestorDocument {
  field: SlotField;
  label: string;
  documentId: string;
  status: string | number;
  expiryDate: string | null;
}

/**
 * The approve API speaks numbers (0 pending / 1 approved / 2 rejected) and so,
 * as it turns out, does the read — but not always: some slots come back as the
 * words PENDING/VERIFIED/REJECTED. Accept either rather than assuming a string
 * and calling toUpperCase on a number.
 */
const statusCode = (status: string | number | null | undefined): number => {
  if (typeof status === 'number') return status === 1 || status === 2 ? status : 0;
  const value = String(status ?? '').toUpperCase();
  if (value === 'VERIFIED' || value === 'APPROVED' || value === '1') return 1;
  if (value === 'REJECTED' || value === '2') return 2;
  return 0;
};

export default function DocumentPreview() {
  // Viewing and downloading the file is a read; approving or rejecting it is
  // what PORTFOLIO_INVESTOR_VERIFY is for.
  const { hasPermission } = usePermissions();
  const canVerify = hasPermission('PORTFOLIO_INVESTOR_VERIFY');
  const { t } = useTranslation('investor');
  const { investorId } = useParams<{ investorId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const investorType = searchParams.get('type') as 'individual' | 'business' | null;

  const [documents, setDocuments] = useState<InvestorDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [previewDocument, setPreviewDocument] = useState<InvestorDocument | null>(null);

  // The content endpoint is authenticated, so a file cannot be handed to an
  // <img> or <iframe> as a URL — each one is fetched once and kept here as an
  // object URL, keyed by document id.
  const [contentUrls, setContentUrls] = useState<Record<string, { url: string; type: string }>>({});

  const filteredDocuments = useMemo(
    () =>
      documents.filter((doc) => doc.label.toLowerCase().includes(searchTerm.toLowerCase())),
    [documents, searchTerm]
  );

  const loadDocuments = useCallback(async () => {
    if (!investorId) {
      toast.error(t('dpv.investorIdRequired'));
      return;
    }

    try {
      setLoading(true);
      const result = await getInvestorDocumentSlots(investorId);
      if (result.success && result.data) {
        const data = result.data as InvestorDocumentSlots;
        setDocuments(
          DOCUMENT_SLOTS.flatMap(({ field, label }) => {
            const documentId = data[field];
            // A slot with nothing uploaded in it is simply absent, not a card
            // with no file behind it.
            if (!documentId) return [];
            return [
              {
                field,
                label: t(`dpv.slot.${field}`, label),
                documentId: String(documentId),
                status: data[`${field}Status`] ?? 'PENDING',
                expiryDate: data[`${field}ExpiryDate`] == null
                  ? null
                  : String(data[`${field}ExpiryDate`]),
              },
            ];
          })
        );
      } else if (result.success) {
        setDocuments([]);
      } else {
        toast.error(result.notificationMessage || t('doc.fetchError'));
      }
    } catch (error: any) {
      toast.error(t('doc.loadError'));
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  }, [investorId, t]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // Fetch the bytes for every slot the read returned. Object URLs are revoked
  // when the set is replaced or the page unmounts, or each reload would leak
  // one blob per document.
  useEffect(() => {
    if (!investorId || documents.length === 0) return;
    let cancelled = false;
    const created: string[] = [];

    (async () => {
      const entries = await Promise.all(
        documents.map(async (doc) => {
          try {
            const blob = await getInvestorDocumentContent(investorId, doc.documentId);
            const url = URL.createObjectURL(blob);
            created.push(url);
            return [doc.documentId, { url, type: blob.type }] as const;
          } catch (error) {
            console.error('Error loading document content:', doc.documentId, error);
            return null;
          }
        })
      );

      if (cancelled) return;
      setContentUrls(Object.fromEntries(entries.filter(Boolean) as any));
    })();

    return () => {
      cancelled = true;
      created.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [investorId, documents]);

  // Open the preview straight away when the URL names a document.
  useEffect(() => {
    const docId = searchParams.get('docId');
    if (docId && documents.length > 0 && !previewDocument) {
      const doc = documents.find((d) => d.documentId === docId);
      if (doc) setPreviewDocument(doc);
    }
  }, [documents, searchParams, previewDocument]);

  const getStatusText = (status: string | number) => {
    switch (statusCode(status)) {
      case 1:
        return t('doc.status.verified');
      case 2:
        return t('doc.status.rejected');
      default:
        return t('doc.status.pending');
    }
  };

  const getStatusIcon = (status: string | number) => {
    switch (statusCode(status)) {
      case 1:
        return <CheckCircle className="h-4 w-4 text-red-600" />;
      case 2:
        return <XCircle className="h-4 w-4 text-red-700" />;
      default:
        return <Clock className="h-4 w-4 text-amber-500" />;
    }
  };

  // Verified was a green the brand does not have, and pending a raw yellow.
  const getStatusTone = (status: string | number) => {
    switch (statusCode(status)) {
      case 1:
        return TONES.emerald;
      case 2:
        return TONES.red;
      default:
        return TONES.amber;
    }
  };

  const isImage = (type?: string) => !!type && type.startsWith('image/');

  const setVerification = async (doc: InvestorDocument, verificationStatus: number) => {
    const approved = verificationStatus === 1;
    try {
      const requestData: ApproveDocumentRequest = {
        investorId: investorId || '',
        documentId: doc.documentId,
        verificationStatus,
      };

      const documentResult = await approveDocument(requestData);

      if (documentResult.success) {
        if (investorType === 'individual') {
          const kycRequest: ApproveKycRequest = {
            investorId: investorId || '',
            verificationStatus,
          };
          await approveKyc(kycRequest);
        } else if (investorType === 'business') {
          const kybRequest: ApproveKybRequest = {
            investorId: investorId || '',
            verificationStatus,
          };
          await approveKyb(kybRequest);
        }

        toast.success(
          documentResult.notificationMessage ||
            t(approved ? 'doc.approveSuccess' : 'doc.rejectSuccess')
        );
        loadDocuments();
      } else if (documentResult.errors && Array.isArray(documentResult.errors)) {
        documentResult.errors.forEach((error: string) => toast.error(error));
      } else {
        toast.error(
          documentResult.notificationMessage || t(approved ? 'doc.approveError' : 'doc.rejectError')
        );
      }
    } catch (error: any) {
      toast.error(t(approved ? 'doc.approveErrorGeneric' : 'doc.rejectErrorGeneric'));
      console.error('Error updating document verification:', error);
    }
  };

  const handlePreviewDocument = (doc: InvestorDocument) => {
    if (!contentUrls[doc.documentId]) {
      toast.error(t('dpv.urlNotAvailable'));
      return;
    }
    setPreviewDocument(doc);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('docId', doc.documentId);
    navigate(`?${newSearchParams.toString()}`, { replace: true });
  };

  const closePreview = () => {
    setPreviewDocument(null);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete('docId');
    navigate(`?${newSearchParams.toString()}`, { replace: true });
  };

  // Downloads go through the download endpoint rather than reusing the preview
  // blob: it is the one that serves the file as an attachment, and it carries
  // the stored filename, so the saved file keeps the name it was uploaded with.
  const handleDownloadDocument = async (doc: InvestorDocument) => {
    try {
      const { blob, fileName } = await downloadInvestorDocument(doc.documentId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || doc.label;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      toast.error(t('doc.downloadError', 'Could not download the document.'));
      console.error('Error downloading document:', doc.documentId, error);
    }
  };

  return (
    <div className="service">
      <LexPageHeader icon={FileText} title={t('dpv.title')} subtitle={t('dpv.subtitle')}>
        <Button asChild variant="ghost" size="sm" className="gap-2">
          <Link to="/InvestorDashboard/Investors">
            <ArrowLeft className="h-4 w-4" />
            {t('kycd.backToInvestors')}
          </Link>
        </Button>
      </LexPageHeader>

      <div className="pro-card p-3 mb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <LexSearch
            id="document-search"
            className="flex-1"
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder={t('doc.searchPlaceholder')}
          />
          <span className="whitespace-nowrap text-xs text-muted-foreground">
            {t('dpv.countLabel', { shown: filteredDocuments.length, total: documents.length })}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="pro-card p-3">
              <Skeleton className="mb-3 h-40 w-full rounded-lg" />
              <Skeleton className="mb-2 h-4 w-2/3" />
              <Skeleton className="mb-3 h-3 w-1/2" />
              <div className="flex gap-2">
                <Skeleton className="h-8 flex-1 rounded-md" />
                <Skeleton className="h-8 flex-1 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="pro-card p-4">
          <EmptyState
            icon={FileText}
            text={documents.length === 0 ? t('doc.noDocuments') : t('dpv.noMatch')}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredDocuments.map((doc) => {
            const content = contentUrls[doc.documentId];
            return (
              <div key={doc.documentId} className="pro-card flex flex-col p-3">
                <div className="relative mb-3 h-40 overflow-hidden rounded-lg border bg-muted/40">
                  {content && isImage(content.type) ? (
                    <img src={content.url} alt={doc.label} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 px-3 text-center">
                      {content ? (
                        <FileText className="h-8 w-8 text-muted-foreground/60" />
                      ) : (
                        <File className="h-8 w-8 text-muted-foreground/40" />
                      )}
                      <p className="m-0 truncate text-xs text-muted-foreground">
                        {content ? content.type || t('dpv.noImageFound') : t('kycd.loading')}
                      </p>
                    </div>
                  )}
                  <Badge
                    variant="outline"
                    className={cn('absolute end-2 top-2 border font-medium', getStatusTone(doc.status))}
                  >
                    {getStatusText(doc.status)}
                  </Badge>
                </div>

                <div className="mb-2 flex items-start justify-between gap-2">
                  <h4 className="m-0 truncate text-sm font-semibold tracking-tight text-foreground">
                    {doc.label}
                  </h4>
                  {getStatusIcon(doc.status)}
                </div>

                {/* The date sat on its own next to a calendar icon, with nothing
                    to say what it was a date of. */}
                <p className="m-0 mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  {doc.expiryDate
                    ? `${t('dpv.expiresLabel')} ${new Date(doc.expiryDate).toLocaleDateString()}`
                    : t('dpv.noExpiry')}
                </p>

                <div className="mt-auto flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1.5"
                      onClick={() => handlePreviewDocument(doc)}
                      disabled={!content}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      {t('doc.preview')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1.5"
                      onClick={() => handleDownloadDocument(doc)}
                    >
                      <Download className="h-3.5 w-3.5" />
                      {t('doc.download')}
                    </Button>
                  </div>

                  {/* A document is never both approved and rejected, so one of
                      the two buttons always shows to someone who can verify. */}
                  {canVerify && (
                    <div className="flex gap-2">
                      {statusCode(doc.status) !== 1 && (
                        <Button
                          size="sm"
                          className="flex-1 gap-1.5"
                          onClick={() => setVerification(doc, 1)}
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          {t('common:approve')}
                        </Button>
                      )}
                      {statusCode(doc.status) !== 2 && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => setVerification(doc, 2)}
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          {t('common:reject')}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Was a hand-rolled fixed overlay with its own close button: no escape
          key, no focus trap, and nothing returning focus to the card behind it. */}
      <Dialog
        open={!!previewDocument && !!contentUrls[previewDocument.documentId]}
        onOpenChange={(open) => {
          if (!open) closePreview();
        }}
      >
        <DialogContent className="pro-dialog sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5">
              <span className="pro-head-badge">
                <FileText className="h-4 w-4" />
              </span>
              <span className="truncate">{previewDocument?.label}</span>
            </DialogTitle>
          </DialogHeader>

          {previewDocument && contentUrls[previewDocument.documentId] && (
            <div className="h-[70vh] overflow-auto rounded-lg border bg-muted/30">
              {isImage(contentUrls[previewDocument.documentId].type) ? (
                <img
                  src={contentUrls[previewDocument.documentId].url}
                  alt={previewDocument.label}
                  className="mx-auto max-h-full object-contain"
                />
              ) : (
                <iframe
                  src={contentUrls[previewDocument.documentId].url}
                  className="h-full w-full border-0"
                  title={previewDocument.label}
                  allow="fullscreen"
                />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
