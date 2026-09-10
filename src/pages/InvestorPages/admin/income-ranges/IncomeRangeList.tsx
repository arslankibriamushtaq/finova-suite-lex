import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Plus, 
  Trash2, 
  Eye, 
  X,
  AlertTriangle,
  Loader2,
  RefreshCw
} from 'lucide-react';
  
import {
  IncomeRange,
  IncomeRangeCreateRequest,
  IncomeRangeUpdateRequest,
  getAllIncomeRanges,
  createIncomeRange,
  updateIncomeRange,
  deleteIncomeRangeById
} from '../../../../redux/apis/apisInvestor';
import toast from 'react-hot-toast';
import { cn } from '../../../../lib/utils';
import Loader from '../../../../components/Loader/Loader';
import { usePermissions } from '../../../../hooks/useProductPermissions';

export default function IncomeRangeList() {
  // Portfolio settings are configuration: reading the list is PORTFOLIO_SETTINGS_READ
  // (which is what put this page in the menu), but changing one needs _MANAGE.
  const { hasPermission } = usePermissions();
  const canManage = hasPermission('PORTFOLIO_SETTINGS_MANAGE');
  const { t } = useTranslation('investor');
  const navigate = useNavigate();
  const [incomeRanges, setIncomeRanges] = useState<IncomeRange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedIncomeRange, setSelectedIncomeRange] = useState<IncomeRange | null>(null);
  
  // Form states
  const [formData, setFormData] = useState<IncomeRangeCreateRequest>({
    minimumAmount: 0,
    maximumAmount: 0
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch income ranges
  const fetchIncomeRanges = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const result = await getAllIncomeRanges(page, pageSize);
      
      if (result.success) {
        setIncomeRanges(result.data);
        setTotalPages(result.pageInfo.totalPages);
        setTotalCount(result.pageInfo.totalCount);
        setCurrentPage(result.pageInfo.page);
      } else {
        throw new Error(result.notificationMessage || t('irl.fetchFail'));
      }
    } catch (err) {
      console.error('Error fetching income ranges:', err);
      const errorMessage = err instanceof Error ? err.message : t('irl.loadFail');
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomeRanges();
  }, []);

  // Filter income ranges based on search term
  const filteredIncomeRanges = incomeRanges.filter(range => 
    range.minimumAmount.toString().includes(searchTerm) ||
    range.maximumAmount.toString().includes(searchTerm)
  );

  // Format currency
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    } else {
      return `$${amount.toLocaleString()}`;
    }
  };

  // Handle create income range
  const handleCreate = async () => {
    try {
      setFormLoading(true);
      setFormError(null);
      
      const result = await createIncomeRange(formData);
      
      if (result.success) {
        toast.success(t('irl.createSuccess'));
        setShowCreateModal(false);
        setFormData({ minimumAmount: 0, maximumAmount: 0 });
        await fetchIncomeRanges(currentPage);
      } else {
        throw new Error(result.notificationMessage || t('irl.createFail'));
      }
    } catch (err) {
      console.error('Error creating income range:', err);
      const errorMessage = err instanceof Error ? err.message : t('irl.createFail');
      setFormError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  // Handle update income range
  const handleUpdate = async () => {
    if (!selectedIncomeRange) return;
    
    try {
      setFormLoading(true);
      setFormError(null);
      
      const updateData: IncomeRangeUpdateRequest = {
        id: selectedIncomeRange.id,
        minimumAmount: formData.minimumAmount,
        maximumAmount: formData.maximumAmount
      };
      
      const result = await updateIncomeRange(updateData);
      
      if (result.success) {
        toast.success(t('irl.updateSuccess'));
        setShowEditModal(false);
        setSelectedIncomeRange(null);
        setFormData({ minimumAmount: 0, maximumAmount: 0 });
        await fetchIncomeRanges(currentPage);
      } else {
        throw new Error(result.notificationMessage || t('irl.updateFail'));
      }
    } catch (err) {
      console.error('Error updating income range:', err);
      const errorMessage = err instanceof Error ? err.message : t('irl.updateFail');
      setFormError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete income range
  const handleDelete = async () => {
    if (!selectedIncomeRange) return;
    
    try {
      setFormLoading(true);
      setFormError(null);
      
      const result = await deleteIncomeRangeById(selectedIncomeRange.id);
      
      if (result.success) {
        toast.success(t('irl.deleteSuccess'));
        setShowDeleteModal(false);
        setSelectedIncomeRange(null);
        await fetchIncomeRanges(currentPage);
      } else {
        throw new Error(result.notificationMessage || t('irl.deleteFail'));
      }
    } catch (err) {
      console.error('Error deleting income range:', err);
      const errorMessage = err instanceof Error ? err.message : t('irl.deleteFail');
      setFormError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  // Handle edit click
  const handleEditClick = (incomeRange: IncomeRange) => {
    setSelectedIncomeRange(incomeRange);
    setFormData({
      minimumAmount: incomeRange.minimumAmount,
      maximumAmount: incomeRange.maximumAmount
    });
    setShowEditModal(true);
  };

  // Handle view click
  const handleViewClick = (id: string) => {
    navigate(`/InvestorDashboard/SystemSettings/IncomeRanges/View/${id}`);
  };

  // Handle delete click
  const handleDeleteClick = (incomeRange: IncomeRange) => {
    setSelectedIncomeRange(incomeRange);
    setShowDeleteModal(true);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchIncomeRanges(page);
  };

  return (
    <div className="p-2">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('irl.title')}</h1>
            <p className="text-gray-600">{t('irl.subtitle')}</p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => fetchIncomeRanges(currentPage)}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4 me-2" />
              {t('common:refresh')}
            </button>
            {canManage && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800"
              >
                <Plus className="w-4 h-4 me-2" />
                {t('irl.addIncomeRange')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 me-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('irl.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ps-10 pe-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent w-64"
            />
          </div>
        </div>
        <div className="text-sm text-gray-500">
          {t('irl.countLabel', { shown: filteredIncomeRanges.length, total: totalCount })}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader />
            <p className="text-gray-600">{t('irl.loading')}</p>
          </div>
        </div>
      )}

      {/* Income Ranges Table */}
      {!loading && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('irl.col.minAmount')}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('irl.col.maxAmount')}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('irl.col.created')}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('irl.col.updated')}
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">{t('common:actions')}</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredIncomeRanges.map((incomeRange) => (
                  <tr key={incomeRange.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="font-medium text-red-600">
                        {incomeRange.minimumAmount}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="font-medium text-black">
                        {incomeRange.maximumAmount}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(incomeRange.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(incomeRange.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleViewClick(incomeRange.id)}
                          className="text-black hover:text-blue-900"
                          title={t('irl.viewDetails')}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canManage && (
                          <button
                            onClick={() => handleDeleteClick(incomeRange)}
                            className="text-red-600 hover:text-red-900"
                            title={t('irl.deleteTitle')}
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
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {t('irl.showingResults', { from: ((currentPage - 1) * pageSize) + 1, to: Math.min(currentPage * pageSize, totalCount), total: totalCount })}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('common:previous')}
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={cn(
                  'px-3 py-2 text-sm font-medium rounded-lg',
                  page === currentPage
                    ? 'text-white bg-black border border-black'
                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                )}
              >
                {page}
              </button>
            ))}
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('common:next')}
            </button>
          </div>
        </div>
      )}

      {/* Create Income Range Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">{t('irl.createTitle')}</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center">
                  <AlertTriangle className="w-4 h-4 text-red-500 me-2" />
                  <p className="text-red-700 text-sm">{formError}</p>
                </div>
              </div>
            )}

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('irl.minAmountRequired')}</label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.minimumAmount || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({ ...formData, minimumAmount: value ? Number(value) : 0 });
                    }}
                    className="w-full px-3 py-2 pe-16 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 font-medium"
                    placeholder="100"
                    min="0"
                    step="1"
                  />
                  <div className="absolute inset-y-0 right-0 pe-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm font-medium">USD</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('irl.maxAmountRequired')}</label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.maximumAmount || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({ ...formData, maximumAmount: value ? Number(value) : 0 });
                    }}
                    className="w-full px-3 py-2 pe-16 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 font-medium"
                    placeholder="100000"
                    min="0"
                    step="1"
                  />
                  <div className="absolute inset-y-0 right-0 pe-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm font-medium">USD</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {t('common:cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={formLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-black border border-black rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formLoading ? (
                    <div className="flex items-center">
                      <Loader2 className="w-4 h-4 animate-spin me-2" />
                      {t('irl.creating')}
                    </div>
                  ) : (
                    t('irl.createBtn')
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Income Range Modal */}
      {showEditModal && selectedIncomeRange && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">{t('irl.editTitle')}</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center">
                  <AlertTriangle className="w-4 h-4 text-red-500 me-2" />
                  <p className="text-red-700 text-sm">{formError}</p>
                </div>
              </div>
            )}

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('irl.minAmountRequired')}</label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.minimumAmount || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({ ...formData, minimumAmount: value ? Number(value) : 0 });
                    }}
                    className="w-full px-3 py-2 pe-16 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 font-medium"
                    placeholder="100"
                    min="0"
                    step="1"
                  />
                  <div className="absolute inset-y-0 right-0 pe-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm font-medium">USD</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('irl.maxAmountRequired')}</label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.maximumAmount || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({ ...formData, maximumAmount: value ? Number(value) : 0 });
                    }}
                    className="w-full px-3 py-2 pe-16 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 font-medium"
                    placeholder="100000"
                    min="0"
                    step="1"
                  />
                  <div className="absolute inset-y-0 right-0 pe-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm font-medium">USD</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {t('common:cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleUpdate}
                  disabled={formLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-black border border-black rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formLoading ? (
                    <div className="flex items-center">
                      <Loader2 className="w-4 h-4 animate-spin me-2" />
                      {t('irl.updating')}
                    </div>
                  ) : (
                    t('irl.updateBtn')
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Income Range Modal */}
      {showViewModal && selectedIncomeRange && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">{t('irl.detailsTitle')}</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('irl.label.id')}</label>
                <p className="text-sm text-gray-900">{selectedIncomeRange.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('irl.col.minAmount')}</label>
                <p className="text-lg font-semibold text-red-600">{selectedIncomeRange.minimumAmount}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('irl.col.maxAmount')}</label>
                <p className="text-lg font-semibold text-black">{selectedIncomeRange.maximumAmount}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('common:createdAt')}</label>
                <p className="text-sm text-gray-900">
                  {new Date(selectedIncomeRange.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('common:updatedAt')}</label>
                <p className="text-sm text-gray-900">
                  {new Date(selectedIncomeRange.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {t('common:close')}
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  handleEditClick(selectedIncomeRange);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-black border border-black rounded-lg hover:bg-gray-800"
              >
                {t('irl.editBtn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedIncomeRange && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{t('irl.deleteTitle')}</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center">
                  <AlertTriangle className="w-4 h-4 text-red-500 me-2" />
                  <p className="text-red-700 text-sm">{formError}</p>
                </div>
              </div>
            )}

            <div className="mb-6">
              <p className="text-sm text-gray-600">
                {t('irl.deleteConfirm', { range: `${formatCurrency(selectedIncomeRange.minimumAmount)} - ${formatCurrency(selectedIncomeRange.maximumAmount)}` })}
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {t('common:cancel')}
              </button>
              <button
                onClick={handleDelete}
                disabled={formLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="w-4 h-4 animate-spin me-2" />
                    {t('irl.deleting')}
                  </div>
                ) : (
                  t('irl.deleteBtn')
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
