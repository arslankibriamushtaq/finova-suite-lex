import { useEffect, useState } from "react";
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
        Edit
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
        Delete
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
        toast.success("Status updated successfully");
        fetchData();
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to update status");
    }
  };

  const columns = [
    {
      name: "Sr:",
      selector: (row: any) => row.sr,
      sortable: true,
      width: "80px",
    },
    {
      name: "Title (EN)",
      selector: (row: any) => row.title_en,
      sortable: true,
      width: "200px",
    },
    {
      name: "Title (AR)",
      selector: (row: any) => row.title_ar,
      sortable: true,
      width: "200px",
    },
    {
      name: "Description (EN)",
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
        name: "Description (AR)",
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
      name: "Status",
      cell: (row: any) => (
        <span
          style={{
            padding: "5px 10px",
            borderRadius: "20px",
            backgroundColor: row.status ? "var(--color-success)" : "var(--color-error)",
            color: "white",
            fontSize: "12px",
          }}
        >
          {row.status ? "Active" : "Inactive"}
        </span>
      ),
      width: "120px",
    },
    {
      name: "Actions",
      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button
            className="gradient-btn"
            type="primary"
            style={{
              backgroundColor: "var(--color-action) !important",
              color: "var(--foreground)",
              borderColor: "white",
              borderRadius: "8px",
              padding: "10px 20px",
            }}
          >
            Select <img src={arrowDown} alt="" />
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
      toast.error(error?.message || "Failed to fetch data");
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
      title: "Are you sure you want to delete this item?",
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const response = await deleteAwnInfo(id);
          if (response?.data?.success) {
            toast.success("Deleted successfully");
            fetchData();
          }
        } catch (error: any) {
          toast.error(error?.message || "Failed to delete");
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
          editMode ? "Updated successfully" : "Created successfully"
        );
        setIsModalVisible(false);
        form.resetFields();
        setFileList([]);
        fetchData();
      }
    } catch (error: any) {
      toast.error(error?.message || "Operation failed");
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
        message.error("You can only upload image files!");
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error("Image must be smaller than 2MB!");
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
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={handleAdd}
            className="theme-btn"
            style={{ minWidth: "120px" }}
          >
            + Add New
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
        title={editMode ? "Edit Factoring Valley Info" : "Add Factoring Valley Info"}
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
            label="Title (English)"
            name="title_en"
            rules={[{ required: true, message: "Please enter title in English" }]}
          >
            <Input placeholder="Enter title in English" />
          </Form.Item>

          <Form.Item
            label="Title (Arabic)"
            name="title_ar"
            rules={[{ required: true, message: "Please enter title in Arabic" }]}
          >
            <Input placeholder="Enter title in Arabic" />
          </Form.Item>

          <Form.Item
            label="Description (English)"
            name="description_en"
            rules={[
              { required: true, message: "Please enter description in English" },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Enter description in English"
            />
          </Form.Item>

          <Form.Item
            label="Description (Arabic)"
            name="description_ar"
            rules={[
              { required: true, message: "Please enter description in Arabic" },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Enter description in Arabic"
            />
          </Form.Item>

          <Form.Item label="Image" name="image">
            <Upload {...uploadProps} listType="picture" maxCount={1}>
              <Button icon={<UploadOutlined />}>Upload Image</Button>
            </Upload>
          </Form.Item>

          <Form.Item label="Status" name="status" valuePropName="checked">
            <Switch style={{ backgroundColor: "var(--foreground)" }} checkedChildren="Active" unCheckedChildren="Inactive" />
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
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="gradient-btn"
              >
                {editMode ? "Update" : "Create"}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AwnInfo;

