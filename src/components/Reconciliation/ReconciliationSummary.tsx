import { Button, DatePicker, Form, Select, Card,  Table, Tag, Tabs } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { 
  BarChartOutlined,
} from "@ant-design/icons";
import SummaryReport from "./SummaryReport";


const { TabPane } = Tabs;

function ReconciliationSummary() {
  const { t } = useTranslation("reconciliation");
  const [loading, setLoading] = useState(false);
  
  const [formValues, setFormValues] = useState({
    reportType: "summary",
    dateRange: [dayjs().subtract(30, 'days'), dayjs()],
    channel: "",
    status: "",
  });

  const [reportData] = useState([
    {
      key: "1",
      date: "2024-01-15",
      totalTransactions: 1250,
      matched: 1200,
      unmatched: 50,
      percentage: 96.0,
      value: 15750000,
      exceptions: 2,
    },
    {
      key: "2",
      date: "2024-01-14", 
      totalTransactions: 1180,
      matched: 1150,
      unmatched: 30,
      percentage: 97.5,
      value: 14200000,
      exceptions: 1,
    },
    {
      key: "3",
      date: "2024-01-13",
      totalTransactions: 1320,
      matched: 1280,
      unmatched: 40,
      percentage: 97.0,
      value: 16800000,
      exceptions: 3,
    },
  ]);

  const [exceptionData] = useState([
    {
      key: "1",
      transactionId: "TXN001234567",
      date: "2024-01-15",
      amount: 25000,
      type: "Amount Mismatch",
      description: "System amount: 25000, Bank amount: 24500",
      status: "Open",
      assignedTo: "John Doe",
    },
    {
      key: "2",
      transactionId: "TXN001234568",
      date: "2024-01-15", 
      amount: 15000,
      type: "Missing Record",
      description: "Transaction exists in system but missing in bank statement",
      status: "In Progress",
      assignedTo: "Jane Smith",
    },
  ]);

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(t("summary.toast.reportGenerated"));
    } finally {
      setLoading(false);
    }
  };



  const summaryColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      sorter: true,
    },
    {
      title: 'Total Transactions',
      dataIndex: 'totalTransactions',
      key: 'totalTransactions',
      render: (value: number) => value.toLocaleString(),
      sorter: true,
    },
    {
      title: 'Matched',
      dataIndex: 'matched',
      key: 'matched',
      render: (value: number) => (
        <span style={{ color: '#AB1920', fontWeight: 'bold' }}>
          {value.toLocaleString()}
        </span>
      ),
      sorter: true,
    },
    {
      title: 'Unmatched',
      dataIndex: 'unmatched',
      key: 'unmatched',
      render: (value: number) => (
        <span style={{ color: value > 0 ? '#6E1418' : '#AB1920', fontWeight: 'bold' }}>
          {value.toLocaleString()}
        </span>
      ),
      sorter: true,
    },
    {
      title: 'Match %',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (value: number) => (
        <Tag color={value >= 95 ? 'success' : value >= 90 ? 'warning' : 'error'}>
          {value}%
        </Tag>
      ),
      sorter: true,
    },
    {
      title: 'Total Value (PKR)',
      dataIndex: 'value',
      key: 'value',
      render: (value: number) => value.toLocaleString(),
      sorter: true,
    },
    {
      title: 'Exceptions',
      dataIndex: 'exceptions',
      key: 'exceptions',
      render: (value: number) => (
        <span style={{ color: value > 0 ? '#ff4d4f' : '#AB1920' }}>
          {value}
        </span>
      ),
      sorter: true,
    },
  ];

  const exceptionColumns = [
    {
      title: 'Transaction ID',
      dataIndex: 'transactionId',
      key: 'transactionId',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Amount (PKR)',
      dataIndex: 'amount',
      key: 'amount',
      render: (value: number) => value.toLocaleString(),
    },
    {
      title: 'Exception Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 250,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === 'Open' ? 'error' : status === 'In Progress' ? 'processing' : 'success';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Assigned To',
      dataIndex: 'assignedTo',
      key: 'assignedTo',
    },
   
  ];

  return (
    <div className="Ente-details custom-mod p-3 bg-white rounded-2">
      {/* Header */}
      {/* <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-0" style={{ color: '#000', fontWeight: 600 }}>
            Reconciliation Reports
          </h4>
          <p className="text-muted mb-0">Generate and view reconciliation reports</p>
        </div>
      </div> */}

      {/* Filter Form */}
      {/* <Card className="mb-4"> */}
        <div className="d-flex flex-wrap gap-3 create-campaign-form mb-4">
          {/* <Form.Item className="w-48">
            <div className="custom-input-container">
              <label className="input-label">Report Type</label>
              <Select
                placeholder="Select Report Type"
                value={formValues.reportType}
                onChange={(value) => setFormValues(prev => ({ ...prev, reportType: value }))}
              >
                <Select.Option value="summary">Summary Report</Select.Option>
                <Select.Option value="detailed">Detailed Report</Select.Option>
                <Select.Option value="exceptions">Exception Report</Select.Option>
                <Select.Option value="trends">Trend Analysis</Select.Option>
              </Select>
            </div>
          </Form.Item> */}

          <Form.Item className="w-48 modal-date-pickr mb-0">
            <div className="custom-input-container">
              <label className="input-label">{t("summary.dateRange")}</label>
              <DatePicker.RangePicker
                style={{ width: "100%" ,height:"41px"}}
                value={formValues.dateRange as any}
                onChange={(dates: any) => setFormValues(prev => ({ ...prev, dateRange: dates }))}
              />
            </div>
          </Form.Item>

          {/* <Form.Item className="w-48">
            <div className="custom-input-container">
              <label className="input-label">Channel</label>
              <Select
                placeholder="Select Channel"
                value={formValues.channel}
                onChange={(value) => setFormValues(prev => ({ ...prev, channel: value }))}
              >
                <Select.Option value="">All Channels</Select.Option>
                <Select.Option value="mobile">Mobile App</Select.Option>
                <Select.Option value="web">Web Portal</Select.Option>
                <Select.Option value="atm">ATM</Select.Option>
                <Select.Option value="pos">POS</Select.Option>
              </Select>
            </div>
          </Form.Item> */}

          <Form.Item className="w-48 mb-0">
            <div className="custom-input-container">
              <label className="input-label">{t("common:status")}</label>
              <Select
                style={{ width: "100%" ,height:"55px"}}
                value={formValues.status}
                onChange={(value) => setFormValues(prev => ({ ...prev, status: value }))}
              >
                <Select.Option value="">{t("summary.allStatus")}</Select.Option>
                <Select.Option value="matched">{t("col.matched")}</Select.Option>
                <Select.Option value="unmatched">{t("col.unmatched")}</Select.Option>
                <Select.Option value="pending">{t("common:pending")}</Select.Option>
              </Select>
            </div>
          </Form.Item>
        </div>

      {/* </Card> */}

      {/* Reports Tabs */}
      <Card>
        <Tabs defaultActiveKey="summary">
          <TabPane tab={t("summary.tabSummaryReport")} key="summary">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">{t("summary.dailyReconciliationSummary")}</h6>
            </div>
            
            {/* <Table
              columns={summaryColumns}
              dataSource={reportData}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
              }}
            /> */}
            <SummaryReport formValues={formValues}/>
          </TabPane>

          {/* <TabPane tab="Exception Report" key="exceptions">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">Reconciliation Exceptions</h6>
            </div>
            
            <Table
              columns={exceptionColumns}
              dataSource={exceptionData}
              scroll={{ x: 1200 }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
              }}
            />
          </TabPane> */}

          {/* <TabPane tab="Trend Analysis" key="trends">
            <div className="text-center p-5">
              <BarChartOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
              <h5 className="mt-3">Trend Analysis</h5>
              <p className="text-muted">Charts and trend analysis will be displayed here</p>
              <Button type="primary" icon={<LineChartOutlined />}>
                View Analytics Dashboard
              </Button>
            </div>
          </TabPane> */}
        </Tabs>
      </Card>
    </div>
  );
}

export default ReconciliationSummary;
