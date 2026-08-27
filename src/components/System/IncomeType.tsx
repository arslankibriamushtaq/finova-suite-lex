import { useEffect, useState } from "react";
import { Button, Dropdown, Menu, Modal, Select, Form, Input } from "antd";
import { useTranslation } from "react-i18next";
import TableView from "../TableView/TableView";
import { FaFilter } from "react-icons/fa";
import { Images } from "../Config/Images";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import arrowDown from "../../assets/images/arrow-down.png";
import {
  createIncomeType,
  deleteIncomeType,
  editIncomeType,
  getIncomeType,
} from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const IncomeType = () => {
  const { t } = useTranslation("system");
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any>([]);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalRows, setTotalRows] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formValues, setFormValues] = useState({
    name: "",
  });
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [rowData, setRowData] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const handleDeleteConfirm = async () => {
    try {
      setIsLoading(true);
      await toast.promise(
        deleteIncomeType(rowData?.id), // API call
        {
          loading: t("incomeType.deleting"),
          success: (response) => {
            if (response?.data?.success) {
              getAllRoles();
              setIsDeleteModalVisible(false);
              return t("incomeType.deleteSuccess");
            } else {
              throw new Error(
                response?.data?.errors?.[0] ||
                  response?.data?.message ||
                  t("incomeType.deleteFailed")
              );
            }
          },
          error: (err) =>
            err?.message ||
            t("incomeType.deleteError"),
        }
      );
    } catch (error: any) {
      console.error("Error:", error);
    } finally {
      setIsDeleteModalVisible(false);
      setIsLoading(false);
    }
  };

  const handleMenuClick = (action: string, data) => {
    setRowData(data);
    switch (action) {
      case "edit":
        setSelectedItem("edit");
        setFormValues({
          name: data?.Name,
        });
        setErrors({});
        setIsModalVisible(true);
        break;
      case "delete":
        setIsDeleteModalVisible(true);

        break;
      default:
        break;
    }
  };

  const menu = (row: any) => (
    <Menu>
      <Menu.Item
        key="edit"
        icon={<EditOutlined />}
        onClick={() => handleMenuClick("edit", row)}
      >
        {t("common:edit")}
      </Menu.Item>
      <Menu.Item
        key="delete"
        icon={<DeleteOutlined />}
        onClick={() => handleMenuClick("delete", row)}
      >
        {t("common:delete")}
      </Menu.Item>
    </Menu>
  );
  // Close popup when clicking outside
  const Activity_Loans_Header = [
    {
      name: t("shared.sr"),
      selector: (row: { Sr: any }) => row.Sr,
      width: "15%",
      sortable: true,
    },
    {
      name: t("common:name"),
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
              backgroundColor: "#AB1920 !important",
              color: "#000000",
              borderColor: "white",
              borderRadius: "2px",
              padding: "10px 20px",
            }}
          >
            {t("shared.selectAction")} <img src={arrowDown} alt="" />
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
      const res = await getIncomeType(page, pageSize);
      if (res) {
        const data = res?.data?.data?.data;
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
    data?.map((item: any, index) => {
      return {
        Sr: index + from,
        id: item?.id,
        Name: item?.name,
      };
    });
  const showModal = () => {
    setFormValues({
      name: "",
    });
    setIsModalVisible(true);
    setSelectedItem("");
    setRowData({});
    setErrors({});
  };
  const handleOk = async () => {
    let validationErrors: Record<string, string> = {};

    if (!formValues.name) {
      validationErrors.name = t("incomeType.nameRequired");
    }
    setErrors(validationErrors);

    // if there are errors, stop submission
    if (Object.keys(validationErrors).length > 0) return;

    try {
      setIsLoading(true);

      if (selectedItem === "edit") {
        // For update, include the ID in the body
        const updateBody = {
          ...formValues,
          id: rowData?.id, // Include the ID from the selected row
        };

        await toast.promise(
          editIncomeType(updateBody), // Pass the body with ID included
          {
            loading: t("incomeType.updating"),
            success: (response: any) => {
              if (response?.data?.success) {
                getAllRoles();
                setIsModalVisible(false);
                return t("incomeType.updateSuccess");
              } else {
                throw new Error(
                  response?.response?.data?.errors?.[0] ||
                    t("incomeType.updateFailed")
                );
              }
            },
            error: (err) =>
              err?.message ||
              t("incomeType.updateError"),
          }
        );
      } else {
        await toast.promise(
          createIncomeType(formValues), // API call
          {
            loading: t("incomeType.adding"),
            success: (response) => {
              if (response?.data?.success) {
                setFormValues({
                  name: "",
                });
                getAllRoles();
                setIsModalVisible(false);
                return t("incomeType.addSuccess");
              } else {
                throw new Error(
                  response?.data?.errors?.[0] ||
                    response?.data?.message ||
                    t("incomeType.addFailed")
                );
              }
            },
            error: (err) =>
              err?.message ||
              t("incomeType.addError"),
          }
        );
      }
    } catch (error: any) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(mappedData || []);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "IncomeType");
    XLSX.writeFile(workbook, "IncomeType.xlsx");
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();

    const tableColumn = ["ID", "Sr", "Name"];

    const tableRows = mappedData?.map((item: any) => [
      item.id,
      item.Sr,
      item.Name,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("IncomeType.pdf");
  };
  return (
    <div className="service">
      <div className="d-flex justify-content-end  col-12">
        <Select
          mode="tags"
          style={{ width: "15%", borderTopRightRadius: "0px" }}
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
              placeholder={t("shared.searchPlaceholder")}
            />
          </div>
          <button className="invoice-btn" onClick={exportToExcel}>
            {t("shared.excel")}
          </button>
          <button
            className="invoice-btn"
            onClick={() => {
              exportToPDF();
            }}
          >
            {t("shared.pdf")}
          </button>
          <button className="invoice-btn">{t("common:print")}</button>
          <button className="theme-btn" onClick={showModal}>
            {t("incomeType.addNew")}
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
      <Modal maskClosable={false} keyboard={false}
        className="custom-mod"
        style={{ maxWidth: "732px" }}
        title={
          selectedItem === "edit" ? t("incomeType.editTitle") : t("incomeType.addNew")
        }
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <div className="w-100">
            <Button key="close" onClick={handleCancel}>
              {t("common:close")}
            </Button>
            ,
            <button
              key="save"
              className="theme-btn"
              disabled={isLoading}
              onClick={handleOk}
            >
              {selectedItem === "edit" ? t("common:edit") : t("common:add")}
            </button>
            ,
          </div>,
        ]}
      >
        <div className={"Ente-details"}>
          <Form>
            <div className="d-flex w-100 gap-4 align-items-center">
              {/* Name Field */}
              <Form.Item
                validateStatus={errors.name ? "error" : ""}
                help={errors.name}
                className="w-100"
              >
                <div>
                  <label className="input-label">{t("common:name")}</label>
                  <Input
                    placeholder={t("incomeType.placeholder")}
                    className="fs-6"
                    value={formValues.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                  />
                </div>
              </Form.Item>
            </div>
          </Form>
        </div>
      </Modal>
      <Modal maskClosable={false} keyboard={false}
        className="custom-mod center-footer"
        style={{ maxWidth: "378px" }}
        visible={isDeleteModalVisible}
        onCancel={() => setIsDeleteModalVisible(false)}
        footer={[
          <Button
            key="no"
            onClick={() => setIsDeleteModalVisible(false)}
            style={{
              border: "1px solid #ccc",
              color: "black",
              background: "white",
              borderRadius: "2px",
              padding: "4px 20px",
              fontWeight: "500",
            }}
          >
            {t("common:no")}
          </Button>,
          <Button
            key="yes"
            onClick={handleDeleteConfirm}
            disabled={isLoading}
            style={{
              background: "black",
              color: "white",
              border: "none",
              borderRadius: "2px",
              padding: "4px 20px",
              fontWeight: "500",
            }}
          >
            {t("common:yes")}
          </Button>,
        ]}
        centered
        closable={false}
      >
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              fontSize: "16px",
              fontWeight: "600",
              marginBottom: "0",
            }}
          >
            {t("incomeType.deleteConfirm")}
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default IncomeType;
