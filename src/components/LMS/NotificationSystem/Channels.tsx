import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
import { getChannels, createChannels, updateChannels, deleteChannels } from "../../../redux/apis/apisNotificationsCrud";
import TableView from "../../TableView/TableView";
import { Images } from "../../Config/Images";


const Channels = () => {
    const { t } = useTranslation("notifications");
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
    const [formData, setFormData] = useState({
        name: "",
        supportsReadStatus: false,
        rateLimit: 0,
        configTemplate: "",
        allowUserPref: false,
        systemAllow: false,
    });

    const Activity_Loans_Header = [
        {
            name: t("shared.sr"),
            selector: (row: { user_id: any }) => row.user_id,
            sortable: true,
        },
        {
            name: t("common:name"),
            selector: (row: { name: any }) => row.name,
            sortable: true,
        },
        {
            name: t("channels.col.supportsReadStatus"),
            cell: (row: any) => (
                <div
                    style={{
                        padding: "0.22rem 1rem",
                        borderRadius: "2px",
                        textAlign: "center",
                        backgroundColor: row.supportsReadStatus
                            ? "var(--color-success)"
                            : "var(--color-error)",
                        color: "white",
                    }}
                >
                    {row.supportsReadStatus ? t("common:yes") : t("common:no")}
                </div>
            ),
            width: "190px",
        },
        {
            name: t("channels.col.rateLimit"),
            selector: (row: { rateLimit: any }) => row.rateLimit,
            sortable: true,
            width: "140px",
        },
        // {
        //   name: "Config Template",
        //   selector: (row: { configTemplate: any }) => row.configTemplate,
        //   wrap: true,
        // },
        {
            name: t("common:active"),
            cell: (row: any) => (
                <div
                    style={{
                        padding: "0.22rem 1rem",
                        borderRadius: "2px",
                        textAlign: "center",
                        backgroundColor: row.active ? "var(--color-success)" : "var(--color-error)",
                        color: "white",
                    }}
                >
                    {row.active ? t("common:active") : t("common:inactive")}
                </div>
            ),
            width: "130px",
        },
        {
            name: t("channels.col.allowUserPref"),
            cell: (row: any) => (
                <div
                    style={{
                        padding: "0.22rem 1rem",
                        borderRadius: "2px",
                        textAlign: "center",
                        backgroundColor: row.allowUserPref
                            ? "var(--color-success)"
                            : "var(--color-error)",
                        color: "white",
                    }}
                >
                    {row.allowUserPref ? t("common:yes") : t("common:no")}
                </div>
            ),
            width: "180px",
        },
        {
            name: t("channels.col.systemAllow"),
            cell: (row: any) => (
                <div
                    style={{
                        padding: "0.22rem 1rem",
                        borderRadius: "2px",
                        textAlign: "center",
                        backgroundColor: row.systemAllow
                            ? "var(--color-success)"
                            : "var(--color-error)",
                        color: "white",
                    }}
                >
                    {row.systemAllow ? t("common:yes") : t("common:no")}
                </div>
            ),
            width: "170px",
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
                        name: row?.name ?? "",
                        supportsReadStatus: row?.supportsReadStatus ?? false,
                        rateLimit: row?.rateLimit ?? 0,
                        configTemplate: row?.configTemplate ?? "",
                        allowUserPref: row?.allowUserPref ?? false,
                        systemAllow: row?.systemAllow ?? false,
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
            const response = await getChannels();
            if (response) {
                const data = response?.data?.data;
                const mappedData =
                    data &&
                    data?.map((item: any, index: any) => {
                        return {
                            id: item?.id,
                            user_id: index + 1 || "-",
                            name: item?.name ?? "-",
                            supportsReadStatus: item?.supportsReadStatus ?? false,
                            rateLimit: item?.rateLimit ?? "-",
                            configTemplate: item?.configTemplate ?? "-",
                            active: item?.active ?? false,
                            allowUserPref: item?.allowUserPref ?? false,
                            systemAllow: item?.systemAllow ?? false,
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

    useEffect(() => {
        getList();
    }, [page, pageSize]); // Empty dependency array means this runs once on mount


    const handleSave = async () => {
        const body: any = {
            requestId: `req-${Date.now()}`,
            channelId: "web",
            data: {
                name: formData?.name,
                supportsReadStatus: formData?.supportsReadStatus,
                rateLimit: Number(formData?.rateLimit ?? 0),
                configTemplate: formData?.configTemplate,
                allowUserPref: formData?.allowUserPref,
                systemAllow: formData?.systemAllow,
            },
        };
        const isEditing = selectedItem === "edit" && editRowId;

        const savePromise = async () => {
            if (isEditing) {
                const response = await updateChannels(editRowId, body);
                if (response.status === 200) {
                    setShowModal(false);
                    setEditRowId(null);
                    setSelectedItem(null);
                    setFormData({
                        name: "",
                        supportsReadStatus: false,
                        rateLimit: 0,
                        configTemplate: "",
                        allowUserPref: false,
                        systemAllow: false,
                    });
                    await getList();
                    return t("channels.toast.updated");
                } else {
                    throw new Error(response?.data?.errors || t("shared.failedUpdate"));
                }
            } else {
                const response = await createChannels(body);
                if (response.status === 200 || response.status === 201) {
                    setShowModal(false);
                    await getList();
                    setFormData({
                        name: "",
                        supportsReadStatus: false,
                        rateLimit: 0,
                        configTemplate: "",
                        allowUserPref: false,
                        systemAllow: false,
                    });
                    return t("channels.toast.added");
                } else {
                    throw new Error(response?.data?.errors || t("shared.failedAdd"));
                }
            }
        };

        toast.promise(savePromise(), {
            loading: isEditing ? t("channels.toast.updating") : t("channels.toast.adding"),
            success: (msg) => msg,
            error: (err) => err.message || t("shared.somethingWentWrong"),
        });
    };

     const handleDelete = async (id: any) => {
         try {
             const deletePromise = async () => {
                 const response = await deleteChannels(id);
                 if (response.status === 200 || response.status === 204) {
                     setIsDeleteModalVisible(false);
                     await getList();
                     setEditRowId(null);
                     return t("channels.toast.deleted");
                 } else {
                     throw new Error(response?.data?.errors || t("shared.failedDelete"));
                 }
             };

             toast.promise(deletePromise(), {
                 loading: t("channels.toast.deleting"),
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

                        <button
                            className="theme-btn"
                            onClick={() => {
                                setShowModal(true);
                                setFormData({
                                    name: "",
                                    supportsReadStatus: false,
                                    rateLimit: 0,
                                    configTemplate: "",
                                    allowUserPref: false,
                                    systemAllow: false,
                                });
                                setEditRowId(null);
                                setSelectedItem(null);
                            }}
                        >
                            {t("channels.addNew")}
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
            <Modal maskClosable={false} keyboard={false}
                style={{ maxWidth: "732px" }}
                className="custom-mod"
                visible={showModal}
                onCancel={() => setShowModal(false)}
                title={editRowId ? t("channels.editTitle") : t("channels.addNew")}
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
                        <Col md={6}>
                            <Form.Group className="mb-2 custom-input-box">
                                <Form.Label className="px-2 mt-2">{t("common:name")} <span style={{ color: "red" }}>*</span></Form.Label>
                                <Input
                                    type="text"
                                    className="custom-input"
                                    placeholder={t("channels.ph.name")}
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
                            <Form.Group className="mb-2 custom-input-box">
                                <Form.Label className="px-2 mt-2">{t("channels.col.rateLimit")} <span style={{ color: "red" }}>*</span></Form.Label>
                                <Input
                                    type="number"
                                    className="custom-input"
                                    placeholder={t("channels.col.rateLimit")}
                                    name="rateLimit"
                                    value={formData.rateLimit}
                                    onChange={(e: any) => {
                                        setFormData({
                                            ...formData,
                                            rateLimit: Number(e?.target?.value ?? 0),
                                        });
                                    }}
                                />
                            </Form.Group>
                        </Col>


                    </Row>
                    <Row>

                        <Col md={6}>
                            <div className="mt-2 d-flex align-items-center">
                                <Form.Label className="px-2 mt-2 col-6">{t("channels.col.supportsReadStatus")}</Form.Label>
                                <div className="d-flex justify-content-end col-6">
                                    <Radio.Group
                                        onChange={(e) =>
                                            setFormData({ ...formData, supportsReadStatus: e.target.value })
                                        }
                                        value={formData.supportsReadStatus}
                                    >
                                        <Radio value={true}>{t("common:yes")}</Radio>
                                        <Radio value={false}>{t("common:no")}</Radio>
                                    </Radio.Group>
                                </div>
                            </div>
                        </Col>
                        <Col md={6}>
                            <div className="mt-2 d-flex align-items-center">
                                <Form.Label className="px-2 mt-2 col-6">{t("channels.label.systemAllow")}</Form.Label>
                                <div className="d-flex justify-content-end col-6">
                                    <Radio.Group
                                        onChange={(e) =>
                                            setFormData({ ...formData, systemAllow: e.target.value })
                                        }
                                        value={formData.systemAllow}
                                    >
                                        <Radio value={true}>{t("common:yes")}</Radio>
                                        <Radio value={false}>{t("common:no")}</Radio>
                                    </Radio.Group>
                                </div>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <div className="mt-2 d-flex align-items-center">
                                <Form.Label className="px-2 mt-2 col-6">{t("channels.label.allowUserPref")}</Form.Label>
                                <div className="d-flex justify-content-end col-6">
                                    <Radio.Group
                                        onChange={(e) =>
                                            setFormData({ ...formData, allowUserPref: e.target.value })
                                        }
                                        value={formData.allowUserPref}
                                    >
                                        <Radio value={true}>{t("common:yes")}</Radio>
                                        <Radio value={false}>{t("common:no")}</Radio>
                                    </Radio.Group>
                                </div>
                            </div>
                        </Col>

                    </Row>
                    {/* <Row>
                        <Col md={12}>
                            <Form.Group className="mt-2 custom-input-box">
                                <Form.Label className="px-2 mt-2">Config Template <span style={{ color: "red" }}>*</span></Form.Label>
                                <Input
                                    type="text"
                                    className="custom-input"
                                    placeholder="Enter Config Template"
                                    name="configTemplate"
                                    value={formData.configTemplate}
                                    onChange={(e: any) => {
                                        setFormData({
                                            ...formData,
                                            configTemplate: e?.target?.value,
                                        });
                                    }}
                                />
                            </Form.Group>
                        </Col>
                    </Row> */}
                </Form>
            </Modal>

             <Modal maskClosable={false} keyboard={false}
                visible={isDeleteModalVisible}
                onCancel={() => setIsDeleteModalVisible(false)}
                className="custom-mod"
                style={{ maxWidth: "632px" }}
                 title={t("channels.delete.title")}
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
                    {t("channels.delete.confirm")}
                </Form>
            </Modal>
        </div>
    );
};

export default Channels;
