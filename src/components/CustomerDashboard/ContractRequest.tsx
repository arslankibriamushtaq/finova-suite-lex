import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Button, Modal, Form } from 'antd';
import TableView from '../TableView/TableView';
import { formatDate } from '../../App';
import toast from 'react-hot-toast';

// Dummy data for temporary use
const dummyContracts = [
    {
        id: 12,
        invoiceNo: "INV-142950-1763273141927-9129",
        invoice_no: "INV-142950-1763273141927-9129",
        requestedBy: "N/A",
        requested_by: "N/A",
        requestDate: "2025-11-16",
        request_date: "2025-11-16",
        updatedDate: "2025-11-16",
        updated_date: "2025-11-16",
        status: "Requested",
        contractUrl: "#",
        contract_url: "#",
    }
];

const ContractRequest = () => {
  const { id } = useParams();
  const location = useLocation();
  const applicationData = location.state?.application || {};
  
  const [contracts, setContracts] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState<any>(null);

  const applicationNumber = id || applicationData?.applicationNumber || "FVAN-6152142950";

  useEffect(() => {
    getContracts();
  }, [page, pageSize]);

  const getContracts = async () => {
    setSkelitonLoading(true);
    try {
      // TODO: Replace with actual API call when ready
      // const response = await getContractRequests(applicationNumber, page, pageSize);
      // setContracts(response.data || []);
      // setTotalRows(response.total || 0);
      // setFrom(response.from || 0);
      // setTo(response.to || 0);
      // setPage(response.current_page || 1);
      // setTotalPage(response.last_page || 0);
      
      // Using dummy data for temporary purpose
      setContracts(dummyContracts);
      setTotalRows(dummyContracts.length);
      setFrom(1);
      setTo(dummyContracts.length);
      setPage(1);
      setTotalPage(1);
    } catch (error: any) {
      toast.error(error?.message || "Failed to load contracts");
    } finally {
      setSkelitonLoading(false);
    }
  };

  const handlePreviewContract = (contract: any) => {
    // TODO: Implement contract preview
    // This could open a modal with PDF viewer or navigate to a preview page
    if (contract.contractUrl) {
      window.open(contract.contractUrl, '_blank');
    } else {
      //toast.info("Contract preview not available");
      console.log("Contract preview not available");
    }
  };

  const handleApproveClick = (contract: any) => {
    setSelectedContract(contract);
    setShowConfirmModal(true);
  };

  const handleApproveConfirmed = async () => {
    if (!selectedContract) return;

    try {
      // TODO: Replace with actual API call
      // Example: await approveContract(selectedContract.id);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Contract approved successfully");
      setShowConfirmModal(false);
      setSelectedContract(null);
      
      // Refresh the contracts list
      getContracts();
    } catch (error: any) {
      toast.error(error?.message || "Failed to approve contract");
    }
  };

  const mappedContracts = contracts.map((item: any, index: any) => ({
    id: item.id,
    invoiceNo: item.invoiceNo || item.invoice_no || "--",
    requestedBy: item.requestedBy || item.requested_by || "N/A",
    requestDate: item.requestDate || item.request_date,
    updatedDate: item.updatedDate || item.updated_date,
    status: item.status || "Requested",
    contractUrl: item.contractUrl || item.contract_url,
  }));

  const Contracts_Header = [
    {
      name: "ID",
      selector: (row: any) => row.id || "--",
      width: "5%",
    },
    {
      name: "Invoice No",
      selector: (row: any) => row.invoiceNo || "--",
      width: "25%",
    },
    {
      name: "Requested By",
      selector: (row: any) => row.requestedBy || "N/A",
      width: "15%",
    },
    {
      name: "Contract",
      cell: (row: any) => (
        <Button
          type="primary"
          onClick={() => handlePreviewContract(row)}
          style={{
            backgroundColor: "var(--theme-secondary)",
            color: "var(--primary-foreground)",
            borderRadius: "2px",
            border: "none",
            fontSize: "12px",
            padding: "4px 12px",
          }}
        >
          Preview Contract
        </Button>
      ),
      width: "15%",
    },
    {
      name: "Request Date",
      selector: (row: any) => row.requestDate ? formatDate(row.requestDate) : "--",
      width: "10%",
    },
    {
      name: "Updated Date",
      selector: (row: any) => row.updatedDate ? formatDate(row.updatedDate) : "--",
      width: "10%",
    },
    {
      name: "Status",
      cell: (row: any) => (
        <span
          style={{
            backgroundColor: "var(--color-warning-gold)",
            padding: "4px 12px",
            borderRadius: "2px",
            color: "var(--foreground)",
            fontWeight: 500,
            fontSize: "12px",
          }}
        >
          {row.status || "Requested"}
        </span>
      ),
      width: "10%",
    },
    {
      name: "Action",
      cell: (row: any) => (
        <Button
          type="primary"
          onClick={() => handleApproveClick(row)}
          style={{
            backgroundColor: "var(--theme-secondary)",
            color: "var(--primary-foreground)",
            borderRadius: "2px",
            border: "none",
            fontSize: "12px",
            padding: "4px 12px",
          }}
        >
          Approve
        </Button>
      ),
      width: "10%",
    },
  ];

  return (
    <div>
      <div className="container-fluid px-4 p-2 mt-2">
        <div className="d-flex align-items-center mb-3">
          <h2 className="mb-0" style={{ fontSize: "24px", fontWeight: "600" }}>
            Application#{applicationNumber} Approved Invoice Contracts
          </h2>
        </div>
        <div className="custom-table-wrapper border">
          <TableView
            header={Contracts_Header}
            data={mappedContracts}
            totalRows={totalRows}
            isLoading={skelitonLoading}
            from={from}
            page={page}
            totalPage={totalPage}
            setPage={setPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            to={to}
          />
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        onCancel={() => {
          setShowConfirmModal(false);
          setSelectedContract(null);
        }}
        className="custom-mod"
        style={{ maxWidth: "632px" }}
        title="Approve Contract"
        footer={[
          <Button key="no" onClick={() => {
            setShowConfirmModal(false);
            setSelectedContract(null);
          }}>
            No
          </Button>,
          <Button
            key="yes"
            type="primary"
            onClick={handleApproveConfirmed}
          >
            Yes
          </Button>,
        ]}
      >
        <Form>
          Are you sure you want to approve this contract?
        </Form>
      </Modal>
    </div>
  );
};

export default ContractRequest;

