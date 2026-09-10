import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock,
  User,
  Mail,
  Phone,
  Calendar,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePermissions } from '../../../../hooks/useProductPermissions';

interface Document {
  id: string;
  name: string;
  type: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: string;
  size: string;
  url: string;
}

export default function KycDocuments() {
  const { hasPermission } = usePermissions();
  const canManage = hasPermission('PORTFOLIO_INVESTOR_MANAGE');
  const { t } = useTranslation('investor');
  const { investorId } = useParams<{ investorId: string }>();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Mock investor data - in real app, fetch from API
  const investorData = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 8900',
    type: t('kycd.typeIndividual'),
    status: 'KYC Pending',
    createdAt: '2024-01-15'
  };

  // Mock documents data
  useEffect(() => {
    const mockDocuments: Document[] = [
      {
        id: '1',
        name: t('kycd.doc.nationalId'),
        type: t('kycd.docType.identity'),
        status: 'pending',
        uploadedAt: '2024-01-15T10:30:00Z',
        size: '2.5 MB',
        url: '/documents/national-id.pdf'
      },
      {
        id: '2',
        name: t('kycd.doc.passport'),
        type: t('kycd.docType.identity'),
        status: 'approved',
        uploadedAt: '2024-01-15T11:15:00Z',
        size: '1.8 MB',
        url: '/documents/passport.pdf'
      },
      {
        id: '3',
        name: t('kycd.doc.addressProof'),
        type: t('kycd.docType.address'),
        status: 'rejected',
        uploadedAt: '2024-01-15T12:00:00Z',
        size: '1.2 MB',
        url: '/documents/address-proof.pdf'
      },
      {
        id: '4',
        name: t('kycd.doc.bankStatement'),
        type: t('kycd.docType.financial'),
        status: 'pending',
        uploadedAt: '2024-01-15T14:30:00Z',
        size: '3.1 MB',
        url: '/documents/bank-statement.pdf'
      }
    ];
    
    setDocuments(mockDocuments);
    setLoading(false);
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setUploading(true);
      // Simulate upload
      setTimeout(() => {
        const newDocument: Document = {
          id: Date.now().toString(),
          name: files[0].name,
          type: t('kycd.docType.uploaded'),
          status: 'pending',
          uploadedAt: new Date().toISOString(),
          size: `${(files[0].size / 1024 / 1024).toFixed(1)} MB`,
          url: URL.createObjectURL(files[0])
        };
        setDocuments(prev => [...prev, newDocument]);
        setUploading(false);
      }, 2000);
    }
  };

  const handleDeleteDocument = (documentId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-red-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-red-100 text-red-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">{t('kycd.loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('kycd.title')}</h1>
              <p className="text-gray-600">{t('kycd.subtitle')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Investor Info Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{investorData.name}</h3>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 me-1" />
                  {investorData.email}
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 me-1" />
                  {investorData.phone}
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 me-1" />
                  {new Date(investorData.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
          <div className="text-end">
            <div className="text-sm text-gray-500">{t('kycd.investorType')}</div>
            <div className="font-medium text-gray-900">{investorData.type}</div>
            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${
              investorData.status === 'KYC Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
            }`}>
              {t('kycd.statusKycPending')}
            </div>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('kycd.uploadTitle')}</h3>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <div className="text-gray-600 mb-4">
            <p className="text-lg font-medium">{t('kycd.uploadHeading')}</p>
            <p className="text-sm">{t('kycd.uploadHint')}</p>
          </div>
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 ${
              uploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {uploading ? t('kycd.uploading') : t('kycd.selectFiles')}
          </label>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{t('kycd.documentsCount', { count: documents.length })}</h3>
        </div>
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
                  {t('common:status')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('kycd.col.size')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('kycd.col.uploaded')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('common:actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {documents.map((document) => (
                <tr key={document.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="w-8 h-8 text-gray-400 me-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{document.name}</div>
                        <div className="text-sm text-gray-500">ID: {document.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{document.type}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(document.status)}
                      <span className={`ms-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
                        {t(`kycd.status.${document.status}`)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {document.size}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(document.uploadedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => window.open(document.url, '_blank')}
                        className="text-black hover:text-blue-900"
                        title={t('kycd.viewDocument')}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => window.open(document.url, '_blank')}
                        className="text-red-600 hover:text-red-900"
                        title={t('kycd.downloadDocument')}
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      {canManage && (
                        <button
                          onClick={() => handleDeleteDocument(document.id)}
                          className="text-red-600 hover:text-red-900"
                          title={t('kycd.deleteDocument')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
