import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
    const { t } = useTranslation("notifications");
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
            name: t("shared.sr"),
            selector: (row: { user_id: any }) => row.user_id,
            sortable: true,
            width: "100px",
        },
        {
            name: t("shared.template"),
            selector: (row: { templateName: any }) => row.templateName,
            sortable: true,
        },
        {
            name: t("shared.variableName"),
            selector: (row: { variableName: any }) => row.variableName,
            sortable: true,
        },
        {
            name: t("shared.defaultValue"),
            selector: (row: { defaultValue: any }) => row.defaultValue,
            sortable: true,
        },
        {
            name: t("common:createdAt"),
            selector: (row: { createdAt: any }) => formatDate(row?.createdAt),
            sortable: true,
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
                toast.error(t("templateVars.toast.loadFailed") + (response?.data?.message || t("shared.somethingWentWrong")));
                setDashboardData([]);
                setTotalRows(0);
            }
        } catch (error: any) {
            console.error("Error fetching template variables:", error);
            toast.error(t("templateVars.toast.errorPrefix") + error?.message);
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
                    return t("templateVars.toast.updated");
                } else {
                    throw new Error(response?.data?.errors || t("shared.failedUpdate"));
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
                    return t("templateVars.toast.added");
                } else {
                    throw new Error(response?.data?.errors || t("shared.failedAdd"));
                }
            }
        };

        toast.promise(savePromise(), {
            loading: isEditing ? t("templateVars.toast.updating") : t("templateVars.toast.adding"),
            success: (msg) => msg,
            error: (err) => err.message || t("shared.somethingWentWrong"),
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
                    return t("templateVars.toast.deleted");
                } else {
                    throw new Error(response?.data?.errors || t("shared.failedDelete"));
                }
            };

            toast.promise(deletePromise(), {
                loading: t("templateVars.toast.deleting"),
                success: (msg) => msg,
                error: (err) => err.message || t("shared.somethingWentWrong"),
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
                        placeholder={t("common:filter")}
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
                                placeholder={t("shared.searchPlaceholder")}
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
                            {t("templateVars.addNew")}
                        </button>
                    </div>
                </div>
            </div>

            {/* Template Selection */}
            <div className="mb-3">
                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-2 custom-input-box select-custom">
                            <Form.Label className="px-2 mt-2">{t("templateVars.selectTemplateLabel")} <span style={{ color: "red" }}>*</span></Form.Label>
                            <Select
                                style={{ width: "100%", height: "40px" }}
                                placeholder={templatesLoading ? t("templateVars.ph.loadingTemplates") : t("templateVars.ph.selectTemplateView")}
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
                                        {templatesLoading ? t("shared.loadingText") : t("templateVars.opt.noTemplates")}
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
                title={editRowId ? t("templateVars.editTitle") : t("templateVars.addNew")}
                footer={[
                    <Button key="close" onClick={() => setShowModal(false)}>
                        {t("common:close")}
                    </Button>,
                    <Button key="save" type="primary" onClick={handleSave}>
                        {selectedItem === "edit" ? t("common:update") : t("common:submit")}
                    </Button>,
                ]}
            >
                <Form>
                    <Row>
                        <Col md={12}>
                            <Form.Group className="mb-2 custom-input-box select-custom">
                                <Form.Label className="px-2 mt-2">{t("shared.template")} <span style={{ color: "red" }}>*</span></Form.Label>
                                <Select
                                    style={{ width: "100%", height: "40px" }}
                                    placeholder={templatesLoading ? t("templateVars.ph.loadingTemplates") : t("templateVars.ph.selectTemplate")}
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
                                <Form.Label className="px-2 mt-2">{t("shared.variableName")} <span style={{ color: "red" }}>*</span></Form.Label>
                                <input
                                    type="text"
                                    className="form-control custom-input"
                                    placeholder={t("templateVars.ph.variableName")}
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
                                <Form.Label className="px-2 mt-2">{t("shared.defaultValue")} <span style={{ color: "red" }}>*</span></Form.Label>
                                <input
                                    type="text"
                                    className="form-control custom-input"
                                    placeholder={t("templateVars.ph.defaultValue")}
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
                title={t("templateVars.delete.title")}
                footer={[
                    <Button key="no" onClick={() => setIsDeleteModalVisible(false)}>
                        {t("common:no")}
                    </Button>,
                    <Button
                        key="yes"
                        type="primary"
                        onClick={() => {
                            handleDelete(editRowId);
                        }}
                    >
                        {t("common:yes")}
                    </Button>,
                ]}
            >
                <Form>
                    {t("templateVars.delete.confirm")}
                </Form>
            </Modal>
        </div>
    );
};

export default TemplateVariables;
