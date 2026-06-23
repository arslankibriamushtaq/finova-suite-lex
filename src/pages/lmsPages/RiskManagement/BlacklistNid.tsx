import { useState, useEffect } from "react";
import TableView from "../../../components/TableView/TableView";
import toast from "react-hot-toast";
import {
  getAllBlacklistNid,
  createBlacklistNid,
  removeBlacklistNid,
  getRiskBlockCodes,
  assignBlockCodeToNid,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { ChevronDown, Plus, ShieldOff, ShieldCheck, Link2 } from "lucide-react";
import { Input as AntInput } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const BlacklistNid = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPage, setTotalPage] = useState(1);

  // Add modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ nationalId: "", reason: "", blockCodeId: "" });
  const [nidError, setNidError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Remove modal
  const [removeTarget, setRemoveTarget] = useState<any>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  // Block codes
  const [blockCodes, setBlockCodes] = useState<any[]>([]);
  const [assignNidTarget, setAssignNidTarget] = useState<any>(null);
  const [selectedNidBlockCodeId, setSelectedNidBlockCodeId] = useState("");
  const [isAssigningNid, setIsAssigningNid] = useState(false);

  // Debounce search so we don't refetch / re-filter on every keystroke
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(handle);
  }, [searchTerm]);

  useEffect(() => {
    fetchData();
  }, [page, pageSize, debouncedSearch]);

  useEffect(() => {
    getRiskBlockCodes()
      .then((res) => {
        const list = Array.isArray(res?.data?.data) ? res.data.data : Array.isArray(res?.data) ? res.data : [];
        setBlockCodes(list.filter((bc: any) => bc.active !== false));
      })
      .catch(() => {});
  }, []);

  const blockCodeMap: Record<string, string> = {};
  blockCodes.forEach((bc: any) => { blockCodeMap[bc.id] = bc.code; });

  // Extract NID value — nationalId is a nested object with .value
  const getNidValue = (item: any): string => {
    if (!item?.nationalId) return "-";
    if (typeof item.nationalId === "object") return item.nationalId.value || "-";
    return item.nationalId;
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);

      if (debouncedSearch) {
        // Filter client-side — backend search support is unverified.
        const response = await getAllBlacklistNid(0, 10000);
        const all: any[] = Array.isArray(response?.data?.data)
          ? response.data.data
          : Array.isArray(response?.data)
            ? response.data
            : [];
        const term = debouncedSearch.toLowerCase();
        const filtered = all.filter((item: any) =>
          getNidValue(item).toLowerCase().includes(term) ||
          (item?.reason || "").toLowerCase().includes(term) ||
          (item?.status || "").toLowerCase().includes(term)
        );
        const total = filtered.length;
        const totalPages = Math.max(1, Math.ceil(total / pageSize));
        const start = (page - 1) * pageSize;
        setData(filtered.slice(start, start + pageSize));
        setTotalRows(total);
        setTotalPage(totalPages);
        return;
      }

      // Backend uses 0-based indexing for page
      const response = await getAllBlacklistNid(page - 1, pageSize);
      const list = response?.data?.data || response?.data || [];
      setData(Array.isArray(list) ? list : []);

      const pagination = response?.data?.pagination;
      if (pagination) {
        setTotalRows(pagination.totalElements || 0);
        setTotalPage(pagination.totalPages || 1);
      } else {
        setTotalRows(Array.isArray(list) ? list.length : 0);
        setTotalPage(Math.ceil((Array.isArray(list) ? list.length : 0) / pageSize) || 1);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch blacklist NID data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData({ nationalId: "", reason: "", blockCodeId: "" });
    setNidError("");
    setShowAddModal(true);
  };

  const handleSave = async () => {
    const nid = formData.nationalId.trim();
    if (!nid) {
      toast.error("National ID is required");
      return;
    }
    if (!/^\d{10}$/.test(nid)) {
      toast.error("National ID must be exactly 10 digits");
      return;
    }
    if (nid[0] !== "1" && nid[0] !== "2") {
      toast.error("National ID must start with 1 or 2");
      return;
    }
    if (!formData.reason.trim()) {
      toast.error("Reason is required");
      return;
    }

    try {
      setIsSaving(true);
      await createBlacklistNid({
        nationalId: nid,
        reason: formData.reason.trim(),
        ...(formData.blockCodeId ? { blockCodeId: formData.blockCodeId } : {}),
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
      name: "Block Code",
      cell: (row: any) => {
        const code = row.blockCodeId ? (blockCodeMap[row.blockCodeId] || row.blockCodeId) : null;
        return code ? (
          <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground">
            {code}
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        );
      },
      width: "140px",
    },
    {
      name: "Action",
      cell: (row: any) => {
        const status = row.status || "BLACKLISTED";
        if (status !== "BLACKLISTED" && status !== "REMOVED") return null;
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
                {status === "REMOVED" ? (
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      setFormData({ nationalId: getNidValue(row), reason: row.reason || "", blockCodeId: row.blockCodeId || "" });
                      setNidError("");
                      setShowAddModal(true);
                    }}
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Re-Blacklist
                  </DropdownMenuItem>
                ) : (
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
                )}
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    setAssignNidTarget(row);
                    setSelectedNidBlockCodeId(row.blockCodeId || "");
                    setShowAddModal(false);
                  }}
                >
                  <Link2 className="h-4 w-4" />
                  Assign Block Code
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
      width: "150px",
    },
  ];

  return (
    <div className="service">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2 ps-0">
          <span className="pro-head-badge">
            <ShieldOff className="h-4 w-4" />
          </span>
          Blacklist NID
        </h3>
      </div>

      <div className="pro-card p-3 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
        <AntInput
          allowClear
          placeholder="Search by NID, reason, or status"
          prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: "1 1 240px", minWidth: 200, borderRadius: 2, height: 40 }}
        />
        <Button className="gap-2" onClick={handleAdd} style={{ flexShrink: 0 }}>
          <Plus className="h-4 w-4" />
          Add to Blacklist
        </Button>
        </div>
      </div>

      <div className="pro-card">
        <TableView
        header={headers}
        data={data}
        totalRows={totalRows}
        isLoading={isLoading}
        from={(page - 1) * pageSize + (totalRows > 0 ? 1 : 0)}
        to={Math.min(page * pageSize, totalRows)}
        page={page}
        totalPage={totalPage}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        paginationShow={true}
      />
      </div>

      {/* Add / Re-Blacklist Modal */}
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
                maxLength={10}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setFormData({ ...formData, nationalId: val });
                  if (!val) {
                    setNidError("National ID is required");
                  } else if (val.length < 10) {
                    setNidError("National ID must be exactly 10 digits");
                  } else if (val[0] !== "1" && val[0] !== "2") {
                    setNidError("National ID must start with 1 or 2");
                  } else {
                    setNidError("");
                  }
                }}
                className={nidError ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {nidError && <p className="text-xs text-red-500">{nidError}</p>}
            </div>
            <div className="space-y-2">
              <Label>Reason *</Label>
              <Input
                placeholder="Reason for blacklisting"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Block Code</Label>
              <Select
                value={formData.blockCodeId || "none"}
                onValueChange={(val) => setFormData({ ...formData, blockCodeId: val === "none" ? "" : val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select block code (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {blockCodes.map((bc: any) => (
                    <SelectItem key={bc.id} value={String(bc.id)}>
                      {bc.code}{bc.description ? ` — ${bc.description}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

      {/* Assign Block Code Modal */}
      <Dialog open={!!assignNidTarget} onOpenChange={(open) => !open && setAssignNidTarget(null)}>
        <DialogContent className="max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Assign Block Code</DialogTitle>
          </DialogHeader>
          <div className="space-y-1">
            <Label className="font-semibold">Block Code</Label>
            <Select
              value={selectedNidBlockCodeId || ""}
              onValueChange={(val) => setSelectedNidBlockCodeId(val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a block code" />
              </SelectTrigger>
              <SelectContent>
                {blockCodes.map((bc: any) => (
                  <SelectItem key={bc.id} value={String(bc.id)}>
                    {bc.code}{bc.description ? ` — ${bc.description}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignNidTarget(null)} disabled={isAssigningNid}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!assignNidTarget || !selectedNidBlockCodeId) return;
                const nid = typeof assignNidTarget.nationalId === "object"
                  ? assignNidTarget.nationalId.value
                  : assignNidTarget.nationalId;
                try {
                  setIsAssigningNid(true);
                  await assignBlockCodeToNid(nid, selectedNidBlockCodeId);
                  toast.success("Block code assigned");
                  setAssignNidTarget(null);
                  fetchData();
                } catch (error: any) {
                  toast.error(error?.response?.data?.message || "Failed to assign block code");
                } finally {
                  setIsAssigningNid(false);
                }
              }}
              disabled={isAssigningNid || !selectedNidBlockCodeId}
            >
              {isAssigningNid ? "Assigning..." : "Assign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BlacklistNid;
