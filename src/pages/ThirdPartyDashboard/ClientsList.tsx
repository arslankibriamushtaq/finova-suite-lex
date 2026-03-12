import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TableView from "../../components/TableView/TableView";
import toast from "react-hot-toast";
import { getAllClients, deleteClient } from "../../redux/apis/apisMiddlewareClients";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Plus, ChevronDown, Pencil, Trash2 } from "lucide-react";

const ClientsList = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadClients = async () => {
    try {
      setIsLoading(true);
      const response = await getAllClients();
      const list = response?.data?.data || response?.data || [];
      setData(Array.isArray(list) ? list : []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch clients");
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
      toast.success("Client deleted successfully");
      setDeleteTarget(null);
      loadClients();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete client");
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
      name: "Name",
      selector: (row: any) => row.name || "-",
      sortable: true,
    },
    {
      name: "Code",
      selector: (row: any) => row.code || "-",
      sortable: true,
    },
    {
      name: "Description",
      selector: (row: any) => row.description || "-",
      sortable: true,
    },
    {
      name: "Callback URL",
      selector: (row: any) => row.callbackUrl || "-",
      sortable: true,
    },
    {
      name: "Environment",
      selector: (row: any) => row.environment || "-",
      sortable: true,
    },
    {
      name: "Status",
      cell: (row: any) => {
        const status = row.status || "ACTIVE";
        const colorClass =
          status === "ACTIVE"
            ? "text-green-600 font-medium"
            : status === "INACTIVE"
            ? "text-yellow-600 font-medium"
            : "text-red-600 font-medium";
        return <span className={colorClass}>{status}</span>;
      },
    },
    {
      name: "Created At",
      selector: (row: any) =>
        row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "-",
      sortable: true,
    },
    {
      name: "Action",
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
                Select
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
                Edit
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
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <div className="service p-4">
      <h1 className="text-xl font-bold pb-3">Client List</h1>

      <div className="d-flex justify-content-between mb-3 gap-2">
        <Input
          placeholder="Search by name, code, or status"
          className="w-[280px]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button
          className="gap-2"
          onClick={() => navigate("/ThirdPartyManagement/Clients/Add")}
        >
          <Plus className="h-4 w-4" />
          Add New Client
        </Button>
      </div>

      <TableView
        header={headers}
        data={filteredData}
        totalRows={filteredData.length}
        isLoading={isLoading}
        from={1}
        page={page}
        totalPage={Math.ceil(filteredData.length / pageSize) || 1}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        to={filteredData.length}
      />

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Delete Client</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <span className="font-medium text-foreground">{deleteTarget?.name}</span>? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientsList;
