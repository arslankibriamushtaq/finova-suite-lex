import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import TableView from "../../../components/TableView/TableView";
import toast from "react-hot-toast";
import {
  getAllBlacklistMobile,
  createBlacklistMobile,
  removeBlacklistMobile,
  getRiskBlockCodes,
  assignBlockCodeToMobile,
} from "../../../redux/apis/apisRiskManagement";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Link2 } from "lucide-react";
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
import { ChevronDown, Plus, ShieldOff, ShieldCheck, Smartphone } from "lucide-react";
import { Input as AntInput } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { usePermissions, RISK_BLACKLIST_PERMISSIONS } from "../../../hooks/useProductPermissions";

const PHONE_CODES = ["+966","+971","+965","+973","+968","+974","+962","+961","+20","+92","+91","+1","+44"];

const splitPhoneCode = (full: string): { phoneCode: string; local: string } => {
  const sorted = [...PHONE_CODES].sort((a, b) => b.length - a.length);
  for (const code of sorted) {
    if (full.startsWith(code)) return { phoneCode: code, local: full.slice(code.length) };
  }
  return { phoneCode: "+966", local: full };
};

const BlacklistMobile = () => {
  const { t } = useTranslation("riskManagement");
  const { hasPermission } = usePermissions();
  const canCreateBlacklist = hasPermission(RISK_BLACKLIST_PERMISSIONS.CREATE);
  const canDeleteBlacklist = hasPermission(RISK_BLACKLIST_PERMISSIONS.DELETE);
  const canAssignBlockCode = hasPermission(RISK_BLACKLIST_PERMISSIONS.CHECK);
  const canRowActions = canCreateBlacklist || canDeleteBlacklist || canAssignBlockCode;
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Add modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ phoneCode: "+966", mobileNumber: "", reason: "", blockCodeId: "" });
  const [isSaving, setIsSaving] = useState(false);

  // Remove modal
  const [removeTarget, setRemoveTarget] = useState<any>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const [blockCodes, setBlockCodes] = useState<any[]>([]);
  const [assignMobileTarget, setAssignMobileTarget] = useState<any>(null);
  const [selectedMobileBlockCodeId, setSelectedMobileBlockCodeId] = useState("");
  const [isAssigningMobile, setIsAssigningMobile] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    getRiskBlockCodes()
      .then((res) => {
        const list = Array.isArray(res?.data?.data) ? res.data.data : Array.isArray(res?.data) ? res.data : [];
        setBlockCodes(list.filter((bc: any) => bc.active !== false));
      })
      .catch(() => {});
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await getAllBlacklistMobile();
      const list = response?.data?.data || response?.data || [];
      setData(Array.isArray(list) ? list : []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("blacklistMobile.toast.fetchFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData({ phoneCode: "+966", mobileNumber: "", reason: "", blockCodeId: "" });
    setShowAddModal(true);
  };

  const handleSave = async () => {
    const localNumber = formData.mobileNumber.trim();
    if (!localNumber) {
      toast.error(t("blacklistMobile.toast.mobileRequired"));
      return;
    }
    if (!/^\d+$/.test(localNumber)) {
      toast.error(t("blacklistMobile.toast.mobileDigits"));
      return;
    }
    if (!formData.reason.trim()) {
      toast.error(t("blacklistMobile.toast.reasonRequired"));
      return;
    }
    const fullNumber = formData.phoneCode + localNumber;
    try {
      setIsSaving(true);
      await createBlacklistMobile({
        mobileNumber: fullNumber,
        reason: formData.reason.trim(),
        ...(formData.blockCodeId ? { blockCodeId: formData.blockCodeId } : {}),
      });
      toast.success(t("blacklistMobile.toast.addSuccess"));
      setShowAddModal(false);
      fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("blacklistMobile.toast.addFailed"));
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
      toast.success(t("blacklistMobile.toast.removeSuccess"));
      setRemoveTarget(null);
      fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("blacklistMobile.toast.removeFailed"));
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

  const blockCodeMap: Record<string, string> = {};
  blockCodes.forEach((bc: any) => { blockCodeMap[bc.id] = bc.code; });

  const headers = [
    {
      name: t("blacklistMobile.col.mobileNumber"),
      selector: (row: any) => row.mobileNumber || row.mobile || "-",
      sortable: true,
    },
    {
      name: t("blacklistMobile.col.reason"),
      selector: (row: any) => row.reason || "-",
      sortable: true,
    },
    {
      name: t("common:status"),
      cell: (row: any) => {
        const status = row.status || "BLACKLISTED";
        const isBlacklisted = status === "BLACKLISTED";
        return (
          <span className={isBlacklisted ? "text-red-600 font-medium" : "text-slate-500 font-medium"}>
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
      name: t("blacklistMobile.col.blockCode"),
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
      name: t("blacklistMobile.col.action"),
      cell: (row: any) => {
        const status = row.status || "BLACKLISTED";
        if (status !== "BLACKLISTED" && status !== "REMOVED") return null;
        if (!canRowActions) return <span className="text-muted-foreground">-</span>;
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
                  {t("blacklistMobile.action.select")}
                  <ChevronDown className="h-4 w-4 shrink-0 opacity-80" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="bottom" className="z-[9999]" sideOffset={4}>
                {status === "REMOVED" ? (
                  <>
                    {canCreateBlacklist && (
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                        const { phoneCode, local } = splitPhoneCode(row.mobileNumber || row.mobile || "");
                        setFormData({ phoneCode, mobileNumber: local, reason: row.reason || "", blockCodeId: "" });
                        setShowAddModal(true);
                      }}
                    >
                      <ShieldCheck className="h-4 w-4" />
                      {t("blacklistMobile.action.reBlacklist")}
                    </DropdownMenuItem>
                    )}
                    {canAssignBlockCode && (
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                        setAssignMobileTarget(row);
                        setSelectedMobileBlockCodeId(row.blockCodeId || "");
                      }}
                    >
                      <Link2 className="h-4 w-4" />
                      {t("blacklistMobile.action.assignBlockCode")}
                    </DropdownMenuItem>
                    )}
                  </>
                ) : (
                  <>
                    {canDeleteBlacklist && (
                    <DropdownMenuItem
                      variant="destructive"
                      onSelect={(e) => {
                        e.preventDefault();
                        setRemoveTarget(row);
                      }}
                    >
                      <ShieldOff className="h-4 w-4" />
                      {t("blacklistMobile.action.remove")}
                    </DropdownMenuItem>
                    )}
                    {canAssignBlockCode && (
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                        setAssignMobileTarget(row);
                        setSelectedMobileBlockCodeId(row.blockCodeId || "");
                      }}
                    >
                      <Link2 className="h-4 w-4" />
                      {t("blacklistMobile.action.assignBlockCode")}
                    </DropdownMenuItem>
                    )}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
      width: "120px",
    },
  ];

  return (
    <div className="service">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2 ps-0">
          <span className="pro-head-badge">
            <Smartphone className="h-4 w-4" />
          </span>
          {t("blacklistMobile.title")}
        </h3>
      </div>

      <div className="pro-card p-3 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-2 w-100">
        <AntInput
          allowClear
          placeholder={t("blacklistMobile.searchPlaceholder")}
          prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: "1 1 240px", minWidth: 200, borderRadius: 2, height: 40 }}
        />
        {canCreateBlacklist && (
          <Button className="gap-2" onClick={handleAdd} style={{ flexShrink: 0 }}>
            <Plus className="h-4 w-4" />
            {t("blacklistMobile.addButton")}
          </Button>
        )}
        </div>
      </div>

      <div className="pro-card">
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
      </div>

      {/* Add Modal */}
      <Dialog open={showAddModal} onOpenChange={(open) => !open && setShowAddModal(false)}>
        <DialogContent className="max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("blacklistMobile.addModal.title")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("blacklistMobile.field.mobileNumber")}</Label>
              <div className="flex gap-2">
                <Select
                  value={formData.phoneCode}
                  onValueChange={(val) => setFormData({ ...formData, phoneCode: val })}
                >
                  <SelectTrigger className="w-[100px] shrink-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PHONE_CODES.map((code) => (
                      <SelectItem key={code} value={code}>{code}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder={t("blacklistMobile.field.mobileNumberPlaceholder")}
                  value={formData.mobileNumber}
                  onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value.replace(/\D/g, "") })}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("blacklistMobile.field.reason")}</Label>
              <Input
                placeholder={t("blacklistMobile.field.reasonPlaceholder")}
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("blacklistMobile.field.blockCode")}</Label>
              <Select
                value={formData.blockCodeId || "none"}
                onValueChange={(val) => setFormData({ ...formData, blockCodeId: val === "none" ? "" : val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("blacklistMobile.field.blockCodePlaceholder")} />
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
              {isSaving ? t("blacklistMobile.save.saving") : t("blacklistMobile.save.submit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Confirmation Modal */}
      <Dialog open={!!removeTarget} onOpenChange={(open) => !open && setRemoveTarget(null)}>
        <DialogContent className="max-w-[420px]">
          <DialogHeader>
            <DialogTitle>{t("blacklistMobile.removeModal.title")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {t("blacklistMobile.removeModal.confirmPrefix")}{" "}
            <span className="font-medium text-foreground">
              {removeTarget?.mobileNumber || removeTarget?.mobile}
            </span>{" "}
            {t("blacklistMobile.removeModal.confirmSuffix")}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveTarget(null)} disabled={isRemoving}>
              {t("common:cancel")}
            </Button>
            <Button variant="destructive" onClick={confirmRemove} disabled={isRemoving}>
              {isRemoving ? t("blacklistMobile.remove.removing") : t("blacklistMobile.remove.submit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Block Code Modal */}
      <Dialog open={!!assignMobileTarget} onOpenChange={(open) => !open && setAssignMobileTarget(null)}>
        <DialogContent className="max-w-[420px]">
          <DialogHeader>
            <DialogTitle>{t("blacklistMobile.assignModal.title")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-1">
            <Label className="font-semibold">{t("blacklistMobile.field.blockCode")}</Label>
            <Select
              value={selectedMobileBlockCodeId || ""}
              onValueChange={(val) => setSelectedMobileBlockCodeId(val)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("blacklistMobile.assign.placeholder")} />
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
            <Button variant="outline" onClick={() => setAssignMobileTarget(null)} disabled={isAssigningMobile}>
              {t("common:cancel")}
            </Button>
            <Button
              onClick={async () => {
                if (!assignMobileTarget || !selectedMobileBlockCodeId) return;
                const mobile = assignMobileTarget.mobileNumber || assignMobileTarget.mobile;
                try {
                  setIsAssigningMobile(true);
                  await assignBlockCodeToMobile(mobile, selectedMobileBlockCodeId);
                  toast.success(t("blacklistMobile.toast.assignSuccess"));
                  setAssignMobileTarget(null);
                  fetchData();
                } catch (error: any) {
                  toast.error(error?.response?.data?.message || t("blacklistMobile.toast.assignFailed"));
                } finally {
                  setIsAssigningMobile(false);
                }
              }}
              disabled={isAssigningMobile || !selectedMobileBlockCodeId}
            >
              {isAssigningMobile ? t("blacklistMobile.assign.assigning") : t("blacklistMobile.assign.submit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BlacklistMobile;
