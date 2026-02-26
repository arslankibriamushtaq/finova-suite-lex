import React, { useState, useCallback, useEffect } from "react";
import { Input, Button, Select, message, Radio, Space, Upload } from "antd";
import { Modal } from "react-bootstrap";
import { UploadOutlined } from "@ant-design/icons";
import { FaSearch, FaFilter, FaBars, FaAngleDown } from "react-icons/fa";
import TableView from "../TableView/TableView";
import BuisnessModal from "../Customers/Modals/BuisnessModal";
import { useNavigate } from "react-router-dom";
import { Account_Documents_List_Header } from "../Config/TableHeaders";
import { Container, Row, Col, Form } from "react-bootstrap";
import TableHeaderFilter from "../TableHeaderFilter";
import axios from "../../utils/axios";
import type { GetProp, UploadFile, UploadProps } from "antd";
import toast from "react-hot-toast";

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

// import { useDropzone } from "react-dropzone";

// const data = [
//   {
//     FileName: "Doc1",
//     DocumentType: "IncomeVerification",
//     DocumentSubType: "Credit",
//     AccountNo: "12345",
//     Attach: "LegalDoc",
//     ApplicationID: "LegalDoc",
//     Status: "Approved",
//     TrackingNo: "345678",
//     DocketNo: "345678",
//     Location: "Loan application",
//     ReceivedData: "11/07/24",
//     EffectiveData: "11/07/24",
//     ExpiryData: "11/07/24",
//     Comment: "Comment",
//   },

// "documentOf": "string",
// "documentType": 1,
// "accountID": "a0b90462-e737-4713-3539-08dcaca3d7fd",
// "applicationID": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
// "status": 1,
// "trackingNumber": "string",
// "docketNumber": "string",
// "receiveDate": "2024-10-14T05:27:40.989",
// "effectiveDate": "2024-10-14T05:27:40.989",
// "expiryDate": "2024-10-14T05:27:40.989",
// "comments": "string",

// "transferOrCopyFromAccountID": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
// "documentUrl": "string",
// "id": "4ed73211-60f9-4f6d-f929-08dcec1101e8",
// "created": "2024-10-14T05:28:17.0334722"
// ];

const AllDocuments = () => {
  const [searchValue, setSearchValue] = useState("");
  const [addCustomerModal, setAddCustomerModal] = useState(false);
  const [individualModal, setIndividualModal] = useState(false);
  const [customerValue, setCustomerValue] = useState("individuals");
  const [buisnessForm, setBusinessForm] = useState(false);
  const [editRowId, setEditRowId] = useState(null);
  const [editFormData, setEditFormData] = useState<any>({});

  const [filesOption, setFilesOption] = useState<any>("none");
  const [targetTypeOption, setTargetTypeOption] = useState<any>("customer");
  const [targetAccountNo, setTargetAccountNo] = useState<any>("");

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedDoc, setUploadedDoc] = useState<any[]>([]);

  const navigate = useNavigate();
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);

  const [value, setValue] = useState([]);
  const [data, setData] = useState([]);

  async function getDocumentsByAccNo() {
    try {
      if (targetAccountNo.length < 3) {
        toast.error("No account number provided!");
        return;
      }
      await axios
        .get(
          `/api/Document/GetDocumentsAgainstAccountNumber/${targetAccountNo}`
        )
        .then((res) => {
          if (res?.status == 200) {
            setData(res?.data?.data);
            setValue(res?.data?.data);
          }
        });
    } catch (e) {
      console.error(e);
    }
  }

  // useEffect(()=>{
  //   getDocumentsByAccNo();
  // }, [])

  function formatDate(dateString: any) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based in JS
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // const handleUpload = () => {
  //   const formData = new FormData();
  //   uploadedDoc.forEach((file: any) => {
  //     formData.append('files[]', file as FileType);
  //   });
  //   setUploading(true);
  //   // You can use any AJAX library you like
  //   fetch('https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload', {
  //     method: 'POST',
  //     body: formData,
  //   })
  //     .then((res) => res.json())
  //     .then(() => {
  //       setUploadedDoc([]);
  //       message.success('upload successfully.');
  //     })
  //     .catch(() => {
  //       message.error('upload failed.');
  //     })
  //     .finally(() => {
  //       setUploading(false);
  //     });
  // };
  const props: UploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      setFileList([...fileList, file]);

      return false;
    },
    fileList,
  };

  const docTypes = [
    "IncomeVerification",
    "CreditReport",
    "LoanAgreement",
    "IdentificationDocument",
    "CollateralDocument",
    "EmploymentVerification",
    "TaxReturns",
    "BankStatement",
    "InsurancePolicy",
    "GuarantorAgreement",
    "PaymentProof",
    "LegalContract",
    "AmortizationSchedule",
    "DisbursementLetter",
    "Other",
  ];

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

  const Account_Documents_List_Header = [
    {
      name: "File Name",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="documentOf"
            value={editFormData?.documentOf}
            onChange={handleInputChange}
          />
        ) : (
          row.documentOf
        ),
    },
    {
      name: "Document Type",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="documentType"
            value={editFormData?.documentType}
            onChange={handleInputChange}
          />
        ) : (
          docTypes[row.documentType - 1]
        ),
    },
    // {
    //   name: "Document Sub-Type",
    //   selector: (row: any) =>
    //     editRowId === row.id ? (
    //       <Input
    //         name="DocumentSubType"
    //         value={editFormData.DocumentSubType}
    //         onChange={handleInputChange}
    //       />
    //     ) : (
    //       row.DocumentSubType
    //     ),
    // },
    {
      name: "Account No.",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="accountID"
            value={editFormData?.accountID}
            onChange={handleInputChange}
          />
        ) : (
          row.accountID?.split("-")[0]
        ),
    },
    {
      name: "Application ID",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="applicationID"
            value={editFormData?.applicationID}
            onChange={handleInputChange}
          />
        ) : (
          row.applicationID?.split("-")[0]
        ),
    },
    // {
    //   name: "Attach",
    //   selector: (row: any) =>
    //     editRowId === row.id ? (
    //       <Input
    //         name="Attach"
    //         value={editFormData.Attach}
    //         onChange={handleInputChange}
    //       />
    //     ) : (
    //       row.Attach
    //     ),
    // },
    {
      name: "Status",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="status"
            value={editFormData?.status}
            onChange={handleInputChange}
          />
        ) : row.status ? (
          "Approved"
        ) : (
          "Unapproved"
        ),
    },
    {
      name: "Tracking No",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="trackingNumber"
            value={editFormData?.trackingNumber}
            onChange={handleInputChange}
          />
        ) : (
          row.trackingNumber
        ),
    },
    {
      name: "Docket No",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="docketNumber"
            value={editFormData?.docketNumber}
            onChange={handleInputChange}
          />
        ) : (
          row.docketNumber
        ),
    },
    // {
    //   name: "Location",
    //   selector: (row: any) =>
    //     editRowId === row.id ? (
    //       <Input
    //         name="Location"
    //         value={editFormData.Location}
    //         onChange={handleInputChange}
    //       />
    //     ) : (
    //       row.Location
    //     ),
    // },
    {
      name: "Received Date",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="receiveDate"
            value={editFormData?.receiveDate}
            onChange={handleInputChange}
          />
        ) : (
          formatDate(row.receiveDate)
        ),
    },
    {
      name: "Effective Date",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="effectiveDate"
            value={editFormData?.effectiveDate}
            onChange={handleInputChange}
          />
        ) : (
          formatDate(row.effectiveDate)
        ),
    },
    {
      name: "Expiry Date",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="expiryDate"
            value={editFormData?.expiryDate}
            onChange={handleInputChange}
          />
        ) : (
          formatDate(row.expiryDate)
        ),
    },
    {
      name: "Comment",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="comments"
            value={editFormData?.comments}
            onChange={handleInputChange}
          />
        ) : (
          row.comments
        ),
    },
  ];

  const [showModal, setShowModal] = useState(false);

  async function submitDocumentsData() {
    try {
      await axios.post(`/`).then((res) => {
        if (res?.status == 201) {
        }
      });
    } catch (e) {
      console.error(e);
    }
  }
  const [appIdsList, setAppIdsList] = useState([]);

  async function getApplicationIds() {
    try {
      await axios
        .post(`/api/Invoice/GetApplicationsByAccountNumber/${123}`)
        .then((res) => {
          if (res?.status == 201) {
            setAppIdsList(res?.data?.data || []);
          }
        });
    } catch (e) {
      console.error(e);
    }
  }
  //
  async function getNextTrackingNum() {
    try {
      await axios.post(`/api/Document/GetNextTrackingNumber`).then((res) => {
        if (res?.status == 201) {
          return res?.data?.trackingNumber;
        }
      });
    } catch (e) {
      console.error(e);
    }
  }
  async function getDocketNo() {
    try {
      await axios.post(`/api/Document/GetNextTrackingNumber`).then((res) => {
        if (res?.status == 201) {
          return res?.data?.trackingNumber;
        }
      });
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div>
      {/* <Modal title="Basic Modal" open={showModal} onOk={submitDocumentsData} onCancel={()=>setShowModal(false)}> */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title className="modal-title">Upload Document</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={() => {}}>
            <Form.Group controlId={``}>
              <>
                <Form.Label className="mt-2">File Name</Form.Label>
                <Form.Control
                  type={"text"}
                  placeholder={"Enter file name"}
                  onChange={() => {}}
                />
              </>
              <>
                <Form.Label className="mt-2">Select File Type</Form.Label>
                <Select onChange={() => {}} style={{ width: "100%" }}>
                  {docTypes?.map((doc, index) => (
                    <Select.Option key={index} value={index + 1}>
                      {doc}
                    </Select.Option>
                  ))}
                </Select>
              </>
              <>
                <Form.Label className="mt-2">Select Application ID</Form.Label>
                <Select onChange={() => {}} style={{ width: "100%" }}>
                  {appIdsList?.map((appId, index) => (
                    <Select.Option key={index} value={index + 1}>
                      Option
                    </Select.Option>
                  ))}
                </Select>
              </>
            </Form.Group>
          </form>

          <div className="text-end mt-4">
            <Button
              type="primary"
              onClick={() => {
                setShowModal(false);
              }}
              style={{
                backgroundColor: "#EB0D0D",
              }}
            >
              Save
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      <div className="d-flex flex-column mt-4">
        <h1 style={{ fontSize: "22px" }}>Document Maintenance</h1>
        <div className="mt-3" style={{ fontWeight: 600 }}>
          Action
        </div>
        <div className="d-flex my-3">
          <Radio.Group
            value={filesOption}
            onChange={(val) => setFilesOption(val.target.value)}
            className="ms-3"
          >
            <Radio value="none">None</Radio>
            <Radio value="copy">Copy Document</Radio>
            <Radio value="move">Move Document</Radio>
            <Radio value="attach">Attach Document</Radio>
          </Radio.Group>
        </div>

        {filesOption == "attach" ? (
          <>
            <div className="mt-3">
              <span style={{ fontWeight: "bold" }}>Select Document</span>
              <div className="d-flex mt-2">
                <Upload {...props}>
                  <Button className="application-btn" type="primary">
                    Select File
                  </Button>
                </Upload>
                <span className="ms-3" style={{ color: "red" }}>
                  {uploadedDoc.length} document(s) uploaded
                </span>
              </div>
            </div>
            <Button
              className="application-btn flex col-3 mt-3"
              type="primary"
              onClick={() => setShowModal(true)}
              style={{ border: "none" }}
            >
              Upload Documents
            </Button>
          </>
        ) : (
          <>
            <div className="d-flex gap-2">
              <div>
                <p className="mt-2 mb-1">Select</p>
                <Select
                  defaultValue={"customer"}
                  value={targetTypeOption}
                  onChange={(val) => {
                    setTargetTypeOption(val);
                  }}
                  style={{ width: "270px" }}
                >
                  <Select.Option value={"customer"}>Customer</Select.Option>
                  <Select.Option value={"company"}>Company</Select.Option>
                </Select>
              </div>
              <div>
                <p className="mt-2 mb-1 fs-sm">Account Number</p>
                <Input
                  type={"text"}
                  placeholder={"Enter account number"}
                  value={targetAccountNo}
                  onChange={(val) => {
                    setTargetAccountNo(val.target.value);
                  }}
                  style={{ width: "270px" }}
                />
              </div>
            </div>
            <button
              onClick={() => getDocumentsByAccNo()}
              className="application-btn p-2 my-4 border-0 rounded-3"
              style={{
                width: "150px",
                color: "white",
                //backgroundColor: "#EB0D0D",
              }}
            >
              View Documents
            </button>
          </>
        )}
      </div>

      {filesOption != "attach" && (
        <>
          <div
            className="d-flex align-items-center justify-content-between mt-4"
            style={{ fontSize: "15px", fontWeight: "Bold" }}
          >
            Document Details
          </div>

          {data && data.length > 0 && (
            <>
              <div className="flex justify-content-between col-15">
                <TableHeaderFilter
                  searchInput={customSearchInput}
                  searchValue={searchValue}
                  setSearchValue={setSearchValue}
                  // button={button}
                  // button2={button2}
                />
              </div>
            </>
          )}

          {data && data.length > 0 && (
            <>
              <div className="cs-table p-2 mt-3">
                <TableView
                  header={Account_Documents_List_Header}
                  data={data}
                  setPage={setPage}
                  setPageSize={setPageSize}
                  totalRows={totalRows}
                />
              </div>
            </>
          )}

          {data && data.length < 1 && (
            <>
              <h5 className="text-center my-4">No Customer ID selected!</h5>
            </>
          )}

          <BuisnessModal
            setBusinessForm={setBusinessForm}
            buisnessForm={buisnessForm}
            setCustomerValue={setCustomerValue}
          />
        </>
      )}
    </div>
  );
};

export default AllDocuments;
