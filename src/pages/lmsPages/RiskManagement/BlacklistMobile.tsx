import { useState, useEffect } from "react";
import TableView from "../../../components/TableView/TableView";
import toast from "react-hot-toast";
import {
  getAllBlacklistMobile,
  createBlacklistMobile,
  removeBlacklistMobile,
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
import { Input as AntInput } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const BlacklistMobile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Add modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ mobileNumber: "", reason: "" });
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
      const response = await getAllBlacklistMobile();
      const list = response?.data?.data || response?.data || [];
      setData(Array.isArray(list) ? list : []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch blacklist mobile data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData({ mobileNumber: "", reason: "" });
    setShowAddModal(true);
  };

  const handleSave = async () => {
    if (!formData.mobileNumber.trim()) {
      toast.error("Mobile number is required");
      return;
    }
    if (!formData.reason.trim()) {
      toast.error("Reason is required");
      return;
    }

    try {
      setIsSaving(true);
      await createBlacklistMobile({
        mobileNumber: formData.mobileNumber.trim(),
        reason: formData.reason.trim(),
      });
      toast.success("Mobile added to blacklist successfully");
      setShowAddModal(false);
      fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to blacklist mobile");
    } finally {
      setIsSaving(false);
    }
  };

  const confirmRemove = async () => {
    if (!removeTarget) return;
    const mobile = removeTarget.mobileNumber || removeTarget.mobile;
    try {
      setIsRemoving(true);
      await removeBlacklistMobile(mobile);
      toast.success("Mobile removed from blacklist");
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
      (item?.mobileNumber || item?.mobile || "").toLowerCase().includes(term) ||
      (item?.reason || "").toLowerCase().includes(term) ||
      (item?.status || "").toLowerCase().includes(term)
    );
  });

  const headers = [
    {
      name: "Mobile Number",
      selector: (row: any) => row.mobileNumber || row.mobile || "-",
      sortable: true,
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
      <h1 className="text-xl font-bold pb-3">Blacklist Mobile</h1>

      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        <AntInput
          allowClear
          placeholder="Search by mobile, reason, or status"
          prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: "1 1 240px", minWidth: 200, borderRadius: 8, height: 40 }}
        />
        <Button className="gap-2" onClick={handleAdd} style={{ flexShrink: 0 }}>
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
            <DialogTitle>Add Mobile to Blacklist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Mobile Number *</Label>
              <Input
                placeholder="e.g. +966501234567"
                value={formData.mobileNumber}
                onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
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
            Are you sure you want to remove mobile{" "}
            <span className="font-medium text-foreground">
              {removeTarget?.mobileNumber || removeTarget?.mobile}
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

export default BlacklistMobile;
