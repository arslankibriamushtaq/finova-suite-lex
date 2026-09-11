import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Edit,
  Eye,
  Trash2,
  Loader2,
  Briefcase,
} from 'lucide-react';
import TableView from '../../../../components/TableView/TableView';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../../components/ui/dialog';
import { Field } from '../../../../components/shared/detailKit';
import { EmptyState } from '../../../../components/shared/detailKit';
import {
  LexNotice,
  LexPageHeader,
  LexRowAction,
  LexRowActions,
  LexSearch,
} from '../../../../components/shared/lexKit';
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
        // The server does not always send a total. Falling back to the rows it
        // did return beats rendering "1 to NaN of 0" over a table with rows in it.
        const info = response.pageInfo || {};
        const rows = Array.isArray(response.data) ? response.data.length : 0;
        setTotalCount(Number.isFinite(info.totalCount) ? info.totalCount : rows);
        setTotalPages(Number.isFinite(info.totalPages) && info.totalPages > 0 ? info.totalPages : 1);
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
  const stamp = (value?: string | null) => (value ? new Date(value).toLocaleString() : '—');

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


      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="pro-dialog sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5">
              <span className="pro-head-badge">
                <Plus className="h-4 w-4" />
              </span>
              {t('ixp.createTitle')}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="ixp-create">{t('ixp.experienceLevel')}</Label>
              <Input
                id="ixp-create"
                type="text"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                placeholder={t('ixp.enterExperience')}
                required
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                {t('common:cancel')}
              </Button>
              <Button type="submit" disabled={formLoading} className="gap-2">
                {formLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {formLoading ? t('ixp.creating') : t('ixp.createBtn')}
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
              {t('ixp.editTitle')}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleUpdate} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="ixp-edit">{t('ixp.experienceLevel')}</Label>
              <Input
                id="ixp-edit"
                type="text"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                placeholder={t('ixp.enterExperience')}
                required
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                {t('common:cancel')}
              </Button>
              <Button type="submit" disabled={formLoading} className="gap-2">
                {formLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {formLoading ? t('ixp.updating') : t('ixp.updateBtn')}
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
                <Briefcase className="h-4 w-4" />
              </span>
              {t('ixp.detailsTitle')}
            </DialogTitle>
          </DialogHeader>

          {selectedInvestmentExperience && (
            <div>
              {/* The level led with a large heading and an icon while the two
                  timestamps sat under bold labels of the same weight, so the
                  panel read as four headlines rather than one fact and its
                  metadata. */}
              <p className="m-0 mb-3 text-xl font-semibold tracking-tight text-foreground">
                {selectedInvestmentExperience.experience}
              </p>
              <Field
                label={t('common:createdAt')}
                value={stamp(selectedInvestmentExperience.createdAt)}
              />
              <Field
                label={t('common:updatedAt')}
                value={stamp(selectedInvestmentExperience.updatedAt)}
              />
              <Field label={t('irl.label.id')} value={selectedInvestmentExperience.id} mono />
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
              {t('ixp.deleteTitle')}
            </DialogTitle>
          </DialogHeader>

          <p className="m-0 text-sm text-muted-foreground">{t('ixp.deleteConfirm')}</p>
          {selectedInvestmentExperience && (
            <div className="flex items-center gap-2 rounded-lg border bg-muted/40 p-3">
              <Briefcase className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="text-sm text-foreground">
                <span className="font-medium">{t('ixp.experienceLabel')}</span>{' '}
                {selectedInvestmentExperience.experience}
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
              {formLoading ? t('ixp.deleting') : t('ixp.deleteBtn')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
