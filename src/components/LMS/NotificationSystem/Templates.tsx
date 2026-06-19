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
import { getTemplates, createTemplates, updateTemplates, deleteTemplates, getLanguages, getChannels ,getSystemNotificationPrefs} from "../../../redux/apis/apisNotificationsCrud";
import { Images } from "../../Config/Images";
import arrowDown from "../../../assets/images/arrow-down.png";
import TableView from "../../TableView/TableView";


const Templates = () => {
    const [dashboardData, setDashboardData] = useState<any>();
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<string | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
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
    const [systemNotificationPrefs, setSystemNotificationPrefs] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        name: "",
        systemNotificationPrefId: "",
        languageId: "",
        channelId: "",
        subjectTemplate: "",
        bodyTemplate: "",
        inAppOptions: false,
        active: true,
        variableName: "",
        defaultValue: "",
    });

  
    const Activity_Loans_Header = [
        {
            name: "Sr:",
            selector: (row: { user_id: any }) => row.user_id,
            sortable: true,
        },
        {
            name: "Name",
            selector: (row: { name: any }) => row.name,
            sortable: true,
        },
        {
            name: "System Notification Pref Id",
            selector: (row: { systemNotificationPrefId: any }) => getSystemNotificationPrefsById(row?.systemNotificationPrefId),
            sortable: true,
            wrap: true,
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
                            borderRadius: "6px",
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
                        name: row?.name ?? "",
                        systemNotificationPrefId: row?.systemNotificationPrefId ?? "",
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
            const response = await getTemplates();
            if (response) {
                const data = response?.data?.data;
                const mappedData =
                    data &&
                    data?.map((item: any, index: any) => {
                        return {
                            id: item?.id,
                            user_id: index + 1 || "-",
                            name: item?.name ?? "-",
                            systemNotificationPrefId: item?.systemNotificationPrefId ?? "-",
                            active: item?.active ?? false,
                        };
                    });
                setDashboardData(mappedData);
                setLoading(false);
                setSkelitonLoading(false);
                setTotalRows(mappedData?.length || 0);
                // setFrom(response?.data?.data?.from || 0);
                // setTo(response?.data?.data?.to || 0);
                // setPage(response?.data?.data?.current_page);
                // setTotalPage(response?.data?.data?.last_page);
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
            const [langsRes, chansRes, systemNotificationPrefsRes] = await Promise.all([getLanguages(), getChannels(),getSystemNotificationPrefs()]);
            const langs = langsRes?.data?.data || [];
            const chans = chansRes?.data?.data || [];
            const systemNotificationPrefs = systemNotificationPrefsRes?.data?.data?.content || [];
            setLanguages(langs);
            setChannels(chans);
            setSystemNotificationPrefs(systemNotificationPrefs);
        } catch (e) {
            // ignore silently; dropdowns will be empty
        }
    };

    useEffect(() => {
        getList();
        getLookups();
    }, [page, pageSize]); // Empty dependency array means this runs once on mount

    const getSystemNotificationPrefsById = (id: any) => {
        return systemNotificationPrefs.find((s: any) => s?.id === id)?.name;
    };
    const handleSave = async () => {
        const body: any = {
            requestId: `req-${Date.now()}`,
            channelId: "web",
            data: {
                name: formData?.name,
                systemNotificationPrefId: formData?.systemNotificationPrefId,
                languageId: formData?.languageId,
                channelTemplates: [
                    {
                        channelId: formData?.channelId,
                        subjectTemplate: formData?.subjectTemplate,
                        bodyTemplate: formData?.bodyTemplate,
                        inAppOptions: formData?.inAppOptions,
                        active: formData?.active,
                    },
                ],
                variables: formData?.variableName
                    ? [
                        {
                            variableName: formData.variableName,
                            defaultValue: formData.defaultValue,
                        },
                    ]
                    : [],
            },
        };
        const isEditing = selectedItem === "edit" && editRowId;

        const savePromise = async () => {
            if (isEditing) {
                const response = await updateTemplates(editRowId, body);
                if (response.status === 200) {
                    setShowModal(false);
                    setEditRowId(null);
                    setSelectedItem(null);
                    setFormData({
                        name: "",
                        systemNotificationPrefId: "",
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
                const response = await createTemplates(body);
                if (response.status === 200 || response.status === 201) {
                    setShowModal(false);
                    await getList();
                    setFormData({
                        name: "",
                        systemNotificationPrefId: "",
                        languageId: "",
                        channelId: "",
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
                 const response = await deleteTemplates(id);
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
                                    systemNotificationPrefId: "",
                                    languageId: "",
                                    channelId: "",
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
                        <Col md={6}>
                            <Form.Group className="mb-2 custom-input-box">
                                <Form.Label className="px-2 mt-2">Name <span style={{ color: "red" }}>*</span></Form.Label>
                                <Input
                                    type="text"
                                    className="custom-input"
                                    placeholder="Enter template name"
                                    name="name"
                                    value={formData.name}
                                    onChange={(e: any) => {
                                        setFormData({
                                            ...formData,
                                            name: e?.target?.value,
                                        });
                                    }}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-2 custom-input-box select-custom">
                                <Form.Label className="px-2 mt-2">System Notification Pref Id <span style={{ color: "red" }}>*</span></Form.Label>
                                <Select
                                    style={{ width: "100%", height: "40px" }}
                                    placeholder="Select system notification pref"
                                    value={formData.systemNotificationPrefId || undefined}
                                    onChange={(val: string) => setFormData({ ...formData, systemNotificationPrefId: val })}
                                >
                                    {systemNotificationPrefs.map((s: any) => (
                                        <Select.Option key={s?.id} value={s?.id}>
                                            {s?.name}
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

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-2 custom-input-box">
                                <Form.Label className="px-2 mt-2">Variable Name</Form.Label>
                                <Input
                                    type="text"
                                    className="custom-input"
                                    placeholder="userName"
                                    value={formData.variableName}
                                    onChange={(e: any) => setFormData({ ...formData, variableName: e?.target?.value })}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-2 custom-input-box">
                                <Form.Label className="px-2 mt-2">Default Value</Form.Label>
                                <Input
                                    type="text"
                                    className="custom-input"
                                    placeholder="User"
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

export default Templates;
