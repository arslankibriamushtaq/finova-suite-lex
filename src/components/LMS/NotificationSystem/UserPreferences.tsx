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
    DatePicker,
} from "antd";
import { FaFilter } from "react-icons/fa";
import toast from "react-hot-toast";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import arrowDown from "../../../assets/images/arrow-down.png";
import { 
    createUserNotificationPreference,
    getUserNotificationPreferences,
    getUserNotificationPreferenceById,
    updateUserNotificationPreference,
    deleteUserNotificationPreference,
    getAllUsers,
    getChannels
} from "../../../redux/apis/apisNotificationsCrud";
import { Images } from "../../Config/Images";
import TableView from "../../TableView/TableView";


const UserPreferences = () => {
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
    const [users, setUsers] = useState<any[]>([]);
    const [channels, setChannels] = useState<any[]>([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [formData, setFormData] = useState({
        userId: "",
        channelId: "",
        enabled: true,
        muteUntil: null,
    });

    const getUserNameById = (id: any) => {
        return users.find((u: any) => u?.id === id)?.fullName;
    }

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
            name: t("userPrefs.col.userName"),
            selector: (row: { userName: any }) => row.userName,
            sortable: true,
        },
        {
            name: t("shared.channel"),
            selector: (row: { channelName: any }) => row.channelName,
            sortable: true,
        },
        {
            name: t("common:enabled"),
            cell: (row: any) => (
                <div
                    style={{
                        padding: "0.22rem 1rem",
                        borderRadius: "2px",
                        textAlign: "center",
                        backgroundColor: row.enabled ? "var(--color-success)" : "var(--color-error)",
                        color: "white",
                    }}
                >
                    {row.enabled ? t("common:enabled") : t("common:disabled")}
                </div>
            ),
            width: "100px",
        },
        {
            name: t("userPrefs.col.muteUntil"),
            selector: (row: { muteUntil: any }) => row.muteUntil ? formatDate(row.muteUntil) : t("userPrefs.notMuted"),
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
                        userId: row?.userId ?? "",
                        channelId: row?.channelId ?? "",
                        enabled: row?.enabled ?? true,
                        muteUntil: row?.muteUntil,
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
            // Get all users first, then get their preferences
            const usersResponse = await getAllUsers();
            if (usersResponse?.data?.success) {
                const usersData = usersResponse.data.data || [];
                setUsers(usersData);
                
                // Get preferences for each user
                const allPreferences: any[] = [];
                for (const user of usersData) {
                    try {
                        const response = await getUserNotificationPreferences(user.id);
                        if (response?.data?.success && response.data.data) {
                            const userPrefs = Array.isArray(response.data.data) 
                                ? response.data.data 
                                : [response.data.data];
                            userPrefs.forEach((pref: any) => {
                                allPreferences.push({
                                    ...pref,
                                    userName: user.fullName,
                                    channelName: getChannelNameById(pref.channelId),
                                });
                            });
                        }
                    } catch (error) {
                    }
                }
                
                const mappedData = allPreferences.map((item: any, index: any) => {
                    return {
                        id: item?.id ?? `pref-${index}`,
                        user_id: index + 1 || "-",
                        userId: item?.userId ?? "-",
                        channelId: item?.channelId ?? "-",
                        enabled: item?.enabled ?? false,
                        muteUntil: item?.muteUntil ?? null,
                        userName: item?.userName ?? "-",
                        channelName: item?.channelName ?? "-",
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

    // Fetch Users API
    const getUsers = async () => {
        try {
            setUsersLoading(true);
            const response = await getAllUsers();
            
            if (response?.data?.status) {
                const usersData = response.data.data || [];
        
                setUsers(usersData);
            } else {
                console.error("Users API failed:", response?.data?.message);
             
            }
        } catch (error: any) {
            console.error("Error fetching users:", error);
            toast.error(t("userPrefs.toast.loadUsersFailed") + error.message);
        } finally {
            setUsersLoading(false);
        }
    };

    // Fetch Channels API
    const getChannelsData = async () => {
        try {
        
            const response = await getChannels();

            
            if (response?.data?.status) {
                const channelsData = response.data.data || [];

                setChannels(channelsData);
            } else {

                toast.error((response?.data?.errors || t("shared.somethingWentWrong")));
            }
        } catch (error: any) {
            console.error("Error fetching channels:", error);
            toast.error(t("userPrefs.toast.loadChannelsFailed") + error.message);
        } }

    useEffect(() => {
        getList();
        getUsers();
        getChannelsData();
    }, [page, pageSize]);

    const handleSave = async () => {
        const body: any = {
            requestId: `req-${Date.now()}`,
            channelId: "web",
            data: {
                userId: formData?.userId,
                channelId: formData?.channelId,
                enabled: formData?.enabled,
                muteUntil: formData?.muteUntil ? formData.muteUntil : null,
            },
        };
        const isEditing = selectedItem === "edit" && editRowId;

        const savePromise = async () => {
            if (isEditing) {
                const response = await updateUserNotificationPreference(editRowId, body);
                if (response.status === 200) {
                    setShowModal(false);
                    setEditRowId(null);
                    setSelectedItem(null);
                    setFormData({
                        userId: "",
                        channelId: "",
                        enabled: true,
                        muteUntil: null,
                    });
                    await getList();
                    return t("userPrefs.toast.updated");
                } else {
                    throw new Error(response?.data?.errors || t("shared.failedUpdate"));
                }
            } else {
                const response = await createUserNotificationPreference(body);
                if (response.status === 200 || response.status === 201) {
                    setShowModal(false);
                    await getList();
                    setFormData({
                        userId: "",
                        channelId: "",
                        enabled: true,
                        muteUntil: null,
                    });
                    return t("userPrefs.toast.added");
                } else {
                    throw new Error(response?.data?.errors || t("shared.failedAdd"));
                }
            }
        };

        toast.promise(savePromise(), {
            loading: isEditing ? t("userPrefs.toast.updating") : t("userPrefs.toast.adding"),
            success: (msg) => msg,
            error: (err) => err.message || t("shared.somethingWentWrong"),
        });
    };

    const handleDelete = async (id: any) => {
        try {
            const deletePromise = async () => {
                const response = await deleteUserNotificationPreference(id);
                if (response.status === 200 || response.status === 204) {
                    setIsDeleteModalVisible(false);
                    await getList();
                    setEditRowId(null);
                    return t("userPrefs.toast.deleted");
                } else {
                    throw new Error(response?.data?.errors || t("shared.failedDelete"));
                }
            };

            toast.promise(deletePromise(), {
                loading: t("userPrefs.toast.deleting"),
                success: (msg) => msg,
                error: (err) => err.message || t("shared.somethingWentWrong"),
            });
        } catch (error: any) {
            toast.error(error.message);
        }
    };



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
                                    userId: "",
                                    channelId: "",
                                    enabled: true,
                                    muteUntil: null,
                                });
                                setEditRowId(null);
                                setSelectedItem(null);
                            }}
                        >
                            {t("userPrefs.addNew")}
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
                style={{ maxWidth: "900px" }}
                className="custom-mod"
                visible={showModal}
                onCancel={() => setShowModal(false)}
                title={editRowId ? t("userPrefs.editTitle") : t("userPrefs.addNew")}
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
                            <Form.Group className="mb-2 custom-input-box select-custom">
                                <Form.Label className="px-2 mt-2">{t("userPrefs.label.user")} <span style={{ color: "red" }}>*</span></Form.Label>
                                <Select
                                    style={{ width: "100%", height: "40px" }}
                                    placeholder={usersLoading ? t("userPrefs.ph.loadingUsers") : t("userPrefs.ph.selectUser")}
                                    loading={usersLoading}
                                    value={formData.userId || undefined}
                                    onChange={(val: string) => setFormData({ ...formData, userId: val })}
                                >
                                    {users.length > 0 ? users.map((u: any) => (
                                        <Select.Option key={u?.id} value={u?.id}>
                                            {u?.fullName} ({u?.email})
                                        </Select.Option>
                                    )) : (
                                        <Select.Option disabled value="no-users">
                                            {usersLoading ? t("shared.loadingText") : t("userPrefs.opt.noUsers")}
                                        </Select.Option>
                                    )}
                                </Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-2 custom-input-box select-custom">
                                <Form.Label className="px-2 mt-2">{t("shared.channel")} <span style={{ color: "red" }}>*</span></Form.Label>
                                <Select
                                    style={{ width: "100%", height: "40px" }}
                                    placeholder={t("shared.selectChannel")}
                                    value={formData.channelId || undefined}
                                    onChange={(val: string) => setFormData({ ...formData, channelId: val })}
                                >
                                    {channels&&channels?.map((c: any) => (
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
                            <div className="mt-2 d-flex align-items-center">
                                <Form.Label className="px-2 mt-2 col-6">{t("common:enabled")} <span style={{ color: "red" }}>*</span></Form.Label>
                                <div className="d-flex justify-content-end col-6">
                                    <Radio.Group
                                        onChange={(e) => setFormData({ ...formData, enabled: e.target.value })}
                                        value={formData.enabled}
                                    >
                                        <Radio value={true}>{t("common:yes")}</Radio>
                                        <Radio value={false}>{t("common:no")}</Radio>
                                    </Radio.Group>
                                </div>
                            </div>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-2 custom-input-box">
                                <Form.Label className="px-2 mt-2">{t("userPrefs.label.muteUntil")}</Form.Label>
                                <DatePicker
                                    showTime
                                    format="YYYY-MM-DD HH:mm"
                                    placeholder={t("userPrefs.ph.muteUntil")}
                                    value={formData.muteUntil}
                                    onChange={(date) => setFormData({ ...formData, muteUntil: date })}
                                    style={{ width: "100%" }}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </Form>
            </Modal>

            <Modal maskClosable={false} keyboard={false}
                visible={isDeleteModalVisible}
                onCancel={() => setIsDeleteModalVisible(false)}
                className="custom-mod"
                style={{ maxWidth: "632px" }}
                title={t("userPrefs.delete.title")}
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
                    {t("userPrefs.delete.confirm")}
                </Form>
            </Modal>
        </div>
    );
};

export default UserPreferences;
