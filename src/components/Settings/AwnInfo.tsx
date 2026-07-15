import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Modal, Form, Input, Switch, Upload, message, Dropdown, Menu } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import TableView from "../TableView/TableView";
import { Images } from "../Config/Images";
import arrowDown from "../../assets/images/arrow-down.png";
import {
  getAwnInfo,
  createAwnInfo,
  updateAwnInfo,
  deleteAwnInfo,
  updateAwnInfoStatus,
} from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";

const { TextArea } = Input;

const AwnInfo = () => {
  const { t } = useTranslation("settings");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [search, setSearch] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<any>(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any>([]);

  const menu = (row: any) => (
    <Menu>
      <Menu.Item
        key="edit"
        icon={<EditOutlined />}
        onClick={() => handleMenuClick("edit", row)}
      >
        {t("common:edit")}
      </Menu.Item>
      {/* <Menu.Item
        key="status"
        icon={<EditOutlined />}
        onClick={() => handleMenuClick("status", row)}
      >
        Change Status
      </Menu.Item> */}
      <Menu.Item
        key="delete"
        icon={<DeleteOutlined />}
        onClick={() => handleMenuClick("delete", row)}
      >
        {t("common:delete")}
      </Menu.Item>
    </Menu>
  );

  const handleMenuClick = (action: string, row: any) => {
    switch (action) {
      case "edit":
        handleEdit(row);
        break;
      case "status":
        handleStatusToggle(row.id);
        break;
      case "delete":
        handleDelete(row.id);
        break;
      default:
        break;
    }
  };

  const handleStatusToggle = async (id: number) => {
    try {
      const response = await updateAwnInfoStatus(id);
      if (response?.data?.success) {
        toast.success(t("toast.statusUpdated"));
        fetchData();
      }
    } catch (error: any) {
      toast.error(error?.message || t("toast.statusFailed"));
    }
  };

  const columns = [
    {
      name: t("awnInfo.col.sr"),
      selector: (row: any) => row.sr,
      sortable: true,
      width: "80px",
    },
    {
      name: t("awnInfo.col.titleEn"),
      selector: (row: any) => row.title_en,
      sortable: true,
      width: "200px",
    },
    {
      name: t("awnInfo.col.titleAr"),
      selector: (row: any) => row.title_ar,
      sortable: true,
      width: "200px",
    },
    {
      name: t("awnInfo.col.descEn"),
      selector: (row: any) => row.description_en,
      sortable: true,
      cell: (row: any) => (
        <div style={{ whiteSpace: "pre-wrap", maxWidth: "300px" }}>
          {row.description_en?.substring(0, 100)}
          {row.description_en?.length > 100 && "..."}
        </div>
      ),
    },
    {
        name: t("awnInfo.col.descAr"),
        selector: (row: any) => row.description_ar,
        sortable: true,
        cell: (row: any) => (
          <div style={{ whiteSpace: "pre-wrap", maxWidth: "300px" }}>
            {row.description_ar?.substring(0, 100)}
            {row.description_ar?.length > 100 && "..."}
          </div>
        ),
      },
    {
      name: t("common:status"),
      cell: (row: any) => (
        <span
          style={{
            padding: "5px 10px",
            borderRadius: "2px",
            backgroundColor: row.status ? "var(--color-success)" : "var(--color-error)",
            color: "white",
            fontSize: "12px",
          }}
        >
          {row.status ? t("common:active") : t("common:inactive")}
        </span>
      ),
      width: "120px",
    },
    {
      name: t("common:actions"),
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
      width: "150px",
    },
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getAwnInfo(page, pageSize, search);
      if (response?.data?.success) {
        const responseData = response.data.data;
        const mappedData = responseData.data.map((item: any, index: number) => ({
          sr: (page - 1) * pageSize + index + 1,
          id: item.id,
          title_en: item.title?.en || "-",
          title_ar: item.title?.ar || "-",
          description_en: item.description?.en || "-",
          description_ar: item.description?.ar || "-",
          image: item.image,
          status: item.status,
          raw: item,
        }));
        setData(mappedData);
        setTotalRows(responseData.total || 0);
        setFrom(responseData.from || 0);
        setTo(responseData.to || 0);
        setTotalPage(responseData.last_page || 1);
      }
    } catch (error: any) {
      toast.error(error?.message || t("toast.fetchFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, pageSize, search]);

  const handleAdd = () => {
    setEditMode(false);
    setCurrentRecord(null);
    form.resetFields();
    setFileList([]);
    setIsModalVisible(true);
  };

  const handleEdit = (row: any) => {
    setEditMode(true);
    setCurrentRecord(row);
    form.setFieldsValue({
      title_en: row.title_en,
      title_ar: row.title_ar,
      description_en: row.description_en,
      description_ar: row.description_ar,
      status: row.status,
    });
    if (row.image) {
      setFileList([
        {
          uid: "-1",
          name: "image.png",
          status: "done",
          url: row.image,
        },
      ]);
    }
    setIsModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: t("deleteItem.title"),
      content: t("deleteItem.content"),
      okText: t("deleteItem.ok"),
      okType: "danger",
      cancelText: t("common:cancel"),
      onOk: async () => {
        try {
          const response = await deleteAwnInfo(id);
          if (response?.data?.success) {
            toast.success(t("common:deletedSuccessfully"));
            fetchData();
          }
        } catch (error: any) {
          toast.error(error?.message || t("toast.deleteFailed"));
        }
      },
    });
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      const formData = new FormData();
      
      // Append flat form-data fields as expected by the API
      formData.append("title_en", values.title_en);
      formData.append("title_ar", values.title_ar);
      formData.append("description_en", values.description_en);
      formData.append("description_ar", values.description_ar);
      formData.append("status", values.status ? "1" : "0");

      // Append image if exists
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append("image", fileList[0].originFileObj);
      }

      let response;
      if (editMode && currentRecord) {
        response = await updateAwnInfo(currentRecord.id, formData);
      } else {
        response = await createAwnInfo(formData);
      }

      if (response?.data?.success) {
        toast.success(
          editMode ? t("common:updatedSuccessfully") : t("toast.created")
        );
        setIsModalVisible(false);
        form.resetFields();
        setFileList([]);
        fetchData();
      }
    } catch (error: any) {
      toast.error(error?.message || t("toast.operationFailed"));
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    onRemove: (file: any) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file: any) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error(t("awnInfo.msg.onlyImage"));
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error(t("awnInfo.msg.imageSize"));
        return false;
      }
      setFileList([file]);
      return false;
    },
    fileList,
  };

  return (
    <div className="service">
      <div className="d-flex justify-content-end col-12 filter-select">
        <div className="d-flex gap-2 w-100" style={{ height: 40 }}>
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
              placeholder={t("searchShort")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={handleAdd}
            className="theme-btn"
            style={{ minWidth: "120px" }}
          >
            {t("addNew")}
          </button>
        </div>
      </div>

      <TableView
        header={columns}
        data={data}
        totalRows={totalRows}
        isLoading={loading}
        from={from}
        page={page}
        totalPage={totalPage}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        to={to}
      />

      <Modal
        title={editMode ? t("awnInfo.modal.editTitle") : t("awnInfo.modal.addTitle")}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setFileList([]);
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ status: true }}
        >
          <Form.Item
            label={t("awnInfo.field.titleEn")}
            name="title_en"
            rules={[{ required: true, message: t("awnInfo.val.titleEn") }]}
          >
            <Input placeholder={t("awnInfo.ph.titleEn")} />
          </Form.Item>

          <Form.Item
            label={t("awnInfo.field.titleAr")}
            name="title_ar"
            rules={[{ required: true, message: t("awnInfo.val.titleAr") }]}
          >
            <Input placeholder={t("awnInfo.ph.titleAr")} />
          </Form.Item>

          <Form.Item
            label={t("awnInfo.field.descEn")}
            name="description_en"
            rules={[
              { required: true, message: t("awnInfo.val.descEn") },
            ]}
          >
            <TextArea
              rows={4}
              placeholder={t("awnInfo.ph.descEn")}
            />
          </Form.Item>

          <Form.Item
            label={t("awnInfo.field.descAr")}
            name="description_ar"
            rules={[
              { required: true, message: t("awnInfo.val.descAr") },
            ]}
          >
            <TextArea
              rows={4}
              placeholder={t("awnInfo.ph.descAr")}
            />
          </Form.Item>

          <Form.Item label={t("awnInfo.field.image")} name="image">
            <Upload {...uploadProps} listType="picture" maxCount={1}>
              <Button icon={<UploadOutlined />}>{t("awnInfo.uploadImage")}</Button>
            </Upload>
          </Form.Item>

          <Form.Item label={t("common:status")} name="status" valuePropName="checked">
            <Switch style={{ backgroundColor: "var(--foreground)" }} checkedChildren={t("common:active")} unCheckedChildren={t("common:inactive")} />
          </Form.Item>

          <Form.Item>
            <div className="d-flex justify-content-end gap-2">
              <Button
                onClick={() => {
                  setIsModalVisible(false);
                  form.resetFields();
                  setFileList([]);
                }}
              >
                {t("common:cancel")}
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="gradient-btn"
              >
                {editMode ? t("common:update") : t("common:create")}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AwnInfo;

