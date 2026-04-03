import { useState, useEffect } from "react";
import TableView from "../../../components/TableView/TableView";
import toast from "react-hot-toast";
import {
  getAllDevices,
  getBlockedDevices,
  blockDevice,
  unblockDevice,
  deleteDevice,
} from "../../../redux/apis/apisRiskManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";
import { Search, RefreshCw, Lock, Unlock, Trash2, ChevronDown } from "lucide-react";
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

const DeviceManagement = () => {
  const [activeTab, setActiveTab] = useState<"all" | "blocked">("all");
  const [isLoading, setIsLoading] = useState(false);
  const [allDevicesData, setAllDevicesData] = useState<any[]>([]);
  const [blockedDevicesData, setBlockedDevicesData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Block Device Modal State
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [selectedDeviceForBlock, setSelectedDeviceForBlock] = useState<any>(null);
  const [blockReason, setBlockReason] = useState("");
  const [isBlockingDevice, setIsBlockingDevice] = useState(false);

  // Unblock Device Modal State
  const [isUnblockModalOpen, setIsUnblockModalOpen] = useState(false);
  const [selectedDeviceForUnblock, setSelectedDeviceForUnblock] = useState<any>(null);
  const [isUnblockingDevice, setIsUnblockingDevice] = useState(false);

  // Delete Device Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDeviceForDelete, setSelectedDeviceForDelete] = useState<any>(null);
  const [isDeletingDevice, setIsDeletingDevice] = useState(false);

  useEffect(() => {
    fetchDevicesData();
  }, []);

  const fetchDevicesData = async () => {
    try {
      setIsLoading(true);
      // Fetch all devices
      const allResponse = await getAllDevices();
      const allList = allResponse?.data?.data || allResponse?.data || [];
      setAllDevicesData(Array.isArray(allList) ? allList : []);

      // Fetch blocked devices
      const blockedResponse = await getBlockedDevices();
      const blockedList = blockedResponse?.data?.data || blockedResponse?.data || [];
      setBlockedDevicesData(Array.isArray(blockedList) ? blockedList : []);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to fetch devices"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredData = (data: any[]) => {
    if (!searchTerm) return data;
    const term = searchTerm.toLowerCase();
    return data.filter((item) => {
      return (
        (item?.deviceId || "").toLowerCase().includes(term) ||
        (item?.deviceFingerprint || "").toLowerCase().includes(term) ||
        (item?.blockSource || "").toLowerCase().includes(term) ||
        (item?.blockReason || "").toLowerCase().includes(term)
      );
    });
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
    setIsBlockModalOpen(true);
  };

  // Handler to close block modal
  const closeBlockModal = () => {
    setIsBlockModalOpen(false);
    setSelectedDeviceForBlock(null);
    setBlockReason("");
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

  const allDevicesHeaders = [
    {
      name: "Device ID",
      selector: (row: any) => row.deviceId || "-",
      sortable: true,
    //   width: "130px",
    },
    // {
    //   name: "Fingerprint",
    //   cell: (row: any) => (
    //     <span
    //       className="text-xs text-muted-foreground font-mono cursor-help"
    //       title={row.deviceFingerprint}
    //     >
    //       {truncateHash(row.deviceFingerprint)}
    //     </span>
    //   ),
    //   sortable: true,
    // //   width: "150px",
    // },
    {
      name: "NID Hash",
      cell: (row: any) => (
        <span
          className="text-xs text-muted-foreground font-mono cursor-help"
          title={row.nidHash}
        >
          {truncateHash(row.nidHash)}
        </span>
      ),
      sortable: true,
    },
    {
      name: "Attempts",
      cell: (row: any) => (
        <Badge variant="outline" className="font-mono">
          {row.attemptCount || 0}
        </Badge>
      ),
    },
    {
      name: "NID Associations",
      cell: (row: any) => (
        <Badge variant="secondary" className="font-mono text-white">
          {row.nidAssociationCount || 0}
        </Badge>
      ),
    },
    {
      name: "Status",
      cell: (row: any) => (
        <Badge
          className={`${
            row.blocked
              ? "bg-red-100 text-red-700 hover:bg-red-100"
              : "bg-green-100 text-green-700 hover:bg-green-100"
          }`}
        >
          {row.blocked ? "Blocked" : "Active"}
        </Badge>
      ),
    },
    {
      name: "Last Seen",
      cell: (row: any) => (
        <div className="text-sm text-muted-foreground">
          {formatDate(row.lastSeenAt)}
        </div>
      ),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
            >
              Select <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
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
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
  ];

  const blockedDevicesHeaders = [
    {
      name: "Device ID",
      selector: (row: any) => row.deviceId || "-",
      sortable: true,
    },
    // {
    //   name: "Fingerprint",
    //   cell: (row: any) => (
    //     <span
    //       className="text-xs text-muted-foreground font-mono cursor-help"
    //       title={row.deviceFingerprint}
    //     >
    //       {truncateHash(row.deviceFingerprint)}
    //     </span>
    //   ),
    //   sortable: true,
    // },
    {
      name: "Block Source",
      cell: (row: any) => (
        <Badge
          variant="destructive"
          className="text-xs"
          title={row.blockSource}
        >
          {row.blockSource || "MANUAL"}
        </Badge>
      ),
      sortable: true,
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
      sortable: true,
    },
    {
      name: "Attempts",
      cell: (row: any) => (
        <Badge variant="outline" className="font-mono">
          {row.totalAttempts || 0}
        </Badge>
      ),
    },
    {
      name: "NID Count",
      cell: (row: any) => (
        <Badge variant="secondary" className="font-mono text-white">
          {row.totalNidAssociations || 0}
        </Badge>
      ),
    },
    {
      name: "Block Reason",
      cell: (row: any) => (
        <div className="text-sm text-muted-foreground truncate" title={row.blockReason}>
          {row.blockReason || "-"}
        </div>
      ),
      sortable: true,
    },
    {
      name: "First Seen",
      cell: (row: any) => (
        <div className="text-sm text-muted-foreground">
          {formatDate(row.firstSeenAt)}
        </div>
      ),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
            >
              Select <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
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
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
  ];

  const currentData = activeTab === "all" ? allDevicesData : blockedDevicesData;
  const filteredData = getFilteredData(currentData);

  // Client-side pagination (same pattern as AllCustomers.tsx)
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const total = filteredData.length;
  const paginatedData = filteredData.slice(startIndex, endIndex);
  const fromValue = total > 0 ? startIndex + 1 : 0;
  const toValue = Math.min(endIndex, total);
  const totalPage = Math.ceil(total / pageSize) || 1;

  // Reset to page 1 when search or tab changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm, activeTab]);

  return (
    <div className="w-full h-full bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Device Management</h1>
            <p className="text-muted-foreground">Monitor and manage registered devices</p>
          </div>
          <Button
            onClick={fetchDevicesData}
            disabled={isLoading}
            size="sm"
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            {isLoading ? "Loading..." : "Refresh"}
          </Button>
        </div>

        {/* Search Bar - Improved UI */}
        <div className="mb-6">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search by Device ID, Fingerprint, Block Source..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="pl-12! pr-4 py-2.5 bg-white dark:bg-slate-950 border border-input rounded-lg focus-visible:ring-1"
            />
          </div>
        </div>

        {/* Tabs - Improved Design */}
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)}>
          <div className="mb-4">
            <TabsList className="w-fit bg-[var(--theme-inactive-tab)] p-1 h-auto gap-2 rounded-lg">
              <TabsTrigger
                value="all"
                className="rounded-md border-0 px-6 py-2.5 font-medium text-base transition-all duration-200 data-[state=active]:bg-[var(--theme-secondary)] data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-muted/50"
              >
                <span className="flex items-center gap-2">
                  All Devices
                  {/* <Badge variant={activeTab === "all" ? "secondary" : "outline"} className="ml-2">
                    {allDevicesData.length}
                  </Badge> */}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="blocked"
                className="rounded-md border-0 px-6 py-2.5 font-medium text-base transition-all duration-200 data-[state=active]:bg-[var(--theme-secondary)] data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-muted/50"
              >
                <span className="flex items-center gap-2">
                  Blocked Devices
                  {/* <Badge variant={activeTab === "blocked" ? "secondary" : "outline"} className="ml-2">
                    {blockedDevicesData.length}
                  </Badge> */}
                </span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* All Devices Tab */}
          <TabsContent value="all" className="mt-0">
            <div className="bg-white dark:bg-slate-950 rounded-lg border border-border shadow-sm">
              <TableView
                header={allDevicesHeaders}
                data={paginatedData}
                totalRows={total}
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
            <div className="bg-white dark:bg-slate-950 rounded-lg border border-border shadow-sm">
              <TableView
                header={blockedDevicesHeaders}
                data={paginatedData}
                totalRows={total}
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
      </div>

      {/* Block Device Modal */}
      <Dialog open={isBlockModalOpen} onOpenChange={setIsBlockModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 mb-0">
              <Lock className="w-5 h-5 text-destructive" />
              Block Device
            </DialogTitle>
            <DialogDescription className="mb-0">
              {selectedDeviceForBlock && (
                <div className="mt-0 space-y-2">
                  <p className="text-sm">
                    <span className="font-medium text-foreground">Device ID:</span>
                    <br />
                    <span className="text-xs font-mono bg-muted px-2 py-1 rounded mt-1 inline-block">
                      {selectedDeviceForBlock.deviceId}
                    </span>
                  </p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Reason for Blocking
              </label>
              <Textarea
                placeholder="Enter the reason for blocking this device (e.g., Identity farming detected — multiple NIDs from same device)"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                className="min-h-[120px] resize-none"
                disabled={isBlockingDevice}
              />
              <p className="text-xs text-muted-foreground">
                {blockReason.length}/500 characters
              </p>
            </div>
          </div>

          <DialogFooter className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={closeBlockModal}
              disabled={isBlockingDevice}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleBlockDevice}
              disabled={isBlockingDevice || !blockReason.trim()}
              className="gap-2"
            >
              {isBlockingDevice ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Blocking...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Block Device
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unblock Device Modal */}
      <Dialog open={isUnblockModalOpen} onOpenChange={setIsUnblockModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 mb-0">
              <Unlock className="w-5 h-5 text-green-600" />
              Unblock Device
            </DialogTitle>
            <DialogDescription className="mb-0">
              {selectedDeviceForUnblock && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm">
                    <span className="font-medium text-foreground">Device ID:</span>
                    <br />
                    <span className="text-xs font-mono bg-muted px-2 py-1 rounded mt-1 inline-block">
                      {selectedDeviceForUnblock.deviceId}
                    </span>
                  </p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-900">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ Are you sure you want to unblock this device? Users will be able to use this device again.
              </p>
            </div>
          </div>

          <DialogFooter className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={closeUnblockModal}
              disabled={isUnblockingDevice}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUnblockDevice}
              disabled={isUnblockingDevice}
              className="gap-2 bg-green-600 hover:bg-green-700 text-white"
            >
              {isUnblockingDevice ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Unblocking...
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  Unblock Device
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Device Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 mb-0">
              <Trash2 className="w-5 h-5 text-destructive" />
              Delete Device
            </DialogTitle>
            <DialogDescription className="mb-0">
              {selectedDeviceForDelete && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm">
                    <span className="font-medium text-foreground">Device ID:</span>
                    <br />
                    <span className="text-xs font-mono bg-muted px-2 py-1 rounded mt-1 inline-block">
                      {selectedDeviceForDelete.deviceId}
                    </span>
                  </p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-900">
              <p className="text-sm text-red-800 dark:text-red-200">
                ⚠️ This action cannot be undone. The device will be permanently deleted from the system.
              </p>
            </div>
          </div>

          <DialogFooter className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={closeDeleteModal}
              disabled={isDeletingDevice}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDeleteDevice}
              disabled={isDeletingDevice}
              variant="destructive"
              className="gap-2"
            >
              {isDeletingDevice ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete Device
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeviceManagement;
