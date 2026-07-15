import { useEffect,  useState } from "react";
import { Button, Dropdown, Menu, Select, Modal, Input, Form } from "antd";
import { useTranslation } from "react-i18next";
import TableView from "../TableView/TableView";
import { FaFilter } from "react-icons/fa";
import { Images } from "../Config/Images";
import {
  createRelationLov,
  deleteRelationLov,
  editRelationLov,
  relationLovList,
} from "../../redux/apis/apisCrud";
import arrowDown from "../../assets/images/arrow-down.png";
import toast from "react-hot-toast";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const RelationLov = () => {
  const { t } = useTranslation("system");
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any>();
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [rowData, setRowData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [formValues, setFormValues] = useState({
    name: "",
    status: "",
  });
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const handleDeleteConfirm = async () => {
    try {
      setIsLoading(true);
      await toast.promise(
        deleteRelationLov(rowData?.id), // API call
        {
          loading: t("relationLov.deleting"),
          success: (response) => {
            if (response?.data?.success) {
              getList();
              setIsDeleteModalVisible(false);
              return t("relationLov.deleteSuccess");
            } else {
              throw new Error(
                response?.data?.errors?.[0] ||
                  response?.data?.message ||
                  t("relationLov.deleteFailed")
              );
            }
          },
          error: (err) =>
            err?.message ||
            t("relationLov.deleteError"),
        }
      );
    } catch (error: any) {
      console.error("Error:", error);
    } finally {
      setIsDeleteModalVisible(false);
      setIsLoading(false);
    }
  };
  const getList = async () => {
    try {
      setSkelitonLoading(true);

      const response = await relationLovList(page, pageSize);
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
    getList();
  }, [page, pageSize]);
  const Activity_Loans_Header = [
    {
      name: t("shared.sr"),
      selector: (row: { Sr: any }) => row.Sr,
      sortable: true,
      width: "15%",
    },
    {
      name: t("common:name"),
      selector: (row: { name: any }) => row.name,
      sortable: true,
      width: "75%",
    },
    {
      name: t("common:actions"),

      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button
            className="gradient-btn"
            type="primary"
            style={{
              backgroundColor: "#0B8085 !important",
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
      width: "10%",
    },
  ];
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
  const handleMenuClick = (action: string, data) => {
    setRowData(data);
    switch (action) {
      case "edit":
        // Handle edit action
        setSelectedItem("edit");
        setFormValues({
          name: data?.name,
          status: data?.status,
        });
        setIsModalVisible(true);
        break;
      case "delete":
        // Handle delete action
        setIsDeleteModalVisible(true);

        break;
      default:
        break;
    }
  };
  const mappedData =
    data &&
    data?.map((item: any, index) => {
      return {
        id: item?.id,
        Sr: item?.id,
        name: item?.name,
      };
    });

  const showModal = () => {
    setFormValues({
      name: "",
      status: "",
    });
    setIsModalVisible(true);
    setSelectedItem("");
    setRowData({});
  };
  const handleOk = async () => {
    const { name, status } = formValues;

    if (!name) {
      return;
    }

    try {
      setIsLoading(true);

      if (selectedItem === "edit") {
        // For update, include the ID in the body
        const updateBody = {
          ...formValues,
          id: rowData?.id, // Include the ID from the selected row
        };

        await toast.promise(
          editRelationLov(updateBody), // Pass the body with ID included
          {
            loading: t("relationLov.updating"),
            success: (response: any) => {
              if (response?.data?.success) {
                getList();
                setIsModalVisible(false);
                return t("relationLov.updateSuccess");
              } else {
                throw new Error(
                  response?.response?.data?.errors?.[0] ||
                    t("relationLov.updateFailed")
                );
              }
            },
            error: (err) =>
              err?.message ||
              t("relationLov.updateError"),
          }
        );
      } else {
        await toast.promise(
          createRelationLov(formValues), // API call
          {
            loading: t("relationLov.adding"),
            success: (response) => {
              if (response?.data?.success) {
                setFormValues({
                  name: "",
                  status: "",
                });
                getList();
                setIsModalVisible(false);
                return t("relationLov.addSuccess");
              } else {
                throw new Error(
                  response?.data?.errors?.[0] ||
                    response?.data?.message ||
                    t("relationLov.addFailed")
                );
              }
            },
            error: (err) =>
              err?.message ||
              t("relationLov.addError"),
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
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(mappedData || []);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "RelationLov");
    XLSX.writeFile(workbook, "RelationLov.xlsx");
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();

    const tableColumn = [
      "Sr",
      "Name",
    ];

    const tableRows = mappedData?.map((item: any) => [
    item.Sr,
      item.name,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("RelationLov.pdf");
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
          <button onClick={showModal} className="theme-btn">
            {t("relationLov.addNew")}
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
        setPageSize={setPageSize}
        pageSize={pageSize}
        to={to}
      />
      <Modal
        className="custom-mod"
        style={{ maxWidth: "732px" }}
        title={
          selectedItem === "edit" ? t("relationLov.editTitle") : t("relationLov.addNew")
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
              <Form.Item className="w-100">
                <div className="custom-input-container">
                  <label className="input-label">{t("common:name")}</label>
                  <Input
                    placeholder={t("relationLov.namePlaceholder")}
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
      <Modal
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
            {t("relationLov.deleteConfirm")}
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default RelationLov;
