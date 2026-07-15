import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Dropdown, Menu, Select } from "antd";
import TableView from "../TableView/TableView";
import { FaFilter, FaSearch } from "react-icons/fa";
import { Images } from "../Config/Images";
import { getRolesList } from "../../redux/apis/apisCrud";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import arrowDown from "../../assets/images/arrow-down.png";
import { useNavigate } from "react-router-dom";

const Role = () => {
  const { t } = useTranslation("adminMisc");
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any>([]);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [pageSize, setPageSize] = useState(15);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleMenuClick = (key: string) => {
    setSelectedItem(key);
    setIsModalVisible(true);
  };

  const menu = (row: any) => (
    <Menu>
      <Menu.Item
        key="edit"
        icon={<EditOutlined />}
        onClick={() => handleMenuClick("edit")}
      >
        {t("common:edit")}
      </Menu.Item>
      <Menu.Item
        key="delete"
        icon={<DeleteOutlined />}
        onClick={() => handleMenuClick("delete")}
      >
        {t("common:delete")}
      </Menu.Item>
    </Menu>
  );
  // Close popup when clicking outside
  const Activity_Loans_Header = [
    {
      name: t("ui.sr"),
      selector: (row: { Id: any }) => row.Id,
      width: "15%",
      sortable: true,
      // cell: (row: any) => (
      //   <div
      //     onClick={() => {
      //       navigate("/Customers/CustomerDetails/123");
      //     }}
      //   >
      //     {row.Id}
      //   </div>
      // ),
    },
    {
      name: t("role.col.role"),
      width: "75%",
      selector: (row: { Name: any }) => row.Name,
      sortable: true,
    },

    {
      name: t("common:actions"),
      width: "10%",
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
            {t("common:select")} <img src={arrowDown} alt="" />
          </Button>
        </Dropdown>
      ),
    },
  ];
  useEffect(() => {
    getAllRoles();
  }, [page, pageSize]);
  const getAllRoles = async () => {
    setSkelitonLoading(true);
    try {
      const res = await getRolesList(page, pageSize);
      if (res) {
        const data = res.data.data;
        setData(data || []);
        setSkelitonLoading(false);
        setTotalRows(data.length || 0);
        setFrom(1);
        setTo(data.length || 0);
        setPage(1);
        setTotalPage(1);
      }
    } catch (error: any) {
      console.error("Error fetching roles:", error);
      setSkelitonLoading(false);
    }
  };
  const mappedData =
    data &&
    data?.map((item: any, index: any) => {
      return {
        Id: index + 1,
        Name: item?.name,
        // accountBalance: item?.aft_detail?.accountBalance,
        // applicationNo: item?.applicationNo,
        // accountType: item?.aft_detail?.accountType,
        // accountStatus: item?.aft_detail?.accountStatus,
      };
    });

  return (
    <div className="service">
      <div className="d-flex justify-content-end  col-12">
        <Select
          mode="tags"
          style={{ width: "15%", borderTopRightRadius: "0px" }}
          // onChange={handleChange}
          placeholder={t("common:filter")}
          tokenSeparators={[","]}
          suffixIcon={<FaFilter />}

          // options={options}
        />

        <div className="d-flex gap-2 w-100">
          <div className="d-flex align-items-center gap-1 border px-2 ps-3 search-box">
            <img src={Images.searchIconGray} alt="" />
            <input
              type="text"
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
              }}
              className="p-2"
              placeholder={t("ui.searchPlaceholder")}
            />
          </div>

          <button
            className="theme-btn"
            onClick={() => {
              navigate("/UserRoleManagement/AddRole");
            }}
          >
            {t("role.addBtn")}
          </button>
        </div>
      </div>
      <TableView
        header={Activity_Loans_Header}
        data={mappedData}
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
  );
};

export default Role;
