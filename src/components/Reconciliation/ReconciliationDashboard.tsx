import { Button, Select, Card, Row, Col, Tag } from "antd";
import TableView from "../TableView/TableView";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ReactECharts from 'echarts-for-react';
import { 
  SyncOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined
} from "@ant-design/icons";
import { GetAccountBalance, getReconciliationStatus, getReconciliationAccounts, getReconciliationByAccount, GetErrorReport } from "../../redux/apis/apisCrudLms";
import Loader from "../Loader/Loader";

function ReconciliationDashboard() {
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [ReconciliationStatus, setReconciliationStatus] = useState<any>();
  const [AccountBalance, setAccountBalance] = useState<any>();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [selectedAccountNumber, setSelectedAccountNumber] = useState<string>("");
  const [reconciliationData, setReconciliationData] = useState<any>(null);
  const [loadingReconciliation, setLoadingReconciliation] = useState(false);
  const [errorReportData, setErrorReportData] = useState<any[]>([]);
  const [loadingErrorReport, setLoadingErrorReport] = useState(false);
  const [errorReportPage, setErrorReportPage] = useState(1);
  const [errorReportPageSize, setErrorReportPageSize] = useState(10);
  const [errorReportTotal, setErrorReportTotal] = useState(0);
  const [errorReportFrom, setErrorReportFrom] = useState(0);
  const [errorReportTo, setErrorReportTo] = useState(0);
  const fetchAccounts = async () => {
    try {
      setSkelitonLoading(true);
      const response = await getReconciliationAccounts();
      
      if (response?.data?.success) {
        const accountsData = response?.data?.data || [];
        setAccounts(accountsData);
        // Optionally set first account as default
        if (accountsData.length > 0) {
          setSelectedAccountId(accountsData[0].id);
          setSelectedAccountNumber(accountsData[0].bankAccountNumber);
        }
      }
    } catch (error: any) {
      toast.error(error?.message);
    } finally {
      setSkelitonLoading(false);
    }
  };

  const fetchReconciliationStatus = async () => {
    try {
      const response = await getReconciliationStatus();
      if (response) {
        const data = response?.data?.data;
        setReconciliationStatus(data || {});
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };

  const fetchAccountBalance = async () => {
    try {
      const response = await GetAccountBalance();
      if (response) {
        const data = response?.data?.data;
        setAccountBalance(data || []);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };

  const fetchErrorReport = async () => {
    try {
      setLoadingErrorReport(true);
      const response = await GetErrorReport({
        pageNo: errorReportPage,
        pageSize: errorReportPageSize,
      });
      
      if (response?.data?.success) {
        const data = response?.data?.data || [];
        setErrorReportData(data);
        
        // Extract pagination info from API response
        const pageInfo = response?.data?.pageInfo;
        const totalItems = pageInfo?.totalItems || data.length;
        setErrorReportTotal(totalItems);
        
        // Calculate from and to based on pagination
        const calculatedFrom = totalItems > 0 ? (errorReportPage - 1) * errorReportPageSize + 1 : 0;
        const calculatedTo = Math.min(errorReportPage * errorReportPageSize, totalItems);
        setErrorReportFrom(calculatedFrom);
        setErrorReportTo(calculatedTo);
      } else {
        toast.error(response?.data?.notificationMessage || "Failed to fetch error report");
        setErrorReportData([]);
        setErrorReportTotal(0);
        setErrorReportFrom(0);
        setErrorReportTo(0);
      }
    } catch (error: any) {
      toast.error(error?.message || "Error fetching error report");
      setErrorReportData([]);
      setErrorReportTotal(0);
      setErrorReportFrom(0);
      setErrorReportTo(0);
    } finally {
      setLoadingErrorReport(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchReconciliationStatus();
    fetchAccountBalance();
  }, []);

  useEffect(() => {
    fetchErrorReport();
  }, [errorReportPage, errorReportPageSize]);

  const handleGetReconciliation = async () => {
    if (!selectedAccountNumber || !selectedAccountId) {
      toast.error("Please select an account first");
      return;
    }
    
    try {
      setLoadingReconciliation(true);
      const response = await getReconciliationByAccount(selectedAccountNumber);
      
      if (response?.data?.success) {
        setReconciliationData(response?.data?.data);
        
        // Refresh account balance after reconciliation
        await fetchAccountBalance();
        
        const selectedAccount = accounts.find(acc => acc.id === selectedAccountId);
        toast.success(`Reconciliation completed for ${selectedAccount?.accountName || 'selected account'}`);
      } else {
        toast.error("Failed to fetch reconciliation data");
      }
    } catch (error: any) {
      toast.error(error?.message || "Error fetching reconciliation data");
    } finally {
      setLoadingReconciliation(false);
    }
  };

  const handleAccountChange = (accountId: string) => {
    const selectedAccount = accounts.find(acc => acc.id === accountId);
    if (selectedAccount) {
      setSelectedAccountId(selectedAccount.id);
      setSelectedAccountNumber(selectedAccount.bankAccountNumber);
      setReconciliationData(null); // Reset previous data
    }
  };

  // Calculate values from reconciliationData if available, otherwise use ReconciliationStatus
  const dataSource = reconciliationData || ReconciliationStatus;
  const totalTransactions = (dataSource?.match || 0) + (dataSource?.unMatch || 0) + (dataSource?.pending || 0);
  const matchedCount = dataSource?.match || 0;
  const unmatchedCount = dataSource?.unMatch || 0;
  const pendingCount = dataSource?.pending || 0;

  // Chart configurations
  const donutChartOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      bottom: 0,
      data: ['Matched', 'Unmatched','Pending'],
      textStyle: {
        fontSize: 12
      }
    },
    series: [
      {
        name: 'Transactions',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { 
            value: dataSource?.match || 0, 
            name: 'Matched',
            itemStyle: { color: ' #1963b9' } // green
          },
          { 
            value: dataSource?.unMatch || 0, 
            name: 'Unmatched',
            itemStyle: { color: '#d35854' } // red
          },
          { 
            value: dataSource?.pending || 0, 
            name: 'Pending',
            itemStyle: { color: '#F7CB73' } // yellow
          }
        ]
      }
    ]
  };
  const accountBalanceChartOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      bottom: 0,
    //   data: ['POOL Account', 'Collection Account','VAT Account','Revenue Account','Consumer Wallet'],
    data:AccountBalance?.slice(0,5)?.map((item: any)=>item?.accountName),
      textStyle: {
        fontSize: 12
      }
    },
    series: [
      {
        name: 'Transactions',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: AccountBalance?.map((item: any)=>{
            return {
                value:item?.balance,
                name:item?.accountName
            }
        })
        // data: [
        //   { 
        //     value: data?.matchedVsUnmatched?.matchedCount, 
        //     name: 'Pool Account',
        //     // itemStyle: { color: '#4f81bd' } 
        //   },
        //   { 
        //     value: data?.matchedVsUnmatched?.unmatchedCount, 
        //     name: 'Collection Account',
        //     // itemStyle: { color: '#c0504d' } 
        //   },
        //   { 
        //     value: data?.matchedVsUnmatched?.matchedCount, 
        //     name: 'VAT Account',
        //     // itemStyle: { color: '#9bbb59' } 
        //   },
        //   { 
        //     value: data?.matchedVsUnmatched?.unmatchedCount, 
        //     name: 'Revenue Account',
        //     // itemStyle: { color: '#7f64a2' } // red
        //   },
        //   { 
        //     value: data?.matchedVsUnmatched?.unmatchedCount, 
        //     name: 'Wallet Account',
        //     // itemStyle: { color: '#4aacc6' } // red
        //   }
        // ]
      }
    ]
  };


  const channelChartOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['SIMAH', 'NAFATH', 'DAKHLI', ],
      axisLabel: {
        fontSize: 12
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 10
      }
    },
    series: [
      {
        name: 'Transactions',
        type: 'bar',
        barWidth: '50%',
        data: [
          { value: 6000, itemStyle: { color: '#059669' } }, // IBFT - green
          { value: 4200, itemStyle: { color: '#2563eb' } }, // Raast - blue  
          { value: 3200, itemStyle: { color: '#7c3aed' } }, // UPI5 - purple
          { value: 1800, itemStyle: { color: '#06b6d4' } }  // Mastercard - cyan
        ]
      }
    ]
  };

  // Format date helper
  const formatDate = (isoString: any) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  // Map error report data for table
  const mappedErrorReportData = errorReportData.map((item: any) => ({
    id: item?.transactionId || Math.random(),
    channel: item?.errorType || "-",
    amount: item?.amount ? `SAR ${item.amount.toLocaleString()}` : "-",
    dateTime: formatDate(item?.date),
    status: item?.priority || "Unmatched",
    description: item?.description || "-",
    affectedAccount: item?.affectedAccount || "-",
    requiredAction: item?.requiredAction || "-",
  }));

  // TableView header configuration
  const errorReportHeader = [
    {
      name: "Channel",
      selector: (row: { channel: any }) => row.channel || "-",
      width: "20%",
    },
    {
      name: "Amount",
      selector: (row: { amount: any }) => row.amount || "-",
    },
    {
      name: "Date/Time",
      selector: (row: { dateTime: any }) => row.dateTime || "-",
    },
    {
      name: "Status",
      cell: (row: { status: any }) => (
        <Tag color="error" style={{ borderRadius: '6px', fontSize: '11px' }}>
          {row.status || "Unmatched"}
        </Tag>
      ),
    },
    {
      name: "Description",
      selector: (row: { description: any }) => row.description || "-",
    },
    {
      name: "Affected Account",
      selector: (row: { affectedAccount: any }) => row.affectedAccount || "-",
    },
    {
      name: "Required Action",
      selector: (row: { requiredAction: any }) => row.requiredAction || "-",
      width: "20%",
    },
  ];

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Account Selector and Reconciliation Button */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={24}>
          <Card style={{ borderRadius: '6px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ flex: '1', minWidth: '250px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                  Select Account
                </label>
                <Select
                  style={{ width: '100%' }}
                  placeholder="Select an account"
                  value={selectedAccountId || undefined}
                  onChange={handleAccountChange}
                  loading={skelitonLoading}
                  size="large"
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={accounts.map(account => ({
                    value: account.id,
                    label: account.accountName,
                  }))}
                />
              </div>
              <div style={{ marginTop: '30px' }}>
                <Button
                  type="primary"
                  size="large"
                  loading={loadingReconciliation}
                  onClick={handleGetReconciliation}
                  disabled={!selectedAccountId}
                  style={{
                    backgroundColor: ' #1963b9',
                    borderColor: ' #1963b9',
                    borderRadius: '6px',
                    fontWeight: 500,
                  }}
                >
                  Get Reconciliation
                </Button>
              </div>
            
            </div>
            
   
          </Card>
        </Col>
      </Row>

   
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            style={{ 
              backgroundColor: '#ffffff',
              border: '1px solid #e6e8f0',
              borderRadius: '6px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                backgroundColor: '#FFF6CF',
                borderRadius: '6px',
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <SyncOutlined style={{ color: '#AD8700', fontSize: '18px' }} />
              </div>
              <div>
                <p style={{ margin: 0, color: '#6c757d', fontSize: '12px' }}>Total Txns Today</p>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
                  {skelitonLoading ? <Loader/> : totalTransactions.toLocaleString()}
                </h3>
        </div>
              <InfoCircleOutlined style={{ marginLeft: 'auto', color: '#6c757d' }} />
      </div>
          </Card>
        </Col>

          <Col xs={24} sm={12} lg={6}>
          <Card 
            style={{ 
              backgroundColor: '#ffffff',
              border: '1px solid #e6e8f0',
              borderRadius: '6px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                backgroundColor: '#E9FFF2',
                borderRadius: '6px',
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CheckCircleOutlined style={{ color: '#148E3F', fontSize: '18px' }} />
              </div>
              <div>
                <p style={{ margin: 0, color: '#6c757d', fontSize: '12px' }}>Matched Today</p>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
                {skelitonLoading ? <Loader/> : `${matchedCount.toLocaleString()}`}
                </h3>
              </div>
              <InfoCircleOutlined style={{ marginLeft: 'auto', color: '#6c757d' }} />
            </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
          <Card 
            style={{ 
              backgroundColor: '#ffffff',
              border: '1px solid #e6e8f0',
              borderRadius: '6px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                backgroundColor: '#FFE8EA',
                borderRadius: '6px',
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CloseCircleOutlined style={{ color: '#C21F30', fontSize: '18px' }} />
              </div>
              <div>
                <p style={{ margin: 0, color: '#6c757d', fontSize: '12px' }}>Unmatched Today</p>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
                {skelitonLoading ? <Loader/> : `${unmatchedCount.toLocaleString()}`}
                </h3>
              </div>
              <InfoCircleOutlined style={{ marginLeft: 'auto', color: '#6c757d' }} />
            </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
          <Card 
            style={{ 
              backgroundColor: '#ffffff',
              border: '1px solid #e6e8f0',
              borderRadius: '6px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                backgroundColor: '#FFE7EE',
                borderRadius: '6px',
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ExclamationCircleOutlined style={{ color: '#D14C74', fontSize: '18px' }} />
              </div>
              <div>
                <p style={{ margin: 0, color: '#6c757d', fontSize: '12px' }}>Pending Manual Reviews</p>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
                {skelitonLoading ? <Loader/> : pendingCount.toLocaleString()}
                </h3>
              </div>
              <InfoCircleOutlined style={{ marginLeft: 'auto', color: '#6c757d' }} />
            </div>
            </Card>
          </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        {/* Donut Chart */}
        <Col xs={24} lg={12}>
          <Card title="Reconciliation Status" style={{ borderRadius: '6px', height: '500px' }}>
            <ReactECharts 
              option={donutChartOption} 
              style={{ height: '400px' }}
              opts={{ renderer: 'svg' }}
              />
            </Card>
          </Col>
        <Col xs={24} lg={12}>
          <Card title="Account Balance Distribution" style={{ borderRadius: '6px', height: '500px' }}>
            <ReactECharts 
              option={accountBalanceChartOption} 
              style={{ height: '400px' }}
              opts={{ renderer: 'svg' }}
              />
            </Card>
          </Col>

       
      </Row>
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24}>
          <Card 
            title="Operation Expenses By Service Type" 
            style={{ 
              borderRadius: '6px', 
              backgroundColor: '#e9ecef',
              border: 'none'
            }}
            headStyle={{ backgroundColor: '#e9ecef', border: 'none' }}
            bodyStyle={{ backgroundColor: 'white', borderRadius: '0 0 6px 6px' }}
          >
            <ReactECharts 
              option={channelChartOption} 
              style={{ height: '300px' }}
              opts={{ renderer: 'svg' }}
            />
          </Card>
        </Col>
      </Row>
      <Card 
        title="Last 10 unmatched" 
        style={{ borderRadius: '6px' }}
        bodyStyle={{ padding: 0 }}
      >
        <div className="cs-table p-2">
          <TableView
            header={errorReportHeader}
            data={mappedErrorReportData}
            setPage={setErrorReportPage}
            setPageSize={setErrorReportPageSize}
            page={errorReportPage}
            pageSize={errorReportPageSize}
            totalRows={errorReportTotal}
            from={errorReportFrom}
            to={errorReportTo}
            isLoading={loadingErrorReport}
          />
        </div>
      </Card>
    </div>
  );
}

export default ReconciliationDashboard;
