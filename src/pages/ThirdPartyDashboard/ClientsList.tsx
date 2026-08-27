import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import TableView from "../../components/TableView/TableView";
import toast from "react-hot-toast";
import { getAllClients, deleteClient } from "../../redux/apis/apisMiddlewareProviders";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Plus, ChevronDown, Pencil, Trash2, Contact } from "lucide-react";
import { Input as AntInput } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const ClientsList = () => {
  const { t } = useTranslation("connector");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset to page 1 whenever the search term changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm, pageSize]);

  const loadClients = async () => {
    try {
      setIsLoading(true);
      const response = await getAllClients();
      const list = response?.data?.data || response?.data || [];
      setData(Array.isArray(list) ? list : []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("clientsList.toast.fetchFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await deleteClient(deleteTarget.id);
      toast.success(t("clientsList.toast.deleteSuccess"));
      setDeleteTarget(null);
      loadClients();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("clientsList.toast.deleteFailed"));
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredData = data.filter((item) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (item?.name || "").toLowerCase().includes(term) ||
      (item?.code || "").toLowerCase().includes(term) ||
      (item?.status || "").toLowerCase().includes(term)
    );
  });

  const headers = [
    {
      name: t("clientsList.col.name"),
      selector: (row: any) => row.name || "-",
      sortable: true,
    },
    {
      name: t("clientsList.col.code"),
      selector: (row: any) => row.code || "-",
      sortable: true,
    },
    {
      name: t("clientsList.col.description"),
      selector: (row: any) => row.description || "-",
      sortable: true,
    },
    {
      name: t("clientsList.col.callbackUrl"),
      selector: (row: any) => row.callbackUrl || "-",
      sortable: true,
    },
    {
      name: t("clientsList.col.environment"),
      selector: (row: any) => row.environment || "-",
      sortable: true,
    },
    {
      name: t("common:status"),
      cell: (row: any) => {
        const status = row.status || "ACTIVE";
        const colorClass =
          status === "ACTIVE"
            ? "text-red-600 font-medium"
            : status === "INACTIVE"
            ? "text-yellow-600 font-medium"
            : "text-red-600 font-medium";
        return <span className={colorClass}>{status}</span>;
      },
    },
    {
      name: t("clientsList.col.createdAt"),
      selector: (row: any) =>
        row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "-",
      sortable: true,
    },
    {
      name: t("clientsList.col.action"),
      cell: (row: any) => (
        <div
          className="relative inline-block"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-foreground/30 bg-foreground px-4 py-2 text-sm font-medium text-background shadow-sm transition-colors hover:bg-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {t("clientsList.select")}
                <ChevronDown className="h-4 w-4 shrink-0 opacity-80" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="bottom" className="z-[9999]" sideOffset={4}>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  navigate(`/ThirdPartyManagement/Clients/Edit/${row.id}`);
                }}
              >
                <Pencil className="h-4 w-4" />
                {t("common:edit")}
              </DropdownMenuItem>
              {/* <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  navigate(`/ThirdPartyManagement/Clients/${row.id}/Admins`);
                }}
              >
                <Users className="h-4 w-4" />
                Admin List
              </DropdownMenuItem> */}
              <DropdownMenuItem
                variant="destructive"
                onSelect={(e) => {
                  e.preventDefault();
                  setDeleteTarget(row);
                }}
              >
                <Trash2 className="h-4 w-4" />
                {t("common:delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <div className="service clients-list-page">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2 ps-0">
          <span className="pro-head-badge">
            <Contact className="h-4 w-4" />
          </span>
          {t("clientsList.title")}
        </h3>
      </div>

      {/* Filters card */}
      <div className="pro-card p-3 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
          <AntInput
            allowClear
            placeholder={t("clientsList.searchPlaceholder")}
            prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: "1 1 240px", minWidth: 200, borderRadius: 2, height: 40 }}
          />
          <Button
            className="gap-2"
            onClick={() => navigate("/ThirdPartyManagement/Clients/Add")}
            style={{ height: 40, whiteSpace: "nowrap", flexShrink: 0 }}
          >
            <Plus className="h-4 w-4" />
            {t("clientsList.addNewClient")}
          </Button>
        </div>
      </div>

      {/* Table card */}
      <div className="pro-card">
        <TableView
          header={headers}
          data={filteredData.slice((page - 1) * pageSize, page * pageSize)}
          totalRows={filteredData.length}
          isLoading={isLoading}
          from={filteredData.length > 0 ? (page - 1) * pageSize + 1 : 0}
          page={page}
          totalPage={Math.max(1, Math.ceil(filteredData.length / pageSize))}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          to={Math.min(page * pageSize, filteredData.length)}
          paginationShow={true}
        />
      </div>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-[420px]">
          <DialogHeader>
            <DialogTitle>{t("clientsList.modalTitle")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {t("clientsList.deleteConfirm", { name: deleteTarget?.name })}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
              {t("common:cancel")}
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? t("action.deleting") : t("common:delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientsList;
