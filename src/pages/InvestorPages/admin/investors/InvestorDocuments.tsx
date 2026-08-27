import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getAllDocuments, approveDocument, Document, ApproveDocumentRequest } from '../../../../redux/apis/apisInvestor';


import { 
  ArrowLeft,
  Download, 
  Eye, 
  FileText,
  Search,
  Filter,
  Calendar,
  User,
  File,
  CheckCircle,
  XCircle,
  Clock,
  Upload
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function InvestorDocuments() {
  const { t } = useTranslation('investor');
  const { investorId } = useParams<{ investorId: string }>();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

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

  // Filter documents based on search and filters
  const filteredDocuments = documents.filter((doc:any) => {
    const matchesSearch = doc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || doc.type?.toLowerCase() === typeFilter.toLowerCase();
    const matchesStatus = statusFilter === 'all' || doc.status?.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Load documents
  const loadDocuments = async () => {
    try {
      setLoading(true);
      const result = await getAllDocuments(currentPage, itemsPerPage);
      if (result.success) {
        setDocuments(result.data || []);
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
  }, [currentPage]);

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-red-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-red-100 text-red-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
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

  const getFileIcon = (type: string) => {
    if (type?.toLowerCase().includes('pdf')) {
      return <FileText className="w-5 h-5 text-red-500" />;
    } else if (type?.toLowerCase().includes('image')) {
      return <FileText className="w-5 h-5 text-gray-700" />;
    } else if (type?.toLowerCase().includes('word')) {
      return <FileText className="w-5 h-5 text-black" />;
    } else {
      return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  const handleApproveDocument = async (document: Document) => {
    try {
      const requestData: ApproveDocumentRequest = {
        investorId: investorId || '',
        verificationStatus: 1 // 1 = Approved
      };
      
      const result = await approveDocument(requestData);
      if (result.success) {
        toast.success(result.notificationMessage || t('doc.approveSuccess'));
        // Reload documents
        loadDocuments();
      } else {
        if (result.errors && Array.isArray(result.errors)) {
          result.errors.forEach((error: string) => {
            toast.error(error);
          });
        } else {
          toast.error(result.notificationMessage || t('doc.approveError'));
        }
      }
    } catch (error: any) {
      toast.error(t('doc.approveErrorGeneric'));
      console.error('Error approving document:', error);
    }
  };

  const handleRejectDocument = async (document: Document) => {
    try {
      const requestData: ApproveDocumentRequest = {
        investorId: investorId || '',
        verificationStatus: 2 // 2 = Rejected
      };
      
      const result = await approveDocument(requestData);
      if (result.success) {
        toast.success(result.notificationMessage || t('doc.rejectSuccess'));
        // Reload documents
        loadDocuments();
      } else {
        if (result.errors && Array.isArray(result.errors)) {
          result.errors.forEach((error: string) => {
            toast.error(error);
          });
        } else {
          toast.error(result.notificationMessage || t('doc.rejectError'));
        }
      }
    } catch (error: any) {
      toast.error(t('doc.rejectErrorGeneric'));
      console.error('Error rejecting document:', error);
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
              <h1 className="text-3xl font-bold text-gray-900">{t('idoc.title')}</h1>
              <p className="mt-2 text-gray-600">{t('idoc.subtitle', { id: investorId })}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center">
              <Download className="w-4 h-4 me-2" />
              {t('common:export')}
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 flex items-center">
              <Upload className="w-4 h-4 me-2" />
              {t('idoc.uploadDocument')}
            </button>
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
                className="w-full ps-10 pe-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            >
              <option value="all">{t('ts.type.all')}</option>
              <option value="pdf">{t('idoc.filterType.pdf')}</option>
              <option value="image">{t('idoc.filterType.image')}</option>
              <option value="word">{t('idoc.filterType.word')}</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            >
              <option value="all">{t('idoc.allStatus')}</option>
              <option value="pending">{t('doc.status.pending')}</option>
              <option value="approved">{t('doc.status.approved')}</option>
              <option value="rejected">{t('doc.status.rejected')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('kycd.col.document')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('common:type')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('kycd.col.size')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('idoc.col.uploadDate')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('common:status')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('common:actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    {t('kycd.loading')}
                  </td>
                </tr>
              ) : filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    {t('doc.noDocuments')}
                  </td>
                </tr>
              ) : (
                filteredDocuments.map((document:any) => (
                  <tr key={document.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 me-3">
                          {getFileIcon(document.type)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {document.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {document.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-900">
                        {document.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatFileSize(document.size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 me-1" />
                        {new Date(document.uploadDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(document.status)}
                        <span className={`ms-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(document.status)}`}>
                          {t(`doc.status.${(document.status || 'pending').toLowerCase()}`)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => window.open(document.url, '_blank')}
                          className="text-black hover:text-blue-900 flex items-center"
                        >
                          <Eye className="w-4 h-4 me-1" />
                          {t('common:view')}
                        </button>
                        <button
                          onClick={() => window.open(document.url, '_blank')}
                          className="text-red-600 hover:text-red-900 flex items-center"
                        >
                          <Download className="w-4 h-4 me-1" />
                          {t('doc.download')}
                        </button>
                        {document.status !== 'approved' && (
                          <button
                            onClick={() => handleApproveDocument(document)}
                            className="text-red-600 hover:text-red-900 flex items-center"
                          >
                            <CheckCircle className="w-4 h-4 me-1" />
                            {t('common:approve')}
                          </button>
                        )}
                        {document.status !== 'rejected' && (
                          <button
                            onClick={() => handleRejectDocument(document)}
                            className="text-red-600 hover:text-red-900 flex items-center"
                          >
                            <XCircle className="w-4 h-4 me-1" />
                            {t('common:reject')}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
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
                  ? 'text-white bg-black border-black'
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

      {/* Toast Container */}
 
    </div>
  );
}
