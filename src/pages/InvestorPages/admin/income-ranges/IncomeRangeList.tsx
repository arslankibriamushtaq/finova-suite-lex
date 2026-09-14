import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Wallet,
} from 'lucide-react';
import TableView from '../../../../components/TableView/TableView';
import { Button } from '../../../../components/ui/button';
import { EmptyState, Field } from '../../../../components/shared/detailKit';
import { Label } from '../../../../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../../components/ui/dialog';
import {
  LexNotice,
  LexPageHeader,
  LexRowAction,
  LexRowActions,
  LexAmountInput,
  LexSearch,
} from '../../../../components/shared/lexKit';
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
  /* These four screens are served by the catalogue controllers, which
     enforce portfolio.catalogs — that is PORTFOLIO_REFERENCE_*, not
     PORTFOLIO_SETTINGS_*. On the settings code a role saw the menu row and
     then took a 403 on every call; it went unnoticed because super_admin and
     admin hold both. */
  const { hasPermission } = usePermissions();
  const canManage = hasPermission('PORTFOLIO_REFERENCE_MANAGE');
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
        // The server does not always send a total. Falling back to the rows it
        // did return beats rendering "1 to NaN of 0" over a table with rows in it.
        const info = result.pageInfo || {};
        const rows = Array.isArray(result.data) ? result.data.length : 0;
        setTotalCount(Number.isFinite(info.totalCount) ? info.totalCount : rows);
        setTotalPages(Number.isFinite(info.totalPages) && info.totalPages > 0 ? info.totalPages : 1);
        // Same guard: an absent pageInfo.page would reset the pager to
        // undefined and take the footer's arithmetic with it.
        setCurrentPage(Number.isFinite(info.page) && info.page > 0 ? info.page : page);
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
  // The panels pinned the US locale, so a French or Arabic operator still read
  // "September 8, 2026". toLocaleString follows the runtime locale instead.
  const stamp = (value?: string | null) => (value ? new Date(value).toLocaleString() : '—');

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
        {new Date(value).toLocaleDateString(undefined, {
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
        <LexRowActions>
          <LexRowAction icon={Eye} onSelect={() => handleViewClick(row.id)}>
            {t('irl.viewDetails')}
          </LexRowAction>
          {canManage && (
            <LexRowAction destructive icon={Trash2} onSelect={() => handleDeleteClick(row)}>
              {t('common:delete')}
            </LexRowAction>
          )}
        </LexRowActions>
      ),
      width: '130px',
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


      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="pro-dialog sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5">
              <span className="pro-head-badge">
                <Plus className="h-4 w-4" />
              </span>
              {t('irl.createTitle')}
            </DialogTitle>
          </DialogHeader>

          {formError && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3">
              <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
              <p className="m-0 text-sm text-destructive">{formError}</p>
            </div>
          )}

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="irl-create-min">{t('irl.minAmountRequired')}</Label>
              <LexAmountInput
                id="irl-create-min"
                step="1"
                min="0"
                value={formData.minimumAmount || ''}
                onChange={(next) =>
                  setFormData({ ...formData, minimumAmount: next ? Number(next) : 0 })
                }
                placeholder="100"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="irl-create-max">{t('irl.maxAmountRequired')}</Label>
              <LexAmountInput
                id="irl-create-max"
                step="1"
                min="0"
                value={formData.maximumAmount || ''}
                onChange={(next) =>
                  setFormData({ ...formData, maximumAmount: next ? Number(next) : 0 })
                }
                placeholder="100000"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              {t('common:cancel')}
            </Button>
            <Button onClick={handleCreate} disabled={formLoading} className="gap-2">
              {formLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {formLoading ? t('irl.creating') : t('irl.createBtn')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="pro-dialog sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5">
              <span className="pro-head-badge">
                <Pencil className="h-4 w-4" />
              </span>
              {t('irl.editTitle')}
            </DialogTitle>
          </DialogHeader>

          {formError && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3">
              <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
              <p className="m-0 text-sm text-destructive">{formError}</p>
            </div>
          )}

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="irl-edit-min">{t('irl.minAmountRequired')}</Label>
              <LexAmountInput
                id="irl-edit-min"
                step="1"
                min="0"
                value={formData.minimumAmount || ''}
                onChange={(next) =>
                  setFormData({ ...formData, minimumAmount: next ? Number(next) : 0 })
                }
                placeholder="100"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="irl-edit-max">{t('irl.maxAmountRequired')}</Label>
              <LexAmountInput
                id="irl-edit-max"
                step="1"
                min="0"
                value={formData.maximumAmount || ''}
                onChange={(next) =>
                  setFormData({ ...formData, maximumAmount: next ? Number(next) : 0 })
                }
                placeholder="100000"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              {t('common:cancel')}
            </Button>
            <Button onClick={handleUpdate} disabled={formLoading} className="gap-2">
              {formLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {formLoading ? t('irl.updating') : t('irl.updateBtn')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="pro-dialog sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5">
              <span className="pro-head-badge">
                <Wallet className="h-4 w-4" />
              </span>
              {t('irl.detailsTitle')}
            </DialogTitle>
          </DialogHeader>

          {selectedIncomeRange && (
            <div>
              {/* A range is one fact. The minimum used to be red and the maximum
                  black, as if the two ends meant opposite things. */}
              <p className="m-0 mb-3 text-xl font-semibold tabular-nums tracking-tight text-foreground">
                {formatCurrency(selectedIncomeRange.minimumAmount)} &ndash;{' '}
                {formatCurrency(selectedIncomeRange.maximumAmount)}
              </p>
              <Field
                label={t('irl.col.minAmount')}
                value={formatCurrency(selectedIncomeRange.minimumAmount)}
              />
              <Field
                label={t('irl.col.maxAmount')}
                value={formatCurrency(selectedIncomeRange.maximumAmount)}
              />
              <Field label={t('common:createdAt')} value={stamp(selectedIncomeRange.createdAt)} />
              <Field label={t('common:updatedAt')} value={stamp(selectedIncomeRange.updatedAt)} />
              <Field label={t('irl.label.id')} value={selectedIncomeRange.id} mono />
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewModal(false)}>
              {t('common:close')}
            </Button>
            {canManage && selectedIncomeRange && (
              <Button
                className="gap-2"
                onClick={() => {
                  setShowViewModal(false);
                  handleEditClick(selectedIncomeRange);
                }}
              >
                <Pencil className="h-4 w-4" />
                {t('irl.editBtn')}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="pro-dialog sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5">
              <span className="pro-head-badge">
                <Trash2 className="h-4 w-4" />
              </span>
              {t('irl.deleteTitle')}
            </DialogTitle>
          </DialogHeader>

          {formError && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3">
              <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
              <p className="m-0 text-sm text-destructive">{formError}</p>
            </div>
          )}

          {selectedIncomeRange && (
            <p className="m-0 text-sm text-muted-foreground">
              {t('irl.deleteConfirm', {
                range: `${formatCurrency(selectedIncomeRange.minimumAmount)} - ${formatCurrency(
                  selectedIncomeRange.maximumAmount
                )}`,
              })}
            </p>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              {t('common:cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={formLoading}
              className="gap-2"
            >
              {formLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {formLoading ? t('irl.deleting') : t('irl.deleteBtn')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
