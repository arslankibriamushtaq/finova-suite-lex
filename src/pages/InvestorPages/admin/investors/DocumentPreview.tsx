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
  Search,
  Calendar,
  File,
  CheckCircle,
  XCircle,
  Clock,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

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
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 2:
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string | number) => {
    switch (statusCode(status)) {
      case 1:
        return 'bg-green-100 text-green-800';
      case 2:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
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
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/InvestorDashboard/Investors"
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 me-2" />
              {t('kycd.backToInvestors')}
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('dpv.title')}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={t('doc.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full ps-10 pe-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">{t('kycd.loading')}</div>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('doc.noDocuments')}</h3>
          <p className="text-gray-500">{t('dpv.noMatch')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredDocuments.map((doc) => {
            const content = contentUrls[doc.documentId];
            return (
              <div
                key={doc.documentId}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden"
              >
                {/* Large preview */}
                <div className="relative h-64 bg-gradient-to-br from-gray-50 to-gray-100">
                  {content && isImage(content.type) ? (
                    <img src={content.url} alt={doc.label} className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="mb-2">
                          {content ? (
                            <FileText className="w-12 h-12 text-red-500 mx-auto" />
                          ) : (
                            <File className="w-12 h-12 text-gray-400 mx-auto" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500 font-medium">
                          {content ? content.type || t('dpv.noImageFound') : t('kycd.loading')}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Status Badge Overlay */}
                  <div className="absolute top-4 right-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full shadow-lg ${getStatusColor(
                        doc.status
                      )}`}
                    >
                      {getStatusText(doc.status)}
                    </span>
                  </div>
                </div>

                {/* Document Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-900 truncate flex-1 me-2">
                      {doc.label}
                    </h3>
                    {getStatusIcon(doc.status)}
                  </div>

                  <div className="space-y-2 text-xs text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 me-1" />
                      <span>
                        {doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString() : '—'}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handlePreviewDocument(doc)}
                      disabled={!content}
                      className="flex-1 px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 disabled:opacity-50 flex items-center justify-center"
                    >
                      <Eye className="w-3 h-3 me-1" />
                      {t('doc.preview')}
                    </button>

                    <button
                      onClick={() => handleDownloadDocument(doc)}
                      className="flex-1 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50 flex items-center justify-center"
                    >
                      <Download className="w-3 h-3 me-1" />
                      {t('doc.download')}
                    </button>
                  </div>

                  {/* Approve/Reject Buttons */}
                  <div className="mt-3 flex gap-2">
                    {statusCode(doc.status) !== 1 && (
                      <button
                        onClick={() => setVerification(doc, 1)}
                        className="flex-1 px-3 py-2 text-xs font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 flex items-center justify-center"
                      >
                        <CheckCircle className="w-3 h-3 me-1" />
                        {t('common:approve')}
                      </button>
                    )}

                    {statusCode(doc.status) !== 2 && (
                      <button
                        onClick={() => setVerification(doc, 2)}
                        className="flex-1 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 flex items-center justify-center"
                      >
                        <XCircle className="w-3 h-3 me-1" />
                        {t('common:reject')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Document Preview Modal */}
      {previewDocument && contentUrls[previewDocument.documentId] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative w-full h-full flex flex-col bg-white">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
              <h2 className="text-lg font-semibold text-gray-900 truncate flex-1 me-4">
                {previewDocument.label}
              </h2>
              <button
                onClick={closePreview}
                className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label={t('dpv.closePreview')}
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Preview */}
            <div className="flex-1 relative overflow-auto bg-gray-100">
              {isImage(contentUrls[previewDocument.documentId].type) ? (
                <img
                  src={contentUrls[previewDocument.documentId].url}
                  alt={previewDocument.label}
                  className="mx-auto max-h-full object-contain"
                />
              ) : (
                <iframe
                  src={contentUrls[previewDocument.documentId].url}
                  className="w-full h-full border-0"
                  title={previewDocument.label}
                  allow="fullscreen"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
