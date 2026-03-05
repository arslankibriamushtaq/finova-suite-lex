import { useState, useCallback } from "react";
import { Input, Button, Dropdown, Menu, DatePicker } from "antd";
import { FaSearch } from "react-icons/fa";
import TableView from "../../../components/TableView/TableView";
import BuisnessModal from "../../../components/Customers/Modals/BuisnessModal";
import { useNavigate } from "react-router-dom";
import { DownOutlined, EyeOutlined } from "@ant-design/icons";
import StringTest from "./String";
// import { useDropzone } from "react-dropzone";

const data = [
  {
    FileName: "Doc1",
    DocumentType: "IncomeVerification",
    DocumentSubType: "Credit",
    AccountNo: "12345",
    Attach: "LegalDoc",
    Status: "Active",
    TrackingNo: "345678",
    DocketNo: "345678",
    Location: "Loan application",
    ReceivedData: "11/07/24",
  },
  {
    FileName: "Doc1",
    DocumentType: "IncomeVerification",
    DocumentSubType: "Credit",
    AccountNo: "12345",
    Attach: "LegalDoc",
    Status: "Inactive",
    TrackingNo: "345678",
    DocketNo: "345678",
    Location: "Loan application",
    ReceivedData: "11/07/24",
  },
];

const LoanInvoice = () => {
  const [searchValue, setSearchValue] = useState("");
  const [addCustomerModal, setAddCustomerModal] = useState(false);
  const [individualModal, setIndividualModal] = useState(false);
  const [customerValue, setCustomerValue] = useState("individuals");
  const [buisnessForm, setBusinessForm] = useState(false);
  const [editRowId, setEditRowId] = useState(null);
  const [value, setValue] = useState(data);
  const [editFormData, setEditFormData] = useState<any>({});
  const [uploadedDoc, setUploadedDoc] = useState<any[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const navigate = useNavigate();

  const onDrop = useCallback((data: any[]) => {
    setUploadedDoc((prevDocs) => [
      ...prevDocs,
      ...data.map((doc) => ({ name: doc.FileName, status: doc.Status })),
    ]);
  }, []);

  const handleEditClick = (row: any) => {
    setEditRowId(row.id);
    setEditFormData({ ...row });
  };

  const handleSaveClick = (rowId: any) => {
    const newData = value.map((row: any) =>
      row.id === rowId ? { ...row, ...editFormData } : row
    );
    setValue(newData);
    setEditRowId(null);
  };

  const handleInputChange = (event: any) => {
    const { name, value } = event.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  const customSearchInput = (
    <Input
      placeholder="Search"
      value={searchValue}
      prefix={<FaSearch />}
      onChange={(e) => setSearchValue(e.target.value)}
    />
  );
  const handleChange = (key: string, row: any) => {
    if (key === "loanInvoice") {
      //   handleEditClick(row);
    } else if (key === "view") {
      //   handleView(row);
      navigate("/lms/loandetailview");
    }
  };
  const menu = (row: any) => (
    <Menu onClick={({ key }: any) => handleChange(key, row)}>
      <Menu.Item key="view" icon={<EyeOutlined />}>
        View
      </Menu.Item>
    </Menu>
  );
  const Account_Documents_List_Header = [
    {
      name: "Application ID",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="Application ID"
            value={editFormData.FileName}
            onChange={handleInputChange}
          />
        ) : (
          row.FileName
        ),
    },
    {
      name: "Document Type",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="DocumentType"
            value={editFormData.DocumentType}
            onChange={handleInputChange}
          />
        ) : (
          row.DocumentType
        ),
    },
    {
      name: "Customer ID",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="Customer ID"
            value={editFormData.DocumentSubType}
            onChange={handleInputChange}
          />
        ) : (
          row.DocumentSubType
        ),
    },
    {
      name: "Type",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="AccountNo"
            value={editFormData.AccountNo}
            onChange={handleInputChange}
          />
        ) : (
          row.AccountNo
        ),
    },
    {
      name: "Product",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="Product"
            value={editFormData.Attach}
            onChange={handleInputChange}
          />
        ) : (
          row.Attach
        ),
    },
    {
      name: "Date",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="Date"
            value={editFormData.Status}
            onChange={handleInputChange}
          />
        ) : (
          row.Status
        ),
    },
    {
      name: "Company",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="Company"
            value={editFormData.TrackingNo}
            onChange={handleInputChange}
          />
        ) : (
          row.TrackingNo
        ),
    },
    {
      name: "Billing Cycle",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="Billing Cycle"
            value={editFormData.DocketNo}
            onChange={handleInputChange}
          />
        ) : (
          row.DocketNo
        ),
    },
    {
      name: "Purpose",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="Purpose"
            value={editFormData.Location}
            onChange={handleInputChange}
          />
        ) : (
          row.Location
        ),
    },
    {
      name: "Producer",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="Producer"
            value={editFormData.ReceivedData}
            onChange={handleInputChange}
          />
        ) : (
          row.ReceivedData
        ),
    },
    {
      name: "Contact No.",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="Contact No."
            value={editFormData.ReceivedData}
            onChange={handleInputChange}
          />
        ) : (
          row.ReceivedData
        ),
    },
    {
      name: "Lead No.",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="Lead No."
            value={editFormData.ReceivedData}
            onChange={handleInputChange}
          />
        ) : (
          row.ReceivedData
        ),
    },

    {
      name: "Status",
      width: "150px",
      cell: (row: any) => (
        <div
          style={{
            whiteSpace: "nowrap",
            padding: "0.4rem 1rem",
            borderRadius: "12px",
            backgroundColor:
              row.Status === "Active"
                ? "var(--color-status-green)"
                : row.Status === "Inactive"
                ? "var(--color-status-amber)"
                : row.Status === "Rejected"
                ? "var(--color-status-coral)"
                : row.Status === "In Complete"
                ? "var(--color-status-gray)"
                : row.Status === "Inprogress"
                ? "var(--color-status-blue)"
                : "var(--color-status-dark)",
            color: "var(--primary-foreground)",
            cursor: row.Status === "Active" ? "pointer" : "default",
          }}
        >
          {row.Status}
        </div>
      ),
    },

    {
      name: "Status",
      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button>
            Select <DownOutlined />
          </Button>
        </Dropdown>
      ),
    },
  ];

  const button = [{ title: "view" }];

  return (
    <div>
      <StringTest />
      <div className="col-12 d-flex align-items-center">
        <div className="col-10 d-flex pb-2  search-bar">
          <div className="d-flex  structure justify-content-between">
            <div className="d-grid">
              <label htmlFor="" className="label-theme">
                From
              </label>
              <DatePicker
                style={{
                  width: "200px",
                  height: "36px",
                  marginRight: "10px",
                }}
              />
            </div>

            <div className="d-grid">
              <label htmlFor="" className="label-theme">
                To
              </label>
              <DatePicker
                style={{
                  width: "200px",
                  height: "36px",
                }}
              />
            </div>
          </div>
          <div className="d-flex ps-2  structure justify-content-between">
            <div className="d-grid">
              <label htmlFor="" className="label-theme">
                From
              </label>
              <DatePicker
                style={{
                  width: "200px",
                  height: "36px",
                  marginRight: "10px",
                }}
              />
            </div>

            <div className="d-grid">
              <label htmlFor="" className="label-theme">
                To
              </label>
              <DatePicker
                style={{
                  width: "200px",
                  height: "36px",
                }}
              />
            </div>
          </div>
          <div className="ps-2 d-flex align-items-center">
            <Button
              style={{
                borderRadius: "8px",
                border: "transparent",
              }}
              className="invoice-btn mt-3"
              onClick={() => {
                // setAddCustomerModal(true);
              }}
            >
              Clear
            </Button>
          </div>
        </div>
        <div className="col-2 d-flex justify-content-end">
          <Button
            style={{
              borderRadius: "8px",
              border: "transparent",
            }}
            className="invoice-btn mt-2"
            onClick={() => {
              // setAddCustomerModal(true);
            }}
          >
            Export CSV
          </Button>
        </div>
      </div>

      <div className="cs-table p-2 mt-3">
        <TableView
          setPage={setPage}
          setPageSize={setPageSize}
          totalRows={totalRows}
          header={Account_Documents_List_Header}
          data={data}
        />
      </div>

      <BuisnessModal
        setBusinessForm={setBusinessForm}
        buisnessForm={buisnessForm}
        setCustomerValue={setCustomerValue}
      />
    </div>
  );
};

export default LoanInvoice;
