import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import { Button, Dropdown, Input as AntInput, Menu } from "antd";
import {
  DownOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Col, Form, Modal, Row } from "react-bootstrap";
import toast from "react-hot-toast";
import Loader from "../../../components/Loader/Loader";
import TableView from "../../../components/TableView/TableView";
import {
  getWaiverRequestsByApplication,
  approveWaiverByInvoice,
  rejectWaiverByInvoice,
} from "../../../redux/apis/apisLendingService";

const formatCurrency = (value?: number | null) =>
  value != null
    ? `SAR ${parseFloat(String(value)).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    : "-";

const formatDateTime = (value?: string | null) =>
  value ? new Date(value).toLocaleString() : "-";

const StatusPill = ({ status }: { status?: string }) => {
  if (!status) return <span>-</span>;
  const bg =
    status === "APPROVED"
      ? "var(--color-status-green)"
      : status === "REJECTED"
      ? "var(--color-status-coral)"
      : status === "PENDING"
      ? "var(--color-status-amber)"
      : "var(--muted)";
  return (
    <span
      style={{
        padding: "4px 12px",
        borderRadius: 32,
        fontSize: 12,
        fontWeight: 600,
        backgroundColor: bg,
        color: "var(--primary-foreground)",
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
};

type ModalType = "approve" | "reject" | null;

const WaiveOffDetails = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Action modal state
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [actionReason, setActionReason] = useState("");
  const [actionAmount, setActionAmount] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchData = async () => {
    if (!applicationId) return;
    try {
      setLoading(true);
      const response = await getWaiverRequestsByApplication(applicationId);
      const list = response?.data?.data || response?.data || [];
      setData(Array.isArray(list) ? list : []);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch waiver requests"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [applicationId]);

  const openModal = (type: ModalType, row: any) => {
    setSelectedRow(row);
    setModalType(type);
    setActionReason("");
    setActionAmount("");
    setErrors({});
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedRow(null);
    setActionReason("");
    setActionAmount("");
    setErrors({});
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!actionReason.trim()) e.reason = "Reason is required";
    if (modalType === "approve") {
      if (!actionAmount) {
        e.amount = "Amount is required";
      } else {
        const amt = parseFloat(actionAmount);
        if (isNaN(amt) || amt <= 0) {
          e.amount = "Enter a valid amount";
        } else if (amt > parseFloat(selectedRow?.requestedAmount)) {
          e.amount = `Cannot exceed requested amount (SAR ${parseFloat(selectedRow?.requestedAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })})`;
        }
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !selectedRow) return;
    try {
      setActionLoading(true);
      if (modalType === "approve") {
        await approveWaiverByInvoice(selectedRow.invoiceId, {
          reason: actionReason.trim(),
          amount: parseFloat(actionAmount),
        });
        toast.success("Waiver request approved successfully");
      } else {
        await rejectWaiverByInvoice(selectedRow.invoiceId, {
          reason: actionReason.trim(),
        });
        toast.success("Waiver request rejected");
      }
      closeModal();
      fetchData();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          `Failed to ${modalType} waiver request`
      );
    } finally {
      setActionLoading(false);
    }
  };

  const actionMenu = (row: any) => (
    <Menu
      onClick={({ key }) => {
        if (key === "approve") openModal("approve", row);
        if (key === "reject") openModal("reject", row);
      }}
    >
      <Menu.Item key="approve" icon={<CheckCircleOutlined />}>
        Approve
      </Menu.Item>
      <Menu.Item key="reject" icon={<CloseCircleOutlined />} danger>
        Reject
      </Menu.Item>
    </Menu>
  );

  // Debounce the search input
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim().toLowerCase());
      setPage(1);
    }, 400);
    return () => clearTimeout(handle);
  }, [searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  const filteredData = useMemo(() => {
    if (!debouncedSearch) return data;
    return data.filter((row: any) => {
      return (
        String(row.invoiceId || "").toLowerCase().includes(debouncedSearch) ||
        String(row.status || "").toLowerCase().includes(debouncedSearch) ||
        String(row.reason || "").toLowerCase().includes(debouncedSearch) ||
        String(row.rejectionReason || "").toLowerCase().includes(debouncedSearch) ||
        String(row.requestedAmount ?? "").toLowerCase().includes(debouncedSearch)
      );
    });
  }, [data, debouncedSearch]);

  // client-side pagination on the filtered set
  const total = filteredData.length;
  const startIndex = (page - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);
  const totalPage = Math.max(1, Math.ceil(total / pageSize));
  const fromRow = total > 0 ? startIndex + 1 : 0;
  const toRow = Math.min(startIndex + pageSize, total);

  const columns = [
    {
      name: "#",
      cell: (_row: any, index: number) => startIndex + index + 1,
      width: "60px",
    },
    {
      name: "Invoice ID",
      selector: (row: any) => row.invoiceId || "-",
      width: "180px",
    },
    {
      name: "Requested Amount",
      selector: (row: any) => formatCurrency(row.requestedAmount),
      width: "170px",
    },
    {
      name: "Reason",
      cell: (row: any) => (
        <span
          title={row.reason || ""}
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            fontSize: 12,
          }}
        >
          {row.reason || "-"}
        </span>
      ),
      width: "220px",
    },
    {
      name: "Status",
      cell: (row: any) => <StatusPill status={row.status} />,
      width: "120px",
    },
    {
      name: "Rejection Reason",
      cell: (row: any) => (
        <span
          title={row.rejectionReason || ""}
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            fontSize: 12,
            color: row.rejectionReason
              ? "var(--color-status-coral)"
              : "var(--muted-foreground)",
          }}
        >
          {row.rejectionReason || "-"}
        </span>
      ),
      width: "200px",
    },
    {
      name: "Requested At",
      selector: (row: any) => formatDateTime(row.requestedAt),
      width: "180px",
    },
    {
      name: "Processed At",
      selector: (row: any) => formatDateTime(row.processedAt),
      width: "180px",
    },
    {
      name: "Action",
      cell: (row: any) => {
        if (row.status !== "PENDING") {
          return <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>—</span>;
        }
        return (
          <Dropdown overlay={actionMenu(row)} trigger={["click"]}>
            <Button
              className="gradient-btn"
              type="primary"
              style={{ borderColor: "white", borderRadius: 8, padding: "10px 20px" }}
            >
              Select <DownOutlined />
            </Button>
          </Dropdown>
        );
      },
      width: "140px",
    },
  ];

  return (
    <div>
      {loading && <Loader />}

      {/* Header */}
      <div className="d-flex align-items-center gap-3 mb-4" style={{ flexWrap: "wrap" }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: "var(--foreground)",
            fontSize: 14,
            padding: 0,
          }}
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div style={{ height: 20, width: 1, backgroundColor: "var(--border)" }} />

        <div>
          <h5 className="mb-0" style={{ fontWeight: 600 }}>
            Waive Off Details
          </h5>
        </div>

        <div className="ms-auto">
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 14px 8px 10px",
              borderRadius: 999,
              fontSize: 13,
              backgroundColor: "var(--muted)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
              lineHeight: 1,
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 24,
                height: 24,
                borderRadius: "50%",
                backgroundColor: "var(--foreground)",
                color: "var(--background)",
              }}
            >
              <FileText size={13} />
            </span>
            <span style={{ fontWeight: 700, fontSize: 14 }}>{total}</span>
            <span style={{ color: "var(--muted-foreground)", fontWeight: 500 }}>
              {total === 1 ? "request" : "requests"}
            </span>
          </span>
        </div>
      </div>

      <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
        <AntInput
          allowClear
          placeholder="Search by invoice ID, status, reason, amount"
          prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: "1 1 240px", minWidth: 200, borderRadius: 8, height: 40 }}
        />
      </div>

      <TableView
        header={columns}
        data={paginatedData}
        totalRows={total}
        isLoading={loading}
        from={fromRow}
        page={page}
        totalPage={totalPage}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        to={toRow}
        paginationShow={true}
      />

      {/* Approve / Reject Modal */}
      <Modal show={!!modalType} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: 16 }}>
            {modalType === "approve" ? "Approve Waiver Request" : "Reject Waiver Request"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Row>
              {modalType === "approve" && (
                <Col md={12} className="mb-3">
                  <Form.Group>
                    <Form.Label style={{ fontSize: 13, fontWeight: 600 }}>
                      Waiver Amount (SAR) *
                    </Form.Label>
                    <Form.Control
                      type="number"
                      min={0.01}
                      step={0.01}
                      max={selectedRow?.requestedAmount}
                      placeholder={`Max: ${parseFloat(selectedRow?.requestedAmount || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
                      value={actionAmount}
                      onChange={(e) => {
                        const max = parseFloat(selectedRow?.requestedAmount || 0);
                        const val = e.target.value;
                        if (val !== "" && parseFloat(val) > max) return;
                        setActionAmount(val);
                        if (errors.amount) setErrors((p) => ({ ...p, amount: "" }));
                      }}
                      isInvalid={!!errors.amount}
                    />
                    <Form.Text className="text-muted" style={{ fontSize: 11 }}>
                      Requested: {formatCurrency(selectedRow?.requestedAmount)} — cannot exceed this amount
                    </Form.Text>
                    <Form.Control.Feedback type="invalid">
                      {errors.amount}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              )}

              <Col md={12} className="mb-1">
                <Form.Group>
                  <Form.Label style={{ fontSize: 13, fontWeight: 600 }}>
                    {modalType === "approve" ? "Approval Reason *" : "Rejection Reason *"}
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder={
                      modalType === "approve"
                        ? "Enter reason for approval..."
                        : "Enter reason for rejection..."
                    }
                    value={actionReason}
                    onChange={(e) => {
                      setActionReason(e.target.value);
                      if (errors.reason) setErrors((p) => ({ ...p, reason: "" }));
                    }}
                    isInvalid={!!errors.reason}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.reason}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={closeModal} disabled={actionLoading}>
            Cancel
          </Button>
          <Button
            className="gradient-btn"
            type="primary"
            loading={actionLoading}
            onClick={handleSubmit}
            danger={modalType === "reject"}
            style={{ borderColor: "white", borderRadius: 8, padding: "10px 20px" }}
          >
            {modalType === "approve" ? "Approve" : "Reject"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default WaiveOffDetails;
