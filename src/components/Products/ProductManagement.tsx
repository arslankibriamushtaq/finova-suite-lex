import { useEffect, useState } from "react";
import { Input, Dropdown, Menu, Button } from "antd";
import { FaSearchengin } from "react-icons/fa";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import {
  GetAllOccupations,
  allState,
  createIndividualsEmployee,
  getAllCountries,
  getAllProducts,
  getAllRealations,
  getCities,
  getLanguage,
  productDelete,
} from "../../redux/apis/apisCrudLms";
import { DeleteOutlined, DownOutlined, EditOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import Loader from "../Loader/Loader";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/rootReducer";

const ProductManagement = () => {
  const [searchValue, setSearchValue] = useState("");
  const [addCustomerModal, setAddCustomerModal] = useState(false);
  const [individualModal, setIndividualModal] = useState(false);
  const [customerValue, setCustomerValue] = useState("individuals");
  const [buisnessForm, setBusinessForm] = useState(false);
  const [editRowId, setEditRowId] = useState(null);
  const [state, setStates] = useState<any>([]);
  const [editFormData, setEditFormData] = useState<any>({});
  const [products, setProducts] = useState<any>([]);
  const [language, setLanguage] = useState<any>();
  const [country, setCountry] = useState<any>();
  const [occupation, setOccupation] = useState<any>();
  const [allReason, setAllReason] = useState([]);
  const [cities, setCities] = useState<any>();
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const navigate = useNavigate();
  const prodId = useSelector((state: RootState) => state.block.prodId);

  // Handle form input changes dynamically
  const handleInputChange = (event: any) => {
    const { name, value } = event.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  const [loading, setLoading] = useState(false);

  // const getProducts = async () => {
  //   try {
  //     setLoading(true);
  //     const response = await getAllProducts(page, pageSize);
  //     if (response) {
  //       const values = response?.data?.data;
  //       setProducts(values || []);
  //       setTotalRows(response?.data?.pageInfo?.totalItems || 0);
  //     }
  //   } catch (error: any) {
  //     toast.error(error?.message);
  //     // setIndividualModal(false);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const getAllStates = async () => {
    try {
      const response = await allState();
      if (response) {
        const values = response?.data?.data;

        setStates(values);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  const deleteProducts = async (id: any) => {
    try {
      const response = await productDelete(id);
      if (response?.data?.notificationMessage) {
        const values = response?.data?.data;
        toast.success(response?.data?.notificationMessage);
        prodId();
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  const mappedData = products;
  // &&
  // products.map((item: any) => {
  //   return {
  //     CustomerID: item.customerId || "-",
  //     Name: item.name || "-",
  //     Type: item.type || "-",
  //     PhoneNo: item.phoneNo || "-",
  //     Email: item.email || "-",
  //     status: item.status || "-",
  //   };
  // });
  useEffect(() => {
    languageApi();
    getAllStates();
    occupationApi();
    cityApi();
    handleAllReason();
    countryApi();
  }, []);
  // useEffect(() => {
  //   getProducts();
  // }, [pageSize, page]);

  const customSearchInput = (
    <Input
      placeholder="Search Products"
      value={searchValue}
      prefix={<FaSearchengin />}
      onChange={(e) => setSearchValue(e.target.value)}
    />
  );

  const customerOptions = [
    { label: "Individuals", value: "individuals" },
    { label: "Businesses", value: "businesses" },
  ];
  const handleValueChange = (value: any) => {
    setCustomerValue(value);
  };

  const handleEditClick = (row: any) => {
    setEditRowId(row.id);
    localStorage.setItem("selectedCustomerID", row.CustomerID);
    localStorage.setItem("selectedCustomerName", row.Name);
    setEditFormData({ ...row });
    navigate(`/view/edit/buisness/${row.CustomerID}`);
  };
  const handleAccountTimeline = () => {
    navigate("/view/accountTimeline");
  };
  const handleView = (row: any) => {
    if (row.Type == "Individual") {
      navigate(`/view/viewdetails/Individuals/${row.CustomerID}`);
    } else {
      navigate(`/view/viewdetails/buisness/${row.CustomerID}`);
    }
  };
  const handleControlModal = () => {
    setAddCustomerModal(false);
    if (customerValue === "businesses") {
      setBusinessForm(true);
    } else if (customerValue === "individuals") {
      setIndividualModal(true);
    }
  };

  const handleChange = (key: string, row: any) => {
    if (key === "edit") {
      navigate(`/lms/ProductManagement/EditProduct/${row.productId}`);
      // handleEditClick(row);
    } else if (key === "delete") {
      deleteProducts(row?.productId);
    } else if (key === "view") {
      handleView(row);
    } else if (key === "accountTimeline") {
      handleAccountTimeline();
    }
  };

  const menu = (row: any) => (
    <Menu onClick={({ key }: any) => handleChange(key, row)}>
      <Menu.Item key="edit" icon={<EditOutlined />}>
        Edit
      </Menu.Item>
      <Menu.Item key="delete" icon={<DeleteOutlined />}>
        Delete
      </Menu.Item>
      {/* <Menu.Item key="accountTimeline" icon={<ProfileFilled />}>
        Account Timeline
      </Menu.Item> */}
    </Menu>
  );

  const formatDatePayload = (isoString: string): string => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const milliseconds = String(date.getMilliseconds()).padStart(3, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}Z`;
  };

  const handleSubmit = async (formField: any) => {
    const tenantId = localStorage.getItem("tenantId");
    try {
      const body = {
        type: 1,
        tenantId: tenantId,
        individualDto: {
          // individualId: formField.individualId,
          // customerId: formField.customerId,
          name: formField.name,
          relationId: formField.relationId,
          ssn: formField.ssn,
          nationalId: formField.nationalId,
          nationalIdIssuanceDate: formatDatePayload(
            formField.nationalIdIssuanceDate
          ),
          nidExpiryDate: formatDatePayload(formField.nidExpiryDate),
          dob: formatDatePayload(formField.dob),
          gender: formField.gender ? formField.gender : 1,
          email: formField.email,
          languageId: formField.languageId ? formField.languageId : 1,
          maritalStatus: formField.maritalStatus,
          disability: formField.disability,
          skip: formField.skip.toString(),
          stopCorrespondance: formField.stopCorrespondance.toString(),
          activeMilitaryDuty: formField.activeMilitaryDuty,
          timeZone: formField.timeZone,
          motherMaidenName: formField.motherMaidenName,
          visaNumber: formField.visaNumber,
          licenseNumber: formField.licenseNumber,
          licenseIssueDate: formatDatePayload(formField.licenseIssueDate),
          licenseExpiryDate: formatDatePayload(formField.licenseExpiryDate),
          passportNumber: formField.passportNumber,
          passportIssueDate: formatDatePayload(formField.passportIssueDate),
          passportExpiryDate: formatDatePayload(formField.passportExpiryDate),
          prNumber: formField.prNumber,
          education: formField.education,
          bankcruptcy: formField.bankcruptcy,
          privacyOptOut: formField.privacyOptOut,
          insuranceOptOut: formField.insuranceOptOut,
          marketingOtpOut: formField.marketingOtpOut,
          sharedCreditOtpOut: formField.sharedCreditOtpOut,
          nationality: formField.nationality,
          isPoliticallyExposed: formField.isPoliticallyExposed,
          deceaseDate: formatDatePayload(formField.deceaseDate),
          birthPlace: formField.birthPlace,
          birthCountry: formField.birthCountry,
          issueedPowerOfAttorney: formField.issueedPowerOfAttorney.toString(),
        },
        employmentDto: {
          current: formField.current,
          permissionToCall: formField.permissionToCall,
          permissionToText: formField.permissionToText,
          type: formField.type1 ? formField.type1 : 1,
          employer: formField.employer,
          occupationId: formField.occupationId ? formField.occupationId : 1,
          title: formField.title,
          department: formField.department,
          countryId: formField.countryId ? formField.countryId : 1,
          address1: formField.address4,
          address2: formField.address5,
          zip: formField.zip,
          zipExtention: formField.zipExtention,
          cityId: formField.cityId,
          stateId: formField.stateId,
          phone: formField.phone,
          extention: formField.extention,
          comment: formField.comment,
          payDay: formField.payDay,
          nextPayDay: formatDatePayload(formField.nextPayDay),
          frequency: formField.frequency,
        },
        addressDto: {
          type: formField.type ? formField.type : 1,
          current: formField.current,
          confirmed: formField.confirmed,
          permissionToCall: formField.permissionToCall,
          mailing: formField.mailing,
          addrs: formField.addrs,
          phone: formField.phone1,
          permissionToText: formField.permissionToText,
          countryId: formField.countryId1 ? formField.countryId1 : 1,
          postalAddressType: formField.postalAddressType,
          streetPre: formField.streetPre,
          streetName: formField.streetName,
          streetType: formField.streetType,
          buildingNumber: formField.buildingNumber,
          address1: formField.address1,
          address2: formField.address2,
          address3: formField.address3,
          zip: formField.zip1,
          zipExtention: formField.zipExtention1,
          cityId: formField.city2,
          timeZone: formField.timeZone1,
          comment: formField.comment1,
        },
      };
      const response = await createIndividualsEmployee(body);
      if (response) {
        toast.success(response?.data.notificationMessage);
        navigate("/lms/customers/individuals");
      }
    } catch (error: any) {
      toast.error(error?.message);
      // setIndividualModal(false);
    }
  };
  const enums = {
    AddressType: [
      { value: 1, label: "Office" },
      { value: 2, label: "Home" },
      { value: 3, label: "Billing" },
      { value: 4, label: "Shipping" },
    ],
    TimeZone: [
      { value: "UTC", label: "UTC" },
      { value: "UTC-12:00", label: "UTC-12:00" },
      { value: "UTC-11:00", label: "UTC-11:00" },
      { value: "UTC-10:00", label: "UTC-10:00" },
      { value: "UTC-09:00", label: "UTC-09:00" },
      { value: "UTC-08:00", label: "UTC-08:00" },
      { value: "UTC-07:00", label: "UTC-07:00" },
      { value: "UTC-06:00", label: "UTC-06:00" },
      { value: "UTC-05:00", label: "UTC-05:00" },
      { value: "UTC-04:00", label: "UTC-04:00" },
      { value: "UTC-03:00", label: "UTC-03:00" },
      { value: "UTC-02:00", label: "UTC-02:00" },
      { value: "UTC-01:00", label: "UTC-01:00" },
      { value: "UTC+00:00", label: "UTC+00:00" },
      { value: "UTC+01:00", label: "UTC+01:00" },
      { value: "UTC+02:00", label: "UTC+02:00" },
      { value: "UTC+03:00", label: "UTC+03:00" },
      { value: "UTC+04:00", label: "UTC+04:00" },
      { value: "UTC+05:00", label: "UTC+05:00" },
      { value: "UTC+06:00", label: "UTC+06:00" },
      { value: "UTC+07:00", label: "UTC+07:00" },
      { value: "UTC+08:00", label: "UTC+08:00" },
      { value: "UTC+09:00", label: "UTC+09:00" },
      { value: "UTC+10:00", label: "UTC+10:00" },
      { value: "UTC+11:00", label: "UTC+11:00" },
      { value: "UTC+12:00", label: "UTC+12:00" },
    ],
    BankAccountNumbeType: [
      { value: "IBAN", label: "IBAN" },
      { value: "SWIFT", label: "SWIFT" },
    ],
    Bankruptcy: [
      { value: 1, label: "Yes" },
      { value: 2, label: "No" },
    ],
    Disability: [
      { value: 1, label: "Yes" },
      { value: 2, label: "No" },
    ],
    Education: [
      { value: 1, label: "Non_Schooling" },
      { value: 2, label: "Primary_Education" },
      { value: 3, label: "Secondary_Education" },
      { value: 4, label: "Accociate_degree" },
      { value: 5, label: "Bechelors_Degree" },
      { value: 6, label: "Master_Degree" },
      { value: 7, label: "Phd_Scholar" },
    ],
    Frequency: [
      { value: 1, label: "Daily" },
      { value: 2, label: "Weekly" },
      { value: 3, label: "Bi_Weekly" },
      { value: 4, label: "Semi_Monthly" },
      { value: 5, label: "Monthly" },
      { value: 6, label: "Quarterly" },
      { value: 7, label: "Annually" },
    ],
    payday: [
      { value: 1, label: "1" },
      { value: 2, label: "2" },
      { value: 3, label: "3" },
      { value: 4, label: "4" },
      { value: 5, label: "5" },
      { value: 6, label: "6" },
      { value: 7, label: "7" },
      { value: 8, label: "8" },
      { value: 9, label: "9" },
      { value: 10, label: "10" },
      { value: 11, label: "11" },
      { value: 12, label: "12" },
      { value: 13, label: "13" },
      { value: 14, label: "14" },
      { value: 15, label: "15" },
      { value: 16, label: "16" },
      { value: 17, label: "17" },
      { value: 18, label: "18" },
      { value: 19, label: "19" },
      { value: 20, label: "20" },
      { value: 21, label: "21" },
      { value: 22, label: "22" },
      { value: 23, label: "23" },
      { value: 24, label: "24" },
      { value: 25, label: "25" },
      { value: 26, label: "26" },
      { value: 27, label: "27" },
      { value: 28, label: "28" },
      { value: 29, label: "29" },
      { value: 30, label: "30" },
    ],
    Gender: [
      { value: 1, label: "Male" },
      { value: 2, label: "Female" },
      { value: 3, label: "Non_Binary" },
      { value: 4, label: "Prefer_not_to_say" },
    ],
    IsPoliticallyExposed: [
      { value: 1, label: "Yes" },
      { value: 2, label: "No" },
    ],
    MaritalStatus: [
      { value: 1, label: "Single" },
      { value: 2, label: "Married" },
      { value: 3, label: "Divorce" },
      { value: 4, label: "Widowed" },
      { value: 5, label: "Separated" },
    ],
    ReferanceStatus: [
      { value: 1, label: "Active" },
      { value: 2, label: "Inactive" },
    ],
    Result: [
      { value: 1, label: "Negative" },
      { value: 2, label: "Positive" },
      { value: 3, label: "Inconclusive" },
      { value: 4, label: "PendingFurtherReview" },
    ],
    StarRating: [
      { value: "OneStar", label: "One Star" },
      { value: "TwoStar", label: "Two Star" },
      { value: "ThreeStar", label: "Three Star" },
      { value: "FourStar", label: "Four Star" },
      { value: "FiveStar", label: "Five Star" },
    ],
    Status: [
      { value: 1, label: "Initiated" },
      { value: 2, label: "Pending" },
      { value: 3, label: "InProgress" },
      { value: 4, label: "Completed" },
      { value: 5, label: "Verified" },
      { value: 6, label: "Failed" },
      { value: 7, label: "Cancelled" },
      { value: 8, label: "OnHold" },
      { value: 9, label: "Reassigned" },
      { value: 10, label: "Escalated" },
      { value: 11, label: "AwaitingCustomerResponse" },
      { value: 12, label: "Review" },
      { value: 13, label: "Closed" },
      { value: 14, label: "DiscrepancyFound" },
      { value: 15, label: "NotApplicable" },
    ],
    SubType: [
      { value: 1, label: "FollowUp" },
      { value: 2, label: "Reminder" },
      { value: 3, label: "SystemAlert" },
      { value: 4, label: "AutoResponse" },
      { value: 5, label: "Complaint" },
      { value: 6, label: "Inquiry" },
      { value: 7, label: "Update" },
      { value: 8, label: "Correction" },
      { value: 9, label: "Notification" },
      { value: 10, label: "InboundFromInterface" },
      { value: 11, label: "OutboundToInterface" },
    ],
    Type: [
      { value: 1, label: "Regular" },
      { value: 2, label: "SystemGenerated" },
      { value: 3, label: "CustomerInitiated" },
      { value: 4, label: "StaffInitiated" },
      { value: 5, label: "Alert" },
      { value: 6, label: "Inboundfrominterface" },
      { value: 7, label: "OutboundToInterface" },
    ],
    VerificationType: [
      { value: 1, label: "Address" },
      { value: 2, label: "Employment" },
      { value: 3, label: "Asset" },
      { value: 4, label: "CreditHistory" },
      { value: 5, label: "BusinessVerification" },
      { value: 6, label: "ReferenceChecks" },
      { value: 7, label: "DocumentVerification" },
    ],
  };
  const Customer_ALL_List_Header = [
    // {
    //   name: "Customer ID",
    //   selector: (row: any) =>
    //     editRowId === row.id ? (
    //       <Input
    //         name="CustomerID"
    //         value={editFormData.CustomerID}
    //         onChange={handleInputChange}
    //       />
    //     ) : (
    //       row.CustomerID
    //     ),
    // },
    {
      name: "Product Name (En)",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="nameInEnglish"
            value={editFormData.nameInEnglish}
            onChange={handleInputChange}
          />
        ) : (
          row.nameInEnglish
        ),
    },
    {
      name: "Product Name (Ar)",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="nameInArabic"
            value={editFormData.nameInArabic}
            onChange={handleInputChange}
          />
        ) : (
          row.nameInArabic
        ),
    },
    // {
    //   name: "Type",
    //   selector: (row: any) =>
    //     editRowId === row.id ? (
    //       <Input
    //         name="Type"
    //         value={editFormData.Type}
    //         onChange={handleInputChange}
    //       />
    //     ) : (
    //       row.Type
    //     ),
    // },
    {
      name: "Minimum Finance Limit",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="MinimumFinanceLimit"
            value={editFormData.PhoneNo}
            onChange={handleInputChange}
          />
        ) : (
          row.minimumFinanceLimit
        ),
    },
    {
      name: "Maximum Finance Limit",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="MaximumFinanceLimit"
            value={editFormData.maximumFinanceLimit}
            onChange={handleInputChange}
          />
        ) : (
          row.maximumFinanceLimit
        ),
    },
    {
      name: "Minimum Financing Tenure",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="MinimumFinanceTenure"
            value={editFormData.maximumFinancingTenure}
            onChange={handleInputChange}
          />
        ) : (
          row.maximumFinancingTenure
        ),
    }, //minimumFinancingTenure
    {
      name: "Maximum Financing Tenure",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="MaximumFinanceTenure"
            value={editFormData.maximumFinancingTenure}
            onChange={handleInputChange}
          />
        ) : (
          row.maximumFinancingTenure
        ),
    },
    // {
    //   name: "Status",
    //   selector: (row: any) =>
    //     editRowId === row.id ? (
    //       <Input
    //         name="Status"
    //         value={editFormData.Status}
    //         onChange={handleInputChange}
    //       />
    //     ) : (
    //       row.Status
    //     ),
    //   cell: (row: any) => (
    //     <div
    //       style={{
    //         padding: "0.22rem 1rem",
    //         borderRadius: "2px",
    //         backgroundColor:
    //           row.Status === "Active"
    //             ? "rgba(146, 188, 131, 1)"
    //             : "rgba(55, 52, 53, 1)",
    //         color: "rgba(255, 255, 255, 1)",
    //         cursor: row.Status === "Active" ? "pointer" : "default",
    //       }}
    //     >
    //       {row.Status === "Active" ? "Active" : "Inactive"}
    //     </div>
    //   ),
    // },
    {
      name: "Actions",

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
  const languageApi = async () => {
    try {
      const res = await getLanguage();
      if (res) {
        const data = res.data.data;
        setLanguage(data);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  const countryApi = async () => {
    try {
      const res = await getAllCountries();
      if (res) {
        const data = res.data.data;
        setCountry(data);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  const occupationApi = async () => {
    try {
      const res = await GetAllOccupations(page, pageSize);
      if (res) {
        const data = res.data.data;
        setOccupation(data);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  };
  const cityApi = async () => {
    try {
      const res = await getCities();
      if (res) {
        const data = res.data.data;
        setCities(data);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
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

  return (
    <>
      <div style={{ width: "100%", height: "100vh", overflow: "hidden" }}>
        <iframe
          src="https://dev-financial-management.xintdev.com/login"
          title="Embedded Login"
          style={{
            width: "100%",
            height: "100%",
            border: "none",
          }}
          allowFullScreen
        />
      </div>
    </>
  );
};

export default ProductManagement;
