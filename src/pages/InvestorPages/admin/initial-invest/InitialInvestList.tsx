import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  X,
  Loader2,
  Coins,
} from 'lucide-react';
import TableView from '../../../../components/TableView/TableView';
import { Button } from '../../../../components/ui/button';
import { EmptyState } from '../../../../components/shared/detailKit';
import { LexNotice, LexPageHeader, LexSearch } from '../../../../components/shared/lexKit';
import { usePermissions } from '../../../../hooks/useProductPermissions';
import {
  getAllInitialInvest,
  createInitialInvest,
  updateInitialInvest,
  getInitialInvestById,
  deleteInitialInvestById,
  InitialInvest,
  InitialInvestCreateRequest,
  InitialInvestUpdateRequest
} from '../../../../redux/apis/apisInvestor';
import toast from 'react-hot-toast';

export default function InitialInvestList() {
  // Portfolio settings are configuration: reading the list is PORTFOLIO_SETTINGS_READ
  // (which is what put this page in the menu), but changing one needs _MANAGE.
  const { hasPermission } = usePermissions();
  const canManage = hasPermission('PORTFOLIO_SETTINGS_MANAGE');
  const { t } = useTranslation('investor');
  const [initialInvests, setInitialInvests] = useState<InitialInvest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedInitialInvest, setSelectedInitialInvest] = useState<InitialInvest | null>(null);
  const [formData, setFormData] = useState<InitialInvestCreateRequest>({
    minimumAmount: 0,
    maximumAmount: 0
  });
  const [formLoading, setFormLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch initial invests
  const fetchInitialInvests = async () => {
    try {
      setLoading(true);
      const response = await getAllInitialInvest(currentPage, pageSize);
      if (response.success) {
        setInitialInvests(response.data);
        setTotalPages(response.pageInfo.totalPages);
        setTotalCount(response.pageInfo.totalCount);
      } else {
        setError(t('iil.fetchFail'));
      }
    } catch (err) {
      setError(t('iil.fetchError'));

    } finally {
      setLoading(false);
    }
  };

  // Page size belongs in here with the page number: both change what the
  // server is being asked for, and only one of them used to trigger a fetch.
  useEffect(() => {
    fetchInitialInvests();
  }, [currentPage, pageSize]);

  // Handle create
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      const response = await createInitialInvest(formData);
      if (response.success) {
        toast.success(t('iil.createSuccess'));
        setShowCreateModal(false);
        setFormData({ minimumAmount: 0, maximumAmount: 0 });
        fetchInitialInvests();
      } else {
        toast.error(response.notificationMessage || t('iil.createFail'));
      }
    } catch (err) {
      toast.error(t('iil.createError'));
   
    } finally {
      setFormLoading(false);
    }
  };

  // Handle update
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInitialInvest) return;
    
    try {
      setFormLoading(true);
      const updateData: InitialInvestUpdateRequest = {
        id: selectedInitialInvest.id,
        minimumAmount: formData.minimumAmount,
        maximumAmount: formData.maximumAmount
      };
      
      const response = await updateInitialInvest(updateData);
      if (response.success) {
        toast.success(t('iil.updateSuccess'));
        setShowEditModal(false);
        setFormData({ minimumAmount: 0, maximumAmount: 0 });
        fetchInitialInvests();
      } else {
        toast.error(response.notificationMessage || t('iil.updateFail'));
      }
    } catch (err) {
      toast.error(t('iil.updateError'));
      console.error('Error updating initial invest:', err);
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedInitialInvest) return;
    
    try {
      setFormLoading(true);
      const response = await deleteInitialInvestById(selectedInitialInvest.id);
      if (response.success) {
        toast.success(t('iil.deleteSuccess'));
        setShowDeleteModal(false);
        fetchInitialInvests();
      } else {
        toast.error(response.notificationMessage || t('iil.deleteFail'));
      }
    } catch (err) {
      toast.error(t('iil.deleteError'));
      console.error('Error deleting initial invest:', err);
    } finally {
      setFormLoading(false);
    }
  };

  // Handle edit click
  const handleEditClick = async (id: string) => {
    try {
      const response = await getInitialInvestById(id);
      if (response.success) {
        setSelectedInitialInvest(response.data);
        setFormData({
          minimumAmount: response.data.minimumAmount,
          maximumAmount: response.data.maximumAmount
        });
        setShowEditModal(true);
      } else {
        toast.error(t('iil.detailsFail'));
      }
    } catch (err) {
      toast.error(t('iil.detailsError'));
      console.error('Error fetching initial invest details:', err);
    }
  };

  // Handle view click
  const handleViewClick = async (id: string) => {
    try {
      const response = await getInitialInvestById(id);
      if (response.success) {
        setSelectedInitialInvest(response.data);
        setShowViewModal(true);
      } else {
        toast.error(t('iil.detailsFail'));
      }
    } catch (err) {
      toast.error(t('iil.detailsError'));
      console.error('Error fetching initial invest details:', err);
    }
  };

  // Handle delete click
  const handleDeleteClick = (initialInvest: InitialInvest) => {
    setSelectedInitialInvest(initialInvest);
    setShowDeleteModal(true);
  };

  // Filter initial invests based on search term
  const filteredInitialInvests = initialInvests.filter(initialInvest =>
    initialInvest.minimumAmount.toString().includes(searchTerm) ||
    initialInvest.maximumAmount.toString().includes(searchTerm)
  );

  // Pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  /** Both bounds are the same kind of figure, so both are typeset the same. */
  const amountCell = (value: number) => (
    <span className="font-mono text-sm tabular-nums text-foreground">
      {Number(value ?? 0).toLocaleString()}
    </span>
  );

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

  const initialInvestHeaders = [
    {
      name: t('irl.col.minAmount'),
      cell: (row: InitialInvest) => amountCell(row.minimumAmount),
      width: '180px',
    },
    {
      name: t('irl.col.maxAmount'),
      cell: (row: InitialInvest) => amountCell(row.maximumAmount),
      width: '180px',
    },
    { name: t('irl.col.created'), cell: (row: InitialInvest) => stampCell(row.createdAt) },
    { name: t('irl.col.updated'), cell: (row: InitialInvest) => stampCell(row.updatedAt) },
    {
      name: t('common:actions'),
      cell: (row: InitialInvest) => (
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
      <LexPageHeader icon={Coins} title={t('iil.title')} subtitle={t('iil.subtitle')}>
        {canManage && (
          <Button size="sm" onClick={() => setShowCreateModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            {t('iil.addBtn')}
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
            <Button variant="outline" size="sm" onClick={fetchInitialInvests}>
              {t('iil.retry')}
            </Button>
          </span>
        </LexNotice>
      )}

      <div className="pro-card p-3 mb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <LexSearch
            id="initial-invest-search"
            className="flex-1"
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder={t('iil.searchPlaceholder')}
          />
          <span className="whitespace-nowrap text-xs text-muted-foreground">
            {t('iil.countLabel', { shown: filteredInitialInvests.length, total: totalCount })}
          </span>
        </div>
      </div>

      <div className="pro-card p-4">
        {!loading && filteredInitialInvests.length === 0 ? (
          <EmptyState icon={Coins} text={t('common:noData')} />
        ) : (
          <TableView
            header={initialInvestHeaders}
            data={filteredInitialInvests}
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


      {/* Create Initial Invest Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">{t('iil.createTitle')}</h3>
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
                  {t('irl.col.minAmount')}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.minimumAmount || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      minimumAmount: e.target.value ? Number(e.target.value) : 0
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 font-medium"
                    placeholder={t('iil.enterMin')}
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pe-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm font-medium">USD</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('irl.col.maxAmount')}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.maximumAmount || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      maximumAmount: e.target.value ? Number(e.target.value) : 0
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 font-medium"
                    placeholder={t('iil.enterMax')}
                    required
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
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {formLoading ? (
                    <div className="flex items-center">
                      <Loader2 className="w-4 h-4 animate-spin me-2" />
                      {t('iil.creating')}
                    </div>
                  ) : (
                    t('iil.createBtn')
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Initial Invest Modal */}
      {showEditModal && selectedInitialInvest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">{t('iil.editTitle')}</h3>
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
                  {t('irl.col.minAmount')}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.minimumAmount || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      minimumAmount: e.target.value ? Number(e.target.value) : 0
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 font-medium"
                    placeholder={t('iil.enterMin')}
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pe-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm font-medium">USD</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('irl.col.maxAmount')}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.maximumAmount || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      maximumAmount: e.target.value ? Number(e.target.value) : 0
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 font-medium"
                    placeholder={t('iil.enterMax')}
                    required
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
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {formLoading ? (
                    <div className="flex items-center">
                      <Loader2 className="w-4 h-4 animate-spin me-2" />
                      {t('iil.updating')}
                    </div>
                  ) : (
                    t('iil.updateBtn')
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Initial Invest Modal */}
      {showViewModal && selectedInitialInvest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">{t('iil.detailsTitle')}</h3>
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
                <p className="text-sm text-gray-900">{selectedInitialInvest.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('irl.col.minAmount')}</label>
                <p className="text-lg font-semibold text-red-600">{selectedInitialInvest.minimumAmount}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('irl.col.maxAmount')}</label>
                <p className="text-lg font-semibold text-black">{selectedInitialInvest.maximumAmount}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('common:createdAt')}</label>
                <p className="text-sm text-gray-900">
                  {new Date(selectedInitialInvest.createdAt).toLocaleDateString('en-US', {
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
                  {new Date(selectedInitialInvest.updatedAt).toLocaleDateString('en-US', {
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
      {showDeleteModal && selectedInitialInvest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">{t('iil.deleteTitle')}</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                {t('iil.deleteConfirm')}
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">{t('iil.rangeLabel')}</span> {selectedInitialInvest.minimumAmount} - {selectedInitialInvest.maximumAmount}
                </p>
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
                    {t('iil.deleting')}
                  </div>
                ) : (
                  t('iil.deleteBtn')
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
