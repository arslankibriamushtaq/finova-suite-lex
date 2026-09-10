import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Trash2,
  Eye,
  X,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Wallet,
} from 'lucide-react';
import TableView from '../../../../components/TableView/TableView';
import { Button } from '../../../../components/ui/button';
import { EmptyState } from '../../../../components/shared/detailKit';
import { LexNotice, LexPageHeader, LexSearch } from '../../../../components/shared/lexKit';
import { usePermissions } from '../../../../hooks/useProductPermissions';
  
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
  const [pageSize, setPageSize] = useState(10);
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
  /**
   * `size` is a parameter rather than read from state because the page-size
   * control has to fetch with the size it was just given — a setState in the
   * same tick has not landed yet, so reading state here would fetch the OLD
   * size and the selector would look live while doing nothing.
   */
  const fetchIncomeRanges = async (page: number = 1, size: number = pageSize) => {
    try {
      setLoading(true);
      setError(null);
      const result = await getAllIncomeRanges(page, size);
      
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

  /**
   * The app prices everything in SAR; this was the one place printing dollars,
   * and only inside the delete confirmation — so the figure a reader checked
   * before deleting a row was in a different currency from the row itself.
   */
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `SAR ${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `SAR ${(amount / 1000).toFixed(0)}K`;
    return `SAR ${amount.toLocaleString()}`;
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

  const incomeRangeHeaders = [
    {
      name: t('irl.col.minAmount'),
      cell: (row: IncomeRange) => amountCell(row.minimumAmount),
      width: '180px',
    },
    {
      name: t('irl.col.maxAmount'),
      cell: (row: IncomeRange) => amountCell(row.maximumAmount),
      width: '180px',
    },
    { name: t('irl.col.created'), cell: (row: IncomeRange) => stampCell(row.createdAt) },
    { name: t('irl.col.updated'), cell: (row: IncomeRange) => stampCell(row.updatedAt) },
    {
      name: t('common:actions'),
      cell: (row: IncomeRange) => (
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
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              onClick={() => handleDeleteClick(row)}
              title={t('irl.deleteTitle')}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
      width: '120px',
    },
  ];

  return (
    <div className="service">
      <LexPageHeader icon={Wallet} title={t('irl.title')} subtitle={t('irl.subtitle')}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchIncomeRanges(currentPage)}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={loading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
          {t('common:refresh')}
        </Button>
        {canManage && (
          <Button size="sm" onClick={() => setShowCreateModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            {t('irl.addIncomeRange')}
          </Button>
        )}
      </LexPageHeader>

      {error && <LexNotice tone="red">{error}</LexNotice>}

      <div className="pro-card p-3 mb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <LexSearch
            id="income-range-search"
            className="flex-1"
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder={t('irl.searchPlaceholder')}
          />
          <span className="whitespace-nowrap text-xs text-muted-foreground">
            {t('irl.countLabel', { shown: filteredIncomeRanges.length, total: totalCount })}
          </span>
        </div>
      </div>

      <div className="pro-card p-4">
        {!loading && filteredIncomeRanges.length === 0 ? (
          <EmptyState icon={Wallet} text={t('common:noData')} />
        ) : (
          <TableView
            header={incomeRangeHeaders}
            data={filteredIncomeRanges}
            isLoading={loading}
            totalRows={totalCount}
            totalPage={totalPages}
            page={currentPage}
            setPage={handlePageChange}
            pageSize={pageSize}
            setPageSize={(size: number) => {
              setPageSize(size);
              setCurrentPage(1);
              fetchIncomeRanges(1, size);
            }}
            from={totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            to={Math.min(currentPage * pageSize, totalCount)}
          />
        )}
      </div>


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
