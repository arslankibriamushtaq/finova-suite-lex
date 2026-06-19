import { useEffect, useMemo, useState } from "react";
import { Button, Dropdown, Input as AntInput, Menu } from "antd";
import TableView from "../../../components/TableView/TableView";
import { useParams } from "react-router-dom";
import {
  getReschedulesByApplication,
  approveReschedule,
  rejectReschedule,
} from "../../../redux/apis/apisLendingService";
import toast from "react-hot-toast";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DownOutlined,
  EyeOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Col, Form, Modal, Row } from "react-bootstrap";

const formatLabel = (value?: string | null) =>
  value ? value.replace(/_/g, " ") : "-";

const formatCurrency = (value?: string | number | null) =>
  value != null && value !== ""
    ? `SAR ${parseFloat(String(value)).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    : "-";

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString() : "-";

const formatDateTime = (value?: string | null) =>
  value ? new Date(value).toLocaleString() : "-";

const statusBgVar = (status?: string) => {
  switch (status) {
    case "APPLIED":
    case "APPROVED":
      return "var(--color-status-green)";
    case "SUBMITTED":
    case "REQUESTED":
      return "var(--color-status-amber)";
    case "REJECTED":
    case "CANCELLED":
      return "var(--color-status-coral)";
    default:
      return "var(--color-status-blue)";
  }
};

const StatusPill = ({ status }: { status?: string }) => {
  if (!status) return <span>-</span>;
  return (
    <span
      style={{
        padding: "6px 12px",
        borderRadius: "32px",
        fontSize: "12px",
        fontWeight: 500,
        backgroundColor: statusBgVar(status),
        color: "var(--primary-foreground)",
      }}
    >
      {status}
    </span>
  );
};

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      gap: 12,
      padding: "8px 0",
      borderBottom: "1px solid var(--border)",
    }}
  >
    <span style={{ color: "var(--muted-foreground)", fontSize: 13 }}>
      {label}
    </span>
    <span
      style={{
        fontSize: 13,
        fontWeight: 500,
        textAlign: "right",
        wordBreak: "break-word",
      }}
    >
      {value ?? "-"}
    </span>
  </div>
);

const SectionTitle = ({ title }: { title: string }) => (
  <h6
    style={{
      margin: "16px 0 8px",
      fontWeight: 600,
      color: "var(--foreground)",
    }}
  >
    {title}
  </h6>
);

const RescheduleHistory = () => {
  const [data, setData] = useState<any[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState<"approve" | "reject">(
    "approve"
  );
  const [selectedRescheduleId, setSelectedRescheduleId] = useState("");
  const [approvalNotes, setApprovalNotes] = useState("");
  const [detailsRow, setDetailsRow] = useState<any | null>(null);
  const params = useParams();
  const applicationId = params?.id || "";

  const fetchReschedules = async () => {
    try {
      setSkelitonLoading(true);
      const response = await getReschedulesByApplication(applicationId);
      const reschedules = response?.data?.data?.reschedules || [];
      setData(Array.isArray(reschedules) ? reschedules : []);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch reschedule history"
      );
    } finally {
      setSkelitonLoading(false);
    }
  };

  const openModal = (rescheduleId: string, action: "approve" | "reject") => {
    setSelectedRescheduleId(rescheduleId);
    setModalAction(action);
    setApprovalNotes("");
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!approvalNotes.trim()) {
      toast.error("Notes are required");
      return;
    }

    const body = { approverRole: "ops_head", approvalNotes };

    try {
      setActionLoading(selectedRescheduleId);
      if (modalAction === "approve") {
        await approveReschedule(applicationId, selectedRescheduleId, body);
        toast.success("Reschedule approved successfully");
      } else {
        await rejectReschedule(applicationId, selectedRescheduleId, body);
        toast.success("Reschedule rejected successfully");
      }
      setShowModal(false);
      fetchReschedules();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          `Failed to ${modalAction} reschedule`
      );
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    if (applicationId) {
      fetchReschedules();
    }
  }, [applicationId]);

  const isFinalStatus = (status: string) =>
    status === "APPROVED" || status === "REJECTED" || status === "CANCELLED";

  const menu = (row: any) => (
    <Menu>
      <Menu.Item
        key="details"
        icon={<EyeOutlined />}
        onClick={() => setDetailsRow(row)}
      >
        Details
      </Menu.Item>
      <Menu.Item
        key="approve"
        icon={<CheckCircleOutlined />}
        onClick={() => openModal(row.rescheduleId, "approve")}
        disabled={
          actionLoading === row.rescheduleId || isFinalStatus(row.status)
        }
      >
        Approve
      </Menu.Item>
      <Menu.Item
        key="reject"
        icon={<CloseCircleOutlined />}
        onClick={() => openModal(row.rescheduleId, "reject")}
        disabled={
          actionLoading === row.rescheduleId || isFinalStatus(row.status)
        }
      >
        Reject
      </Menu.Item>
    </Menu>
  );

  const columns = [
    {
      name: "Loan Number",
      selector: (row: any) => row.loanNumber || "-",
      sortable: true,
      width: "150px",
    },
    {
      name: "Reschedule Type",
      selector: (row: any) => formatLabel(row.rescheduleType),
      sortable: true,
      width: "180px",
    },
    {
      name: "Status",
      cell: (row: any) => <StatusPill status={row.status} />,
      width: "130px",
    },
    {
      name: "Principal",
      selector: (row: any) => formatCurrency(row.principalAmount),
      sortable: true,
      width: "150px",
    },
    {
      name: "Before (Tenure / Installment / Maturity)",
      cell: (row: any) => (
        <div style={{ fontSize: 12, lineHeight: 1.5 }}>
          <div>{row.before?.tenureMonths ?? "-"} mo</div>
          <div>{formatCurrency(row.before?.installmentAmount)}</div>
          <div>{formatDate(row.before?.maturityDate)}</div>
        </div>
      ),
      width: "250px",
    },
    {
      name: "After (Tenure / Installment / Maturity)",
      cell: (row: any) => (
        <div style={{ fontSize: 12, lineHeight: 1.5 }}>
          <div>{row.after?.tenureMonths ?? "-"} mo</div>
          <div>{formatCurrency(row.after?.installmentAmount)}</div>
          <div>{formatDate(row.after?.maturityDate)}</div>
        </div>
      ),
      width: "250px",
    },
    {
      name: "Requested At",
      selector: (row: any) => formatDate(row.timeline?.requestedAt),
      sortable: true,
      width: "140px",
    },
    {
      name: "Action",
      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button
            className="gradient-btn"
            type="primary"
            loading={actionLoading === row.rescheduleId}
            style={{
              borderColor: "white",
              borderRadius: "6px",
              padding: "10px 20px",
            }}
          >
            Select <DownOutlined />
          </Button>
        </Dropdown>
      ),
      width: "140px",
    },
  ];

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
        String(row.loanNumber || "").toLowerCase().includes(debouncedSearch) ||
        String(row.rescheduleType || "").toLowerCase().includes(debouncedSearch) ||
        String(row.status || "").toLowerCase().includes(debouncedSearch) ||
        String(row.justification || "").toLowerCase().includes(debouncedSearch) ||
        String(row.rejectionReason || "").toLowerCase().includes(debouncedSearch)
      );
    });
  }, [data, debouncedSearch]);

  // Client-side pagination on the filtered set
  const total = filteredData.length;
  const startIndex = (page - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);
  const fromRow = total > 0 ? startIndex + 1 : 0;
  const toRow = Math.min(startIndex + pageSize, total);
  const totalPage = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="service p-4">
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark">Reschedule History</h3>
      </div>

      <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
        <AntInput
          allowClear
          placeholder="Search by loan number, type, status, justification"
          prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: "1 1 240px", minWidth: 200, borderRadius: 6, height: 40 }}
        />
      </div>

      <TableView
        header={columns}
        data={paginatedData}
        totalRows={total}
        isLoading={skelitonLoading}
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
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalAction === "approve" ? "Approve" : "Reject"} Reschedule
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={1}
                    className="pt-2"
                    placeholder={
                      modalAction === "approve"
                        ? "e.g. Approved after reviewing customer payment history"
                        : "e.g. Reason for rejection"
                    }
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setShowModal(false)}>Cancel</Button>
          <Button
            type="primary"
            loading={!!actionLoading}
            onClick={handleSubmit}
            danger={modalAction === "reject"}
            style={
              modalAction === "approve"
                ? {
                    backgroundColor: "var(--foreground)",
                    borderColor: "var(--foreground)",
                    color: "var(--background)",
                  }
                : { backgroundColor: "#dc3545", borderColor: "#dc3545" }
            }
          >
            {modalAction === "approve" ? "Approve" : "Reject"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Details Modal */}
      <Modal
        show={!!detailsRow}
        onHide={() => setDetailsRow(null)}
        centered
        size="lg"
        scrollable
      >
        <Modal.Header closeButton>
          <Modal.Title>Reschedule Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detailsRow && (
            <div>
              <SectionTitle title="Basic Information" />
              <Row>
                <Col md={6}>
                  <InfoRow
                    label="Loan Number"
                    value={detailsRow.loanNumber || "-"}
                  />
                  <InfoRow
                    label="Reschedule Type"
                    value={formatLabel(detailsRow.rescheduleType)}
                  />
                  <InfoRow
                    label="Status"
                    value={<StatusPill status={detailsRow.status} />}
                  />
                </Col>
                <Col md={6}>
                  <InfoRow
                    label="Principal Amount"
                    value={formatCurrency(detailsRow.principalAmount)}
                  />
                  <InfoRow
                    label="Reschedule ID"
                    value={
                      <span style={{ fontSize: 11 }}>
                        {detailsRow.rescheduleId || "-"}
                      </span>
                    }
                  />
                  <InfoRow
                    label="Loan ID"
                    value={
                      <span style={{ fontSize: 11 }}>
                        {detailsRow.loanId || "-"}
                      </span>
                    }
                  />
                </Col>
              </Row>

              {(detailsRow.extensionMonths != null ||
                detailsRow.holidayMonths != null ||
                detailsRow.requestedSkipMonth ||
                detailsRow.newProfitRate != null ||
                detailsRow.writeOffAmount != null ||
                detailsRow.profitWaiverAmount != null) && (
                <>
                  <SectionTitle title="Specifics" />
                  <Row>
                    <Col md={6}>
                      {detailsRow.extensionMonths != null && (
                        <InfoRow
                          label="Extension Months"
                          value={`${detailsRow.extensionMonths} months`}
                        />
                      )}
                      {detailsRow.holidayMonths != null && (
                        <InfoRow
                          label="Holiday Months"
                          value={`${detailsRow.holidayMonths} months`}
                        />
                      )}
                      {detailsRow.requestedSkipMonth && (
                        <InfoRow
                          label="Requested Skip Month"
                          value={formatDate(detailsRow.requestedSkipMonth)}
                        />
                      )}
                    </Col>
                    <Col md={6}>
                      {detailsRow.newProfitRate != null && (
                        <InfoRow
                          label="New Profit Rate"
                          value={`${detailsRow.newProfitRate}%`}
                        />
                      )}
                      {detailsRow.writeOffAmount != null && (
                        <InfoRow
                          label="Write-off Amount"
                          value={formatCurrency(detailsRow.writeOffAmount)}
                        />
                      )}
                      {detailsRow.profitWaiverAmount != null && (
                        <InfoRow
                          label="Profit Waiver"
                          value={formatCurrency(detailsRow.profitWaiverAmount)}
                        />
                      )}
                    </Col>
                  </Row>
                </>
              )}

              {detailsRow.details && (
                <>
                  <SectionTitle title="Details" />
                  <div
                    style={{
                      padding: 12,
                      background: "var(--muted)",
                      borderRadius: 6,
                      fontSize: 13,
                      lineHeight: 1.6,
                      color: "var(--foreground)",
                    }}
                  >
                    {detailsRow.details}
                  </div>
                </>
              )}

              {(detailsRow.justification || detailsRow.rejectionReason) && (
                <>
                  <SectionTitle title="Justification & Reason" />
                  {detailsRow.justification && (
                    <InfoRow
                      label="Justification"
                      value={detailsRow.justification}
                    />
                  )}
                  {detailsRow.rejectionReason && (
                    <InfoRow
                      label="Rejection Reason"
                      value={detailsRow.rejectionReason}
                    />
                  )}
                </>
              )}

              <SectionTitle title="Before vs After" />
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 13,
                  }}
                >
                  <thead>
                    <tr style={{ background: "var(--muted)" }}>
                      <th style={{ padding: 10, textAlign: "left" }}>Field</th>
                      <th style={{ padding: 10, textAlign: "left" }}>Before</th>
                      <th style={{ padding: 10, textAlign: "left" }}>After</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: 10 }}>Tenure (months)</td>
                      <td style={{ padding: 10 }}>
                        {detailsRow.before?.tenureMonths ?? "-"}
                      </td>
                      <td style={{ padding: 10 }}>
                        {detailsRow.after?.tenureMonths ?? "-"}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: 10 }}>Installment Amount</td>
                      <td style={{ padding: 10 }}>
                        {formatCurrency(detailsRow.before?.installmentAmount)}
                      </td>
                      <td style={{ padding: 10 }}>
                        {formatCurrency(detailsRow.after?.installmentAmount)}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: 10 }}>Maturity Date</td>
                      <td style={{ padding: 10 }}>
                        {formatDate(detailsRow.before?.maturityDate)}
                      </td>
                      <td style={{ padding: 10 }}>
                        {formatDate(detailsRow.after?.maturityDate)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <SectionTitle title="Timeline" />
              <Row>
                <Col md={6}>
                  <InfoRow
                    label="Requested At"
                    value={formatDateTime(detailsRow.timeline?.requestedAt)}
                  />
                  <InfoRow
                    label="Approved At"
                    value={formatDateTime(detailsRow.timeline?.approvedAt)}
                  />
                  <InfoRow
                    label="Applied At"
                    value={formatDateTime(detailsRow.timeline?.appliedAt)}
                  />
                </Col>
                <Col md={6}>
                  <InfoRow
                    label="Rejected At"
                    value={formatDateTime(detailsRow.timeline?.rejectedAt)}
                  />
                  <InfoRow
                    label="Cancelled At"
                    value={formatDateTime(detailsRow.timeline?.cancelledAt)}
                  />
                </Col>
              </Row>

              <SectionTitle title="Approver" />
              <Row>
                <Col md={6}>
                  <InfoRow
                    label="Approver Role"
                    value={formatLabel(detailsRow.approver?.approverRole)}
                  />
                  <InfoRow
                    label="Approver ID"
                    value={
                      <span style={{ fontSize: 11 }}>
                        {detailsRow.approver?.approverId || "-"}
                      </span>
                    }
                  />
                </Col>
                <Col md={6}>
                  <InfoRow
                    label="Approval Notes"
                    value={detailsRow.approver?.approvalNotes || "-"}
                  />
                </Col>
              </Row>

              <SectionTitle title="Sync Status" />
              <Row>
                <Col md={6}>
                  <InfoRow
                    label="Fineract Synced"
                    value={detailsRow.sync?.fineractSynced ? "Yes" : "No"}
                  />
                  <InfoRow
                    label="Fineract Reschedule ID"
                    value={
                      <span style={{ fontSize: 11 }}>
                        {detailsRow.sync?.fineractRescheduleId || "-"}
                      </span>
                    }
                  />
                </Col>
                <Col md={6}>
                  <InfoRow
                    label="GL Posted"
                    value={detailsRow.sync?.glPosted ? "Yes" : "No"}
                  />
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            type="primary"
            onClick={() => setDetailsRow(null)}
            style={{
              backgroundColor: "var(--foreground)",
              borderColor: "var(--foreground)",
              color: "var(--background)",
            }}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default RescheduleHistory;
