import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button, Dropdown, Menu, Modal } from "antd";
import { DownOutlined } from "@ant-design/icons";
import TableView from "../../../../components/TableView/TableView";
import toast from "react-hot-toast";
import { getAllInvestments, approveInvestment, updateWalletBalance } from "../../../../redux/apis/apisInvestor";
import { usePermissions } from '../../../../hooks/useProductPermissions';

const ApproveInvestment = () => {
  const { hasPermission } = usePermissions();
  const canApprove = hasPermission('PORTFOLIO_INVESTMENT_APPROVE');
  const { t } = useTranslation("investor");
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
      toast.error(error?.notificationMessage || error?.message || t("appinv.fetchError"));
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
      toast.error(t("appinv.selectError"));
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
        const errorMessage = approveResult.notificationMessage || t("appinv.approveError");
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
          
          toast.success(walletUpdateResult?.data?.notificationMessage || walletUpdateResult?.message || t("appinv.success"));
          setApproveModalVisible(false);
          setSelectedInvestment(null);
          // Refresh the list to get latest data
          getInvestmentsList();
        } else {
          // Wallet update failed - don't update status or refresh list
          toast.error(walletUpdateResult.error || t("appinv.walletError"));
        }
      }
      setApproving(false);
    } catch (error: any) {
      toast.error(error?.notificationMessage || error?.message || t("appinv.approveError"));
      setApproving(false);
    }
  };

  const menu = (row: any) => (
    <Menu>
      {canApprove && (
        <Menu.Item key="approve" onClick={() => handleApproveClick(row)}>
          {t("appinv.approve")}
        </Menu.Item>
      )}
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
      name: t("appinv.col.productName"),
      selector: (row: any) => row.productName || "-",
      sortable: true,
    //   width: "200px",
    },
    {
      name: t("appinv.col.investmentAmount"),
      selector: (row: any) => row.investmentAmount ? `SAR ${row.investmentAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "-",
      sortable: true,
    //   width: "150px",
    },
    {
        name: t("appinv.col.investorName"),
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
      name: t("common:status"),
      cell: (row: any) => {
        // verificationStatus: 0 = Pending, > 0 = Approved
        const isVerified = row.verificationStatus !== undefined && row.verificationStatus !== 0;
        const statusText = isVerified ? t("appinv.status.approved") : t("appinv.status.pending");
        const statusColor = isVerified ? "var(--color-success)" : "var(--color-warning-amber)";
        return (
          <span
            style={{
              padding: "6px 12px",
              borderRadius: "2px",
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
      name: t("common:createdAt"),
      selector: (row: any) => row.createdAt ? new Date(row.createdAt).toLocaleString() : "-",
      sortable: true,
    //   width: "180px",
    },
    {
      name: t("common:actions"),
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
                borderRadius: "2px",
                backgroundColor: "#434948",
                // border: "1px solid #Ergb(67, 73, 72)
                color: "var(--primary-foreground)",
                fontSize: "12px",
                fontWeight: "500",
              }}
            >
              
              {t("appinv.alreadyApproved")}
            </span>
          );
        }
        return (
          <Dropdown overlay={menu(row)} trigger={["click"]}>
            <Button type="primary" style={{ backgroundColor: "var(--foreground)" }}>
              {t("appinv.select")} <DownOutlined />
            </Button>
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div className="service">
      <h2 className="mb-3 mt-2 d-flex justify-content-start">{t("appinv.title")}</h2>
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

      <Modal maskClosable={false} keyboard={false}
        title={t("appinv.title")}
        open={approveModalVisible}
        onOk={handleApprove}
        onCancel={() => {
          setApproveModalVisible(false);
          setSelectedInvestment(null);
        //   setAmount(0);
        }}
        confirmLoading={approving}
        okText={t("appinv.approve")}
        okButtonProps={{ style: { backgroundColor: "var(--foreground)", borderColor: "var(--foreground)" } }}
      >
        {selectedInvestment && (
          <div className="mb-2">
            <p className="mb-1"><strong>{t("appinv.modalInvestorName")}</strong> {selectedInvestment.investorName || "-"}</p>
            <p className="mb-1"><strong>{t("appinv.modalProductName")}</strong> {selectedInvestment.productName || "-"}</p>

            <p className="mb-0"><strong>{t("appinv.modalInvestmentAmount")}</strong> SAR {selectedInvestment.investmentAmount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ApproveInvestment;

