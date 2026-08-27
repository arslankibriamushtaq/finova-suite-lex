import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getDocumentsByInvestorId, approveDocument, approveKyc, approveKyb, Document, ApproveDocumentRequest, ApproveKycRequest, ApproveKybRequest } from '../../../../redux/apis/apisInvestor';


import { 
  ArrowLeft,
  Download, 
  Eye, 
  FileText,
  Search,
  Calendar,
  User,
  File,
  CheckCircle,
  XCircle,
  Clock,
  Image,
  FileImage
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DocumentPreview() {
  const { t } = useTranslation('investor');
  const { investorId } = useParams<{ investorId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const investorType = searchParams.get('type') as 'individual' | 'business' | null;
  
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);

  // Pagination logic
  const getCurrentDocuments = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return documents.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    return Math.ceil(documents.length / itemsPerPage);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < getTotalPages()) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Filter documents based on search
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.documentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.fileType?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Load documents
  const loadDocuments = async () => {
    if (!investorId) {
      toast.error(t('dpv.investorIdRequired'));
      return;
    }

    try {
      setLoading(true);
      const result = await getDocumentsByInvestorId(investorId);
      if (result.success) {
        // Handle single document response - convert to array if needed
        if (result.data) {
          // If data is a single object, wrap it in an array
          if (Array.isArray(result.data)) {
            setDocuments(result.data);
          } else {
            setDocuments([result.data]);
          }
        } else {
          setDocuments([]);
        }
      } else {
        toast.error(result.notificationMessage || t('doc.fetchError'));
      }
    } catch (error: any) {
      toast.error(t('doc.loadError'));
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [currentPage, investorId]);

  // Open preview if docId is in URL
  useEffect(() => {
    const docId = searchParams.get('docId');
    if (docId && documents.length > 0) {
      const doc = documents.find(d => d.id.toString() === docId);
      if (doc && !previewDocument) {
        setPreviewDocument(doc);
      }
    }
  }, [documents, searchParams]);

  const getStatusText = (verificationStatus: number) => {
    switch (verificationStatus) {
      case 0:
        return t('doc.status.pending');
      case 1:
        return t('doc.status.verified');
      case 2:
        return t('doc.status.rejected');
      default:
        return t('doc.status.pending');
    }
  };

  const getStatusIcon = (verificationStatus: number) => {
    switch (verificationStatus) {
      case 1:
        return <CheckCircle className="w-4 h-4 text-red-500" />;
      case 2:
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 0:
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (verificationStatus: number) => {
    switch (verificationStatus) {
      case 1:
        return 'bg-red-100 text-red-800';
      case 2:
        return 'bg-red-100 text-red-800';
      case 0:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType?.toLowerCase().includes('pdf')) {
      return <FileText className="w-8 h-8 text-red-500" />;
    } else if (fileType?.toLowerCase().includes('image') || fileType?.toLowerCase().includes('jpg') || fileType?.toLowerCase().includes('png')) {
      return <Image className="w-8 h-8 text-blue-500" />;
    } else if (fileType?.toLowerCase().includes('word') || fileType?.toLowerCase().includes('doc')) {
      return <FileText className="w-8 h-8 text-blue-600" />;
    } else {
      return <File className="w-8 h-8 text-gray-500" />;
    }
  };

  const handleApproveDocument = async (doc: Document) => {
    try {
      const requestData: ApproveDocumentRequest = {
        investorId: investorId || '',
        documentId: doc.id,
        verificationStatus: 1 // 1 = Verified (Approved)
      };
      
      // Call document approval API
      const documentResult = await approveDocument(requestData);
      
      if (documentResult.success) {
        // Also call KYC/KYB approval API based on investor type
        if (investorType === 'individual') {
          const kycRequest: ApproveKycRequest = {
            investorId: investorId || '',
            verificationStatus: 1 // 1 = Verified (Approved)
          };
          await approveKyc(kycRequest);
        } else if (investorType === 'business') {
          const kybRequest: ApproveKybRequest = {
            investorId: investorId || '',
            verificationStatus: 1 // 1 = Verified (Approved)
          };
          await approveKyb(kybRequest);
        }
        
        toast.success(documentResult.notificationMessage || t('doc.approveSuccess'));
        // Reload documents
        loadDocuments();
      } else {
        if (documentResult.errors && Array.isArray(documentResult.errors)) {
          documentResult.errors.forEach((error: string) => {
            toast.error(error);
          });
        } else {
          toast.error(documentResult.notificationMessage || t('doc.approveError'));
        }
      }
    } catch (error: any) {
      toast.error(t('doc.approveErrorGeneric'));
      console.error('Error approving document:', error);
    }
  };

  const handleRejectDocument = async (doc: Document) => {
    try {
      const requestData: ApproveDocumentRequest = {
        investorId: investorId || '',
        documentId: doc.id,
        verificationStatus: 2 // 2 = Rejected
      };
      
      // Call document approval API
      const documentResult = await approveDocument(requestData);
      
      if (documentResult.success) {
        // Also call KYC/KYB approval API based on investor type
        if (investorType === 'individual') {
          const kycRequest: ApproveKycRequest = {
            investorId: investorId || '',
            verificationStatus: 2 // 2 = Rejected
          };
          await approveKyc(kycRequest);
        } else if (investorType === 'business') {
          const kybRequest: ApproveKybRequest = {
            investorId: investorId || '',
            verificationStatus: 2 // 2 = Rejected
          };
          await approveKyb(kybRequest);
        }
        
        toast.success(documentResult.notificationMessage || t('doc.rejectSuccess'));
        // Reload documents
        loadDocuments();
      } else {
        if (documentResult.errors && Array.isArray(documentResult.errors)) {
          documentResult.errors.forEach((error: string) => {
            toast.error(error);
          });
        } else {
          toast.error(documentResult.notificationMessage || t('doc.rejectError'));
        }
      }
    } catch (error: any) {
      toast.error(t('doc.rejectErrorGeneric'));
      console.error('Error rejecting document:', error);
    }
  };

  const handlePreviewDocument = (doc: Document) => {
    if (doc.filePath) {
      setPreviewDocument(doc);
      // Update URL with document ID
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('docId', doc.id.toString());
      navigate(`?${newSearchParams.toString()}`, { replace: true });
    } else {
      toast.error(t('dpv.urlNotAvailable'));
    }
  };

  const closePreview = () => {
    setPreviewDocument(null);
    // Remove docId from URL when closing preview
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete('docId');
    navigate(`?${newSearchParams.toString()}`, { replace: true });
  };

  const getPreviewUrl = (doc: Document | null) => {
    if (!doc?.filePath) return '';
    
    // If filePath is already a full URL, use it directly (fix double slashes after protocol)
    if (doc.filePath.startsWith('http://') || doc.filePath.startsWith('https://')) {
      // Fix double slashes after http:// or https://
      return doc.filePath.replace(/(https?:\/)(\/+)/, '$1/');
    }
    
    // Construct full URL for preview - handle both paths starting with / and without
    const cleanPath = doc.filePath.startsWith('/') ? doc.filePath : `/${doc.filePath}`;
    return `https://devapi.awn-sa.com/portfolio${cleanPath}`;
  };

  const getImageUrl = (filePath: string) => {
    if (!filePath) return '';
    
    // If filePath is already a full URL, use it directly (fix double slashes after protocol)
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      // Fix double slashes after http:// or https://
      return filePath.replace(/(https?:\/)(\/+)/, '$1/');
    }
    
    // Construct full URL - handle both paths starting with / and without
    const cleanPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
    return `https://devapi.awn-sa.com/portfolio${cleanPath}`;
  };

  const handleDownloadDocument = (doc: Document) => {
    if (doc.filePath) {
      // If filePath is already a full URL, use it directly (fix double slashes after protocol)
      let fullUrl = '';
      if (doc.filePath.startsWith('http://') || doc.filePath.startsWith('https://')) {
        // Fix double slashes after http:// or https://
        fullUrl = doc.filePath.replace(/(https?:\/)(\/+)/, '$1/');
      } else {
        // Construct full URL for download - handle both paths starting with / and without
        const cleanPath = doc.filePath.startsWith('/') ? doc.filePath : `/${doc.filePath}`;
        fullUrl = `https://devapi.awn-sa.com/portfolio${cleanPath}`;
      }
      
      const link = document.createElement('a');
      link.href = fullUrl;
      link.download = doc.documentName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      toast.error(t('dpv.urlNotAvailable'));
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/admin/investors"
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
          {filteredDocuments.map((document) => (
            <div key={document.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden">
              {/* Large Image Display */}
              <div className="relative h-64 bg-gradient-to-br from-gray-50 to-gray-100">
                {document.fileType?.toLowerCase().includes('image') || 
                 document.fileType?.toLowerCase().includes('JPG') || 
                 document.fileType?.toLowerCase().includes('jpg')
                 || document.fileType?.toLowerCase().includes('jpeg') || 
                 document.fileType?.toLowerCase().includes('png') ? (
                  <img 
                    src={getImageUrl(document.filePath)}
                    alt={document.documentName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Hide the image and show "No Image Found" message
                      e.currentTarget.style.display = 'none';
                      const noImageDiv = e.currentTarget.parentElement?.querySelector('.no-image-message');
                      if (noImageDiv) {
                        noImageDiv.classList.remove('hidden');
                      }
                    }}
                  />
                ) : null}
                <div className={`absolute inset-0 flex items-center justify-center ${document.fileType?.toLowerCase().includes('image') || 
                 document.fileType?.toLowerCase().includes('JPG') || 
                 document.fileType?.toLowerCase().includes('jpg')
                 || document.fileType?.toLowerCase().includes('jpeg') || 
                 document.fileType?.toLowerCase().includes('png') ? 'hidden' : ''}`}>
                  <div className="text-center">
                    <div className="mb-2">
                      {getFileIcon(document.fileType)}
                    </div>
                    <p className="text-sm text-gray-500 font-medium">{document.fileType}</p>
                  </div>
                </div>
                
                {/* No Image Found Message */}
                <div className={`no-image-message absolute inset-0 flex items-center justify-center bg-gray-100 ${document.fileType?.toLowerCase().includes('image') || 
                 document.fileType?.toLowerCase().includes('JPG') || 
                 document.fileType?.toLowerCase().includes('jpg')
                 || document.fileType?.toLowerCase().includes('jpeg') || 
                 document.fileType?.toLowerCase().includes('png') ? 'hidden' : ''}`}>
                  <div className="text-center p-4">
                    <div className="mb-2">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto" />
                    </div>
                    <p className="text-sm text-gray-500 font-medium">{t('dpv.noImageFound')}</p>
                    <p className="text-xs text-gray-400 mt-1">{t('dpv.imagePathIncorrect')}</p>
                  </div>
                </div>
                
                {/* Status Badge Overlay */}
                <div className="absolute top-4 right-4">
                  <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full shadow-lg ${
                    document.verificationStatus === 1 ? 'bg-red-500 text-white' : // Approved
                    document.verificationStatus === 2 ? 'bg-red-500 text-white' : // Rejected
                    'bg-yellow-500 text-white' // Pending
                  }`}>
                    {getStatusText(document.verificationStatus)}
                  </span>
                </div>
              </div>
              
              {/* Document Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-900 truncate flex-1 me-2">
                    {document.documentName}
                  </h3>
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(document.verificationStatus)}`}>
                    {getStatusText(document.verificationStatus)}
                  </span>
                </div>
                
                <div className="space-y-2 text-xs text-gray-500 mb-4">
                  <div className="flex items-center">
                    <FileText className="w-3 h-3 me-1" />
                    <span>{document.fileType}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 me-1" />
                    <span>{new Date(document.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="text-xs">
                    {t('dpv.sizeLabel', { value: formatFileSize(document.fileSize) })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handlePreviewDocument(document)}
                    className="flex-1 px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 flex items-center justify-center"
                  >
                    <Eye className="w-3 h-3 me-1" />
                    {t('doc.preview')}
                  </button>

                  <button
                    onClick={() => handleDownloadDocument(document)}
                    className="flex-1 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 flex items-center justify-center"
                  >
                    <Download className="w-3 h-3 me-1" />
                    {t('doc.download')}
                  </button>
                </div>

                {/* Approve/Reject Buttons */}
                <div className="mt-3 flex gap-2">
                  {document.verificationStatus !== 1 && (
                    <button
                      onClick={() => handleApproveDocument(document)}
                      className="flex-1 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 flex items-center justify-center"
                    >
                      <CheckCircle className="w-3 h-3 me-1" />
                      {t('common:approve')}
                    </button>
                  )}

                  {document.verificationStatus !== 2 && (
                    <button
                      onClick={() => handleRejectDocument(document)}
                      className="flex-1 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 flex items-center justify-center"
                    >
                      <XCircle className="w-3 h-3 me-1" />
                      {t('common:reject')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {filteredDocuments.length > 0 && (
        <div className="mt-8 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {t('doc.showing', { from: ((currentPage - 1) * itemsPerPage) + 1, to: Math.min(currentPage * itemsPerPage, filteredDocuments.length), total: filteredDocuments.length })}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('common:previous')}
            </button>
            
            {/* Page numbers */}
            {Array.from({ length: getTotalPages() }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-2 text-sm font-medium border rounded-lg ${
                  currentPage === page
                    ? 'text-white bg-blue-600 border-blue-600'
                    : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button 
              onClick={handleNextPage}
              disabled={currentPage === getTotalPages()}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('common:next')}
            </button>
          </div>
        </div>
      )}

      {/* Document Preview Modal with iframe */}
      {previewDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative w-full h-full flex flex-col bg-white">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
              <h2 className="text-lg font-semibold text-gray-900 truncate flex-1 me-4">
                {previewDocument.documentName}
              </h2>
              <button
                onClick={closePreview}
                className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label={t('dpv.closePreview')}
              >
                {/* <X className="w-6 h-6 text-gray-600" /> */}
              </button>
            </div>
            
            {/* iframe Preview */}
            <div className="flex-1 relative overflow-hidden">
              <iframe
                src={getPreviewUrl(previewDocument)}
                className="w-full h-full border-0"
                title={previewDocument.documentName}
                allow="fullscreen"
              />
            </div>
          </div>
        </div>
      )}

   
    </div>
  );
}
