import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  X, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  Briefcase
} from 'lucide-react';
import {
  getAllInvestmentExperience,
  createInvestmentExperience,
  updateInvestmentExperience,
  getInvestmentExperienceById,
  deleteInvestmentExperienceById,
  InvestmentExperience,
  InvestmentExperienceCreateRequest,
  InvestmentExperienceUpdateRequest
} from '../../../../redux/apis/apisInvestor';
import toast from 'react-hot-toast';
import Loader from '../../../../components/Loader/Loader';
import { usePermissions } from '../../../../hooks/useProductPermissions';

export default function InvestmentExperienceList() {
  // Portfolio settings are configuration: reading the list is PORTFOLIO_SETTINGS_READ
  // (which is what put this page in the menu), but changing one needs _MANAGE.
  const { hasPermission } = usePermissions();
  const canManage = hasPermission('PORTFOLIO_SETTINGS_MANAGE');
  const { t } = useTranslation('investor');
  const [investmentExperiences, setInvestmentExperiences] = useState<InvestmentExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedInvestmentExperience, setSelectedInvestmentExperience] = useState<InvestmentExperience | null>(null);
  const [formData, setFormData] = useState<InvestmentExperienceCreateRequest>({
    experience: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch investment experiences
  const fetchInvestmentExperiences = async () => {
    try {
      setLoading(true);
      const response = await getAllInvestmentExperience(currentPage, pageSize);
      if (response.success) {
        setInvestmentExperiences(response.data);
        setTotalPages(response.pageInfo.totalPages);
        setTotalCount(response.pageInfo.totalCount);
      } else {
        setError(t('ixp.fetchFail'));
      }
    } catch (err) {
      setError(t('ixp.fetchError'));
      console.error('Error fetching investment experiences:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestmentExperiences();
  }, [currentPage]);

  // Handle create
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      const response = await createInvestmentExperience(formData);
      if (response.success) {
        toast.success(t('ixp.createSuccess'));
        setShowCreateModal(false);
        setFormData({ experience: '' });
        fetchInvestmentExperiences();
      } else {
        toast.error(response.notificationMessage || t('ixp.createFail'));
      }
    } catch (err) {
      toast.error(t('ixp.createError'));
      console.error('Error creating investment experience:', err);
    } finally {
      setFormLoading(false);
    }
  };

  // Handle update
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvestmentExperience) return;
    
    try {
      setFormLoading(true);
      const updateData: InvestmentExperienceUpdateRequest = {
        id: selectedInvestmentExperience.id,
        experience: formData.experience
      };
      
      const response = await updateInvestmentExperience(updateData);
      if (response.success) {
        toast.success(t('ixp.updateSuccess'));
        setShowEditModal(false);
        setFormData({ experience: '' });
        fetchInvestmentExperiences();
      } else {
        toast.error(response.notificationMessage || t('ixp.updateFail'));
      }
    } catch (err) {
      toast.error(t('ixp.updateError'));
      console.error('Error updating investment experience:', err);
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedInvestmentExperience) return;
    
    try {
      setFormLoading(true);
      const response = await deleteInvestmentExperienceById(selectedInvestmentExperience.id);
      if (response.success) {
        toast.success(t('ixp.deleteSuccess'));
        setShowDeleteModal(false);
        fetchInvestmentExperiences();
      } else {
        toast.error(response.notificationMessage || t('ixp.deleteFail'));
      }
    } catch (err) {
      toast.error(t('ixp.deleteError'));
      console.error('Error deleting investment experience:', err);
    } finally {
      setFormLoading(false);
    }
  };

  // Handle edit click
  const handleEditClick = async (id: string) => {
    try {
      const response = await getInvestmentExperienceById(id);
      if (response.success) {
        setSelectedInvestmentExperience(response.data);
        setFormData({
          experience: response.data.experience
        });
        setShowEditModal(true);
      } else {
        toast.error(t('ixp.detailsFail'));
      }
    } catch (err) {
      toast.error(t('ixp.detailsError'));
      console.error('Error fetching investment experience details:', err);
    }
  };

  // Handle view click
  const handleViewClick = async (id: string) => {
    try {
      const response = await getInvestmentExperienceById(id);
      if (response.success) {
        setSelectedInvestmentExperience(response.data);
        setShowViewModal(true);
      } else {
        toast.error(t('ixp.detailsFail'));
      }
    } catch (err) {
      toast.error(t('ixp.detailsError'));
      console.error('Error fetching investment experience details:', err);
    }
  };

  // Handle delete click
  const handleDeleteClick = (investmentExperience: InvestmentExperience) => {
    setSelectedInvestmentExperience(investmentExperience);
    setShowDeleteModal(true);
  };

  // Filter investment experiences based on search term
  const filteredInvestmentExperiences = investmentExperiences.filter(investmentExperience =>
    investmentExperience.experience.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 text-sm font-medium rounded-lg ${
            currentPage === i
              ? 'bg-black text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader />
        <span className="ms-2 text-gray-600">{t('ixp.loading')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchInvestmentExperiences}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          {t('iil.retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('ixp.title')}</h1>
          <p className="text-gray-600">{t('ixp.subtitle')}</p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            <Plus className="w-4 h-4 me-2" />
            {t('ixp.addBtn')}
          </button>
        )}
      </div>

      {/* Search and Stats */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('ixp.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ps-10 pe-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="text-sm text-gray-600">
          {t('ixp.countLabel', { shown: filteredInvestmentExperiences.length, total: totalCount })}
        </div>
      </div>

      {/* Investment Experiences Table */}
      {!loading && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('ixp.col.experience')}
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
                {filteredInvestmentExperiences.map((investmentExperience) => (
                  <tr key={investmentExperience.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Briefcase className="w-5 h-5 text-gray-700 me-3" />
                        <span className="text-sm font-medium text-gray-900">
                          {investmentExperience.experience}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(investmentExperience.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(investmentExperience.updatedAt).toLocaleDateString('en-US', {
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
                          onClick={() => handleViewClick(investmentExperience.id)}
                          className="text-black hover:text-blue-900"
                          title={t('irl.viewDetails')}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canManage && (
                          <button
                            onClick={() => handleEditClick(investmentExperience.id)}
                            className="text-yellow-600 hover:text-yellow-900"
                            title={t('common:edit')}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {canManage && (
                          <button
                            onClick={() => handleDeleteClick(investmentExperience)}
                            className="text-red-600 hover:text-red-900"
                            title={t('common:delete')}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('common:previous')}
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ms-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('common:next')}
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    {t('iil.showingPage', { current: currentPage, total: totalPages })}
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    {renderPagination()}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Investment Experience Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">{t('ixp.createTitle')}</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('ixp.experienceLevel')}
                </label>
                <input
                  type="text"
                  value={formData.experience}
                  onChange={(e) => setFormData({
                    ...formData,
                    experience: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 font-medium"
                  placeholder={t('ixp.enterExperience')}
                  required
                />
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
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {formLoading ? (
                    <div className="flex items-center">
                      <Loader2 className="w-4 h-4 animate-spin me-2" />
                      {t('ixp.creating')}
                    </div>
                  ) : (
                    t('ixp.createBtn')
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Investment Experience Modal */}
      {showEditModal && selectedInvestmentExperience && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">{t('ixp.editTitle')}</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('ixp.experienceLevel')}
                </label>
                <input
                  type="text"
                  value={formData.experience}
                  onChange={(e) => setFormData({
                    ...formData,
                    experience: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 font-medium"
                  placeholder={t('ixp.enterExperience')}
                  required
                />
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
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {formLoading ? (
                    <div className="flex items-center">
                      <Loader2 className="w-4 h-4 animate-spin me-2" />
                      {t('ixp.updating')}
                    </div>
                  ) : (
                    t('ixp.updateBtn')
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Investment Experience Modal */}
      {showViewModal && selectedInvestmentExperience && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">{t('ixp.detailsTitle')}</h3>
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
                <p className="text-sm text-gray-900">{selectedInvestmentExperience.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('ixp.experienceLevel')}</label>
                <div className="flex items-center">
                  <Briefcase className="w-5 h-5 text-gray-700 me-2" />
                  <p className="text-lg font-semibold text-gray-900">{selectedInvestmentExperience.experience}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('common:createdAt')}</label>
                <p className="text-sm text-gray-900">
                  {new Date(selectedInvestmentExperience.createdAt).toLocaleDateString('en-US', {
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
                  {new Date(selectedInvestmentExperience.updatedAt).toLocaleDateString('en-US', {
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

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {t('common:close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedInvestmentExperience && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">{t('ixp.deleteTitle')}</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                {t('ixp.deleteConfirm')}
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Briefcase className="w-5 h-5 text-gray-700 me-2" />
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">{t('ixp.experienceLabel')}</span> {selectedInvestmentExperience.experience}
                  </p>
                </div>
              </div>
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
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {formLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="w-4 h-4 animate-spin me-2" />
                    {t('ixp.deleting')}
                  </div>
                ) : (
                  t('ixp.deleteBtn')
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
