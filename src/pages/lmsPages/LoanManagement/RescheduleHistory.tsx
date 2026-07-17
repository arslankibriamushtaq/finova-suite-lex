import { useEffect, useMemo, useState } from "react";
import { Button, Dropdown, Input as AntInput, Menu } from "antd";
import { History } from "lucide-react";
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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation("loanManagement");
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
          t("reschedule.fetchFailed")
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
      toast.error(t("reschedule.notesRequired"));
      return;
    }

    const body = { approverRole: "ops_head", approvalNotes };

    try {
      setActionLoading(selectedRescheduleId);
      if (modalAction === "approve") {
        await approveReschedule(applicationId, selectedRescheduleId, body);
        toast.success(t("reschedule.approvedSuccess"));
      } else {
        await rejectReschedule(applicationId, selectedRescheduleId, body);
        toast.success(t("reschedule.rejectedSuccess"));
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
        {t("common:details")}
      </Menu.Item>
      <Menu.Item
        key="approve"
        icon={<CheckCircleOutlined />}
        onClick={() => openModal(row.rescheduleId, "approve")}
        disabled={
          actionLoading === row.rescheduleId || isFinalStatus(row.status)
        }
      >
        {t("common:approve")}
      </Menu.Item>
      <Menu.Item
        key="reject"
        icon={<CloseCircleOutlined />}
        onClick={() => openModal(row.rescheduleId, "reject")}
        disabled={
          actionLoading === row.rescheduleId || isFinalStatus(row.status)
        }
      >
        {t("common:reject")}
      </Menu.Item>
    </Menu>
  );

  const columns = [
    {
      name: t("reschedule.colLoanNumber"),
      selector: (row: any) => row.loanNumber || "-",
      sortable: true,
      width: "150px",
    },
    {
      name: t("reschedule.colRescheduleType"),
      selector: (row: any) => formatLabel(row.rescheduleType),
      sortable: true,
      width: "180px",
    },
    {
      name: t("common:status"),
      cell: (row: any) => <StatusPill status={row.status} />,
      width: "130px",
    },
    {
      name: t("reschedule.colPrincipal"),
      selector: (row: any) => formatCurrency(row.principalAmount),
      sortable: true,
      width: "150px",
    },
    {
      name: t("reschedule.colBefore"),
      cell: (row: any) => (
        <div style={{ fontSize: 12, lineHeight: 1.5 }}>
          <div>{row.before?.tenureMonths ?? "-"} {t("reschedule.monthsShort")}</div>
          <div>{formatCurrency(row.before?.installmentAmount)}</div>
          <div>{formatDate(row.before?.maturityDate)}</div>
        </div>
      ),
      width: "250px",
    },
    {
      name: t("reschedule.colAfter"),
      cell: (row: any) => (
        <div style={{ fontSize: 12, lineHeight: 1.5 }}>
          <div>{row.after?.tenureMonths ?? "-"} {t("reschedule.monthsShort")}</div>
          <div>{formatCurrency(row.after?.installmentAmount)}</div>
          <div>{formatDate(row.after?.maturityDate)}</div>
        </div>
      ),
      width: "250px",
    },
    {
      name: t("reschedule.colRequestedAt"),
      selector: (row: any) => formatDate(row.timeline?.requestedAt),
      sortable: true,
      width: "140px",
    },
    {
      name: t("applications.colAction"),
      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button
            className="gradient-btn"
            type="primary"
            loading={actionLoading === row.rescheduleId}
            style={{
              borderColor: "white",
              borderRadius: "2px",
              padding: "10px 20px",
            }}
          >
            {t("applications.select")} <DownOutlined />
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
        <h3 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2 ps-0">
          <span className="pro-head-badge">
            <History className="h-4 w-4" />
          </span>
          {t("reschedule.title")}
        </h3>
      </div>

      <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
        <AntInput
          allowClear
          placeholder={t("reschedule.searchPlaceholder")}
          prefix={<SearchOutlined style={{ color: "var(--muted-foreground)" }} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: "1 1 240px", minWidth: 200, borderRadius: 2, height: 40 }}
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
      <Modal backdrop="static" keyboard={false} show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalAction === "approve" ? t("reschedule.approveTitle") : t("reschedule.rejectTitle")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>{t("reschedule.notes")}</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={1}
                    className="pt-2"
                    placeholder={
                      modalAction === "approve"
                        ? t("reschedule.approvePlaceholder")
                        : t("reschedule.rejectPlaceholder")
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
          <Button onClick={() => setShowModal(false)}>{t("common:cancel")}</Button>
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
            {modalAction === "approve" ? t("common:approve") : t("common:reject")}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Details Modal */}
      <Modal backdrop="static" keyboard={false}
        show={!!detailsRow}
        onHide={() => setDetailsRow(null)}
        centered
        size="lg"
        scrollable
      >
        <Modal.Header closeButton>
          <Modal.Title>{t("reschedule.detailsTitle")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detailsRow && (
            <div>
              <SectionTitle title={t("reschedule.sectionBasicInfo")} />
              <Row>
                <Col md={6}>
                  <InfoRow
                    label={t("reschedule.colLoanNumber")}
                    value={detailsRow.loanNumber || "-"}
                  />
                  <InfoRow
                    label={t("reschedule.colRescheduleType")}
                    value={formatLabel(detailsRow.rescheduleType)}
                  />
                  <InfoRow
                    label={t("common:status")}
                    value={<StatusPill status={detailsRow.status} />}
                  />
                </Col>
                <Col md={6}>
                  <InfoRow
                    label={t("reschedule.principalAmount")}
                    value={formatCurrency(detailsRow.principalAmount)}
                  />
                  <InfoRow
                    label={t("reschedule.rescheduleId")}
                    value={
                      <span style={{ fontSize: 11 }}>
                        {detailsRow.rescheduleId || "-"}
                      </span>
                    }
                  />
                  <InfoRow
                    label={t("reschedule.loanIdLabel")}
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
                  <SectionTitle title={t("reschedule.sectionSpecifics")} />
                  <Row>
                    <Col md={6}>
                      {detailsRow.extensionMonths != null && (
                        <InfoRow
                          label={t("reschedule.extensionMonths")}
                          value={t("reschedule.monthsSuffix", { count: detailsRow.extensionMonths })}
                        />
                      )}
                      {detailsRow.holidayMonths != null && (
                        <InfoRow
                          label={t("reschedule.holidayMonths")}
                          value={t("reschedule.monthsSuffix", { count: detailsRow.holidayMonths })}
                        />
                      )}
                      {detailsRow.requestedSkipMonth && (
                        <InfoRow
                          label={t("reschedule.requestedSkipMonth")}
                          value={formatDate(detailsRow.requestedSkipMonth)}
                        />
                      )}
                    </Col>
                    <Col md={6}>
                      {detailsRow.newProfitRate != null && (
                        <InfoRow
                          label={t("reschedule.newProfitRate")}
                          value={`${detailsRow.newProfitRate}%`}
                        />
                      )}
                      {detailsRow.writeOffAmount != null && (
                        <InfoRow
                          label={t("reschedule.writeOffAmount")}
                          value={formatCurrency(detailsRow.writeOffAmount)}
                        />
                      )}
                      {detailsRow.profitWaiverAmount != null && (
                        <InfoRow
                          label={t("reschedule.profitWaiver")}
                          value={formatCurrency(detailsRow.profitWaiverAmount)}
                        />
                      )}
                    </Col>
                  </Row>
                </>
              )}

              {detailsRow.details && (
                <>
                  <SectionTitle title={t("reschedule.sectionDetails")} />
                  <div
                    style={{
                      padding: 12,
                      background: "var(--muted)",
                      borderRadius: 2,
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
                  <SectionTitle title={t("reschedule.sectionJustification")} />
                  {detailsRow.justification && (
                    <InfoRow
                      label={t("reschedule.justification")}
                      value={detailsRow.justification}
                    />
                  )}
                  {detailsRow.rejectionReason && (
                    <InfoRow
                      label={t("reschedule.rejectionReason")}
                      value={detailsRow.rejectionReason}
                    />
                  )}
                </>
              )}

              <SectionTitle title={t("reschedule.sectionBeforeAfter")} />
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
                      <th style={{ padding: 10, textAlign: "left" }}>{t("reschedule.tblField")}</th>
                      <th style={{ padding: 10, textAlign: "left" }}>{t("reschedule.tblBefore")}</th>
                      <th style={{ padding: 10, textAlign: "left" }}>{t("reschedule.tblAfter")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: 10 }}>{t("reschedule.rowTenure")}</td>
                      <td style={{ padding: 10 }}>
                        {detailsRow.before?.tenureMonths ?? "-"}
                      </td>
                      <td style={{ padding: 10 }}>
                        {detailsRow.after?.tenureMonths ?? "-"}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: 10 }}>{t("reschedule.rowInstallment")}</td>
                      <td style={{ padding: 10 }}>
                        {formatCurrency(detailsRow.before?.installmentAmount)}
                      </td>
                      <td style={{ padding: 10 }}>
                        {formatCurrency(detailsRow.after?.installmentAmount)}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: 10 }}>{t("reschedule.rowMaturity")}</td>
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

              <SectionTitle title={t("reschedule.sectionTimeline")} />
              <Row>
                <Col md={6}>
                  <InfoRow
                    label={t("reschedule.requestedAt")}
                    value={formatDateTime(detailsRow.timeline?.requestedAt)}
                  />
                  <InfoRow
                    label={t("reschedule.approvedAt")}
                    value={formatDateTime(detailsRow.timeline?.approvedAt)}
                  />
                  <InfoRow
                    label={t("reschedule.appliedAt")}
                    value={formatDateTime(detailsRow.timeline?.appliedAt)}
                  />
                </Col>
                <Col md={6}>
                  <InfoRow
                    label={t("reschedule.rejectedAt")}
                    value={formatDateTime(detailsRow.timeline?.rejectedAt)}
                  />
                  <InfoRow
                    label={t("reschedule.cancelledAt")}
                    value={formatDateTime(detailsRow.timeline?.cancelledAt)}
                  />
                </Col>
              </Row>

              <SectionTitle title={t("reschedule.sectionApprover")} />
              <Row>
                <Col md={6}>
                  <InfoRow
                    label={t("reschedule.approverRole")}
                    value={formatLabel(detailsRow.approver?.approverRole)}
                  />
                  <InfoRow
                    label={t("reschedule.approverId")}
                    value={
                      <span style={{ fontSize: 11 }}>
                        {detailsRow.approver?.approverId || "-"}
                      </span>
                    }
                  />
                </Col>
                <Col md={6}>
                  <InfoRow
                    label={t("reschedule.approvalNotes")}
                    value={detailsRow.approver?.approvalNotes || "-"}
                  />
                </Col>
              </Row>

              <SectionTitle title={t("reschedule.sectionSyncStatus")} />
              <Row>
                <Col md={6}>
                  <InfoRow
                    label={t("reschedule.fineractSynced")}
                    value={detailsRow.sync?.fineractSynced ? t("common:yes") : t("common:no")}
                  />
                  <InfoRow
                    label={t("reschedule.fineractRescheduleId")}
                    value={
                      <span style={{ fontSize: 11 }}>
                        {detailsRow.sync?.fineractRescheduleId || "-"}
                      </span>
                    }
                  />
                </Col>
                <Col md={6}>
                  <InfoRow
                    label={t("reschedule.glPosted")}
                    value={detailsRow.sync?.glPosted ? t("common:yes") : t("common:no")}
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
            {t("common:close")}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default RescheduleHistory;
