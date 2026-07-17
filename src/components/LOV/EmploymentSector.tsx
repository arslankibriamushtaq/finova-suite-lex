import { SetStateAction, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Input,
  Menu,
  Select,
  Modal,
  Form,
  Checkbox,
  Dropdown,
} from "antd";

import TableView from "../TableView/TableView";
import { FaFilter } from "react-icons/fa";
import { Images } from "../Config/Images";
import {
  getLOVsByType,
  createListOfValue,
  updateListOfValue,
  deleteListOfValues,
} from "../../redux/apis/apisCrud";
import { DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import arrowDown from "../../assets/images/arrow-down.png";

const EmploymentSector = () => {
  const { t } = useTranslation("lov");
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalRows, setTotalRows] = useState(0);
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const handleMenuClick = (key: string, row: any) => {
    if (key === "view") {
      navigate(`/Los/LOV/ListOfValues/${row.id}`);
    } else if (key === "edit") {
      handleEdit(row);
    } else if (key === "delete") {
      setDeleteTargetId(row.id);
      setShowConfirmModal(true);
    }
  };

  const menu = (row: any) => (
    <Menu>
        <Menu.Item
        key="view"
        icon={<EyeOutlined />}
        onClick={() => handleMenuClick("view", row)}
      >
        {t("common:view")}
      </Menu.Item>
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
  const getList = async (searchQuery?: string) => {
    setSkelitonLoading(true);
    try {
      const res = await getLOVsByType("EmploymentSector", page, pageSize, searchQuery || searchTerm);
      if (res) {
        const responseData = res?.data?.data;
        const data = responseData?.data || [];
        setData(data || []);
        setSkelitonLoading(false);
        setTotalRows(responseData?.total || 0);
        setFrom(responseData?.from || 0);
        setTo(responseData?.to || 0);
        setTotalPage(responseData?.last_page || 0);
      }
    } catch (error: any) {
      console.error("Error fetching data:", error);
      setSkelitonLoading(false);
    }
  };

  // Debounce search function
  const debouncedSearch = useRef<NodeJS.Timeout | null>(null);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    
    // Clear previous timeout
    if (debouncedSearch.current) {
      clearTimeout(debouncedSearch.current);
    }
    
    // Set new timeout for debounced search
    debouncedSearch.current = setTimeout(() => {
      // Reset to page 1 when searching
      setPage(1);
      getList(value);
    }, 500); // 500ms debounce delay
  };

  useEffect(() => {
    getList();
  }, [page, pageSize]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debouncedSearch.current) {
        clearTimeout(debouncedSearch.current);
      }
    };
  }, []);

  // --- Add Button Click
  const handleAdd = () => {
    setIsEdit(false);
    setEditId(null);
    form.resetFields();
    setOpen(true);
  };

  // --- Edit Button Click
  const handleEdit = (row: any) => {
    setIsEdit(true);
    setEditId(row.id);
    form.setFieldsValue({
      title: row.title || "",
      type: "EmploymentSector",
      factor_weight: row.factor_weight || "",
      status: row.status === true || row.status === 1,
    });
    setOpen(true);
  };

  // --- Delete Confirmed
  const handleDeleteConfirmed = async () => {
    if (!deleteTargetId) return;
    try {
      await toast.promise(deleteListOfValues(deleteTargetId), {
        loading: t("employmentSector.toast.deleting"),
        success: t("employmentSector.toast.deleted"),
        error: t("employmentSector.toast.deleteFailed"),
      });
      setShowConfirmModal(false);
      setDeleteTargetId(null);
      getList();
    } catch (error) {
      console.error("Delete error:", error);
      setShowConfirmModal(false);
    }
  };

  // --- Save or Update Employment Sector
  const handleSave = async () => {
    form.validateFields().then(async (values) => {
      const body = {
        title: values.title,
        type: "EmploymentSector",
        factor_weight: values.factor_weight ? Number(values.factor_weight) : 0,
        status: values.status || false,
      };

      try {
        if (isEdit && editId) {
          await toast.promise(updateListOfValue(editId, body), {
            loading: t("employmentSector.toast.updating"),
            success: t("employmentSector.toast.updated"),
            error: t("employmentSector.toast.updateFailed"),
          });
        } else {
          await toast.promise(createListOfValue(body), {
            loading: t("employmentSector.toast.adding"),
            success: t("employmentSector.toast.added"),
            error: t("employmentSector.toast.addFailed"),
          });
        }
        setOpen(false);
        form.resetFields();
        getList();
      } catch (error) {
        console.error("Save error:", error);
      }
    });
  };

  const handleCancel = () => {
    setOpen(false);
    form.resetFields();
  };


  const Activity_Loans_Header = [
    {
      name: t("employmentSector.col.title"),
      selector: (row: { title: any }) => row.title || "-",
    },
    {
      name: t("common:type"),
      selector: (row: { type: any }) => row.type || "-",
    },
    {
      name: t("employmentSector.col.factorWeight"),
      selector: (row: { factor_weight: any }) => row.factor_weight ?? "-",
    },
    {
      name: t("employmentSector.col.factors"),
      selector: (row: { factors: any }) => row.factors ?? "-",
    },
    {
      name: t("common:status"),
      cell: (row: any) => (
        <div
          style={{
            padding: "8px 10px",
            fontSize: "12px",
            borderRadius: "32px",
            backgroundColor:
              row.status === true
                ? "var(--color-success)"
                : row.status === false
                ? "var(--color-error)"
                : "var(--color-orange-alt)",
            color: "var(--primary-foreground)",
          }}
        >
          {row.status === true ? t("common:active") : t("common:inactive")}
        </div>
      ),
    },
    // {
    //   name: "Change Status",
    //   cell: (row: any) => (
    //     <Switch
    //       checked={row.status === true}
    //       onChange={async (checked) => {
    //         const body = { status: checked };
    //         try {
    //           const res = await updateCommodityTypeStatus(row.id, body);
    //           if (res) {
    //             toast.success(res?.data?.message);
    //             getList();
    //           }
    //         } catch (error) {
    //           console.error("Status update failed:", error);
    //         }
    //       }}
    //     />
    //   ),
    // },
    {
       name: t("common:actions"),
       width: "10%",
       cell: (row: any) => (
         <Dropdown overlay={menu(row)} trigger={["click"]}>
           <Button
             type="primary"
             className="theme-btn-next"
             style={{
               fontSize: "12px",
               borderRadius: "2px",
               padding: "8px",
               display: "flex",
               alignItems: "center",
               gap: "5px",
             }}
           >
            {t("common:select")}
             <img src={arrowDown} alt="" />
           </Button>
         </Dropdown>
       ),
     },
  ];

  const mappedData =
    data &&
    data.map((item: any, index: number) => ({
      id: item?.id,
      Sr: index + 1,
      title: item?.title || "-",
      type: item?.type || "-",
      factor_weight: item?.factor_weight ?? "-",
      factors: item?.factors ?? "-",
      status: item?.status,
    }));

  const options = [{ label: t("common:name"), value: "name" }];
  const handleChange = (value: SetStateAction<undefined>[]) => {
    // Filter logic can be implemented here
  };

  return (
    <div
      className="service"
      style={{ background: "white", padding: "1rem", borderRadius: "2px" }}
    >
      {/* Top Filters */}
      <div className="d-flex mb-3 col-12 filter-select">
        <Select
          mode="tags"
          style={{ width: "15%", borderTopRightRadius: "0px" }}
          onChange={handleChange}
          placeholder={t("common:filter")}
          tokenSeparators={[","]}
          suffixIcon={<FaFilter />}
          options={options}
        />

        <div className="d-flex gap-2 w-100">
          <div className="d-flex align-items-center gap-1 border px-2 ps-3 search-box">
            <img src={Images.searchIconGray} alt="" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
              }}
              className="p-2"
              placeholder={t("shared.searchPlaceholder")}
            />
          </div>

          <button className="theme-btn-next" onClick={handleAdd}>
            {t("shared.addNewRecord")}
          </button>
        </div>
      </div>

      {/* Table */}
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

      {/* ✅ Add/Edit Modal */}
      <Modal maskClosable={false} keyboard={false}
        title={
          <span className="font-semibold text-lg">
            {isEdit ? t("employmentSector.modal.editTitle") : t("employmentSector.modal.addTitle")}
          </span>
        }
        open={open}
        onCancel={handleCancel}
        footer={null}
        centered
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label={t("employmentSector.label.title")}
            name="title"
            rules={[{ required: true, message: t("employmentSector.validation.title") }]}
          >
            <Input placeholder={t("employmentSector.ph.title")} />
          </Form.Item>

          <Form.Item
            label={t("common:type")}
            name="type"
          >
            <Input placeholder="EmploymentSector" disabled />
          </Form.Item>

          <Form.Item
            label={t("employmentSector.label.factorWeight")}
            name="factor_weight"
          >
            <Input type="number" placeholder={t("employmentSector.ph.factorWeight")} />
          </Form.Item>

          <Form.Item name="status" valuePropName="checked">
            <Checkbox>{t("common:status")}</Checkbox>
          </Form.Item>

          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={handleCancel}>{t("common:cancel")}</Button>
            <Button
              type="primary"
              onClick={handleSave}
              className="theme-btn-next"
            >
              {isEdit ? t("common:update") : t("common:save")}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal maskClosable={false} keyboard={false}
        title={t("employmentSector.confirmDeleteTitle")}
        open={showConfirmModal}
        onCancel={() => setShowConfirmModal(false)}
        onOk={handleDeleteConfirmed}
        okText={t("employmentSector.yesDelete")}
        okButtonProps={{ danger: true }}
        cancelText={t("common:cancel")}
      >
        <p>{t("employmentSector.confirmDeleteBody")}</p>
      </Modal>
    </div>
  );
};

export default EmploymentSector;
