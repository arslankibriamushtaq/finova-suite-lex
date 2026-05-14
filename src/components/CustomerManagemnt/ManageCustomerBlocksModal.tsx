import { useState, useEffect } from "react";
import { Modal } from "antd";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { getCustomerBlocks, assignBlockToCustomer, removeBlockFromCustomer } from "../../redux/apis/apisCrudLms";
import { getRiskBlockCodes } from "../../redux/apis/apisRiskManagement";

interface Props {
  open: boolean;
  customerId: string | number;
  onClose: () => void;
}

const ManageCustomerBlocksModal = ({ open, customerId, onClose }: Props) => {
  const [activeBlocks, setActiveBlocks] = useState<any[]>([]);
  const [allBlockCodes, setAllBlockCodes] = useState<any[]>([]);
  const [selectedCodeId, setSelectedCodeId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (open && customerId) {
      fetchData();
    }
  }, [open, customerId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [blocksRes, codesRes] = await Promise.allSettled([
        getCustomerBlocks(customerId),
        getRiskBlockCodes(),
      ]);

      if (blocksRes.status === "fulfilled") {
        const list = Array.isArray(blocksRes.value?.data?.data)
          ? blocksRes.value.data.data
          : Array.isArray(blocksRes.value?.data)
          ? blocksRes.value.data
          : [];
        setActiveBlocks(list);
      }

      if (codesRes.status === "fulfilled") {
        const list = Array.isArray(codesRes.value?.data?.data)
          ? codesRes.value.data.data
          : Array.isArray(codesRes.value?.data)
          ? codesRes.value.data
          : [];
        setAllBlockCodes(list.filter((bc: any) => bc.active !== false));
      }
    } catch {
      toast.error("Failed to load block codes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedCodeId) return;
    setIsAssigning(true);
    try {
      const res = await assignBlockToCustomer(customerId, selectedCodeId);
      if (res?.data?.success === false) throw new Error(res?.data?.message);
      toast.success("Block code assigned");
      setSelectedCodeId("");
      fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to assign block code");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemove = async (blockCodeId: string) => {
    setRemovingId(blockCodeId);
    try {
      await removeBlockFromCustomer(customerId, blockCodeId);
      toast.success("Block code removed");
      setActiveBlocks((prev) => prev.filter((b) => (b.blockCodeId || b.id) !== blockCodeId));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to remove block code");
    } finally {
      setRemovingId(null);
    }
  };

  const formatDate = (d: string) =>
    d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "--";

  return (
    <Modal
      title={<span style={{ fontSize: 18, fontWeight: 600 }}>Manage Block Codes for User</span>}
      open={open}
      onCancel={onClose}
      footer={null}
      width={660}
      centered
      destroyOnClose
    >
      {/* Active Blocks */}
      <div style={{ marginBottom: 24 }}>
        <h6 style={{ fontWeight: 600, marginBottom: 12, color: "var(--foreground)" }}>Active Block Codes</h6>
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "24px", color: "var(--muted-foreground)" }}>Loading...</div>
        ) : activeBlocks.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px", color: "var(--muted-foreground)", background: "var(--muted)", borderRadius: 8, fontSize: 14 }}>
            No block codes assigned
          </div>
        ) : (
          <div style={{ border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ background: "var(--muted)" }}>
                <tr>
                  {["Block Code", "Description", "Assigned At", ""].map((h) => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 13, fontWeight: 600, borderBottom: "1px solid var(--border)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeBlocks.map((block: any, i: number) => {
                  const bcId = block.blockCodeId || block.id;
                  const code = block.blockCode?.code || block.code || bcId;
                  const desc = block.blockCode?.description || block.description || block.reason || "--";
                  const assignedAt = block.assignedAt || block.createdAt || block.created_at;
                  return (
                    <tr key={i} style={{ borderBottom: i < activeBlocks.length - 1 ? "1px solid var(--border)" : "none" }}>
                      <td style={{ padding: "10px 14px" }}>
                        <span style={{ padding: "3px 10px", borderRadius: 9999, background: "var(--muted)", fontSize: 12, fontWeight: 600 }}>
                          {code}
                        </span>
                      </td>
                      <td style={{ padding: "10px 14px", fontSize: 13, color: "var(--muted-foreground)" }}>{desc}</td>
                      <td style={{ padding: "10px 14px", fontSize: 13 }}>{formatDate(assignedAt)}</td>
                      <td style={{ padding: "10px 14px", textAlign: "right" }}>
                        <button
                          onClick={() => handleRemove(bcId)}
                          disabled={removingId === bcId}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-error)", display: "inline-flex", alignItems: "center", padding: 4 }}
                          title="Remove"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign New */}
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 20 }}>
        <h6 style={{ fontWeight: 600, marginBottom: 12, color: "var(--foreground)" }}>Assign New Block Code</h6>
        <div style={{ display: "flex", gap: 10 }}>
          <Select value={selectedCodeId || ""} onValueChange={setSelectedCodeId}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select a block code" />
            </SelectTrigger>
            <SelectContent>
              {allBlockCodes.map((bc: any) => (
                <SelectItem key={bc.id} value={String(bc.id)}>
                  {bc.code}{bc.description ? ` — ${bc.description}` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleAssign} disabled={!selectedCodeId || isAssigning}>
            {isAssigning ? "Assigning..." : "Assign"}
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
        <Button variant="outline" onClick={onClose}>Close</Button>
      </div>
    </Modal>
  );
};

export default ManageCustomerBlocksModal;
