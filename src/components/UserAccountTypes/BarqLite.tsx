import { useEffect, useState } from "react";
import { Button, Dropdown, Form, Input, Menu, Modal, Select } from "antd";
import { useTranslation } from "react-i18next";
import TableView from "../TableView/TableView";
import { FaFilter } from "react-icons/fa";
import { Images } from "../Config/Images";
import { allCustomerStatusChange, getBarqLiteAccounts, } from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";
import arrowDown from "../../assets/images/arrow-down.png";
import { EditOutlined, EyeOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


const BarqLite = () => {
  const { t } = useTranslation("walletBlocks");
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [showDetailsFields, setShowDetailsFields] = useState(false);
  const [status, setStatus] = useState("Active");
  const [rowData, setRowData] = useState<any>({});


  const Activity_Loans_Header = [
    {
      name: t("accountTypes.col.sr"),
      selector: (row: { Sr: any }) => row.Sr,
      sortable: true,
      width: "100px"
    },
    {
      name: t("accountTypes.col.name"),
      selector: (row: { name: any }) => row.name,
      sortable: true,
      width: "250px"
    },
    {
      name: t("accountTypes.col.phone"),
      selector: (row: { phone: any }) => row.phone,
      sortable: true,
      width: "200px"
    },
    {
      name: t("accountTypes.col.gender"),
      selector: (row: { gender: any }) => row.gender,
      sortable: true,
    },
    {
        name: t("accountTypes.col.age"),
        selector: (row: { age: any }) => row.age,
        sortable: true,
    },
    {
      name: t("accountTypes.col.city"),
      selector: (row: { city: any }) => row.city,
      sortable: true,
    },
    
    /* {
      name: "Status",
      cell: (row: { status: any }) => (
        <div
          style={{
            padding: "8px 10px",
            borderRadius: "32px",
            fontSize: "12px",
            backgroundColor:
              row.status === "active"
                ? "rgba(63, 195, 128, 0.9)"
                : row.status === "inactive"
                ? "#F84D4D"
                : "transparent",
            color: "white",
            cursor: row.status === "active" ? "pointer" : "default",
          }}
        >
          {row.status.toUpperCase()}
        </div>
      ),
    }, */
    {
      name: t("accountTypes.col.actions"),

      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button
            className="gradient-btn"
            type="primary"
            style={{
              backgroundColor: "#c00000 !important",
              color: "#000000",
              borderColor: "white",
              borderRadius: "2px",
              padding: "10px 20px",
            }}
          >
            {t("wallets.select")} <img src={arrowDown} alt="" />
          </Button>
        </Dropdown>
      ),
    },
  ];
  const menu = (row: any) => (
    <Menu>
      <Menu.Item
        key="view"
        icon={<EyeOutlined/>}
        onClick={() => handleMenuClick("view", row)}
      >
        {t("common:viewDetails")}
      </Menu.Item>
      <Menu.Item
        key="edit"
        icon={<EditOutlined />}
        onClick={() => handleMenuClick("edit", row)}
      >
        {t("accountTypes.menu.changeStatus")}
      </Menu.Item>
    </Menu>
  );
  const handleMenuClick = (key: string, data: any) => {
    setSelectedItem(key);
    setRowData(data);
    setIsModalVisible(true);
  };

  const handleOk = () => {
    if (selectedItem === "details") {
    }
    setIsModalVisible(false);
    setShowDetailsFields(false); 
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setShowDetailsFields(false); 
  };

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
  
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
  
    // If birth month/date hasn't occurred yet this year, subtract 1
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
  
    return age;
  };
  

  const handleStatusChange = async (value: any) => {
    setStatus(value);

    try {
      const body = {
        user_id: value?.user_id,
        status: value?.accountStatus,
      };
      await toast.promise(
        allCustomerStatusChange(body), // The promise to track
        {
          loading: "Changing Status...", // Loading state message
          success: (res) => {
            if (res?.data?.success) {
              setIsModalVisible(false);
              getBarqLiteList();
              return res?.data?.message;
            } else if (res?.data?.errors) {
              throw new Error(res.data.errors[0]); // Force error handling
            }
          },
          error: (err) => {
            console.error("Error occurred:", err);
            return err?.message || "Something went wrong!";
          },
        }
      );
    } catch (error: any) {
      console.error("Error during login:", error);
    }
  };


  const getBarqLiteList = async () => {
    try {
      setSkelitonLoading(true);

      const response = await getBarqLiteAccounts(page, pageSize);
      if (response) {
        const data = response?.data?.data?.data;
        setData(data || []);
        setSkelitonLoading(false);
        setTotalRows(response?.data?.data?.total || 0);
        setFrom(response?.data?.data?.from || 0);
        setTo(response?.data?.data?.to || 0);
        setPage(response?.data?.data?.current_page);
        setTotalPage(response?.data?.data?.last_page);
      }
    } catch (error: any) {
      toast.error(error?.message);
      setSkelitonLoading(false);
    } finally {
      setSkelitonLoading(false);
    }
  };
  useEffect(() => {
    getBarqLiteList();
  }, [page, pageSize]);
  const mappedData =
    data &&
    data?.map((item: any, index) => {
      return {
        id:item.id || "-",
        Sr: index + from,
        name: item?.name,
        phone: item?.phone || "-",
        gender: item?.gender,
        city: item?.city || "N/A",
        dob: item?.date_of_birth,
        age: calculateAge(item?.date_of_birth) || "N/A",
        accountStatus: item?.aft_detail?.accountStatus || "-",
      };
    });
    const exportToExcel = () => {
      const worksheet = XLSX.utils.json_to_sheet(mappedData || []);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "BarqLite");
      XLSX.writeFile(workbook, "BarqLite.xlsx");
    };
  
    // Export to PDF
    const exportToPDF = () => {
      const doc = new jsPDF();
  
      const tableColumn = [
        t("accountTypes.col.sr"),
        t("accountTypes.col.name"),
        t("accountTypes.col.phone"),
        t("accountTypes.col.gender"),
        t("accountTypes.col.age"),
        t("accountTypes.col.city"),
      ];
  
      const tableRows = mappedData?.map((item: any) => [
        item.Sr,
        item.name,
        item.phone,
        item.gender,
        item.age,
        item.city,
      ]);
  
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
      });
  
      doc.save("BarqLite.pdf");
    };
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
              placeholder={t("accountTypes.searchPlaceholder")}
            />
          </div>

          <button className="invoice-btn" onClick={exportToExcel}>
            {t("accountTypes.excel")}
          </button>
          <button
            className="invoice-btn"
            onClick={() => {
              exportToPDF();
            }}
          >
            {t("accountTypes.pdf")}
          </button>
          <button className="invoice-btn">{t("accountTypes.print")}</button>
        </div>
      </div>

      <Modal maskClosable={false} keyboard={false}
        className="custom-mod"
        title={selectedItem === "edit" ? t("accountTypes.modal.changeStatus") : t("accountTypes.modal.enterDetails")}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button key="close" onClick={handleCancel}>
            {t("common:close")}
          </Button>,
          <Button
            key="save"
            type="primary"
            onClick={() => {
              selectedItem === "edit"
                ? handleStatusChange(rowData)
                : handleOk();
            }}
          >
            {selectedItem === "edit" ? t("common:save") : t("common:submit")}
          </Button>,
        ]}
      >
        <div className={selectedItem === "edit" ? "cust-drop" : "Ente-details"}>
          {selectedItem === "edit" ? (
            <>
              <label>{t("common:status")}</label>
              <Select
                defaultValue={rowData?.accountStatus}
                value={rowData?.accountStatus}
                style={{ width: "100%", marginTop: "10px" }}
                onChange={(value: string) => {
                  setRowData({
                    ...rowData,
                    accountStatus: value, // Directly use 'value'
                  });
                }}
              >
                <option value="active">{t("accountTypes.status.active")}</option>
                <option value="inactive">{t("accountTypes.status.inactive")}</option>
                <option value="pending">{t("accountTypes.status.pending")}</option>
              </Select>
              <p className="edit-mod">{t("accountTypes.editModalContent")}</p>
            </>
          ) : (
            <>
              <Form>
                <Form.Item name="username">
                  <div className="custom-input-container">
                    <label className="input-label">{t("accountTypes.form.username")}</label>
                    <Input placeholder={t("accountTypes.ph.username")} />
                  </div>
                </Form.Item>
                <Form.Item name="password">
                  <div className="custom-input-container">
                    <label className="input-label">{t("accountTypes.form.password")}</label>
                    <Input.Password placeholder={t("accountTypes.ph.password")} />
                  </div>
                </Form.Item>
              </Form>
            </>
          )}
        </div>
      </Modal>
      <TableView
        header={Activity_Loans_Header}
        data={mappedData}
        totalRows={totalRows}
        isLoading={skelitonLoading}
        from={from}
        page={page}
        totalPage={totalPage}
        setPage={setPage}
        setPageSize={setPageSize}
        pageSize={pageSize}
        to={to}
      />
    </div>
  );
};

export default BarqLite;
