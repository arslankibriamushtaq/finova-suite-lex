import { useEffect, useState } from "react";
import { Button, Modal, Form, Input, Switch, Dropdown, Menu, Select } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { FaFilter } from "react-icons/fa";
import TableView from "../TableView/TableView";
import { Images } from "../Config/Images";
import arrowDown from "../../assets/images/arrow-down.png";
import {
  getComplianceRequirements,
  createComplianceRequirement,
  updateComplianceRequirement,
  deleteComplianceRequirement,
  updateComplianceRequirementStatus,
  getComplianceQuestionTypes,
} from "../../redux/apis/apisCrud";
import toast from "react-hot-toast";

const ComplianceRequirement = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<any>(null);
  const [form] = Form.useForm();
  const [lovTypes, setLovTypes] = useState<any>([]);
  const [questionTypes, setQuestionTypes] = useState<any>([]);
  const [categories, setCategories] = useState<any>([]);
  const [lovAbleOptions, setLovAbleOptions] = useState<any>([]);
  const [applicableToTypes, setApplicableToTypes] = useState<any>([]);
  
  // Watch category field to show/hide affordability fields
  const selectedCategory = Form.useWatch('category', form);

  const menu = (row: any) => (
    <Menu>
      <Menu.Item
        key="edit"
        icon={<EditOutlined />}
        onClick={() => handleMenuClick("edit", row)}
      >
        Edit
      </Menu.Item>
      <Menu.Item
        key="status"
        icon={<EditOutlined />}
        onClick={() => handleMenuClick("status", row)}
      >
        Change Status
      </Menu.Item>
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
      const response = await updateComplianceRequirementStatus(id);
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
    
    },
    {
      name: "Question (EN)",
      selector: (row: any) => row.question_en,
      sortable: true,

    },
    {
      name: "Question (AR)",
      selector: (row: any) => row.question_ar,
      sortable: true,
   
    },
    {
      name: "LOV Type",
      selector: (row: any) => row.lov_type,
      sortable: true,
  
    },
    {
      name: "Type",
      selector: (row: any) => row.type,
      sortable: true,
  
    },
    {
      name: "Category",
      selector: (row: any) => row.category,
      sortable: true,
      cell: (row: any) => (
        <span style={{ textTransform: "uppercase" }}>{row.category}</span>
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
      
    },
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getComplianceRequirements(page, pageSize, search, type, category);
      if (response?.data?.success) {
        const responseData = response.data.data;
        
        // Handle the new response structure
        let dataArray = [];
        if (Array.isArray(responseData)) {
          dataArray = responseData;
        } else if (responseData.data && Array.isArray(responseData.data)) {
          dataArray = responseData.data;
        }
        
        const mappedData = dataArray.map((item: any, index: number) => {
          // Parse question if it's a string
          let question = item.question;
          if (typeof question === 'string') {
            try {
              question = JSON.parse(question);
            } catch (e) {
              question = { en: question, ar: question };
            }
          }
          
          return {
            sr: (page - 1) * pageSize + index + 1,
            id: item.id,
            question_en: question?.en || "-",
            question_ar: question?.ar || "-",
            lov_type: item.lov_type || "-",
            type: item.type || "-",
            category: item.category || "-",
            applicable_to: item.applicable_to || "-",
            product_id: item.product_id,
            parent_id: item.parent_id,
            status: item.status,
            lov_data: item.lov_data || [],
            children: item.children || [],
            raw: item,
          };
        });
        
        setData(mappedData);
        setTotalRows(responseData.total || dataArray.length);
        setFrom(responseData.from || (dataArray.length > 0 ? 1 : 0));
        setTo(responseData.to || dataArray.length);
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
  }, [page, pageSize, search, type, category]);

  useEffect(() => {
    fetchComplianceQuestionTypes();
  }, []);

  const fetchComplianceQuestionTypes = async () => {
    try {
      const response = await getComplianceQuestionTypes();
      if (response?.data?.success) {
        const data = response.data.data;
        
        // Set question types
        setQuestionTypes(data.question_types || []);
        
        // Set categories
        setCategories(data.categories || []);
        
        // Set LOV types (using lov_type as value and label as label)
        // Deduplicate by lov_type value
        const lovTypesMap = new Map();
        (data.lov_types || []).forEach((item: any) => {
          if (item.lov_type && !lovTypesMap.has(item.lov_type)) {
            lovTypesMap.set(item.lov_type, {
              value: item.lov_type,
              label: item.label,
            });
          }
        });
        setLovTypes(Array.from(lovTypesMap.values()));
        
        // Extract unique lov_able values from lov_types array
        const uniqueLovAble = Array.from(
          new Set(
            (data.lov_types || [])
              .map((item: any) => item.lov_able)
              .filter((val: any) => val !== null && val !== undefined)
          )
        ).map((value: any) => {
          // Format the value as a label (convert camelCase to Title Case)
          const formatLabel = (val: string) => {
            return val
              .replace(/([A-Z])/g, ' $1')
              .replace(/^./, (str) => str.toUpperCase())
              .trim();
          };
          return {
            value: value,
            label: formatLabel(value),
          };
        });
        setLovAbleOptions(uniqueLovAble);
        
        // Set applicable to types
        setApplicableToTypes(data.applicable_to_types || []);
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to fetch compliance question types");
    }
  };

  const handleAdd = () => {
    setEditMode(false);
    setCurrentRecord(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (row: any) => {
    setEditMode(true);
    setCurrentRecord(row);
      form.setFieldsValue({
      question_en: row.question_en,
      question_ar: row.question_ar,
      lov_type: row.lov_type,
      type: row.type,
      category: row.category,
      lov_able: row.raw?.lov_able || "ListOfValue",
      category_weight: row.raw?.category_weight || 0,
      locale: row.raw?.locale || "en",
      applicable_to: row.raw?.applicable_to || "",
      status: row.status,
      is_multiplier: row.raw?.data?.is_multiplier || "0",
      maximum_amount: row.raw?.data?.maximum_amount || "1000",
      minimum_amount: row.raw?.data?.minimum_amount || "100",
      is_adult_dependent: row.raw?.data?.is_adult_dependent || "0",
    });
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
          const response = await deleteComplianceRequirement(id);
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
      const payload: any = {
        question: {
          en: values.question_en,
          ar: values.question_ar,
        },
        type: values.type,
        category: values.category,
        lov_type: values.lov_type,
        lov_able: values.lov_able || "ListOfValue",
        category_weight: values.category_weight || 0,
        status: values.status ? true : false,
        locale: values.locale || "en",
        applicable_to: values.applicable_to || "",
      };

      // Add affordability fields only if category is "affordability"
      if (values.category === "affordability") {
        payload.data = {
          is_multiplier: values.is_multiplier || "0",
          maximum_amount: values.maximum_amount || "1000",
          minimum_amount: values.minimum_amount || "100",
          is_adult_dependent: values.is_adult_dependent || "0",
        };
      }

      let response;
      if (editMode && currentRecord) {
        response = await updateComplianceRequirement(currentRecord.id, payload);
      } else {
        response = await createComplianceRequirement(payload);
      }

      if (response?.data?.success) {
        toast.success(
          editMode ? "Updated successfully" : "Created successfully"
        );
        setIsModalVisible(false);
        form.resetFields();
        fetchData();
      }
    } catch (error: any) {
      toast.error(error?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="service">
      <div className="d-flex justify-content-end col-12 filter-select">
        <Select
          style={{ width: "120px", marginRight: "8px" }}
          placeholder="Type"
          allowClear
          value={type || undefined}
          onChange={(value) => setType(value || '')}
        >
          {questionTypes.map((item: any) => (
            <Select.Option key={item.value} value={item.value}>
              {item.label}
            </Select.Option>
          ))}
        </Select>

        <Select
          style={{ width: "120px", borderTopRightRadius: "0px" }}
          placeholder="Category"
          allowClear
          value={category || undefined}
          onChange={(value) => setCategory(value || '')}
          suffixIcon={<FaFilter />}
        >
          {categories.map((item: any) => (
            <Select.Option key={item.value} value={item.value}>
              {item.label}
            </Select.Option>
          ))}
        </Select>

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
        title={editMode ? "Edit Requirement" : "Add New Requirement"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={900}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ 
            status: true, 
            type: 'lov', 
            locale: 'en', 
            lov_able: 'ListOfValue', 
            category_weight: 0, 
            applicable_to: '',
            is_multiplier: "0",
            maximum_amount: "1000",
            minimum_amount: "100",
            is_adult_dependent: "0"
          }}
        >
          <div className="row">
            <div className="col-md-6">
              <Form.Item
                label="Question (English)"
                name="question_en"
                rules={[{ required: true, message: "Please enter question" }]}
              >
                <Input placeholder="Question" />
              </Form.Item>
            </div>

            <div className="col-md-6">
              <Form.Item
                label="Question (Arabic)"
                name="question_ar"
                rules={[{ required: true, message: "Please enter question in Arabic" }]}
              >
                <Input placeholder="سوال عربی" style={{ textAlign: 'right' }} />
              </Form.Item>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <Form.Item
                label="Category"
                name="category"
                rules={[{ required: true, message: "Please select category" }]}
              >
                <Select placeholder="Select category">
                  {categories.map((item: any) => (
                    <Select.Option key={item.value} value={item.value}>
                      {item.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </div>

            <div className="col-md-6">
              <Form.Item
                label="LOV Type"
                name="lov_type"
                rules={[{ required: true, message: "Please select LOV type" }]}
              >
                <Select placeholder="Select LOV type">
                  {lovTypes.map((lov: any) => (
                    <Select.Option key={lov.value} value={lov.value}>
                      {lov.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <Form.Item
                label="Type"
                name="type"
                rules={[{ required: true, message: "Please select type" }]}
              >
                <Select placeholder="Select type">
                  {questionTypes.map((item: any) => (
                    <Select.Option key={item.value} value={item.value}>
                      {item.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </div>

            <div className="col-md-6">
              <Form.Item
                label="LOV Able"
                name="lov_able"
                rules={[{ required: true, message: "Please select LOV able" }]}
              >
                <Select placeholder="Select LOV able">
                  {lovAbleOptions.map((item: any) => (
                    <Select.Option key={item.value} value={item.value}>
                      {item.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <Form.Item
                label="Category Weight"
                name="category_weight"
                rules={[{ required: true, message: "Please enter category weight" }]}
              >
                <Input type="number" placeholder="Enter weight (e.g., 15)" />
              </Form.Item>
            </div>

            <div className="col-md-6">
              <Form.Item
                label="Locale"
                name="locale"
                rules={[{ required: true, message: "Please select locale" }]}
              >
                <Select placeholder="Select locale">
                  <Select.Option value="en">English</Select.Option>
                  <Select.Option value="ar">Arabic</Select.Option>
                </Select>
              </Form.Item>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <Form.Item
                label="Applicable To"
                name="applicable_to"
                rules={[{ required: true, message: "Please select applicable to" }]}
              >
                <Select placeholder="Select applicable to">
                  {applicableToTypes.map((item: any) => (
                    <Select.Option key={item.value} value={item.value}>
                      {item.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </div>

            <div className="col-md-6">
              <Form.Item label="Status" name="status" valuePropName="checked">
                <Switch style={{ backgroundColor: "var(--foreground)" }} checkedChildren="Active" unCheckedChildren="Inactive" />
              </Form.Item>
            </div>
          </div>

          {/* Affordability fields - shown only when category is "affordability" */}
          {selectedCategory === "affordability" && (
            <div className="row">
              <div className="col-md-6">
                <Form.Item
                  label="Is Multiplier"
                  name="is_multiplier"
                  rules={[{ required: true, message: "Please enter is multiplier" }]}
                >
                  <Input type="number" placeholder="Enter is multiplier (e.g., 0)" />
                </Form.Item>
              </div>

              <div className="col-md-6">
                <Form.Item
                  label="Maximum Amount"
                  name="maximum_amount"
                  rules={[{ required: true, message: "Please enter maximum amount" }]}
                >
                  <Input type="number" placeholder="Enter maximum amount (e.g., 1000)" />
                </Form.Item>
              </div>
            </div>
          )}

          {selectedCategory === "affordability" && (
            <div className="row">
              <div className="col-md-6">
                <Form.Item
                  label="Minimum Amount"
                  name="minimum_amount"
                  rules={[{ required: true, message: "Please enter minimum amount" }]}
                >
                  <Input type="number" placeholder="Enter minimum amount (e.g., 100)" />
                </Form.Item>
              </div>

              <div className="col-md-6">
                <Form.Item
                  label="Is Adult Dependent"
                  name="is_adult_dependent"
                  rules={[{ required: true, message: "Please enter is adult dependent" }]}
                >
                  <Input type="number" placeholder="Enter is adult dependent (e.g., 0)" />
                </Form.Item>
              </div>
            </div>
          )}

          <Form.Item>
            <div className="d-flex justify-content-end gap-2">
              <Button
                onClick={() => {
                  setIsModalVisible(false);
                  form.resetFields();
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
                Save
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ComplianceRequirement;

