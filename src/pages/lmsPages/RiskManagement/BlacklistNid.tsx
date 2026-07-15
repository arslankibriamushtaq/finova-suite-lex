import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("riskManagement");
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
      toast.error(error?.response?.data?.message || t("blacklistNid.toast.fetchFailed"));
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
      toast.error(t("blacklistNid.validation.nidRequired"));
      return;
    }
    if (!formData.reason.trim()) {
      toast.error(t("blacklistNid.toast.reasonRequired"));
      return;
    }

    try {
      setIsSaving(true);
      await createBlacklistNid({
        nationalId: nid,
        reason: formData.reason.trim(),
        ...(formData.blockCodeId ? { blockCodeId: formData.blockCodeId } : {}),
      });
      toast.success(t("blacklistNid.toast.addSuccess"));
      setShowAddModal(false);
      fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("blacklistNid.toast.addFailed"));
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
      toast.success(t("blacklistNid.toast.removeSuccess"));
      setRemoveTarget(null);
      fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("blacklistNid.toast.removeFailed"));
    } finally {
      setIsRemoving(false);
    }
  };

  const headers = [
    {
      name: t("blacklistNid.col.nationalId"),
      selector: (row: any) => getNidValue(row),
      sortable: true,
    },
    {
      name: t("common:type"),
      selector: (row: any) => getNidType(row),
      sortable: true,
      width: "120px",
    },
    {
      name: t("blacklistNid.col.reason"),
      selector: (row: any) => row.reason || "-",
      sortable: true,
    },
    {
      name: t("common:status"),
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
      name: t("common:createdAt"),
      selector: (row: any) =>
        row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "-",
      sortable: true,
      width: "140px",
    },
    {
      name: t("blacklistNid.col.blockCode"),
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
      name: t("blacklistNid.col.action"),
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
                  {t("blacklistNid.action.select")}
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
                    {t("blacklistNid.action.reBlacklist")}
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
                    {t("blacklistNid.action.remove")}
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
                  {t("blacklistNid.action.assignBlockCode")}
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
          {t("blacklistNid.title")}
        </h3>
      </div>

      <div className="pro-card p-3 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
        <AntInput
          allowClear
          placeholder={t("blacklistNid.searchPlaceholder")}
          prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: "1 1 240px", minWidth: 200, borderRadius: 2, height: 40 }}
        />
        <Button className="gap-2" onClick={handleAdd} style={{ flexShrink: 0 }}>
          <Plus className="h-4 w-4" />
          {t("blacklistNid.addButton")}
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
            <DialogTitle>{t("blacklistNid.addModal.title")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("blacklistNid.field.nationalId")}</Label>
              <Input
                placeholder={t("blacklistNid.field.nationalIdPlaceholder")}
                value={formData.nationalId}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({ ...formData, nationalId: val });
                  setNidError(val.trim() ? "" : t("blacklistNid.validation.nidRequired"));
                }}
                className={nidError ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {nidError && <p className="text-xs text-red-500">{nidError}</p>}
            </div>
            <div className="space-y-2">
              <Label>{t("blacklistNid.field.reason")}</Label>
              <Input
                placeholder={t("blacklistNid.field.reasonPlaceholder")}
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("blacklistNid.field.blockCode")}</Label>
              <Select
                value={formData.blockCodeId || "none"}
                onValueChange={(val) => setFormData({ ...formData, blockCodeId: val === "none" ? "" : val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("blacklistNid.field.blockCodePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("common:none")}</SelectItem>
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
              {t("common:cancel")}
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? t("blacklistNid.save.saving") : t("blacklistNid.save.submit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Confirmation Modal */}
      <Dialog open={!!removeTarget} onOpenChange={(open) => !open && setRemoveTarget(null)}>
        <DialogContent className="max-w-[420px]">
          <DialogHeader>
            <DialogTitle>{t("blacklistNid.removeModal.title")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {t("blacklistNid.removeModal.confirmPrefix")}{" "}
            <span className="font-medium text-foreground">
              {removeTarget ? getNidValue(removeTarget) : ""}
            </span>{" "}
            {t("blacklistNid.removeModal.confirmSuffix")}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveTarget(null)} disabled={isRemoving}>
              {t("common:cancel")}
            </Button>
            <Button variant="destructive" onClick={confirmRemove} disabled={isRemoving}>
              {isRemoving ? t("blacklistNid.remove.removing") : t("blacklistNid.remove.submit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Block Code Modal */}
      <Dialog open={!!assignNidTarget} onOpenChange={(open) => !open && setAssignNidTarget(null)}>
        <DialogContent className="max-w-[420px]">
          <DialogHeader>
            <DialogTitle>{t("blacklistNid.assignModal.title")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-1">
            <Label className="font-semibold">{t("blacklistNid.field.blockCode")}</Label>
            <Select
              value={selectedNidBlockCodeId || ""}
              onValueChange={(val) => setSelectedNidBlockCodeId(val)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("blacklistNid.assign.placeholder")} />
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
              {t("common:cancel")}
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
                  toast.success(t("blacklistNid.toast.assignSuccess"));
                  setAssignNidTarget(null);
                  fetchData();
                } catch (error: any) {
                  toast.error(error?.response?.data?.message || t("blacklistNid.toast.assignFailed"));
                } finally {
                  setIsAssigningNid(false);
                }
              }}
              disabled={isAssigningNid || !selectedNidBlockCodeId}
            >
              {isAssigningNid ? t("blacklistNid.assign.assigning") : t("blacklistNid.assign.submit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BlacklistNid;
