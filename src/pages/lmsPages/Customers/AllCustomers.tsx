import { useEffect, useState } from "react";
import {
  Col,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
  Tabs,
  Tab,
} from "react-bootstrap";
import { Checkbox, Input, Select, Dropdown, Menu, Button } from "antd";
import TableView from "../../../components/TableView/TableView";
import { ErrorMessage, Field, Form, Formik, useFormikContext } from "formik";
import * as Yup from "yup";
import BuisnessModal from "../../../components/Customers/Modals/BuisnessModal";
import { useNavigate } from "react-router-dom";
import {
  GetAllOccupations,
  createAdress,
  createEmployement,
  createIndividualsEmployee,
  getCustomerServiceList,
} from "../../../redux/apis/apisCrudLms";
import {
  ClockCircleOutlined,
  DownOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import toast from "react-hot-toast";
import Loader from "../../../components/Loader/Loader";
import { themeStyle } from "../../../components/Config/Theme";
import { RootState } from "../../../redux/rootReducer";
import { useSelector } from "react-redux";

const AllCustomers = () => {
  const [currentTab, setCurrentTab] = useState("individualInfo");
  const tabOrder = [
    "individualInfo",
    "optional",
    "identificationDetails",
    "personalAddressDetails",
    "employementDetails",
  ];
  const states = useSelector((state: RootState) => state.block.states);
  const cities = useSelector((state: RootState) => state.block.cities);
  const language = useSelector((state: RootState) => state.block.languages);
  const country = useSelector((state: RootState) => state.block.countries);
  const allRelations = useSelector((state: RootState) => state.block.relations);
  const [addCustomerModal, setAddCustomerModal] = useState(false);
  const [individualModal, setIndividualModal] = useState(false);
  const [customerValue, setCustomerValue] = useState("individuals");
  const [buisnessForm, setBusinessForm] = useState(false);
  const [editRowId, setEditRowId] = useState(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [buisnessCustomers, setBuinsessCustomers] = useState<any>([]);
  const [occupation, setOccupation] = useState<any>();
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [to, setTo] = useState(0);
  const [from, setFrom] = useState(0);
  const navigate = useNavigate();
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  // Handle form input changes dynamically
  const handleInputChange = (event: any) => {
    const { name, value } = event.target;
    setEditFormData({ ...editFormData, [name]: value });
  };
  const [loading, setLoading] = useState(false);
  const MyStepButtons = () => {
    const { values, validateForm, setFieldTouched, setFieldValue } = useFormikContext<any>();
    const handleStepSubmit = async () => {
      const errors = await validateForm();

      // If any field in current tab has error, don't proceed
      const currentFields = tabFieldMap[currentTab as keyof typeof tabFieldMap] as string[];
      const hasErrors = currentFields.some((field: any) => errors[field]);

      if (hasErrors) {
        // Touch fields so errors show
        currentFields.forEach((field: any) => setFieldTouched(field, true));
        return;
      }

      // Now you can safely submit step data
      switch (currentTab) {
        case "identificationDetails":
          const payload1 = {
            type: 1,
            tenantId: "9a2b9110-bee8-426d-e898-08dc816bf110",
            individualDto: {
              name: values.name,
              relationId: values.relationId,
              ssn: "656-65-9976",
              nationalId: values.nationalId,
              nationalIdIssuanceDate: formatDatePayload(
                values.nationalIdIssuanceDate
              ),
              nidExpiryDate: formatDatePayload(values.nidExpiryDate),
              dob: formatDatePayload(values.dob),
              gender: values.gender ? values.gender : 1,
              email: values.email,
              languageId: values.languageId ? values.languageId : 1,
              language: getLanguageById(values.languageId),
              maritalStatus: values.maritalStatus,
              disability: values.disability,
              skip: values.skip.toString(),
              stopCorrespondance: values.stopCorrespondance ? true : false,
              activeMilitaryDuty: values.activeMilitaryDuty,
              timeZone: values.timeZone,
              motherMaidenName: values.motherMaidenName,
              visaNumber: values.visaNumber,
              licenseNumber: values.licenseNumber,
              licenseIssueDate: formatDatePayload(values.licenseIssueDate),
              licenseExpiryDate: formatDatePayload(values.licenseExpiryDate),
              passportNumber: values.passportNumber,
              passportIssueDate: formatDatePayload(values.passportIssueDate),
              passportExpiryDate: formatDatePayload(values.passportExpiryDate),
              prNumber: values.prNumber,
              education: values.education,
              bankcruptcy: values.bankcruptcy,
              privacyOptOut: values.privacyOptOut,
              insuranceOptOut: values.insuranceOptOut,
              marketingOtpOut: values.marketingOtpOut,
              sharedCreditOtpOut: values.sharedCreditOtpOut,
              nationality: values.nationality,
              isPoliticallyExposed: values.isPoliticallyExposed,
              deceaseDate: "2100-01-01T05:00:00.000Z",
              birthPlaceId: values.birthPlace,
              birthPlace: getCountryById(values.birthPlace),
              birthCountryId: values.birthCountry,
              birthCountry: getCountryById(values.birthCountry),
              issueedPowerOfAttorney:
                values.issueedPowerOfAttorney.toString() || "false",
            },
          };
          await toast.promise(
            createIndividualsEmployee(payload1), // API call
            {
              loading: "Creating individual account...", // While request is pending
              success: (response) => {
                if (
                  response?.data?.notificationMessage === "Operation successful."
                ) {
                  setFieldValue('customerId', response?.data?.data?.customerId);
                  setFieldValue('individualId', response?.data?.data?.id);
                  const currentIndex = tabOrder.indexOf(currentTab);
                  if (currentIndex < tabOrder.length - 1) {
                    setCurrentTab(tabOrder[currentIndex + 1]);
                  }

                  return "Individual account created successfully";
                } else {
                  throw new Error(
                    response?.data?.errors?.errors[0] || "Failed to create account."
                  );
                }
              },
              error: (err) =>
                err?.message ||
                "Something went wrong while creating the individual account.",
            }
          );
          break;
        case "personalAddressDetails":
          const payload2 = {
            customerId: values.customerId,
            type: values.type ? values.type : 1,
            current: values.current,
            confirmed: values.confirmed,
            permissionToCall: values.permissionToCall,
            mailing: values.mailing,
            addrs: values.addrs,
            phone: values.phone,
            permissionToText: values.permissionToText,
            countryId: values.countryId ? values.countryId : 1,
            country: getCountryById(values.countryId),
            postalAddressType: values.postalAddressType,
            streetPre: values.streetPre,
            streetName: values.streetName,
            streetType: values.streetType,
            buildingNumber: values.buildingNumber,
            address1: values.address1,
            address2: values.address2,
            address3: values.address3,
            zip: values.zip,
            zipExtention: values.zipExtention,
            cityId: values.cityId,
            city: getCityById(values.city2),
            timeZone: values.timeZone1,
            comment: values.comment,
          }
          await toast.promise(
            createAdress(payload2), // API call
            {
              loading: "Adding address details...", // While request is pending
              success: (response) => {
                if (
                  response?.data?.notificationMessage === "Operation successful."
                ) {
                  const currentIndex = tabOrder.indexOf(currentTab);
                  if (currentIndex < tabOrder.length - 1) {
                    setCurrentTab(tabOrder[currentIndex + 1]);
                  }

                  return "Address details added successfully";
                } else {
                  throw new Error(
                    response?.data?.errors?.errors[0] || "Failed to add address details."
                  );
                }
              },
              error: (err) =>
                err?.message ||
                "Something went wrong while creating the adding address.",
            }
          );
          break;
        case "employementDetails":
          const payload3 = {
            individualId: values.individualId,
            current: values.current,
            permissionToCall: values.permissionToCall,
            permissionToText: values.permissionToText,
            type: values.type1 ? values.type1 : 1,
            employer: values.employer,
            occupationId: values.occupationId ? values.occupationId : 1,
            title: values.title,
            department: values.department,
            countryId: values.countryId1 ? values.countryId1 : 1,
            country: getCountryById(values.countryId1),
            address1: values.address4,
            address2: values.address5,
            zip: values.zip,
            zipExtention: values.zipExtention1,
            cityId: values.cityId,
            city: getCityById(values.cityId1),
            stateId: values.stateId,
            phone: values.phone1,
            extention: values.extention,
            comment: values.comment1,
            payDay: values.payDay,
            nextPayDay: formatDatePayload(values.nextPayDay),
            frequency: values.frequency,
          };
          await toast.promise(
            createEmployement(payload3), // API call
            {
              loading: "Adding employement details...", // While request is pending
              success: (response) => {
                if (
                  response?.data?.notificationMessage === "Operation successful."
                ) {
                  navigate("/lms/customers/individuals");
                  return "Employement details added successfully";
                } else {
                  throw new Error(
                    response?.data?.errors?.errors[0] || "Failed to add employement details."
                  );
                }
              },
              error: (err) =>
                err?.message ||
                "Something went wrong while creating the adding employement details.",
            }
          );
          break;
      }
    };

    return (
      <Button
        className="application-btn" onClick={handleStepSubmit}>
        Submit Step
      </Button>
    );
  };

  const getAllCustomers = async () => {
    try {
      setSkelitonLoading(true);
      const response = await getCustomerServiceList(page - 1, pageSize);
      if (response) {
        const values = Array.isArray(response?.data?.data) ? response.data.data : [];
        setBuinsessCustomers(values);
        const pagination = response?.data?.pagination;
        const totalItems = pagination?.totalElements || 0;
        const currentPage = (pagination?.page ?? 0) + 1;
        const currentPageSize = pagination?.size || pageSize;

        setPage(currentPage);
        setPageSize(currentPageSize);

        const calculatedFrom = (currentPage - 1) * currentPageSize + 1;
        const calculatedTo = Math.min(currentPage * currentPageSize, totalItems);

        setFrom(calculatedFrom);
        setTo(calculatedTo);
        setTotalRows(totalItems);
      }
    } catch (error: any) {
      toast.error(error?.message);
    } finally {
      setSkelitonLoading(false);
    }
  };

  /* const getAllStates = async () => {
    try {
      const response = await allState();
      if (response) {
        const values = response?.data?.data;

        setStates(values);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  }; */
  const mappedData =
    buisnessCustomers &&
    buisnessCustomers.map((item: any) => {
      return {
        id: item.id,
        accountNumber: item.accountNumber,
        CustomerID: item.cifNumber || item.customerId || "-",
        NationalId: item.nationalId || item.nid || "-",
        Name: item.fullName || item.name || "-",
        Type: item.customerType || item.type || "-",
        PhoneNo: item.mobileNumber || item.phoneNo || "-",
        Email: item.email && item.email.toLowerCase() !== 'string' ? item.email : "-",
        PartnerName: item.channel || "-",
        status: item.status || "-",
        date: item.createdAt || item.date || "-",
        cif: item.cifNumber || item.cif || "-",
        isBlocked: item.isBlocked || item.is_blocked || false,
        blockCode: Array.isArray(item.blockCodes) && item.blockCodes.length > 0 ? item.blockCodes[0] : null,
        blockCodes: item.blockCodes || [],
      };
    });
  useEffect(() => {
    //languageApi();
    //getAllStates();
    occupationApi();
    //cityApi();
    //handleAllReason();
    //countryApi();
  }, []);
  useEffect(() => {
    getAllCustomers();
  }, [pageSize, page]);

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
    if (row.Type == "Individual") {
      navigate(`/view/edit/Individuals/${row.CustomerID}`);
    } else {
      navigate(`/view/edit/buisness/${row.CustomerID}`);
    }
  };
  const handleAccountTimeline = (row: any) => {
    navigate(`/view/accountTimeline/${row.nationalId}/${row.CustomerID}`);
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
      handleEditClick(row);
    } else if (key === "view") {
      // handleView(row);
      navigate(`/lms/Customers/InvoiceManagement/${row.accountNumber}`);
    } else if (key === "accountTimeline") {
      navigate(`/view/accountTimeLine/${row?.nationalId}/${row.CustomerID}`);
    }
  };

  const menu = (row: any) => (
    <Menu onClick={({ key }: any) => handleChange(key, row)}>
      {/* <Menu.Item key="edit" icon={<EditOutlined />}>
        Edit
      </Menu.Item> */}
      <Menu.Item key="view" icon={<EyeOutlined />}>
        View Applications
      </Menu.Item>
      {/* <Menu.Item key="accountTimeline" icon={<ClockCircleOutlined />}>
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
  const getCityById = (id: any) => {
    let entry: any = "Not found";
    cities?.map((item: any) => {
      if (item.id === id) entry = item.name;
    });
    return entry;
  };
  const getLanguageById = (id: any) => {
    let entry: any = "Not found";
    language?.map((item: any) => {
      if (item.id === id) entry = item.name;
    });
    return entry;
  };

  const getCountryById = (id: any) => {
    let entry: any = "Not found";
    country?.map((item: any) => {
      if (item.id === id) entry = item.name;
    });
    return entry;
  };

  const handleSubmit = async (formField: any) => {
    const tenantId = localStorage.getItem("tenantId");
    const body = {
      type: 1,
      tenantId: "9a2b9110-bee8-426d-e898-08dc816bf110",
      individualDto: {
        name: formField.name,
        relationId: formField.relationId,
        ssn: "656-65-9976",
        nationalId: formField.nationalId,
        nationalIdIssuanceDate: formatDatePayload(
          formField.nationalIdIssuanceDate
        ),
        nidExpiryDate: formatDatePayload(formField.nidExpiryDate),
        dob: formatDatePayload(formField.dob),
        gender: formField.gender ? formField.gender : 1,
        email: formField.email,
        languageId: formField.languageId ? formField.languageId : 1,
        language: getLanguageById(formField.languageId),
        maritalStatus: formField.maritalStatus,
        disability: formField.disability,
        skip: formField.skip.toString(),
        stopCorrespondance: formField.stopCorrespondance ? true : false,
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
        deceaseDate: "2100-01-01T05:00:00.000Z",
        birthPlaceId: formField.birthPlace,
        birthPlace: getCountryById(formField.birthPlace),
        birthCountryId: formField.birthCountry,
        birthCountry: getCountryById(formField.birthCountry),
        issueedPowerOfAttorney:
          formField.issueedPowerOfAttorney.toString() || "false",
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
        country: getCountryById(formField.countryId),
        address1: formField.address4,
        address2: formField.address5,
        zip: formField.zip,
        zipExtention: formField.zipExtention,
        cityId: formField.cityId,
        city: getCityById(formField.cityId),
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
        country: getCountryById(formField.countryId1),
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
        city: getCityById(formField.city2),
        timeZone: formField.timeZone1,
        comment: formField.comment1,
      },
    };
    // Use toast.promise for automatic loading, success, and error handling
    await toast.promise(
      createIndividualsEmployee(body), // API call
      {
        loading: "Creating individual account...", // While request is pending
        success: (response) => {
          if (
            response?.data?.notificationMessage === "Operation successful."
          ) {
            navigate("/lms/customers/individuals");
            return "Individual account created successfully";
          } else {
            throw new Error(
              response?.data?.errors?.errors[0] || "Failed to create account."
            );
          }
        },
        error: (err) =>
          err?.message ||
          "Something went wrong while creating the individual account.",
      }
    );
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
    /*  NationalityEnum: [
       { value: 1, label: "United States" },
       { value: 2, label: "Canada" },
       { value: 3, label: "United Kingdom" },
       { value: 4, label: "Australia" },
       { value: 5, label: "India" },
       { value: 6, label: "Brazil" },
       { value: 7, label: "China" },
       { value: 8, label: "Japan" },
       { value: 9, label: "Germany" },
       { value: 10, label: "France" },
       // Add more countries as needed with numeric values
     ], */

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
      name: "CIF",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="CIF"
            value={editFormData.cif}
            onChange={handleInputChange}
          />
        ):row.cif
        },
    {
      name: "Name",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="Name"
            value={editFormData.Name}
            onChange={handleInputChange}
          />
        ) : (
          <span style={{ whiteSpace: 'break-spaces' }}>{row.Name}</span>
        ),
    },
    {
      name: "Type",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="Type"
            value={editFormData.Type}
            onChange={handleInputChange}
          />
        ) : (
          row.Type
        ),
    },
    {
      name: "Customer ID",
      selector: (row: any) =>
        editRowId === row.id ? (
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
      name: "Partner Name",
      selector: (row: any) =>
        editRowId === row.id ? (
          <Input
            name="PartnerName"
            value={editFormData.PartnerName}
            onChange={handleInputChange}
          />
        ) : (
          row.PartnerName
        ),
    },
    {
      name: "Email",
      selector: (row: any) =>
        editRowId === row.id ? (
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
      name: "Status",
      selector: (row: any) =>
        editRowId === row.id ? (
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
            borderRadius: "6px",
            backgroundColor:
              row.status
                ? "var(--color-status-green)"
                : "var(--color-status-dark)",
            color: "var(--primary-foreground)",
            cursor: row.status === "Active" ? "pointer" : "default",
          }}
        >
          {row.status ? "Active" : "Inactive"}
        </div>
      ),
    },
    {
      name: "Blocked",
      cell: (row: any) => (
        row.isBlocked
          ? <span style={{ padding: "0.22rem 0.75rem", borderRadius: "6px", backgroundColor: "var(--color-status-red, #fee2e2)", color: "#dc2626", fontSize: "0.75rem", fontWeight: 600 }}>Blocked</span>
          : <span style={{ padding: "0.22rem 0.75rem", borderRadius: "6px", backgroundColor: "var(--color-status-green)", color: "var(--primary-foreground)", fontSize: "0.75rem", fontWeight: 600 }}>Clear</span>
      ),
      width: "110px",
    },
    {
      name: "Block Code",
      cell: (row: any) => row.blockCode
        ? <span style={{ display: "inline-flex", alignItems: "center", borderRadius: "9999px", background: "var(--muted)", padding: "0.125rem 0.625rem", fontSize: "0.75rem", fontWeight: 500 }}>{row.blockCode}</span>
        : <span style={{ color: "var(--muted-foreground)", fontSize: "0.75rem" }}>—</span>,
      width: "140px",
    },
    {
      name: "Actions",

      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button
            className="gradient-btn"
            type="primary"
            style={{
              borderColor: "white",
              borderRadius: "6px",
              padding: "10px 20px",
            }}
          >
            Select <DownOutlined />
          </Button>
        </Dropdown>
      ),
    },
  ];
  /*  const languageApi = async () => {
     try {
       const res = await getLanguage();
       if (res) {
         const data = res.data.data;
         setLanguage(data);
       }
     } catch (error: any) {
       toast.error(error?.message);
     }
   }; */
  /* const countryApi = async () => {
    try {
      const res = await getAllCountries();
      if (res) {
        const data = res.data.data;
        setCountry(data);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  }; */
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
  /*   const cityApi = async () => {
      try {
        const res = await getCities();
        if (res) {
          const data = res.data.data;
          setCities(data);
        }
      } catch (error: any) {
        toast.error(error?.message);
      }
    }; */
  /* const handleAllReason = async () => {
    try {
      const res = await getAllRealations(page, pageSize);
      if (res) {
        const data = res.data.data;
        setAllReason(data);
      }
    } catch (error: any) {
      toast.error(error?.message);
    }
  }; */

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    relationId: Yup.string().required("Relation is required"),
    ssn: Yup.string().required("SSN is required"),
    nationalId: Yup.string().required("National ID is required"),
    nationalIdIssuanceDate: Yup.date().required(
      "National ID issuance date is required"
    ),
    nidExpiryDate: Yup.date().required("National ID expiry date is required"),
    dob: Yup.date().required("Date of birth is required"),
    gender: Yup.number().required("Gender is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    languageId: Yup.string()
      .uuid("Invalid language ID")
      .required("Language ID is required"),
    maritalStatus: Yup.number()
      .oneOf([1, 2, 3], "Invalid marital status")
      .required("Marital status is required"),
    disability: Yup.number()
      .oneOf([1, 2], "Disability status is required")
      .required("Disability status is required"),

    activeMilitaryDuty: Yup.boolean().required(
      "Active military duty status is required"
    ),
    timeZone: Yup.string().required("Time zone is required"),
    motherMaidenName: Yup.string().required("Mother's maiden name is required"),
    visaNumber: Yup.string().required("Visa number is required"),
    licenseNumber: Yup.string().required("License number is required"),
    licenseIssueDate: Yup.date().required("License issue date is required"),
    licenseExpiryDate: Yup.date().required("License expiry date is required"),
    passportNumber: Yup.string().required("Passport number is required"),
    passportIssueDate: Yup.date().required("Passport issue date is required"),
    passportExpiryDate: Yup.date().required("Passport expiry date is required"),
    prNumber: Yup.string().required("PR number is required"),
    education: Yup.number()
      .oneOf([1, 2, 3, 4, 5, 6, 7], "Invalid education level")
      .required("Education level is required"),
    bankcruptcy: Yup.number()
      .oneOf([1, 2], "Bankruptcy status must be 0 or 1")
      .required("Bankruptcy status is required"),
    nationality: Yup.string().required("Nationality is required"),
    isPoliticallyExposed: Yup.number()
      .oneOf([1, 2], "Politically exposed status must be 2 or 1")
      .required("Politically exposed status is required"),
    birthPlace: Yup.string().required("Birth place is required"),
    birthCountry: Yup.string().required("Birth country is required"),
    employer: Yup.string().required("Employer is required"),
    title: Yup.string().required("Title is required"),
    department: Yup.string().required("Department is required"),
    address1: Yup.string().required("Address line 1 is required"),
    address2: Yup.string(),
    zip: Yup.string().required("ZIP code is required"),
    addrs: Yup.string().required("Address is required"),
    phone: Yup.string().required("Phone number is required"),
    postalAddressType: Yup.string().required("Postal address type is required"),
    buildingNumber: Yup.string().required("Building number is required"),
  });

  const handleCheckboxChange = (e: any, setFieldValue: any) => {
    const { name, checked } = e.target;
    setFieldValue(name, checked);
  };

  const handleNext = async (
    validateForm: any,
    setFieldTouched: any,
    currentTabFields: any
  ) => {
    // Mark all fields in the current tab as touched
    currentTabFields.forEach((field: any) => setFieldTouched(field, true));

    // Validate the form
    const errors = await validateForm();

    // Check for errors in the current tab's fields
    const hasErrors = currentTabFields.some((field: any) => errors[field]);

    if (!hasErrors) {
      const currentIndex = tabOrder.indexOf(currentTab);
      if (currentIndex < tabOrder.length - 1) {
        setCurrentTab(tabOrder[currentIndex + 1]);
      }
    } else {
      return;
    }
  };

  const handlePrevious = () => {
    const currentIndex = tabOrder.indexOf(currentTab);
    if (currentIndex > 0) {
      setCurrentTab(tabOrder[currentIndex - 1]);
    }
  };

  const handleTabSelect = async (
    selectedTab: any,
    validateForm: any,
    setFieldTouched: any,
    tabFieldMap: any
  ) => {
    // Validate current tab fields
    const currentTabFields = tabFieldMap[currentTab]; // currentTab is the active tab state
    currentTabFields.forEach((field: any) => setFieldTouched(field, true)); // Mark fields as touched
    const errors = await validateForm(); // Get validation errors

    const hasErrors = currentTabFields.some((field: any) => errors[field]);

    if (!hasErrors) {
      // No errors, allow tab change
      setCurrentTab(selectedTab); // Update the current tab state
    } else {
      return;
    }
  };

  const tabFieldMap: any = {
    individualInfo: [
      "name",
      "relationId",
      "dob",
      "maritalStatus",
      "languageId",
      "motherMaidenName",
      "email",
      "disability",
      "bankcruptcy",
      "gender",
      "timeZone",
      "education",
    ],
    optional: [],
    identificationDetails: [
      "passportNumber",
      "passportIssueDate",
      "passportExpiryDate",
      "visaNumber",
      "nationalId",
      "nationalIdIssuanceDate",
      "nidExpiryDate",
      "licenseNumber",
      "licenseIssueDate",
      "licenseExpiryDate",
      "prNumber",
      "nationality",
      "birthPlace",
      "birthCountry",
    ],
    personalAddressDetails: [
      "addrs",
      "phone",
      "postalAddressType",
      "buildingNumber",
      "address1",
      "address2",
      "zip",
    ],
    employementDetails: [
      "employer",
      "title",
      "department",
      "countryId",
      "address4", // Assuming for employment address
      "phone1", // Employment phone number
      "type1",
      "zip1",
      "zipExtention1",
      "city2",
      "stateId",
    ],
  };

  return (
    <>
      {loading && <Loader />}
      <div>
        <div className="d-flex col-12 mb-3">
          <div className="col-10">
            <div className="d-flex align-items-center col-6 justify-content-between mt-1"
              style={{ fontSize: "15px", fontWeight: "Bold" }}>
              All Customers

            </div>
          </div>
          <div className="col-2 d-flex justify-content-end align-items-center">
            <button
              className="theme-btn-next"
              onClick={() => {
                // setAddCustomerModal(true);
                setIndividualModal(true);
              }}
            >
              Add Customer
            </button>
          </div>
        </div>

        <TableView
          setPage={setPage}
          setPageSize={setPageSize}
          page={page}
          pageSize={pageSize}
          totalRows={totalRows}
          to={to}
          from={from}
          header={Customer_ALL_List_Header}
          data={mappedData}
          isLoading={skelitonLoading}
        />
        {buisnessCustomers?.length == 0 && !skelitonLoading && (
          <div className="d-flex justify-content-center mt-5 bg-red">
            No data found
          </div>
        )}

        <Modal
          centered
          show={addCustomerModal}
          onHide={() => {
            setAddCustomerModal(false);
          }}
          backdrop="static"
        >
          <ModalHeader
            style={{ fontSize: "16px", fontWeight: 600 }}
            closeButton
          >
            Select Customer Type
          </ModalHeader>

          <ModalBody className="modal-body-scroll">
            <div className="col-12">
              <label className="d-flex mb-2 customer-fs-fw">Type</label>
              <Select
                value={customerValue}
                placeholder={customerValue}
                onChange={handleValueChange}
                className="d-flex col-10 justify-content-center align-items-center"
              >
                {customerOptions.map((item: any) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </Select>

              <div className="mt-5 d-flex justify-content-center">
                <button
                  className="theme-btn-next"
                  onClick={handleControlModal}
                  style={{ backgroundColor: themeStyle.secondary }}
                >
                  Continue
                </button>
              </div>
            </div>
          </ModalBody>
        </Modal>
        <Modal
          show={individualModal}
          size="lg"
          onHide={() => {
            setIndividualModal(false);
          }}
          backdrop="static"
        >
          <ModalHeader closeButton></ModalHeader>
          <Formik
            initialValues={{
              individualId: "",
              customerId: "",
              name: "",
              relationId: "",
              ssn: "",
              nationalId: "",
              nationalIdIssuanceDate: "",
              nidExpiryDate: "",
              dob: "",
              gender: "",
              email: "",
              languageId: "",
              maritalStatus: "",
              disability: "",
              skip: "",
              stopCorrespondance: "",
              activeMilitaryDuty: false,
              timeZone: "",
              timeZone1: "",
              addressComment: "",
              motherMaidenName: "",
              visaNumber: "",
              licenseNumber: "",
              licenseIssueDate: "",
              licenseExpiryDate: "",
              passportNumber: "",
              passportIssueDate: "",
              passportExpiryDate: "",
              prNumber: "",
              education: "",
              bankcruptcy: "",
              privacyOptOut: false,
              insuranceOptOut: false,
              marketingOtpOut: false,
              sharedCreditOtpOut: false,
              nationality: "",
              isPoliticallyExposed: "",
              deceaseDate: "",
              birthPlace: "",
              address5: "",
              address4: "",
              birthCountry: "",
              issueedPowerOfAttorney: false,
              employmentId: "",
              current: false,
              permissionToCall: false,
              permissionToText: false,
              type: "",
              type1: "",
              employer: "",
              occupationId: "",
              title: "",
              department: "",
              countryId: "",
              countryId1: "",
              address1: "",
              address2: "",
              zip: "",
              zipExtention: "",
              zip1: "",
              zipExtention1: "",
              cityId: "",
              city2: "",
              stateId: "",
              phone: "",
              phone1: "",
              extention: "",
              comment: "",
              comment1: "",
              payDay: "",
              nextPayDay: "",
              frequency: "",
              addressId: "",
              confirmed: false,
              mailing: false,
              addrs: "",
              postalAddressType: "",
              streetPre: "",
              streetName: "",
              streetType: "",
              buildingNumber: "",
              address3: "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          // validateOnChange={true}
          // validateOnBlur={true}
          >
            {({
              handleChange,
              setFieldValue,
              validateForm,
              setFieldTouched,
            }) => {
              return (
                <Form className="p-2">
                  <Modal.Body
                    className="modal-body-scroll"
                    style={{
                      maxHeight: "85vh",
                      overflowY: "auto",
                      marginBottom: "14px",
                      overflowX: "hidden",
                    }}
                  >
                    <Tabs
                      defaultActiveKey="individualInfo"
                      className="mb-3 py-4"
                      style={{ width: "max-content" }}
                      activeKey={currentTab}
                      onSelect={(selectedTab) =>
                        handleTabSelect(
                          selectedTab,
                          validateForm,
                          setFieldTouched,
                          tabFieldMap
                        )
                      }
                    >
                      <Tab
                        eventKey="individualInfo"
                        title="Individual Information"
                        style={{ marginRight: "10px" }}
                      >
                        <Row>
                          <Col md={6}>
                            <label
                              htmlFor="name"
                              className="mb-1 customer-fs-fw"
                            >
                              Name<span className="bg-red"> *</span>
                            </label>
                            <Field
                              placeholder="Name"
                              id="name"
                              type="text"
                              name="name"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="name"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                          <Col md={6}>
                            <label
                              htmlFor="relationId"
                              className="mb-1 customer-fs-fw"
                            >
                              Relation<span className="bg-red"> *</span>
                            </label>
                            <Field
                              as="select"
                              placeholder="Relation"
                              id="relationId"
                              name="relationId"
                              className="form-control"
                            >
                              <option value="" label="Select relation" />
                              {allRelations &&
                                allRelations.map((reason: any) => (
                                  <option
                                    key={reason.id}
                                    value={reason.id}
                                    label={reason.name}
                                  />
                                ))}
                            </Field>
                            <ErrorMessage
                              name="relationId"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                        </Row>
                        <Row className="pt-2">
                          <Col md={6}>
                            <label
                              htmlFor="dob"
                              className="mb-1 customer-fs-fw"
                            >
                              DOB<span className="bg-red"> *</span>
                            </label>
                            <Field
                              placeholder="DOB"
                              id="dob"
                              type="date"
                              name="dob"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="dob"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                          <Col md={6}>
                            <label
                              htmlFor="maritalStatus"
                              className="mb-1 customer-fs-fw"
                            >
                              Marital Status
                              <span className="bg-red"> *</span>
                            </label>
                            <Field
                              as="select"
                              placeholder="Marital Status"
                              id="maritalStatus"
                              name="maritalStatus"
                              className="form-control"
                              onChange={(e: any) =>
                                handleChange({
                                  target: {
                                    name: e.target.name,
                                    value: Number(e.target.value),
                                  },
                                })
                              }
                            >
                              <option value="" label="Select marital status" />
                              {enums.MaritalStatus.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </Field>
                            <ErrorMessage
                              name="maritalStatus"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                        </Row>
                        <Row className="pt-2">
                          <Col md={6}>
                            <label
                              htmlFor="languageId"
                              className="mb-1 customer-fs-fw"
                            >
                              Language<span className="bg-red"> *</span>
                            </label>
                            <Field
                              as="select"
                              placeholder="Language"
                              id="languageId"
                              name="languageId"
                              className="form-control"
                            >
                              <option value="" label="Select type" />
                              {language &&
                                language.map((item: any) => (
                                  <option key={item.id} value={item.id}>
                                    {item.name}
                                  </option>
                                ))}
                            </Field>
                            <ErrorMessage
                              name="languageId"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                          <Col md={6}>
                            <label
                              htmlFor="motherMaidenName"
                              className="mb-1 customer-fs-fw"
                            >
                              Mother Maiden Name
                              <span className="bg-red"> *</span>
                            </label>
                            <Field
                              placeholder="Mother Maiden Name"
                              id="motherMaidenName"
                              type="text"
                              name="motherMaidenName"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="motherMaidenName"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                        </Row>
                        <Row className="pt-2">
                          <Col md={6}>
                            <label
                              htmlFor="email"
                              className="mb-1 customer-fs-fw"
                            >
                              Email<span className="bg-red"> *</span>
                            </label>
                            <Field
                              placeholder="Email"
                              id="email"
                              type="text"
                              name="email"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="email"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                          <Col md={6} className="mt-4">
                            <Checkbox
                              className=""
                              id="stopCorrespondance"
                              name="stopCorrespondance"
                              onChange={(e) =>
                                handleCheckboxChange(e, setFieldValue)
                              }
                            />
                            <label
                              htmlFor="stopCorrespondance"
                              className="mb-1 ms-3 customer-fs-fw"
                            >
                              Stop Correspondence
                            </label>
                            <ErrorMessage
                              name="stopCorrespondance"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                        </Row>
                        <Row className="pt-2">
                          <Col md={6}>
                            <label
                              htmlFor="disability"
                              className="mb-1 customer-fs-fw"
                            >
                              Disability<span className="bg-red"> *</span>
                            </label>
                            <Field
                              as="select"
                              placeholder="Disability"
                              id="disability"
                              name="disability"
                              className="form-control"
                              onChange={(e: any) =>
                                handleChange({
                                  target: {
                                    name: e.target.name,
                                    value: Number(e.target.value),
                                  },
                                })
                              }
                            >
                              <option
                                value=""
                                label="Select disability status"
                              />
                              {enums.Disability.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </Field>
                            <ErrorMessage
                              name="disability"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                          <Col md={6} className="mt-4">
                            <Checkbox
                              id="skip"
                              name="skip"
                              onChange={(e) =>
                                handleCheckboxChange(e, setFieldValue)
                              }
                            />
                            <label
                              htmlFor="skip"
                              className="mb-1 ms-3 customer-fs-fw"
                            >
                              Skip
                            </label>
                            <ErrorMessage
                              name="skip"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                        </Row>
                        <Row className="pt-2">
                          <Col md={6}>
                            <label
                              htmlFor="bankruptcy"
                              className="mb-1 customer-fs-fw"
                            >
                              Bankruptcy<span className="bg-red"> *</span>
                            </label>
                            <Field
                              as="select"
                              placeholder="Bankruptcy"
                              id="bankcruptcy"
                              name="bankcruptcy"
                              className="form-control"
                              onChange={(e: any) =>
                                handleChange({
                                  target: {
                                    name: e.target.name,
                                    value: Number(e.target.value),
                                  },
                                })
                              }
                            >
                              <option
                                value=""
                                label="Select bankruptcy status"
                              />
                              {enums.Bankruptcy.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </Field>
                            <ErrorMessage
                              name="bankcruptcy"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                          <Col md={6}>
                            <label
                              htmlFor="gender"
                              className="mb-1 customer-fs-fw"
                            >
                              Gender<span className="bg-red"> *</span>
                            </label>
                            <Field
                              as="select"
                              placeholder="Gender"
                              id="gender"
                              name="gender"
                              className="form-control"
                              onChange={(e: any) =>
                                handleChange({
                                  target: {
                                    name: e.target.name,
                                    value: Number(e.target.value),
                                  },
                                })
                              }
                            >
                              <option value="" label="Select type" />
                              {enums.Gender.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </Field>
                            <ErrorMessage
                              name="gender"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                        </Row>
                        <Row className="pt-2">
                          <Col md={6}>
                            <label
                              htmlFor="timeZone"
                              className="mb-1 customer-fs-fw"
                            >
                              Time Zone<span className="bg-red"> *</span>
                            </label>
                            <Field
                              as="select"
                              placeholder="Time Zone"
                              id="timeZone"
                              name="timeZone"
                              className="form-control"
                            >
                              <option value="" label="Select Time Zone" />
                              {enums.TimeZone.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </Field>
                            <ErrorMessage
                              name="timeZone"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                          <Col md={6}>
                            <label
                              htmlFor="education"
                              className="mb-1 customer-fs-fw"
                            >
                              Education<span className="bg-red"> *</span>
                            </label>
                            <Field
                              as="select"
                              placeholder="Education"
                              id="education"
                              name="education"
                              className="form-control"
                              onChange={(e: any) =>
                                handleChange({
                                  target: {
                                    name: e.target.name,
                                    value: Number(e.target.value),
                                  },
                                })
                              }
                            >
                              <option value="" label="Select education level" />
                              {enums.Education.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </Field>
                            <ErrorMessage
                              name="education"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                        </Row>
                        <Row className="pt-2">
                          <Col md={6}>
                            <label
                              htmlFor="deceaseDate"
                              className="mb-1 customer-fs-fw"
                            >
                              Decease Date
                            </label>
                            <Field
                              placeholder="Decease Date"
                              id="deceaseDate"
                              type="date"
                              name="deceaseDate"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="deceaseDate"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                        </Row>
                      </Tab>
                      <Tab eventKey="optional" title="Optional">
                        <Row>
                          <Col md={4}>
                            <div className=" d-flex align-items-center">
                              <Checkbox
                                type="checkbox"
                                name="privacyOptOut"
                                id="privacyOptOut"
                                onChange={(e) =>
                                  handleCheckboxChange(e, setFieldValue)
                                }
                              />
                              <label
                                htmlFor="privacyOptOut"
                                className="ms-2 customer-fs-fw"
                              >
                                Privacy Opt-in
                              </label>
                            </div>
                          </Col>
                          <Col md={4}>
                            <div className="d-flex align-items-center">
                              <Checkbox
                                type="checkbox"
                                name="insuranceOptOut"
                                id="insuranceOptOut"
                                onChange={(e) =>
                                  handleCheckboxChange(e, setFieldValue)
                                }
                              />
                              <label
                                htmlFor="insuranceOptOut"
                                className="ms-2 customer-fs-fw"
                              >
                                Insurance Opt-in
                              </label>
                            </div>
                          </Col>
                          <Col md={4}>
                            <div className=" d-flex align-items-center">
                              <Checkbox
                                type="checkbox"
                                name="marketingOtpOut"
                                id="marketingOtpOut"
                                onChange={(e) =>
                                  handleCheckboxChange(e, setFieldValue)
                                }
                              />
                              <label
                                htmlFor="marketingOtpOut"
                                className="ms-2 customer-fs-fw"
                              >
                                Marketing Opt-in
                              </label>
                            </div>
                          </Col>
                          <Col md={4} className="mt-4 mb-4">
                            <div className=" d-flex align-items-center">
                              <Checkbox
                                type="checkbox"
                                name="sharedCreditOtpOut"
                                id="sharedCreditOtpOut"
                                onChange={(e) =>
                                  handleCheckboxChange(e, setFieldValue)
                                }
                              />
                              <label
                                htmlFor="sharedCreditOtpOut"
                                className="ms-2 customer-fs-fw"
                              >
                                Share Credit Opt-in
                              </label>
                            </div>
                          </Col>
                        </Row>
                      </Tab>
                      <Tab
                        eventKey="identificationDetails"
                        title="Identification Details"
                      >
                        <Row className="pt-2">
                          <Col md={6}>
                            <label
                              htmlFor="passportNumber"
                              className="mb-1 customer-fs-fw"
                            >
                              Passport Number
                              <span className="bg-red"> *</span>
                            </label>
                            <Field
                              placeholder="Passport Number"
                              id="passportNumber"
                              type="text"
                              name="passportNumber"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="passportNumber"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                          <Col md={6}>
                            <label
                              htmlFor="passportIssueDate"
                              className="mb-1 customer-fs-fw"
                            >
                              Passport Issue Date
                              <span className="bg-red"> *</span>
                            </label>
                            <Field
                              placeholder="Passport Issue Date"
                              id="passportIssueDate"
                              type="date"
                              name="passportIssueDate"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="passportIssueDate"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                        </Row>

                        <Row className="pt-2">
                          <Col md={6}>
                            <label
                              htmlFor="passportExpiryDate"
                              className="mb-1 customer-fs-fw"
                            >
                              Passport Expiry Date
                              <span className="bg-red"> *</span>
                            </label>
                            <Field
                              placeholder="Passport Expiry Date"
                              id="passportExpiryDate"
                              type="date"
                              name="passportExpiryDate"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="passportExpiryDate"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                          <Col md={6}>
                            <label
                              htmlFor="visaNumber"
                              className="mb-1 customer-fs-fw"
                            >
                              Visa Number
                              <span className="bg-red"> *</span>
                            </label>
                            <Field
                              placeholder="Visa Number"
                              id="visaNumber"
                              type="text"
                              name="visaNumber"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="visaNumber"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                        </Row>

                        <Row className="pt-2">
                          <Col md={6}>
                            <label
                              htmlFor="nationalId"
                              className="mb-1 customer-fs-fw"
                            >
                              National ID
                              <span className="bg-red"> *</span>
                            </label>
                            <Field
                              placeholder="National ID"
                              id="nationalId"
                              type="text"
                              name="nationalId"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="nationalId"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                          <Col md={6}>
                            <label
                              className="mb-1"
                              style={{
                                fontSize: "14px",
                                fontWeight: 600,
                              }}
                            >
                              Nationality
                              <span className="bg-red"> *</span>
                            </label>
                            <Field
                              as="select"
                              name="nationality"
                              className="form-control"
                              onChange={(e: any) =>
                                setFieldValue("nationality", e.target.value)
                              }
                            >
                              <option label="Select Nationality" />
                              {/* Assuming languageId is an array from props */}
                              {country &&
                                country.map((item: any) => (
                                  <option
                                    key={item.id}
                                    value={item.id}
                                    label={item.name ? item.name : "-"}
                                  />
                                ))}
                            </Field>
                            <ErrorMessage
                              name="nationality"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                        </Row>

                        <Row className="pt-2">
                          <Col md={6}>
                            <label
                              htmlFor="nationalIdIssuanceDate"
                              className="mb-1 customer-fs-fw"
                            >
                              NID Issue Date
                              <span className="bg-red"> *</span>
                            </label>
                            <Field
                              placeholder="NID Issue Date"
                              id="nationalIdIssuanceDate"
                              type="date"
                              name="nationalIdIssuanceDate"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="nationalIdIssuanceDate"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                          <Col md={6}>
                            <label
                              htmlFor="nidExpiryDate"
                              className="mb-1 customer-fs-fw"
                            >
                              NID Expiry Date
                              <span className="bg-red"> *</span>
                            </label>
                            <Field
                              placeholder="NID Expiry Date"
                              id="nidExpiryDate"
                              type="date"
                              name="nidExpiryDate"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="nidExpiryDate"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                        </Row>

                        <Row className="pt-2">
                          <Col md={6}>
                            <label
                              htmlFor="licenseNumber"
                              className="mb-1 customer-fs-fw"
                            >
                              License Number
                              <span className="bg-red"> *</span>
                            </label>
                            <Field
                              placeholder="License Number"
                              id="licenseNumber"
                              type="text"
                              name="licenseNumber"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="licenseNumber"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                          <Col md={6}>
                            <label
                              htmlFor="licenseIssueDate"
                              className="mb-1 customer-fs-fw"
                            >
                              License Issue Date
                              <span className="bg-red"> *</span>
                            </label>
                            <Field
                              placeholder="License Issue Date"
                              id="licenseIssueDate"
                              type="date"
                              name="licenseIssueDate"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="licenseIssueDate"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                        </Row>

                        <Row className="pt-2">
                          <Col md={6}>
                            <label
                              htmlFor="licenseExpiryDate"
                              className="mb-1 customer-fs-fw"
                            >
                              License Expiry Date
                              <span className="bg-red"> *</span>
                            </label>
                            <Field
                              placeholder="License Expiry Date"
                              id="licenseExpiryDate"
                              type="date"
                              name="licenseExpiryDate"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="licenseExpiryDate"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                          <Col md={6}>
                            <label
                              htmlFor="ssn"
                              className="mb-1 customer-fs-fw"
                            >
                              SSN
                            </label>
                            <Field
                              placeholder="SSN"
                              id="ssn"
                              type="text"
                              name="ssn"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="ssn"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                        </Row>

                        <Row className="pt-2">
                          <Col md={6}>
                            <label
                              htmlFor="prNumber"
                              className="mb-1 customer-fs-fw"
                            >
                              PR Number<span className="bg-red"> *</span>
                            </label>
                            <Field
                              placeholder="PR Number"
                              id="prNumber"
                              type="text"
                              name="prNumber"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="prNumber"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                          <Col md={6} className="mt-4">
                            <Checkbox
                              className=""
                              id="activeMilitaryDuty"
                              name="activeMilitaryDuty"
                              onChange={(e) =>
                                handleCheckboxChange(e, setFieldValue)
                              }
                            />
                            <label
                              htmlFor="activeMilitaryDuty"
                              className="mb-1 ms-3"
                              style={{ fontSize: "14px" }}
                            >
                              Active Military Duty
                            </label>
                            <ErrorMessage
                              name="activeMilitaryDuty"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                        </Row>
                        <Row className="pt-2">
                          <h3>FATCA Section</h3>
                          <Col md={6}>
                            <label
                              htmlFor="birthPlace"
                              className="mb-1 customer-fs-fw"
                            >
                              Birth Place
                              <span className="bg-red"> *</span>
                            </label>
                            <Field
                              as="select"
                              placeholder="Birth Place"
                              id="birthPlace"
                              name="birthPlace"
                              className="form-control"
                            >
                              <option value="" label="Select type" />
                              {cities &&
                                cities.map((item: any) => (
                                  <option key={item.id} value={item.id}>
                                    {item.name}
                                  </option>
                                ))}
                            </Field>

                            <ErrorMessage
                              name="birthPlace"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                          <Col md={6}>
                            <label
                              htmlFor="birthCountry"
                              className="mb-1 customer-fs-fw"
                            >
                              Birth Country
                              <span className="bg-red"> *</span>
                            </label>
                            <Field
                              as="select"
                              placeholder="Birth Country"
                              id="birthCountry"
                              name="birthCountry"
                              className="form-control"
                            >
                              <option label="Select Country"></option>
                              {country &&
                                country.map((item: any) => (
                                  <option
                                    key={item.id}
                                    value={item.id}
                                    label={item.name ? item.name : "-"}
                                  />
                                ))}
                            </Field>
                            <ErrorMessage
                              name="birthCountry"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                        </Row>
                        <Row className="pt-2">
                          <Col md={6} className="mb-4">
                            <label
                              htmlFor="isPoliticallyExposed"
                              className="mb-1 customer-fs-fw"
                            >
                              Is Politically Exposed
                            </label>
                            <Field
                              as="select"
                              placeholder="Is Politically Exposed"
                              id="isPoliticallyExposed"
                              name="isPoliticallyExposed"
                              className="form-control"
                              onChange={(e: any) =>
                                handleChange({
                                  target: {
                                    name: e.target.name,
                                    value: Number(e.target.value),
                                  },
                                })
                              }
                            >
                              <option value="" label="Select type" />
                              {enums.IsPoliticallyExposed.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </Field>
                            <ErrorMessage
                              name="isPoliticallyExposed"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                        </Row>
                        <Row className="pt-2 p-2 col-12  border-bottom ">
                          <h3>Power of Attorney</h3>
                          <Col md={6} className="mb-4">
                            <Checkbox
                              id="issueedPowerOfAttorney"
                              name="issueedPowerOfAttorney"
                              onChange={(e) =>
                                handleCheckboxChange(e, setFieldValue)
                              }
                            />
                            <label
                              htmlFor="issueedPowerOfAttorney"
                              className="mb-1 ms-3 customer-fs-fw"
                            >
                              Issued Power of Attorney
                            </label>

                            <ErrorMessage
                              name="issueedPowerOfAttorney"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                        </Row>
                      </Tab>
                      <Tab
                        eventKey="personalAddressDetails"
                        title="Personal Address Details"
                      >
                        <Row>
                          <Col md={6} className="mb-4">
                            <label
                              htmlFor="addrs"
                              className="mb-1 customer-fs-fw"
                            >
                              Address<span className="bg-red"> *</span>
                            </label>
                            <Field
                              placeholder="Address"
                              id="addrs"
                              type="text"
                              name="addrs"
                              className="form-control"
                            />

                            <ErrorMessage
                              name="addrs"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                          <Col md={6} className="mb-2">
                            <label
                              htmlFor="phone"
                              className="mb-1 customer-fs-fw"
                            >
                              Phone<span className="bg-red"> *</span>
                            </label>
                            <Field
                              placeholder="Phone"
                              id="phone"
                              type="text"
                              name="phone"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="phone"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                        </Row>
                        <Row className="pt-2 p-4">
                          <Col md={4}>
                            <div className=" d-flex align-items-center">
                              <Checkbox
                                type="checkbox"
                                name="mailing"
                                id="mailing"
                                onChange={(e) =>
                                  handleCheckboxChange(e, setFieldValue)
                                }
                              />
                              <label
                                htmlFor="mailing"
                                className="ms-2 customer-fs-fw"
                              >
                                Mailing
                              </label>
                            </div>
                          </Col>
                          <Col md={4}>
                            <div className=" d-flex align-items-center">
                              <Checkbox
                                type="checkbox"
                                name="current"
                                id="current"
                                onChange={(e) =>
                                  handleCheckboxChange(e, setFieldValue)
                                }
                              />
                              <label
                                htmlFor="current"
                                className="ms-2 customer-fs-fw"
                              >
                                Current
                              </label>
                            </div>
                          </Col>
                          <Col md={4}>
                            <div className=" d-flex align-items-center">
                              <Checkbox
                                type="checkbox"
                                name="confirmed"
                                id="confirmed"
                                onChange={(e) =>
                                  handleCheckboxChange(e, setFieldValue)
                                }
                              />
                              <label
                                htmlFor="confirmed"
                                className="ms-2 customer-fs-fw"
                              >
                                Confirmed
                              </label>
                            </div>
                          </Col>
                        </Row>
                        <Row className="mt-4 p-2">
                          <Col md={6} className="mb-4">
                            <label
                              htmlFor="type"
                              className="mb-1 customer-fs-fw"
                            >
                              Type
                            </label>
                            <Field
                              as="select"
                              placeholder="Type"
                              id="type"
                              name="type"
                              className="form-control"
                              onChange={(e: any) =>
                                handleChange({
                                  target: {
                                    name: e.target.name,
                                    value: Number(e.target.value),
                                  },
                                })
                              }
                            >
                              <option value="" label="Select type" />
                              {enums.Type.map((item) => (
                                <option key={item.value} value={item.value}>
                                  {item.label}
                                </option>
                              ))}
                            </Field>
                            <ErrorMessage
                              name="type"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                          <Col md={6} className="mb-2">
                            <label
                              htmlFor="postalAddressType"
                              className="mb-1 customer-fs-fw"
                            >
                              Postal Address Type
                              <span className="bg-red"> *</span>
                            </label>
                            <Field
                              as="select"
                              placeholder="Postal Address Type"
                              id="postalAddressType"
                              name="postalAddressType"
                              className="form-control"
                            >
                              <option
                                value=""
                                label="Select postal address type"
                              />
                              {enums.AddressType.map((item) => (
                                <option key={item.value} value={item.value}>
                                  {item.label}
                                </option>
                              ))}
                            </Field>
                            <ErrorMessage
                              name="postalAddressType"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                        </Row>
                        <Row className="pt-1 p-3">
                          <Col md={4}>
                            <div className=" d-flex align-items-center">
                              <Checkbox
                                type="checkbox"
                                name="permissionToCall"
                                id="permissionToCall"
                                onChange={(e) =>
                                  handleCheckboxChange(e, setFieldValue)
                                }
                              />
                              <label
                                htmlFor="permissionToCall"
                                className="ms-2 customer-fs-fw"
                              >
                                Permission to Call
                              </label>
                            </div>
                          </Col>
                          <Col md={4}>
                            <div className=" d-flex align-items-center">
                              <Checkbox
                                type="checkbox"
                                id="permissionToText"
                                name="permissionToText"
                                onChange={(e) =>
                                  handleCheckboxChange(e, setFieldValue)
                                }
                              />
                              <label
                                htmlFor="permissionToText"
                                className="ms-2 customer-fs-fw"
                              >
                                Permission to Text
                              </label>
                            </div>
                          </Col>
                        </Row>
                        <Row className="mt-2">
                          <Col md={6}>
                            <label
                              htmlFor="countryId"
                              className="mb-1 customer-fs-fw"
                            >
                              Country
                            </label>
                            <Field
                              as="select"
                              placeholder="Country"
                              id="countryId"
                              name="countryId"
                              className="form-control"
                            >
                              <option value="" label="Select type" />
                              {country &&
                                country.map((item: any) => (
                                  <option key={item.id} value={item.id}>
                                    {item.name}
                                  </option>
                                ))}
                            </Field>
                            <ErrorMessage
                              name="countryId"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                          <Col md={6}>
                            <label
                              htmlFor="streetPre"
                              className="mb-1 customer-fs-fw"
                            >
                              Street Pre
                            </label>
                            <Field
                              placeholder="Street Pre"
                              id="streetPre"
                              type="text"
                              name="streetPre"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="streetPre"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                        </Row>

                        <Row className="pt-2">
                          <Col md={6}>
                            <label
                              htmlFor="streetName"
                              className="mb-1 customer-fs-fw"
                            >
                              Street Name
                            </label>
                            <Field
                              placeholder="Street Name"
                              id="streetName"
                              type="text"
                              name="streetName"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="streetName"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                          <Col md={6}>
                            <label
                              htmlFor="streetType"
                              className="mb-1 customer-fs-fw"
                            >
                              Street Type
                            </label>
                            <Field
                              placeholder="Street Type"
                              id="streetType"
                              type="text"
                              name="streetType"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="streetType"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                        </Row>

                        <Row className="pt-2">
                          <Col md={6}>
                            <label
                              htmlFor="buildingNumber"
                              className="mb-1 customer-fs-fw"
                            >
                              Building Number
                              <span className="bg-red"> *</span>
                            </label>
                            <Field
                              placeholder="Building Number"
                              id="buildingNumber"
                              type="text"
                              name="buildingNumber"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="buildingNumber"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                          <Col md={6}>
                            <label
                              htmlFor="address1"
                              className="mb-1 customer-fs-fw"
                            >
                              Address 1<span className="bg-red"> *</span>
                            </label>
                            <Field
                              placeholder="Address 1"
                              id="address1"
                              type="text"
                              name="address1"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="address1"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                        </Row>

                        <Row className="pt-2">
                          <Col md={6}>
                            <label
                              htmlFor="address2"
                              className="mb-1 customer-fs-fw"
                            >
                              Address 2<span className="bg-red"> *</span>
                            </label>
                            <Field
                              placeholder="Address 2"
                              id="address2"
                              type="text"
                              name="address2"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="address2"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                          <Col md={6}>
                            <label
                              htmlFor="address3"
                              className="mb-1 customer-fs-fw"
                            >
                              Address 3
                            </label>
                            <Field
                              placeholder="Address 3"
                              id="address3"
                              type="text"
                              name="address3"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="address3"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                        </Row>

                        <Row className="pt-2">
                          <Col md={6}>
                            <label
                              htmlFor="zip"
                              className="mb-1 customer-fs-fw"
                            >
                              Zip<span className="bg-red"> *</span>
                            </label>
                            <Field
                              placeholder="Zip"
                              id="zip"
                              type="text"
                              name="zip"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="zip"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                          <Col md={6}>
                            <label
                              htmlFor="zipExtention"
                              className="mb-1 customer-fs-fw"
                            >
                              Zip Extension
                            </label>
                            <Field
                              placeholder="Zip Extension"
                              id="zipExtention"
                              type="text"
                              name="zipExtention"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="zipExtention"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                        </Row>

                        <Row className="pt-2">
                          <Col md={6}>
                            <label
                              htmlFor="cityId"
                              className="mb-1 customer-fs-fw"
                            >
                              City
                            </label>
                            <Field
                              as="select"
                              placeholder="City"
                              id="cityId"
                              name="cityId"
                              className="form-control"
                            >
                              <option value="" label="Select type" />
                              {cities &&
                                cities.map((item: any) => (
                                  <option key={item.id} value={item.id}>
                                    {item.name}
                                  </option>
                                ))}
                            </Field>
                            <ErrorMessage
                              name="cityId"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                          <Col md={6}>
                            <label
                              htmlFor="timeZone"
                              className="mb-1 customer-fs-fw"
                            >
                              Time Zone
                            </label>
                            <Field
                              placeholder="Time Zone"
                              id="timeZone1"
                              as="select"
                              name="timeZone1"
                              className="form-control"
                            >
                              <option value="" label="Select Time Zone" />
                              {enums.TimeZone.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </Field>
                            <ErrorMessage
                              name="timeZone1"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                        </Row>

                        <Row className="pt-2">
                          <Col md={6}>
                            <label
                              htmlFor="comment"
                              className="mb-1 customer-fs-fw"
                            >
                              Comment
                            </label>
                            <Field
                              placeholder="Comment"
                              id="comment"
                              type="text"
                              name="comment"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="comment"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                        </Row>
                      </Tab>
                      <Tab
                        eventKey="employementDetails"
                        title="Current Employement Details"
                      >
                        <Row className="pt-3 p-2">
                          <Col md={6}>
                            <label
                              htmlFor="address1"
                              className="mb-1 customer-fs-fw"
                            >
                              Address<span className="bg-red"> *</span>
                            </label>
                            <Field
                              placeholder="address"
                              id="address4"
                              type="text"
                              name="address4"
                              className="form-control"
                            />

                            <ErrorMessage
                              name="address4"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                          <Col md={6}>
                            <label
                              htmlFor="phone"
                              className="mb-1 customer-fs-fw"
                            >
                              Phone Number
                              <span className="bg-red"> *</span>
                            </label>
                            <Field
                              placeholder="phone"
                              id="phone1"
                              type="text"
                              name="phone1"
                              className="form-control"
                            />

                            <ErrorMessage
                              name="phone1"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                          <Col md={4} className="pt-4 mb-3">
                            <div className=" d-flex align-items-center">
                              <Checkbox
                                type="checkbox"
                                name="current"
                                id="current"
                                onChange={(e) =>
                                  handleCheckboxChange(e, setFieldValue)
                                }
                              />
                              <label
                                htmlFor="current"
                                className="ms-2 customer-fs-fw"
                              >
                                Current
                              </label>
                            </div>
                          </Col>
                          <Col md={4} className="pt-4 mb-3">
                            <div className=" d-flex align-items-center">
                              <Checkbox
                                type="checkbox"
                                name="permissionToCall"
                                id="permissionToCall"
                                onChange={(e) =>
                                  handleCheckboxChange(e, setFieldValue)
                                }
                              />
                              <label
                                htmlFor="permissionToCall"
                                className="ms-2 customer-fs-fw"
                              >
                                Permission to Call
                              </label>
                            </div>
                          </Col>
                          <Col md={4} className="pt-4 mb-3">
                            <div className=" d-flex align-items-center">
                              <Checkbox
                                type="checkbox"
                                name="permissionToText"
                                id="permissionToText"
                                onChange={(e) =>
                                  handleCheckboxChange(e, setFieldValue)
                                }
                              />
                              <label
                                htmlFor="permissionToText"
                                className="ms-2 customer-fs-fw"
                              >
                                Permission to Text
                              </label>
                            </div>
                          </Col>
                        </Row>
                        <Row className="pt-3"></Row>
                        <Row className="pt-2 ">
                          <Col md={6}>
                            <label
                              htmlFor="type"
                              className="mb-1 customer-fs-fw"
                            >
                              Type<span className="bg-red"> *</span>
                            </label>
                            <Field
                              as="select"
                              placeholder="Type"
                              id="type1"
                              name="type1"
                              className="form-control"
                              onChange={(e: any) =>
                                handleChange({
                                  target: {
                                    name: e.target.name,
                                    value: Number(e.target.value),
                                  },
                                })
                              }
                            >
                              <option value="" label="Select type" />
                              {enums.Type.map((item) => (
                                <option key={item.value} value={item.value}>
                                  {item.label}
                                </option>
                              ))}
                            </Field>
                            <ErrorMessage
                              name="type1"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                          <Col md={6}>
                            <label
                              htmlFor="employer"
                              className="mb-1 customer-fs-fw"
                            >
                              Employer<span className="bg-red"> *</span>
                            </label>
                            <Field
                              placeholder="Employer"
                              id="employer"
                              type="text"
                              name="employer"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="employer"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                        </Row>

                        <Row className="pt-2">
                          <Col md={6}>
                            <label
                              htmlFor="occupationId"
                              className="mb-1 customer-fs-fw"
                            >
                              Occupation
                            </label>
                            <Field
                              as="select"
                              placeholder="Occupation"
                              id="occupationId"
                              name="occupationId"
                              className="form-control"
                            >
                              <option value="" label="Select type" />
                              {occupation &&
                                occupation.map((item: any) => (
                                  <option key={item.id} value={item.id}>
                                    {item.name}
                                  </option>
                                ))}
                            </Field>
                            <ErrorMessage
                              name="occupationId"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                          <Col md={6}>
                            <label
                              htmlFor="title"
                              className="mb-1 customer-fs-fw"
                            >
                              Title<span className="bg-red"> *</span>
                            </label>
                            <Field
                              placeholder="Title"
                              id="title"
                              type="text"
                              name="title"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="title"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                        </Row>

                        <Row className="pt-2">
                          <Col md={6}>
                            <label
                              htmlFor="department"
                              className="mb-1 customer-fs-fw"
                            >
                              Department<span className="bg-red"> *</span>
                            </label>
                            <Field
                              placeholder="Department"
                              id="department"
                              type="text"
                              name="department"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="department"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                          <Col md={6}>
                            <label
                              htmlFor="countryId"
                              className="mb-1 customer-fs-fw"
                            >
                              Country<span className="bg-red"> *</span>
                            </label>
                            <Field
                              as="select"
                              placeholder="Country"
                              id="countryId1"
                              name="countryId1"
                              className="form-control"
                            >
                              <option value="" label="Select type" />
                              {country &&
                                country.map((item: any) => (
                                  <option key={item.id} value={item.id}>
                                    {item.name ? item.name : "-"}
                                  </option>
                                ))}
                            </Field>
                            <ErrorMessage
                              name="countryId"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                        </Row>

                        <Row className="pt-2">
                          <Col md={6}>
                            <label
                              htmlFor="address2"
                              className="mb-1 customer-fs-fw"
                            >
                              Address 1
                            </label>
                            <Field
                              placeholder="Address"
                              id="address5"
                              type="text"
                              name="address5"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="address5"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                          <Col md={6}>
                            <label
                              htmlFor="zip"
                              className="mb-1 customer-fs-fw"
                            >
                              ZIP<span className="bg-red"> *</span>
                            </label>
                            <Field
                              placeholder="ZIP"
                              id="zip1"
                              type="text"
                              name="zip1"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="zip1"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                        </Row>

                        <Row className="pt-2">
                          <Col md={6}>
                            <label
                              htmlFor="zipExtension"
                              className="mb-1 customer-fs-fw"
                            >
                              ZIP Extension
                              <span className="bg-red"> *</span>
                            </label>
                            <Field
                              placeholder="ZIP Extension"
                              id="zipExtention1"
                              type="text"
                              name="zipExtention1"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="zipExtension1"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                          <Col md={6}>
                            <label
                              htmlFor="cityId"
                              className="mb-1 customer-fs-fw"
                            >
                              City<span className="bg-red"> *</span>
                            </label>
                            <Field
                              as="select"
                              placeholder="City"
                              id="city2"
                              name="city2"
                              className="form-control"
                            >
                              <option value="" label="Select type" />
                              {cities &&
                                cities.map((item: any) => (
                                  <option key={item.id} value={item.id}>
                                    {item.name}
                                  </option>
                                ))}
                            </Field>
                            <ErrorMessage
                              name="city2"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                        </Row>

                        <Row className="pt-2">
                          <Col md={6}>
                            <label
                              htmlFor="stateId"
                              className="mb-1 customer-fs-fw"
                            >
                              State<span className="bg-red"> *</span>
                            </label>
                            <Field
                              as="select"
                              placeholder="State"
                              id="stateId"
                              name="stateId"
                              className="form-control"
                            >
                              <option value="" label="Select state" />
                              {states &&
                                states.map((item: any) => (
                                  <option key={item.id} value={item.id}>
                                    {item.name}
                                  </option>
                                ))}
                            </Field>
                            <ErrorMessage
                              name="stateId"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                          <Col md={6}>
                            <label
                              htmlFor="extention"
                              className="mb-1 customer-fs-fw"
                            >
                              Extension
                            </label>
                            <Field
                              placeholder="Extension"
                              id="extention"
                              type="text"
                              name="extention"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="extention"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                        </Row>

                        <Row className="pt-2">
                          <Col md={6}>
                            <label
                              htmlFor="comment"
                              className="mb-1 customer-fs-fw"
                            >
                              Comment
                            </label>
                            <Field
                              placeholder="Comment"
                              id="comment1"
                              type="text"
                              name="comment1"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="comment1"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                          <Col md={6}>
                            <label
                              htmlFor="payDay"
                              className="mb-1 customer-fs-fw"
                            >
                              Pay Day
                            </label>
                            <Field
                              as="select"
                              placeholder="Pay Day"
                              id="payDay"
                              name="payDay"
                              className="form-control"
                            >
                              <option value="" label="Select payday" />
                              {enums.payday.map((item) => (
                                <option key={item.value} value={item.value}>
                                  {item.label}
                                </option>
                              ))}
                            </Field>
                            <ErrorMessage
                              name="payDay"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                        </Row>

                        <Row className="pt-2">
                          <Col md={6}>
                            <label
                              htmlFor="nextPayDay"
                              className="mb-1 customer-fs-fw"
                            >
                              Next Pay Day
                            </label>
                            <Field
                              placeholder="Next Pay Day"
                              id="nextPayDay"
                              type="date"
                              name="nextPayDay"
                              className="form-control"
                            />
                            <ErrorMessage
                              name="nextPayDay"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                          <Col md={6}>
                            <label
                              htmlFor="frequency"
                              className="mb-1 customer-fs-fw"
                            >
                              Frequency
                            </label>
                            <Field
                              as="select"
                              placeholder="Frequency"
                              id="frequency"
                              name="frequency"
                              className="form-control"
                              onChange={(e: any) =>
                                handleChange({
                                  target: {
                                    name: e.target.name,
                                    value: Number(e.target.value),
                                  },
                                })
                              }
                            >
                              <option value="" label="Select frequency" />
                              {enums.Frequency.map((item) => (
                                <option key={item.value} value={item.value}>
                                  {item.label}
                                </option>
                              ))}
                            </Field>
                            <ErrorMessage
                              name="frequency"
                              component="div"
                              className="invalid-feedback text-danger"
                            />
                          </Col>
                        </Row>
                      </Tab>
                    </Tabs>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button
                      className="revert-btn"
                      onClick={handlePrevious}
                      disabled={currentTab === tabOrder[0]}
                    >
                      Previous
                    </Button>
                    {[
                      "identificationDetails",
                      "personalAddressDetails",
                      "employementDetails",
                    ].includes(currentTab) ? (
                      <MyStepButtons />
                    ) : (
                      <Button
                        className="application-btn"
                        onClick={() =>
                          handleNext(
                            validateForm,
                            setFieldTouched,
                            tabFieldMap[currentTab]
                          )
                        }
                      >
                        Next
                      </Button>
                    )}
                  </Modal.Footer>
                </Form>
              );
            }}
          </Formik>
        </Modal>

        <BuisnessModal
          setBusinessForm={setBusinessForm}
          buisnessForm={buisnessForm}
          customerValue={customerValue}
          setCustomerValue={setCustomerValue}
        />
      </div>
    </>
  );
};

export default AllCustomers;
