import { useState, useEffect } from "react";
import TableView from "../../../components/TableView/TableView";
import toast from "react-hot-toast";
import {
  getAllDevices,
  getBlockedDevices,
  blockDevice,
  unblockDevice,
  deleteDevice,
  getRiskBlockCodes,
} from "../../../redux/apis/apisRiskManagement";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Label } from "../../../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Badge } from "../../../components/ui/badge";
import { RefreshCw, Lock, Unlock, Trash2, ChevronDown, Plus, Smartphone } from "lucide-react";
import { Input as AntInput } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { Textarea } from "../../../components/ui/textarea";
import { Input } from "../../../components/ui/input";

const DeviceManagement = () => {
  const [activeTab, setActiveTab] = useState<"all" | "blocked">("all");
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPage, setTotalPage] = useState(1);

  // Block Device Modal State
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [selectedDeviceForBlock, setSelectedDeviceForBlock] = useState<any>(null);
  const [blockReason, setBlockReason] = useState("");
  const [isBlockingDevice, setIsBlockingDevice] = useState(false);

  // Unblock Device Modal State
  const [isUnblockModalOpen, setIsUnblockModalOpen] = useState(false);
  const [selectedDeviceForUnblock, setSelectedDeviceForUnblock] = useState<any>(null);
  const [isUnblockingDevice, setIsUnblockingDevice] = useState(false);

  // NID Associations Modal State
  const [isNidModalOpen, setIsNidModalOpen] = useState(false);
  const [selectedDeviceForNids, setSelectedDeviceForNids] = useState<any>(null);

  // Add / Block Device Modal State
  const [isAddDeviceModalOpen, setIsAddDeviceModalOpen] = useState(false);
  const [addDeviceId, setAddDeviceId] = useState("");
  const [addDeviceReason, setAddDeviceReason] = useState("");
  const [isAddingDevice, setIsAddingDevice] = useState(false);
  const [addDeviceErrors, setAddDeviceErrors] = useState<Record<string, string>>({});

  const [blockCodes, setBlockCodes] = useState<any[]>([]);
  const [addDeviceBlockCodeId, setAddDeviceBlockCodeId] = useState("");
  const [blockModalBlockCodeId, setBlockModalBlockCodeId] = useState("");

  // Delete Device Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDeviceForDelete, setSelectedDeviceForDelete] = useState<any>(null);
  const [isDeletingDevice, setIsDeletingDevice] = useState(false);

  // Debounce search so we don't refetch / refilter on every keystroke
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(handle);
  }, [searchTerm]);

  useEffect(() => {
    fetchDevicesData();
  }, [activeTab, page, pageSize, debouncedSearch]);

  useEffect(() => {
    getRiskBlockCodes()
      .then((res) => {
        const list = Array.isArray(res?.data?.data) ? res.data.data : Array.isArray(res?.data) ? res.data : [];
        setBlockCodes(list.filter((bc: any) => bc.active !== false));
      })
      .catch(() => {});
  }, []);

  const fetchDevicesData = async () => {
    try {
      setIsLoading(true);
      const apiCall = activeTab === "all" ? getAllDevices : getBlockedDevices;
      const search = debouncedSearch || undefined;

      // Backend uses 0-based indexing for page
      const response = await apiCall(page - 1, pageSize, search);

      // The devices endpoint may return the rows as response.data.data,
      // response.data.content (Spring Page), or response.data itself.
      const payload = response?.data ?? {};
      const list = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.content)
          ? payload.content
          : Array.isArray(payload)
            ? payload
            : [];
      setData(list);

      // Pagination metadata can live under .pagination / .pageInfo, or at the
      // top level (Spring Page). Read whichever is present so navigation works.
      const meta = payload?.pagination ?? payload?.pageInfo ?? payload ?? {};
      const totalElements =
        meta?.totalElements ?? meta?.totalCount ?? meta?.total;
      if (totalElements != null) {
        setTotalRows(totalElements);
        setTotalPage(
          meta?.totalPages ?? Math.max(1, Math.ceil(totalElements / pageSize))
        );
      } else {
        // No total available — fall back to the current page's length.
        setTotalRows(list.length);
        setTotalPage(Math.ceil(list.length / pageSize) || 1);
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to fetch devices"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDevice = async () => {
    const errors: Record<string, string> = {};
    if (!addDeviceId.trim()) errors.deviceId = "Device ID is required";
    if (!addDeviceReason.trim()) errors.reason = "Reason is required";
    if (Object.keys(errors).length) { setAddDeviceErrors(errors); return; }
    try {
      setIsAddingDevice(true);
      const response = await blockDevice({
        deviceId: addDeviceId.trim(),
        reason: addDeviceReason.trim(),
        ...(addDeviceBlockCodeId ? { blockCodeId: addDeviceBlockCodeId } : {}),
      });
      if (response?.data?.success || response?.status === 200 || response?.status === 201) {
        toast.success(response?.data?.message || "Device blocked successfully");
        setIsAddDeviceModalOpen(false);
        setAddDeviceId("");
        setAddDeviceReason("");
        setAddDeviceBlockCodeId("");
        setAddDeviceErrors({});
        fetchDevicesData();
      } else {
        toast.error(response?.data?.message || "Failed to block device");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to block device");
    } finally {
      setIsAddingDevice(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const truncateHash = (hash: string, length: number = 16) => {
    if (!hash) return "-";
    return hash.substring(0, length) + "...";
  };

  // Handler to open block modal
  const openBlockModal = (device: any) => {
    setSelectedDeviceForBlock(device);
    setBlockReason("");
    setBlockModalBlockCodeId("");
    setIsBlockModalOpen(true);
  };

  // Handler to close block modal
  const closeBlockModal = () => {
    setIsBlockModalOpen(false);
    setSelectedDeviceForBlock(null);
    setBlockReason("");
    setBlockModalBlockCodeId("");
    setIsBlockingDevice(false);
  };

  // Handler to submit block request
  const handleBlockDevice = async () => {
    if (!selectedDeviceForBlock) {
      toast.error("Device not selected");
      return;
    }

    if (!blockReason.trim()) {
      toast.error("Please provide a reason for blocking the device");
      return;
    }

    try {
      setIsBlockingDevice(true);
      const response = await blockDevice({
        deviceId: selectedDeviceForBlock.deviceId,
        reason: blockReason.trim(),
        ...(blockModalBlockCodeId ? { blockCodeId: blockModalBlockCodeId } : {}),
      });

      if (response?.data?.success || response?.status === 200) {
        toast.success(response?.data?.message || "Device blocked successfully");
        closeBlockModal();
        // Refresh the devices list
        fetchDevicesData();
      } else {
        toast.error(response?.data?.message || "Failed to block device");
      }
    } catch (error: any) {
      console.error("Error blocking device:", error);
      toast.error(
        error?.response?.data?.message || error?.message || "Failed to block device"
      );
    } finally {
      setIsBlockingDevice(false);
    }
  };

  // Handler to open unblock modal
  const openUnblockModal = (device: any) => {
    setSelectedDeviceForUnblock(device);
    setIsUnblockModalOpen(true);
  };

  // Handler to close unblock modal
  const closeUnblockModal = () => {
    setIsUnblockModalOpen(false);
    setSelectedDeviceForUnblock(null);
    setIsUnblockingDevice(false);
  };

  // Handler to submit unblock request
  const handleUnblockDevice = async () => {
    if (!selectedDeviceForUnblock) {
      toast.error("Device not selected");
      return;
    }

    try {
      setIsUnblockingDevice(true);
      const response = await unblockDevice(selectedDeviceForUnblock.deviceId);

      if (response?.data?.success || response?.status === 200) {
        toast.success(response?.data?.message || "Device unblocked successfully");
        closeUnblockModal();
        // Refresh the devices list
        fetchDevicesData();
      } else {
        toast.error(response?.data?.message || "Failed to unblock device");
      }
    } catch (error: any) {
      console.error("Error unblocking device:", error);
      toast.error(
        error?.response?.data?.message || error?.message || "Failed to unblock device"
      );
    } finally {
      setIsUnblockingDevice(false);
    }
  };

  // Handler to open delete modal
  const openDeleteModal = (device: any) => {
    setSelectedDeviceForDelete(device);
    setIsDeleteModalOpen(true);
  };

  // Handler to close delete modal
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedDeviceForDelete(null);
    setIsDeletingDevice(false);
  };

  // Handler to submit delete request
  const handleDeleteDevice = async () => {
    if (!selectedDeviceForDelete) {
      toast.error("Device not selected");
      return;
    }

    try {
      setIsDeletingDevice(true);
      const response = await deleteDevice(selectedDeviceForDelete.deviceId);

      if (response?.data?.success || response?.status === 200) {
        toast.success(response?.data?.message || "Device deleted successfully");
        closeDeleteModal();
        // Refresh the devices list
        fetchDevicesData();
      } else {
        toast.error(response?.data?.message || "Failed to delete device");
      }
    } catch (error: any) {
      console.error("Error deleting device:", error);
      toast.error(
        error?.response?.data?.message || error?.message || "Failed to delete device"
      );
    } finally {
      setIsDeletingDevice(false);
    }
  };

  const blockCodeMap: Record<string, string> = {};
  blockCodes.forEach((bc: any) => { blockCodeMap[bc.id] = bc.code; });

  const allDevicesHeaders = [
    {
      name: "Device ID",
      selector: (row: any) => row.deviceId || "-",
      sortable: true,
      width: "200px",
    },
    {
      name: "Fingerprint",
      cell: (row: any) => (
        <span className="font-mono text-xs text-muted-foreground cursor-help" title={row.deviceFingerprint}>
          {row.deviceFingerprint|| "-"}
        </span>
      ),
      width: "350",
    },
    {
      name: "Status",
      cell: (row: any) => (
        <Badge className={row.blocked ? "bg-red-100 text-red-700 hover:bg-red-100" : "bg-green-100 text-green-700 hover:bg-green-100"}>
          {row.blocked ? "Blocked" : "Active"}
        </Badge>
      ),
      width: "100px",
    },
    {
      name: "Total Attempts",
      cell: (row: any) => (
        <Badge variant="outline">{row.totalAttempts ?? row.attemptCount ?? 0}</Badge>
      ),
      width: "120px",
    },
    {
      name: "First Seen",
      cell: (row: any) => <span className="text-sm text-muted-foreground">{formatDate(row.firstSeenAt)}</span>,
      width: "160px",
    },
    {
      name: "Last Seen",
      cell: (row: any) => <span className="text-sm text-muted-foreground">{formatDate(row.lastSeenAt)}</span>,
      sortable: true,
      width: "160px",
    },
    {
      name: "Block Code",
      cell: (row: any) => {
        const code = row.blockCodeId ? (blockCodeMap[row.blockCodeId] || row.blockCode || null) : (row.blockCode || null);
        return code ? (
          <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground">
            {code}
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        );
      },
      width: "130px",
    },
    {
      name: "Actions",
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
              {Array.isArray(row.nidAssociations) && row.nidAssociations.length > 0 && (
                <DropdownMenuItem
                  onClick={() => { setSelectedDeviceForNids(row); setIsNidModalOpen(true); }}
                  className="cursor-pointer gap-2"
                >
                  <span>View Associations ({row.nidAssociations.length})</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => openBlockModal(row)}
                disabled={row.blocked}
                className="cursor-pointer gap-2"
              >
                <Lock className="h-4 w-4" />
                <span>Block Device</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => openDeleteModal(row)}
                className="cursor-pointer gap-2 text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-950"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Device</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      width: "120px",
    },
  ];

  const blockedDevicesHeaders = [
    {
      name: "Device ID",
      selector: (row: any) => row.deviceId || "-",
      sortable: true,
      width: "200px",
    },
    {
      name: "Block Source",
      cell: (row: any) => (
        <Badge variant="destructive" className="text-xs" title={row.blockSource}>
          {row.blockSource || "MANUAL"}
        </Badge>
      ),
      width: "250px",
    },
    {
      name: "Block Type",
      cell: (row: any) => (
        <Badge
          className={`text-xs ${
            row.blockType === "SOFT_BLOCK"
              ? "bg-orange-100 text-orange-700 hover:bg-orange-100"
              : "bg-red-100 text-red-700 hover:bg-red-100"
          }`}
        >
          {row.blockType || "UNKNOWN"}
        </Badge>
      ),
      width: "130px",
    },
    {
      name: "Admin Blocked",
      cell: (row: any) => (
        <Badge className={row.adminBlocked ? "bg-red-100 text-red-700 hover:bg-red-100" : "bg-gray-100 text-gray-600 hover:bg-gray-100"}>
          {row.adminBlocked ? "Yes" : "No"}
        </Badge>
      ),
      width: "120px",
    },
    {
      name: "Total Attempts",
      cell: (row: any) => <Badge variant="outline">{row.totalAttempts ?? 0}</Badge>,
      width: "200px",
    },
    {
      name: "Block Reason",
      cell: (row: any) => (
        <span className="text-sm text-muted-foreground" title={row.blockReason || ""}>
          {row.blockReason || "-"}
        </span>
      ),
      width: "160px",
    },
    {
      name: "First Seen",
      cell: (row: any) => <span className="text-sm text-muted-foreground">{formatDate(row.firstSeenAt)}</span>,
      width: "160px",
    },
    {
      name: "Last Seen",
      cell: (row: any) => <span className="text-sm text-muted-foreground">{formatDate(row.lastSeenAt)}</span>,
      width: "160px",
    },
    {
      name: "Block Code",
      cell: (row: any) => {
        const code = row.blockCodeId ? (blockCodeMap[row.blockCodeId] || row.blockCode || null) : (row.blockCode || null);
        return code ? (
          <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground">
            {code}
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        );
      },
      width: "130px",
    },
    {
      name: "Actions",
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
              {Array.isArray(row.nidAssociations) && row.nidAssociations.length > 0 && (
                <DropdownMenuItem
                  onClick={() => { setSelectedDeviceForNids(row); setIsNidModalOpen(true); }}
                  className="cursor-pointer gap-2"
                >
                  <span>View Associations ({row.nidAssociations.length})</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => openUnblockModal(row)}
                className="cursor-pointer gap-2 text-green-600 dark:text-green-400 focus:bg-green-50 dark:focus:bg-green-950"
              >
                <Unlock className="h-4 w-4" />
                <span>Unblock Device</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => openDeleteModal(row)}
                className="cursor-pointer gap-2 text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-950"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Device</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      width: "120px",
    },
  ];

  const fromValue = totalRows > 0 ? (page - 1) * pageSize + 1 : 0;
  const toValue = Math.min(page * pageSize, totalRows);

  return (
    <div className="service device-management-page">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2 ps-0">
          <span className="pro-head-badge">
            <Smartphone className="h-4 w-4" />
          </span>
          Device Management
        </h3>
      </div>

      {/* Filters card */}
      <div className="pro-card p-3 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
          <AntInput
            allowClear
            placeholder="Search by Device ID, Fingerprint, Block Source..."
            prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: "1 1 240px", minWidth: 200, borderRadius: 2, height: 40 }}
          />
          <Button
            onClick={fetchDevicesData}
            disabled={isLoading}
            variant="outline"
            className="gap-2"
            style={{ flexShrink: 0, height: 40, whiteSpace: "nowrap" }}
          >
            <RefreshCw className="w-4 h-4" />
            {isLoading ? "Loading..." : "Refresh"}
          </Button>
        </div>
      </div>

        <style>{`
          .device-tabs-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            margin-bottom: 16px;
            flex-wrap: nowrap;
            border-bottom: 1px solid var(--border);
          }
          .device-tabs-list {
            background: transparent !important;
            padding: 0;
            border-radius: 0;
            height: auto;
            gap: 0;
            justify-content: flex-start;
            flex: 0 1 auto;
            width: auto;
          }
          .device-tabs-trigger {
            background: transparent !important;
            border: none !important;
            border-radius: 0 !important;
            color: var(--muted-foreground) !important;
            padding: 10px 16px !important;
            font-weight: 500;
            font-size: 14px;
            box-shadow: none !important;
            position: relative;
            transition: color 0.15s ease;
          }
          .device-tabs-trigger:hover {
            color: var(--foreground) !important;
          }
          .device-tabs-trigger[data-state="active"] {
            background: transparent !important;
            color: var(--foreground) !important;
            box-shadow: none !important;
            font-weight: 600;
          }
          .device-tabs-trigger[data-state="active"]::after {
            content: "";
            position: absolute;
            left: 12px;
            right: 12px;
            bottom: -1px;
            height: 2px;
            background-color: var(--foreground);
          }
          html.dark .device-tabs-trigger[data-state="active"] {
            color: #ffffff !important;
          }
          html.dark .device-tabs-trigger[data-state="active"]::after {
            background-color: #ffffff;
          }
        `}</style>

        <Tabs
          value={activeTab}
          onValueChange={(val) => {
            setActiveTab(val as any);
            setPage(1);
          }}
        >
          <div className="device-tabs-row">
            <TabsList className="device-tabs-list">
              <TabsTrigger value="all" className="device-tabs-trigger">
                All Devices
              </TabsTrigger>
              <TabsTrigger value="blocked" className="device-tabs-trigger">
                Blocked Devices
              </TabsTrigger>
            </TabsList>
            <Button
              className="gap-2"
              onClick={() => { setAddDeviceId(""); setAddDeviceReason(""); setAddDeviceErrors({}); setIsAddDeviceModalOpen(true); }}
              style={{ flexShrink: 0, height: 40, alignSelf: "center", marginBottom: 8 }}
            >
              <Plus className="w-4 h-4" />
              Block Device
            </Button>
          </div>

          {/* All Devices Tab */}
          <TabsContent value="all" className="mt-0">
            <div className="pro-card">

              <TableView
                header={allDevicesHeaders}
                data={data}
                totalRows={totalRows}
                from={fromValue}
                to={toValue}
                page={page}
                totalPage={totalPage}
                setPage={setPage}
                pageSize={pageSize}
                setPageSize={setPageSize}
                isLoading={isLoading}
                paginationShow={true}
              />
            </div>
          </TabsContent>

          {/* Blocked Devices Tab */}
          <TabsContent value="blocked" className="mt-0">
            <div className="pro-card">

              <TableView
                header={blockedDevicesHeaders}
                data={data}
                totalRows={totalRows}
                from={fromValue}
                to={toValue}
                page={page}
                totalPage={totalPage}
                setPage={setPage}
                pageSize={pageSize}
                setPageSize={setPageSize}
                isLoading={isLoading}
                paginationShow={true}
              />
            </div>
          </TabsContent>
        </Tabs>

      {/* Block Device Modal */}
      <Dialog open={isBlockModalOpen} onOpenChange={setIsBlockModalOpen}>
        <DialogContent className="sm:max-w-md" style={{ background: "var(--background)", color: "var(--foreground)", border: "1px solid var(--border)" }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ color: "var(--foreground)", fontSize: 16 }}>
              <Lock className="w-5 h-5" style={{ color: "var(--color-status-coral)" }} />
              Block Device
            </DialogTitle>
            {selectedDeviceForBlock && (
              <DialogDescription style={{ color: "var(--muted-foreground)", fontSize: 13 }}>
                Device ID: <span className="font-mono font-medium" style={{ color: "var(--foreground)" }}>{selectedDeviceForBlock.deviceId}</span>
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="space-y-3 mt-1">
            <label className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Reason for Blocking *</label>
            <Textarea
              placeholder="e.g. Identity farming detected — multiple NIDs from same device"
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              className="resize-none placeholder:text-muted-foreground"
              style={{ minHeight: 100, background: "var(--input)", color: "var(--foreground)", borderColor: "var(--border)" }}
              disabled={isBlockingDevice}
            />
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{blockReason.length}/500</p>
            <div className="space-y-1">
              <label className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Block Code (optional)</label>
              <Select
                value={blockModalBlockCodeId || "none"}
                onValueChange={(val) => setBlockModalBlockCodeId(val === "none" ? "" : val)}
                disabled={isBlockingDevice}
              >
                <SelectTrigger style={{ background: "var(--input)", color: "var(--foreground)", borderColor: "var(--border)" }}>
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
          <DialogFooter className="gap-2 mt-2">
            <Button variant="outline" onClick={closeBlockModal} disabled={isBlockingDevice}>
              Cancel
            </Button>
            <Button onClick={handleBlockDevice} disabled={isBlockingDevice || !blockReason.trim()} className="gap-2">
              <Lock className="w-4 h-4" />
              {isBlockingDevice ? "Blocking..." : "Block Device"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unblock Device Modal */}
      <Dialog open={isUnblockModalOpen} onOpenChange={setIsUnblockModalOpen}>
        <DialogContent className="sm:max-w-md" style={{ background: "var(--background)", color: "var(--foreground)", border: "1px solid var(--border)" }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ color: "var(--foreground)", fontSize: 16 }}>
              <Unlock className="w-5 h-5" style={{ color: "var(--color-status-green)" }} />
              Unblock Device
            </DialogTitle>
            {selectedDeviceForUnblock && (
              <DialogDescription style={{ color: "var(--muted-foreground)", fontSize: 13 }}>
                Device ID: <span className="font-mono font-medium" style={{ color: "var(--foreground)" }}>{selectedDeviceForUnblock.deviceId}</span>
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="py-3">
            <div className="p-3 rounded-lg" style={{ background: "var(--color-status-amber)", opacity: 0.9 }}>
              <p className="text-sm font-medium" style={{ color: "var(--primary-foreground)" }}>
                ⚠️ Are you sure you want to unblock this device? Users will be able to use it again.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={closeUnblockModal} disabled={isUnblockingDevice}>
              Cancel
            </Button>
            <Button onClick={handleUnblockDevice} disabled={isUnblockingDevice} className="gap-2">
              <Unlock className="w-4 h-4" />
              {isUnblockingDevice ? "Unblocking..." : "Unblock Device"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add / Block Device Modal */}
      <Dialog open={isAddDeviceModalOpen} onOpenChange={setIsAddDeviceModalOpen}>
        <DialogContent className="sm:max-w-md" style={{ background: "var(--background)", color: "var(--foreground)", border: "1px solid var(--border)" }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ color: "var(--foreground)", fontSize: 16 }}>
              <Lock className="w-5 h-5" style={{ color: "var(--color-status-coral)" }} />
              Block Device
            </DialogTitle>
            <DialogDescription style={{ color: "var(--muted-foreground)", fontSize: 13 }}>
              Enter the Device ID and reason to manually block a device.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-1">
            <div className="space-y-1">
              <label className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Device ID *</label>
              <Input
                placeholder="e.g. AP3A.240905.015.A2"
                value={addDeviceId}
                onChange={(e) => { setAddDeviceId(e.target.value); if (addDeviceErrors.deviceId) setAddDeviceErrors((p) => ({ ...p, deviceId: "" })); }}
                className="placeholder:text-muted-foreground"
                style={{ background: "var(--input)", color: "var(--foreground)", borderColor: addDeviceErrors.deviceId ? "var(--color-status-coral)" : "var(--border)" }}
                disabled={isAddingDevice}
              />
              {addDeviceErrors.deviceId && <p className="text-xs" style={{ color: "var(--color-status-coral)" }}>{addDeviceErrors.deviceId}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Reason *</label>
              <Textarea
                placeholder="e.g. Identity farming detected — multiple NIDs from same device"
                value={addDeviceReason}
                onChange={(e) => { setAddDeviceReason(e.target.value); if (addDeviceErrors.reason) setAddDeviceErrors((p) => ({ ...p, reason: "" })); }}
                className="resize-none placeholder:text-muted-foreground"
                style={{ minHeight: 100, background: "var(--input)", color: "var(--foreground)", borderColor: addDeviceErrors.reason ? "var(--color-status-coral)" : "var(--border)" }}
                disabled={isAddingDevice}
              />
              {addDeviceErrors.reason && <p className="text-xs" style={{ color: "var(--color-status-coral)" }}>{addDeviceErrors.reason}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Block Code (optional)</label>
              <Select
                value={addDeviceBlockCodeId || "none"}
                onValueChange={(val) => setAddDeviceBlockCodeId(val === "none" ? "" : val)}
                disabled={isAddingDevice}
              >
                <SelectTrigger style={{ background: "var(--input)", color: "var(--foreground)", borderColor: "var(--border)" }}>
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
          <DialogFooter className="gap-2 mt-2">
            <Button variant="outline" onClick={() => setIsAddDeviceModalOpen(false)} disabled={isAddingDevice}>
              Cancel
            </Button>
            <Button onClick={handleAddDevice} disabled={isAddingDevice} className="gap-2">
              <Lock className="w-4 h-4" />
              {isAddingDevice ? "Blocking..." : "Block Device"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* NID Associations Modal */}
      <Dialog open={isNidModalOpen} onOpenChange={setIsNidModalOpen}>
        <DialogContent className="max-h-[80vh] overflow-hidden flex flex-col" style={{ width: "min(95vw, 900px)", maxWidth: "900px" }}>
          <DialogHeader>
            <DialogTitle className="text-base">NID/Mobile Associations</DialogTitle>
            <DialogDescription className="text-xs">
              Device: <span className="font-mono font-medium text-foreground">{selectedDeviceForNids?.deviceId}</span>
              {selectedDeviceForNids?.blockSource && (
                <Badge variant="destructive" className="ml-2 text-xs">{selectedDeviceForNids.blockSource}</Badge>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-auto flex-1 mt-2">
            {Array.isArray(selectedDeviceForNids?.nidAssociations) && selectedDeviceForNids.nidAssociations.length > 0 ? (
              <table className="text-sm border-collapse" style={{ minWidth: "700px", width: "100%" }}>
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">#</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">NID</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">NID Hash</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">Mobile</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">Attempts</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">First Seen</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">Last Seen</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDeviceForNids.nidAssociations.map((assoc: any, idx: number) => (
                    <tr key={idx} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="px-3 py-2 text-muted-foreground">{idx + 1}</td>
                      <td className="px-3 py-2">
                        {assoc.nid ? (
                          <span className="font-medium">{assoc.nid}</span>
                        ) : (
                          <span className="text-muted-foreground italic">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <span className="font-mono text-xs text-muted-foreground cursor-help" title={assoc.nidHash}>
                          {assoc.nidHash ? truncateHash(assoc.nidHash, 14) : "-"}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        {assoc.mobileNumber || <span className="text-muted-foreground italic">—</span>}
                      </td>
                      <td className="px-3 py-2">
                        <Badge
                          style={{ background: assoc.attemptCount > 0 ? "var(--color-status-coral)" : undefined, color: assoc.attemptCount > 0 ? "var(--primary-foreground)" : undefined }}
                          variant={assoc.attemptCount > 0 ? "outline" : "outline"}
                          className="text-xs"
                        >
                          {assoc.attemptCount ?? 0}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">{formatDate(assoc.firstSeenAt)}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">{formatDate(assoc.lastSeenAt)}</td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => {
                            setIsNidModalOpen(false);
                            setAddDeviceId(selectedDeviceForNids?.deviceId || "");
                            setAddDeviceReason("");
                            setAddDeviceErrors({});
                            setIsAddDeviceModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border transition-colors"
                          style={{ background: "var(--color-status-coral)", color: "var(--primary-foreground)", borderColor: "transparent" }}
                        >
                          <Lock className="w-3 h-3" />
                          Block
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No NID associations found</p>
            )}
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsNidModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Device Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md" style={{ background: "var(--background)", color: "var(--foreground)", border: "1px solid var(--border)" }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ color: "var(--foreground)", fontSize: 16 }}>
              <Trash2 className="w-5 h-5" style={{ color: "var(--color-status-coral)" }} />
              Delete Device
            </DialogTitle>
            {selectedDeviceForDelete && (
              <DialogDescription style={{ color: "var(--muted-foreground)", fontSize: 13 }}>
                Device ID: <span className="font-mono font-medium" style={{ color: "var(--foreground)" }}>{selectedDeviceForDelete.deviceId}</span>
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="py-3">
            <div className="p-3 rounded-lg" style={{ background: "var(--color-status-coral)", opacity: 0.9 }}>
              <p className="text-sm font-medium" style={{ color: "var(--primary-foreground)" }}>
                ⚠️ This action cannot be undone. The device will be permanently deleted.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={closeDeleteModal} disabled={isDeletingDevice}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteDevice} disabled={isDeletingDevice} className="gap-2">
              <Trash2 className="w-4 h-4" />
              {isDeletingDevice ? "Deleting..." : "Delete Device"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeviceManagement;
