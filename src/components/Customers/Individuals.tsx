import { useEffect, useState } from "react";
import { FaSearchengin } from "react-icons/fa";
import { Button, Dropdown, Input, Menu, Select } from "antd";
import TableView from "../TableView/TableView";
import { useNavigate, useParams } from "react-router-dom";
import {
  getAllCustomerIndividual,
  getAllRealations,
  updateBusinessCustomerName,
  updateBusinessStopCorrespondance,
} from "../../redux/apis/apisCrudLms";
import toast from "react-hot-toast";
import {
  ClockCircleOutlined,
  DownOutlined,
  EditOutlined,
  EyeOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import "../../assets/scss/custom.scss";
import { Modal, ModalBody, ModalHeader } from "react-bootstrap";
import Loader from "../Loader/Loader";
import { useTranslation } from "react-i18next";
const Individuals = () => {
  const { t } = useTranslation("customersB");
  const [searchValue, setSearchValue] = useState("");
  const [editRowId, setEditRowId] = useState(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [frozenColumns, setFrozenColumns] = useState<string[]>([]);
  const [allCustomer, setAllCustomer] = useState<any>();
  const [allReason, setAllReason] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const navigate = useNavigate();
  const [selectApplicable, setSelectApplicable] = useState<any>();
  const [customerNameModal, setCustomerNameModal] = useState(false);
  const [updatedId, setUpdatedId] = useState("");
  const [updatedName, setUpdatedName] = useState("");
  const [initialRendor, setInitialRendor] = useState(false);
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const handleView = (row: any) => {
    localStorage.setItem("selectedCustomerID", row.CustomerID);
    localStorage.setItem("selectedCustomerName", row.Name);
    navigate(`/view/viewdetails/Individuals/${row.CustomerID}`);
  };
  const handleEditClick = (row: any) => {
    localStorage.setItem("selectedCustomerID", row.CustomerID);
    localStorage.setItem("selectedCustomerName", row.Name);
    setEditRowId(row.CustomerID);
    setEditFormData({ ...row });
    navigate(`/view/edit/individuals/${row.CustomerID}`);
  };
  // Handle form input changes dynamically
  const handleInputChange = (event: any) => {
    const { name, value } = event.target;
    setEditFormData({ ...editFormData, [name]: value });
    navigate("/");
  };
  const handleChange = (key: string, row: any) => {
    if (key === "edit") {
      handleEditClick(row);
    } else if (key === "view") {
      handleView(row);
    } else if (key === "timeLine") {
      navigate(`/view/accountTimeLine/${row?.nationalId}/${row.CustomerID}`);
    }
  };
  const menu = (row: any) => (
    <Menu onClick={({ key }: any) => handleChange(key, row)}>
      {/* <Menu.Item
        key="editName"
        icon={<EditOutlined />}
        onClick={() => {
          setCustomerNameModal(true);
          setUpdatedName(row.Name);
          setUpdatedId(row.CustomerID);
        }}
      >
        Update Customer Name
      </Menu.Item> */}
      <Menu.Item key="edit" icon={<EditOutlined />}>
        {t("common:edit")}
      </Menu.Item>
      <Menu.Item key="view" icon={<EyeOutlined />}>
        {t("common:view")}
      </Menu.Item>
      <Menu.Item key="timeLine" icon={<ClockCircleOutlined />}>
        {t("customersB:individuals.accountTimeline")}
      </Menu.Item>
    </Menu>
  );
  const customSearchInput = (
    <Input
      placeholder={t("customersB:individuals.searchCustomers")}
      value={searchValue}
      prefix={<FaSearchengin />}
      onChange={(e: any) => setSearchValue(e.target.value)}
    />
  );
  const Customer_ALL_List_Header = [
    // {
    //   name: "Customer ID",
    //   selector: (row: any) =>
    //     editRowId === row.CustomerID ? (
    //       <Input
    //         name="CustomerID"
    //         value={editFormData.CustomerID}
    //         onChange={handleInputChange}
    //       />
    //     ) : (
    //       row.CustomerID
    //     ),
    //   frozen: frozenColumns.includes("Customer ID"),
    // },
    // {
    //   name: "Individual ID",
    //   selector: (row: any) =>
    //     editRowId === row.CustomerID ? (
    //       <Input
    //         name="IndividualId"
    //         value={editFormData.IndividualId}
    //         onChange={handleInputChange}
    //       />
    //     ) : (
    //       row.IndividualId
    //     ),
    //   frozen: frozenColumns.includes("Individual ID"),
    // },
    {
      name: t("common:name"),
      selector: (row: any) =>
        editRowId === row.CustomerID ? (
          <Input
            name="Name"
            value={editFormData.Name}
            onChange={handleInputChange}
          />
        ) : (
          row.Name
        ),
      frozen: frozenColumns.includes("Name"),
    },
    {
      name: t("customersB:individuals.relation"),
      selector: (row: any) =>
        editRowId === row.CustomerID ? (
          <Input
            name="Relation"
            value={editFormData.Relation}
            onChange={handleInputChange}
          />
        ) : (
          row.Relation
        ),
      frozen: frozenColumns.includes("Relation"),
    },
    {
      name: t("customersB:individuals.ssn"),
      selector: (row: any) =>
        editRowId === row.CustomerID ? (
          <Input
            name="SSN"
            value={editFormData.SSN}
            onChange={handleInputChange}
          />
        ) : (
          row.SSN
        ),
    },
    {
      name: t("customersB:individuals.nationalId"),
      selector: (row: any) =>
        editRowId === row.CustomerID ? (
          <Input
            name="NationalId"
            value={editFormData.NationalId}
            onChange={handleInputChange}
          />
        ) : (
          row.NationalId
        ),
    },
    {
      name: t("customersB:individuals.nidIssueDate"),
      selector: (row: any) =>
        editRowId === row.CustomerID ? (
          <Input
            name="NIDIssueDate"
            value={editFormData.NIDIssueDate}
            onChange={handleInputChange}
          />
        ) : (
          row.NIDIssueDate
        ),
    },
    {
      name: t("customersB:individuals.nidExpiry"),
      selector: (row: any) =>
        editRowId === row.CustomerID ? (
          <Input
            name="NIDExpiry"
            value={editFormData.NIDExpiry}
            onChange={handleInputChange}
          />
        ) : (
          row.NIDExpiry
        ),
    },
    {
      name: t("customersB:individuals.dob"),
      selector: (row: any) =>
        editRowId === row.CustomerID ? (
          <Input
            name="DOB"
            value={editFormData.DOB}
            onChange={handleInputChange}
          />
        ) : (
          row.DOB
        ),
    },
    {
      name: t("customersB:individuals.gender"),
      selector: (row: any) =>
        editRowId === row.CustomerID ? (
          <Input
            name="Gender"
            value={editFormData.Gender}
            onChange={handleInputChange}
          />
        ) : (
          row.Gender
        ),
    },
    {
      name: t("common:email"),
      selector: (row: any) =>
        editRowId === row.CustomerID ? (
          <Input
            name="Email"
            value={editFormData.Email}
            onChange={handleInputChange}
          />
        ) : (
          row.Email
        ),
    },
    {
      name: t("common:status"),
      selector: (row: any) =>
        editRowId === row.CustomerID ? (
          <Input
            name="Status"
            value={editFormData.status}
            onChange={handleInputChange}
          />
        ) : (
          row.status
        ),
      cell: (row: any) => (
        <div
          style={{
            padding: "0.22rem 1rem",
            borderRadius: "2px",
            backgroundColor:
              row.status
                ? "var(--color-status-green)"
                : "var(--color-status-dark)",
            color: "var(--primary-foreground)",
            cursor: row.status ? "pointer" : "default",
          }}
        >
          {row.status  ? t("common:active") : t("common:inactive")}
        </div>
      ),
    },
    // {
    //   name: "Stop Correspondence",

    //   cell: (row: any) => (
    //     <>
    //       <Switch
    //         value={row.Correspondence}
    //         onChange={(val) => {
    //           handleUpdateStopCorrespondance(val);
    //         }}
    //       />
    //     </>
    //   ),
    // },
    {
      name: t("common:actions"),

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
            {t("common:select")} <DownOutlined />
          </Button>
        </Dropdown>
      ),
    },
  ];

  const [loading, setLoading] = useState(false);

  const individualCustomer = async () => {
    try {
      setSkelitonLoading(true);
      const requestBody = {
        pageNo: page,
        pageSize: pageSize,
        searchTypes: selectApplicable,
        searchQuery: searchValue,
        from: "2024-06-15T10:30:39.150Z",
        to: new Date(),
      };
      const res = await getAllCustomerIndividual(requestBody);
      if (res) {
        const value = res.data.data;
        setAllCustomer(value || []);
        setTotalRows(res?.data?.pageInfo?.totalItems || 0);
      }
    } catch (error: any) {
      setSkelitonLoading(false);
      toast.error(error?.message);
    } finally {
      setSkelitonLoading(false);
    }
  };
  const enums = {
    Gender: [
      { value: 1, label: "Male" },
      { value: 2, label: "Female" },
      { value: 3, label: "Non_Binary" },
      { value: 4, label: "Prefer_not_to_say" },
    ],
  };
  const getGenderLabel = (value: any) => {
    const gender = enums.Gender.find((g) => g.value === value);
    return gender ? gender.label : "";
  };
  const handleAllReason = async () => {
    try {
      const res = await getAllRealations(page, pageSize);
      if (res) {
        const data = res.data.data;
        setAllReason(data);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  const getReasonDescriptionById = (id: any) => {
    const entry: any = allReason?.find((entry: any) => entry.id === id);
    return entry ? entry.name : "ID not found";
  };
  const formatDate = (isoString: any) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const mappedData =
    allCustomer &&
    allCustomer.map((item: any) => {
      return {
        CustomerID: item.customerId,
        IndividualId: item.individualId,
        Name: item.name,
        Relation: getReasonDescriptionById(item.relationId),
        SSN: item.ssn,
        NationalId: item.nationalId,
        NIDIssueDate: formatDate(item.nationalIdIssuanceDate),
        NIDExpiry: formatDate(item.nidExpiryDate),
        DOB: formatDate(item.dob),
        Gender: getGenderLabel(item.gender),
        Email: item.email,
        nationalId: item?.nationalId,
        status: true,
      };
    });
  useEffect(() => {
    if (initialRendor) {
      const timeoutId = setTimeout(() => {
        {
          individualCustomer();
        }
      }, 1500);
      return () => clearTimeout(timeoutId);
    }
  }, [searchValue]);
  useEffect(() => {
    handleAllReason();
    individualCustomer();
    setInitialRendor(true);
  }, [page, pageSize]);

  const handleUpdateName = async () => {
    try {
      // setIsLoading(true);
      const response = await updateBusinessCustomerName(updatedId, updatedName);
      if (
        response.data.notificationMessage ==
        "Request initiated for the operation"
      ) {
        toast.success(response.data.notificationMessage);
        // setLoader(false);
      } else {
        toast.error(
          response?.data?.data?.notificationMessage ||
          response?.data?.notificationMessage ||
          response.data.errors[0]
        );
        // setLoader(false);
      }
      individualCustomer();
      setCustomerNameModal(false);
      // setIsLoading(false);
      setUpdatedId("");
      setUpdatedName("");
    } catch (error: any) {
      toast.error(t("customersB:toast.somethingWentWrong"));
      // setLoader(false);
    }
  };

  const handleUpdateStopCorrespondance = async (val: any) => {
    try {
      // setIsLoading(true);
      const response = await updateBusinessStopCorrespondance(val);
      if (
        response.data.notificationMessage ==
        "Request initiated for the operation"
      ) {
        toast.success(response.data.notificationMessage);
        // setLoader(false);
      } else {
        toast.error(
          response?.data?.data?.notificationMessage ||
          response?.data?.notificationMessage ||
          response.data.errors[0]
        );
        // setLoader(false);
      }
      individualCustomer();
    } catch (error: any) {
      // toast.error(error?.message);
      toast.error(t("customersB:toast.somethingWentWrong"));
      // setLoader(false);
    }
  };
  const applicableOption = [
    { label: t("common:name"), value: 0 },
    { label: t("common:email"), value: 1 },
    { label: t("customersB:searchType.nid"), value: 3 },
    { label: t("customersB:searchType.loanId"), value: 4 },
    { label: t("customersB:searchType.invoiceId"), value: 5 },
    { label: t("customersB:searchType.applicationId"), value: 6 },
    { label: t("customersB:searchType.applicationNo"), value: 7 },
    // { label: "ProductName", value: 8 },
    { label: t("customersB:searchType.invoiceNo"), value: 12 },
    // { label: "LegalName", value: 9 },
    // { label: "TaxId", value: 10 },
    { label: t("common:none"), value: 11 },
  ];
  return (
    <>
      {loading && <Loader />}
      <div>
        <div className="col-12 d-flex  align-items-center mt-3">
          <div
            className="d-flex align-items-center col-6 justify-content-between mt-1"
            style={{ fontSize: "18px", fontWeight: "Bold" }}
          >
            {t("customersB:individuals.title")}
          </div>
          <div className="col-6 d-flex justify-content-end">
            <span className="pe-3">
              <Select
                value={selectApplicable}
                onChange={(e: any) => {
                  setSelectApplicable(e);
                }}
                style={{ width: "100%", minWidth: "100px", height: "33px" }}
                placeholder={t("customersB:searchType.placeholder")}
              >
                {applicableOption?.map((option) => (
                  <Select.Option value={option.value}>
                    {option?.label}
                  </Select.Option>
                ))}
              </Select>
            </span>
            <span className="pe-2">
              <Input
                placeholder={t("common:search")}
                value={searchValue}
                prefix={<SearchOutlined />}
                onChange={(e: any) => {
                  setSearchValue(e.target.value);
                }}
              />
            </span>
          </div>
        </div>
        <div className="col-12">
          {/* <TableHeaderFilter
            searchInput={customSearchInput}
            searchValue={searchValue}
            setSearchValue={setSearchValue}
          /> */}
        </div>
        <div className="cs-table p-2">
          <TableView
            setPage={setPage}
            setPageSize={setPageSize}
            page={page}
            pageSize={pageSize}
            totalRows={totalRows}
            header={Customer_ALL_List_Header}
            data={mappedData}
            isLoading={skelitonLoading}
          />
          {allCustomer?.length == 0 && (
            <div className="d-flex justify-content-center mt-5 bg-red">
              {t("customersB:general.noDataFound")}
            </div>
          )}
        </div>
      </div>

      <Modal backdrop="static" keyboard={false}
        centered
        show={customerNameModal}
        onHide={() => {
          setCustomerNameModal(false);
          setUpdatedId("");
          setUpdatedName("");
        }}
      >
        <ModalHeader className="customer-fs-fw" closeButton>
          {t("customersB:business.updateCustomerName")}
        </ModalHeader>

        <ModalBody className="modal-body-scroll">
          <div className="col-12 row">
            <div className="col-6">
              <label className="d-flex mb-2 customer-fs-fw">{t("customersB:business.customerId")}</label>
              <Input name="id" value={updatedId.split("-")[0]} disabled />
            </div>
            <div className="col-6">
              <label className="d-flex mb-2 customer-fs-fw">{t("customersB:business.enterName")}</label>
              <Input
                name="name"
                value={updatedName}
                onChange={(e) => setUpdatedName(e.target.value)}
              />
            </div>

            <div className="mt-5 d-flex justify-content-end">
              <button
                className="theme-btn-next"
                onClick={() => handleUpdateName()}
              >
                {t("common:update")}
              </button>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </>
  );
};

export default Individuals;
