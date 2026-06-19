import { useEffect, useState } from 'react'
import { getCustomerApplications } from '../../redux/apis/apisCrud';
import TableView from '../TableView/TableView';
import { formatDate } from '../../App';
import toast from 'react-hot-toast';
import { Button, Dropdown, Menu } from 'antd';
import arrowDown from "../../assets/images/arrow-down.png";
import { CheckCircleOutlined, UploadOutlined, FileTextOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

// Dummy data for temporary use
const dummyApplications = [
    {
        id: 1,
        loan_application_number: "FVAN-6152142950",
        application_number: "FVAN-6152142950",
        product_name: "Invoice Factoring",
        product: "Invoice Factoring",
        customer_name: "ABC Trading Company",
        factoring_tenure: "90 days",
        department: "Finance",
        financing_type: "Recourse",
        factoring_type: "Recourse",
        financing_amount: "500,000.00",
        factoring_amount: "500,000.00",
        application_date: "2025-01-15",
        applicationDate: "2025-01-15",
        parent_status: "INCOMPLETE",
        parentStatus: "INCOMPLETE",
        status: "SUPPLIER-COMPLICLEAR-APPROVAL",
        application_status: "SUPPLIER-COMPLICLEAR-APPROVAL",
    }
];

const CustomerApplications = () => {
    const navigate = useNavigate();
    const [applications, setApplications] = useState<any>([]);
    const [page, setPage] = useState(1);
    const [totalRows, setTotalRows] = useState(0);
    const [from, setFrom] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [to, setTo] = useState(0);
    const [totalPage, setTotalPage] = useState(0);
    const [skelitonLoading, setSkelitonLoading] = useState(false);
    useEffect(() => {
        getApplications();
    }, [page, pageSize]);
    const getApplications = async () => {
        setSkelitonLoading(true);
        try {
            const response = await getCustomerApplications(page, pageSize);
            setTotalRows(response?.data?.data?.total || 0);
            setFrom(response?.data?.data?.from || 0);
            setTo(response?.data?.data?.to || 0);
            setPage(response?.data?.data?.current_page);
            setTotalPage(response?.data?.data?.last_page);
            setApplications(response?.data?.data?.data || []);
        } catch (error: any) {
            // Using dummy data for temporary purpose
            setApplications(dummyApplications);
            setTotalRows(dummyApplications.length);
            setFrom(1);
            setTo(dummyApplications.length);
            setPage(1);
            setTotalPage(1);
            setSkelitonLoading(false);
        } finally {
            setSkelitonLoading(false);
        }
    }
    const mappedApplications = dummyApplications.map((item: any) => ({
        id: item.id,
        applicationNumber: item.loan_application_number || item.application_number,
        product: item.product_name || item.product,
        customerName: item.customer_name || "--",
        factoringTenure: item.factoring_tenure || "--",
        department: item.department || "--",
        factoringType: item.financing_type || item.factoring_type || "--",
        factoringAmount: item.financing_amount || item.factoring_amount || "--",
        applicationDate: item.application_date || item.applicationDate,
        parentStatus: item.parent_status || item.parentStatus || "INCOMPLETE",
        status: item.status || item.application_status || "SUPPLIER-COMPLICLEAR-APPROVAL",
    }));
    console.log(mappedApplications);

    const Applications_Header = [
        {
            name: "Application No",
            selector: (row: any) => row.applicationNumber || "--",
            width: "11%",
        },
        {
            name: "Product",
            selector: (row: any) => row.product || "--",
            width: "10%",
        },
        {
            name: "Customer Name",
            selector: (row: any) => row.customerName || "--",
            width: "10%",
        },
        {
            name: "Factoring Tenure",
            selector: (row: any) => row.factoringTenure || "--",
            width: "7%",
        },
        {
            name: "Department",
            selector: (row: any) => row.department || "--",
            width: "7%",
        },
        {
            name: "Factoring Type",
            selector: (row: any) => row.factoringType || "--",
            width: "8%",
        },
        {
            name: "Factoring Amount",
            selector: (row: any) => row.factoringAmount || "--",
            width: "9%",
        },
        {
            name: "Application Date",
            selector: (row: any) => row.applicationDate ? formatDate(row.applicationDate) : "--",
            width: "9%",
        },
        {
            name: "Parent Status",
            cell: (row: any) => (
                <span
                    style={{
                        backgroundColor: "var(--color-text-slate)",
                        padding: "4px 12px",
                        borderRadius: "2px",
                        color: "var(--primary-foreground)",
                        fontWeight: 500,
                        fontSize: "12px",
                    }}
                >
                    {row.parentStatus || "--"}
                </span>
            ),
            width: "10%",
        },
        {
            name: "Status",
            cell: (row: any) => (
                <span
                    style={{
                        backgroundColor: "var(--color-text-slate)",
                        padding: "4px 12px",
                        borderRadius: "2px",
                        color: "var(--primary-foreground)",
                        fontWeight: 500,
                        fontSize: "12px",
                    }}
                >
                    {row.status || "--"}
                </span>
            ),
            width: "10%",
        },
        {
            name: "Action",
            cell: (row: any) => (
                <Dropdown overlay={menu(row)} trigger={["click"]}>
                    <Button
                        className="gradient-btn"
                        type="primary"
                        style={{
                            backgroundColor: "var(--color-action) !important",
                            color: "var(--foreground)",
                            borderColor: "white",
                            borderRadius: "2px",
                            padding: "10px 20px",
                        }}
                    >
                        Action <img src={arrowDown} alt="" style={{ marginLeft: "5px" }} />
                    </Button>
                </Dropdown>
            ),
        },
    ];

    const menu = (row: any) => (
        <Menu>
            <Menu.Item
                key="complete"
                icon={<CheckCircleOutlined />}
                onClick={() => handleMenuClick("complete", row)}
            >
                Complete Application
            </Menu.Item>
            <Menu.Item
                key="upload"
                icon={<UploadOutlined />}
                onClick={() => handleMenuClick("upload", row)}
            >
                Upload Documents
            </Menu.Item>
            <Menu.Item
                key="contract"
                icon={<FileTextOutlined />}
                onClick={() => handleMenuClick("contract", row)}
            >
                Contract Request
            </Menu.Item>
        </Menu>
    );
    const handleMenuClick = (action: string, data: any) => {
        switch (action) {
            case "complete":
                navigate(`/customer/CompleteApplication/${data.applicationNumber}`, {
                    state: { application: data }
                });
                break;
            case "upload":
                // TODO: Navigate to upload documents page
                console.log("Upload Documents:", data);
                break;
            case "contract":
                navigate(`/customer/ContractRequest/${data.applicationNumber}`, {
                    state: { application: data }
                });
                break;
            default:
                break;
        }
    };
    return (
        <div>
            <div className="container-fluid px-4 p-2 mt-2">
                <div className="d-flex align-items-center mb-3">
                    <h2 className="mb-0" style={{ fontSize: "24px", fontWeight: "600" }}>
                        My Applications
                    </h2>
                </div>
                <div className="custom-table-wrapper border">
                    <TableView header={Applications_Header} data={mappedApplications}
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
        </div>
    )
}

export default CustomerApplications