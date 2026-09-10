import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  X,
  Loader2,
  Briefcase,
} from 'lucide-react';
import TableView from '../../../../components/TableView/TableView';
import { Button } from '../../../../components/ui/button';
import { EmptyState } from '../../../../components/shared/detailKit';
import { LexNotice, LexPageHeader, LexSearch } from '../../../../components/shared/lexKit';
import { usePermissions } from '../../../../hooks/useProductPermissions';
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
  const [pageSize, setPageSize] = useState(10);
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

  // Page size belongs in here with the page number: both change what the
  // server is being asked for, and only one of them used to trigger a fetch.
  useEffect(() => {
    fetchInvestmentExperiences();
  }, [currentPage, pageSize]);

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

  const stampCell = (value: string) =>
    value ? (
      <span className="whitespace-nowrap text-xs text-muted-foreground">
        {new Date(value).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </span>
    ) : (
      <span className="text-xs text-muted-foreground">—</span>
    );

  const experienceHeaders = [
    {
      name: t('ixp.col.experience'),
      cell: (row: InvestmentExperience) => (
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="pro-head-badge">
            <Briefcase className="h-4 w-4" />
          </span>
          <span className="truncate text-sm font-medium text-foreground">{row.experience}</span>
        </span>
      ),
      width: '320px',
    },
    { name: t('irl.col.created'), cell: (row: InvestmentExperience) => stampCell(row.createdAt) },
    { name: t('irl.col.updated'), cell: (row: InvestmentExperience) => stampCell(row.updatedAt) },
    {
      name: t('common:actions'),
      cell: (row: InvestmentExperience) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => handleViewClick(row.id)}
            title={t('irl.viewDetails')}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {canManage && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleEditClick(row.id)}
                title={t('common:edit')}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                onClick={() => handleDeleteClick(row)}
                title={t('common:delete')}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      ),
      width: '150px',
    },
  ];

  return (
    <div className="service">
      <LexPageHeader icon={Briefcase} title={t('ixp.title')} subtitle={t('ixp.subtitle')}>
        {canManage && (
          <Button size="sm" onClick={() => setShowCreateModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            {t('ixp.addBtn')}
          </Button>
        )}
      </LexPageHeader>

      {/* Loading and failure used to REPLACE the page — header, Add button and
          all — so a failed load left a red box with a retry and nothing else,
          and a slow one blanked the screen. Both are states inside the page
          now. */}
      {error && (
        <LexNotice tone="red">
          <span className="flex flex-wrap items-center gap-3">
            {error}
            <Button variant="outline" size="sm" onClick={fetchInvestmentExperiences}>
              {t('common:tryAgain')}
            </Button>
          </span>
        </LexNotice>
      )}

      <div className="pro-card p-3 mb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <LexSearch
            id="investment-experience-search"
            className="flex-1"
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder={t('ixp.searchPlaceholder')}
          />
          <span className="whitespace-nowrap text-xs text-muted-foreground">
            {t('ixp.countLabel', {
              shown: filteredInvestmentExperiences.length,
              total: totalCount,
            })}
          </span>
        </div>
      </div>

      <div className="pro-card p-4">
        {!loading && filteredInvestmentExperiences.length === 0 ? (
          <EmptyState icon={Briefcase} text={t('common:noData')} />
        ) : (
          <TableView
            header={experienceHeaders}
            data={filteredInvestmentExperiences}
            isLoading={loading}
            totalRows={totalCount}
            totalPage={totalPages}
            page={currentPage}
            setPage={handlePageChange}
            pageSize={pageSize}
            setPageSize={(size: number) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
            from={totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            to={Math.min(currentPage * pageSize, totalCount)}
          />
        )}
      </div>


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
