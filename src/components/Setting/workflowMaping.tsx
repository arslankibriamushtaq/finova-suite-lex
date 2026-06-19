import React, { useState, useCallback, useEffect } from "react";
import { Input, Button, Dropdown, Menu, Select } from "antd";

import { FaSearch, FaSortAmountUp } from "react-icons/fa";
import TableView from "../TableView/TableView";
import BuisnessModal from "../Customers/Modals/BuisnessModal";
import { useNavigate } from "react-router-dom";
import Switch from "react-switch";
import {
  DeleteColumnOutlined,
  DownOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {
  addFeeWorkFlowApi,
  deleteWorkFlowInfo,
  getAllCategoryType,
  getAllWorkFlow,
  getWorkFlowInfo,
  updateFWorkFlow,
} from "../../redux/apis/apisCrudLms";
import toast from "react-hot-toast";
import Loader from "../Loader/Loader";
import { Col, Form, Modal, Row } from "react-bootstrap";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/rootReducer";
const WorkFlowMapping = () => {
  const [editRowId, setEditRowId] = useState(null);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [to, setTo] = useState(0);
  const [from, setFrom] = useState(0)
  const [loader, setLoader] = useState(false);
  const [disberseDialog, setDisberseDialog] = useState(false);
  const [updateDialog, setUpdateDialog] = useState(false);
  const [createDialog, setCreateDialog] = useState(false);
  const [applicationData, setApplicationData] = useState<any>();
  const [category, setCategory] = useState<any>();
  const [workFlowName, setWorkFlowName] = useState<any>("");

  // const [prodId, setProdId] = useState<any>();
  const [workFlowId, setWorkFlowId] = useState<any>();
  const [categoryData, setCategoryData] = useState<any>();
  // const [errors, setErrors] = useState<any>({});
  const [error, setError] = useState("");
  const [errorPercentage, setErrorPercentage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const prodId = useSelector((state: RootState) => state.block.prodId);
  const [errors, setErrors] = useState({
    productName: "",
    customer: "",
    description: "",
    workFlowName: "",
  });

  const [initialProductId, setInitialProductId] = useState<any[]>();
  const [initialWorkFlowId, setInitialWorkFlowId] = useState<any[]>();
  const [formValues, setFormValues] = useState<any>({
    category: "",
    productID: "",
    productName: "",
    workFlowId: "",
    workFlowName: "",
    operationId: "",
    expiryDate: "",
    effectiveDate: "",
    loanAmount: 0,
    operationType: 0,
    amount: 0,
    id: "",
    operationName: "",
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
  const validateForm: any = () => {
    let newErrors: any = {};
    if (!formValues.productName) {
      newErrors.productName = "Product Name is required.";
    }
    if (!category) {
      newErrors.customer = "Transaction Type is required.";
    }
    if (!formValues.operationName) {
      newErrors.description = "Operation Name is required.";
    }
    if (!formValues.workFlowName) {
      newErrors.workFlowName = "Work Flow Name is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };
  const getWorkFlowId: any = async () => {
    try {
      const response = await fetch(
        "https://finovawork.xintdev.com/api/Tenant/definitions"
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json(); // Parse JSON from the response
      setWorkFlowId(data);
      // const workflowData = data.data;
      // setProdId(workflowData);
    } catch (error) {
      console.error("Error fetching workflow:", error.message);
      toast.error(error.message);
    }
  };
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
    getWorkFlowId();
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
    const entry: any = prodId?.find((entry: any) => entry?.id === id);
    return entry ? entry.nameInEnglish : "ID not found";
  };
  const getWorkFlowById: any = (id: any) => {
    const entry: any = workFlowId?.find(
      (entry: any) => entry.definitionId == id
    );
    return entry ? entry.name : "ID not found";
  };
  const getProductById: any = (id: any) => {
    const entry: any = prodId?.find((entry: any) => entry?.id === id);
    return entry ? entry.name : "ID not found";
  };
  const getInfo: any = async (id: any) => {
    try {
      const response = await getWorkFlowInfo(id);
      if (response) {
        const data = response?.data?.data;
        setFormValues({
          id: id,
          productName: data?.productName,
          productID: data?.productId,
          category: data?.transactionCategory,
          operationName: data?.operationName,
          operationId: data?.operationId,
          workFlowName: data?.workFlowName,
        });
        setInitialProductId(data?.productId);
        setInitialWorkFlowId(data?.workFlowId);
        setCategory(
          data?.transactionCategory == 1 ? "monetory" : "nonmonetory"
        );
        setUpdateDialog(true);
        setWorkFlowName(data?.workFlowName);
      }
    } catch (error: any) {
      toast.error(error?.message);
    } finally {
      setLoader(false);
    }
  };
  const deleteInfo: any = async (id: any) => {
    try {
      const response = await deleteWorkFlowInfo(id);
      if (response?.data.notificationMessage == "Operation successful.") {
        toast.success(response?.data.notificationMessage);
        ledgerAcoount();
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
    } else if (key == "delete") {
      deleteInfo(row?.id);
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
      const response = await getAllWorkFlow(page, pageSize);
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
      setSkelitonLoading(false);
      toast.error(error?.message);
      // Reset pagination values on error
      setTotalRows(0);
      setFrom(0);
      setTo(0);
    } finally {
      setSkelitonLoading(false);

      setLoader(false);
    }
  };
  const ApproveAmount: any = async () => {
    setLoader(true);
    const body = {
      id: formValues.id,
      operationName: formValues.operationName,
      operationId: formValues.operationId,
      productID:
        formValues.productName == "All Products" ? 0 : formValues.productID,
      productName:
        formValues.productName == "All Products"
          ? "All Products"
          : getProductById(formValues.productID),
      transactionCategory: category == "monetory" ? 1 : 0,
      workFlowName: formValues.workFlowName
        ? formValues.workFlowName
        : workFlowName,
      operationType: formValues.operationType,
      isSpecificProduct:
        formValues.productName == "All Products" ? false : true,
      workFlowId: formValues.workFlowId
        ? formValues.workFlowId
        : initialWorkFlowId,
    };
    try {
      const response = await updateFWorkFlow(body);
      if (response.data.notificationMessage == "Operation successful.") {
        toast.success(response.data.notificationMessage);
        setLoader(false);
        setUpdateDialog(false);
        ledgerAcoount();
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
  const addWorkFlow: any = async () => {
    if (validateForm()) {
      setLoader(true);
      const body = {
        operationName: formValues.operationName ? formValues.operationName : "",
        operationId: formValues.operationId ? formValues.operationId : "",
        productID:
          formValues.productName == "All Products" ? 0 : formValues.productID,
        productName:
          formValues.productName == "All Products"
            ? "All Products"
            : getProductById(formValues.productID),
        transactionCategory: category == "monetory" ? 1 : 0,
        workFlowName: formValues.workFlowName ? formValues.workFlowName : "",
        operationType: formValues.operationType,
        workFlowId: formValues.workFlowId ? formValues.workFlowId : "",
        isSpecificProduct:
          formValues.productName == "All Products" ? false : true,
      };
      try {
        const response = await addFeeWorkFlowApi(body);
        if (response.data.notificationMessage == "Operation successful.") {
          toast.success(response.data.notificationMessage);
          setLoader(false);
          ledgerAcoount();
          setCreateDialog(false);
          setShowModal(false);
        } else {
          toast.error(
            response?.data?.data?.notificationMessage ||
              response?.data?.notificationMessage ||
              response.data.errors[0]
          );
          setDisberseDialog(false);
          setCreateDialog(false);
          setLoader(false);
        }
      } catch (error: any) {
        setLoader(false);
        toast.error(error?.message);
      }
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

      <Menu.Item key="delete" icon={<DeleteColumnOutlined />}>
        Delete
      </Menu.Item>
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
      name: "Operation Name",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="Customer ID"
            value={formValues.DocumentSubType}
            onChange={handleInputChange}
          />
        ) : (
          row.operationName
        ),
      width: "300px",
    },

    {
      name: "Transaction Type",
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
      name: "Work Flow Name",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="AccountNo"
            value={formValues.AccountNo}
            onChange={handleInputChange}
          />
        ) : (
          row.workFlowName
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
        productId: getBussinessCategoryById(item?.productId),
        productName: item?.productName,
        operationName: item?.operationName || "-",
        workFlowName: item?.workFlowName,
        id: item.id,
        transactionCategory:
          item?.transactionCategory == 1 ? "Monetory" : "Non Monetory",
      };
    });
  const validateFields: any = () => {
    const newErrors: any = {};
    Object.keys(formValues).forEach((key) => {

      if (!formValues[key] && typeof formValues[key] !== "boolean") {
        newErrors[key] = "This field is required";
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
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
  const isVariableRateLoanOptions = [
    { label: "True", value: true },
    { label: "False", value: false },
  ];
  const tenureTypeOptions = [
    { label: "Monthly", value: 2 },
    { label: "Yearly", value: 1 },
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
    <div>
      {loader && <Loader />}
      <div className="col-12 d-flex  align-items-center mt-3">
        <div
          className="d-flex align-items-center col-6 justify-content-between mt-1"
          style={{ fontSize: "15px", fontWeight: "Bold" }}
        >
          Work Flow Mapping
        </div>
        <div className="col-6 d-flex justify-content-end">
          <Button
            style={{
              borderRadius: "2px",
              border: "transparent",
            }}
            className="application-btn"
            onClick={() => {
              setCreateDialog(true);
              setFormValues({});
              //   navigate("/account/LoanManagement/Application");
            }}
          >
            Add New
          </Button>
        </div>
      </div>
      <div className="cs-table p-2">
        <TableView
          setPage={setPage}
          setPageSize={setPageSize}
          page={page}
          pageSize={pageSize}
          to={to}
          from={from}
          totalRows={totalRows}
          header={Other_List_Header}
          data={mappedData}
          isLoading={skelitonLoading}
        />
        {/* {applicationData?.length == 0 && (
          <div
            className="d-flex justify-content-center mt-5"
            style={{ color: "red" }}
          >
            No data found
          </div>
        )} */}
      </div>

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
          <Modal.Title className="modal-title">
            Add New Work Flow Mapping
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="">
          <div className="px-4 mb-4">
            <Row>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                    Transaction Type<span className="text-danger">*</span>
                  </Form.Label>
                  <Select
                    value={category}
                    onChange={(e: any) => {
                      setCategory(e);
                    }}
                    style={{ width: "100%" }}
                    placeholder="Select Rate Loan Type"
                  >
                    {categoryOption?.map((option, index) => (
                      <Select.Option key={index} value={option.value}>
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
                    Product Name<span className="text-danger">*</span>
                  </Form.Label>
                  <Select
                    value={formValues.productName}
                    onChange={(value, option) => {
                      setFormValues((prevValues) => ({
                        ...prevValues,
                        productID: value,
                      }));
                    }}
                    style={{ width: "100%" }}
                    placeholder="Select Product Name"
                  >
                    {/* Add fixed option */}
                    {category != "monetory" && (
                      <Select.Option value="all">
                        <div
                          onClick={() => {
                            setFormValues((prevValues) => ({
                              ...prevValues,
                              productName: "All Products",
                            }));
                          }}
                        >
                          All Products
                        </div>
                      </Select.Option>
                    )}

                    {/* Dynamically generate options */}
                    {prodId?.map((option) => (
                      <Select.Option key={option?.id} value={option?.id}>
                        <div
                          onClick={() => {
                            setFormValues((prevValues) => ({
                              ...prevValues,
                              productName: option.name,
                            }));
                          }}
                        >
                          {option?.name}
                        </div>
                      </Select.Option>
                    ))}
                  </Select>

                  <Form.Control.Feedback type="invalid">
                    {errors.productName}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                    Operation Name<span className="text-danger">*</span>
                  </Form.Label>
                  <Select
                    value={formValues.operationName}
                    onChange={(value, option) => {
                      setFormValues((prevValues) => ({
                        ...prevValues,
                        operationId: value,
                      }));
                    }}
                    style={{ width: "100%" }}
                    placeholder="Select Rate Loan Type"
                  >
                    {categoryData?.map((option) => (
                      <Select.Option value={option.id}>
                        <div
                          onClick={() => {
                            setFormValues((prevValues) => ({
                              ...prevValues,
                              operationName: option.description,
                              operationType: option.operationType,
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
                    Work Flow Name<span className="text-danger">*</span>
                  </Form.Label>
                  <Select
                    value={formValues.workFlowName}
                    onChange={(value, option) => {
                      setFormValues((prevValues) => ({
                        ...prevValues,
                        workFlowId: value,
                      }));
                    }}
                    style={{ width: "100%" }}
                    placeholder="Select Work Flow Type"
                    aria-required
                  >
                    {workFlowId?.map((option) => (
                      <Select.Option value={option.definitionId}>
                        <div
                          onClick={() => {
                            setFormValues((prevValues) => ({
                              ...prevValues,
                              workFlowName: option.name,
                            }));
                          }}
                        >
                          {option?.displayName}
                        </div>
                      </Select.Option>
                    ))}
                  </Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.workFlowName}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end">
              {" "}
              <Button
                className="application-btn mt-2"
                onClick={() => {
                  addWorkFlow();
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
            Update Work Flow Mapping
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="">
          <div className="px-4 mt-2 mb-4">
            <Row>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                    Transaction Type<span className="text-danger">*</span>
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
                    Product Name<span className="text-danger">*</span>
                  </Form.Label>
                  <Select
                    value={
                      formValues.productName
                        ? formValues.productName
                        : getBussinessCategoryById(initialProductId)
                    }
                    onChange={(value, option) => {
                      setFormValues((prevValues) => ({
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
                            setFormValues((prevValues) => ({
                              ...prevValues,
                              productName: "All Products",
                            }));
                          }}
                        >
                          All Products
                        </div>
                      </Select.Option>
                    )}
                    {prodId?.map((option) => (
                      <Select.Option value={option.productId}>
                        <div
                          onClick={() => {
                            setFormValues((prevValues) => ({
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
                    {errors.productName}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label style={{ fontSize: "13px", fontWeight: "600" }}>
                    Operation Name<span className="text-danger">*</span>
                  </Form.Label>
                  <Select
                    value={formValues.operationName}
                    onChange={(value, option) => {
                      setFormValues((prevValues) => ({
                        ...prevValues,
                        operationId: value,
                      }));
                    }}
                    style={{ width: "100%" }}
                    placeholder="Select Rate Loan Type"
                  >
                    {categoryData?.map((option) => (
                      <Select.Option value={option.id}>
                        <div
                          onClick={() => {
                            setFormValues((prevValues) => ({
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
                    Work Flow Name<span className="text-danger">*</span>
                  </Form.Label>
                  <Select
                    value={
                      formValues.workFlowName
                        ? formValues.workFlowName
                        : getWorkFlowById(initialWorkFlowId)
                    }
                    onChange={(value, option) => {
                      setFormValues((prevValues) => ({
                        ...prevValues,
                        workFlowId: value,
                      }));
                    }}
                    style={{ width: "100%" }}
                    placeholder="Select Work Flow Type"
                  >
                    {workFlowId?.map((option) => (
                      <Select.Option value={option.definitionId}>
                        <div
                          onClick={() => {
                            setFormValues((prevValues) => ({
                              ...prevValues,
                              workFlowName: option.name,
                            }));
                          }}
                        >
                          {option?.displayName}
                        </div>
                      </Select.Option>
                    ))}
                  </Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.workFlowName}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
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
    </div>
  );
};

export default WorkFlowMapping;
