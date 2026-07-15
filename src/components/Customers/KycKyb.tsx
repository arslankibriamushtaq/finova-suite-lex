import { useEffect, useState } from "react";
import { FaSearchengin } from "react-icons/fa";
import { Button, Dropdown, Input, Menu } from "antd";
import TableView from "../TableView/TableView";
import { useNavigate } from "react-router-dom";
import { getAllKycKyb, getAllRealations } from "../../redux/apis/apisCrudLms";
import toast from "react-hot-toast";

import { DownOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import Loader from "../Loader/Loader";
import { useTranslation } from "react-i18next";
const KycKyb = () => {
  const { t } = useTranslation("customersB");
  const [searchValue, setSearchValue] = useState("");
  const [editRowId, setEditRowId] = useState(null);
  const [value, setValue] = useState();
  const [editFormData, setEditFormData] = useState<any>({});
  const [frozenColumns, setFrozenColumns] = useState<string[]>([]);
  const [allCustomer, setAllCustomer] = useState<any>();
  const [allReason, setAllReason] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const navigate = useNavigate();
  const [skelitonLoading, setSkelitonLoading] = useState(false);

  const handleView = (row: any) => {
    navigate(`/view/viewdetails/Individuals/${row.CustomerID}`);
  };

  const handleLogs = (row: any) => {
    navigate(`/lms/accountLogs/${row.KybId}`);
  };

  const handleEditClick = (row: any) => {
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
    } else if (key === "logs") {
      handleLogs(row);
    }
  };
  const menu = (row: any) => (
    <Menu onClick={({ key }: any) => handleChange(key, row)}>
      <Menu.Item key="delete" icon={<EyeOutlined />}>
        {t("common:view")}
      </Menu.Item>
      <Menu.Item key="logs" icon={<EyeOutlined />}>
        {t("customersB:kyc.accountLogs")}
      </Menu.Item>
    </Menu>
  );
  const customSearchInput = (
    <Input
      placeholder={t("customersB:kyc.searchCustomers")}
      value={searchValue}
      prefix={<FaSearchengin />}
      onChange={(e: any) => setSearchValue(e.target.value)}
    />
  );
  const button = [
    // { title: "edit", onClick: handleClick },
    // { title: "view", onClick: handleView },
    { title: "Close" },
  ];

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
    {
      name: t("customersB:kyc.kycId"),
      selector: (row: any) =>
        editRowId === row.KycId ? (
          <Input
            name="KycId"
            value={editFormData.KycId}
            onChange={handleInputChange}
          />
        ) : (
          row.KycId.split("-")[0]
        ),
      frozen: frozenColumns.includes("KYC ID"),
    },
    {
      name: "",
      // selector: (row: {}) => row,
    },
    {
      name: t("customersB:kyc.kybId"),
      selector: (row: any) =>
        editRowId === row.KybId ? (
          <Input
            name="KybId"
            value={editFormData.KybId}
            onChange={handleInputChange}
          />
        ) : (
          row.KybId.split("-")[0]
        ),
      frozen: frozenColumns.includes("KYB ID"),
    },
    {
      name: "",
      // selector: (row: {}) => row,
    },
    {
      name: t("customersB:kyc.channelId"),
      selector: (row: any) =>
        editRowId === row.ChannelId ? (
          <Input
            name="ChannelId"
            value={editFormData.ChannelId}
            onChange={handleInputChange}
          />
        ) : (
          row.ChannelId.split("-")[0]
        ),
      frozen: frozenColumns.includes("Channel ID"),
    },
    {
      name: "",
      // selector: (row: {}) => row,
    },
    {
      name: t("customersB:kyc.accountId"),
      selector: (row: any) =>
        editRowId === row.AccountId ? (
          <Input
            name="AccountId"
            value={editFormData.AccountId}
            onChange={handleInputChange}
          />
        ) : (
          row.AccountId.split("-")[0]
        ),
      frozen: frozenColumns.includes("Account ID"),
    },
    {
      name: "",
      // selector: (row: {}) => row,
    },
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
      const res = await getAllKycKyb(page, pageSize);
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
        KycId: item.kycId || "-",
        KybId: item.kybId || "-",
        ChannelId: item.chennelId || "-",
        IndividualId: item.individualId || "-",
        AccountId: item.accountId || "-",
      };
    });

  useEffect(() => {
    handleAllReason();
    individualCustomer();
    return () => { };
  }, [page, pageSize]);
  return (
    <>
      {loading && <Loader />}
      <div>
        <div className="col-11 mb-4 ">
          <h3>{t("customersB:kyc.title")}</h3>
        </div>
        <div className="col-12">
          {/* <TableHeaderFilter
            button={button}
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
    </>
  );
};

export default KycKyb;
