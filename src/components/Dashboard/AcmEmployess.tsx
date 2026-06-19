import { useSelector } from "react-redux";
import { RootState } from "../../redux/rootReducer";
import TableView from "../TableView/TableView";
import { Types_Reasons_Header } from "../Config/TableHeaders";
import { Dropdown, Modal } from "react-bootstrap";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { DatePicker, Select, Switch } from "antd";
import { useEffect, useMemo, useState } from "react";
import { Images } from "../Config/Images";
import moment from "moment";
import * as Yup from "yup";
import {
  createEmployee,
  deleteEmployee,
  editEmployee,
  employeeEmailSend,
  getAllEmployee,
  getAllEmployeeRole,
  getDepartments,
  getSpecificEmployee,
} from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";
import styled from "styled-components";
import { useLocation } from "react-router-dom";
import Loader from "../Loader/Loader";

const AcmEmployess = () => {
  const checkReduxState = useSelector((state: RootState) => state.block.check);
  const [addDialog, setAddDialog] = useState(false);
  const [updateDialog, setUpdateDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [dob, setDob] = useState<any>("");
  const [allEmployee, setAllEmployee] = useState<any>("");
  const [categoryData, setCategoryData] = useState<any>("");
  const [departmentDataAssign, setDepartmentDataAssign] = useState<any>("");
  const [rowData, setRowData] = useState<any>("");
  const [rowEditData, setRowEditData] = useState<any>("");
  const [departmentId, setDepartmentId] = useState<any>("");
  const [roleName, setRoleName] = useState<any>("");
  const [searchValue, setSearchValue] = useState("");
  const [roleId, setRoleId] = useState<any>("");
  const [status, setStatus] = useState<any>("");
  const [twoStep, setTwoStep] = useState<any>("");
  const { Option } = Select;
  const [loader, setLoader] = useState(false);

  const location = useLocation();
  const tenantId = localStorage.getItem("tenantId");
  // const searchParams = new URLSearchParams(location.search);
  // const accessToken = searchParams.get("accessToken");
  let token = window.location.pathname;
  if (token.startsWith("/")) {
    token = token.substring(1);
    localStorage.setItem("token", token);
  }

  const handleChnage = (item: any, row: any) => {

    if (item.label == "Edit") {
      fetchSpecificEmployee(row.id);
    } else if (item.label == "Delete") {
      setDeleteDialog(true);
      setRowData(row);
    } else if (item.label == "Send Login Email") {
      sendEmailLink(row.email);
    }
  };

  const sendEmailLink = async (email: any) => {
    try {
      const response: any = await employeeEmailSend(email);
      if (response?.data?.notificationMessage) {
        if (
          response?.data?.notificationMessage ==
          "The operation failed to complete."
        ) {
          toast.error(response?.data?.notificationMessage);
        } else {
          toast.success(response?.data?.notificationMessage);
        }
      } else if (response?.data?.data[0]?.errorMessage) {
        toast.error(response?.data[0]?.errorMessage);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  const fetchPoolCards = async () => {
    setLoader(true);
    try {
      const response: any = await getAllEmployee();

      if (response?.data?.success) {
        setLoader(false);
        setAllEmployee(response?.data?.data);
      } else{
         toast.error(response?.data?.errors[0] || response?.data?.notificationMessage);
      }
    } catch (error: any) {
      toast.error(error?.message);
      setLoader(false);
      setLoader(false);
    }
  };
  const onSearchHandle = (e: any) => {
    setSearchValue(e.target.value);
    setAllEmployee(filteredClients);
    // setClientList(filteredClients)
  };
  const filteredClients = useMemo(() => {
    return (
      allEmployee &&
      allEmployee.filter(
        (client: any) =>
          client.userName &&
          client.userName.toLowerCase().includes(searchValue.toLowerCase())
      )
    );
  }, [allEmployee, searchValue]);
  const fetchDepartments = async () => {
    setLoader(true);
    try {
      const response: any = await getDepartments();
      if (response?.data?.success) {
        setDepartmentDataAssign(response?.data?.data);
        setLoader(false);
      } else {
        toast.error(response?.data?.errors[0] || response?.data?.notificationMessage);
        setLoader(false);
      }
    } catch (error: any) {
      toast.error(error?.message);
      setLoader(false);
    }
  };
  const fetchSpecificEmployee = async (id: any) => {
    try {
      const response: any = await getSpecificEmployee(id);

      if (response?.data?.success) {
        setRowEditData(response?.data?.data);

        setUpdateDialog(true);

        setStatus(response?.data?.data?.status);
      } else {
        toast.error(response?.data?.errors[0] || response?.data?.notificationMessage);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };

  const deleteRow = async (id: any) => {
    try {
      const response = await deleteEmployee(id);
      if (response?.data?.notificationMessage) {
        setDeleteDialog(false);
        fetchPoolCards();
        toast.success(response?.data?.notificationMessage);
      } else if (response?.data?.data[0]?.errorMessage) {
        toast.error(response?.data[0]?.errorMessage);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  const fetchPoolCardsRole = async () => {
    setLoader(true);
    try {
      const response: any = await getAllEmployeeRole();
      if (response?.data?.success) {
        setLoader(false);
        setCategoryData(response?.data?.data);
      } else {
      toast.error(response?.data?.errors[0] || response?.data?.notificationMessage);
        setLoader(false);
      }
    } catch (error: any) {
      toast.error(error?.message);
      setLoader(false);
    }
  };
  useEffect(() => {
    {
      searchValue == "" && fetchPoolCards();
    }
  }, [searchValue]);
  useEffect(() => {
    fetchPoolCardsRole();
    fetchDepartments();
  }, []);
  const actionSelect = [
    { label: "Send Login Email", img: Images.mail },
    { label: "Edit", img: Images.edit },
    { label: "Delete", img: Images.deleteLogo },
  ];
  const Departments_Header = [
    {
      name: "User Name",
      selector: (row: { userName: any }) => row.userName,
    },
    {
      name: "Email",
      selector: (row: { email: any }) => row.email,
    },
    {
      name: "Department",
      selector: (row: { department: any }) => row.department,
    },
    {
      name: "Employee Role",
      selector: (row: { role: any }) => row.role,
    },
    {
      name: "Status",
      selector: (row: { status: any }) => row.status,
      cell: (row: any) => (
        <div
          style={{
            padding: "0.22rem 1rem",
            borderRadius: "6px",
            backgroundColor: row.status
              ? "rgba(146, 188, 131, 1)"
              : "rgba(55, 52, 53, 1)",

            color: "rgba(255, 255, 255, 1)",
            cursor: row.status === "Active" ? "pointer" : "default",
          }}
        >
          {row.status ? "Active" : "InActive"}
        </div>
      ),
    },

    {
      name: "Action",
      selector: (row: { Action: any }) => row.Action,
      cell: (row: any) => (
        <Dropdown>
          <Dropdown.Toggle variant="success" id="dropdown-basic">
            Select
          </Dropdown.Toggle>

          <Dropdown.Menu>
            {actionSelect.map((item, index) => (
              <Dropdown.Item>
                <>
                  <div
                    className="d-flex"
                    onClick={() => {
                      handleChnage(item, row);
                    }}
                  >
                    {/* <div className="col-2">
                      <img src={item.img} alt="" />
                    </div> */}

                    {item.label}
                  </div>
                </>
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      ),
    },
  ];
  const addHandleSubmitButton = async (formField: any) => {
    formField.dob = formatDateTime(dob);
    formField.roleId = roleId;
    formField.departmentId = departmentId;
    formField.status = status;
    formField.twoStepVerification = twoStep;

    try {
      let response: any = await createEmployee(formField);

      if (response?.data?.success) {
        toast.success(response?.data?.notificationMessage);
        setAddDialog(false);
        fetchPoolCards();
      } else  {
        toast.error(response?.data?.notificationMessage);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  const updateHandleSubmitButton = async (formField: any) => {
    formField.id = rowEditData.id;
    formField.dob = formatDateTime(dob);
    formField.roleId = roleId;
    formField.departmentId = departmentId;
    formField.status = status ? status : false;
    try {
      let response: any = await editEmployee(formField);
      if (response?.data?.notificationMessage) {
        toast.success(response?.data?.notificationMessage);
        setUpdateDialog(false);
        fetchPoolCards();
      } else if (response?.data?.data[0]?.errorMessage) {
        toast.error(response?.data[0]?.errorMessage);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  const mappedData =
    allEmployee &&
    allEmployee?.map((item: any) => {
      return {
        userName: item?.userName ? item?.userName : "-",
        email: item?.email ? item?.email : "-",
        role: item?.employeeRole,
        status: item?.status,
        department: item?.department ? item?.department : "-",
        id: item?.id,
        phone: item?.phone,
        address: item?.address,
      };
    });
  const formatDateTime = (date: any) => {
    if (!date) return "None";

    return moment(date).format("YYYY-MM-DDTHH:mm:ss.SSSZ");
  };

  const StyledSelect = styled(Select)`
    .ant-select-dropdown {
      z-index: 1050 !important;
    }
  `;
  const handleChange = (selectedOption: any) => {
    setDepartmentId(selectedOption);
  };
  const handleChangeRole = (selectedOption: any) => {
    setRoleId(selectedOption);
  };
  // const getNameById = (id: any) => {
  //   const department = categoryData.find((option: any) => option.id === id);
  //   return department ? department.name : null;
  // };
  // const getIdByName = (name: any, map: any) => {
  //   const department = map?.find((option: any) => option.name === name);
  //   return department ? department.id : null;
  // };
  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Please enter email in proper format e.g. johndoes@hotmail.com")
      .required("Please enter email"),
    userName: Yup.string().required("Field is required"),
    phone: Yup.string().required("Field is required"),
    address: Yup.string().required("Field is required"),
  });
  return (
    <>
      {/* {loader && <Loader />} */}
      <div className="cs-table">
        <div className="col-lg-12 col-12 d-flex align-items-center pb-3">
          <h2 className="col-lg-4 col-12 fs-6 fw-bold d-flex justify-content-start">
            Employees
          </h2>
          <div className="col-lg-8 col-12 d-flex justify-content-end align-items-center">
            {/* <Select
              style={{ width: "250px", height: "38px" }}
              placeholder="Type here"
              className="search-bar"
            /> */}

            <div className="d-flex">
              <input
                type="text"
                placeholder="Type here"
                className="search-icon form-control search-bar"
                value={searchValue}
                onChange={onSearchHandle}
              />
            </div>
            <div
              onClick={() => {
                setAddDialog(true);
              }}
              className="theme-btn-next"
            >
              Add New Employee
            </div>
          </div>
        </div>
        <TableView header={Departments_Header} data={mappedData} />
      </div>
      <Modal show={addDialog} onHide={() => setAddDialog(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Employee</Modal.Title>
        </Modal.Header>
        <Formik
          initialValues={{
            tenantId: tenantId,
            userName: "",
            email: "",
            roleId: "",
            departmentId: "",
            twoStepVerification: "",
            status: "",
            sendEmail: true,
          }}
          validationSchema={validationSchema}
          onSubmit={addHandleSubmitButton}
        >
          {({ setFieldValue }) => {
            return (
              <Form>
                <Modal.Body>
                  <div className="col-md-12 row ">
                    <div className=" col-md-6">
                      <label className="pb-2" htmlFor="title">
                        User Name
                      </label>
                      <Field
                        className="form-control col-6"
                        type="text"
                        placeholder="User Name"
                        name="userName"
                        id="userName"
                        autoComplete="off"
                        onChange={(e: any) =>
                          setFieldValue("userName", e.target.value)
                        }
                      />
                      <ErrorMessage
                        name="userName"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </div>
                    <div className=" col-md-6">
                      <label className="pb-2" htmlFor="titleArabic">
                        User Email
                      </label>
                      <Field
                        type="text"
                        placeholder="User Email"
                        id="email"
                        name="email"
                        className="form-control"
                        onChange={(e: any) =>
                          setFieldValue("email", e.target.value)
                        }
                      />
                      <ErrorMessage
                        name="email"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </div>
                  </div>
                  <div className="col-md-12 row pt-3">
                    {/* <div className=" col-md-6">
                      <label className="pb-2" htmlFor="templateName">
                        User Password
                      </label>
                      <Field
                        className="form-control col-6"
                        type="password"
                        placeholder="User Password"
                        name=""
                        id=""
                        autoComplete="off"
                      />
                      <ErrorMessage
                        name=""
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </div> */}
                    <div className=" col-md-6">
                      <label className="pb-2" htmlFor="phone">
                        Phone
                      </label>
                      <Field
                        type="text"
                        placeholder="Phone"
                        id="phone"
                        name="phone"
                        className="form-control"
                        onChange={(e: any) =>
                          setFieldValue("phone", e.target.value)
                        }
                      />
                      <ErrorMessage
                        name="phone"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </div>
                    <div className=" col-md-6">
                      <label className="pb-2" htmlFor="address">
                        Address
                      </label>
                      <Field
                        className="form-control col-6"
                        type="text"
                        placeholder="Address"
                        name="address"
                        id="address"
                        autoComplete="off"
                      />
                      <ErrorMessage
                        name="address"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </div>
                  </div>
                  <div className="col-md-12 row mt-3">
                    <div className=" d-grid col-md-6">
                      <label className="" htmlFor="dob">
                        DOB
                      </label>
                      <DatePicker
                        onChange={(date: any) => {
                          setDob(date);
                        }}
                        value={dob}
                      />
                      <ErrorMessage
                        name="dob"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </div>
                    <div className=" d-grid col-md-6">
                      <label className="pb-2" htmlFor="receiver">
                        Assign Role
                      </label>
                      <Select
                        style={{ height: "38px" }}
                        className="br-10 bg-color-select"
                        // value={makerCategories.find(a => a.value === values.manufacturer)}
                        onChange={handleChangeRole}
                      >
                        {categoryData &&
                          categoryData?.map((option: any) => (
                            <Option key={option?.id} value={option?.id}>
                              {option.name}
                            </Option>
                          ))}
                      </Select>
                      <ErrorMessage
                        name="receiver"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </div>
                  </div>
                  <div className="col-md-12 row pt-3">
                    <div className=" d-grid col-md-6">
                      <label className="pb-2" htmlFor="status">
                        Assign Department
                      </label>
                      <Select
                        style={{ height: "38px" }}
                        className="br-10 bg-color-select"
                        // value={makerCategories.find(a => a.value === values.manufacturer)}
                        onChange={handleChange}
                      >
                        {" "}
                        {departmentDataAssign &&
                          departmentDataAssign?.map((option: any) => (
                            <Option key={option?.id} value={option?.id}>
                              {option.name}
                            </Option>
                          ))}
                      </Select>
                      {/* <Field
                          className="form-control col-6"
                          type="text"
                          placeholder="Active"
                          name="status"
                          id="status"
                          autoComplete="off"
                        /> */}

                      <ErrorMessage
                        name="status"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </div>
                  </div>
                  <div className="col-md-12 row pt-3">
                    <div className="s col-md-6">
                      <Switch
                        onChange={(checked) => {
                          setTwoStep(checked);
                        }}
                        checked={twoStep}
                      />
                      <label
                        className="ps-3"
                        htmlFor="receiver"
                        style={{ fontSize: "14px", fontWeight: "500" }}
                      >
                        Enable 2 Step Verification
                      </label>

                      <ErrorMessage
                        name="receiver"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </div>
                    <div className="s col-md-6">
                      <Switch
                        checked={status}
                        onChange={(checked) => {
                          setStatus(checked);
                        }}
                      />
                      <label
                        className="ps-3"
                        htmlFor="receiver"
                        style={{ fontSize: "14px", fontWeight: "500" }}
                      >
                        Status
                      </label>

                      <ErrorMessage
                        name="receiver"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </div>
                  </div>

                  <div className="border-bottom mt-3"></div>
                  <div className="d-flex justify-content-end">
                    <button
                      className="theme-btn-next col-3 mt-3 button-margin d-flex justify-content-center"
                      type="submit"
                    >
                      Add Employee
                    </button>
                  </div>
                </Modal.Body>
              </Form>
            );
          }}
        </Formik>
      </Modal>
      <Modal
        show={updateDialog}
        onHide={() => {
          setUpdateDialog(false);
        }}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Employee Details</Modal.Title>
        </Modal.Header>
        <Formik
          initialValues={{
            userName: rowEditData?.userName,
            email: rowEditData?.email,
            roleId: rowEditData.roleId,
            departmentId: rowEditData?.departmentId,
            twoStepVerification: rowEditData?.twoStepVerification,
            dob: rowEditData?.dob,
            phone: rowEditData?.phone,
            address: rowEditData?.address,
            status: status,
            sendEmail: rowEditData?.sendEmail,
          }}
          validationSchema={validationSchema}
          onSubmit={updateHandleSubmitButton}
        >
          {({ setFieldValue }) => {
            return (
              <Form>
                <Modal.Body>
                  <div className="col-md-12 row ">
                    <div className=" col-md-6">
                      <label className="pb-2" htmlFor="title">
                        User Name
                      </label>
                      <Field
                        className="form-control col-6"
                        type="text"
                        placeholder="User Name"
                        name="userName"
                        id="userName"
                        autoComplete="off"
                        onChange={(e: any) =>
                          setFieldValue("userName", e.target.value)
                        }
                      />
                      <ErrorMessage
                        name="userName"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </div>
                    <div className="form-group new_password form-label-group col-md-6">
                      <label className="pb-2" htmlFor="titleArabic">
                        User Email
                      </label>
                      <Field
                        type="text"
                        placeholder="User Email"
                        id="email"
                        name="email"
                        className="form-control"
                        onChange={(e: any) =>
                          setFieldValue("email", e.target.value)
                        }
                      />
                      <ErrorMessage
                        name="email"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </div>
                  </div>
                  <div className="col-md-12 row pt-3">
                    {/* <div className=" col-md-6">
                    <label className="pb-2" htmlFor="templateName">
                      User Password
                    </label>
                    <Field
                      className="form-control col-6"
                      type="password"
                      placeholder="User Password"
                      name=""
                      id=""
                      autoComplete="off"
                    />
                    <ErrorMessage
                      name=""
                      component="div"
                      className="invalid-feedback text-danger"
                    />
                  </div> */}
                    <div className="form-group new_password form-label-group col-md-6">
                      <label className="pb-2" htmlFor="templateNameArabic">
                        Phone
                      </label>
                      <Field
                        type="text"
                        placeholder="Phone"
                        id="phone"
                        name="phone"
                        className="form-control"
                        onChange={(e: any) =>
                          setFieldValue("phone", e.target.value)
                        }
                      />
                      <ErrorMessage
                        name="phone"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </div>
                    <div className=" col-md-6">
                      <label className="pb-2" htmlFor="address">
                        Address
                      </label>
                      <Field
                        className="form-control col-6"
                        type="text"
                        placeholder="Address"
                        name="address"
                        id="address"
                        autoComplete="off"
                      />
                      <ErrorMessage
                        name="address"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </div>
                  </div>
                  <div className="col-md-12 row pt-3">
                    <div className="form-group new_password form-label-group d-grid col-md-6">
                      <label className="" htmlFor="dob">
                        DOB
                      </label>
                      <DatePicker
                        onChange={(date: any) => {
                          setDob(date);
                        }}
                        value={dob}
                      />
                      <ErrorMessage
                        name="dob"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </div>
                    <div className=" d-grid col-md-6">
                      <label className="pb-2" htmlFor="receiver">
                        Assign Role
                      </label>
                      <Select
                        style={{ height: "38px" }}
                        className="br-10 bg-color-select"
                        // value={roleName}
                        onChange={handleChangeRole}
                      >
                        {" "}
                        {categoryData?.map((option: any) => (
                          <Option key={option?.id} value={option?.id}>
                            {option.name}
                          </Option>
                        ))}
                      </Select>
                      <ErrorMessage
                        name="receiver"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </div>
                  </div>
                  <div className="col-md-12 row pt-3">
                    <div className=" d-grid col-md-6">
                      <label className="pb-2" htmlFor="status">
                        Assign Department
                      </label>
                      <Select
                        style={{ height: "38px" }}
                        className="br-10 bg-color-select"
                        // value={departmentName}
                        onChange={handleChange}
                      >
                        {departmentDataAssign?.map((option: any) => (
                          <Option key={option?.id} value={option?.id}>
                            {option.name}
                          </Option>
                        ))}
                      </Select>
                      {/* <Field
                        className="form-control col-6"
                        type="text"
                        placeholder="Active"
                        name="status"
                        id="status"
                        autoComplete="off"
                      /> */}

                      <ErrorMessage
                        name="status"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </div>
                  </div>
                  <div className="col-md-12 row pt-3">
                    <div className="s col-md-6">
                      <Switch
                        // onChange={(e: any) => handleToggleChange(index, e)}
                        checked={true}
                      />
                      <label
                        className="ps-3"
                        htmlFor="receiver"
                        style={{ fontSize: "14px", fontWeight: "500" }}
                      >
                        Enable 2 Step Verification
                      </label>

                      <ErrorMessage
                        name="receiver"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </div>
                    <div className="s col-md-6">
                      <Switch
                        checked={status}
                        onChange={(checked) => {
                          setStatus(checked);
                        }}
                      />
                      <label
                        className="ps-3"
                        htmlFor="receiver"
                        style={{ fontSize: "14px", fontWeight: "500" }}
                      >
                        Status
                      </label>

                      <ErrorMessage
                        name="receiver"
                        component="div"
                        className="invalid-feedback text-danger"
                      />
                    </div>
                  </div>

                  <div className="border-bottom mt-3"></div>
                  <div className="d-flex justify-content-end">
                    <button
                      className="theme-btn col-3 mt-3 button-margin d-flex justify-content-center"
                      type="submit"
                    >
                      Save Changes
                    </button>
                  </div>
                </Modal.Body>
              </Form>
            );
          }}
        </Formik>
      </Modal>
      <Modal show={deleteDialog} onHide={() => setDeleteDialog(false)}>
        <Modal.Header>
          <Modal.Title className="modal-title"></Modal.Title>
          <div
            className="cursor-pointer"
            onClick={() => {
              setDeleteDialog(false);
            }}
          >
            <img src={Images.closeBtn} alt="" />
          </div>
        </Modal.Header>
        <Modal.Body className="p-2">
          <div className="d-flex justify-content-center">
            <img src={Images.danger} alt="" width={88} height={88} />
          </div>
          <div
            style={{ fontSize: "20px", fontWeight: "600", lineHeight: "20px" }}
            className="text-center pt-3"
          >
            <div> Are you sure?</div>
          </div>

          <div
            style={{ fontSize: "14px", fontWeight: "400", lineHeight: "19px" }}
            className="text-center d-flex justify-content-center pt-3"
          >
            <div className="col-10">
              This action cannot be undone. All values associated with this
              record will be lost.
            </div>
          </div>
          <div className="pt-3">
            {/* <OtpInput length={6} onChangeOtp={handleOtpChange} /> */}
          </div>
          <div className="d-flex justify-content-center">
            {" "}
            <button
              className="w-50 mt-3 theme-btn"
              type="submit"
              onClick={() => {
                deleteRow(rowData.id);
              }}
            >
              Delete Record
            </button>
          </div>
          <div className="d-flex justify-content-center">
            {" "}
            <button
              className="w-50 mt-3 theme-btn-cancel"
              type="submit"

              // onClick={() => {
              //   handleVerifyOtp();
              // }}
            >
              Cancel
            </button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};
export default AcmEmployess;
