import { useState, useEffect } from "react";
import { Button, Dropdown, Menu, Modal } from "antd";
import { DownOutlined } from "@ant-design/icons";
import TableView from "../../../../components/TableView/TableView";
import toast from "react-hot-toast";
import { getAllInvestments, approveInvestment, updateWalletBalance } from "../../../../redux/apis/apisInvestor";

const ApproveInvestment = () => {
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<any>(null);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    getInvestmentsList();
  }, [page, pageSize]);

  const getInvestmentsList = async () => {
    try {
      setSkelitonLoading(true);
      const response = await getAllInvestments(page, pageSize);
      
      if (response?.success) {
        const investmentsData = response?.data || [];
        const pageInfo = response.pageInfo || {};
        
        setData(investmentsData);
        const totalItems = pageInfo.totalItems || pageInfo.totalCount || 0;
        setTotalRows(totalItems);
        setFrom(pageInfo.page ? ((pageInfo.page - 1) * pageInfo.pageSize) + 1 : 1);
        setTo(pageInfo.page ? Math.min(pageInfo.page * pageInfo.pageSize, totalItems) : 0);
        setPage(pageInfo.page || page);
        setTotalPage(pageInfo.totalPages || 1);
      }
      setSkelitonLoading(false);
    } catch (error: any) {
      toast.error(error?.notificationMessage || error?.message || "Failed to fetch investments");
      setSkelitonLoading(false);
    }
  };

  const handleApproveClick = (row: any) => {
    setSelectedInvestment(row);
    // setAmount(row.investmentAmount || 0);
    setApproveModalVisible(true);
  };

  const handleApprove = async () => {
    if (!selectedInvestment) {
      toast.error("Please select an investment");
      return;
    }

    try {
      setApproving(true);
      
      // Step 1: Approve the investment
      const approveResult = await approveInvestment({
        investmentId: selectedInvestment.id,
        verificationStatus: 1,
      });

      if (approveResult.success === false) {
        // Show notification message if approval fails
        const errorMessage = approveResult.notificationMessage || "Failed to approve investment";
        toast.error(errorMessage);
        setApproving(false);
        return;
      }

      if (approveResult.success) {
        // Step 2: If approval succeeds, update wallet balance
        const walletUpdateResult = await updateWalletBalance({
          userId: selectedInvestment.investorId,
          investment: selectedInvestment.investmentAmount || 0,
        });

        // Only update status and refresh if BOTH APIs succeeded
        if (walletUpdateResult.success) {
          // Both APIs succeeded - update the status in the table
          setData((prevData: any[]) => 
            prevData.map((item: any) => 
              item.id === selectedInvestment.id 
                ? { ...item, verificationStatus: 1 }
                : item
            )
          );
          
          toast.success(walletUpdateResult?.data?.notificationMessage || walletUpdateResult?.message || "Investment approved and wallet balance updated successfully");
          setApproveModalVisible(false);
          setSelectedInvestment(null);
          // Refresh the list to get latest data
          getInvestmentsList();
        } else {
          // Wallet update failed - don't update status or refresh list
          toast.error(walletUpdateResult.error || "Investment approval failed: wallet balance could not be updated");
        }
      }
      setApproving(false);
    } catch (error: any) {
      toast.error(error?.notificationMessage || error?.message || "Failed to approve investment");
      setApproving(false);
    }
  };

  const menu = (row: any) => (
    <Menu>
      <Menu.Item key="approve" onClick={() => handleApproveClick(row)}>
        Approve
      </Menu.Item>
    </Menu>
  );

  const Headers = [
    // {
    //   name: "Investment ID",
    //   selector: (row: any) => row.id || "-",
    //   sortable: true,
    //   width: "400px",
    // },
    // {
    //   name: "Investor ID",
    //   selector: (row: any) => row.investorId || "-",
    //   sortable: true,
    //   width: "400px",
    // },
    {
      name: "Product Name",
      selector: (row: any) => row.productName || "-",
      sortable: true,
    //   width: "200px",
    },
    {
      name: "Investment Amount",
      selector: (row: any) => row.investmentAmount ? `SAR ${row.investmentAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "-",
      sortable: true,
    //   width: "150px",
    },
    {
        name: "Investor Name",
        selector: (row: any) => row.investorName || "-",
        sortable: true,
        // width: "150px",
      },
    // {
    //   name: "Expected Total Payment",
    //   selector: (row: any) => row.expectedTotalPayment ? `$${row.expectedTotalPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "-",
    //   sortable: true,
    //   width: "180px",
    // },
    {
      name: "Status",
      cell: (row: any) => {
        // verificationStatus: 0 = Pending, > 0 = Approved
        const isVerified = row.verificationStatus !== undefined && row.verificationStatus !== 0;
        const statusText = isVerified ? "Approved" : "Pending";
        const statusColor = isVerified ? "var(--color-success)" : "var(--color-warning-amber)";
        return (
          <span
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              backgroundColor: statusColor,
              color: "white",
              fontSize: "12px",
            }}
          >
            {statusText}
          </span>
        );
      },
      sortable: true,
    },
    {
      name: "Created At",
      selector: (row: any) => row.createdAt ? new Date(row.createdAt).toLocaleString() : "-",
      sortable: true,
    //   width: "180px",
    },
    {
      name: "Action",
      cell: (row: any) => {
        // Check if already approved (verificationStatus !== 0)
        const isApproved = row.verificationStatus !== undefined && row.verificationStatus !== 0;
        if (isApproved) {
          return (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "6px",
                backgroundColor: "#434948",
                // border: "1px solid #Ergb(67, 73, 72)
                color: "var(--primary-foreground)",
                fontSize: "12px",
                fontWeight: "500",
              }}
            >
              
              Already Approved
            </span>
          );
        }
        return (
          <Dropdown overlay={menu(row)} trigger={["click"]}>
            <Button type="primary" style={{ backgroundColor: "var(--foreground)" }}>
              Select <DownOutlined />
            </Button>
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div className="service">
      <h2 className="mb-3 mt-2 d-flex justify-content-start">Approve Investment</h2>
      <TableView
        header={Headers}
        data={data}
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

      <Modal
        title="Approve Investment"
        open={approveModalVisible}
        onOk={handleApprove}
        onCancel={() => {
          setApproveModalVisible(false);
          setSelectedInvestment(null);
        //   setAmount(0);
        }}
        confirmLoading={approving}
        okText="Approve"
        okButtonProps={{ style: { backgroundColor: "var(--foreground)", borderColor: "var(--foreground)" } }}
      >
        {selectedInvestment && (
          <div className="mb-2">
            <p className="mb-1"><strong>Investor Name:</strong> {selectedInvestment.investorName || "-"}</p>
            <p className="mb-1"><strong>Product Name:</strong> {selectedInvestment.productName || "-"}</p>
       
            <p className="mb-0"><strong>Investment Amount:</strong> SAR {selectedInvestment.investmentAmount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ApproveInvestment;

