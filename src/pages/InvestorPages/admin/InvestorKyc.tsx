import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';



import { 
  Plus, 
  MoreHorizontal, 
  Download, 
  Eye, 
  Edit, 
  Trash2,
  Search,
  Filter,
  UserCheck,
  Calendar,
  Phone,
  Mail,
  MapPin,
  FileText,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllKycInvestors } from '../../../redux/apis/apisInvestor';

export default function InvestorKyc() {
  const [kycInvestors, setKycInvestors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Pagination logic
  const getCurrentInvestors = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return kycInvestors.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    return Math.ceil(kycInvestors.length / itemsPerPage);
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

  // Filter investors based on search and status
  const filteredInvestors = kycInvestors.filter(investor => {
    const matchesSearch = investor.firstNameInEnglish?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          investor.lastNameInEnglish?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          investor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          investor.nationalId?.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || investor.kycStatus?.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  // Load KYC investors
  const loadKycInvestors = async () => {
    try {
      setLoading(true);
      const result = await getAllKycInvestors();
      if (result.success) {
        setKycInvestors(result.data || []);
      } else {
        toast.error(result.notificationMessage || 'Failed to fetch KYC investors');
      }
    } catch (error: any) {
      toast.error('An error occurred while loading KYC investors');
      console.error('Error loading KYC investors:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKycInvestors();
  }, []);

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

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Investor KYC</h1>
            <p className="mt-2 text-gray-600">Manage individual investor KYC verification</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center">
              <Download className="w-4 h-4 me-2" />
              Export
            </button>
            <Link
              to="/admin/investors/new"
              className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 flex items-center"
            >
              <Plus className="w-4 h-4 me-2" />
              Add Investor
            </Link>
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
                placeholder="Search investors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full ps-10 pe-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* KYC Investors Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Investor
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  National ID
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  KYC Status
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documents
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Loading KYC investors...
                  </td>
                </tr>
              ) : filteredInvestors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No KYC investors found
                  </td>
                </tr>
              ) : (
                filteredInvestors.map((investor) => (
                  <tr key={investor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center me-4">
                          <span className="text-sm font-medium text-gray-700">
                            {investor.firstNameInEnglish?.charAt(0)}{investor.lastNameInEnglish?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {investor.firstNameInEnglish} {investor.lastNameInEnglish}
                          </div>
                          <div className="text-sm text-gray-500">
                            {investor.firstNameInArabic} {investor.lastNameInArabic}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{investor.email}</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Phone className="w-3 h-3 me-1" />
                        {investor.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {investor.nationalId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(investor.kycStatus)}
                        <span className={`ms-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(investor.kycStatus)}`}>
                          {investor.kycStatus || 'Pending'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 me-1" />
                        {investor.kycDocuments?.length || 0} documents
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/admin/investors/kyc-documents/${investor.id}`}
                          className="text-black hover:text-blue-900 flex items-center"
                        >
                          <Eye className="w-4 h-4 me-1" />
                          View
                        </Link>
                        <button className="text-gray-600 hover:text-gray-900 flex items-center">
                          <Edit className="w-4 h-4 me-1" />
                          Edit
                        </button>
                        <button className="text-red-600 hover:text-red-900 flex items-center">
                          <Trash2 className="w-4 h-4 me-1" />
                          Delete
                        </button>
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
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredInvestors.length)} of {filteredInvestors.length} KYC investors
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
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
            Next
          </button>
        </div>
      </div>

      {/* Toast Container */}

    </div>
  );
}
