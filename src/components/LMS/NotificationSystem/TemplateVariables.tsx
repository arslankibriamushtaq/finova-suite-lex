import { useEffect, useState } from "react";
import { Form, Row, Col } from "react-bootstrap";

import {
    Button,
    Dropdown,
    Modal,
    Menu,
    Select,
    Radio,
} from "antd";
import { FaFilter } from "react-icons/fa";
import toast from "react-hot-toast";
import { DeleteOutlined, EditOutlined, MoreOutlined } from "@ant-design/icons";
import arrowDown from "../../../assets/images/arrow-down.png";
import { 
    createTemplateVariable,
    getTemplateVariablesByTemplateId,
    updateTemplateVariable,
    deleteTemplateVariable,
    // getAllTemplates
} from "../../../redux/apis/apisNotificationsCrud";
import { Images } from "../../Config/Images";
import TableView from "../../TableView/TableView";

const TemplateVariables = () => {
    
    const [dashboardData, setDashboardData] = useState<any>();
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);
    const [editRowId, setEditRowId] = useState(null);
    const [skelitonLoading, setSkelitonLoading] = useState(false);
    const [totalRows, setTotalRows] = useState(0);
    const [from, setFrom] = useState(0);
    const [to, setTo] = useState(0);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [totalPage, setTotalPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [templates, setTemplates] = useState<any[]>([]);
    const [templatesLoading, setTemplatesLoading] = useState(false);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
    const [formData, setFormData] = useState({
        templateId: "",
        variableName: "",
        defaultValue: "",
    });

    const getTemplateNameById = (id: any) => {
        return templates.find((t: any) => t?.id === id)?.name;
    }

    const formatDate = (dateString: any) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    const Activity_Loans_Header = [
        {
            name: "Sr:",
            selector: (row: { user_id: any }) => row.user_id,
            sortable: true,
            width: "100px",
        },
        {
            name: "Template",
            selector: (row: { templateName: any }) => row.templateName,
            sortable: true,
        },
        {
            name: "Variable Name",
            selector: (row: { variableName: any }) => row.variableName,
            sortable: true,
        },
        {
            name: "Default Value",
            selector: (row: { defaultValue: any }) => row.defaultValue,
            sortable: true,
        },
        {
            name: "Created At",
            selector: (row: { createdAt: any }) => formatDate(row?.createdAt),
            sortable: true,
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

    const handleMenuClick = (key: string, data: any) => {
        setIsDeleteModalVisible(true);
        setEditRowId(data?.id);
    };

    const menu = (row: any) => (
        <Menu>
            <Menu.Item
                key="edit"
                icon={<EditOutlined />}
                onClick={() => {
                    setEditRowId(row?.id);
                    setShowModal(true);
                    setFormData({
                        templateId: row?.templateId ?? "",
                        variableName: row?.variableName ?? "",
                        defaultValue: row?.defaultValue ?? "",
                    });
                    setSelectedItem("edit");
                }}
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

    const getList = async () => {
        try {
            setLoading(true);
            if (!selectedTemplateId) {
                setDashboardData([]);
                setTotalRows(0);
                setLoading(false);
                return;
            }

            const response = await getTemplateVariablesByTemplateId(selectedTemplateId);
            
            if (response?.data?.status) {
                const data = response?.data?.data || [];
                const mappedData = data.map((item: any, index: any) => {
                    return {
                        id: item?.id ?? `var-${index}`,
                        user_id: index + 1 || "-",
                        templateId: item?.templateId ?? "-",
                        templateName: getTemplateNameById(item?.templateId) ?? "-",
                        variableName: item?.variableName ?? "-",
                        defaultValue: item?.defaultValue ?? "-",
                        createdAt: item?.createdAt ?? "-",
                    };
                });
                
                setDashboardData(mappedData);
                setLoading(false);
                setSkelitonLoading(false);
                setTotalRows(mappedData?.length || 0);
            } else {
                console.error("Template variables API failed:", response?.data);
                toast.error("Failed to load template variables: " + (response?.data?.message || "Unknown error"));
                setDashboardData([]);
                setTotalRows(0);
            }
        } catch (error: any) {
            console.error("Error fetching template variables:", error);
            toast.error("Error: " + error?.message);
            setDashboardData([]);
            setTotalRows(0);
        } finally {
            setLoading(false);
        }
    };

    // Fetch Templates API
    // const getTemplatesData = async () => {
    //     try {
    //         setTemplatesLoading(true);
    //         const response = await getAllTemplates();
            
    //         if (response?.data?.status) {
    //             const templatesData = response.data.data || [];
    //             setTemplates(templatesData);
    //         } else {
    //             console.error("Templates API failed:", response?.data);
    //             toast.error((response?.data?.errors || "Unknown error"));
    //         }
    //     } catch (error: any) {
    //         console.error("Error fetching templates:", error);
    //         toast.error("Failed to load templates: " + error.message);
    //     } finally {
    //         setTemplatesLoading(false);
    //     }
    // };

    // useEffect(() => {
    //     getTemplatesData();
    // }, []);

    useEffect(() => {
        if (selectedTemplateId) {
            getList();
        }
    }, [selectedTemplateId, page, pageSize]);

    const handleSave = async () => {
        const body: any = {
            requestId: `req-${Date.now()}`,
            channelId: "web",
            data: {
                templateId: formData?.templateId,
                variableName: formData?.variableName,
                defaultValue: formData?.defaultValue,
            },
        };
        const isEditing = selectedItem === "edit" && editRowId;

        const savePromise = async () => {
            if (isEditing) {
                const response = await updateTemplateVariable(editRowId, body);
                if (response.status === 200) {
                    setShowModal(false);
                    setEditRowId(null);
                    setSelectedItem(null);
                    setFormData({
                        templateId: "",
                        variableName: "",
                        defaultValue: "",
                    });
                    await getList();
                    return "Template variable updated successfully!";
                } else {
                    throw new Error(response?.data?.errors || "Failed to update");
                }
            } else {
                const response = await createTemplateVariable(body);
                if (response.status === 200 || response.status === 201) {
                    setShowModal(false);
                    await getList();
                    setFormData({
                        templateId: "",
                        variableName: "",
                        defaultValue: "",
                    });
                    return "Template variable added successfully!";
                } else {
                    throw new Error(response?.data?.errors || "Failed to add");
                }
            }
        };

        toast.promise(savePromise(), {
            loading: isEditing ? "Updating Template Variable..." : "Adding Template Variable...",
            success: (msg) => msg,
            error: (err) => err.message || "Something went wrong",
        });
    };

    const handleDelete = async (id: any) => {
        try {
            const deletePromise = async () => {
                const response = await deleteTemplateVariable(id);
                if (response.status === 200 || response.status === 204) {
                    setIsDeleteModalVisible(false);
                    await getList();
                    setEditRowId(null);
                    return "Template variable deleted successfully!";
                } else {
                    throw new Error(response?.data?.errors || "Failed to delete");
                }
            };

            toast.promise(deletePromise(), {
                loading: "Deleting Template Variable...",
                success: (msg) => msg,
                error: (err) => err.message || "Something went wrong",
            });
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    useEffect(() => {
        if (dashboardData?.length > 0) {
            const total = Math.ceil(totalRows / pageSize);
            setTotalPage(total);

            const start = (page - 1) * pageSize + 1;
            const end = Math.min(page * pageSize, totalRows);

            setFrom(start);
            setTo(end);
        } else {
            setFrom(0);
            setTo(0);
            setTotalPage(0);
        }
    }, [dashboardData, page, pageSize, totalRows]);

    const paginatedData = Array.isArray(dashboardData)
        ? dashboardData.slice((page - 1) * pageSize, page * pageSize)
        : [];

    return (
        <div className="dashboard">
            <div className="service">
                <div className="d-flex justify-content-end col-12">
                    <Select
                        mode="tags"
                        style={{ width: "15%", borderTopRightRadius: "0px" }}
                        placeholder="Filter"
                        tokenSeparators={[","]}
                        suffixIcon={<FaFilter />}
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
                                placeholder="Search..."
                            />
                        </div>

                        <button
                            className="theme-btn"
                            onClick={() => {
                                setShowModal(true);
                                setFormData({
                                    templateId: selectedTemplateId || "",
                                    variableName: "",
                                    defaultValue: "",
                                });
                                setEditRowId(null);
                                setSelectedItem(null);
                            }}
                            disabled={!selectedTemplateId}
                        >
                            Add New Template Variable
                        </button>
                    </div>
                </div>
            </div>

            {/* Template Selection */}
            <div className="mb-3">
                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-2 custom-input-box select-custom">
                            <Form.Label className="px-2 mt-2">Select Template <span style={{ color: "red" }}>*</span></Form.Label>
                            <Select
                                style={{ width: "100%", height: "40px" }}
                                placeholder={templatesLoading ? "Loading templates..." : "Select a template to view variables"}
                                loading={templatesLoading}
                                value={selectedTemplateId}
                                onChange={(val: string) => {
                                    setSelectedTemplateId(val);
                                    setDashboardData([]);
                                    setTotalRows(0);
                                }}
                                showSearch
                                filterOption={(input, option) =>
                                    (option?.children as unknown as string)
                                        ?.toLowerCase()
                                        .includes(input.toLowerCase())
                                }
                            >
                                {templates.length > 0 ? templates.map((t: any) => (
                                    <Select.Option key={t?.id} value={t?.id}>
                                        {t?.name}
                                    </Select.Option>
                                )) : (
                                    <Select.Option disabled value="no-templates">
                                        {templatesLoading ? "Loading..." : "No templates available"}
                                    </Select.Option>
                                )}
                            </Select>
                        </Form.Group>
                    </Col>
                </Row>
            </div>

            <TableView
                header={Activity_Loans_Header}
                data={paginatedData}
                isLoading={loading}
                page={page}
                totalRows={totalRows}
                totalPage={totalPage}
                setPage={setPage}
                from={from}
                to={to}
                pageSize={pageSize}
                setPageSize={setPageSize}
            />
            <Modal
                style={{ maxWidth: "900px" }}
                className="custom-mod"
                visible={showModal}
                onCancel={() => setShowModal(false)}
                title={editRowId ? "Edit Template Variable" : "Add New Template Variable"}
                footer={[
                    <Button key="close" onClick={() => setShowModal(false)}>
                        Close
                    </Button>,
                    <Button key="save" type="primary" onClick={handleSave}>
                        {selectedItem === "edit" ? "Update" : "Submit"}
                    </Button>,
                ]}
            >
                <Form>
                    <Row>
                        <Col md={12}>
                            <Form.Group className="mb-2 custom-input-box select-custom">
                                <Form.Label className="px-2 mt-2">Template <span style={{ color: "red" }}>*</span></Form.Label>
                                <Select
                                    style={{ width: "100%", height: "40px" }}
                                    placeholder={templatesLoading ? "Loading templates..." : "Select template"}
                                    loading={templatesLoading}
                                    value={formData.templateId}
                                    onChange={(val: string) => setFormData({ ...formData, templateId: val })}
                                    showSearch
                                    filterOption={(input, option) =>
                                        (option?.children as unknown as string)
                                            ?.toLowerCase()
                                            .includes(input.toLowerCase())
                                    }
                                >
                                    {templates.length > 0 ? templates.map((t: any) => (
                                        <Select.Option key={t?.id} value={t?.id}>
                                            {t?.name}
                                        </Select.Option>
                                    )) : (
                                        <Select.Option disabled value="no-templates">
                                            {templatesLoading ? "Loading..." : "No templates available"}
                                        </Select.Option>
                                    )}
                                </Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={12}>
                            <Form.Group className="mb-2 custom-input-box">
                                <Form.Label className="px-2 mt-2">Variable Name <span style={{ color: "red" }}>*</span></Form.Label>
                                <input
                                    type="text"
                                    className="form-control custom-input"
                                    placeholder="Enter variable name (e.g., userName)"
                                    name="variableName"
                                    value={formData.variableName}
                                    onChange={(e: any) => setFormData({ ...formData, variableName: e?.target?.value })}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={12}>
                            <Form.Group className="mb-2 custom-input-box">
                                <Form.Label className="px-2 mt-2">Default Value <span style={{ color: "red" }}>*</span></Form.Label>
                                <input
                                    type="text"
                                    className="form-control custom-input"
                                    placeholder="Enter default value"
                                    name="defaultValue"
                                    value={formData.defaultValue}
                                    onChange={(e: any) => setFormData({ ...formData, defaultValue: e?.target?.value })}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </Form>
            </Modal>

            <Modal
                visible={isDeleteModalVisible}
                onCancel={() => setIsDeleteModalVisible(false)}
                className="custom-mod"
                style={{ maxWidth: "632px" }}
                title={"Delete Template Variable"}
                footer={[
                    <Button key="no" onClick={() => setIsDeleteModalVisible(false)}>
                        No
                    </Button>,
                    <Button
                        key="yes"
                        type="primary"
                        onClick={() => {
                            handleDelete(editRowId);
                        }}
                    >
                        Yes
                    </Button>,
                ]}
            >
                <Form>
                    Are you sure you want to delete this Template Variable?
                </Form>
            </Modal>
        </div>
    );
};

export default TemplateVariables;
