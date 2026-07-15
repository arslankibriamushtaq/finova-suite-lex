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
    createSystemNotificationPreference,
    getAllSystemNotificationPreferences,
    getSystemNotificationPreferenceById,
    updateSystemNotificationPreference,
    deleteSystemNotificationPreference,
    getChannels
} from "../../../redux/apis/apisNotificationsCrud";
import { Images } from "../../Config/Images";
import TableView from "../../TableView/TableView";

const SystemPreferences = () => {
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
    const [channels, setChannels] = useState<any[]>([]);
    const [channelsLoading, setChannelsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        channelIds: [],
    });

    const getChannelNameById = (id: any) => {
        return channels.find((c: any) => c?.id === id)?.name;
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
            name: t("common:name"),
            selector: (row: { name: any }) => row.name,
            sortable: true,
        },
        {
            name: t("shared.channels"),
            cell: (row: { channelIds: any }) => (
                <div style={{ maxWidth: "300px" }}>
                    {row.channelIds && row.channelIds.map((channelId: any, index: any) => {
                        const channelName = getChannelNameById(channelId);
                        return (
                            <span key={index} style={{ 
                                display: "inline-block",
                                backgroundColor: "var(--color-action)",
                                color: "white",
                                padding: "2px 8px",
                                borderRadius: "2px",
                                fontSize: "12px",
                                margin: "2px"
                            }}>
                                {channelName || channelId}
                            </span>
                        );
                    })}
                </div>
            ),
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
                        name: row?.name ?? "",
                        channelIds: row?.channelIds ?? [],
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
            const response = await getAllSystemNotificationPreferences();
            
            if (response?.data?.status) {
                const data = response?.data?.data?.content || [];
                const mappedData = data.map((item: any, index: any) => {
                    return {
                        id: item?.id ?? `pref-${index}`,
                        user_id: index + 1 || "-",
                        name: item?.name ?? "-",
                        channelIds: item?.channelIds ?? [],
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

    // Fetch Channels API
    const getChannelsData = async () => {
        try {
            setChannelsLoading(true);
            const response = await getChannels();
            
            if (response?.data?.status) {
                const channelsData = response.data.data || [];
                setChannels(channelsData);
            } else {
                toast.error((response?.data?.errors || t("shared.somethingWentWrong")));
            }
        } catch (error: any) {
            console.error("Error fetching channels:", error);
            toast.error(t("systemPrefs.toast.loadChannelsFailed") + error.message);
        } finally {
            setChannelsLoading(false);
        }
    };

    useEffect(() => {
        getList();
        getChannelsData();
    }, [page, pageSize]);

    const handleSave = async () => {
        const body: any = {
            requestId: `req-${Date.now()}`,
            channelId: "web",
            data: {
                name: formData?.name,
                channelIds: formData?.channelIds,
            },
        };
        const isEditing = selectedItem === "edit" && editRowId;

        const savePromise = async () => {
            if (isEditing) {
                const response = await updateSystemNotificationPreference(editRowId, body);
                if (response.status === 200) {
                    setShowModal(false);
                    setEditRowId(null);
                    setSelectedItem(null);
                    setFormData({
                        name: "",
                        channelIds: [],
                    });
                    await getList();
                    return t("systemPrefs.toast.updated");
                } else {
                    throw new Error(response?.data?.errors || t("shared.failedUpdate"));
                }
            } else {
                const response = await createSystemNotificationPreference(body);
                if (response.status === 200 || response.status === 201) {
                    setShowModal(false);
                    await getList();
                    setFormData({
                        name: "",
                        channelIds: [],
                    });
                    return t("systemPrefs.toast.added");
                } else {
                    throw new Error(response?.data?.errors || t("shared.failedAdd"));
                }
            }
        };

        toast.promise(savePromise(), {
            loading: isEditing ? t("systemPrefs.toast.updating") : t("systemPrefs.toast.adding"),
            success: (msg) => msg,
            error: (err) => err.message || t("shared.somethingWentWrong"),
        });
    };

    const handleDelete = async (id: any) => {
        try {
            const deletePromise = async () => {
                const response = await deleteSystemNotificationPreference(id);
                if (response.status === 200 || response.status === 204) {
                    setIsDeleteModalVisible(false);
                    await getList();
                    setEditRowId(null);
                    return t("systemPrefs.toast.deleted");
                } else {
                    throw new Error(response?.data?.errors || t("shared.failedDelete"));
                }
            };

            toast.promise(deletePromise(), {
                loading: t("systemPrefs.toast.deleting"),
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
                                    name: "",
                                    channelIds: [],
                                });
                                setEditRowId(null);
                                setSelectedItem(null);
                            }}
                        >
                            {t("systemPrefs.addNew")}
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
                title={editRowId ? t("systemPrefs.editTitle") : t("systemPrefs.addNew")}
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
                            <Form.Group className="mb-2 custom-input-box">
                                <Form.Label className="px-2 mt-2">{t("common:name")} <span style={{ color: "red" }}>*</span></Form.Label>
                                <input
                                    type="text"
                                    className="form-control custom-input"
                                    placeholder={t("systemPrefs.ph.name")}
                                    name="name"
                                    value={formData.name}
                                    onChange={(e: any) => setFormData({ ...formData, name: e?.target?.value })}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={12}>
                            <Form.Group className="mb-2 custom-input-box select-custom">
                                <Form.Label className="px-2 mt-2">{t("shared.channels")} <span style={{ color: "red" }}>*</span></Form.Label>
                                <Select
                                    mode="multiple"
                                    style={{ width: "100%", height: "40px" }}
                                    placeholder={channelsLoading ? t("systemPrefs.ph.loadingChannels") : t("systemPrefs.ph.selectChannels")}
                                    loading={channelsLoading}
                                    value={formData.channelIds}
                                    onChange={(val: any) => setFormData({ ...formData, channelIds: val })}
                                    showSearch
                                    filterOption={(input, option) =>
                                        (option?.children as unknown as string)
                                            ?.toLowerCase()
                                            .includes(input.toLowerCase())
                                    }
                                >
                                    {channels.length > 0 ? channels.map((c: any) => (
                                        <Select.Option key={c?.id} value={c?.id}>
                                            {c?.name}
                                        </Select.Option>
                                    )) : (
                                        <Select.Option disabled value="no-channels">
                                            {channelsLoading ? t("shared.loadingText") : t("systemPrefs.opt.noChannels")}
                                        </Select.Option>
                                    )}
                                </Select>
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
                title={t("systemPrefs.delete.title")}
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
                    {t("systemPrefs.delete.confirm")}
                </Form>
            </Modal>
        </div>
    );
};

export default SystemPreferences;
