import { SetStateAction, useEffect, useState } from "react";

import {
  Button,
  Input,
  Menu,
  Select,
  Modal,
  Form,
  Switch,
  Dropdown,
  Row,
  Col,
} from "antd";
import TableView from "../TableView/TableView";
import { FaFilter } from "react-icons/fa";
import { Images } from "../Config/Images";
import {
  updateCommodityTypeStatus,
  getContractTemplates,
  createContractTemplate,
  deleteContractTemplate,
  updateContractTemplate,
  updateContractTemplateStatus,
} from "../../redux/apis/apisCrud";
import { getAllProducts } from "../../redux/apis/apisCrudProductManagement";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import arrowDown from "../../assets/images/arrow-down.png";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

const ContractTemplate = () => {
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [data, setData] = useState<any>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalRows, setTotalRows] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState();
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [currentSourceId, setCurrentSourceId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", product_id: null as number | null, message_en: "", message_ar: "", status: "inactive", type: "" });
  const [selectedLanguage, setSelectedLanguage] = useState<"english" | "arabic">("english");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await getAllProducts(1, 100); // Fetch first page with 100 items
      if (res?.data?.data?.data) {
        setProducts(res.data.data.data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products");
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleMenuClick = (key: string, row: any) => {
    if (key === "edit") {
      // If modal is already open, close it first and wait for it to fully close
      if (showModal) {
        setShowModal(false);
        setFormData({ 
          name: "",
          product_id: null,
          message_en: "",
          message_ar: "",
          status: "inactive",
          type: ""
        });
        setSelectedItem(null);
        setCurrentSourceId(null);
        
        // Wait for modal to close, then open with new data
        setTimeout(() => {
          const newFormData = { 
            name: row.name || "",
            product_id: row.original_product_id || null,
            message_en: row.message_en || "",
            message_ar: row.message_ar || "",
            status: row.status === 1 || row.status === true || row.status === "active" ? "active" : "inactive",
            type: row.type || ""
          };
          
          setSelectedItem("edit");
          setCurrentSourceId(row.id);
          setFormData(newFormData);
          setSelectedLanguage("english");
          setShowModal(true);
        }, 300); // Wait for modal animation to complete
      } else {
        // Modal is closed, directly set new data
        const newFormData = { 
          name: row.name || "",
          product_id: row.original_product_id || null,
          message_en: row.message_en || "",
          message_ar: row.message_ar || "",
          status: row.status === 1 || row.status === true || row.status === "active" ? "active" : "inactive",
          type: row.type || ""
        };
        
        setSelectedItem("edit");
        setCurrentSourceId(row.id);
        setFormData(newFormData);
        setSelectedLanguage("english");
        setShowModal(true);
      }
    } else if (key === "delete") {
      setDeleteTargetId(row.id);
      setShowConfirmModal(true);
      setSelectedItem("delete");
    }
  };

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
        key="delete"
        icon={<DeleteOutlined />}
        onClick={() => handleMenuClick("delete", row)}
      >
        Delete
      </Menu.Item>
    </Menu>
  );

  const Activity_Loans_Header = [
    // {
    //   name: "Sr:",
    //   selector: (row: { Sr: any }) => row.Sr,
    //   sortable: true,
    //   // width: "15%",
    // },
    {
      name: "Name",
      selector: (row: { name: any }) => row.name,
      // sortable: true,
    },
     {
      name: "Product",
      selector: (row: { product_id: any }) => row.product_id,
      // sortable: true,
    },
     {
      name: "Type",
      selector: (row: { type: any }) => row.type,
      // sortable: true,
    },
    {
      name: "Status",
      cell: (row: any) => (
        <Switch
          checked={row.status}
          onChange={async (checked) => {
            const newStatus = checked;
            const body = {
              status: newStatus,
            };

            try {
              const res = await updateContractTemplateStatus(row.id, body);
              if (res) {
                toast.success(res?.data?.message);
                getList();
                // Update UI locally
                setData((prevData: any) =>
                  prevData.map((item: any) =>
                    item.id === row.id ? { ...item, status: body } : item
                  )
                );
              }
            } catch (error) {
              console.error("Status update failed:", error);
            }
          }}
          className="red-switch"
        />
      ),
    },
    {
      name: "Action",
      width: "10%",
      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button
            className="gradient-btn"
            type="primary"
            style={{
              fontSize: "12px",
              borderRadius: "4px",
              padding: "8px",
            }}
          >
            Select 
            <img src={arrowDown} alt="" />
          </Button>
        </Dropdown>
      ),
    },
  ];

   const handleDeleteConfirmed = async () => {
    if (!deleteTargetId) return;
    try {
      await toast.promise(deleteContractTemplate(deleteTargetId), {
        loading: "Deleting...",
        success: (response) => {
          getList();
          setShowConfirmModal(false);
          return response?.data?.data?.message;
        },
        error: (err) => err?.message || "Failed to delete source",
      });
    } catch (error) {
      console.error("Delete error:", error);
      setShowConfirmModal(false);
    }
  }; 

   const handleSave = async () => {
    if (!formData.product_id) {
      toast.error("Please select a product");
      return;
    }
    if (!formData.type) {
      toast.error("Please select a type");
      return;
    }
    
    const body: any = {
        name: formData.name,
        product_id: formData.product_id,
        message_en: formData.message_en,
        message_ar: formData.message_ar,
        status: formData.status,
        type: formData.type
    };
    try {
      if (selectedItem == "edit" && currentSourceId !== null) {
        await toast.promise(updateContractTemplate(currentSourceId, body), {
          loading: "Updating...",
          success: (response: any) => {
            setShowModal(false);
            setSelectedItem("");
            setShowConfirmModal(false);
            setCurrentSourceId(null);
            setFormData({ 
              name: "",
              product_id: null,
              message_en: "",
              message_ar: "",
              status: "inactive",
              type: ""
             });
            setSelectedLanguage("english");
            getList();
            return response?.data?.message;
          },
          error: (err) => err?.message || "Failed to update",
        });
      } else if (selectedItem == "add") {
        await toast.promise(createContractTemplate(body), {
          loading: "Adding Contract Template...",
          success: (response) => {
            setShowModal(false);
            setSelectedItem("");
            setShowConfirmModal(false);
            setCurrentSourceId(null);
            setFormData({ 
                name: "",
                product_id: null,
                message_en: "",
                message_ar: "",
                status: "inactive",
                type: ""
              });
            setSelectedLanguage("english");
            getList();
            return response?.data?.message;
          },
          error: (err) => err?.message || "Failed to add new source",
        });
      }
    } catch (error) {
      console.error("Failed to save source:", error);
      setShowConfirmModal(false);
    }
  }; 

  const getList = async () => {
     setSkelitonLoading(true);
     try {
       const res = await getContractTemplates();
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
       console.error("Error fetching Financing purpose:", error);
       setSkelitonLoading(false);
     }
  };

  useEffect(() => {
     getList();
     fetchProducts();
  }, [page, pageSize]);
  
  const mappedData =
    data &&
    data?.map((item: any, index: number) => {
      // Find product name from products list
      const product = products.find((p: any) => p.id === item?.product_id);
      const productName = product ? product.name_en : (item?.product_id ? item.product_id : "-");
      
      const mappedItem = {
        id: item?.id,
        Sr: index + 1,
        name: item?.name || "-",
        product_id: productName,
        message_en: item?.message_en || "",
        message_ar: item?.message_ar || "",
        parent_id: item?.parent_id || "-",
        status:item?.status,
        type: item?.type,
        // Keep original product_id for editing
        original_product_id: item?.product_id,
      };
      
      return mappedItem;
    });

  const options = [{ label: "Name", value: "name" }];
  const handleChange = (value: SetStateAction<undefined>[]) => {

    setSelectedFilters(value[0]);
    // You can trigger filtering logic here
  };
  return (
    <>
      <div
        className="service"
        style={{ background: "white", padding: "1rem", borderRadius: "10px" }}
      >
        <div className="d-flex mb-3 col-12 filter-select">
          <Select
            mode="tags"
            style={{ width: "15%", borderTopRightRadius: "0px" }}
            onChange={handleChange}
            placeholder="Filter"
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
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  border: "none",
                  outline: "none",
                  background: "transparent",
                }}
                className="p-2"
                placeholder="Search..."
              />
            </div>

            <button
              className="theme-btn-next"
              onClick={() => {
                setShowModal(true);
                setSelectedItem("add");
                setFormData({ 
                  name: "",
                  product_id: null,
                  message_en: "",
                  message_ar: "",
                  status: "inactive",
                  type: ""
                });
                setSelectedLanguage("english");
              }}
            >
                Add New Contract Template
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

        <Modal
          key={currentSourceId || "add"} // Force re-render when editing different items
          className="custom-mod"
          style={{ maxWidth: "640px" }}
          title={
            selectedItem === "edit" ? "Edit Record" : "Add New Record"
          }
          visible={showModal}
          onCancel={() => {
            setShowModal(false);
            // Clear all form data and states
            setFormData({ 
              name: "",
              product_id: null,
              message_en: "",
              message_ar: "",
              status: "inactive",
              type: ""
            });
            setSelectedLanguage("english");
            setSelectedItem(null);
            setCurrentSourceId(null);
          }}
          footer={[
            <Button key="close" onClick={() => setShowModal(false)}>
              Cancel
            </Button>,
            <Button
              key="save"
              type="primary"
              onClick={() => {
                setShowConfirmModal(true);
                setShowModal(false);
              }}
            >
              {selectedItem === "edit" ? "Save" : "Submit"}
            </Button>,
          ]}
        >
          <div className={"Ente-details"}>
            <Form>
              <Row className="">
                <Col className="px-2 py-2" md={24}>
                <label className="fw-400">Name</label>
                <Input
                  type="text"
                  className="fs-6"
                  placeholder="Enter Name"
                  value={formData.name}
                  onChange={(e: any) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                </Col>
               
                <Col className="px-2 py-2" md={12}>
                <label className="fw-400">Product</label>
                <Select
                  key={`product-${currentSourceId || 'new'}`}
                  className="fs-6"
                  style={{ width: "100%" }}
                  placeholder="Select Product"
                  value={formData.product_id || undefined}
                  onChange={(value: number) =>
                    setFormData({ ...formData, product_id: value })
                  }
                  allowClear
                  loading={loadingProducts}
                  showSearch
                  filterOption={(input, option: any) =>
                    (option?.children as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {products.map((product: any) => (
                    <Select.Option key={product.id} value={product.id}>
                      {product.name_en}
                    </Select.Option>
                  ))}
                </Select>
                </Col>
                <Col className="px-2 py-2" md={12}>
                <label className="fw-400">Type</label>
                <Select
                  key={`type-${currentSourceId || 'new'}`}
                  className="fs-6"
                  style={{ width: "100%" }}
                  placeholder="Select Type"
                  value={formData.type || undefined}
                  onChange={(value: string) =>
                    setFormData({ ...formData, type: value })
                  }
                  allowClear
                >
                  <Select.Option value="AuthorizationLetter">Authorization Letter</Select.Option>
                  <Select.Option value="FinancingContract">Financing Contract</Select.Option>
                </Select>
                </Col>
                {/* <Col className="px-2 py-2" md={12}>
                <label className="fw-400">Status</label>
                <Switch
                  
                  className="fs-6"
                
                  checked={formData.status === "active"}
                  onChange={(checked: boolean) =>
                    setFormData({ ...formData, status: checked ? "active" : "inactive" })
                  }
                />
                </Col> */}
                <Col className="px-2 py-2" md={12}>
                <label className="fw-400">Language</label>
                <Select
                  className="fs-6"
                  style={{ width: "100%" }}
                  placeholder="Select Language"
                  value={selectedLanguage}
                  onChange={(value: "english" | "arabic") => {
                    setSelectedLanguage(value);
                  }}
                >
                  <Select.Option value="english">English</Select.Option>
                  <Select.Option value="arabic">Arabic</Select.Option>
                </Select>
                </Col>
                <Col className="px-2 py-2" md={24}>
                          <div className="editor-fixed" style={{ direction: selectedLanguage === "arabic" ? "rtl" : "ltr" }}>
                            <label className="fw-400">Message ({selectedLanguage === "english" ? "English" : "Arabic"})</label>
                
                            <div style={{ direction: selectedLanguage === "arabic" ? "rtl" : "ltr" }}>
                            <CKEditor
                              key={selectedLanguage} // Force re-render when language changes
                              // @ts-ignore
                              editor={ClassicEditor}
                              data={(() => {
                                const editorData = selectedLanguage === "english" ? formData.message_en : formData.message_ar;
                                return editorData;
                              })()}
                              onChange={(_event: any, editor: any) => {
                                const data = editor.getData();
                                if (selectedLanguage === "english") {
                                  setFormData({ ...formData, message_en: data });
                                } else {
                                  setFormData({ ...formData, message_ar: data });
                                }
                              }}
                              config={{
                                language: selectedLanguage === "arabic" ? "ar" : "en",
                                toolbar: [
                                  "heading",
                                  "|",
                                  "bold",
                                  "italic",
                                  "underline",
                                  "strikethrough",
                                  "link",
                                  "bulletedList",
                                  "numberedList",
                                  "blockQuote",
                                  "insertTable",
                                  "undo",
                                  "redo",
                                  "imageUpload",
                                  "mediaEmbed",
                                  "codeBlock",
                                  "highlight",
                                  "alignment",
                                  "fontColor",
                                  "fontBackgroundColor",
                                  "fontSize",
                                  "fontFamily",
                                  "horizontalLine",
                                  "specialCharacters",
                                  "sourceEditing"
                                ],
                              }}
                              onReady={(editor: any) => {
                                // Set RTL direction for Arabic
                                if (selectedLanguage === "arabic") {
                                  editor.editing.view.change((writer: any) => {
                                    writer.setAttribute('dir', 'rtl', editor.editing.view.document.getRoot());
                                  });
                                  // Also set direction on the editable element
                                  const editable = editor.ui.getEditableElement();
                                  if (editable) {
                                    editable.setAttribute('dir', 'rtl');
                                    editable.setAttribute('lang', 'ar');
                                  }
                                } else {
                                  editor.editing.view.change((writer: any) => {
                                    writer.setAttribute('dir', 'ltr', editor.editing.view.document.getRoot());
                                  });
                                  const editable = editor.ui.getEditableElement();
                                  if (editable) {
                                    editable.setAttribute('dir', 'ltr');
                                    editable.setAttribute('lang', 'en');
                                  }
                                }
                              }}
                            />
                            </div>
                          </div>
                        </Col>
              </Row>
            </Form>
          </div>
        </Modal>
        <Modal
          visible={showConfirmModal}
          onCancel={() => setShowConfirmModal(false)}
          className="custom-mod"
          style={{ maxWidth: "632px" }}
          title={
            selectedItem === "edit"
              ? "Edit Contract Template"
              : selectedItem === "add"
              ? "Add New Contract Template"
              : "Delete Contract Template"
          }
          footer={[
            <Button key="no" onClick={() => setShowConfirmModal(false)}>
              No
            </Button>,
            <Button
              key="yes"
              type="primary"
              onClick={
                selectedItem == "delete" ? handleDeleteConfirmed : handleSave
              }
            >
              Yes
            </Button>,
          ]}
        >
          <Form>
            {`${
              selectedItem == "edit"
                ? "Are you sure you want to update this contract template?"
                : selectedItem == "add"
                ? "Are you sure you want to add new contract template?"
                : "Are you sure you want to delete this contract template?"
            }`}
          </Form>
        </Modal>
      </div>
    </>
  );
};

export default ContractTemplate;
