import { useEffect, useState } from "react";
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
            name: "Sr:",
            selector: (row: { user_id: any }) => row.user_id,
            sortable: true,
            width: "100px",
        },
        {
            name: "User Name",
            selector: (row: { userName: any }) => row.userName,
            sortable: true,
        },
        {
            name: "Channel",
            selector: (row: { channelName: any }) => row.channelName,
            sortable: true,
        },
        {
            name: "Enabled",
            cell: (row: any) => (
                <div
                    style={{
                        padding: "0.22rem 1rem",
                        borderRadius: "12px",
                        textAlign: "center",
                        backgroundColor: row.enabled ? "var(--color-success)" : "var(--color-error)",
                        color: "white",
                    }}
                >
                    {row.enabled ? "Enabled" : "Disabled"}
                </div>
            ),
            width: "100px",
        },
        {
            name: "Mute Until",
            selector: (row: { muteUntil: any }) => row.muteUntil ? formatDate(row.muteUntil) : "Not muted",
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
                        userId: row?.userId ?? "",
                        channelId: row?.channelId ?? "",
                        enabled: row?.enabled ?? true,
                        muteUntil: row?.muteUntil,
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
            toast.error("Failed to load users: " + error.message);
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

                toast.error((response?.data?.errors || "Unknown error"));
            }
        } catch (error: any) {
            console.error("Error fetching channels:", error);
            toast.error("Failed to load channels: " + error.message);
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
                    return "User preference updated successfully!";
                } else {
                    throw new Error(response?.data?.errors || "Failed to update");
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
                    return "User preference added successfully!";
                } else {
                    throw new Error(response?.data?.errors || "Failed to add");
                }
            }
        };

        toast.promise(savePromise(), {
            loading: isEditing ? "Updating User Preference..." : "Adding User Preference...",
            success: (msg) => msg,
            error: (err) => err.message || "Something went wrong",
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
                    return "User preference deleted successfully!";
                } else {
                    throw new Error(response?.data?.errors || "Failed to delete");
                }
            };

            toast.promise(deletePromise(), {
                loading: "Deleting User Preference...",
                success: (msg) => msg,
                error: (err) => err.message || "Something went wrong",
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
                                    userId: "",
                                    channelId: "",
                                    enabled: true,
                                    muteUntil: null,
                                });
                                setEditRowId(null);
                                setSelectedItem(null);
                            }}
                        >
                            Add New User Preference
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
                title={editRowId ? "Edit User Preference" : "Add New User Preference"}
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
                            <Form.Group className="mb-2 custom-input-box select-custom">
                                <Form.Label className="px-2 mt-2">User <span style={{ color: "red" }}>*</span></Form.Label>
                                <Select
                                    style={{ width: "100%", height: "40px" }}
                                    placeholder={usersLoading ? "Loading users..." : "Select user"}
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
                                            {usersLoading ? "Loading..." : "No users available"}
                                        </Select.Option>
                                    )}
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
                                <Form.Label className="px-2 mt-2 col-6">Enabled <span style={{ color: "red" }}>*</span></Form.Label>
                                <div className="d-flex justify-content-end col-6">
                                    <Radio.Group
                                        onChange={(e) => setFormData({ ...formData, enabled: e.target.value })}
                                        value={formData.enabled}
                                    >
                                        <Radio value={true}>Yes</Radio>
                                        <Radio value={false}>No</Radio>
                                    </Radio.Group>
                                </div>
                            </div>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-2 custom-input-box">
                                <Form.Label className="px-2 mt-2">Mute Until</Form.Label>
                                <DatePicker
                                    showTime
                                    format="YYYY-MM-DD HH:mm"
                                    placeholder="Select mute until date"
                                    value={formData.muteUntil}
                                    onChange={(date) => setFormData({ ...formData, muteUntil: date })}
                                    style={{ width: "100%" }}
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
                title={"Delete User Preference"}
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
                    Are you sure you want to delete this User Preference?
                </Form>
            </Modal>
        </div>
    );
};

export default UserPreferences;
