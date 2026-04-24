import { useEffect, useState } from "react";
import { Button, Dropdown, Menu } from "antd";
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
} from "@ant-design/icons";
import { Col, Form, Modal, Row } from "react-bootstrap";

const RescheduleHistory = () => {
  const [data, setData] = useState<any[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState<"approve" | "reject">("approve");
  const [selectedRescheduleId, setSelectedRescheduleId] = useState("");
  const [approvalNotes, setApprovalNotes] = useState("");
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
        error?.response?.data?.message || error?.message || "Failed to fetch reschedule history"
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
        error?.response?.data?.message || error?.message || `Failed to ${modalAction} reschedule`
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

  const menu = (row: any) => (
    <Menu>
      <Menu.Item
        key="approve"
        icon={<CheckCircleOutlined />}
        onClick={() => openModal(row.rescheduleId, "approve")}
        disabled={actionLoading === row.rescheduleId || row.status === "APPROVED" || row.status === "REJECTED" || row.status === "CANCELLED"}
      >
        Approve
      </Menu.Item>
      <Menu.Item
        key="reject"
        icon={<CloseCircleOutlined />}
        onClick={() => openModal(row.rescheduleId, "reject")}
        disabled={actionLoading === row.rescheduleId || row.status === "APPROVED" || row.status === "REJECTED" || row.status === "CANCELLED"}
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
      selector: (row: any) => row.rescheduleType?.replace(/_/g, " ") || "-",
      sortable: true,
      width: "180px",
    },
    {
      name: "Status",
      cell: (row: any) => {
        const status = row.status;
        if (!status) return <span>-</span>;
        return (
          <span
            style={{
              padding: "6px 12px",
              borderRadius: "32px",
              fontSize: "12px",
              fontWeight: "500",
              backgroundColor:
                status === "APPLIED"
                  ? "var(--color-status-green)"
                  : status === "SUBMITTED"
                    ? "var(--color-status-amber)"
                    : status === "REJECTED"
                      ? "var(--color-status-coral)"
                      : status === "APPROVED"
                        ? "var(--color-status-green)"
                        : "var(--color-status-blue)",
              color: "var(--primary-foreground)",
            }}
          >
            {status}
          </span>
        );
      },
      width: "140px",
    },
    {
      name: "Principal",
      selector: (row: any) =>
        row.principalAmount != null ? `SAR ${parseFloat(row.principalAmount).toFixed(2)}` : "-",
      sortable: true,
      width: "140px",
    },
    {
      name: "Extension",
      selector: (row: any) =>
        row.extensionMonths != null ? `${row.extensionMonths} months` : "-",
      sortable: true,
      width: "120px",
    },
    {
      name: "New Tenure",
      selector: (row: any) =>
        row.after?.tenureMonths != null ? `${row.after.tenureMonths} months` : "-",
      sortable: true,
      width: "130px",
    },
    {
      name: "New Installment",
      selector: (row: any) =>
        row.after?.installmentAmount != null
          ? `SAR ${parseFloat(row.after.installmentAmount).toFixed(2)}`
          : "-",
      sortable: true,
      width: "160px",
    },
    {
      name: "Maturity Date",
      selector: (row: any) =>
        row.after?.maturityDate
          ? new Date(row.after.maturityDate).toLocaleDateString()
          : "-",
      sortable: true,
      width: "140px",
    },
    {
      name: "Justification",
      selector: (row: any) => row.justification || "-",
      sortable: true,
      width: "250px",
    },
    {
      name: "Requested At",
      selector: (row: any) =>
        row.timeline?.requestedAt
          ? new Date(row.timeline.requestedAt).toLocaleDateString()
          : "-",
      sortable: true,
      width: "130px",
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
              borderRadius: "8px",
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

  // Client-side pagination
  const total = data.length;
  const startIndex = (page - 1) * pageSize;
  const paginatedData = data.slice(startIndex, startIndex + pageSize);
  const fromRow = total > 0 ? startIndex + 1 : 0;
  const toRow = Math.min(startIndex + pageSize, total);
  const totalPage = Math.ceil(total / pageSize) || 1;

  return (
    <div>
      <h5 className="mb-3">Reschedule History</h5>
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
      />

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
      >
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
                    rows={1} className="pt-2"
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
            danger
            style={{ backgroundColor: "#dc3545", borderColor: "#dc3545" }}
          >
            {modalAction === "approve" ? "Approve" : "Reject"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default RescheduleHistory;