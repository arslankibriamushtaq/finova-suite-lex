import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Button, Descriptions, Table, Card } from "antd";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { getKycByInvestorId, getKybByInvestorId, getTransactionHistoryByInvestorId } from "../../../../redux/apis/apisInvestor";
import TableView from "../../../../components/TableView/TableView";
import Loader from "../../../../components/Loader/Loader";

const KycKybDetail = () => {
  const { t } = useTranslation("investor");
  const { investorId } = useParams<{ investorId: string }>();
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") as "kyc" | "kyb";
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [detailData, setDetailData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showTransactions, setShowTransactions] = useState(false);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  useEffect(() => {
    if (investorId) {
      fetchDetailData();
    }
  }, [investorId, type]);

  const fetchDetailData = async () => {
    if (!investorId) return;

    try {
      setLoading(true);
      let response;
      
      if (type === "kyc") {
        response = await getKycByInvestorId(investorId);
      } else {
        response = await getKybByInvestorId(investorId);
      }

      if (response?.success) {
        setDetailData(response.data || {});
      } else {
        toast.error(response?.notificationMessage || t("kkd.fetchError"));
      }
    } catch (error: any) {
      toast.error(error?.notificationMessage || error?.message || t("kkd.fetchError"));
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    if (!investorId) return;

    try {
      setTransactionsLoading(true);
      const response = await getTransactionHistoryByInvestorId(investorId);

      if (response?.success) {
        const transactionsData = response.data || [];
        setTransactions(Array.isArray(transactionsData) ? transactionsData : []);
        setShowTransactions(true);
      } else {
        toast.error(response?.notificationMessage || t("kkd.txFetchError"));
      }
    } catch (error: any) {
      toast.error(error?.notificationMessage || error?.message || t("kkd.txFetchError"));
    } finally {
      setTransactionsLoading(false);
    }
  };

  const transactionHeaders = [
    {
      name: t("kkd.col.txId"),
      selector: (row: any) => row.id || "-",
      sortable: true,
      width: "200px",
    },
    {
      name: t("kkd.col.txType"),
      cell: (row: any) => {
        // TransactionType enum: starts at 0
        const typeValue = row.transactionType !== undefined 
          ? (typeof row.transactionType === 'number' ? row.transactionType : parseInt(row.transactionType))
          : (row.type !== undefined ? (typeof row.type === 'number' ? row.type : parseInt(row.type)) : null);
        
        // If it's already a string and not a number, return as is
        if (typeValue === null || isNaN(typeValue)) {
          return row.transactionType || row.type || "-";
        }
        
        // TransactionType enum: 0=Deposit, 1=Withdrawal, 2=Transfer, 3=Payment, 4=Refund, 5=Investment, 6=Return
        let typeText = t("kkd.txType.unknown");

        switch (typeValue) {
          case 0:
            typeText = t("kkd.txType.deposit");
            break;
          case 1:
            typeText = t("kkd.txType.withdrawal");
            break;
          case 2:
            typeText = t("kkd.txType.transfer");
            break;
          case 3:
            typeText = t("kkd.txType.payment");
            break;
          case 4:
            typeText = t("kkd.txType.refund");
            break;
          case 5:
            typeText = t("kkd.txType.investment");
            break;
          case 6:
            typeText = t("kkd.txType.return");
            break;
          default:
            typeText = row.transactionType?.toString() || row.type?.toString() || t("kkd.txType.unknown");
        }
        
        return typeText;
      },
      sortable: true,
    },
    {
      name: t("common:amount"),
      selector: (row: any) => row.amount ? `SAR ${row.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "-",
      sortable: true,
      width: "150px",
    },
    {
      name: t("common:description"),
      selector: (row: any) => row.description || "-",
      sortable: true,
    },
    {
      name: t("common:status"),
      cell: (row: any) => {
        // TransactionStatus enum: 0=Pending, 1=Completed, 2=Failed, 3=Cancelled, 4=Reversed
        const statusValue = row.status !== undefined ? (typeof row.status === 'number' ? row.status : parseInt(row.status)) : 0;
        let statusText = t("kkd.txStatus.pending");
        let statusColor = "var(--color-warning-amber)"; // Yellow for Pending

        switch (statusValue) {
          case 0:
            statusText = t("kkd.txStatus.pending");
            statusColor = "var(--color-warning-amber)"; // Yellow
            break;
          case 1:
            statusText = t("kkd.txStatus.completed");
            statusColor = "var(--color-success)"; // Green
            break;
          case 2:
            statusText = t("kkd.txStatus.failed");
            statusColor = "var(--color-error)"; // Red
            break;
          case 3:
            statusText = t("kkd.txStatus.cancelled");
            statusColor = "#8c8c8c"; // Gray
            break;
          case 4:
            statusText = t("kkd.txStatus.reversed");
            statusColor = "var(--color-error-light)"; // Light Red
            break;
          default:
            statusText = row.status?.toString() || t("kkd.txStatus.pending");
            statusColor = "var(--color-warning-amber)";
        }
        
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
      width: "180px",
    },
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button
          icon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate("/InvestorDashboard/Investors")}
          className="mb-4"
        >
          {t("kycd.backToInvestors")}
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">
          {type === "kyc" ? t("kkd.kycDetail") : t("kkd.kybDetail")}
        </h1>
      </div>

      <Card className="mb-6">
        <Descriptions title={t("kkd.investorInfo")} bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
          {detailData &&
            Object.keys(detailData)
              .filter((key) => {
                const lowerKey = key.toLowerCase();
                // Filter out unwanted fields
                return (
                  lowerKey !== "profileimage" && 
                  lowerKey !== "profile_image" &&
                  lowerKey !== "countryid" &&
                  lowerKey !== "country_id" &&
                  lowerKey !== "verificationstatus" &&
                  lowerKey !== "verification_status" &&
                  lowerKey !== "language" &&
                  lowerKey !== "issuancecountryid" &&
                  lowerKey !== "issuance_country_id" &&
                  lowerKey !== "timezone" &&
                  lowerKey !== "time_zone" &&
                  lowerKey !== "currencyid" &&
                  lowerKey !== "currency_id" &&
                  lowerKey !== "verificationstatusid" &&
                  lowerKey !== "verification_status_id" &&
                  lowerKey !== "lastlogin" &&
                  lowerKey !== "last_login"
                );
              })
              .map((key) => {
                // Skip nested objects for now, display them as JSON string
                const value = detailData[key];
                let displayValue: any = value;

                if (value === null || value === undefined) {
                  displayValue = "-";
                } else if (typeof value === "object") {
                  displayValue = JSON.stringify(value, null, 2);
                } else if (typeof value === "boolean") {
                  displayValue = value ? t("common:yes") : t("common:no");
                } else if (typeof value === "number" && key.toLowerCase().includes("amount")) {
                  displayValue = `SAR ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                } else if (key.toLowerCase().includes("employeedesignation") || key.toLowerCase().includes("employee_designation")) {
                  // EmployeeDesignation enum: 0=Intern, 1=JuniorDeveloper, 2=Developer, 3=SeniorDeveloper, 4=TeamLead, 5=Manager, 6=Director, 7=VicePresident, 8=President, 9=CEO
                  const designationValue = typeof value === 'number' ? value : parseInt(value);
                  switch (designationValue) {
                    case 0:
                      displayValue = t("kkd.desig.ceo");
                      break;
                    case 1:
                      displayValue = t("kkd.desig.cfo");
                      break;
                    case 2:
                      displayValue = t("kkd.desig.director");
                      break;
                    case 0:
                      displayValue = t("kkd.desig.manager");
                      break;

                      displayValue = t("kkd.desig.ceo");
                      break;
                    default:

                      displayValue = value?.toString() || "-";
                  }
                } else if (key.toLowerCase().includes("date") || key.toLowerCase().includes("at")) {
                  try {
                    displayValue = new Date(value).toLocaleString();
                  } catch {
                    displayValue = value;
                  }
                }

                return (
                  <Descriptions.Item key={key} label={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")}>
                    {displayValue}
                  </Descriptions.Item>
                );
              })}
        </Descriptions>
      </Card>

      {!showTransactions && (
        <Card>
          <Button
            type="primary"
            onClick={fetchTransactions}
            loading={transactionsLoading}
            style={{ backgroundColor: "var(--foreground)", borderColor: "var(--foreground)" }}
          >
            {t("kkd.viewAllTransactions")}
          </Button>
        </Card>
      )}

      {showTransactions && (
        <Card title={t("kkd.transactionHistory")} className="mt-6">
          <TableView
            header={transactionHeaders}
            data={transactions}
            totalRows={transactions.length}
            isLoading={transactionsLoading}
            from={1}
            page={1}
            totalPage={1}
            setPage={() => {}}
            pageSize={transactions.length || 10}
            setPageSize={() => {}}
            to={transactions.length}
          />
        </Card>
      )}
    </div>
  );
};

export default KycKybDetail;

