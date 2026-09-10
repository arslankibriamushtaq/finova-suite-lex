import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  X,
  Loader2,
  Clock,
} from 'lucide-react';
import TableView from '../../../../components/TableView/TableView';
import { Button } from '../../../../components/ui/button';
import { EmptyState } from '../../../../components/shared/detailKit';
import { LexNotice, LexPageHeader, LexSearch } from '../../../../components/shared/lexKit';
import { usePermissions } from '../../../../hooks/useProductPermissions';
import {
  getAllInvestmentTimeline,
  createInvestmentTimeline,
  updateInvestmentTimeline,
  getInvestmentTimelineById,
  deleteInvestmentTimelineById,
  InvestmentTimeline,
  InvestmentTimelineCreateRequest,
  InvestmentTimelineUpdateRequest
} from '../../../../redux/apis/apisInvestor';
import toast from 'react-hot-toast';

export default function InvestmentTimelineList() {
  // Portfolio settings are configuration: reading the list is PORTFOLIO_SETTINGS_READ
  // (which is what put this page in the menu), but changing one needs _MANAGE.
  const { hasPermission } = usePermissions();
  const canManage = hasPermission('PORTFOLIO_SETTINGS_MANAGE');
  const { t } = useTranslation('investor');
  const [investmentTimelines, setInvestmentTimelines] = useState<InvestmentTimeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedInvestmentTimeline, setSelectedInvestmentTimeline] = useState<InvestmentTimeline | null>(null);
  const [formData, setFormData] = useState<InvestmentTimelineCreateRequest>({
    timeline: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch investment timelines
  const fetchInvestmentTimelines = async () => {
    try {
      setLoading(true);
      const response = await getAllInvestmentTimeline(currentPage, pageSize);
      if (response.success) {
        setInvestmentTimelines(response.data);
        setTotalPages(response.pageInfo.totalPages);
        setTotalCount(response.pageInfo.totalCount);
      } else {
        setError(t('itl.fetchFail'));
      }
    } catch (err) {
      setError(t('itl.fetchError'));
   
    } finally {
      setLoading(false);
    }
  };

  // Page size belongs in here with the page number: both change what the
  // server is being asked for, and only one of them used to trigger a fetch.
  useEffect(() => {
    fetchInvestmentTimelines();
  }, [currentPage, pageSize]);

  // Handle create
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      const response = await createInvestmentTimeline(formData);
      if (response.success) {
        toast.success(t('itl.createSuccess'));
        setShowCreateModal(false);
        setFormData({ timeline: '' });
        fetchInvestmentTimelines();
      } else {
        toast.error(response.notificationMessage || t('itl.createFail'));
      }
    } catch (err) {
      toast.error(t('itl.createError'));
      console.error('Error creating investment timeline:', err);
    } finally {
      setFormLoading(false);
    }
  };

  // Handle update
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvestmentTimeline) return;
    
    try {
      setFormLoading(true);
      const updateData: InvestmentTimelineUpdateRequest = {
        id: selectedInvestmentTimeline.id,
        timeline: formData.timeline
      };
      
      const response = await updateInvestmentTimeline(updateData);
      if (response.success) {
        toast.success(response.notificationMessage || t('itl.updateSuccess'));
        setShowEditModal(false);
        setFormData({ timeline: '' });
        fetchInvestmentTimelines();
      } else {
        toast.error(response.notificationMessage || t('itl.updateFail'));
      }
    } catch (err) {
      toast.error(t('itl.updateError'));
      console.error('Error updating investment timeline:', err);
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedInvestmentTimeline) return;
    try {
      setFormLoading(true);
      const response = await deleteInvestmentTimelineById(selectedInvestmentTimeline.id);
      if (response.success) {
        toast.success(t('itl.deleteSuccess'));
        setShowDeleteModal(false);
        fetchInvestmentTimelines();
      } else {
        toast.error(response.notificationMessage || t('itl.deleteFail'));
      }
    } catch (err) {
      toast.error(t('itl.deleteError'));
      console.error('Error deleting investment timeline:', err);
    } finally {
      setFormLoading(false);
    }
  };

  // Handle edit click
  const handleEditClick = async (id: string) => {
    try {
      const response = await getInvestmentTimelineById(id);
      if (response.success) {
        setSelectedInvestmentTimeline(response.data);
        setFormData({
          timeline: response.data.timeline
        });
        setShowEditModal(true);
      } else {
        toast.error(t('itl.detailsFail'));
      }
    } catch (err) {
      toast.error(t('itl.detailsError'));
      console.error('Error fetching investment timeline details:', err);
    }
  };

  // Handle view click
  const handleViewClick = async (id: string) => {
    try {
      const response = await getInvestmentTimelineById(id);
      if (response.success) {
        setSelectedInvestmentTimeline(response.data);
        setShowViewModal(true);
      } else {
        toast.error(t('itl.detailsFail'));
      }
    } catch (err) {
      toast.error(t('itl.detailsError'));
      console.error('Error fetching investment timeline details:', err);
    }
  };

  // Handle delete click
  const handleDeleteClick = (investmentTimeline: InvestmentTimeline) => {
    setSelectedInvestmentTimeline(investmentTimeline);
    setShowDeleteModal(true);
  };

  // Filter investment timelines based on search term
  const filteredInvestmentTimelines = investmentTimelines.filter(investmentTimeline =>
    investmentTimeline.timeline.toLowerCase().includes(searchTerm.toLowerCase())
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

  const timelineHeaders = [
    {
      name: t('itl.col.timeline'),
      cell: (row: InvestmentTimeline) => (
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="pro-head-badge">
            <Clock className="h-4 w-4" />
          </span>
          <span className="truncate text-sm font-medium text-foreground">{row.timeline}</span>
        </span>
      ),
      width: '320px',
    },
    { name: t('irl.col.created'), cell: (row: InvestmentTimeline) => stampCell(row.createdAt) },
    { name: t('irl.col.updated'), cell: (row: InvestmentTimeline) => stampCell(row.updatedAt) },
    {
      name: t('common:actions'),
      cell: (row: InvestmentTimeline) => (
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
      <LexPageHeader icon={Clock} title={t('itl.title')} subtitle={t('itl.subtitle')}>
        {canManage && (
          <Button size="sm" onClick={() => setShowCreateModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            {t('itl.addBtn')}
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
            <Button variant="outline" size="sm" onClick={fetchInvestmentTimelines}>
              {t('common:tryAgain')}
            </Button>
          </span>
        </LexNotice>
      )}

      <div className="pro-card p-3 mb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <LexSearch
            id="investment-timeline-search"
            className="flex-1"
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder={t('itl.searchPlaceholder')}
          />
          <span className="whitespace-nowrap text-xs text-muted-foreground">
            {t('itl.countLabel', {
              shown: filteredInvestmentTimelines.length,
              total: totalCount,
            })}
          </span>
        </div>
      </div>

      <div className="pro-card p-4">
        {!loading && filteredInvestmentTimelines.length === 0 ? (
          <EmptyState icon={Clock} text={t('common:noData')} />
        ) : (
          <TableView
            header={timelineHeaders}
            data={filteredInvestmentTimelines}
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


      {/* Create Investment Timeline Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">{t('itl.createTitle')}</h3>
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
                  {t('itl.timelinePeriod')}
                </label>
                <input
                  type="text"
                  value={formData.timeline}
                  onChange={(e) => setFormData({
                    ...formData,
                    timeline: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 font-medium"
                  placeholder={t('itl.enterTimeline')}
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
                      {t('itl.creating')}
                    </div>
                  ) : (
                    t('itl.createBtn')
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Investment Timeline Modal */}
      {showEditModal && selectedInvestmentTimeline && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">{t('itl.editTitle')}</h3>
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
                  {t('itl.timelinePeriod')}
                </label>
                <input
                  type="text"
                  value={formData.timeline}
                  onChange={(e) => setFormData({
                    ...formData,
                    timeline: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 font-medium"
                  placeholder={t('itl.enterTimeline')}
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
                      {t('itl.updating')}
                    </div>
                  ) : (
                    t('itl.updateBtn')
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Investment Timeline Modal */}
      {showViewModal && selectedInvestmentTimeline && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">{t('itl.detailsTitle')}</h3>
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
                <p className="text-sm text-gray-900">{selectedInvestmentTimeline.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('itl.timelinePeriod')}</label>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-gray-700 me-2" />
                  <p className="text-lg font-semibold text-gray-900">{selectedInvestmentTimeline.timeline}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('common:createdAt')}</label>
                <p className="text-sm text-gray-900">
                  {new Date(selectedInvestmentTimeline.createdAt).toLocaleDateString('en-US', {
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
                  {new Date(selectedInvestmentTimeline.updatedAt).toLocaleDateString('en-US', {
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
      {showDeleteModal && selectedInvestmentTimeline && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">{t('itl.deleteTitle')}</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                {t('itl.deleteConfirm')}
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-gray-700 me-2" />
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">{t('itl.timelineLabel')}</span> {selectedInvestmentTimeline.timeline}
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
                    {t('itl.deleting')}
                  </div>
                ) : (
                  t('itl.deleteBtn')
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
