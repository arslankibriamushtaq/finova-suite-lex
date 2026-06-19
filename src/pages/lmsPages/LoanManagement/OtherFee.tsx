import { useState, useEffect } from "react";
import { Input, Button, Dropdown, Menu, Select, Switch } from "antd";
import TableView from "../../../components/TableView/TableView";
import BuisnessModal from "../../../components/Customers/Modals/BuisnessModal";
import { useNavigate } from "react-router-dom";
import { DownOutlined, EditOutlined } from "@ant-design/icons";
import {
  addFeeApi,
  getAllCategoryType,
  getAllFee,
  getAllProducts,
  getFeeInfo,
  updateFee,
} from "../../../redux/apis/apisCrudLms";
import toast from "react-hot-toast";
import Loader from "../../../components/Loader/Loader";
import { Col, Form, Modal, Row } from "react-bootstrap";
import edit from "../../../assets/images/tabler_edit (1).svg";
import { useSelector } from "react-redux";
import { setProdId } from "../../../redux/apis/apisSlice";
import { RootState } from "../../../redux/rootReducer";
const OtherFee: any = () => {
  const [customerValue, setCustomerValue] = useState("individuals");
  const [buisnessForm, setBusinessForm] = useState(false);
  const [editRowId, setEditRowId] = useState(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [to, setTo] = useState(0);
  const [from, setFrom] = useState(0);
  const [loader, setLoader] = useState(false);
  const [disberseDialog, setDisberseDialog] = useState(false);
  const [updateDialog, setUpdateDialog] = useState(false);
  const [createDialog, setCreateDialog] = useState(false);
  const [applicationData, setApplicationData] = useState<any>();
  const [category, setCategory] = useState<any>();
  const [selectFeeType, setSelectFeeType] = useState<any>("fixed");
  const [selectApplicable, setSelectApplicable] = useState<any>();
  // const [prodId, setProdId] = useState<any>();
  const [categoryData, setCategoryData] = useState<any>();
  const [errors, setErrors] = useState<any>({});
  const [error, setError] = useState("");
  const [taxChecked, setTaxChecked] = useState(false);
  const [taxAmount, setTaxAmount] = useState<number | string>("");
  const [errorPercentage, setErrorPercentage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState<any>(null);
  const [radioInputValue, setradioInputValue] = useState("Individual");
  const [initialProductId, setInitialProductId] = useState<any[]>();
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const prodId = useSelector((state: RootState) => state.block.prodId);
  // const prodId= []; 
  const [formValues, setFormValues] = useState<any>({
    category: "",
    feeApplicability: "",
    feeType: "",
    productID: "",
    productName: "",
    operationId: "",
    expiryDate: "",
    effectiveDate: "",
    loanAmount: 0,
    amount: 0,
    id: "",
    operationName: "",
    taxAmount: 0,
    taxChecked: "",
  });
  const [slabs, setSlabs]: any = useState([]);
  const [percentageData, setPercentageData] = useState<any>([]);
  const [showModal, setShowModal] = useState(false);
  const [percentageModal, setPercentageModal] = useState(false);
  const [newSlab, setNewSlab] = useState({
    slabName: "",
    min: "",
    max: "",
    value: "",
  });
  const [newPercentage, setNewPercentage] = useState({
    slabName: "",
    min: "",
    max: "",
    value: "",
  });
  const navigate = useNavigate();
  const handleInputChange: any = (event: any) => {
    const { name, value } = event.target;
    setFormValues({ ...formValues, [name]: value });
  };
  // const getProductId = async () => {
  //   try {
  //     const res = await getAllProducts(1, 1000);
  //     if (res) {
  //       const data = res.data.data;
  //       setProdId(data);
  //     }
  //   } catch (error: any) {
  //     toast.error(error?.message);
  //   }
  // };
  const getCategoryId: any = async () => {
    try {
      const res = await getAllCategoryType(category == "monetory" ? 1 : 0);
      if (res) {
        const data = res.data.data;
        setCategoryData(data);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  useEffect(() => {
    // getProductId();
    
    getCategoryId();
  }, [category]);
  function convertTimestampToDate(inputTimestamp: any): any {
    const date = new Date(inputTimestamp); // Parse the input timestamp
    date.setDate(date.getDate() + 1); // Add 1 day to the date

    // Format the date as YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  const getBussinessCategoryById: any = (id: any) => {
    const entry: any = prodId?.find((entry: any) => entry.productId === id);
    return entry ? entry.nameInEnglish : "ID not found";
  };
  const getInfo: any = async (id: any) => {
    try {
      const response = await getFeeInfo(id);
      if (response) {
        const data = response?.data?.data;
        setFormValues({
          id: id,
          productName: data.fee.productName,
          productId: data.fee.productID,
          category: data.fee.transactionCategory,
          operationName: data.fee.operationName,
          feeApplicability: data.fee.feeApplicability,
          feeType: data.fee.feeType,
          operationId: data.fee.operationId,
          expiryDate: convertTimestampToDate(data.fee.expiryDate),
          effectiveDate: convertTimestampToDate(data.fee.effectiveDate),
          amount: data.fee.fixed,
          taxAmount: data.fee.tax,
          taxChecked: data.fee.tax == null ? false : true,
        });
        setInitialProductId(data?.fee.productID);
        setCategory(
          data.fee.transactionCategory == 1 ? "nonmonetory" : "monetory"
        );
        setSelectFeeType(
          data?.fee?.feeType == 1
            ? "fixed"
            : data?.fee?.feeType == 2
              ? "fixedSlab"
              : data?.fee?.feeType == 3
                ? "percentage"
                : "percentageSlab"
        );
        setSlabs(data?.feeSlabs);
        setPercentageData(data?.feeSlabs);
        setSelectApplicable(
          data?.fee?.feeApplicability == 1 ? "manyTime" : "oneTime"
        );
        setUpdateDialog(true);
      }
    } catch (error: any) {
      toast.error(error?.message);
    } finally {
      setLoader(false);
    }
  };
  const handleChange: any = (key: string, row: any) => {
    if (key == "edit") {
      getInfo(row?.id);
    }
  };
  const ledgerAcoount: any = async () => {
    setSkelitonLoading(true);
    try {
      const requestBody = {
        pageNo: page,
        pageSize: pageSize,
        searchTypes: 11,
        searchQuery: "0",
        from: "2024-06-15T10:30:39.150Z",
        to: new Date(),
      };
      const response = await getAllFee(requestBody);
      if (response) {
        const data = response?.data?.data;
        setApplicationData(data || []);
        
        // Extract pagination data from API response
        const pageInfo = response?.data?.pageInfo;
        const totalItems = pageInfo?.totalItems || 0;
        setTotalRows(totalItems);
        
        // Calculate from and to based on pagination
        const calculatedFrom = totalItems > 0 ? (page - 1) * pageSize + 1 : 0;
        const calculatedTo = Math.min(page * pageSize, totalItems);
        setFrom(calculatedFrom);
        setTo(calculatedTo);
      }
    } catch (error: any) {
      toast.error(error?.message);
      // Reset pagination values on error
      setTotalRows(0);
      setFrom(0);
      setTo(0);
      setSkelitonLoading(false);
    } finally {
      setSkelitonLoading(false);
    }
  };
  const ApproveAmount: any = async () => {
    setLoader(true);
    const body = {
      id: formValues.id,
      operationName: formValues.operationId,
      feeType:
        selectFeeType == "fixed"
          ? 1
          : selectFeeType == "fixedSlab"
            ? 2
            : selectFeeType == "percentage"
              ? 3
              : 4,
      fixed: selectFeeType == "fixed" ? formValues.amount : 0,
      percentage: selectFeeType == "percentage" ? formValues.amount : 0,
      productID:
        formValues.productName == "All Products" ? 0 : formValues.productID,
      productName:
        formValues.productName == "All Products"
          ? "All Products"
          : getProductById(formValues.productID),
      transactionCategory: category == "monetory" ? 1 : 0,
      feeApplicability: selectApplicable == "manyTime" ? 1 : 0,
      effectiveDate: formValues.effectiveDate,
      expiryDate: formValues.expiryDate,
      isActive: true,
      isSpecificProduct:
        formValues.productName == "All Products" ? false : true,
      feeSlabs: selectFeeType == "fixedSlab" ? slabs : percentageData,
      tax: Number(formValues.taxAmount),
    };
    try {
      const response = await updateFee(body);
      if (response.data.notificationMessage == "Operation successful.") {
        toast.success(response.data.notificationMessage);
        setLoader(false);
        setUpdateDialog(false);
        ledgerAcoount();
        setCreateDialog(false);
      } else {
        toast.error(
          response?.data?.data?.notificationMessage ||
          response?.data?.notificationMessage ||
          response.data.errors[0]
        );
        setDisberseDialog(false);
        setLoader(false);
      }
    } catch (error: any) {
      setLoader(false);
      toast.error(error?.message);
    }
  };
  const addFee: any = async () => {
    setLoader(true);
    const body = {
      operationId: formValues.operationId,
      feeType:
        selectFeeType == "fixed"
          ? 1
          : selectFeeType == "fixedSlab"
            ? 2
            : selectFeeType == "percentage"
              ? 3
              : 4,
      fixed: selectFeeType == "fixed" ? formValues.amount : 0,
      percentage: selectFeeType == "percentage" ? formValues.amount : 0,
      productID:
        formValues.productName == "All Products" ? 0 : formValues.productID,
      productName:
        formValues.productName == "All Products"
          ? "All Products"
          : getProductById(formValues.productID),
      transactionCategory: category == "monetory" ? 1 : 0,
      feeApplicability: selectApplicable == "manyTime" ? 1 : 0,
      effectiveDate: formValues.effectiveDate,
      expiryDate: formValues.expiryDate,
      isActive: true,
      feeSlabs: selectFeeType == "fixedSlab" ? slabs : percentageData,
      createdBy: "",
      updatedBy: "",
      isSpecificProduct:
        formValues.productName == "All Products" ? false : true,
      tax: taxChecked ? Number(taxAmount) : 0,
    };
    try {
      const response = await addFeeApi(body);
      if (response.data.notificationMessage == "Operation successful.") {
        toast.success(response.data.notificationMessage);
        setLoader(false);
        setUpdateDialog(false);
      } else {
        toast.error(
          response?.data?.data?.notificationMessage ||
          response?.data?.notificationMessage ||
          response.data.errors[0]
        );
        setDisberseDialog(false);
        setCreateDialog(false);
        setLoader(false);
        ledgerAcoount();
      }
    } catch (error: any) {
      setLoader(false);
      setCreateDialog(false);
      toast.error(error?.message);
    }
  };
  useEffect(() => {
    ledgerAcoount();
  }, [page, pageSize]);
  function formatDate(dateString: any): any {
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based in JS
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }
  const menu: any = (row: any) => (
    <Menu onClick={({ key }: any) => handleChange(key, row)}>
      <Menu.Item key="edit" icon={<EditOutlined />}>
        Edit
      </Menu.Item>

      {/* <Menu.Item key="edit" icon={<EditOutlined />}>
        Edit
      </Menu.Item> */}
    </Menu>
  );
  const Other_List_Header = [
    // {
    //   name: "Id",
    //   selector: (row: any) =>
    //     editRowId === row.id ? (
    //       <Input
    //         name="Application ID"
    //         value={formValues.FileName}
    //         onChange={handleInputChange}
    //       />
    //     ) : (
    //       row.productName
    //     ),
    // },
    {
      name: "Category",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="DocumentType"
            value={formValues.DocumentType}
            onChange={handleInputChange}
          />
        ) : (
          row.transactionCategory
        ),
    },
    {
      name: "Operation Name",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="Customer ID"
            value={formValues.DocumentSubType}
            onChange={handleInputChange}
          />
        ) : (
          row.applicationKey
        ),
      width: "150px",
    },
    {
      name: "Product Name",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="Customer ID"
            value={formValues.DocumentSubType}
            onChange={handleInputChange}
          />
        ) : (
          row.productName
        ),
    },
    {
      name: "Fee Type",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="AccountNo"
            value={formValues.AccountNo}
            onChange={handleInputChange}
          />
        ) : row.feeType == 1 ? (
          "Fixed"
        ) : row.feeType == 2 ? (
          "Fixed Slab"
        ) : row.feeType == 3 ? (
          "Percentage"
        ) : (
          "Percentage Slab"
        ),
    },
    {
      name: "Applicability",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="AccountNo"
            value={formValues.AccountNo}
            onChange={handleInputChange}
          />
        ) : (
          row.feeApplicability
        ),
    },
    {
      name: "Effective Date",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="effectiveDate"
            value={formValues.AccountNo}
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
            name="AccountNo"
            value={formValues.AccountNo}
            onChange={handleInputChange}
          />
        ) : (
          formatDate(row?.expiryDate)
        ),
    },
    {
      name: "Created By",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="AccountNo"
            value={formValues.AccountNo}
            onChange={handleInputChange}
          />
        ) : (
          row?.createdBy
        ),
    },
    {
      name: "Created Date",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="AccountNo"
            value={formValues.AccountNo}
            onChange={handleInputChange}
          />
        ) : (
          formatDate(row?.created)
        ),
    },
    {
      name: "Updated By",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="AccountNo"
            value={formValues.AccountNo}
            onChange={handleInputChange}
            style={{ alignItems: "right" }}
          />
        ) : (
          row?.updatedBy
        ),
    },
    {
      name: "Updated Date",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="AccountNo"
            value={formValues.AccountNo}
            onChange={handleInputChange}
          />
        ) : (
          formatDate(row?.updated)
        ),
    },
    {
      name: "Active Status",
      width: "150px",
      cell: (row: any) => (
        <div>
          <Switch
            onChange={(e: any) => { }}
            checked={row.Status}
            className="red-switch"
          />
        </div>
      ),
    },

    {
      name: "Action",
      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button
            className="gradient-btn"
            type="primary"
            style={{
              borderColor: "white",
              borderRadius: "2px",
              padding: "10px 20px",
            }}
          >
            Select <DownOutlined />
          </Button>
        </Dropdown>
      ),
    },
  ];
  const mappedData =
    applicationData &&
    applicationData.map((item: any) => {
      return {
        id: item?.fee.id,
        productId: getBussinessCategoryById(item?.fee?.productID),
        productName: item?.fee?.productName,
        transactionCategory:
          item?.fee?.transactionCategory == 1 ? "Monetory" : "Non Monetory",
        applicationKey: item.fee.operationName,
        feeType: item?.fee?.feeType,
        // feeApplicability: item?.fee?.feeApplicability,
        feeApplicability: "One Time",
        effectiveDate: item?.fee?.effectiveDate,
        expiryDate: item.fee.expiryDate,
        createdBy: item?.fee?.createdBy,
        created: item?.fee.created,
        updatedBy: item?.fee?.updatedBy || "-",
        updated: item?.fee.created,
        Status: item?.fee?.isActive,
      };
    });

  const feeTypeOption = [
    { label: "Fixed", value: "fixed" },
    { label: "Fixed Slab", value: "fixedSlab" },
    { label: "Percentage", value: "percentage" },
    { label: "Percentage Slab", value: "percentageSlab" },
  ];
  const categoryOption = [
    { label: "Monetory", value: "monetory" },
    { label: "Non-Monetory", value: "nonMonetory" },
  ];
  const applicableOption = [
    { label: "One-Time", value: "oneTime" },
    { label: "Many-Time", value: "manyTime" },
  ];

  const handleAddNewSlab: any = () => {
    setUpdateDialog(false);
    setShowModal(true);
    setNewSlab({ slabName: "", min: "", max: "", value: "" });
    setError("");
    setIsEditing(false);
  };
  const handleEditSlab: any = (index: any) => {
    setShowModal(true);
    setUpdateDialog(false);
    setNewSlab(slabs[index]);
    setError("");
    setIsEditing(true);
    setEditIndex(index);
  };
  const handleInputChangeSlab: any = (e: any) => {
    const { name, value } = e.target;
    setNewSlab((prev) => ({ ...prev, [name]: value }));
  };
  const getProductById: any = (id: any) => {
    const entry: any = prodId?.find(
      (entry: any) => entry.id === id
    );
    return entry ? entry.name : "ID not found";
  };
  const handleSaveSlab: any = () => {
    const lastSlab = slabs[slabs.length - 1];
    const min = parseInt(newSlab.min);
    const max = newSlab.max === "Above" ? "Above" : parseInt(newSlab.max);
    const value = parseInt(newSlab.value);

    // Validation
    if (
      !newSlab.slabName ||
      !newSlab.min ||
      !newSlab.value ||
      (newSlab.max !== "Above" && !newSlab.max)
    ) {
      setError("Please fill all fields.");
      return;
    }
    if (isNaN(min) || isNaN(value) || (max !== "Above" && isNaN(max))) {
      setError("Minimum, Maximum, and value must be numbers.");
      return;
    }
    if (slabs.length > 0 && !isEditing && min <= lastSlab.max) {
      setError(`Minimum value must be greater than ${lastSlab.max}`);
      return;
    }
    if (max !== "Above" && max <= min) {
      setError("Maximum value must be greater than Minimum value.");
      return;
    }

    if (isEditing) {
      // Update existing slab
      const updatedSlabs = [...slabs];
      updatedSlabs[editIndex] = { ...newSlab, min, max, value };
      setSlabs(updatedSlabs);
    } else {
      // Add new slab
      setSlabs([...slabs, { slabName: newSlab.slabName, min, max, value }]);
    }
    setUpdateDialog(true);
    setShowModal(false);
  };

  const handleAddNewPercentage: any = () => {
    setUpdateDialog(false);
    setPercentageModal(true);
    setNewPercentage({ slabName: "", min: "", max: "", value: "" });
    setErrorPercentage("");
    setIsEditing(false);
  };
  const handleEditPercentage: any = (index: any) => {
    setPercentageModal(true);
    setUpdateDialog(false);
    setNewPercentage(percentageData[index]);
    setErrorPercentage("");
    setIsEditing(true);
    setEditIndex(index);
  };
  const handleInputChangePercentage: any = (e: any) => {
    const { name, value } = e.target;
    setNewPercentage((prev) => ({ ...prev, [name]: value }));
  };
  const handleSavePercentage: any = () => {
    const lastSlab = percentageData[percentageData.length - 1];
    const min = parseInt(newPercentage.min);
    const max =
      newPercentage.max === "Above" ? "Above" : parseInt(newPercentage.max);
    const value = parseInt(newPercentage.value);

    // Validation
    if (
      !newPercentage.slabName ||
      !newPercentage.min ||
      !newPercentage.value ||
      (newPercentage.max !== "Above" && !newPercentage.max)
    ) {
      setErrorPercentage("Please fill all fields.");
      return;
    }
    if (isNaN(min) || isNaN(value) || (max !== "Above" && isNaN(max))) {
      setErrorPercentage("Minimum, Maximum, and Percentage must be numbers.");
      return;
    }
    if (percentageData.length > 0 && !isEditing && min <= lastSlab.max) {
      setErrorPercentage(`Minimum value must be greater than ${lastSlab.max}`);
      return;
    }
    if (max !== "Above" && max <= min) {
      setErrorPercentage("Maximum value must be greater than Minimum value.");
      return;
    }

    if (isEditing) {
      // Update existing slab
      const updatedSlabs: any = [...percentageData];
      updatedSlabs[editIndex] = { ...newPercentage, min, max, value };
      setPercentageData(updatedSlabs);
    } else {
      // Add new slab
      setPercentageData([
        ...percentageData,
        { slabName: newPercentage.slabName, min, max, value },
      ]);
    }
    setUpdateDialog(true);
    setPercentageModal(false);
  };
  const CollateralType = [
    {
      label: "Individual",
      type: "radio",
      name: "Individual",
      value: "Individual",
    },
    {
      label: "Business",
      type: "radio",
      name: "Business",
      value: "Business",
    },
  ];
  return (
    <div className="service other-fee-page">
      {loader && <Loader />}
      <div className="mb-3 pb-2 border-bottom">
        <h3 className="mb-0 fw-bold text-dark">Other Fees / Value</h3>
      </div>

      {/* Filters card */}
      <div
        className="bg-white p-3 mb-3"
        style={{
          borderRadius: 2,
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="d-flex flex-wrap align-items-center justify-content-end gap-2 w-100">
          <Button
            style={{ borderRadius: 2, border: "transparent", height: 40, whiteSpace: "nowrap", flexShrink: 0 }}
            className="application-btn"
            onClick={() => {
              setCreateDialog(true);
              setFormValues({});
            }}
          >
            Add Fee
          </Button>
        </div>
      </div>

      {/* Table card */}
      <div
        className="bg-white"
        style={{
          borderRadius: 2,
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          border: "1px solid var(--border)",
          overflow: "hidden",
        }}
      >
        <TableView
          setPage={setPage}
          setPageSize={setPageSize}
          page={page}
          pageSize={pageSize}
          totalRows={totalRows}
          from={from}
          to={to}
          header={Other_List_Header}
          data={mappedData}
          isLoading={skelitonLoading}
        />
      </div>
      <BuisnessModal
        setBusinessForm={setBusinessForm}
        buisnessForm={buisnessForm}
        setCustomerValue={setCustomerValue}
      />
      <Modal
        show={createDialog}
        centered
        size="lg"
        onHide={() => {
          setCreateDialog(false);
        }}
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title className="modal-title"> Other Fee/value</Modal.Title>
        </Modal.Header>
        <Modal.Body className="">
          <div className="px-4 mb-4">
            {/* <Row>
              {CollateralType.map((field: any, index) => (
                <Col md={3} className="mb-3" key={index}>
                  <Form.Group>
                    {field.type === "radio" && (
                      <>
                        <Form.Check
                          className={` d-flex align-items-center gap-1 ${radioInputValue == field.value ? "accent-red" : ""
                            }`}
                          type={field.type}
                          label={field.label}
                          name={field.name}
                          value={field.value}
                          checked={radioInputValue == field.value}
                          onChange={handleInputChange}
                          style={{ fontSize: "14px", fontWeight: "700" }}
                        />
                      </>
                    )}
                  </Form.Group>
                </Col>
              ))}
            </Row> */}
            <Row>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                    Category
                  </Form.Label>
                  <Select
                    value={category}
                    onChange={(e: any) => {
                      setCategory(e);
                    }}
                    style={{ width: "100%" }}
                    placeholder="Select Rate Loan Type"
                  >
                    {categoryOption?.map((option) => (
                      <Select.Option value={option.value}>
                        {option?.label}
                      </Select.Option>
                    ))}
                  </Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.customer}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                    Product Name
                  </Form.Label>
                  <Select
                    value={formValues.productName}
                    onChange={(value, option) => {
                      setFormValues((prevValues: any) => ({
                        ...prevValues,
                        productID: value,
                      }));
                    }}
                    style={{ width: "100%" }}
                    placeholder="Select Product Name"
                  >
                    {category != "monetory" && (
                      <Select.Option value="all">
                        <div
                          onClick={() => {
                            setFormValues((prevValues: any) => ({
                              ...prevValues,
                              productName: "All Products",
                            }));
                          }}
                        >
                          All Products
                        </div>
                      </Select.Option>
                    )}
                    {prodId?.map((option: any) => (
                      <Select.Option value={option?.id}>
                        <div
                          onClick={() => {
                            setFormValues((prevValues: any) => ({
                              ...prevValues,
                              productName: option?.name,
                            }));
                          }}
                        >
                          {option?.name}
                        </div>
                      </Select.Option>
                    ))}
                  </Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.nameInEnglish}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                    Operation Name
                  </Form.Label>
                  <Select
                    value={formValues.operationName}
                    onChange={(value, option) => {
                      setFormValues((prevValues: any) => ({
                        ...prevValues,
                        operationId: value,
                      }));
                    }}
                    style={{ width: "100%" }}
                    placeholder="Select Rate Loan Type"
                  >
                    {categoryData?.map((option: any) => (
                      <Select.Option value={option.id}>
                        <div
                          onClick={() => {
                            setFormValues((prevValues: any) => ({
                              ...prevValues,
                              operationName: option.description,
                            }));
                          }}
                        >
                          {option?.description}
                        </div>
                      </Select.Option>
                    ))}
                  </Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.description}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                    Fee Type
                  </Form.Label>
                  <Select
                    value={selectFeeType}
                    onChange={(e: any) => {
                      setSelectFeeType(e);
                    }}
                    style={{ width: "100%" }}
                    placeholder="Select Fee Type"
                  >
                    {feeTypeOption?.map((option) => (
                      <Select.Option value={option.value}>
                        {option?.label}
                      </Select.Option>
                    ))}
                  </Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.label}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                    Effective Date
                  </Form.Label>
                  <Form.Control
                    name="effectiveDate"
                    type="date"
                    value={formValues.effectiveDate}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                    Expiry Date
                  </Form.Label>
                  <Form.Control
                    name="expiryDate"
                    type="date"
                    value={formValues.expiryDate}
                    onChange={handleInputChange}
                  // isInvalid={!!errors.subUnit}
                  />
                  {/* <Form.Control.Feedback type="invalid">
                    {errors.subUnit}
                  </Form.Control.Feedback> */}
                </Form.Group>
              </Col>
              {selectFeeType == "fixed" && (
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                      Enter Fee Amount
                    </Form.Label>
                    <Form.Control
                      name="amount"
                      type="number"
                      value={formValues.amount}
                      onChange={handleInputChange}
                      placeholder="Enter Fee Amount"
                    // isInvalid={!!errors.company}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.amount}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              )}
              {selectFeeType == "percentage" && (
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                      Enter Fee Percentage
                    </Form.Label>
                    <Form.Control
                      name="percentage"
                      type="text"
                      value={formValues.company}
                      onChange={handleInputChange}
                      isInvalid={!!errors.company}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.company}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              )}
              <Col md={6} className="mt-2 d-flex align-items-center">
                <Form.Group>
                  <Form.Check
                    type="checkbox"
                    id="taxCheckbox"
                    className="d-flex align-items-center gap-2"
                    label="Tax"
                    checked={taxChecked}
                    onChange={(e) => setTaxChecked(e.target.checked)}
                    style={{ fontSize: "14px", fontWeight: "600" }}
                  />
                </Form.Group>
              </Col>

              {taxChecked && (
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                      Tax Amount
                    </Form.Label>
                    <Form.Control
                      type="number"
                      name="taxAmount"
                      value={taxAmount}
                      onChange={(e) => setTaxAmount(e.target.value)} // Update tax amount
                      placeholder="Enter Tax Amount"
                    />
                  </Form.Group>
                </Col>
              )}
              {/* <Col md={4} className="mb-3">
              <Form.Group>
                <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                  Payable Status
                </Form.Label>
                <Select
                  value={formValues?.payableStatus}
                  onChange={(value) =>
                    setFormValues((prevValues: any) => ({
                      ...prevValues,
                      payableStatus: value,
                    }))
                  }
                  style={{ width: "100%" }}
                  placeholder="Select Payable Status"
                >
                  {payableStatusOptions.map((option) => (
                    <Select.Option key={option.value} value={option.value}>
                      {option?.label}
                    </Select.Option>
                  ))}
                </Select>
                <Form.Control.Feedback type="invalid">
                  {errors.payableStatus}
                </Form.Control.Feedback>
              </Form.Group>
            </Col> */}
            </Row>
            <Row>
              {selectFeeType == "fixedSlab" && (
                <>
                  <table>
                    <thead style={{ background: "var(--color-surface-pressed)" }}>
                      <tr
                        style={{
                          color: "var(--foreground)",
                          fontSize: "14px",
                          fontWeight: "600",
                        }}
                      >
                        <th style={{ padding: "15px" }}>Slab Name</th>
                        <th>Minimum</th>
                        <th>Maximum</th>
                        <th>Fixed value</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {slabs.map((slab: any, index: any) => (
                        <tr key={index} style={{ border: "1px solid var(--color-surface-pressed)" }}>
                          <td style={{ padding: "18px" }}>{slab.slabName}</td>
                          <td>{slab.min} SAR</td>
                          <td>{slab.max} SAR</td>
                          <td>{slab.value}</td>
                          <td>
                            <span
                              className="d-flex justify-content-start"
                              onClick={() => handleEditSlab(index)}
                            >
                              <img src={edit} alt="" />
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-4 mb-4 d-flex justify-content-end">
                    <span
                      onClick={handleAddNewSlab}
                      style={{
                        color: "var(--color-danger-action)",
                        fontSize: "16px",
                        fontWeight: "600",
                        textDecoration: "underLine",
                        cursor: "pointer",
                      }}
                    >
                      ADD NEW SLAB
                    </span>
                  </div>
                  <hr />
                </>
              )}

              {selectFeeType == "percentageSlab" && (
                <>
                  <table>
                    <thead style={{ background: "var(--color-surface-pressed)" }}>
                      <tr
                        style={{
                          color: "var(--foreground)",
                          fontSize: "14px",
                          fontWeight: "600",
                        }}
                      >
                        <th style={{ padding: "15px" }}>Slab Name</th>
                        <th>Minimum</th>
                        <th>Maximum</th>
                        <th>Percentage</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {percentageData.map((percentageData: any, index: any) => (
                        <tr key={index} style={{ border: "1px solid var(--color-surface-pressed)" }}>
                          <td style={{ padding: "18px" }}>
                            {percentageData.slabName}
                          </td>
                          <td>{percentageData.min} SAR</td>
                          <td>{percentageData.max} SAR</td>
                          <td>{percentageData.value} %</td>
                          <td>
                            <span
                              className="d-flex justify-content-start"
                              onClick={() => handleEditPercentage(index)}
                            >
                              <img src={edit} alt="" />
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-4 mb-4 d-flex justify-content-end">
                    <span
                      onClick={handleAddNewPercentage}
                      style={{
                        color: "var(--color-danger-action)",
                        fontSize: "16px",
                        fontWeight: "600",
                        textDecoration: "underLine",
                        cursor: "pointer",
                      }}
                    >
                      ADD NEW SLAB
                    </span>
                  </div>
                  <hr />
                </>
              )}
            </Row>
            <div className="d-flex justify-content-end">
              {" "}
              <Button
                className="application-btn mt-2"
                onClick={() => {
                  addFee();
                }}
              /* style={{
    backgroundColor: "#EB0D0D",
    borderRadius: "2px",
    height: "fit-content",
    width: "fit-content",
    color: "#FCFCFC"
  }} */
              >
                Save
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
      <Modal
        show={updateDialog}
        centered
        size="lg"
        onHide={() => {
          setUpdateDialog(false);
        }}
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title className="modal-title">
            {" "}
            Edit Other Fee/value
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="">
          <div className="px-4 mt-2 mb-4">
            <Row>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                    Category
                  </Form.Label>
                  <Select
                    value={category}
                    onChange={(e: any) => {
                      setCategory(e);
                    }}
                    style={{ width: "100%" }}
                    placeholder="Select Rate Loan Type"
                  >
                    {categoryOption?.map((option) => (
                      <Select.Option value={option.value}>
                        {option?.label}
                      </Select.Option>
                    ))}
                  </Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.customer}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                    Product Name
                  </Form.Label>
                  <Select
                    value={
                      formValues.productName
                        ? formValues.productName
                        : getBussinessCategoryById(initialProductId)
                    }
                    onChange={(value, option) => {
                      setFormValues((prevValues: any) => ({
                        ...prevValues,
                        productID: value,
                      }));
                    }}
                    style={{ width: "100%" }}
                    placeholder="Select Rate Loan Type"
                  >
                    {category != "monetory" && (
                      <Select.Option value="all">
                        <div
                          onClick={() => {
                            setFormValues((prevValues: any) => ({
                              ...prevValues,
                              productName: "All Products",
                            }));
                          }}
                        >
                          All Products
                        </div>
                      </Select.Option>
                    )}
                    {prodId?.map((option: any) => (
                      <Select.Option value={option.productId}>
                        <div
                          onClick={() => {
                            setFormValues((prevValues: any) => ({
                              ...prevValues,
                              productName: option.nameInEnglish,
                            }));
                          }}
                        >
                          {option?.nameInEnglish}
                        </div>
                      </Select.Option>
                    ))}
                  </Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.nameInEnglish}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                    Operation Name
                  </Form.Label>
                  <Select
                    value={formValues.operationName}
                    onChange={(value, option) => {
                      setFormValues((prevValues: any) => ({
                        ...prevValues,
                        operationId: value,
                      }));
                    }}
                    style={{ width: "100%" }}
                    placeholder="Select Rate Loan Type"
                  >
                    {categoryData?.map((option: any) => (
                      <Select.Option value={option.id}>
                        <div
                          onClick={() => {
                            setFormValues((prevValues: any) => ({
                              ...prevValues,
                              operationName: option.description,
                            }));
                          }}
                        >
                          {option?.description}
                        </div>
                      </Select.Option>
                    ))}
                  </Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.description}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                    Fee Type
                  </Form.Label>
                  <Select
                    value={selectFeeType}
                    onChange={(e: any) => {
                      setSelectFeeType(e);
                    }}
                    style={{ width: "100%" }}
                    placeholder="Select Fee Type"
                  >
                    {feeTypeOption?.map((option) => (
                      <Select.Option value={option.value}>
                        {option?.label}
                      </Select.Option>
                    ))}
                  </Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.label}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              {/* <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                    Applicable
                  </Form.Label>
                  <Select
                    value={selectApplicable}
                    onChange={(e: any) => {
                      setSelectApplicable(e);
                    }}
                    style={{ width: "100%" }}
                    placeholder="Select Rate Loan Type"
                  >
                    {applicableOption?.map((option) => (
                      <Select.Option value={option.value}>
                        {option?.label}
                      </Select.Option>
                    ))}
                  </Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.customer}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col> */}

              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                    Effective Date
                  </Form.Label>
                  <Form.Control
                    name="effectiveDate"
                    type="date"
                    value={formValues.effectiveDate}
                    onChange={handleInputChange}
                  // isInvalid={!!errors.subUnit}
                  />
                  {/* <Form.Control.Feedback type="invalid">
                    {errors.subUnit}
                  </Form.Control.Feedback> */}
                </Form.Group>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                    Expiry Date
                  </Form.Label>
                  <Form.Control
                    name="expiryDate"
                    type="date"
                    value={formValues.expiryDate}
                    onChange={handleInputChange}
                  // isInvalid={!!errors.subUnit}
                  />
                  {/* <Form.Control.Feedback type="invalid">
                    {errors.subUnit}
                  </Form.Control.Feedback> */}
                </Form.Group>
              </Col>
              {selectFeeType == "fixed" && (
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                      Enter Fee Amount
                    </Form.Label>
                    <Form.Control
                      name="amount"
                      type="number"
                      value={formValues.amount}
                      onChange={handleInputChange}
                    // isInvalid={!!errors.company}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.amount}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              )}
              {selectFeeType == "percentage" && (
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                      Enter Fee Percentage
                    </Form.Label>
                    <Form.Control
                      name="percentage"
                      type="text"
                      value={formValues.company}
                      onChange={handleInputChange}
                      isInvalid={!!errors.company}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.company}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              )}
              <Col md={6} className="mt-2 d-flex align-items-center">
                <Form.Group>
                  <Form.Check
                    type="checkbox"
                    id="taxCheckbox"
                    className="d-flex align-items-center gap-2"
                    label="Tax"
                    checked={formValues.taxChecked}
                    onChange={(e) =>
                      setFormValues((prevValues: any) => ({
                        ...prevValues,
                        taxChecked: e.target.checked,
                      }))
                    }
                    style={{ fontSize: "14px", fontWeight: "600" }}
                  />
                </Form.Group>
              </Col>

              {formValues.taxChecked && (
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                      Tax Amount
                    </Form.Label>
                    <Form.Control
                      type="number"
                      name="taxAmount"
                      value={formValues.taxAmount}
                      onChange={handleInputChange} // Update tax amount
                      placeholder="Enter Tax Amount"
                    />
                  </Form.Group>
                </Col>
              )}
              {/* <Col md={4} className="mb-3">
              <Form.Group>
                <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                  Payable Status
                </Form.Label>
                <Select
                  value={formValues?.payableStatus}
                  onChange={(value) =>
                    setFormValues((prevValues: any) => ({
                      ...prevValues,
                      payableStatus: value,
                    }))
                  }
                  style={{ width: "100%" }}
                  placeholder="Select Payable Status"
                >
                  {payableStatusOptions.map((option) => (
                    <Select.Option key={option.value} value={option.value}>
                      {option?.label}
                    </Select.Option>
                  ))}
                </Select>
                <Form.Control.Feedback type="invalid">
                  {errors.payableStatus}
                </Form.Control.Feedback>
              </Form.Group>
            </Col> */}
            </Row>
            <hr />
            <Row>
              {selectFeeType == "fixedSlab" && (
                <>
                  <table>
                    <thead style={{ background: "var(--color-surface-pressed)" }}>
                      <tr
                        style={{
                          color: "var(--foreground)",
                          fontSize: "14px",
                          fontWeight: "600",
                        }}
                      >
                        <th style={{ padding: "15px" }}>Slab Name</th>
                        <th>Minimum</th>
                        <th>Maximum</th>
                        <th>Fixed value</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {slabs.map((slab: any, index: any) => (
                        <tr key={index} style={{ border: "1px solid var(--color-surface-pressed)" }}>
                          <td style={{ padding: "18px" }}>{slab.slabName}</td>
                          <td>{slab.min} SAR</td>
                          <td>{slab.max} SAR</td>
                          <td>{slab.value}</td>
                          <td>
                            <span
                              className="d-flex justify-content-start"
                              onClick={() => handleEditSlab(index)}
                            >
                              <img src={edit} alt="" />
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-4 mb-4 d-flex justify-content-end">
                    <span
                      onClick={handleAddNewSlab}
                      style={{
                        color: "var(--color-danger-action)",
                        fontSize: "16px",
                        fontWeight: "600",
                        textDecoration: "underLine",
                        cursor: "pointer",
                      }}
                    >
                      ADD NEW SLAB
                    </span>
                  </div>
                  <hr />
                </>
              )}

              {selectFeeType == "percentageSlab" && (
                <>
                  <table>
                    <thead style={{ background: "var(--color-surface-pressed)" }}>
                      <tr
                        style={{
                          color: "var(--foreground)",
                          fontSize: "14px",
                          fontWeight: "600",
                        }}
                      >
                        <th style={{ padding: "15px" }}>Slab Name</th>
                        <th>Minimum</th>
                        <th>Maximum</th>
                        <th>Percentage</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {percentageData.map((percentageData: any, index: any) => (
                        <tr key={index} style={{ border: "1px solid var(--color-surface-pressed)" }}>
                          <td style={{ padding: "18px" }}>
                            {percentageData.slabName}
                          </td>
                          <td>{percentageData.min} SAR</td>
                          <td>{percentageData.max} SAR</td>
                          <td>{percentageData.value} %</td>
                          <td>
                            <span
                              className="d-flex justify-content-start"
                              onClick={() => handleEditPercentage(index)}
                            >
                              <img src={edit} alt="" />
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-4 mb-4 d-flex justify-content-end">
                    <span
                      onClick={handleAddNewPercentage}
                      style={{
                        color: "var(--color-danger-action)",
                        fontSize: "16px",
                        fontWeight: "600",
                        textDecoration: "underLine",
                        cursor: "pointer",
                      }}
                    >
                      ADD NEW SLAB
                    </span>
                  </div>
                  <hr />
                </>
              )}
            </Row>

            <div className="d-flex justify-content-end">
              {" "}
              <Button
                className="application-btn mb-2"
                onClick={() => {
                  ApproveAmount();
                }}
              /* style={{
    backgroundColor: "#EB0D0D",
    borderRadius: "2px",
    height: "fit-content",
    width: "fit-content",
    color: "#FCFCFC"
  }} */
              >
                Save
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
      <Modal
        show={showModal}
        centered
        size="lg"
        onHide={() => {
          setShowModal(false);
        }}
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title className="modal-title">Add New Slab</Modal.Title>
        </Modal.Header>
        <Modal.Body className="">
          <div className="px-4 mt-2 mb-4">
            {error && <p style={{ color: "red" }}>{error}</p>}
            <Row>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                    Slab Name:
                  </Form.Label>
                  <Form.Control
                    name="slabName"
                    type="text"
                    value={newSlab.slabName}
                    onChange={handleInputChangeSlab}
                  />
                </Form.Group>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                    Minimum:
                  </Form.Label>
                  <Form.Control
                    name="min"
                    type="number"
                    value={newSlab.min}
                    onChange={handleInputChangeSlab}
                  />
                </Form.Group>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                    Maximum:
                  </Form.Label>
                  <Form.Control
                    name="max"
                    type="number"
                    value={newSlab.max}
                    onChange={handleInputChangeSlab}
                  />
                </Form.Group>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                    Fixed value:
                  </Form.Label>
                  <Form.Control
                    name="value"
                    type="number"
                    value={newSlab.value}
                    onChange={handleInputChangeSlab}
                  />
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-end">
              {" "}
              <button
                className="btn btn-danger mb-4"
                onClick={() => {
                  handleSaveSlab();
                }}
                style={{
                  backgroundColor: "var(--color-danger-action)",
                  borderRadius: "2px",
                  height: "fit-content",
                  width: "fit-content",
                }}
              >
                Save
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
      <Modal
        show={percentageModal}
        centered
        size="lg"
        onHide={() => {
          setPercentageModal(false);
        }}
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title className="modal-title">
            Add New Percentage Slab
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="">
          <div className="px-4 mt-2 mb-4">
            {errorPercentage && (
              <p style={{ color: "red" }}>{errorPercentage}</p>
            )}
            <Row>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                    Slab Name:
                  </Form.Label>
                  <Form.Control
                    name="slabName"
                    type="text"
                    value={newPercentage.slabName}
                    onChange={handleInputChangePercentage}
                  />
                </Form.Group>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                    Minimum:
                  </Form.Label>
                  <Form.Control
                    name="min"
                    type="number"
                    value={newPercentage.min}
                    onChange={handleInputChangePercentage}
                  />
                </Form.Group>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                    Maximum:
                  </Form.Label>
                  <Form.Control
                    name="max"
                    type="number"
                    value={newPercentage.max}
                    onChange={handleInputChangePercentage}
                  />
                </Form.Group>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                    Percentage:
                  </Form.Label>
                  <Form.Control
                    name="value"
                    type="number"
                    value={newPercentage.value}
                    onChange={handleInputChangePercentage}
                  />
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-end">
              {" "}
              <button
                className="application-btn mt-2"
                onClick={() => {
                  handleSavePercentage();
                }}
                style={{
                  //backgroundColor: "#EB0D0D",
                  borderRadius: "2px",
                  height: "fit-content",
                  width: "fit-content",
                  padding: "8px",
                  border: "none",
                }}
              >
                Save
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default OtherFee;
