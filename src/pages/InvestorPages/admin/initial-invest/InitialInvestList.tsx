import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Loader2,
  Coins,
} from 'lucide-react';
import TableView from '../../../../components/TableView/TableView';
import { Button } from '../../../../components/ui/button';
import { EmptyState, Field } from '../../../../components/shared/detailKit';
import { Input } from '../../../../components/ui/input';
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
  LexSearch,
} from '../../../../components/shared/lexKit';
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
        // The server does not always send a total. Falling back to the rows it
        // did return beats rendering "1 to NaN of 0" over a table with rows in it.
        const info = response.pageInfo || {};
        const rows = Array.isArray(response.data) ? response.data.length : 0;
        setTotalCount(Number.isFinite(info.totalCount) ? info.totalCount : rows);
        setTotalPages(Number.isFinite(info.totalPages) && info.totalPages > 0 ? info.totalPages : 1);
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
  // The list column renders "SAR 10,000"; the panels printed a bare 10000, so
  // the same figure read differently either side of a click.
  const money = (value?: number) => `SAR ${Number(value ?? 0).toLocaleString()}`;
  // The panels pinned the US locale, so a French or Arabic operator still read
  // "September 8, 2026". toLocaleString follows the runtime locale instead.
  const stamp = (value?: string | null) => (value ? new Date(value).toLocaleString() : '—');

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
        <LexRowActions>
          <LexRowAction icon={Eye} onSelect={() => handleViewClick(row.id)}>
            {t('irl.viewDetails')}
          </LexRowAction>
          {canManage && (
            <>
              <LexRowAction icon={Edit} onSelect={() => handleEditClick(row.id)}>
                {t('common:edit')}
              </LexRowAction>
              <LexRowAction destructive icon={Trash2} onSelect={() => handleDeleteClick(row)}>
                {t('common:delete')}
              </LexRowAction>
            </>
          )}
        </LexRowActions>
      ),
      width: '130px',
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


      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="pro-dialog sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5">
              <span className="pro-head-badge">
                <Plus className="h-4 w-4" />
              </span>
              {t('iil.createTitle')}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="iil-create-min">{t('irl.col.minAmount')}</Label>
              <div className="relative">
                <Input
                  id="iil-create-min"
                  type="number"
                  min="0"
                  step="1"
                  className="pe-14"
                  value={formData.minimumAmount || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, minimumAmount: e.target.value ? Number(e.target.value) : 0 })
                  }
                  placeholder="0"
                  required
                />
                {/* The suffix inside these boxes read USD, on a platform whose
                    every other figure is in SAR. */}
                <span className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-xs font-medium text-muted-foreground">
                  SAR
                </span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="iil-create-max">{t('irl.col.maxAmount')}</Label>
              <div className="relative">
                <Input
                  id="iil-create-max"
                  type="number"
                  min="0"
                  step="1"
                  className="pe-14"
                  value={formData.maximumAmount || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, maximumAmount: e.target.value ? Number(e.target.value) : 0 })
                  }
                  placeholder="10000"
                  required
                />
                {/* The suffix inside these boxes read USD, on a platform whose
                    every other figure is in SAR. */}
                <span className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-xs font-medium text-muted-foreground">
                  SAR
                </span>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                {t('common:cancel')}
              </Button>
              <Button type="submit" disabled={formLoading} className="gap-2">
                {formLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {formLoading ? t('iil.creating') : t('iil.createBtn')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="pro-dialog sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5">
              <span className="pro-head-badge">
                <Edit className="h-4 w-4" />
              </span>
              {t('iil.editTitle')}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleUpdate} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="iil-edit-min">{t('irl.col.minAmount')}</Label>
              <div className="relative">
                <Input
                  id="iil-edit-min"
                  type="number"
                  min="0"
                  step="1"
                  className="pe-14"
                  value={formData.minimumAmount || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, minimumAmount: e.target.value ? Number(e.target.value) : 0 })
                  }
                  placeholder="0"
                  required
                />
                {/* The suffix inside these boxes read USD, on a platform whose
                    every other figure is in SAR. */}
                <span className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-xs font-medium text-muted-foreground">
                  SAR
                </span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="iil-edit-max">{t('irl.col.maxAmount')}</Label>
              <div className="relative">
                <Input
                  id="iil-edit-max"
                  type="number"
                  min="0"
                  step="1"
                  className="pe-14"
                  value={formData.maximumAmount || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, maximumAmount: e.target.value ? Number(e.target.value) : 0 })
                  }
                  placeholder="10000"
                  required
                />
                {/* The suffix inside these boxes read USD, on a platform whose
                    every other figure is in SAR. */}
                <span className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-xs font-medium text-muted-foreground">
                  SAR
                </span>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                {t('common:cancel')}
              </Button>
              <Button type="submit" disabled={formLoading} className="gap-2">
                {formLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {formLoading ? t('iil.updating') : t('iil.updateBtn')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="pro-dialog sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5">
              <span className="pro-head-badge">
                <Coins className="h-4 w-4" />
              </span>
              {t('iil.detailsTitle')}
            </DialogTitle>
          </DialogHeader>

          {selectedInitialInvest && (
            <div>
              {/* A range is one fact. The minimum used to be red and the maximum
                  black, as if the two ends meant opposite things. */}
              <p className="m-0 mb-3 text-xl font-semibold tabular-nums tracking-tight text-foreground">
                {money(selectedInitialInvest.minimumAmount)} &ndash;{' '}
                {money(selectedInitialInvest.maximumAmount)}
              </p>
              <Field
                label={t('irl.col.minAmount')}
                value={money(selectedInitialInvest.minimumAmount)}
              />
              <Field
                label={t('irl.col.maxAmount')}
                value={money(selectedInitialInvest.maximumAmount)}
              />
              <Field label={t('common:createdAt')} value={stamp(selectedInitialInvest.createdAt)} />
              <Field label={t('common:updatedAt')} value={stamp(selectedInitialInvest.updatedAt)} />
              <Field label={t('irl.label.id')} value={selectedInitialInvest.id} mono />
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewModal(false)}>
              {t('common:close')}
            </Button>
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
              {t('iil.deleteTitle')}
            </DialogTitle>
          </DialogHeader>

          <p className="m-0 text-sm text-muted-foreground">{t('iil.deleteConfirm')}</p>
          {selectedInitialInvest && (
            <div className="flex items-center gap-2 rounded-lg border bg-muted/40 p-3">
              <Coins className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="text-sm tabular-nums text-foreground">
                <span className="font-medium">{t('iil.rangeLabel')}</span>{' '}
                {money(selectedInitialInvest.minimumAmount)} &ndash;{' '}
                {money(selectedInitialInvest.maximumAmount)}
              </span>
            </div>
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
              {formLoading ? t('iil.deleting') : t('iil.deleteBtn')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
