import { useEffect, useState } from "react";
import { Form, Row, Col } from "react-bootstrap";

import {
    Button,
    Dropdown,
    Modal,
    Menu,
    Select,
    Input,
    Radio,
} from "antd";
import { FaFilter } from "react-icons/fa";
import toast from "react-hot-toast";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import arrowDown from "../../../assets/images/arrow-down.png";
import { getTemplateChannels,  getLanguages, getChannels , getTemplates, createTemplateChannels, updateTemplateChannels, deleteTemplateChannels} from "../../../redux/apis/apisNotificationsCrud";
import { Images } from "../../Config/Images";
import TableView from "../../TableView/TableView";


const TemplateChannels = () => {
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
    const [languages, setLanguages] = useState<any[]>([]);
    const [channels, setChannels] = useState<any[]>([]);
    const [templates, setTemplates] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        name: "",
        templateId: "",
        languageId: "",
        channelId: "",
        subjectTemplate: "",
        bodyTemplate: "",
        inAppOptions: false,
        active: true,
        variableName: "",
        defaultValue: "",
    });
const getLanguageNameById = (id: any) => {
    return languages.find((l: any) => l?.id === id)?.name;
}
const getChannelNameById = (id: any) => {
    return channels.find((c: any) => c?.id === id)?.name;
}
const getTemplateNameById = (id: any) => {
    return templates.find((t: any) => t?.id === id)?.name;
}
const formatDate = (dateString: any) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based in JS
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
            name: "Channel",
            selector: (row: { channelId: any }) => getChannelNameById(row?.channelId),
            sortable: true,
        },
        {
            name: "Language",
            selector: (row: { languageId: any }) => getLanguageNameById(row?.languageId),
            sortable: true,
        },
        {
            name: "Subject Template",
            selector: (row: { subjectTemplate: any }) => row.subjectTemplate,
            sortable: true,
            width: "250px",
        },
        {
            name: "Template",
            selector: (row: { templateId: any }) => getTemplateNameById(row?.templateId),
            sortable: true,
            width: "250px",
        },
        {
            name: "Body Template",
            cell: (row: { bodyTemplate: any }) => row.bodyTemplate,
            sortable: true,
            width: "300px",
        },
        {
            name: "In-App Options",
            cell: (row: any) => (
                <div
                    style={{
                        padding: "0.22rem 1rem",
                        borderRadius: "6px",
                        textAlign: "center",
                        backgroundColor: row.inAppOptions ? "var(--color-success)" : "var(--color-error)",
                        color: "white",
                    }}
                >
                    {row.inAppOptions ? "Yes" : "No"}
                </div>
            ),
            width: "100px",
        },
        {
            name: "Active",
            cell: (row: any) => (
                <div
                    style={{
                        padding: "0.22rem 1rem",
                        borderRadius: "6px",
                        textAlign: "center",
                        backgroundColor: row.active ? "var(--color-success)" : "var(--color-error)",
                        color: "white",
                    }}
                >
                    {row.active ? "Active" : "Inactive"}
                </div>
            ),
            width: "130px",
        },
        {
            name: "Created At",
            selector: (row: { createdAt: any }) => formatDate(row?.createdAt),
            sortable: true,
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
                        name: row?.name ?? "",
                        templateId: row?.templateId ?? "",
                        languageId: "",
                        channelId: "",
                        subjectTemplate: "",
                        bodyTemplate: "",
                        inAppOptions: false,
                        active: row?.active ?? true,
                        variableName: "",
                        defaultValue: "",
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
            const response = await getTemplateChannels();
            if (response) {
                const data = response?.data?.data;
                const mappedData =
                    data &&
                    data?.map((item: any, index: any) => {
                        return {
                            id: item?.id ?? `${item?.templateId}-${item?.channelId}`,
                            user_id: index + 1 || "-",
                            subjectTemplate: item?.subjectTemplate ?? "-",
                            bodyTemplate: item?.bodyTemplate ?? "-",
                            channelId: item?.channelId ?? "-",
                            languageId: item?.languageId ?? "-",
                            templateId: item?.templateId ?? "-",
                            inAppOptions: item?.inAppOptions ?? false,
                            active: item?.active ?? false,
                            createdAt: item?.createdAt ?? "-",
                        };
                    });
                setDashboardData(mappedData);
                setLoading(false);
                setSkelitonLoading(false);
                setTotalRows(mappedData?.length || 0);
            }
        } catch (error: any) {
            toast.error(error?.message);
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    const getLookups = async () => {
        try {
            const [langsRes, chansRes, templatesRes] = await Promise.all([getLanguages(), getChannels(),getTemplates()]);
            const langs = langsRes?.data?.data || [];
            const chans = chansRes?.data?.data || [];
            const templates = templatesRes?.data?.data || [];
            setLanguages(langs);
            setChannels(chans);
            setTemplates(templates);
        } catch (e) {
            // ignore silently; dropdowns will be empty
        }
    };

    useEffect(() => {
        getList();
        getLookups();
    }, [page, pageSize]); // Empty dependency array means this runs once on mount

    const getSystemNotificationPrefsById = (id: any) => {
        return templates.find((s: any) => s?.id === id)?.name;
    };
    const handleSave = async () => {
        const body: any = {
            requestId: `req-${Date.now()}`,
            channelId: "web",
            data: {
                templateId: formData?.templateId,
                channelId: formData?.channelId,
                languageId: formData?.languageId,
                subjectTemplate: formData?.subjectTemplate,
                bodyTemplate: formData?.bodyTemplate,
                inAppOptions: formData?.inAppOptions,
                active: formData?.active,
            },
        };
        const isEditing = selectedItem === "edit" && editRowId;

        const savePromise = async () => {
            if (isEditing) {
                const response = await updateTemplateChannels(editRowId, body);
                if (response.status === 200) {
                    setShowModal(false);
                    setEditRowId(null);
                    setSelectedItem(null);
                    setFormData({
                        name: "",
                        templateId: "",
                        languageId: "",
                        channelId: "",
                        subjectTemplate: "",
                        bodyTemplate: "",
                        inAppOptions: false,
                        active: true,
                        variableName: "",
                        defaultValue: "",
                    });
                    await getList();
                    return "Template updated successfully!";
                } else {
                    throw new Error(response?.data?.errors || "Failed to update");
                }
            } else {
                const response = await createTemplateChannels(body);
                if (response.status === 200 || response.status === 201) {
                    setShowModal(false);
                    await getList();
                    setFormData({
                        name: "",
                        channelId: "",
                        templateId: "",
                        languageId: "",
                            subjectTemplate: "",
                        bodyTemplate: "",
                        inAppOptions: false,
                        active: true,
                        variableName: "",
                        defaultValue: "",
                    });
                    return "Template added successfully!";
                } else {
                    throw new Error(response?.data?.errors || "Failed to add");
                }
            }
        };

        toast.promise(savePromise(), {
            loading: isEditing ? "Updating Template..." : "Adding Template...",
            success: (msg) => msg,
            error: (err) => err.message || "Something went wrong",
        });
    };

     const handleDelete = async (id: any) => {
         try {
             const deletePromise = async () => {
                 const response = await deleteTemplateChannels(id);
                 if (response.status === 200 || response.status === 204) {
                     setIsDeleteModalVisible(false);
                     await getList();
                     setEditRowId(null);
                     return "Template deleted successfully!";
                 } else {
                     throw new Error(response?.data?.errors || "Failed to delete");
                 }
             };

             toast.promise(deletePromise(), {
                 loading: "Deleting Template...",
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
                <div className="d-flex justify-content-end  col-12">
                    <Select
                        mode="tags"
                        style={{ width: "15%", borderTopRightRadius: "0px" }}
                        // onChange={handleChange}
                        placeholder="Filter"
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
                                placeholder="Search..."
                            />
                        </div>

                        <button
                            className="theme-btn"
                            onClick={() => {
                                setShowModal(true);
                                setFormData({
                                    name: "",
                                    channelId: "",
                                    templateId: "",
                                    languageId: "",
                                    subjectTemplate: "",
                                    bodyTemplate: "",
                                    inAppOptions: false,
                                    active: true,
                                    variableName: "",
                                    defaultValue: "",
                                });
                                setEditRowId(null);
                                setSelectedItem(null);
                            }}
                        >
                            Add New Template
                        </button>
                    </div>
                </div>
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
                title={editRowId ? "Edit Template" : "Add New Template"}
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
                                    <Form.Label className="px-2 mt-2">Channel <span style={{ color: "red" }}>*</span></Form.Label>
                                    <Select
                                        style={{ width: "100%", height: "40px" }}
                                        placeholder="Select channel"
                                        value={formData.channelId || undefined}
                                        onChange={(val: string) => setFormData({ ...formData, channelId: val })}
                                    >
                                        {channels.map((c: any) => (
                                            <Select.Option key={c?.id} value={c?.id}>
                                                {c?.name}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Group>
                            </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-2 custom-input-box select-custom">
                                <Form.Label className="px-2 mt-2">Language <span style={{ color: "red" }}>*</span></Form.Label>
                                <Select
                                    style={{ width: "100%", height: "40px" }}
                                    placeholder="Select language"
                                    value={formData.languageId || undefined}
                                    onChange={(val: string) => setFormData({ ...formData, languageId: val })}
                                >
                                    {languages.map((l: any) => (
                                        <Select.Option key={l?.id} value={l?.id}>
                                            {l?.name} ({l?.shortcode})
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-2 custom-input-box select-custom">
                                <Form.Label className="px-2 mt-2">Template <span style={{ color: "red" }}>*</span></Form.Label>
                                <Select
                                    style={{ width: "100%", height: "40px" }}
                                    placeholder="Select template"
                                    value={formData.templateId || undefined}
                                    onChange={(val: string) => setFormData({ ...formData, templateId: val })}
                                >
                                        {templates.map((t: any) => (
                                        <Select.Option key={t?.id} value={t?.id}>
                                            {t?.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-2 custom-input-box">
                                <Form.Label className="px-2 mt-2">Subject Template</Form.Label>
                                <Input
                                    type="text"
                                    className="custom-input"
                                    placeholder="Welcome {{userName}}!"
                                    name="subjectTemplate"
                                    value={formData.subjectTemplate}
                                    onChange={(e: any) => setFormData({ ...formData, subjectTemplate: e?.target?.value })}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-2 custom-input-box">
                                <Form.Label className="px-2 mt-2">Body Template</Form.Label>
                                <Input
                                    className="custom-input"
                                    placeholder="Hello {{userName}}, welcome to our platform!"
                                    value={formData.bodyTemplate}
                                    onChange={(e: any) => setFormData({ ...formData, bodyTemplate: e?.target?.value })}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <div className="mt-2 d-flex align-items-center">
                                <Form.Label className="px-2 mt-2 col-6">In-App Options?</Form.Label>
                                <div className="d-flex justify-content-end col-6">
                                    <Radio.Group
                                        onChange={(e) => setFormData({ ...formData, inAppOptions: e.target.value })}
                                        value={formData.inAppOptions}
                                    >
                                        <Radio value={true}>Yes</Radio>
                                        <Radio value={false}>No</Radio>
                                    </Radio.Group>
                                </div>
                            </div>
                        </Col>
                        <Col md={6}>
                            <div className="mt-2 d-flex align-items-center">
                                <Form.Label className="px-2 mt-2 col-6">Active?</Form.Label>
                                <div className="d-flex justify-content-end col-6">
                                    <Radio.Group
                                        onChange={(e) => setFormData({ ...formData, active: e.target.value })}
                                        value={formData.active}
                                    >
                                        <Radio value={true}>Yes</Radio>
                                        <Radio value={false}>No</Radio>
                                    </Radio.Group>
                                </div>
                            </div>
                        </Col>
                    </Row>

                 
                </Form>
            </Modal>

             <Modal
                visible={isDeleteModalVisible}
                onCancel={() => setIsDeleteModalVisible(false)}
                className="custom-mod"
                style={{ maxWidth: "632px" }}
                 title={"Delete Template"}
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
                    {`
               Are you sure you want to delete this Template?`}
                </Form>
            </Modal>
        </div>
    );
};

export default TemplateChannels;
