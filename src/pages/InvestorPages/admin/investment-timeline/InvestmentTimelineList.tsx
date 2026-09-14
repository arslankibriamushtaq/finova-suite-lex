import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Loader2,
  Clock,
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
  /* These four screens are served by the catalogue controllers, which
     enforce portfolio.catalogs — that is PORTFOLIO_REFERENCE_*, not
     PORTFOLIO_SETTINGS_*. On the settings code a role saw the menu row and
     then took a 403 on every call; it went unnoticed because super_admin and
     admin hold both. */
  const { hasPermission } = usePermissions();
  const canManage = hasPermission('PORTFOLIO_REFERENCE_MANAGE');
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
        // The server does not always send a total. Falling back to the rows it
        // did return beats rendering "1 to NaN of 0" over a table with rows in it.
        const info = response.pageInfo || {};
        const rows = Array.isArray(response.data) ? response.data.length : 0;
        setTotalCount(Number.isFinite(info.totalCount) ? info.totalCount : rows);
        setTotalPages(Number.isFinite(info.totalPages) && info.totalPages > 0 ? info.totalPages : 1);
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
  // The panels pinned the US locale, so a French or Arabic operator still read
  // "September 8, 2026". toLocaleString follows the runtime locale instead.
  const stamp = (value?: string | null) => (value ? new Date(value).toLocaleString() : '—');

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


      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="pro-dialog sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5">
              <span className="pro-head-badge">
                <Plus className="h-4 w-4" />
              </span>
              {t('itl.createTitle')}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="itl-create">{t('itl.timelinePeriod')}</Label>
              <Input
                id="itl-create"
                type="text"
                value={formData.timeline}
                onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                placeholder={t('itl.enterTimeline')}
                required
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                {t('common:cancel')}
              </Button>
              <Button type="submit" disabled={formLoading} className="gap-2">
                {formLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {formLoading ? t('itl.creating') : t('itl.createBtn')}
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
              {t('itl.editTitle')}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleUpdate} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="itl-edit">{t('itl.timelinePeriod')}</Label>
              <Input
                id="itl-edit"
                type="text"
                value={formData.timeline}
                onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                placeholder={t('itl.enterTimeline')}
                required
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                {t('common:cancel')}
              </Button>
              <Button type="submit" disabled={formLoading} className="gap-2">
                {formLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {formLoading ? t('itl.updating') : t('itl.updateBtn')}
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
                <Clock className="h-4 w-4" />
              </span>
              {t('itl.detailsTitle')}
            </DialogTitle>
          </DialogHeader>

          {selectedInvestmentTimeline && (
            <div>
              <p className="m-0 mb-3 text-xl font-semibold tracking-tight text-foreground">
                {selectedInvestmentTimeline.timeline}
              </p>
              <Field
                label={t('common:createdAt')}
                value={stamp(selectedInvestmentTimeline.createdAt)}
              />
              <Field
                label={t('common:updatedAt')}
                value={stamp(selectedInvestmentTimeline.updatedAt)}
              />
              <Field label={t('irl.label.id')} value={selectedInvestmentTimeline.id} mono />
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
              {t('itl.deleteTitle')}
            </DialogTitle>
          </DialogHeader>

          <p className="m-0 text-sm text-muted-foreground">{t('itl.deleteConfirm')}</p>
          {selectedInvestmentTimeline && (
            <div className="flex items-center gap-2 rounded-lg border bg-muted/40 p-3">
              <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="text-sm text-foreground">
                <span className="font-medium">{t('itl.timelineLabel')}</span>{' '}
                {selectedInvestmentTimeline.timeline}
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
              {formLoading ? t('itl.deleting') : t('itl.deleteBtn')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
