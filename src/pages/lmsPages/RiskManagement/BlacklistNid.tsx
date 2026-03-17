import { useState, useEffect } from "react";
import TableView from "../../../components/TableView/TableView";
import toast from "react-hot-toast";
import {
  getAllBlacklistNid,
  createBlacklistNid,
  removeBlacklistNid,
} from "../../../redux/apis/apisRiskManagement";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { ChevronDown, Plus, ShieldOff } from "lucide-react";

const BlacklistNid = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Add modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ nationalId: "", reason: "" });
  const [isSaving, setIsSaving] = useState(false);

  // Remove modal
  const [removeTarget, setRemoveTarget] = useState<any>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await getAllBlacklistNid();
      const list = response?.data?.data || response?.data || [];
      setData(Array.isArray(list) ? list : []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch blacklist NID data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData({ nationalId: "", reason: "" });
    setShowAddModal(true);
  };

  const handleSave = async () => {
    if (!formData.nationalId.trim()) {
      toast.error("National ID is required");
      return;
    }
    if (!formData.reason.trim()) {
      toast.error("Reason is required");
      return;
    }

    try {
      setIsSaving(true);
      await createBlacklistNid({
        nationalId: formData.nationalId.trim(),
        reason: formData.reason.trim(),
      });
      toast.success("NID added to blacklist successfully");
      setShowAddModal(false);
      fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to blacklist NID");
    } finally {
      setIsSaving(false);
    }
  };

  // Extract NID value — nationalId is a nested object with .value
  const getNidValue = (item: any): string => {
    if (!item?.nationalId) return "-";
    if (typeof item.nationalId === "object") return item.nationalId.value || "-";
    return item.nationalId;
  };

  const getNidType = (item: any): string => {
    if (typeof item?.nationalId === "object") return item.nationalId.typeDescription || "-";
    return "-";
  };

  const confirmRemove = async () => {
    if (!removeTarget) return;
    const nid = getNidValue(removeTarget);
    try {
      setIsRemoving(true);
      await removeBlacklistNid(nid);
      toast.success("NID removed from blacklist");
      setRemoveTarget(null);
      fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to remove from blacklist");
    } finally {
      setIsRemoving(false);
    }
  };

  const filteredData = data.filter((item) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      getNidValue(item).toLowerCase().includes(term) ||
      (item?.reason || "").toLowerCase().includes(term) ||
      (item?.status || "").toLowerCase().includes(term)
    );
  });

  const headers = [
    {
      name: "National ID",
      selector: (row: any) => getNidValue(row),
      sortable: true,
    },
    {
      name: "Type",
      selector: (row: any) => getNidType(row),
      sortable: true,
      width: "120px",
    },
    {
      name: "Reason",
      selector: (row: any) => row.reason || "-",
      sortable: true,
    },
    {
      name: "Status",
      cell: (row: any) => {
        const status = row.status || "BLACKLISTED";
        const isBlacklisted = status === "BLACKLISTED";
        return (
          <span className={isBlacklisted ? "text-red-600 font-medium" : "text-green-600 font-medium"}>
            {status}
          </span>
        );
      },
      sortable: true,
      width: "140px",
    },
    {
      name: "Created At",
      selector: (row: any) =>
        row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "-",
      sortable: true,
      width: "140px",
    },
    {
      name: "Action",
      cell: (row: any) => {
        const status = row.status || "BLACKLISTED";
        if (status !== "BLACKLISTED") return null;
        return (
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
                  variant="destructive"
                  onSelect={(e) => {
                    e.preventDefault();
                    setRemoveTarget(row);
                  }}
                >
                  <ShieldOff className="h-4 w-4" />
                  Remove from Blacklist
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
      width: "120px",
    },
  ];

  return (
    <div className="service p-4">
      <h1 className="text-xl font-bold pb-3">Blacklist NID</h1>

      <div className="d-flex justify-content-between mb-3 gap-2">
        <Input
          placeholder="Search by NID, reason, or status"
          className="w-[280px]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button className="gap-2" onClick={handleAdd}>
          <Plus className="h-4 w-4" />
          Add to Blacklist
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

      {/* Add Modal */}
      <Dialog open={showAddModal} onOpenChange={(open) => !open && setShowAddModal(false)}>
        <DialogContent className="max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add NID to Blacklist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>National ID *</Label>
              <Input
                placeholder="e.g. 1234567890"
                value={formData.nationalId}
                onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Reason *</Label>
              <Input
                placeholder="Reason for blacklisting"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Blacklist"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Confirmation Modal */}
      <Dialog open={!!removeTarget} onOpenChange={(open) => !open && setRemoveTarget(null)}>
        <DialogContent className="max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Remove from Blacklist</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to remove NID{" "}
            <span className="font-medium text-foreground">
              {removeTarget ? getNidValue(removeTarget) : ""}
            </span>{" "}
            from the blacklist?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveTarget(null)} disabled={isRemoving}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmRemove} disabled={isRemoving}>
              {isRemoving ? "Removing..." : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BlacklistNid;
